import { NextResponse } from 'next/server';
import { BoardroomMode, getBoardroomSystemPrompt, getMockResponse, Message, SimulationDecisions } from '@/lib/abis-engine';
import { buildConversationContents, getConversationGuardrails, guardConversationResponse } from '@/lib/conversation-orchestrator';
import { evaluateLearningProgress, getAdaptiveLearningGuidance } from '@/lib/adaptive-learning';
import { messagesToTelemetry } from '@/lib/personalization/telemetry';
import { buildPlayerState } from '@/lib/personalization/player-model';
import { getQuestionBank } from '@/lib/personalization/question-bank';
import { getPolicyPrompt, selectQuestion } from '@/lib/personalization/policy';

type AiProvider = 'gemini' | 'openai' | 'anthropic' | 'openrouter';
type CredentialSource = 'browser' | 'server' | 'missing';
type ProviderCandidate = {
  provider: AiProvider;
  apiKey: string;
  credentialSource: CredentialSource;
  fallbackFrom?: AiProvider;
};

const PROVIDER_LABELS: Record<AiProvider, string> = {
  gemini: 'Gemini',
  openai: 'ChatGPT',
  anthropic: 'Claude',
  openrouter: 'OpenRouter'
};

function getServerProviderKeys(): Record<AiProvider, string> {
  return {
    openai: process.env.OPENAI_API_KEY?.trim() || '',
    gemini: process.env.GEMINI_API_KEY?.trim() || '',
    anthropic: process.env.ANTHROPIC_API_KEY?.trim() || '',
    openrouter: process.env.OPENROUTER_API_KEY?.trim() || ''
  };
}

function getProviderCandidates(requestedProvider: AiProvider, customApiKey?: string): ProviderCandidate[] {
  const browserKey = customApiKey?.trim() || '';
  if (browserKey) {
    return [{ provider: requestedProvider, apiKey: browserKey, credentialSource: 'browser' }];
  }

  const serverKeys = getServerProviderKeys();
  const orderedProviders = [requestedProvider, ...( ['openai', 'gemini', 'anthropic', 'openrouter'] as AiProvider[]).filter((provider) => provider !== requestedProvider)];
  const candidates = orderedProviders
    .filter((provider) => serverKeys[provider])
    .map((provider) => ({
      provider,
      apiKey: serverKeys[provider],
      credentialSource: 'server' as const,
      ...(provider !== requestedProvider ? { fallbackFrom: requestedProvider } : {})
    }));

  return candidates.length
    ? candidates
    : [{ provider: requestedProvider, apiKey: '', credentialSource: 'missing' }];
}

function getProviderMessage(candidate: ProviderCandidate, previousFailure?: string) {
  const providerLabel = PROVIDER_LABELS[candidate.provider];
  if (previousFailure && candidate.credentialSource === 'server') {
    return `${previousFailure} ABIS switched to the ${providerLabel} server connection.`;
  }

  if (candidate.fallbackFrom) {
    return `${PROVIDER_LABELS[candidate.fallbackFrom]} is not configured, so ABIS is using the ${providerLabel} server connection.`;
  }

  return candidate.credentialSource === 'server'
    ? `${providerLabel} server connection active.`
    : candidate.credentialSource === 'browser'
      ? `${providerLabel} browser key active.`
      : `${providerLabel} is not configured.`;
}

