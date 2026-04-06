# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

---

## Milestone: v1.0 — TestFlight

**Shipped:** 2026-04-06 (code complete — legal blocking distribution)  
**Phases:** 6 | **Plans:** 18 executed (22 total) | **Timeline:** 23 days (2026-03-14 → 2026-04-06)

### What Was Built

- **Blend design system** — dark base + warm gold (#C8A84B), zero non-brand hex in all screens
- **8-screen onboarding** — chronotype quiz, AM/PM routine builder, address geocoding for commute, HealthKit permission
- **Calendar integration** — Apple + Google Calendar read/write, confidence-scored shift detection, background sync
- **Deterministic circadian algorithm** — 11 modules, Two-Process Model, 354 tests, dynamic plan recalculation
- **Night Sky Mode** — star/firefly animations, recharge arc, bedtime info panels, adaptive bedtime detection
- **Push notifications** — warm emoji cadence (wind-down, caffeine, morning brief), all customizable
- **Live Activities stub** — Dynamic Island pipeline pre-built, correct API surface, pending Apple Developer enrollment
- **Recovery Score** — plan adherence calculator, 14-night history, null/zero distinction, trend visualization
- **Premium infrastructure** — $6.99/$49.99/$149.99 paywall, 14-day trial state, entitlements framework (gating intentionally disabled for v1.0)
- **Adaptive Brain Phase 1** (partial, outside GSD) — types.ts, 6 engine modules, useAdaptivePlan.ts, AdaptiveInsightCard.tsx

### What Worked

- **Parallel agent execution** — spawning 3 agents per complex phase dramatically reduced execution time
- **Deterministic algorithm first** — building the science before the UI meant zero rework; 354 tests are a moat
- **GSD phase structure** — PLAN.md → execute → SUMMARY.md → VERIFICATION.md gave clean handoffs between sessions
- **Local-first Zustand** — no backend dependency unblocked rapid iteration; Supabase wired but optional
- **Design system early** — establishing gold tokens in Phase 1 made all subsequent UI work faster (theme import, not hex)

### What Was Inefficient

- **Phase 6 shipped outside GSD** — code was written in unstructured sessions without formal plan execution; left a planning state gap that required a full audit session to reconcile
- **Adaptive Brain started before plan** — implementation was begun without a GSD plan, causing tracking loss; required audit discovery to surface
- **STATE.md drift** — planning state was 2 sessions behind reality when audit ran; should commit STATE.md after every session
- **TypeScript errors accumulated** — 13 errors found at audit time; stricter CI would have caught these at commit time

### Patterns Established

- **Ship code, not GSD plans** — when moving fast in a session, code ships but GSD tracking doesn't; periodic audit sessions are necessary
- **Accepted limitation pattern** — Phase 5's ActivityKit stubs were formally documented as "accepted for v1.0" in VERIFICATION.md; this pattern keeps blockers from stalling progress
- **Committee decisions in code** — the entitlements.ts "V1 LAUNCH: All features free" comment is the right place to document product decisions, not just technical ones
- **Integration pipes as explicit checklist** — the integration checker surfaced 3 broken pipes that phase-level verification missed; cross-phase integration should be a first-class audit step

### Key Lessons

1. **Commit STATE.md at session end.** Planning drift was the biggest time cost this milestone — a 1-minute habit prevents it.
2. **Integration test > unit test.** The score pipeline and trial start bugs were invisible in phase verification. Cross-phase integration checker caught them.
3. **Define "shipped" before starting.** Phase 6 "shipped outside GSD" created ambiguity. Going forward, if code exists, it needs a GSD plan even if written retroactively.
4. **TypeScript errors as CI gate.** `npx tsc --noEmit` should fail commits with errors — 13 errors accumulated silently.
5. **Legal runway must parallel dev.** LLC formation and Apple Developer enrollment are the only blockers to users. These should have started Week 1.

### Cost Observations

- Sessions: ~10-15 (estimated — no per-session tracking this milestone)
- Model mix: ~70% Sonnet, ~30% Opus (complex architecture decisions)
- Notable: Parallel agent execution was most cost-efficient — 3 agents × focused prompts > 1 agent × broad prompt
- Context efficiency: CLAUDE.md + memory files loaded per-session; could optimize by not reloading static files

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions (est) | Phases | Key Process Change |
|-----------|---------------|--------|--------------------|
| v1.0 | ~12 | 6 | GSD framework adopted mid-stream; planning state drift identified |
| v1.0 Launch | TBD | 5 | Starting with clean state, audit-first discipline |

### Cumulative Quality

| Milestone | Tests | TypeScript Errors | Notes |
|-----------|-------|-------------------|-------|
| v1.0 | 354 | 13 | Errors accumulated without CI gate |
| v1.0 Launch | TBD | 0 (target) | Fix all 13 before first commit |
