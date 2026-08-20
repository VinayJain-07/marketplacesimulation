import type { PolicyDecision } from './types';

/** Grounding distilled from the supplied Marketplace game manual. */
export const MARKETPLACE_RULES = [
  'Marketplace is a multi-quarter business simulation for a business-to-business microcomputer company using direct sales offices.',
  'The core loop is: discover customer needs, segment and target customers, design an offer, price it, advertise it, staff distribution, produce to demand, collect cash, review results, and adjust next quarter.',
  'The main segments are Workhorse, Traveler, and Mercedes. Use only segments present in the student\'s recorded decisions; never invent a chosen segment.',
  'Every decision has trade-offs across functions. Price affects demand and margin; production affects stock-outs, inventory, capacity, and cash; advertising and sales force create demand that must be serviceable.',
  'Financial reasoning must distinguish profit from cash. Use pro forma cash flow, income statement, balance sheet, debt capacity, and emergency-loan risk when relevant.',
  'Activity Based Costing (ABC) is used to evaluate the contribution of each brand and sales office by allocating demand-creating and production costs.',
  'The Balanced Scorecard evaluates multiple dimensions, including financial performance, market performance, marketing effectiveness, investment in the future, people, assets, manufacturing productivity, financial risk, and reputation.'
].join('\n- ');

export function getGameContextPrompt(decision: PolicyDecision) {
  const probeDomain = decision.selected.topic === 'pricing-strategy'
    ? 'market research, target-segment needs, price elasticity, competitive price, rebate, demand, and contribution margin'
    : decision.selected.topic === 'inventory-management'
      ? 'demand forecast, production schedule, operating capacity, maximum inventory, stock-outs, satisfied demand, and cash tied up in inventory'
      : decision.selected.topic === 'risk-analysis'
        ? 'pro forma cash flow, income statement, balance sheet, ABC contribution, debt capacity, emergency-loan risk, and Balanced Scorecard performance'
        : 'target segment, market demand, customer value, competitive benchmark, cross-functional trade-offs, and next-quarter adjustment';

  return `\n\nMARKETPLACE GAME CONTEXT (from the game manual):\n- ${MARKETPLACE_RULES}\n- This probe must stay within: ${probeDomain}.\n- Use the student\'s actual recorded decisions and visible reports only. If a required report value is not supplied, ask the student to locate it; do not invent a number.\n- The learning goal is defensible decision-making under uncertainty: connect evidence to a choice, consequence, trade-off, and next-quarter adjustment.`;
}

