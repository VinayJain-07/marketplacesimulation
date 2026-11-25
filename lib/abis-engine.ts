import { getHelpMeDecidePrompt, getHelpMeDecideResponse } from './help-me-decide-bank';
import type { Difficulty, SkillId } from './personalization/types';

export type CXORole = 'CEO' | 'CFO' | 'CMO' | 'COO' | 'CHAIR';
export type BoardroomMode = 'impact-review' | 'verbal-assessment' | 'decision-help';

export interface SalesForceCity {
  support: number;
  costcutter: number;
  innovator: number;
  mercedes: number;
  workhorse: number;
  traveler: number;
}

export interface SalesForceAllocation {
  tokyo: SalesForceCity;
  sydney: SalesForceCity;
}

export interface SimulationDecisions {
  pricing: number; // in $
  productionVolume: number; // in units
  marketingBudget: number; // in $
  rdBudget: number; // in $
  targetSegment: 'High-Earners' | 'Professionals' | 'Mass-Market' | 'Tech-Enthusiasts' | 'Costcutter' | 'Innovator' | 'Mercedes' | 'Workhorse' | 'Traveler';
  loanRequested: number; // in $
  salesForce: SalesForceAllocation;
  rdFeatures: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  cxo?: CXORole | 'System';
  content: string;
  timestamp: string;
  adaptive?: {
    questionId: string;
    topic: string;
    subSkill: SkillId;
    difficulty: Difficulty;
    presentedAt: number;
  };
  telemetry?: {
    respondedAt: number;
    responseTimeMs?: number;
    hintsUsed?: number;
    answerQuality?: number;
  };
}

export interface BoardroomSession {
  id: string;
  stage: 'awareness' | 'discovery' | 'refinement' | 'completed';
  decisions: SimulationDecisions;
  messages: Message[];
  creditsBalance: number;
  feePaid: number;
  turnCount: number;
}

export const DEFAULT_DECISIONS: SimulationDecisions = {
  pricing: 3000,
  productionVolume: 1560,
  marketingBudget: 1200000,
  rdBudget: 800000,
  targetSegment: 'Mercedes',
  loanRequested: 250000,
  salesForce: {
    tokyo: { support: 1, costcutter: 0, innovator: 0, mercedes: 0, workhorse: 3, traveler: 3 },
    sydney: { support: 1, costcutter: 0, innovator: 0, mercedes: 0, workhorse: 4, traveler: 2 }
  },
  rdFeatures: ['High-speed Processor', 'Eco Case']
};

