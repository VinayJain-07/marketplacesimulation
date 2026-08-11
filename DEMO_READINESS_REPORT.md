# AI Boardroom Intelligence System — Demo Readiness Report

## Executive summary

The product demonstrates a business simulation that teaches students to make, explain, and improve decisions—not simply chase a score. The central learning loop is: inspect evidence, make a decision, predict an outcome, defend the reasoning, and revise when the evidence changes.

For the demo, present the **AI Socratic Decision Defense** as the learning centerpiece and the proposed **AI Forecast Analyst** as the simplest way to turn demand data into a testable forecast. The goal is not to give students the answer. It is to make their thinking visible, then give only the smallest useful support.

## Demo message

> “Students do not have to justify every click. At selected decision points, the system samples their thinking. The AI asks one question about a real choice the student made, listens for evidence and trade-offs, and gives smaller prompts only when the student needs help. Faculty can see the quality of reasoning without creating an overwhelming written workload.”

## Recommended Forecast Lab redesign: AI Forecast Analyst

The range-and-confidence form remains a useful teaching scaffold, but it is no longer the primary experience. The first view now starts with a three-step, interactive Forecast Mission:

**Button:** `Test my forecast — 25 credits`

The student first chooses two evidence signals, commits to a conservative, expected, or stretch demand case, and selects one market surprise to test. The analyst reads only simulation evidence already available: previous demand by brand, stock-outs, current price and rebate, market share, brand/segment fit, marketing investment, operating capacity, and relevant competitor movement. It returns one compact forecast debrief:

| Output | Student sees | Why it teaches without adding complexity |
|---|---|---|
| Expected demand | One recommended total and split by brand | Gives a usable starting point, not an opaque answer |
| Confidence band | Conservative / expected / stretch | Shows uncertainty is normal and decision-relevant |
| Three evidence signals | “Nomad had 23 stock-outs”; “price is …”; “capacity is …” | Makes the source of the forecast visible |
| One risk | “A competitor price cut could reduce demand” | Builds anticipatory thinking |
| One check-back trigger | “Revisit if Nomad demand is below 340” | Teaches students to revise responsibly |
| One Socratic question | “Which signal do you trust least, and why?” | Keeps ownership with the learner |

After the student chooses **Use expected case**, the normal demand inputs populate automatically. An optional **Explore uncertainty** link opens the existing low / expected / high range controls for advanced students and instructors. This makes the first use simple while preserving richer learning when wanted.

### Suggested AI Forecast Analyst sample output

> **Expected demand: 845 units** — 455 Mirai Core and 390 Mirai Nomad. Confidence: moderate.
>
> **Why:** Nomad’s prior demand was 367, but 23 stock-outs suggest some unmet demand. Your current capacity covers the expected case; it also covers a modest upside scenario.
>
> **Watch:** If Nomad demand is below 340 or a competitor undercuts price, revisit production. Which of those two risks concerns you more?

## Demo route

1. Open **Quarter 4 Action Plan** and explain the guided sequence: performance → market → plan → marketing → production → finance.
2. Open **Manufacturing Plan** and introduce the proposed one-button AI Forecast Analyst.
3. Open **AI Socratic Boardroom → Decision Defense**.
4. Explain that the coach selects one connected decision already made by the student—such as segment, price, and production—and asks one deep question.
5. Demonstrate either the topper or average-student path below. Then demonstrate the stuck-student path to show the adaptive support.
6. Switch to **Leadership Review** and explain that it is intentionally different: it is a formal stakeholder council, not a voice quiz.
7. Close with **Final Check**, which exposes whether the plan is complete and whether the student has recorded a rationale.

## Sample Decision Defense conversations

### Opening question used in the demo

> “You chose the Mercedes segment, a $3,000 price, and 1,560 production units. What evidence makes those choices fit together?”

### Scenario A — Top-performing student

**Student says:**

> “Mercedes customers value a premium offer, so the $3,000 price supports the positioning. We have enough capacity for 1,560 units, and I would monitor demand because a premium price may limit volume if competitors discount.”

**Coach says:**

> “That links positioning, capacity, and risk well. What next-quarter result would make you revise the price or production plan?”

**Student says:**

> “If Mercedes demand falls below forecast or the margin drops after rebates, I would reduce production and review price.”

**Coach concludes:**

> “You used evidence to connect a decision to its consequence and named a clear revision trigger. Your next step is to quantify the demand threshold before locking the plan.”

**What faculty learn:** The student can connect evidence, causal reasoning, trade-off, and revision trigger without prompting.

### Scenario B — Average student

**Student says:**

> “We picked Mercedes because it is a good segment and we wanted to sell more.”

**Coach says:**

> “Which previous-quarter result influenced that decision most?”

**Student says:**

> “The demand report showed we were selling well.”

**Coach says:**

> “What one number from the reports best supports your decision?”

**Student says:**

> “Demand was 797 total units, and Nomad had stock-outs.”

**Coach says:**

> “If demand rises or falls from that level, what happens to your production or profit?”

**Student says:**

> “If it rises we can lose sales if we do not make enough; if it falls we could hold too much inventory.”

**Coach says:**

> “What next-quarter result would make you revise the decision?”

**What faculty learn:** The learner began with a vague answer but reached causal reasoning with small, targeted prompts.

### Scenario C — Student is stuck or says “I don’t know”

**Student says:**

> “I don’t know.”

**Coach says:**

