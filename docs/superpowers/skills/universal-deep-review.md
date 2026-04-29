# Universal Deep Review Skill

> **Created:** 2026-04-29  
> **Purpose:** Reusable analysis mode for any project, idea, product, feature, company plan, workflow, or technical initiative.  
> **Invocation:** "Run the Universal Deep Review skill on [project/idea/feature/plan]."

---

## What This Skill Produces

Use this skill when you want a senior-level, honest, structured assessment that turns ambiguity into a practical next step.

It should work for:

- A new business idea.
- A product or app.
- A feature proposal.
- A roadmap.
- A technical architecture.
- A launch plan.
- A monetization strategy.
- A workflow or internal process.
- A half-built project that needs focus.

The output should answer:

1. What is this, in plain English?
2. Who is it for?
3. What problem does it solve?
4. Why might it work?
5. Why might it fail?
6. What is strong?
7. What is weak, half-baked, or premature?
8. What assumptions need proof?
9. What should happen next?
10. What should be explicitly deferred?

The tone should feel like a trusted senior operator: direct, practical, thoughtful, and willing to say "not yet."

---

## Required Inputs

Before writing the review, gather only the context needed for the active question.

Minimum context:

1. **Object under review**
   - idea, feature, app, strategy, codebase, roadmap, workflow, etc.
2. **Target user or beneficiary**
   - who has the problem?
   - who pays?
   - who decides?
   - who uses it repeatedly?
3. **Current goal**
   - validate?
   - ship?
   - improve?
   - simplify?
   - monetize?
   - debug?
   - decide whether to continue?
4. **Evidence available**
   - user feedback
   - tests
   - analytics
   - market data
   - technical constraints
   - founder insight
   - research
   - examples or competitors
5. **Current state**
   - concept only
   - prototype
   - in progress
   - shipped
   - validated
   - struggling
6. **Known constraints**
   - time, budget, platform, legal, technical debt, distribution, team skill, compliance, dependencies.
7. **Principles**
   - company principles, product philosophy, brand rules, technical standards, ethical limits, or founder values.

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

Useful strength categories:

- Painful problem.
- Clear user.
- Founder-market fit.
- Distribution advantage.
- Technical moat.
- Data advantage.
- Workflow fit.
- Strong design or trust advantage.
- Existing usage or retention.
- Strong test coverage or reliability.
- Regulatory/compliance readiness.
- Cost advantage.

### 4. What Is Weak, Risky, or Half-Baked

Separate the categories:

- **Weak:** likely harmful, confusing, brittle, or not worth keeping.
- **Risky:** could work, but depends on uncertain assumptions.
- **Half-baked:** promising but not fully wired, validated, polished, or explainable.
- **Premature:** useful later, but distracting before the core is proven.

Use direct language. The goal is clarity, not comfort.

### 5. What Logic Makes Sense

Identify the parts that are coherent and should be protected.

For a product, this might be:

- Core workflow.
- User journey.
- Algorithm.
- Pricing logic.
- Trust model.
- Data model.
- Distribution channel.
- Brand positioning.

For a technical system, this might be:

- Domain boundaries.
- Pure logic.
- Testable modules.
- Security model.
- Failure handling.
- Deployment path.

### 6. What Needs Proof

List the assumptions that must be validated before expanding.

Common proof questions:

- Does the user actually have this problem?
- Is the problem frequent enough?
- Does the proposed solution reduce effort?
- Can users understand it without explanation?
- Do users trust it?
- Does it work in real conditions?
- Does it create repeat use?
- Does the buyer value it enough to pay?
- Is the acquisition channel real?
- Is the technical approach reliable at expected scale?
- Are legal/compliance claims accurate?

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
- Run live-device QA.
- Interview the exact user segment.
- Replace a brittle integration.

### 9. Execution Cadence

Turn the assessment into a clean operating rhythm.

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
- Each loop should end with evidence.
- Prefer small, reversible steps.

### 10. Principles Check

Tie recommendations back to the project's principles.

If no principles exist, infer temporary working principles and label them as assumptions.

Useful generic principles:

- User value over feature volume.
- Trust over growth hacks.
- Evidence over opinion.
- Simplicity over cleverness.
- Reliability over novelty.
- Clear positioning over broad appeal.
- Privacy and safety over convenience when sensitive data is involved.
- Revenue follows retained value.

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

```md
# Universal Deep Review — [Project / Idea / Feature]

## Plain-English Summary

...

## Target User and Use Case

...

## What Is Strong

...

## What Is Weak, Risky, or Half-Baked

...

## What Logic Makes Sense

...

## What Needs Proof

...

## Honest Utility / Value Assessment

...

## Recommended Next Focus

...

## Execution Cadence

### Loop 1: [Name]

**Objective:** ...

**Scope:** ...

**Non-scope:** ...

**Actions:**
1. ...

**Exit criteria:**
- ...

**Decision after exit:** ...

## Principles Check

...

## Keep / Fix / Hide / Defer / Kill

| Item | Decision | Reason | Trigger to revisit |
|---|---|---|---|
| ... | ... | ... | ... |

## Final Call

**Do next:** ...

**Do not do yet:** ...

**Defer until:** ...

**Success looks like:** ...
```

---

## Quick Invocation Prompts

### General

> Run the Universal Deep Review skill on [idea/project/feature]. Give me a plain-English summary, strengths, weaknesses, what logic makes sense, what is half-baked, what needs proof, honest utility assessment, next focus, execution cadence, and keep/fix/hide/defer/kill recommendations. Be direct and practical.

### New idea

> Run the Universal Deep Review skill on this idea. Assess the target user, problem severity, differentiation, risks, validation plan, minimum useful version, and whether I should pursue, simplify, defer, or kill it.

### Feature

> Run the Universal Deep Review skill on this feature. Tell me whether it strengthens the core user journey, what assumptions need proof, what could go wrong, and what the smallest useful version should be.

### Existing project

> Run the Universal Deep Review skill on this project. Identify the real asset, the bloat, the half-baked surfaces, the next focus, and the clean execution cadence to get it to a useful shipped version.

### Technical architecture

> Run the Universal Deep Review skill on this architecture. Assess coherence, boundaries, risk, reliability, testability, premature complexity, and the next hardening step.
