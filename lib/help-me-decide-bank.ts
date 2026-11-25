import type { Message } from './abis-engine';

export type HelpQuestionMove =
  | 'evidence'
  | 'cause-and-effect'
  | 'trade-off'
  | 'counterfactual'
  | 'stakeholder'
  | 'assumption'
  | 'transfer'
  | 'prioritization';

type LearnerPath = 'opening' | 'top-performer' | 'average' | 'stuck' | 'direct-answer';

interface QuestionSet {
  label: string;
  keywords: string[];
  questions: Record<HelpQuestionMove, string>;
  stuck: string;
  direct: string;
}

const BANK: QuestionSet[] = [
  {
    label: 'Market offering and brand setup', keywords: ['market offering', 'brand expansion', 'design brand', 'brand setup'],
    questions: {
      evidence: 'What customer need are you trying to satisfy with this offer?',
      'cause-and-effect': 'If this feature changes, how could demand from your target segment change?',
      'trade-off': 'If you remove one feature, which one would hurt the segment least?',
      counterfactual: 'What result would show that this offer is too weak for the segment?',
      stakeholder: 'Which customer expectation could be disappointed by this offer?',
      assumption: 'Which assumption about your target customer is doing the most work here?',
      transfer: 'Where else in your plan must this offer be supported?',
      prioritization: 'Which product signal would you check before changing the offer?'
    },
    stuck: 'Is the unclear part the customer need, the feature, the price, or the target segment?',
    direct: 'Imagine one version has every feature but costs too much, and another fits the budget but misses one valued feature. Which risk matters more to your target customer?'
  },
  {
    label: 'Pricing', keywords: ['pricing', 'price rebate', 'price'],
    questions: {
      evidence: 'Why does this price fit the customer you are targeting?',
      'cause-and-effect': 'If the price moves up a little, what might happen to demand or margin?',
      'trade-off': 'What risk are you accepting by setting the price here?',
      counterfactual: 'What report result would show that the price is too aggressive?',
      stakeholder: 'Which customer group could feel excluded by this price?',
      assumption: 'What are you assuming customers value enough to accept this price?',
      transfer: 'How does this price need to match your product and advertising?',
      prioritization: 'Which number would you check first before changing the price?'
    },
    stuck: 'Does the decision feel unclear because of demand, margin, competitors, or customer value?',
    direct: 'Imagine you lower price but demand does not change. What happens to margin, and what would that tell you?'
  },
  {
    label: 'Advertising and media placement', keywords: ['advertising', 'media placement', 'ad copy', 'market research'],
    questions: {
      evidence: 'What do you want the customer to believe after seeing this ad?',
      'cause-and-effect': 'If the ad gets attention but not sales, what might be missing?',
      'trade-off': 'What do you give up when you increase media frequency?',
      counterfactual: 'What result would show that this message is not credible?',
      stakeholder: 'Which customer expectation must this claim not overpromise?',
      assumption: 'What are you assuming this audience cares about most?',
      transfer: 'How must the product experience support this ad claim?',
      prioritization: 'Which ad result would you check before spending more?'
    },
    stuck: 'Is the uncertainty about the message, the audience, the budget, or the channel?',
    direct: 'Imagine customers remember the ad but cannot find the promised benefit in the product. What happens to trust?'
  },
  {
    label: 'Sales channel', keywords: ['sales channel', 'sales force', 'sales report', 'city', 'tokyo', 'sydney'],
    questions: {
      evidence: 'Which city or channel is most important for this segment?',
      'cause-and-effect': 'What happens if the sales force is not matched to the target segment?',
      'trade-off': 'What do you risk by moving support from one city to another?',
      counterfactual: 'What result would make you shift resources between cities?',
      stakeholder: 'Which customer may have less access if this channel is under-supported?',
      assumption: 'What are you assuming about where this customer is likely to buy?',
      transfer: 'How does sales coverage need to match advertising and inventory?',
      prioritization: 'Which regional signal would you check before adding sales support?'
    },
    stuck: 'Which feels less clear: the customer location, sales coverage, demand, or cost?',
    direct: 'Imagine demand grows in one city while the trained team is elsewhere. What happens before you add more advertising?'
  },
  {
    label: 'Manufacturing and capacity', keywords: ['manufacturing', 'production capacity', 'operating capacity', 'production', 'inventory', 'demand projection'],
    questions: {
      evidence: 'Which number tells you whether capacity is enough for expected demand?',
      'cause-and-effect': 'What happens if demand is stronger than production?',
      'trade-off': 'What risk appears if you produce more than the market buys?',
      counterfactual: 'What would make you increase capacity, and what would make you wait?',
      stakeholder: 'Who bears the cost if customers are promised stock that is unavailable?',
      assumption: 'Which demand assumption is behind this production plan?',
      transfer: 'How does this production choice affect both cash and profit?',
      prioritization: 'Which demand signal would you check before increasing capacity?'
    },
    stuck: 'Is the main uncertainty demand, capacity, inventory, or cash?',
    direct: 'Imagine one shelf is empty because demand was too strong and another is full because production was too high. Which risk would hurt this quarter more?'
  },
  {
    label: 'Finance', keywords: ['finance', 'funding', 'debt', 'equity', 'financial ratio', 'loan'],
    questions: {
      evidence: 'Which financial report gives you the clearest warning sign?',
      'cause-and-effect': 'Why could cash become tight even if profit looks fine?',
      'trade-off': 'What debt or liquidity risk are you accepting?',
      counterfactual: 'What result would make this investment no longer make sense now?',
      stakeholder: 'Who is affected if the company loses financial flexibility?',
      assumption: 'What future cash assumption supports this funding choice?',
      transfer: 'Which other investment depends on this financing decision?',
      prioritization: 'If cash fell next quarter, what would you check before cutting spending?'
    },
    stuck: 'Is the concern cash, debt, profit, or the timing of an investment?',
    direct: 'Imagine two plans earn the same profit, but one needs cash much earlier. Which risk should you compare before choosing?'
  },
  {
    label: 'Income statement', keywords: ['income statement'],
    questions: {
      evidence: 'Which cost line changed the most, and why does that matter?',
      'cause-and-effect': 'If gross profit falls, what should you question first?',
      'trade-off': 'Which expense feels necessary, and which feels optional?',
      counterfactual: 'What result would make you revisit this spending decision?',
      stakeholder: 'Who could be affected if you cut this expense too quickly?',
      assumption: 'What are you assuming this expense will achieve?',
      transfer: 'How does this cost connect to demand, quality, or cash?',
      prioritization: 'What line would you check before deciding sales alone are enough?'
    },
    stuck: 'Which part looks unusual: revenue, gross profit, or an expense?',
    direct: 'Imagine sales rise but gross profit falls. What two areas would you compare before calling the quarter successful?'
  },
  {
    label: 'Cash flow', keywords: ['cash flow'],
    questions: {
      evidence: 'Which payment leaves the business before customer money comes in?',
      'cause-and-effect': 'Why can a profitable plan still run into trouble here?',
      'trade-off': 'What decision would you revisit first if cash became tight?',
      counterfactual: 'What would warn you of a cash surprise before it happens?',
      stakeholder: 'Who could be affected if a cash shortage delays commitments?',
      assumption: 'What timing assumption is behind this plan?',
      transfer: 'How does this cash timing affect production or marketing?',
      prioritization: 'What cash pressure would you check first?'
    },
    stuck: 'Does cash leave before or after customers pay for purchases?',
    direct: 'Imagine a plan is profitable on paper but customer cash arrives later. What must be protected first?'
  },
  {
    label: 'Balance sheet', keywords: ['balance sheet'],
    questions: {
      evidence: 'What does this report tell you about the company’s strength right now?',
      'cause-and-effect': 'If liabilities rise, what should you check next?',
      'trade-off': 'What debt pressure are you willing to accept?',
      counterfactual: 'What result would show that the company has less flexibility next round?',
      stakeholder: 'Who could feel the downside if the company overextends itself?',
      assumption: 'What are you assuming about the value or usefulness of this asset?',
      transfer: 'How does this balance-sheet choice affect future financing?',
      prioritization: 'Which asset or liability would you inspect first?'
    },
    stuck: 'Is the important change in cash, inventory, assets, or debt?',
    direct: 'Imagine assets grow but cash falls and debt rises. What would you want to understand before calling that growth healthy?'
  },
  {
    label: 'Balanced scorecard', keywords: ['balanced scorecard'],
    questions: {
      evidence: 'Which measure matters most for your current strategy?',
      'cause-and-effect': 'If this score falls, what part of the plan could be weakening?',
      'trade-off': 'Are you winning on growth, efficiency, or balance?',
      counterfactual: 'What score would make you revise the plan next quarter?',
      stakeholder: 'Which stakeholder could be affected by this weaker score?',
      assumption: 'What does this metric assume is driving performance?',
      transfer: 'Which decision elsewhere could improve or harm this score?',
      prioritization: 'Which scorecard measure would you check first?'
    },
    stuck: 'Which is more unclear here: growth, efficiency, or a hidden weakness?',
    direct: 'Imagine growth improves but cash or quality worsens. What trade-off is the scorecard asking you to notice?'
  },
  {
    label: 'Detailed brand demand', keywords: ['detailed brand demand', 'demand by brand', 'brand demand'],
    questions: {
      evidence: 'Which brand is pulling the most demand, and why?',
      'cause-and-effect': 'What change could shift demand away from this brand?',
      'trade-off': 'What risk comes with pushing one brand harder than another?',
      counterfactual: 'What would show that a strong brand is losing its advantage?',
      stakeholder: 'Which customer segment could be underserved by this brand mix?',
      assumption: 'What are you assuming about customer preference by segment?',
      transfer: 'How should this demand evidence affect pricing or production?',
      prioritization: 'Where would you check first for missed demand or stock-outs?'
    },
    stuck: 'Can you first identify the brand or segment with the most unusual result?',
    direct: 'Imagine demand is high for one brand but stock is unavailable. What should you compare before simply producing more?'
  },
  {
    label: 'Strategic graphs', keywords: ['strategic graphs', 'strategic graph'],
    questions: {
      evidence: 'What trend is getting better, and what trend is getting worse?',
      'cause-and-effect': 'If this trend continues, what happens next?',
      'trade-off': 'What improvement may be hiding a weaker result elsewhere?',
      counterfactual: 'What change in the line would make you revise the plan?',
      stakeholder: 'Who could feel the downside of this negative trend?',
      assumption: 'What are you assuming will keep this trend moving?',
      transfer: 'Which decision might have caused the biggest swing?',
      prioritization: 'Which graph would you check before changing the plan?'
    },
    stuck: 'Start with one line: is it rising, falling, or flat?',
    direct: 'Imagine one graph rises while net income falls. What would you investigate before making a new decision?'
  },
  {
    label: 'Competitor profiles', keywords: ['competitor', 'competitors'],
    questions: {
      evidence: 'What does this competitor do better than you in this segment?',
      'cause-and-effect': 'If this competitor changes price, how could your demand be affected?',
      'trade-off': 'What could you lose by copying the competitor too quickly?',
      counterfactual: 'What would make your current advantage disappear?',
      stakeholder: 'Which customer preference is the competitor serving more effectively?',
      assumption: 'What are you assuming the competitor will do next?',
      transfer: 'How should this competitor signal affect your brand or sales plan?',
      prioritization: 'Which competitor gap would you investigate first?'
    },
    stuck: 'Look for one gap first: price, demand, or brand strength?',
    direct: 'Imagine a competitor cuts price but their product stays the same. What would you watch before copying them?'
  },
  {
    label: 'Brand profitability and judgment', keywords: ['brand profitability', 'brand judgment', 'product review'],
    questions: {
      evidence: 'Which brand is earning more, and why?',
      'cause-and-effect': 'If profit falls, which brand decision would you revisit first?',
      'trade-off': 'Are you choosing growth or margin with this brand?',
      counterfactual: 'What evidence would show this brand is no longer worth keeping?',
      stakeholder: 'Which customer expectation does this brand need to keep meeting?',
      assumption: 'What feature or promise are you assuming drives this brand’s value?',
      transfer: 'How does brand performance change your advertising or pricing plan?',
      prioritization: 'Which profitability signal would you inspect first?'
    },
    stuck: 'Can you first compare revenue, cost, and profit for one brand?',
    direct: 'Imagine a brand sells more units but earns less profit per unit. What trade-off would you examine?'
  },
  {
    label: 'Forecast lab', keywords: ['forecast', 'demand prediction'],
    questions: {
      evidence: 'What signal are you trusting most in this forecast?',
      'cause-and-effect': 'If the demand signal weakens, how should your production plan change?',
      'trade-off': 'What is the cost of choosing the high case instead of the conservative case?',
      counterfactual: 'What would make you shift from expected to conservative?',
      stakeholder: 'Who is affected if your forecast creates stock-outs or excess inventory?',
      assumption: 'Which assumption is the most fragile in your forecast?',
      transfer: 'Where else in the plan does this forecast assumption matter?',
      prioritization: 'What would you want to see before you lock the forecast?'
    },
    stuck: 'Which signal is easier to start with: previous demand, stock-outs, competitor action, or capacity?',
    direct: 'Imagine demand rises but factory capacity stays the same. Which risk would you compare before choosing a forecast case?'
  },
  {
    label: 'AI Socratic Boardroom', keywords: ['boardroom', 'leadership review', 'decision defense'],
    questions: {
      evidence: 'Which report best supports the decision you are most confident about?',
      'cause-and-effect': 'If this decision changes, what happens to demand, profit, or cash?',
      'trade-off': 'What risk did you accept that the board should notice?',
      counterfactual: 'What result would make you change your mind next quarter?',
      stakeholder: 'Who benefits from this choice, and who could bear the downside?',
      assumption: 'Which assumption needs the strongest justification?',
      transfer: 'Where else in your plan does this decision have an effect?',
      prioritization: 'Which number would you check first before defending the plan?'
    },
    stuck: 'Which part feels most uncertain: demand, cost, cash, capacity, or customer value?',
    direct: 'Imagine your preferred choice improves one outcome but makes another risk worse. Which report would help you compare those risks?'
  }
];

