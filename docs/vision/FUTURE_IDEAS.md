# ShiftWell Future Ideas

Created: 2026-05-07
Owner: Sim / Lead Engineer
Status: Idea bank, not implementation authorization

## Purpose

This file holds ideas that are important to the long-term ShiftWell vision but should not distract from the near-term ship path. Ideas move from here into an executable plan only after they pass the project utility gate, research standard, phase acceptance gate, and explicit lead approval.

The current operating priority is:

1. Ship a stable app to TestFlight.
2. Pilot with real shift workers.
3. Improve bugs, UX, adherence, and algorithm output using observed data.
4. Add AI as a controlled gate between deterministic algorithm outputs and the user.
5. Expand AI only after real data proves the app needs that layer.

## AI Scope

### AI Gatekeeper v0

Goal: Add an intelligent review layer between the circadian algorithm and the app/user without letting AI own the schedule.

Role:

- Validate algorithm recommendations before display.
- Detect contradictions, stale data, missing inputs, unsafe confidence, or poor fit.
- Request deterministic reruns when new inputs surface.
- Explain why a recommendation changed in plain language.
- Preserve algorithm provenance and evidence links.

Allowed inputs:

- Latest shift schedule.
- Sleep logs and adherence history.
- Apple Health sleep summaries when permissioned.
- User feedback such as poor sleep, caffeine timing, nap, illness, travel, or family disruption.
- Environmental context only when explicitly captured or permissioned.

Allowed outputs:

- Structured validation result.
- Rerun request with machine-readable reason.
- Confidence downgrade.
- User-facing explanation.
- Evidence/provenance pointer.

Not allowed in v0:

- AI-generated sleep plans that bypass deterministic algorithm logic.
- Medical diagnosis.
- Medication or supplement dosing advice.
- Autonomous changes to paid, privacy, account, or notification settings.

Build trigger:

- At least one pilot cohort has generated enough contradictory or stale recommendation examples to justify the layer.
- Algorithm output schema is stable and test covered.
- Data provenance is available for each recommendation.
- Acceptance gates in [PHASE_ACCEPTANCE_GATES.md](../dev/PHASE_ACCEPTANCE_GATES.md) pass through M4.

### AI Brain v1

Goal: Evolve from a validation gate into a recommendation intelligence layer that can parse, validate, and explain the full recommendation stream.

Role:

- Compare algorithm output against sleep science knowledgebase claims.
- Validate recommendation consistency across days.
- Track user response patterns.
- Identify when the deterministic model needs updated inputs.
- Generate clinician-grade but nonclinical explanation summaries.

Build trigger:

- AI Gatekeeper v0 has shipped to pilots without safety, privacy, or trust regressions.
- Evidence shows a material user or algorithm improvement from AI intervention.
- Atomic sleep knowledgebase exists with claim IDs, source quality, and contraindication notes.
- Lead Engineer, Codex, Claude, and reviewer agents sign off on the evidence bundle.

### Agent-To-Algorithm Two-Way Channel

Core loop:

1. New data arrives.
2. Agent checks whether the current recommendation is stale.
3. Agent requests deterministic algorithm rerun when criteria match.
4. Algorithm returns revised output with provenance.
5. Agent validates and explains the delta.
6. User sees only the final checked recommendation.

Example rerun triggers:

- New shift appears or shift time changes.
- Apple Health reports short sleep, disrupted sleep, or major wake-time drift.
- User reports poor sleep or failed adherence.
- Travel or time zone changes.
- Meal/caffeine/light exposure data materially conflicts with the plan.
- Safety confidence falls below defined threshold.

Pass condition before shipping:

- Every agent-triggered rerun has a logged input delta, reason code, algorithm version, output hash, validation result, and user-visible explanation.

## Product Expansion Ideas

### Pilot And User Learning

Ideas:

- ED resident pilot group.
- Nursing shift worker pilot group.
- Night-float resident cohort.
- Rotating schedule cohort.
- Travel nurse cohort.

Deferral rule:

- Do not optimize for broad marketing before at least one pilot has enough retention, trust, and qualitative feedback to show that the app solves a real repeated pain.

### Monetization

Ideas:

- Consumer subscription.
- Resident/fellow discounted plan.
- Hospital or department license.
- Nursing unit benefit.
- Employer wellness contract.
- Pilot program as paid research/implementation package.

Deferral rule:

- Do not tune pricing, paywall copy, or growth funnels before baseline activation, retention, and trust metrics are instrumented through PostHog and subscriptions are verified through RevenueCat sandbox.

### Brand And Growth

Ideas:

- Instagram/Reels education clips.
- Physician influencer partnerships.
- Figs collaboration.
- Magazine, article, newspaper, and podcast outreach.
- Residency lecture deck.
- Emergency department program email campaign.
- Sleep hygiene guide lead magnet.

Deferral rule:

- Public claims must be citation-backed, restrained, and aligned with [BRAND-PRINCIPLES.md](../design/BRAND-PRINCIPLES.md). No wellness overclaiming, fake urgency, fake testimonials, or medical-treatment positioning.

### Institutional Adoption

Ideas:

- ACGME residency wellness support.
- Hospital-provided resident sleep optimization.
- Nursing department fatigue mitigation.
- Emergency medicine residency lecture series.
- Graduate medical education wellness curriculum add-on.

Deferral rule:

- Do not sell institutional safety or wellness claims until pilot evidence, retention data, privacy posture, and support workflow are documented.

### Adjacent Verticals

Ideas:

- Pilots and flight crews.
- Travel and jet lag.
- Consultants and frequent travelers.
- Parents managing fragmented sleep.
- Busy families with irregular schedules.
- Other rotating shift careers.

Deferral rule:

- Each vertical needs its own evidence map, regulatory/risk review, user interview set, and algorithm assumption review before roadmap promotion.

## Promotion Rules

An idea can move into a build plan only when:

- Problem is concrete and repeated.
- Target user is named.
- Success metric is objective.
- Prior art was searched.
- Existing features cannot solve it with a simpler adjustment.
- Required research exists or is explicitly scheduled.
- Phase acceptance criteria are defined before implementation begins.
- Evidence path is known.

Promotion artifact:

- Add a short proposal under `docs/superpowers/specs/`.
- Link supporting research.
- Add milestone entry to [PHASE_ACCEPTANCE_GATES.md](../dev/PHASE_ACCEPTANCE_GATES.md).
- Get Lead Engineer approval before coding.

