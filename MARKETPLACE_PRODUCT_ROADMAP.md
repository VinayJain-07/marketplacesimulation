# Marketplace Simulations: Cutting-Edge Product Roadmap

**Prepared:** 11 August 2026  
**Purpose:** A practical product and implementation roadmap built from publicly available Marketplace material. It is designed to extend the platform's existing scientific assessment, simulation variety, faculty tooling, and accessibility work—not replace or duplicate them.

## Research boundary

This document reviews the public Marketplace product pages, assessment and AI pages, course-design guidance, accessibility documentation, integration information, and public research catalogue. It cannot claim to cover every item on the internet or non-public product, engineering, psychometric, client, or support material. Recommendations labelled **proposed** need validation with Marketplace product leaders, faculty, students, accessibility specialists, and the assessment team.

## 1. What Marketplace already owns

Marketplace is not a feature-comparable simulation vendor. Its public materials describe a portfolio of 30+ simulations spanning introductory, marketing, strategy, entrepreneurship, advanced, supply-chain, and microsimulation contexts. The deliberate range of complexity is a strategic asset: a single experience should not be forced on every class. [About Marketplace](https://www.marketplace-simulation.com/about-us/) · [Simulation options](https://www.marketplace-simulation.com/course-design-options/)

The platform already has four mutually reinforcing foundations:

1. **Authentic, connected decisions.** Learners operate cross-functional firms and see decisions flow into results. In strategy products, the Objective–Strategy–Tactics (OST) process is already integrated over successive rounds. [Strategy and Business Policy](https://www.marketplace-simulation.com/compare-our-business-simulations/strategy-and-business-policy-bikes/)
2. **Scientifically grounded measurement.** Career Readiness Reports use gameplay and performance over time to assess 24 competencies. The Assurance of Learning suite also includes the Balanced Scorecard, peer evaluations, customized objective learning assessments (COLA), knowledge checks, executive briefings, and rubrics. [Career Readiness Reports](https://www.marketplace-simulation.com/compare-our-business-simulations/career-readiness-reports/) · [Assurance of Learning](https://www.marketplace-simulation.com/assurance-of-learning/)
3. **Faculty scale.** Existing coaching and reporting already diagnose team issues, support debriefs, automate grading, and surface live performance. This is a large, valuable base—not a gap to be rebuilt. [Coaching Assistant](https://www.marketplace-simulation.com/blog/enhancements-coaching-assistant-tool/) · [Online-program resources](https://www.marketplace-simulation.com/online-resources/)
4. **AI and responsible management are underway.** The AI Coach handles routine questions; the Tactical Plan Reviewer already challenges assumptions and forecasts. Conscious Capitalism embeds stakeholder, environmental, and societal trade-offs in the competition itself. [AI Tools](https://www.marketplace-simulation.com/ai-tools/) · [Conscious Capitalism](https://www.marketplace-simulation.com/compare-our-business-simulations/conscious-capitalism/)

The opportunity is to make these strengths composable, visible, and demonstrably effective across levels—not to put every capability into every game.

## 2. Product thesis

**Marketplace becomes the configurable operating system for learning from consequential business decisions.**

The differentiator is not an AI chatbot. It is an evidence-backed learning loop:

`Situation → decision → selectively elicited reasoning → outcome → reflection → validated competency evidence → faculty action`

The phrase *selectively elicited* is central. Asking students to defend every decision would make the exercise onerous and distort gameplay. The platform should sample high-value moments sufficiently to assess reasoning quality, then connect that evidence to the measurement systems Marketplace has already invested in.

## 3. Priority additions

### A. Adaptive Socratic Checkpoints — highest priority

Evolve the Tactical Plan Reviewer into a configurable, event-driven checkpoint system.

**Student experience**

- Trigger only at meaningful moments: a major allocation change, a forecast far outside historical range, a decision inconsistent with OST/SWOT, a material risk signal, a turnaround after poor results, or a random audit sample.
- Ask 2–4 short questions, adapting to the student/team response: What changed? What evidence supports it? What alternative was rejected? What outcome and risk do you expect?
- Offer a choice of text, structured evidence selection, or an accessible voice response with transcript review.
- End with a concise reflection prompt after the result is known; do not disclose an answer or make the simulation less challenging.

**Levels of sophistication**

| Simulation level | Coach behavior | Assessment use |
|---|---|---|
| Introductory | 1 prompt; explains vocabulary; optional practice | Formative only |
| Intermediate | 2 prompts; asks for evidence and expected effect | Low-stakes reasoning indicator |
| Strategy / advanced | 3–4 adaptive prompts; tests alternative, trade-off, and uncertainty | Rubric-assisted evidence, instructor review available |

**Guardrail:** coach interventions must be rate-limited per round, configurable by faculty, and suppressible for accessibility accommodations or assessment conditions.

### B. Reasoning Evidence Service — the shared platform layer

Build a cross-simulation service that records a compact, privacy-conscious evidence object—not an exhaustive decision journal.

**Core record**

```text
checkpoint_id, game/version, scenario, round, decision-context snapshot,
trigger reason, learner/team, prompt version, response/transcript,
evidence referenced, rubric scores + confidence, human override,
subsequent outcome, reflection, accessibility mode, retention policy
```

This service should be separate from game rules. Each simulation exposes a small **capability registry** describing its decision types, available data, learning objectives, rubrics, and safe trigger thresholds. That supports the product strategy of different capabilities for different simulations while avoiding a bespoke implementation each time.

### C. Assessment calibration and validity workbench

Never present unvalidated generative-AI scores as scientific competency measurement. Add a workflow for the assessment team:

- versioned rubric definitions mapped to existing 24 metrics, COLA constructs, OST, and course learning outcomes;
- blind double-scoring samples by trained human raters;
- agreement, subgroup, calibration-drift, and missing-data monitoring;
- score confidence and reason codes; human review queues for low confidence or consequential grading;
- release gates: a construct cannot affect grades or Career Readiness reporting until validation criteria are met.

This is the bridge between an engaging AI interaction and the multi-year scientific investment in competency assessment.

### D. Faculty intelligence layer — augment, do not overwhelm

Extend the existing Coaching Assistant with a *Reasoning Signals* view:

- cohort heat map: where reasoning is strong, unsupported, or uncertain;
- team cards: top one or two coaching opportunities, evidence snippets, and discussion questions;
- intervention recommendations tied to learning objectives, not generic AI advice;
- review controls: dismiss, correct, annotate, and send a private reflection assignment;
- a one-page debrief pack, generated from verified game data and faculty-approved summaries.

Do not create a separate analytics destination. Surface these signals inside the reports and workflows faculty already use.

### E. Learning pathway and portability

**Proposed:** a learner-owned, institution-governed *Capability Portfolio* that links evidence across selected Marketplace experiences. It should show demonstrated growth over time but never overstate precision or become a recruiter-facing ranking by default.

- Programs choose which simulations and constructs participate.
- Students see evidence, feedback, and progress; institutions control sharing and retention.
- Career language can build on current Career Readiness Reports.
- Cross-course comparisons require common calibrated rubrics, equivalence studies, and informed consent.

### F. AI literacy by doing

Add an optional **AI collaboration mode**. Students may use an in-product AI workspace to explore analysis, but must label AI assistance, inspect assumptions, and explain what they accepted, changed, or rejected. The Socratic Checkpoint can then ask about verification rather than punish responsible AI use. This directly supports Marketplace’s stated aim: AI should promote deeper thinking rather than shortcuts. [AI Tools](https://www.marketplace-simulation.com/ai-tools/)

### G. Institutional integration and exports

Marketplace already supports LTI 1.1, LTI 1.3, and LTI Advantage, with grade transfer currently centered on a scalar final grade. **Proposed:** add standards-based, permissioned exports for outcome evidence, rubric summaries, and course-level improvement reports—while keeping grade passback simple. [LMS Integration](https://www.marketplace-simulation.com/lms-integration/)

## 4. Technical architecture

```text
Game events + decision data
        ↓
Capability registry / trigger rules ──→ Checkpoint orchestrator
                                           ↓
                                   AI dialogue service
                                           ↓
  Existing reports / COLA / rubrics ← Evidence store → Calibration workbench
                                           ↓
                           Student reflection + Faculty reasoning signals
```

Implementation principles:

- **Retrieval first:** responses must be grounded in the specific game state, help content, course configuration, and permitted business concepts.
- **No hidden scoring:** show students what is being assessed, how AI was used, and how to request review where a score matters.
- **Separation of duties:** simulation calculation, AI generation, and measurement scoring should be independently versioned and auditable.
- **Resilience:** every checkpoint has a non-AI fallback—structured prompts, rubric, and manual instructor pathway.
- **Accessibility by design:** keyboard-first controls, clear focus management, captions/transcripts, non-colour status cues, screen-reader labels, and equivalent timing. Marketplace is pursuing WCAG 2.2 AA while noting instructor-dashboard and responsive improvements in progress; new work must not widen that gap. [Accessibility statement](https://www.marketplace-simulation.com/accessibility-statement/)
- **Privacy/security:** data minimization; course/institution retention controls; de-identification for model evaluation; encryption; access logs; configurable regional processing; no training on student responses without explicit institutional approval.

## 5. Delivery roadmap

### Phase 0 — discovery and proof (0–12 weeks)

- Select one intermediate and one advanced simulation with established faculty champions.
- Define 3–5 checkpoint triggers and one or two reasoning constructs per game.
- Conduct workflow studies: student time burden, instructor interpretation, accessibility, and team/individual attribution.
- Form a measurement council: psychometrics, pedagogy, game design, faculty, accessibility, privacy, and engineering.
- Success gate: median checkpoint time under 90 seconds; no measurable decline in completion or learner confidence; acceptable human–rubric agreement.

### Phase 1 — controlled pilot (3–6 months)

- Ship Adaptive Socratic Checkpoints behind course-level configuration.
- Capture auditable evidence objects and faculty feedback actions.
- Build the calibration workbench and one Reasoning Signals report inside the existing coaching workflow.
- Run an A/B or stepped-wedge study measuring learning, faculty workload, fairness, and behavior change.
- Keep all AI-generated scores formative during this phase.

### Phase 2 — validated scale (6–12 months)

- Expand through the capability registry to 3–5 selected simulations, including Conscious Capitalism where appropriate.
- Release rubric-assisted grading only for constructs meeting validation gates.
- Add structured AoL exports, cohort trend reports, and AI-assistance transparency.
- Localize prompt/rubric variants through professional review rather than direct translation alone.

### Phase 3 — learning pathways (12–24 months)

- Introduce the opt-in Capability Portfolio for programs using multiple Marketplace products.
- Publish a technical/measurement transparency report and research results.
- Offer implementation templates by course level, modality, and learning-goal bundle.

## 6. Measures of success

| Area | Leading indicator | Outcome indicator |
|---|---|---|
| Learning | completed reflections; evidence quality; revision after feedback | calibrated gain in targeted constructs |
| Faculty value | time to identify a coaching priority; recommendation acceptance | reduced preparation burden; adoption/renewal |
| Product quality | intervention latency; grounded-response rate; accessibility defect rate | completion, satisfaction, support contacts |
| Measurement integrity | human–AI agreement; drift; subgroup parity | approved validity evidence; safe assessment use |
| Commercial value | pilot-to-paid conversion; capability attach rate | retention and institutional expansion |

## 7. Risks and decisions to resolve first

1. **Team versus individual evidence:** define when a response represents team reasoning and when individual assessment is appropriate.
2. **Scientific claims:** decide the validation threshold before using AI-derived data in Career Readiness Reports, grades, or accreditation reporting.
3. **Faculty agency:** instructors must set checkpoint depth, grading use, and AI mode; default to formative use.
4. **Learner burden:** measure and cap cognitive overhead per round.
5. **Data governance:** obtain legal and institutional guidance before cross-course portfolios or model improvement using learner data.
6. **Portfolio fit:** resist a universal dashboard. The core strategy is modular capability deployment matched to course goals and simulation complexity.

## Recommended immediate decision

Authorize a 12-week, non-graded pilot of **Adaptive Socratic Checkpoints** in one appropriate advanced/strategy simulation. Its deliverables should be: validated trigger candidates, a minimal evidence schema, faculty workflow prototype, accessibility review, measurement plan, and a go/no-go recommendation for scaled development.