const DEFAULT_SET = BANK[BANK.length - 1];

export function getHelpMeDecideProfile(context: string, messages: Message[]) {
  const normalisedContext = context.toLowerCase();
  const matchesKeyword = (keyword: string) => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, 'i').test(normalisedContext);
  };
  const set = BANK.find((candidate) => candidate.keywords.some(matchesKeyword)) || DEFAULT_SET;
  const userMessages = messages.filter((message) => message.role === 'user');
  const latest = userMessages.at(-1)?.content.trim() || '';
  const lower = latest.toLowerCase();
  const wordCount = latest.split(/\s+/).filter(Boolean).length;
  const asksForAnswer = /just tell|give me (the )?answer|what should i (do|choose)|choose for me|best option/i.test(lower);
  const isStuck = wordCount < 7 || /don.?t know|not sure|no idea|unsure|stuck|help me|can.?t decide|cannot decide|confused/i.test(lower);
  const showsDepth = /\d|because|therefore|if |risk|margin|cash|demand|report|competitor|stock.?out|trade.?off/i.test(lower);

  let learnerPath: LearnerPath = 'opening';
  if (userMessages.length > 0) learnerPath = asksForAnswer ? 'direct-answer' : isStuck ? 'stuck' : showsDepth ? 'top-performer' : 'average';

  const moveByPath: Record<LearnerPath, HelpQuestionMove> = {
    opening: 'evidence',
    'top-performer': 'counterfactual',
    average: userMessages.length > 1 ? 'cause-and-effect' : 'evidence',
    stuck: 'prioritization',
    'direct-answer': 'trade-off'
  };
  const move = moveByPath[learnerPath];
  const question = learnerPath === 'stuck'
    ? `Let’s make it concrete. Imagine two plausible paths in ${set.label.toLowerCase()}: one improves the target result but increases a risk, while the other protects the risk but may limit growth. ${set.stuck}`
    : learnerPath === 'direct-answer'
      ? set.direct
      : set.questions[move];
  return { moduleLabel: set.label, learnerPath, move, question };
}

