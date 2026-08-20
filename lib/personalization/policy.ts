import type { PlayerState, PolicyDecision, QuestionItem, RewardBreakdown, SkillId, TelemetryEvent } from './types';
import { getGameContextPrompt } from './game-context';

const TARGET_SUCCESS = 0.725;
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function predictedSuccess(mastery: number, difficulty: number) {
  const threshold = 0.02 + difficulty * 0.16;
  return clamp01(1 / (1 + Math.exp(-5 * (mastery - threshold))));
}

/** Warm-start contextual bandit. Exploration shrinks as each skill receives observations. */
export function selectQuestion(
  state: PlayerState,
  bank: QuestionItem[],
  events: TelemetryEvent[] = []
): PolicyDecision {
  const recentIds = events.filter((event) => event.type === 'question_presented').slice(-3).map((event) => event.questionId);
  const candidates = bank.filter((item) => !recentIds.includes(item.id));
  const ranked = (candidates.length ? candidates : bank).map((item) => {
    const estimate = state.skills[item.subSkill as SkillId];
    const success = predictedSuccess(estimate.mastery, item.difficulty);
    const targetFit = 1 - Math.min(Math.abs(success - TARGET_SUCCESS) / TARGET_SUCCESS, 1);
    const weakness = 1 - estimate.mastery;
    const explorationBonus = 1 / Math.sqrt(estimate.observations + 1);
    const score = targetFit * 0.5 + weakness * 0.3 + explorationBonus * 0.2;
    return { item, success, score, explorationBonus };
  }).sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const exploration = best.explorationBonus > 0.57;
  return {
    selected: best.item,
    predictedSuccessRate: best.success,
    targetSuccessRate: TARGET_SUCCESS,
    exploration,
    score: best.score,
    rationale: `${best.item.subSkill} mastery is ${Math.round(state.skills[best.item.subSkill].mastery * 100)}%; difficulty ${best.item.difficulty} predicts ${Math.round(best.success * 100)}% success near the 70–75% target zone.`
  };
}

export function computeReward(input: {
  previousMastery: number;
  currentMastery: number;
  successRate: number;
  engagementRate: number;
  weights?: { learningGain: number; targetSuccessRate: number; engagementRate: number };
}): RewardBreakdown {
  const weights = input.weights || { learningGain: 0.5, targetSuccessRate: 0.3, engagementRate: 0.2 };
  const learningGain = clamp01((input.currentMastery - input.previousMastery + 0.2) / 0.4);
  const targetSuccessRate = 1 - Math.min(Math.abs(input.successRate - TARGET_SUCCESS) / TARGET_SUCCESS, 1);
  const engagementRate = clamp01(input.engagementRate);
  return {
    learningGain, targetSuccessRate, engagementRate,
    total: learningGain * weights.learningGain + targetSuccessRate * weights.targetSuccessRate + engagementRate * weights.engagementRate
  };
}

export function getPolicyPrompt(decision: PolicyDecision) {
  const probeStep = decision.selected.difficulty <= 1
    ? 'evidence probe: ask which report or observable result the student used'
    : decision.selected.difficulty === 2
      ? 'number-and-consequence probe: ask for one number, then what changes if it rises or falls'
      : decision.selected.difficulty === 3
        ? 'trade-off probe: ask which risk, cost, or stakeholder downside the student accepts'
        : 'revision probe: ask what measurable next-quarter result would change the decision';
  return `${getGameContextPrompt(decision)}\n\nCONTEXTUAL BANDIT ACTION:\n- Ask this selected question, preserving its meaning: "${decision.selected.prompt}"\n- Topic: ${decision.selected.topic}; skill: ${decision.selected.subSkill}; difficulty: ${decision.selected.difficulty}/5.\n- Predicted success: ${Math.round(decision.predictedSuccessRate * 100)}%; target zone: 70–75%.\n- Documented probe step: ${probeStep}.\n- If the student is off-topic, says “I don’t know,” or asks for the answer, acknowledge briefly and redirect to this same game decision with a smaller probe.\n- Ask exactly one question and do not add a second question.`;
}
