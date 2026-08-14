import { NextResponse } from 'next/server';
import { BoardroomMode, getBoardroomSystemPrompt, getMockResponse, Message, SimulationDecisions } from '@/lib/abis-engine';
import { buildConversationContents, getConversationGuardrails, guardConversationResponse } from '@/lib/conversation-orchestrator';
import { evaluateLearningProgress, getAdaptiveLearningGuidance } from '@/lib/adaptive-learning';

export async function POST(request: Request) {
  try {
    const { messages, decisions, stage, customApiKey, aiProvider = 'gemini', mode = 'impact-review', courseTopics = [] } = await request.json() as {
      messages: Message[];
      decisions: SimulationDecisions;
      stage: 'awareness' | 'discovery' | 'refinement' | 'completed';
      customApiKey?: string;
      aiProvider?: 'gemini' | 'openai' | 'anthropic';
      mode?: BoardroomMode;
      courseTopics?: string[];
    };

    if (!Array.isArray(messages) || !decisions || !stage) {
      return NextResponse.json({ error: 'A conversation, simulation decisions, and dialogue stage are required.' }, { status: 400 });
    }

    const apiKey = customApiKey?.trim() || (aiProvider === 'openai' ? process.env.OPENAI_API_KEY : aiProvider === 'anthropic' ? process.env.ANTHROPIC_API_KEY : process.env.GEMINI_API_KEY);

    const mockResponse = (providerError?: string) => {
      const mock = getMockResponse(decisions, messages, stage, mode, courseTopics);
      const learningProgress = evaluateLearningProgress(messages);
      return NextResponse.json({
        role: 'assistant',
        cxo: mock.cxo,
        content: mock.content,
        nextStage: mock.nextStage,
        learningProgress,
        isMocked: true,
        ...(providerError ? { providerError } : {})
      });
    };

    // Fall back to Mock engine if no API key is present
    if (!apiKey) {
      console.log('No AI provider key found. Falling back to Mock Boardroom engine.');
      const keyName = aiProvider === 'openai' ? 'OPENAI_API_KEY' : aiProvider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'GEMINI_API_KEY';
      return mockResponse(`Real chat is not configured. Add ${keyName} to the Vercel project environment variables, or connect a valid ${aiProvider} key in the app settings.`);
    }

    const promptStage = stage === 'completed' ? 'refinement' : stage;
    const learningProgress = evaluateLearningProgress(messages);
    const systemPrompt = `${getBoardroomSystemPrompt(decisions, promptStage, mode, courseTopics)}${getConversationGuardrails(mode, stage)}${getAdaptiveLearningGuidance(learningProgress, mode)}`;
    const contents = buildConversationContents(messages);

    let response: Response;
    let text: string | undefined;

    if (aiProvider === 'openai') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }, ...messages.map(message => ({ role: message.role === 'assistant' ? 'assistant' : 'user', content: message.content }))],
          temperature: 0.4,
          max_tokens: 500,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        text = data.choices?.[0]?.message?.content?.trim();
      }
    } else if (aiProvider === 'anthropic') {
      const anthropicMessages = messages.length
        ? messages.map(message => ({ role: message.role === 'assistant' ? 'assistant' as const : 'user' as const, content: message.content }))
        : [{ role: 'user' as const, content: courseTopics[0] || 'Begin the Socratic coaching conversation with one thoughtful question.' }];
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-latest',
          system: systemPrompt,
          messages: anthropicMessages,
          temperature: 0.4,
          max_tokens: 500,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        text = data.content?.[0]?.text?.trim();
      }
    } else {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: { temperature: 0.4, maxOutputTokens: 500 }
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      }
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error(`${aiProvider} API Error: ${response.status} ${response.statusText} - ${errText}`);
      // A temporary provider/configuration failure should never end a student
      // session. Keep the conversation moving with the local coach instead.
      return mockResponse(`${aiProvider} is unavailable (${response.status}). Using the local conversation engine.`);
    }

    if (!text) {
      console.error(`${aiProvider} returned no usable response.`);
      return mockResponse(`${aiProvider} returned an empty response. Using the local conversation engine.`);
    }

    // Do not render a model response until the orchestration layer has checked
    // the role, format, length, and single-question conversation contract.
    const guardedResponse = guardConversationResponse(text, mode, stage);
    if (!guardedResponse.accepted) {
      console.error(`${aiProvider} response blocked by conversation guardrails: ${guardedResponse.reason}`);
      return mockResponse(`${aiProvider} returned a response outside the boardroom conversation rules. Using the local conversation engine.`);
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
      cxo: guardedResponse.cxo,
      content: guardedResponse.content,
      nextStage,
      learningProgress,
      isMocked: false
    });

  } catch (error: unknown) {
    console.error('Error in boardroom API:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