const RECOMMENDATIONS: Record<string, string> = {
  'Market offering and brand setup': 'Strategic Verdict: Your brand configuration matches segment expectations. Focus your R&D on high-impact ergonomics and durable carbon layups. Avoid feature bloat that raises unit cost above what the segment will pay.',
  'Pricing': 'Strategic Verdict: Your $3,000 price point for the Mercedes segment is strategically justified by your 77% market share and $1,600 unit margin. Maintain price discipline; do not drop price into Workhorse territory.',
  'Advertising and media placement': 'Strategic Verdict: For your Mercedes campaign, allocate 65% of your ad spend into targeted digital and premium cycling media. Emphasize craftsmanship claims to defend brand equity against competitor discounting.',
  'Demand forecasting and production capacity': 'Strategic Verdict: With 797 units of past demand, target 1,200 units of operating capacity in Q4. Pair this with an $80,000 investment in fixed capacity expansion so you can scale to 1,600+ units in Q5 without incurring overtime cost.',
  'Funding and financial risk': 'Strategic Verdict: Secure a $250,000 commercial loan to fund fixed asset expansion. Maintain a minimum $120,000 cash safety buffer at the end of Q4 to cushion against competitor price wars.',
  'Sales by brand and store demand': 'Strategic Verdict: Prioritize sales reps in Tokyo where Mercedes density is highest. Maintain 4 reps in Tokyo and 2 in Sydney to ensure adequate showroom conversion.',
  'Default': 'Strategic Verdict: Your plan is cohesive. Defend your high-margin Mercedes position, maintain disciplined production to prevent inventory holding costs, and ensure a healthy cash reserve before submitting.'
};

