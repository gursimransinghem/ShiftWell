# Deep Product & Ship-Readiness Review Skill

> **Created:** 2026-04-29  
> **Purpose:** Reusable analysis mode for getting a clear, honest, senior-level assessment of ShiftWell or any major feature area.  
> **Invocation:** “Run the Deep Product Ship Review skill on [area/app/plan].”

---

## What This Skill Produces

Use this skill when the founder wants the same caliber of analysis as the 2026-04-29 ShiftWell app assessment:

- High-level explanation of what the product is.
- Strengths and real assets.
- Weaknesses, risks, and half-built surfaces.
- Which logic is sound vs. which logic is speculative.
- Honest utility assessment.
- Clear next focus.
- Execution plan with clean cadence.
- Decisions grounded in company principles.

The output should feel like a trusted senior product/engineering advisor: direct, structured, practical, and founder-friendly.

---

## Required Inputs

Before writing the review, gather only the context needed for the active question:

1. Current product goal.
2. Relevant docs:
   - `CLAUDE.md`
   - `docs/vision/MANIFESTO.md`
   - `docs/dev/IMPLEMENTATION_PLAN.md`
   - `docs/dev/PHASE_2_ARCHITECTURE.md` if backend/premium/HealthKit are in scope
   - `tasks/todo.md`
   - latest relevant activity log entries
3. Code or feature areas under review.
4. Current verification state:
   - tests
   - typecheck
   - build/device status
   - known blockers

Do not overload the context window with archived material unless the user asks for historical comparison.

---

## Review Structure

Use these sections, in this order:

### 1. Plain-English Summary

Explain the app or feature in one paragraph:

> “This is a [type of product] for [specific user] that solves [specific problem] by [mechanism].”

For ShiftWell, keep the core framing:

> “Schedule-aware circadian planning for shift workers: import/enter shifts, account for real-life constraints, then generate sleep/nap/caffeine/meal/light guidance.”

### 2. What Is Strong

Name the real assets. Be specific.

For ShiftWell, recurring strengths include:

- Clear painful user problem.
- Physician-founder credibility.
- Deterministic local circadian algorithm.
- Calendar-as-interface strategy.
- Strong algorithmic test coverage.
- Offline-first privacy posture.
- Dark-mode-first shift-worker UX.

### 3. What Is Weak or Half-Baked

Separate “bad idea” from “good idea, premature.”

Use labels:

- **Weak:** likely harmful, confusing, buggy, or not worth keeping.
- **Half-baked:** promising but not fully wired, validated, or polished.
- **Premature:** useful later, but distracting before core validation.

For ShiftWell, common half-baked/premature surfaces include:

- Auth/backend before the local core loop is proven.
- Premium/paywall before retention is proven.
- AI coaching before basic plan adherence is proven.
- Enterprise/dashboard before direct user value is proven.
- HealthKit recovery unless real device data is flowing reliably.
- Growth/referral systems before there are retained users.

### 4. What Logic Makes Sense

Identify the logic that should be protected and improved, not replaced.

For ShiftWell:

- Shift classification.
- Transition/recovery day detection.
- Sleep window generation.
- Nap placement.
- Caffeine cutoff timing.
- Meal timing.
- Light protocol guidance.
- Calendar import/export.
- Personal constraint adjustment.
- Prediction of stressful transitions.

### 5. What Needs Proof

List the assumptions that require real user/device validation.

Examples:

- Does calendar import correctly detect real healthcare shifts?
- Does the Today screen make the next action obvious?
- Do users trust the plan?
- Do users follow the plan?
- Are notifications helpful or annoying?
- Does HealthKit improve decisions enough to justify permission friction?
- Would users pay after experiencing value?

### 6. Honest Utility Assessment

Give a blunt product judgment:

- Who would benefit now?
- What would make them come back?
- What would make them churn?
- What must be true for the app to be worth shipping?

For ShiftWell, the useful version is:

> “I imported my schedule, ShiftWell understood my shifts, and it told me exactly when to sleep, nap, stop caffeine, eat, get light, and recover. It adjusted around my real calendar, and I trusted it.”

### 7. Recommended Next Focus

Pick one focus. Avoid a long wishlist.

For ShiftWell before TestFlight:

> “Make the core loop excellent: onboarding -> add/import shifts -> generate plan -> Today screen tells the user what to do now -> export/notifications support the plan.”

### 8. Execution Cadence

Turn the assessment into an operating rhythm:

- One primary objective per sprint.
- One user journey per sprint.
- No new feature unless it strengthens that journey.
- Ship small, test on device, collect feedback, then decide.

### 9. Core Principles Check

Tie recommendations back to `docs/vision/MANIFESTO.md`:

- **Automation Over Effort:** remove user decisions.
- **Science Over Opinion:** cite/ground recommendations.
- **Premium Over Desperate:** no dark patterns or noisy monetization.
- **Invisible Over Impressive:** favor calendar/notification utility over flashy screens.
- **Mission Over Money:** protect trust and health impact.

### 10. Final Call

End with a clear call:

- “Do this next.”
- “Do not do this yet.”
- “Defer these until trigger X.”

---

## Tone Rules

- Be honest but constructive.
- Use plain English.
- Do not flatter the work without evidence.
- Do not bury the main recommendation.
- Avoid calendar-time estimates; describe scope by components, risk, and verification.
- Prefer “this is premature” over “this is bad” when the idea is sound but timing is wrong.
- When recommending deferral, include the trigger that would justify bringing it back.

---

## Output Template

```md
# Deep Product & Ship-Readiness Review — [Area]

## High-Level Summary

...

## What Is Strong

...

## What Is Weak or Half-Baked

...

## What Logic Makes Sense

...

## What Needs Proof

...

## Honest Utility Assessment

...

## Recommended Next Focus

...

## Execution Cadence

...

## Core Principles Check

...

## Final Call

...
```

---

## Quick Invocation Prompt

Copy/paste this when needed:

> Run the Deep Product Ship Review skill. Give me a high-level summary, strengths, weaknesses, what logic makes sense, what is half-baked, honest utility assessment, execution cadence, and the next focus. Ground the assessment in ShiftWell’s manifesto principles and current code/docs. Be direct and practical.
