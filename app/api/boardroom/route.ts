import { NextResponse } from 'next/server';
import { BoardroomMode, getBoardroomSystemPrompt, getMockResponse, Message, SimulationDecisions } from '@/lib/abis-engine';

export async function POST(request: Request) {
  try {
    const { messages, decisions, stage, customApiKey, mode = 'impact-review', courseTopics = [] } = await request.json() as {
      messages: Message[];
      decisions: SimulationDecisions;
      stage: 'awareness' | 'discovery' | 'refinement' | 'completed';
      customApiKey?: string;
      mode?: BoardroomMode;
      courseTopics?: string[];
    };

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    // Fall back to Mock engine if no API key is present
    if (!apiKey) {
      console.log('No Gemini API Key found. Falling back to Mock Boardroom engine.');
      const mock = getMockResponse(decisions, messages, stage, mode, courseTopics);
      return NextResponse.json({
        role: 'assistant',
        cxo: mock.cxo,
        content: mock.content,
        nextStage: mock.nextStage,
        isMocked: true
      });
    }

    const systemPrompt = getBoardroomSystemPrompt(decisions, stage === 'completed' ? 'refinement' : stage, mode, courseTopics);

    // Map conversation history to Gemini format (user vs model)
    const contents = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.cxo ? `[${m.cxo}] ${m.content}` : m.content }]
      }));

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 500,
          }
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error: ${response.statusText} - ${errText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse the CXO speaking from the prefix (e.g., "[CEO] Walk me through...")
    let cxo: 'CEO' | 'CFO' | 'CMO' | 'COO' = 'CEO';
    let cleanContent = text.trim();

    const match = cleanContent.match(/^\[(CEO|CFO|CMO|COO)\]\s*([\s\S]*)/);
    if (match) {
      cxo = match[1] as 'CEO' | 'CFO' | 'CMO' | 'COO';
      cleanContent = match[2];
    } else {
      // Fallback detection
      if (cleanContent.toLowerCase().includes('ceo') || cleanContent.toLowerCase().includes('chief executive')) {
        cxo = 'CEO';
      } else if (cleanContent.toLowerCase().includes('cfo') || cleanContent.toLowerCase().includes('finance') || cleanContent.toLowerCase().includes('margin')) {
        cxo = 'CFO';
      } else if (cleanContent.toLowerCase().includes('cmo') || cleanContent.toLowerCase().includes('marketing') || cleanContent.toLowerCase().includes('brand')) {
        cxo = 'CMO';
      } else if (cleanContent.toLowerCase().includes('coo') || cleanContent.toLowerCase().includes('operation') || cleanContent.toLowerCase().includes('capacity')) {
        cxo = 'COO';
      }
    }

    // Dialogue State progression triggers based on turn count or context
    let nextStage = stage;
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    
    if (mode === 'verbal-assessment' && userMessageCount >= 5) {
      nextStage = 'completed';
    } else if (stage === 'awareness' && userMessageCount >= 2) {
      nextStage = 'discovery';
    } else if (stage === 'discovery' && userMessageCount >= 4) {
      nextStage = 'refinement';
    } else if (stage === 'refinement' && userMessageCount >= 6) {
      nextStage = 'completed';
    }

    return NextResponse.json({
      role: 'assistant',
      cxo,
      content: cleanContent,
      nextStage,
      isMocked: false
    });

  } catch (error: unknown) {
    console.error('Error in boardroom API:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
