import type { SimulationDecisions } from '@/lib/abis-engine';
import type { Difficulty, QuestionItem, SkillId } from './types';

type ItemSeed = Omit<QuestionItem, 'prompt'> & { prompt: (decisions: SimulationDecisions) => string };

const seed = (id: string, topic: QuestionItem['topic'], subSkill: SkillId, difficulty: Difficulty, scenarioComplexity: QuestionItem['scenarioComplexity'], prompt: ItemSeed['prompt'], contextTags: string[] = []): ItemSeed => ({
  id, topic, subSkill, difficulty, scenarioComplexity, prompt, contextTags
});

const ITEMS: ItemSeed[] = [
  seed('price-evidence-1', 'pricing-strategy', 'evidence', 1, 'single-variable', d => `Your price is $${d.pricing.toLocaleString()}. Which report result helped you choose it?`, ['price']),
  seed('price-fit-2', 'pricing-strategy', 'pricing', 2, 'linked-decisions', d => `How does a $${d.pricing.toLocaleString()} price fit the ${d.targetSegment} customer?`, ['price', 'segment']),
  seed('price-cause-2', 'pricing-strategy', 'causality', 2, 'linked-decisions', d => `How should your $${d.pricing.toLocaleString()} price affect demand or margin?`, ['price', 'demand']),
  seed('price-tradeoff-3', 'pricing-strategy', 'tradeoff', 3, 'linked-decisions', d => `What margin or demand trade-off are you accepting at a $${d.pricing.toLocaleString()} price?`, ['price', 'margin']),
  seed('price-risk-3', 'pricing-strategy', 'risk', 3, 'counterfactual', d => `If a competitor undercuts your $${d.pricing.toLocaleString()} price, which part of your plan is most exposed?`, ['price', 'competitor']),
  seed('price-revision-4', 'pricing-strategy', 'revision', 4, 'counterfactual', d => `What next-quarter result would make you revise the $${d.pricing.toLocaleString()} price?`, ['price', 'trigger']),

  seed('inventory-evidence-1', 'inventory-management', 'evidence', 1, 'single-variable', d => `Which demand result supports producing ${d.productionVolume.toLocaleString()} units?`, ['production']),
  seed('inventory-fit-2', 'inventory-management', 'inventory', 2, 'linked-decisions', d => `How does producing ${d.productionVolume.toLocaleString()} units match your expected demand?`, ['production', 'demand']),
  seed('inventory-cause-2', 'inventory-management', 'causality', 2, 'linked-decisions', d => `How would a forecast miss affect the cash tied up in ${d.productionVolume.toLocaleString()} units?`, ['production', 'cash']),
  seed('inventory-tradeoff-3', 'inventory-management', 'tradeoff', 3, 'linked-decisions', d => `What stock-out versus excess-inventory trade-off does your ${d.productionVolume.toLocaleString()}-unit plan make?`, ['production', 'inventory']),
  seed('inventory-risk-4', 'inventory-management', 'risk', 4, 'counterfactual', d => `If demand is 20% below forecast, how would your ${d.productionVolume.toLocaleString()}-unit plan affect cash?`, ['production', 'scenario']),
  seed('inventory-revision-4', 'inventory-management', 'revision', 4, 'counterfactual', () => 'Which early sales signal would trigger a production revision, and what would you change?', ['production', 'trigger']),

  seed('risk-loan-1', 'risk-analysis', 'risk', 1, 'single-variable', d => `What is the main risk created by the $${d.loanRequested.toLocaleString()} loan request?`, ['finance']),
  seed('risk-evidence-2', 'risk-analysis', 'evidence', 2, 'linked-decisions', d => `Which cash-flow result supports borrowing $${d.loanRequested.toLocaleString()}?`, ['finance', 'evidence']),
  seed('risk-marketing-2', 'risk-analysis', 'causality', 2, 'linked-decisions', d => `How should the $${d.marketingBudget.toLocaleString()} marketing budget translate into a measurable result?`, ['marketing']),
  seed('risk-rd-3', 'risk-analysis', 'tradeoff', 3, 'linked-decisions', d => `What near-term cash trade-off are you accepting with $${d.rdBudget.toLocaleString()} in R&D?`, ['rd', 'cash']),
  seed('risk-downside-4', 'risk-analysis', 'risk', 4, 'counterfactual', d => `If sales disappoint while you carry a $${d.loanRequested.toLocaleString()} loan, which commitment would you protect first?`, ['finance', 'scenario']),
  seed('risk-revision-5', 'risk-analysis', 'revision', 5, 'counterfactual', () => 'Name one measurable threshold that would make you reverse this capital-allocation plan.', ['finance', 'trigger']),

  seed('decision-choice-1', 'decision-quality', 'choice', 1, 'single-variable', d => `State the most important reason you chose the ${d.targetSegment} segment.`, ['segment']),
  seed('decision-evidence-2', 'decision-quality', 'evidence', 2, 'single-variable', () => 'Which single number in the reports is most important to your decision?', ['evidence']),
  seed('decision-link-3', 'decision-quality', 'causality', 3, 'linked-decisions', () => 'How does that evidence lead to the business result you expect?', ['causality']),
  seed('decision-tradeoff-3', 'decision-quality', 'tradeoff', 3, 'linked-decisions', () => 'What are you deliberately giving up to pursue this strategy?', ['tradeoff']),
  seed('decision-alternative-4', 'decision-quality', 'risk', 4, 'counterfactual', () => 'What credible alternative did you reject, and why is your chosen risk preferable?', ['alternative']),
  seed('decision-trigger-5', 'decision-quality', 'revision', 5, 'counterfactual', () => 'What evidence would prove your core assumption wrong, and what would you do next?', ['trigger'])
];

export function getQuestionBank(decisions: SimulationDecisions): QuestionItem[] {
  return ITEMS.map((item) => ({ ...item, prompt: item.prompt(decisions) }));
}