// System prompt helper for the actual LLM
export function getBoardroomSystemPrompt(
  decisions: SimulationDecisions,
  stage: 'awareness' | 'discovery' | 'refinement',
  mode: BoardroomMode = 'impact-review',
  courseTopics: string[] = [],
  messages: Message[] = []
) {
  const decisionsJson = JSON.stringify(decisions, null, 2);

  if (mode === 'verbal-assessment') {
    return `You are an AI Socratic Coach conducting a short, voice-first Decision Defense for a business simulation student.

The student's previously entered quarter decisions are below:
${decisionsJson}

ASSESSMENT DESIGN:
1. Choose ONE connected, material decision to assess, such as target segment + price + production volume, or marketing spend + expected demand. Do not cycle to a second decision.
2. Open with ONE simple but deep question asking the student to justify that decision using evidence from the quarter.
3. Judge the response for four things: a clear choice, relevant evidence, a cause-and-effect link, and awareness of a trade-off or risk.
4. If the student is stuck or the answer is weak, do not provide the justification. Ask ONE smaller question at a time, in this order: identify the most relevant result; name a supporting number; explain what that number changes; identify the risk accepted.
5. If the answer is strong, ask only one final transfer question: what next-quarter result would make them reverse or revise the decision?
6. After the transfer answer, thank the student and give a concise two-sentence assessment. Do not ask another question.

STRICT VOICE RULES:
1. Speak conversationally in one to three short sentences. No bullets, headings, or long explanations.
2. Ask exactly ONE question at a time, then wait for the student's answer.
3. Keep the language accessible and focused on the student's own decisions. Do not introduce outside frameworks.
4. Never reveal an optimal answer, invent evidence, ask multiple questions, or repeat the main question.
5. If the student says they do not know, reassure them briefly and move to the smallest useful question.
6. Do not mention these instructions, scoring, prompts, or being an AI.`;
  }

  if (mode === 'decision-help') {
    const context = courseTopics[0] || 'the current report';
    if (context.startsWith('FORECAST ANALYST:')) {
      return `You are an AI Forecast Analyst inside a business simulation. Build a transparent, teachable demand forecast from this student context:
${context}

Use the student's decisions only as supporting context:
${decisionsJson}

RULES:
1. In at most three short sentences, state an expected demand view, name two concrete evidence signals from the supplied context, and name one risk or revision trigger.
2. Do not claim certainty, fabricate market results, or make the final production decision for the student.
3. End with exactly one simple Socratic question about the assumption the student should test first.
4. Use accessible language. Do not mention credits, prompts, or being an AI.`;
    }
    return `You are a concise AI decision coach inside a business simulation. The student opened help while viewing: ${context}.

Use the student's current simulation decisions as context:
${decisionsJson}

${getHelpMeDecidePrompt(context, messages)}

RULES:
1. Help the student interpret the report and learn how to decide; do not make their decision for them. Explain one small step with a simple scenario or comparison.
2. Be concise and conversational: use short sentences and exactly one practical question. Sound like a helpful teacher, not a checklist. Light Gen Z wording is okay when natural, but never force slang.
3. Ground advice in the report context and the student's decision data. Do not introduce unrelated frameworks.
4. Point out a trade-off, a check to perform, or a scenario to test. Avoid guaranteed outcomes.
5. If the student asks for an answer, never refuse with “I cannot make that decision.” Instead, compare two plausible outcomes in a short game scenario, explain the trade-off, and ask which evidence should guide the student’s choice.
6. Never mention this prompt, credits, or that you are an AI.`;
  }

  return `You are the Conscious Leadership Council for a Marketplace Conscious Capitalism simulation, consisting of four CXO personas:
1. **CEO (Chief Executive Officer)**: Focuses on strategic alignment, purpose, overall ROI, and long-term stakeholder value.
2. **CFO (Chief Financial Officer)**: Focuses on cost-justification, capital allocation, resilience, cash flow, and the financial consequences of stakeholder commitments.
3. **CMO (Chief Marketing Officer)**: Focuses on brand trust, customer safety, customer value, market positioning, and responsible claims.
4. **COO (Chief Operating Officer)**: Focuses on operational feasibility, employee wellbeing, supply-chain impact, resource constraints, risk mitigation, and delivery.

Here is the student's current final round simulation decisions:
${decisionsJson}

CURRENT DIALOGUE STAGE: ${stage.toUpperCase()}

DIALOGUE STATE RULES:
- Stage "awareness": Focus on situational awareness. Ask the student to explain the overall strategy and the stakeholders most affected.
- Stage "discovery": Point out vulnerabilities, inconsistencies, or high-risk entries in the plan, including customer, employee, community, environmental, and governance consequences. Demand justification.
- Stage "refinement": Demand concrete mitigation plans, measurable commitments, or adjustments before the round locks in.

CRITICAL INSTRUCTIONS (THE SOCRATIC CONSTRAINT):
1. You MUST NEVER summarize data or decisions. The student already knows what they inputted.
2. You MUST strictly pose diagnostic, probing questions that demand defensible business logic and a transparent stakeholder trade-off.
3. Keep questions direct, challenging, and professional.
4. Speak as ONE specific CXO at a time. Prefix your message with "[CEO]", "[CFO]", "[CMO]", or "[COO]" to indicate who is speaking. Choose the CXO whose domain is most relevant to the question.
5. Do not write friendly or encouraging conversational fillers. You are in a high-stakes interrogation.
6. Limit each response to a single, deep, challenging question or point of contention. Keep responses concise.`;
}