export function getHelpMeDecidePrompt(context: string, messages: Message[]) {
  const profile = getHelpMeDecideProfile(context, messages);
  const userMessages = messages.filter((message) => message.role === 'user');
  if (userMessages.length >= 2) {
    return `TEACHER-COACHING CONTEXT: This is the FINAL turn of the coaching session. Do NOT ask another question. Do NOT include any question marks. Synthesize the student's reasoning and deliver a concrete, actionable recommendation in 2 to 3 sentences for ${profile.moduleLabel}. Give a clear verdict on their strategy, state what numbers or decisions to lock in, and conclude the session.`;
  }
  return `TEACHER-COACHING CONTEXT (keep this invisible to the student):\n- Module: ${profile.moduleLabel}\n- Current learning move: ${profile.move}\n- Use this as the next learning target, but phrase it naturally and connect it to the student's last words: "${profile.question}"\n- Sound like a patient teacher who knows the student's work. Use short sentences. Acknowledge what they said, explain one business link, then ask one natural follow-up.\n- Build one step at a time toward a conclusion: decision, evidence, consequence, trade-off, then what would change the decision. Do not announce these steps or use labels such as “learner path,” “probe,” or “routing.”\n- Keep the chat easy to follow. Light Gen Z wording is okay when it fits, such as “Got you,” “That tracks,” or “Quick check.” Do not force slang. Never use slang in a formal boardroom or assessment response.\n- If the learner is stuck, use a small comparison or familiar game example. If they ask for the answer, compare both options and let them choose.\n- Never refuse with “I cannot make that decision.” Keep ownership with the student while showing them how to reason.`;
}

