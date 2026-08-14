import { BoardroomMode, Message } from '@/lib/abis-engine';

export type LearningSignal = 'choice' | 'evidence' | 'causality' | 'tradeoff' | 'revision';

export interface LearningProgress {
  turnCount: number;
  score: number;
  signals: Record<LearningSignal, number>;
  nextFocus: LearningSignal;
  improvement: number;
}

export type AdaptiveLevel = 'guided' | 'supported' | 'challenge';

export interface AdaptiveSessionPlan {
  level: AdaptiveLevel;
  checkpointDue: boolean;
  questionStyle: string;
  feedbackStyle: string;
}

const SIGNAL_PATTERNS: Record<LearningSignal, RegExp> = {
  choice: /\b(choose|chose|decision|target|price|plan|will|prefer)\b/i,
  evidence: /\b(\$?\d[\d,]*%?|report|data|demand|sales|share|margin|cash|cost|stock|research)\b/i,
  causality: /\b(because|therefore|so that|leads? to|means|results? in|if .+ then)\b/i,
  tradeoff: /\b(risk|trade-?off|however|cost|downside|sacrifice|balance|protect)\b/i,
  revision: /\b(if .+(fall|rise|change|miss|drop)|revise|reverse|trigger|adjust)\b/i
};

const SIGNAL_ORDER: LearningSignal[] = ['choice', 'evidence', 'causality', 'tradeoff', 'revision'];

/** A transparent, local reinforcement policy: weak skills get the next prompt. */
export function evaluateLearningProgress(messages: Message[]): LearningProgress {
  const answers = messages.filter((message) => message.role === 'user');
  const signals = SIGNAL_ORDER.reduce((result, signal) => ({ ...result, [signal]: 0 }), {} as Record<LearningSignal, number>);

  for (const answer of answers) {
    for (const signal of SIGNAL_ORDER) {
      if (SIGNAL_PATTERNS[signal].test(answer.content)) signals[signal] += 1;
    }
  }

  const turnCount = answers.length;
  const coverage = SIGNAL_ORDER.reduce((total, signal) => total + Math.min(signals[signal] / Math.max(turnCount, 1), 1), 0);
  const score = Math.round((coverage / SIGNAL_ORDER.length) * 100);
  const nextFocus = SIGNAL_ORDER.find((signal) => signals[signal] === 0) || SIGNAL_ORDER.reduce((least, signal) => signals[signal] < signals[least] ? signal : least, 'choice');
  const previousAnswers = answers.slice(0, -1);
  const previousScore = previousAnswers.length ? evaluateLearningProgress(previousAnswers).score : 0;

  return { turnCount, score, signals, nextFocus, improvement: score - previousScore };
}

/** Sets the next Q&A move from observed reasoning, including a midpoint check-in. */
export function getAdaptiveSessionPlan(progress: LearningProgress): AdaptiveSessionPlan {
  const level: AdaptiveLevel = progress.score < 40 ? 'guided' : progress.score < 75 ? 'supported' : 'challenge';
  const checkpointDue = progress.turnCount > 0 && progress.turnCount % 3 === 0;
  const questionStyle = level === 'guided'
    ? 'Ask one short question and offer a concrete decision, report, or number to refer to.'
    : level === 'supported'
      ? 'Ask one focused why/how question that links evidence to the student’s decision.'
      : 'Ask one executive-level challenge that tests a trade-off, alternative, or revision trigger.';
  const feedbackStyle = level === 'guided'
    ? 'Acknowledge the attempt, name one strength, then give one small next step.'
    : level === 'supported'
      ? 'Briefly reflect the reasoning, then ask for the missing element.'
      : 'Summarise the reasoning and probe assumptions without supplying the answer.';
  return { level, checkpointDue, questionStyle, feedbackStyle };
}

export function getAdaptiveLearningGuidance(progress: LearningProgress, mode: BoardroomMode): string {
  const labels: Record<LearningSignal, string> = {
    choice: 'state the choice clearly', evidence: 'name one relevant report result or number', causality: 'explain the cause-and-effect link', tradeoff: 'identify the risk or trade-off accepted', revision: 'name the result that would trigger a revision'
  };
  const role = mode === 'verbal-assessment' ? 'Socratic Coach' : 'Boardroom Council';
  const plan = getAdaptiveSessionPlan(progress);
  return `\n\nADAPTIVE LEARNING POLICY:\n- ${role} learning score: ${progress.score}/100 after ${progress.turnCount} learner turn(s).\n- Reward demonstrated reasoning by advancing to the next missing skill. Do not repeat a skill already demonstrated unless the learner asks.\n- The next most useful skill is: ${labels[progress.nextFocus]}.\n- Current support level: ${plan.level}. ${plan.questionStyle}\n- Feedback instruction: ${plan.feedbackStyle}\n- ${plan.checkpointDue ? 'MID-SESSION CHECKPOINT: briefly assess progress before the next question; state one demonstrated strength and one next target.' : 'Continue the current adaptive Q&A sequence.'}\n- Ask one question that elicits only the next useful skill.`;
}