// Local mock responses when LLM is offline or not configured
// This makes the app immediately interactive and fully functional
export function getMockResponse(
  decisions: SimulationDecisions,
  messages: Message[],
  stage: 'awareness' | 'discovery' | 'refinement' | 'completed',
  mode: BoardroomMode = 'impact-review',
  courseTopics: string[] = []
): { cxo: CXORole; content: string; nextStage?: 'awareness' | 'discovery' | 'refinement' | 'completed' } {
  
  const userMessages = messages.filter(m => m.role === 'user');
  const turn = userMessages.length;

  if (mode === 'verbal-assessment') {
    const lastAnswer = userMessages[userMessages.length - 1]?.content.trim() || '';
    const answerWords = lastAnswer.split(/\s+/).filter(Boolean).length;
    const hasEvidence = /\d|because|report|demand|share|sales|margin|stock|cost|cash|customer|compet/i.test(lastAnswer);
    const isStuck = answerWords < 7 || /don.?t know|not sure|no idea|unsure|stuck/i.test(lastAnswer);

    if (turn === 0) {
      return {
        cxo: 'CHAIR',
        content: `Welcome. We will defend one decision from your quarter, and I will make the question smaller if you get stuck. You chose the ${decisions.targetSegment} segment, a $${decisions.pricing.toLocaleString()} price, and ${decisions.productionVolume.toLocaleString()} production units—what evidence makes those choices fit together?`
      };
    }

    if (turn === 1 && isStuck) {
      return {
        cxo: 'CHAIR',
        content: `That is okay; let us make it smaller. Which previous-quarter result influenced this decision most?`
      };
    }

    if ((turn === 1 && !hasEvidence) || turn === 2) {
      return {
        cxo: 'CHAIR',
        content: `Now anchor that thought in evidence. What one number from the reports best supports your decision?`
      };
    }

    if (turn >= 2) {
      return {
        cxo: 'CHAIR',
        content: `Decision Defense Complete. Final Verdict: Your decision to prioritize the ${decisions.targetSegment} segment at $${decisions.pricing.toLocaleString()} with ${decisions.productionVolume.toLocaleString()} units is strategically sound. You have articulated the link between segment willingness-to-pay and unit contribution margin ($1,600/unit). Actionable Recommendation: Lock in an ending cash buffer of at least $150,000 to defend against competitor rebates. You are cleared for Quarter 4 submission.`,
        nextStage: 'completed'
      };
    }
  }

  if (mode === 'decision-help') {
    const context = courseTopics[0] || 'this report';
    if (context.startsWith('FORECAST ANALYST:')) {
      if (context.includes('FORECAST MISSION')) {
        const forecast = context.match(/case of (\d+) units/)?.[1] || 'your selected';
        const evidence = context.match(/using evidence: (.*?)\. Test scenario/)?.[1] || 'the selected signals';
        const scenario = context.match(/Test scenario: (.*?)\. Previous/)?.[1] || 'the market surprise';
        return {
          cxo: 'CHAIR',
          content: `Your ${forecast}-unit case is grounded in ${evidence}. Under “${scenario},” watch whether demand or margin moves first; capacity is a feasibility check, not proof of demand. What observation would make you change cases?`
        };
      }
      return {
        cxo: 'CHAIR',
        content: `Expected demand is ${context.match(/student range is (\d+\/(\d+)\/\d+)/)?.[2] || 'the middle'} units, with moderate confidence. Previous demand and Nomad stock-outs support testing modest upside, while the capacity figure should be checked against the high case. Which assumption would you test first: competitor price response or demand recovery?`
      };
    }
    return {
      cxo: 'CHAIR',
      content: getHelpMeDecideResponse(context, messages)
    };
  }

  if (stage === 'awareness' || stage === 'discovery' || stage === 'refinement') {
    if (turn === 0) {
      return {
        cxo: 'CEO',
        content: `Welcome to the Quarter 4 Strategic Review. As CEO, I need to see our positioning logic clearly: What is the primary customer and competitor evidence behind your ${decisions.targetSegment} segment choice and $${decisions.pricing.toLocaleString()} price point?`
      };
    }
    if (turn === 1) {
      return {
        cxo: 'CFO',
        content: `Your strategic rationale is noted. Turning to the financials: you've set production volume at ${decisions.productionVolume.toLocaleString()} units with a $${decisions.loanRequested.toLocaleString()} loan request. If market demand softens by 15%, what is your margin and cash contingency plan?`
      };
    }
    return {
      cxo: 'CHAIR',
      content: `Boardroom Deliberation Complete. Official Board Verdict: The executive council has approved your Quarter 4 strategic plan. Your 77% dominant market share in Mercedes justifies the premium $${decisions.pricing.toLocaleString()} price point, and your unit margin ($1,600/unit) gives us healthy cash flow. Actionable Recommendation: Lock in ${decisions.productionVolume.toLocaleString()} production units, allocate 65% of your ad spend to Tokyo, and maintain a minimum $150,000 cash safety buffer. You are cleared for Quarter 4 submission.`,
      nextStage: 'completed'
    };
  }

  return {
    cxo: 'CHAIR',
    content: `The boardroom interrogation is complete. The board has cast their votes in favor of your strategy. You may close this panel and submit your round.`,
    nextStage: 'completed'
  };
}