/** Local fallback written as a short teacher turn, not as a bare question. */
export function getHelpMeDecideResponse(context: string, messages: Message[]) {
  const profile = getHelpMeDecideProfile(context, messages);
  const userMessages = messages.filter((message) => message.role === 'user');
  if (!userMessages.length) {
    return `Let’s take this one step at a time. In ${profile.moduleLabel.toLowerCase()}, the useful starting point is to connect your choice to one result you can observe in the game. ${profile.question}`;
  }
  if (userMessages.length >= 2) {
    const rec = RECOMMENDATIONS[profile.moduleLabel] || RECOMMENDATIONS['Default'];
    return `Great job thinking through the trade-offs. Here is your concrete strategic recommendation:\n\n${rec}\n\nYou have completed this coaching session and have a clear action plan.`;
  }
  const latest = userMessages[userMessages.length - 1].content.toLowerCase();
  if (/don.?t know|not sure|no idea|unsure|stuck|help me|can.?t decide|cannot decide|confused/i.test(latest)) {
    return `That’s okay. Let’s compare two realistic outcomes instead of guessing. ${profile.question}`;
  }
  if (/just tell|give me (the )?answer|what should i (do|choose)|choose for me|best option/i.test(latest)) {
    return `Rather than guess for you, let’s compare what each choice would cause in the next quarter. ${profile.question}`;
  }
  const learnerPhrase = userMessages[userMessages.length - 1].content.trim().replace(/[.!?]+$/, '').slice(0, 90);
  return `That connects to the decision. You’re using “${learnerPhrase}” as a signal. Let’s test the other side. ${profile.question}`;
}
