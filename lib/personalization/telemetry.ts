import type { Message, SimulationDecisions } from '@/lib/abis-engine';
import type { SkillId, TelemetryEvent } from './types';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function estimateAnswerQuality(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const signals = [
    /\d|report|data|demand|sales|share|margin|cash|cost|stock/i,
    /because|therefore|so that|leads? to|means|results? in/i,
    /risk|trade-?off|however|downside|sacrifice|balance/i,
    /revise|reverse|trigger|adjust|if .+ (fall|rise|change|drop)/i
  ].filter((pattern) => pattern.test(content)).length;
  return clamp01((Math.min(words, 45) / 45) * 0.35 + (signals / 4) * 0.65);
}

/** Converts the durable conversation payload into replayable learning events. */
export function messagesToTelemetry(
  messages: Message[],
  decisions: SimulationDecisions,
  sessionId = 'boardroom-session'
): TelemetryEvent[] {
  const events: TelemetryEvent[] = [{
    id: `${sessionId}-simulation`,
    sessionId,
    timestamp: 0,
    type: 'simulation_updated',
    simulation: {
      pricing: decisions.pricing,
      productionVolume: decisions.productionVolume,
      marketingBudget: decisions.marketingBudget,
      rdBudget: decisions.rdBudget,
      loanRequested: decisions.loanRequested
    }
  }];

  let activeQuestion: Message['adaptive'] | undefined;
  messages.forEach((message, index) => {
    if (message.role === 'assistant' && message.adaptive) {
      activeQuestion = message.adaptive;
      events.push({
        id: `${message.id}-presented`, sessionId, timestamp: message.adaptive.presentedAt || index,
        type: 'question_presented', questionId: message.adaptive.questionId,
        skill: message.adaptive.subSkill as SkillId, difficulty: message.adaptive.difficulty
      });
    }
    if (message.role === 'user' && activeQuestion) {
      const quality = message.telemetry?.answerQuality ?? estimateAnswerQuality(message.content);
      events.push({
        id: `${message.id}-submitted`, sessionId, timestamp: message.telemetry?.respondedAt || index,
        type: 'answer_submitted', questionId: activeQuestion.questionId,
        skill: activeQuestion.subSkill as SkillId, difficulty: activeQuestion.difficulty,
        answerQuality: quality, correct: quality >= 0.55,
        responseTimeMs: message.telemetry?.responseTimeMs,
        hintsUsed: message.telemetry?.hintsUsed || 0
      });
    }
  });
  return events;
}
