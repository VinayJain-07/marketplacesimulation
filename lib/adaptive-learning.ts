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

export type OutcomeBand = 'emerging' | 'developing' | 'proficient' | 'advanced';

export interface StudentOutcomeAssessment {
  band: OutcomeBand;
  readiness: string;
  strengths: LearningSignal[];
  gaps: LearningSignal[];
  teacherJudgement: string;
  nextStep: string;
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
  if (mode === 'decision-help') {
    return `\n\nADAPTIVE TEACHER GUIDANCE (internal):\n- Keep a natural student-teacher chat about the student's current game decision.\n- Use their words and reports. Keep sentences short. Acknowledge what they said, explain one business link in plain language, then ask one useful follow-up.\n- The next learning target is ${labels[progress.nextFocus]}; weave it in without naming the skill, score, policy, or difficulty.\n- Light Gen Z wording is okay when it feels natural, such as “Got you” or “Quick check.” Do not force slang.\n- If they are unsure, use a small scenario or comparison. Help them reach their own conclusion over several turns.`;
  }
  return `\n\nADAPTIVE LEARNING POLICY:\n- ${role} learning score: ${progress.score}/100 after ${progress.turnCount} learner turn(s).\n- Reward demonstrated reasoning by advancing to the next missing skill. Do not repeat a skill already demonstrated unless the learner asks.\n- The next most useful skill is: ${labels[progress.nextFocus]}.\n- Current support level: ${plan.level}. ${plan.questionStyle}\n- Feedback instruction: ${plan.feedbackStyle}\n- ${plan.checkpointDue ? 'MID-SESSION CHECKPOINT: briefly assess progress before the next question; state one demonstrated strength and one next target.' : 'Continue the current adaptive Q&A sequence.'}\n- Ask one question that elicits only the next useful skill.`;
}

/** Converts signal coverage into a teacher-facing judgement about student outcomes. */
export function assessStudentOutcome(progress: LearningProgress): StudentOutcomeAssessment {
  const strengths = SIGNAL_ORDER.filter((signal) => progress.signals[signal] > 0);
  const gaps = SIGNAL_ORDER.filter((signal) => progress.signals[signal] === 0);

  let band: OutcomeBand;
  if (progress.score >= 85 && gaps.length <= 1) {
    band = 'advanced';
  } else if (progress.score >= 65 && strengths.length >= 3) {
    band = 'proficient';
  } else if (progress.score >= 35 && strengths.length >= 2) {
    band = 'developing';
  } else {
    band = 'emerging';
  }

  const readiness = band === 'advanced'
    ? 'Can defend a decision with evidence, trade-offs, and revision triggers.'
    : band === 'proficient'
      ? 'Can explain a decision clearly but still needs tighter executive justification.'
      : band === 'developing'
        ? 'Shows partial reasoning but needs support to connect decisions, evidence, and consequences.'
        : 'Needs guided prompting to state the decision and support it with relevant evidence.';

  const teacherJudgement = band === 'advanced'
    ? 'Outcome achieved at a strong level. The student can justify business choices with accountability.'
    : band === 'proficient'
      ? 'Outcome largely achieved. The student is operationally sound but should strengthen challenge-level reasoning.'
      : band === 'developing'
        ? 'Outcome partially achieved. The student can participate but does not yet sustain a full decision-defense chain.'
        : 'Outcome not yet secure. The student needs scaffolded questioning before independent judgment can be trusted.';

  const nextStep = gaps.length === 0
    ? 'Raise the challenge: ask for an alternative decision, a downside, and the condition that would trigger a revision.'
    : gaps[0] === 'choice'
      ? 'Ask the student to state the decision in one sentence before explaining it.'
      : gaps[0] === 'evidence'
        ? 'Ask for one number, report result, or market signal that supports the decision.'
        : gaps[0] === 'causality'
          ? 'Ask how the evidence leads to the expected business result.'
          : gaps[0] === 'tradeoff'
            ? 'Ask what risk, cost, or sacrifice the student is accepting.'
            : 'Ask what result would make the student revise the decision.';

  return { band, readiness, strengths, gaps, teacherJudgement, nextStep };
}
