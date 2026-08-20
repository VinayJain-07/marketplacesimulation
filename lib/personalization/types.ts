export const SKILL_IDS = ['choice', 'pricing', 'inventory', 'risk', 'evidence', 'causality', 'tradeoff', 'revision'] as const;

export type SkillId = typeof SKILL_IDS[number];
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type SimulationSnapshot = {
  cash?: number;
  inventoryValue?: number;
  round?: number;
  pricing: number;
  productionVolume: number;
  marketingBudget: number;
  rdBudget: number;
  loanRequested: number;
};

export type TelemetryEvent = {
  id: string;
  sessionId: string;
  timestamp: number;
  type: 'question_presented' | 'answer_submitted' | 'hint_used' | 'simulation_updated';
  questionId?: string;
  skill?: SkillId;
  difficulty?: Difficulty;
  correct?: boolean;
  answerQuality?: number;
  responseTimeMs?: number;
  hintsUsed?: number;
  simulation?: SimulationSnapshot;
};

export type SkillEstimate = {
  mastery: number;
  observations: number;
  confidence: number;
};

export type PlayerState = {
  skills: Record<SkillId, SkillEstimate>;
  recentErrorRate: number;
  averageResponseTimeMs: number;
  engagementRate: number;
  turnCount: number;
  simulation?: SimulationSnapshot;
};

export type QuestionItem = {
  id: string;
  topic: 'pricing-strategy' | 'inventory-management' | 'risk-analysis' | 'decision-quality';
  subSkill: SkillId;
  difficulty: Difficulty;
  scenarioComplexity: 'single-variable' | 'linked-decisions' | 'counterfactual';
  prompt: string;
  contextTags: string[];
};

export type RewardBreakdown = {
  learningGain: number;
  targetSuccessRate: number;
  engagementRate: number;
  total: number;
};

export type PolicyDecision = {
  selected: QuestionItem;
  predictedSuccessRate: number;
  targetSuccessRate: number;
  exploration: boolean;
  score: number;
  rationale: string;
};
