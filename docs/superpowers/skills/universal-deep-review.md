# Universal Deep Review Skill

> **Created:** 2026-04-29  
> **Purpose:** Reusable analysis mode for any project, idea, product, feature, company plan, workflow, or technical initiative.  
> **Invocation:** "Run the Universal Deep Review skill on [project/idea/feature/plan]."

---

## What This Skill Produces

Use this skill when you want a senior-level, honest, structured assessment that turns ambiguity into a practical next step. It should work for a business idea, product, feature, roadmap, architecture, launch plan, monetization strategy, workflow, or half-built project.

The output should explain the thing in plain English, identify the real strengths and risks, name the assumptions that need proof, and end with a clear next focus plus keep/fix/hide/defer/kill decisions.

The tone should feel like a trusted senior operator: direct, practical, thoughtful, and willing to say "not yet."

---

## Required Inputs

Before writing the review, gather only the context needed for the active question:

1. Object under review: idea, feature, app, strategy, codebase, roadmap, workflow, etc.
2. Current goal: validate, ship, improve, simplify, monetize, debug, or decide whether to continue.
3. Current state: concept, prototype, in progress, shipped, validated, or struggling.
4. Evidence available: user feedback, tests, analytics, market data, technical constraints, founder insight, research, examples, or competitors.

Use these only when relevant:

- Target user or beneficiary: who has the problem, pays, decides, and uses it repeatedly.
- Known constraints: budget, platform, legal, technical debt, distribution, team skill, compliance, dependencies.
- Principles: company principles, product philosophy, brand rules, technical standards, ethical limits, or founder values.

If some inputs are missing, state assumptions clearly instead of blocking the review.

---

## Review Structure

Use these sections, in this order.

### 1. Plain-English Summary

Explain the thing in one paragraph:

> "This is a [type of thing] for [specific user] that solves [specific problem] by [mechanism]."

Also identify the core promise:

> "If this works, the user gets [specific outcome]."

### 2. Target User and Use Case

Be specific:

- Who has the problem?
- When do they feel it?
- How painful/frequent is it?
- What are they doing today instead?
- Why would they care enough to switch, pay, or change behavior?

If the target user is vague, say so directly.

### 3. What Is Strong

Name the real assets. Do not flatter without evidence.

Useful strength categories include:

- Painful problem.
- Clear user.
- Founder-market fit.
- Data advantage.
- Workflow fit.
- Strong test coverage or reliability.

### 4. What Is Weak, Risky, or Half-Baked

Separate the categories:

- **Weak:** likely harmful, confusing, brittle, or not worth keeping.
- **Risky:** could work, but depends on uncertain assumptions.
- **Half-baked:** promising but not fully wired, validated, polished, or explainable.
- **Premature:** useful later, but distracting before the core is proven.

Use direct language. The goal is clarity, not comfort.

### 5. What Logic Makes Sense

Identify the parts that are coherent and should be protected.

For a product, this might include:

- Core workflow.
- User journey.
- Algorithm.
- Pricing logic.
- Trust model.

For a technical system, this might include:

- Domain boundaries.
- Pure logic.
- Testable modules.
- Security model.
- Failure handling.

### 6. What Needs Proof

List the assumptions that must be validated before expanding.

Common proof questions:

- Does the user actually have this problem?
- Is the problem frequent enough?
- Does the proposed solution reduce effort?
- Can users understand it without explanation?
- Do users trust it?
- Does it work in real conditions?
- Does the buyer value it enough to pay?
- Is the technical approach reliable at expected scale?

Prefer proof by real behavior over opinions.

### 7. Honest Utility or Value Assessment

Give a blunt judgment:

- Who benefits right now?
- What is the minimum useful version?
- What would make users come back?
- What would make them churn?
- What is the highest-risk assumption?
- What must be true for this to be worth continuing?

If the idea is weak, say what would need to change.
If the idea is strong but overbuilt, say what to simplify.

### 8. Recommended Next Focus

Pick one primary focus.

Avoid a scattered wishlist.

Good next-focus examples:

- Prove the core user loop.
- Reduce onboarding friction.
- Validate willingness to pay.
- Make one workflow reliable end-to-end.
- Hide premature surfaces.
- Fix trust and explanation.

### 9. Execution Cadence

Include this when the review should produce an execution plan. Skip it for narrow reviews where `Recommended Next Focus` and `Final Call` are enough.

Use this format:

1. **Objective**
   - one sentence.
2. **Scope**
   - what is included.
3. **Non-scope**
   - what is explicitly not included.
4. **Actions**
   - ordered list.
5. **Exit criteria**
   - observable proof that the loop is done.
6. **Decision after exit**
   - continue, simplify, ship, defer, or stop.

Rules:

- One primary objective per loop.
- One user journey or system boundary per loop.
- No new feature unless it strengthens the objective.

### 10. Core Principles Check

Tie recommendations back to the project's principles.

If no principles exist, infer temporary working principles and label them as assumptions.

Useful generic principles:

- User value over feature volume.
- Trust over growth hacks.
- Evidence over opinion.
- Simplicity over cleverness.
- Reliability over novelty.
- Privacy and safety over convenience when sensitive data is involved.

### 11. Defer / Kill / Keep

Create a clear triage table:

| Item | Decision | Reason | Trigger to revisit |
|---|---|---|---|
| Feature/idea/surface | Keep / Fix / Hide / Defer / Kill | Why | What evidence would change this |

This prevents "later" from becoming an unmanaged graveyard.

### 12. Final Call

End with a crisp recommendation:

- **Do next:** one thing.
- **Do not do yet:** one thing.
- **Defer until:** explicit trigger.
- **Success looks like:** observable outcome.

---

## Tone Rules

- Be honest but constructive.
- Use plain English.
- Do not bury the recommendation.
- Do not over-index on cleverness.
- Do not present all ideas as equally important.
- Distinguish "bad idea" from "good idea, wrong time."
- When recommending deferral, include the trigger that would justify revisiting it.
- Avoid calendar-time estimates; describe scope by components, risk, dependencies, and verification.
- If evidence is missing, name it.
- If the user is unclear, make that the first issue.

---

## Output Template

Use the full structure for substantial reviews. For narrow reviews, collapse sections while preserving the final recommendation and keep/fix/hide/defer/kill triage.

Headings, in order:

1. Plain-English Summary
2. Target User and Use Case
3. What Is Strong
4. What Is Weak, Risky, or Half-Baked
5. What Logic Makes Sense
6. What Needs Proof
7. Honest Utility / Value Assessment
8. Recommended Next Focus
9. Execution Cadence, if useful
10. Core Principles Check
11. Keep / Fix / Hide / Defer / Kill
12. Final Call

---

## Quick Invocation Prompt

Copy/paste this when needed:

> Run the Universal Deep Review skill on [idea/project/feature/plan]. Be direct and practical. End with one next focus, keep/fix/hide/defer/kill triage, and clear triggers for anything deferred.

Optional emphasis:

- New idea: target user, problem severity, differentiation, validation path, and whether to pursue, simplify, defer, or kill it.
- Feature: core journey fit, assumptions needing proof, risks, and smallest useful version.
- Existing project: real asset, bloat, half-baked surfaces, next focus, and execution cadence if useful.
- Technical architecture: coherence, boundaries, reliability, testability, premature complexity, and next hardening step.