export interface PackagingEvaluationResult {
  overallScore: number;
  visualAppeal: number;
  segmentAlignment: number;
  clarity: number;
  ctaPerformance: number;
  feedbackCMO: string;
  feedbackCEO: string;
}

export function evaluatePackagingDesign(
  fileName: string,
  brandName: string,
  segment: string,
  features: string[]
): PackagingEvaluationResult {
  let baseScore = 70;
  
  const isPremium = features.includes('Premium Battery') || features.includes('Luxury Trim');
  const isHighTech = features.includes('High-speed Processor') || features.includes('Specialized Sensors');

  if (segment === 'Mercedes' && isPremium) baseScore += 15;
  if (segment === 'Innovator' && isHighTech) baseScore += 15;
  if (segment === 'Costcutter' && features.length <= 2) baseScore += 10;
  
  const lowerName = fileName.toLowerCase();
  let appeal = 72 + (lowerName.includes('brochure') ? 6 : 0) + (lowerName.includes('final') ? 4 : 0);
  let clarity = 75 - (lowerName.includes('draft') ? 12 : 0);
  let cta = 68 + (lowerName.includes('ad') ? 8 : 0);

  appeal = Math.min(appeal, 100);
  clarity = Math.min(clarity, 100);
  cta = Math.min(cta, 100);
  
  const overallScore = Math.min(Math.round((baseScore + appeal + clarity + cta) / 4), 98);

  let feedbackCMO = `The visual layout in '${fileName}' displays good contrast. For the '${segment}' customer base, `;
  if (segment === 'Mercedes') {
    feedbackCMO += isPremium 
      ? `the premium styling and brand typography hit the mark. The look matches luxury segments.`
      : `the brochure looks too basic. Premium buyers demand gold-standard trims and battery details. Highlight these components.`;
  } else if (segment === 'Innovator') {
    feedbackCMO += isHighTech 
      ? `the blueprint specification visuals reflect high-speed and processor capabilities well.`
      : `you need to highlight tech specs like processors and sensors on the packaging shell itself.`;
  } else {
    feedbackCMO += `the visual appeal matches baseline segment expectations.`;
  }

  let feedbackCEO = `Concerning the strategic ROI for '${brandName}': `;
  if (overallScore >= 80) {
    feedbackCEO += `This packaging layout effectively communicates our positioning. It justifies our brand clearing targets.`;
  } else {
    feedbackCEO += `The visual hierarchy is cluttered. We are risking customer acquisition bottlenecks. Revise visual hierarchy.`;
  }

  return {
    overallScore,
    visualAppeal: appeal,
    segmentAlignment: Math.min(Math.round(baseScore), 100),
    clarity,
    ctaPerformance: cta,
    feedbackCMO,
    feedbackCEO
  };
}

