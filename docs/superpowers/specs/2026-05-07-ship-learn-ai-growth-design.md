# Ship, Learn, AI, Growth Design

Created: 2026-05-07
Status: Accepted strategic design direction

## Load-Bearing Premise

ShiftWell's moat is not more features before users. The moat is a stable shift-worker sleep app, real pilot learning, evidence-backed algorithm improvement, and a controlled AI layer that improves trust without replacing deterministic scheduling logic too early.

## Recommendation

Use a gated sequence:

1. Ship the app.
2. Pilot with real users.
3. Harden bugs, UX, analytics, and algorithm behavior.
4. Add AI Gatekeeper v0 only after deterministic outputs and feedback loops are stable.
5. Evolve toward AI Brain v1 after the knowledgebase, pilot data, and safety controls exist.
6. Monetize after value and funnel instrumentation are proven.
7. Grow brand and institutional channels after claims are evidence-backed.
8. Expand to adjacent verticals only after domain-specific evidence review.

## Why This Shape

The existing codebase already contains substantial algorithm, adaptive, analytics, backend, and product surface area. The highest-risk failure is not lack of ambition; it is trying to add AI, monetization, institutional sales, and broad marketing before the app has users proving the core loop.

Therefore, AI scope belongs in future-facing project files now, with hard promotion gates. It should not be built as a broad autonomous agent until M0-M4 pass.

## Architecture

Near-term:

- Mobile app remains Expo/React Native.
- Algorithm remains deterministic and test covered.
- Pilot feedback, crash reporting, analytics, backend, and subscriptions are verified before scale.

Mid-term:

- AI Gatekeeper receives structured algorithm output and context.
- AI returns structured validation, confidence, rerun request, and explanation.
- Algorithm remains the only source of schedule generation.
- Knowledgebase provides cited claims and wording constraints.

Long-term:

- AI Brain can validate, explain, and coordinate recommendation review across user history, algorithm output, and research claims.
- Adjacent verticals get separate evidence maps and assumption reviews.

## Governing Documents

- [PHASE_ACCEPTANCE_GATES.md](../../dev/PHASE_ACCEPTANCE_GATES.md)
- [FUTURE_IDEAS.md](../../vision/FUTURE_IDEAS.md)
- [RESEARCH-KNOWLEDGEBASE-PROGRAM-2026-05-07.md](../../research/RESEARCH-KNOWLEDGEBASE-PROGRAM-2026-05-07.md)
- [Implementation Plan](../plans/2026-05-07-ship-learn-ai-growth.md)

## Milestone Model

M0 State Reconciliation:

- Establish runtime truth.
- Rank blockers.
- Produce evidence bundle.

M1 TestFlight MVP Cut:

- Build, install, and verify the app.
- Confirm instrumentation and core flows.

M2 Pilot Readiness:

- Prepare cohort, feedback, support, and UAT.

M3 Pilot Data Loop:

- Collect real activation, retention, feedback, crash, and trust data.

M4 Algorithm And Adaptive Validation:

- Prove deterministic outputs and adaptive changes are explainable and bounded.

M5 AI Gatekeeper v0:

- Add controlled AI validation and rerun requests behind feature flag.

M6 Paid Conversion:

- Verify subscription, entitlement, funnel, and ethical paywall.

M7 Public Growth:

- Use cited claims and measured channels.

M8 Enterprise/Residency/Hospital:

- Package institutional evidence, privacy, and outcomes.

M9 Adjacent Verticals:

- Expand only with separate evidence maps.

## Required Review Pattern

Each milestone must close with:

- Evidence bundle.
- Codex verification.
- Claude verification.
- Lead Engineer verification.
- Reviewer/subagent verification when used.

No phase advances without a documented pass.

## AI Promotion Gates

AI Gatekeeper can start only when:

- M0-M4 pass.
- Recommendation schema exists.
- Algorithm outputs are reproducible.
- Rerun triggers are defined.
- Knowledgebase claims exist for explanation grounding.
- Privacy and failure behavior are reviewed.

AI Brain can start only when:

- Gatekeeper pilot proves value.
- AI intervention improves trust, adherence, or bug triage.
- No serious safety, privacy, or hallucination regression is open.

## Research Promotion Gates

Sleep science claims can affect algorithm or public copy only when:

- Source is cited.
- Evidence quality is graded.
- Population and limitation are noted.
- Algorithm implication is reviewed.
- User-facing wording is approved.

Community app-building advice can affect workflow only when:

- It is tagged anecdotal unless backed by official docs or measured repo evidence.
- Official Apple/Expo/vendor docs win conflicts.