> “That is okay. Which report did you look at most recently: demand, sales, profit, or cash flow?”

**Student says:**

> “Demand.”

**Coach says:**

> “Look at the demand report. Did a brand have a stock-out or unusually high demand?”

**Student says:**

> “Nomad had stock-outs.”

**Coach says:**

> “What does a stock-out suggest about the number of units you may need next quarter?”

**Student says:**

> “We may need more so we do not miss sales.”

**What faculty learn:** The system does not punish uncertainty or give the answer. It reduces cognitive load, directs attention to evidence, and restores the student’s ability to reason.

### Scenario D — Incorrect but confident student

**Student says:**

> “We should always produce as much as possible because higher production means higher profit.”

**Coach says:**

> “What cost or risk appears when production is higher than actual demand?”

**Student says:**

> “Inventory holding cost and unused capacity.”

**Coach says:**

> “How would you use the demand forecast to balance missed sales against that inventory risk?”

**What faculty learn:** The coach challenges faulty reasoning through a concrete consequence rather than correcting or lecturing.

## Sample questions for each major application scenario

| Area | Demo question | Strong student response | Smaller prompt if stuck |
|---|---|---|---|
| Market share | “Why did your target segment gain or lose share?” | “Our offer and message matched the segment; the risk is competitor response.” | “Which segment’s share changed most?” |
| Sales | “What does lost sales due to stock-outs change in your next plan?” | “It shows unmet demand, so I need enough production while checking inventory risk.” | “Did customers want more units than you could sell?” |
| Income statement | “Which expense most needs to earn its place next quarter?” | “R&D/advertising must increase demand, margin, or long-term fit.” | “Which expense is largest?” |
| Cash flow | “Can the company fund this plan at the time it needs to?” | “Cash timing can require equity or debt even when the strategy is attractive.” | “Does cash go up or down after the planned investments?” |
| Balance sheet | “What does this choice do to financial flexibility?” | “It changes cash, inventory, debt, and the ability to absorb a weak quarter.” | “Which asset or debt line changes first?” |
| Brand design | “Which feature best proves the promise to the target customer?” | “The feature directly matches the target’s stated need; it has a cost trade-off.” | “What customer need does this feature address?” |
| Advertising | “Why is this message credible for the chosen segment?” | “The claim is supported by the product and aimed at the segment’s priority.” | “Which claim would the target customer care about most?” |
| Capacity | “What is the downside of planning only for the optimistic case?” | “Stock-outs versus excess inventory; I need a range and a monitoring trigger.” | “What happens if demand is lower than expected?” |
| Finance | “Why is this mix of equity and debt appropriate?” | “Equity protects cash flexibility; debt adds repayment risk and must be justified.” | “What has to be repaid even if demand falls?” |
| Stakeholder review | “Who benefits and who bears risk from this decision?” | “Customers gain value, but employees/community/environment may face a cost that needs mitigation.” | “Name one group affected besides shareholders.” |

## How the additions support different learners

| Learner | What happens | Educational benefit |
|---|---|---|
| Top performer | One deep question, then a revision-trigger challenge | Rewards synthesis and pushes precision without busywork |
| Average performer | Coach asks for evidence, number, consequence, and trade-off one at a time | Turns partial knowledge into a defensible explanation |
| Stuck learner | Coach narrows the task to a report, a signal, then a simple implication | Reduces anxiety and working-memory overload while preserving agency |
| Misconception-prone learner | Coach asks about the consequence that conflicts with the misconception | Promotes productive self-correction instead of answer copying |
| Instructor | Receives sampled evidence of reasoning quality rather than every decision justification | Makes competency assessment scalable and less burdensome |

## Feature readiness and demo checks

| Feature | Current status | Demo check |
|---|---|---|
| Reports: market share, sales, income statement, cash flow, balance sheet | Available | Open each; confirm tables and contextual `Help me decide` entry point display |
| Decision workspaces: marketing, manufacturing, finance | Available | Change an input and confirm the linked totals / capacity / pro forma signal update |
| AI decision coach | Available, 25-credit contextual help flow | Open from a report or decision workspace; ask “What should I check first?” |
| Decision Defense | Available | Select it in AI Socratic Boardroom; confirm the saved segment, price, production, and marketing values display |
| Voice capture | Browser-dependent | In the demo browser, verify microphone permission and test one spoken answer; use typed input as fallback |
| Leadership Review | Available and visually distinct | Select it; show the board mandate, four stakeholder lenses, phase chip, and council layout |
| AI Forecast Mission + Forecast Lab | Available | Choose evidence, choose a demand case, test a market surprise, then show uncertainty controls as the optional advanced view |
| Final Check | Available | Confirm incomplete rationales and constraint violations are clearly surfaced |

## Known demo safeguards

- Do not promise that the AI predicts the exact market outcome. It provides a transparent, evidence-based forecast hypothesis.
- Keep a typed-response fallback for voice assessment in case browser microphone permission is unavailable.
- Explain the 25-credit help action as a deliberate learning transaction: students spend a small in-game resource to receive a question, evidence check, or scenario—not a correct answer.
- If using a live LLM key, test it before the presentation. The local mock fallback still demonstrates the intended Socratic flow when no key is configured.

## Closing statement for the presentation

> “This platform makes decision quality observable. A strong student is challenged to be more precise; an average student is guided from a vague answer to evidence; and a stuck student gets a smaller doorway into the same thinking. The learning standard stays high, but the path adapts to the learner.”