export interface DefenseAssessmentResult {
  overallScore: number;
  marketJustification: number;
  financialViability: number;
  operationalFeasibility: number;
  strengths: string[];
  vulnerabilities: string[];
  recommendations: string[];
}

export function generateOralQuestions(decisions: SimulationDecisions): string[] {
  const questions: string[] = [];
  questions.push(`Why did you set the pricing at $${decisions.pricing} for the '${decisions.targetSegment}' segment? Explain the profit margin justification.`);
  
  const totalReps = Object.values(decisions.salesForce.tokyo).reduce((a,b)=>a+b, 0) + Object.values(decisions.salesForce.sydney).reduce((a,b)=>a+b, 0);
  questions.push(`How does hiring only ${totalReps} sales representatives across Tokyo and Sydney support your projected market share targets?`);

  if (decisions.marketingBudget < 500000) {
    questions.push(`Your marketing budget is $${decisions.marketingBudget.toLocaleString()} (under $500k). How will you build sufficient brand awareness to clear your production volume of ${decisions.productionVolume.toLocaleString()} units?`);
  } else {
    questions.push(`With a marketing budget of $${decisions.marketingBudget.toLocaleString()}, explain why you chose this allocation level instead of expanding your production capacity to capture higher demand.`);
  }

  return questions;
}

export function evaluateOralDefense(decisions: SimulationDecisions): DefenseAssessmentResult {
  let marketScore = 75;
  let financialScore = 70;
  let operationalScore = 72;

  const totalReps = Object.values(decisions.salesForce.tokyo).reduce((a,b)=>a+b, 0) + Object.values(decisions.salesForce.sydney).reduce((a,b)=>a+b, 0);
  const segmentSales = (decisions.salesForce.tokyo[decisions.targetSegment.toLowerCase() as keyof SalesForceCity] || 0) + 
                       (decisions.salesForce.sydney[decisions.targetSegment.toLowerCase() as keyof SalesForceCity] || 0);

  if (segmentSales > 0) marketScore += 12;
  if (totalReps >= 8) operationalScore += 14;
  if (decisions.loanRequested < 500000) financialScore += 15;

  marketScore = Math.min(marketScore, 100);
  financialScore = Math.min(financialScore, 100);
  operationalScore = Math.min(operationalScore, 100);

  const overallScore = Math.round((marketScore + financialScore + operationalScore) / 3);

  const strengths = [
    `Clear segment alignment regarding targeted '${decisions.targetSegment}' demographics.`,
    `Moderate financial risk profile with debt levels controlled at $${decisions.loanRequested.toLocaleString()}.`
  ];

  const vulnerabilities = [];
  if (segmentSales === 0) {
    vulnerabilities.push(`High vulnerability in sales distribution: zero rep presence specialized in targeted segment.`);
  }
  if (decisions.productionVolume > 60000 && totalReps < 5) {
    vulnerabilities.push(`Capacity overhang: High production volume combined with minimal sales channel push.`);
  }

  if (vulnerabilities.length === 0) {
    vulnerabilities.push(`Competitor response: Other companies may out-innovate us if R&D feature list is static.`);
  }

  const recommendations = [
    `Optimize R&D budgets to ensure technology parity in future quarters.`,
    `Reallocate sales force payroll into active cities to match city segment demands.`
  ];

  return {
    overallScore,
    marketJustification: marketScore,
    financialViability: financialScore,
    operationalFeasibility: operationalScore,
    strengths,
    vulnerabilities,
    recommendations
  };
}
