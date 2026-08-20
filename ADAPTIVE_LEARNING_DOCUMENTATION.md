# ABIS Adaptive Learning and Student Outcome Judgement

## Purpose

The adaptive learning layer in ABIS is designed to do two jobs at the same time:

1. coach the student during the conversation
2. judge the quality of the student's reasoning as an assessment outcome

This means the module is not only a chat helper. It is also an assessment engine that watches each learner response, scores reasoning signals, assigns an outcome band, and decides what the next question should target.

## Where it runs

- `lib/adaptive-learning.ts`
  This contains the logic for scoring, support-level selection, checkpoints, and teacher-facing outcome judgement.
- `app/api/boardroom/route.ts`
  This injects the adaptive policy into the live AI system prompt before each response.
- `app/page.tsx`
  This renders the backend transparency layer and shows the live score, next focus, and outcome judgement.

## What the module evaluates

The current version checks for five reasoning signals in each student answer:

1. `choice`
   Can the student clearly state the decision they made?
2. `evidence`
   Can the student support the decision with a number, report, or market signal?
3. `causality`
   Can the student explain why the evidence should lead to the claimed result?
4. `tradeoff`
   Can the student identify a risk, downside, or sacrifice in the decision?
5. `revision`
   Can the student name a condition that would make them revise the decision?

These are intentionally visible and transparent so that the teacher can understand why a score changed.

## How the score works

The backend panel shows a score out of 100. It is based on weighted evidence of the five signals:

| Signal | Weight |
|---|---:|
| Choice | 20 |
| Evidence | 25 |
| Causality | 20 |
| Trade-off | 20 |
| Revision trigger | 15 |

The current implementation detects whether each signal has appeared in the learner's responses. When a signal is demonstrated, its weighting contributes to the transparent competency score.

This is useful because it tells the student and teacher exactly which part of good reasoning is missing.

## How the adaptive coaching works

After each student response, the engine does this sequence:

1. read the learner response
2. detect the five reasoning signals
3. update the live score
4. identify the weakest or missing signal
5. choose the next support level
6. generate the next question to target that missing skill

The support levels are:

- `guided`
  Use short, concrete prompts and give the student a number or example to refer to
- `supported`
  Ask one focused why/how question that links evidence to the student's decision
- `challenge`
  Ask an executive-level challenge question about trade-offs, alternatives, or revision triggers

## Mid-session checkpoint logic

The engine runs a checkpoint after every third learner answer:

- 3rd response
- 6th response
- 9th response

At the checkpoint, the coach should:

1. state one demonstrated strength
2. state one next target
3. ask one question that isolates the missing reasoning skill

This makes the session feel progressive rather than repetitive.

## How student outcomes are judged

The module now converts the live score into a teacher-facing outcome band:

| Band | Meaning |
|---|---|
| `emerging` | The student needs guided support to state and justify decisions |
| `developing` | The student shows partial reasoning but cannot yet sustain a full justification chain |
| `proficient` | The student can justify decisions with reasonable clarity but still needs stronger executive challenge reasoning |
| `advanced` | The student can defend decisions with evidence, trade-offs, and revision triggers |

The outcome judgement also produces:

- a readiness statement
- a teacher judgement
- the strengths already demonstrated
- the next instructional move

This makes the system usable for assessment, not just tutoring.

## Example of the judgement flow

If a student says:

> "We chose the traveler segment because demand data was rising, but the margin is lower, so we will review the decision if sales fall next quarter."

The engine can detect:

- choice
- evidence
- causality
- trade-off
- revision

That student would likely score highly and be judged `proficient` or `advanced`, depending on consistency across the session.

If a student says:

> "We picked this because it looked best."

The engine would likely detect only `choice`, leaving evidence, causality, trade-off, and revision still missing. That would place the learner closer to `emerging`.

## What this means for teachers

Teachers can use the adaptive layer in two ways:

1. formative use
   Watch the live reasoning score and backend signals while the student is still learning