export async function POST(request: Request) {
  try {
    const { messages, decisions, stage, customApiKey, aiProvider = 'gemini', mode = 'impact-review', courseTopics = [] } = await request.json() as {
      messages: Message[];
      decisions: SimulationDecisions;
      stage: 'awareness' | 'discovery' | 'refinement' | 'completed';
      customApiKey?: string;
      aiProvider?: AiProvider;
      mode?: BoardroomMode;
      courseTopics?: string[];
    };

    if (!Array.isArray(messages) || !decisions || !stage) {
      return NextResponse.json({ error: 'A conversation, simulation decisions, and dialogue stage are required.' }, { status: 400 });
    }

    const candidates = getProviderCandidates(aiProvider, customApiKey);
    let activeCandidate = candidates[0];
    let providerMessage = getProviderMessage(activeCandidate);
    const telemetryEvents = messagesToTelemetry(messages, decisions);
    const playerState = buildPlayerState(telemetryEvents);
    const policyDecision = selectQuestion(playerState, getQuestionBank(decisions), telemetryEvents);

    const mockResponse = (providerError?: string) => {
      const mock = getMockResponse(decisions, messages, stage, mode, courseTopics);
      const learningProgress = evaluateLearningProgress(messages);
      return NextResponse.json({
        role: 'assistant',
        cxo: mock.cxo,
        content: mode === 'decision-help' ? mock.content : policyDecision.selected.prompt,
        nextStage: mock.nextStage,
        learningProgress,
        playerState,
        policyDecision,
        isMocked: true,
        providerUsed: activeCandidate.provider,
        credentialSource: activeCandidate.credentialSource,
        providerMessage,
        ...(providerError ? { providerError } : {})
      });
    };

    // Fall back to Mock engine if no API key is present
    if (!activeCandidate.apiKey) {
      console.log('No AI provider key found. Falling back to Mock Boardroom engine.');
      const keyName = aiProvider === 'openai'
        ? 'OPENAI_API_KEY'
        : aiProvider === 'anthropic'
          ? 'ANTHROPIC_API_KEY'
          : aiProvider === 'openrouter'
            ? 'OPENROUTER_API_KEY'
            : 'GEMINI_API_KEY';
      return mockResponse(`Real chat is not configured. Add ${keyName} to the server environment variables, or connect a valid ${PROVIDER_LABELS[aiProvider]} key in the app settings.`);
    }

    const promptStage = stage === 'completed' ? 'refinement' : stage;
    const learningProgress = evaluateLearningProgress(messages);
    const systemPrompt = `${getBoardroomSystemPrompt(decisions, promptStage, mode, courseTopics, messages)}${getConversationGuardrails(mode, stage)}${getAdaptiveLearningGuidance(learningProgress, mode)}${getPolicyPrompt(policyDecision)}`;
    // Every provider requires a user turn. The initial boardroom opening used
    // to send an empty conversation, which made Gemini reject the request and
    // silently route students to the local coach.
    const providerMessages: Message[] = messages.length
      ? messages
      : [{ id: 'opening-prompt', role: 'user', content: courseTopics[0] || 'Begin the Socratic boardroom conversation with one concise, thoughtful question about this quarter\'s decisions.', timestamp: 'Now' }];
    const contents = buildConversationContents(providerMessages);

    let response: Response | undefined;
    let text: string | undefined;
    let lastFailureMessage = '';
    const providerFailures: string[] = [];

    for (const candidate of candidates) {
      activeCandidate = candidate;
      const activeProvider = candidate.provider;

      if (activeProvider === 'openai') {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${candidate.apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: systemPrompt }, ...providerMessages.map(message => ({ role: message.role === 'assistant' ? 'assistant' : 'user', content: message.content }))],
            temperature: 0.4,
            max_tokens: 500,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          text = data.choices?.[0]?.message?.content?.trim();
        }
      } else if (activeProvider === 'openrouter') {
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${candidate.apiKey}`,
            'HTTP-Referer': request.headers.get('origin') || 'http://localhost:3000',
            'X-OpenRouter-Title': 'ABIS Marketplace Coach',
          },
          body: JSON.stringify({
            model: process.env.OPENROUTER_MODEL?.trim() || 'openai/gpt-4o-mini',
            messages: [{ role: 'system', content: systemPrompt }, ...providerMessages.map(message => ({ role: message.role === 'assistant' ? 'assistant' : 'user', content: message.content }))],
            temperature: 0.4,
            max_tokens: 500,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          text = data.choices?.[0]?.message?.content?.trim();
        }
      } else if (activeProvider === 'anthropic') {
        const anthropicMessages = providerMessages.map(message => ({ role: message.role === 'assistant' ? 'assistant' as const : 'user' as const, content: message.content }));
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': candidate.apiKey, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
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
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${candidate.apiKey}`,
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

      if (response?.ok && text) {
        providerMessage = getProviderMessage(candidate, lastFailureMessage);
        break;
      }

      const errText = response ? await response.text() : 'Unknown provider error.';
      console.error(`${activeProvider} API Error: ${response?.status} ${response?.statusText} - ${errText}`);
      let detail = '';
      try {
        const parsed = JSON.parse(errText) as { error?: { message?: string } | string; message?: string };
        const rawMessage = typeof parsed.error === 'string' ? parsed.error : parsed.error?.message || parsed.message;
        if (rawMessage) detail = ` ${rawMessage.slice(0, 220)}`;
      } catch {
        // Some providers return non-JSON error bodies; the status is still useful.
      }

      lastFailureMessage = `${PROVIDER_LABELS[activeProvider]} connection was rejected (${response?.status || 500}).${detail}`;
      providerFailures.push(lastFailureMessage);
      providerMessage = getProviderMessage(candidate);

      if (candidate.credentialSource !== 'server' || candidate === candidates[candidates.length - 1]) {
        return mockResponse(`${lastFailureMessage} Using the local conversation engine.`);
      }
    }

    if (!text) {
      console.error(`${activeCandidate.provider} returned no usable response.`);
      return mockResponse(`${PROVIDER_LABELS[activeCandidate.provider]} returned an empty response. Using the local conversation engine.`);
    }

    // Do not render a model response until the orchestration layer has checked
    // the role, format, length, and single-question conversation contract.
    const guardedResponse = guardConversationResponse(text, mode, stage, policyDecision.selected.prompt);
    if (!guardedResponse.accepted) {
      console.error(`${activeCandidate.provider} response blocked by conversation guardrails: ${guardedResponse.reason}`);
      const priorConnectionIssue = providerFailures[0] ? `${providerFailures[0]} ` : '';
      return mockResponse(`${priorConnectionIssue}${PROVIDER_LABELS[activeCandidate.provider]} returned a response that needs coaching-format cleanup (${guardedResponse.reason}). Using the local conversation engine.`);
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
      playerState,
      policyDecision,
      isMocked: false,
      providerUsed: activeCandidate.provider,
      credentialSource: activeCandidate.credentialSource,
      providerMessage
    });

  } catch (error: unknown) {
    console.error('Error in boardroom API:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
