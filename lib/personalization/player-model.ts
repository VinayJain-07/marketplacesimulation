import { SKILL_IDS, type PlayerState, type SkillEstimate, type SkillId, type TelemetryEvent } from './types';

const PRIOR_MASTERY: Record<SkillId, number> = {
  choice: 0.35, pricing: 0.35, inventory: 0.35, risk: 0.3, evidence: 0.3,
  causality: 0.3, tradeoff: 0.25, revision: 0.2
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function updateBkt(prior: number, correct: boolean, difficulty: number, quality = correct ? 1 : 0) {
  const slip = clamp01(0.06 + difficulty * 0.025);
  const guess = clamp01(0.28 - difficulty * 0.03);
  const posterior = correct
    ? (prior * (1 - slip)) / Math.max(prior * (1 - slip) + (1 - prior) * guess, 0.001)
    : (prior * slip) / Math.max(prior * slip + (1 - prior) * (1 - guess), 0.001);
  const learn = 0.08 + 0.08 * clamp01(quality);
  return clamp01(posterior + (1 - posterior) * learn);
}

/** Bayesian Knowledge Tracing with transparent priors and difficulty-aware slip/guess terms. */
export function buildPlayerState(events: TelemetryEvent[]): PlayerState {
  const skills = Object.fromEntries(SKILL_IDS.map((skill) => [skill, {
    mastery: PRIOR_MASTERY[skill], observations: 0, confidence: 0
  }])) as Record<SkillId, SkillEstimate>;

  const answers = events.filter((event) => event.type === 'answer_submitted' && event.skill);
  for (const event of answers) {
    const skill = event.skill as SkillId;
    const estimate = skills[skill];
    estimate.mastery = updateBkt(estimate.mastery, Boolean(event.correct), event.difficulty || 2, event.answerQuality);
    estimate.observations += 1;
    estimate.confidence = 1 - Math.exp(-estimate.observations / 4);
  }

  const responseTimes = answers.map((event) => event.responseTimeMs).filter((value): value is number => typeof value === 'number');
  const engagedAnswers = answers.filter((event) => (event.hintsUsed || 0) < 3 && (event.responseTimeMs || 0) < 180_000);
  return {
    skills,
    recentErrorRate: answers.length ? answers.slice(-5).filter((event) => !event.correct).length / Math.min(answers.length, 5) : 0.3,
    averageResponseTimeMs: responseTimes.length ? responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length : 45_000,
    engagementRate: answers.length ? engagedAnswers.length / answers.length : 0.75,
    turnCount: answers.length,
    simulation: events.findLast((event) => event.simulation)?.simulation
  };
}