2. summative use
   Use the final outcome band and judgement as a structured indicator of how well the student defended the business decision

## Current limitation

The current scoring logic is rule-based and pattern-based. That makes it transparent and easy to audit, but it is not yet a full semantic evaluator.

In practice, that means:

- it is strong for visible reasoning cues
- it is weaker when a student shows strong reasoning using unusual wording
- it should support teacher judgement, not silently replace it

## Recommended next upgrade

If ABIS should become a stronger formal assessment system, the next layer should add:

1. rubric-aligned semantic evaluation
   Judge whether the student actually justified the decision well, not only whether a keyword appeared
2. outcome-specific rubrics
   Separate rubrics for marketing, finance, forecasting, stakeholder reasoning, and oral defense
3. evidence quality scoring
   Distinguish weak evidence from strong evidence
4. contradiction checks
   Flag answers where the student states evidence that does not match their decision
5. session summary report
   Produce a teacher-ready final judgement with score, band, strengths, gaps, and recommended intervention

## Suggested teacher-facing interpretation

- `0-34`
  Outcome not yet secure. Student needs guided support.
- `35-64`
  Outcome partially secure. Student shows developing reasoning.
- `65-84`
  Outcome mostly secure. Student is proficient but can still be challenged further.
- `85-100`
  Outcome strongly secure. Student is ready for advanced executive questioning.

## Bottom line

Inside ABIS, the adaptive learning module should work as:

- a live reasoning detector
- a dynamic question router
- a transparent score engine
- a student outcome judgement layer
- a teacher support tool for both coaching and assessment

That means it can evaluate student performance during the conversation and also help judge the quality of the final learning outcome.

## Contextual-bandit implementation

The application now includes a warm-start contextual-bandit path alongside the transparent reasoning rubric:

- `lib/personalization/telemetry.ts` converts question presentation, response time, answer quality, hints, and simulation state into replayable events.
- `lib/personalization/player-model.ts` maintains difficulty-aware Bayesian Knowledge Tracing estimates for pricing, inventory, risk, evidence, causality, trade-offs, and revision.
- `lib/personalization/policy.ts` scores eligible actions by predicted success, weak-skill value, and an exploration bonus. Its success target is 72.5%, the midpoint of the intended 70–75% challenge zone.
- `lib/personalization/question-bank.ts` supplies 24 tagged, simulation-aware items across pricing strategy, inventory management, risk analysis, and decision quality.
- `POST /api/adaptive/next-question` exposes low-overhead policy serving independently of the LLM provider.

The Boardroom route uses the same policy directly, adds the selected action to the model prompt, and returns the decision and player state for auditability. The client attaches action metadata and response timing to messages so the complete state can be reconstructed without a database during the MVP. A production deployment can persist the same telemetry contract in PostgreSQL and cache the current player state in Redis without changing the policy interface.

## Live Q&A alignment and redirection

Live provider responses now follow the probe sequence defined in `AI_BOARDROOM_DEMO_PROGRAM.md` and `HELP_ME_DECIDE_QUESTION_BANK.md`: locate a report, name one number or signal, explain its consequence, identify the trade-off, then set a revision trigger. The server prompt explicitly keeps the conversation tied to the marketplace simulation. If a learner asks an unrelated question, asks for the direct answer, or gets stuck, the coach acknowledges that briefly and returns to the same decision with a smaller probe. A response-level guard rejects provider output that has no marketplace-game vocabulary, allowing the local selected probe to keep the session on-task.

The supplied Marketplace game manual is now the grounding source in `lib/personalization/game-context.ts`. It supplies the direct-sales business context, Workhorse/Traveler/Mercedes segmentation, multi-quarter adjustment loop, price-demand-margin relationships, stock-out and inventory consequences, profit-versus-cash distinction, ABC analysis, and Balanced Scorecard dimensions. The coach is instructed to ask for missing report values rather than fabricate them.
