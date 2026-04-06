# ShiftWell Planning Sync — Design Spec

**Date:** 2026-04-06  
**Author:** Sim + Claude  
**Status:** Approved  

---

## Context

ShiftWell has completed its initial 6-phase v1.0 development milestone (Core Autopilot). The GSD planning state is ~2 sessions behind the codebase — Phase 6 features were shipped but never formally tracked, and Adaptive Brain Phase 1 was started outside the GSD framework.

This spec defines the process to reconcile planning state with code reality, archive the current milestone cleanly, and launch a properly-structured new milestone.

---

## Problem Statement

| Phase | GSD State | Code Reality |
|-------|-----------|--------------|
| Phase 1: Foundation & Onboarding | Complete | Complete |
| Phase 2: Calendar Sync | Complete | Complete |
| Phase 3: Sleep Plan Generation | Complete | Complete |
| Phase 4: Night Sky Mode & Notifications | Complete | Complete |
| Phase 5: Live Activities & Recovery Score | Complete (pending ActivityKit verification) | Complete (stubs) |
| Phase 6: Premium, Settings & Polish | Not started (0/4 plans) | ~80% shipped |
| Adaptive Brain Phase 1 | Not tracked | ~60% implemented |

**Gap summary:**
- Phase 6 features shipped: paywall ($6.99/$49.99/$149.99), 14-day trial tracking, settings screen, circadian tab, 6 new Today features (SleepDebtCard, NapCalculatorModal, ScienceInsightCard, PatternAlertCard, ScoreBreakdownCard, on-shift polish)
- Phase 6 NOT shipped: TypeScript full polish pass, "Spread the Sleep" referral feature, trial countdown badge
- Adaptive Brain Phase 1 built: types.ts, 6 engine modules, sleep-windows.ts integration, useAdaptivePlan.ts, AdaptiveInsightCard.tsx

---

## Design

### Process Flow

```
1. Audit (gsd:audit-milestone)
      ↓
2. Patch gaps (manual STATE.md edits)
      ↓
3. Complete milestone (gsd:complete-milestone)
      ↓
4. Start new milestone (gsd:new-milestone)
```

### Step 1: Audit
Run `/gsd:audit-milestone` to produce a formal gap report comparing GSD-tracked requirements against the codebase. This is the authoritative source for patching decisions.

### Step 2: Patch
Based on audit output:
- Mark Phase 6 as complete — features shipped match the intent of all 4 plans
- Move unshipped items (TypeScript polish, referral, trial badge) to new milestone backlog
- Document Adaptive Brain Phase 1 progress in STATE.md as "started, pre-GSD, carries forward"

### Step 3: Complete Milestone
Run `/gsd:complete-milestone` to archive Milestone 1 ("v1.0 Core Autopilot"). This produces a milestone summary and cleans up the planning directory.

### Step 4: New Milestone

**Milestone 2 — v1.0 TestFlight Launch & Adaptive Brain**

| Phase | Name | Scope |
|-------|------|-------|
| 1 | Adaptive Brain Phase 1 (Formalize) | Complete partial implementation: wire useAdaptivePlan into Today screen, morning recalculation loop, change log UI |
| 2 | TestFlight Prep | App icon, splash screen, build config, metadata, provisioning profiles |
| 3 | ActivityKit Integration | Wire Live Activity stubs to native module, test Dynamic Island |
| 4 | App Store Prep | Screenshots, listing copy, privacy policy, age rating |
| 5 | Backlog & Polish | TypeScript cleanup, referral feature, audit gaps |

**External dependency:** LLC formation (~2 weeks) → Apple Developer enrollment (~1 week) → TestFlight distribution. Phases 1, 3, 5 can start immediately.

---

## Future Milestones (Queued)

**Milestone 3 — ShiftWell as a Company**
1. Company org design — departments, fractional CEO model, investor/product owner roles
2. Launch checklist — LLC → Apple Dev → TestFlight → App Store submission (step-by-step)
3. Logo + brand identity
4. Marketing website
5. Advertising plan + ad creation

---

## Files Involved

| File | Role |
|------|------|
| `.planning/STATE.md` | GSD current state — primary patch target |
| `.planning/ROADMAP.md` | Phase list — update with new milestone |
| `src/lib/adaptive/` | Adaptive Brain Phase 1 partial implementation |
| `src/components/today/AdaptiveInsightCard.tsx` | Implemented component to formalize |
| `src/hooks/useAdaptivePlan.ts` | Implemented hook to formalize |
| `docs/superpowers/specs/2026-04-06-adaptive-brain-design.md` | Approved Adaptive Brain spec |

---

## Success Criteria

- [ ] GSD STATE.md reflects all Milestone 1 phases complete
- [ ] Clean milestone archive in `.planning/archive/`
- [ ] Milestone 2 directory with ROADMAP.md and 5-phase structure
- [ ] Milestone 3 queued in backlog
- [ ] Git commit for this spec
