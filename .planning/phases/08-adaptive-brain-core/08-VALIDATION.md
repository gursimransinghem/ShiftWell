---
phase: 08
slug: adaptive-brain-core
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-07
---

# Phase 08 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.3.0 + ts-jest 29.4.6 |
| **Config file** | `jest.config.js` |
| **Quick run command** | `npx jest --testPathPatterns="adaptive\|plan-store"` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~6 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPatterns="adaptive|plan-store"`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-T1 | 08-01 | 1 | BRAIN-06 | unit | `npx jest --testPathPatterns="plan-store"` | Yes (extend) | pending |
| 08-01-T2 | 08-01 | 1 | BRAIN-04 | unit | `npx jest --testPathPatterns="AdaptiveInsightCard"` | No (Wave 0) | pending |
| 08-02-T1 | 08-02 | 2 | BRAIN-01 | unit | `npx jest --testPathPatterns="useAdaptivePlan"` | No (Wave 0) | pending |
| 08-02-T2 | 08-02 | 2 | BRAIN-02 | unit | `npx jest --testPathPatterns="SleepDebtCard"` | No (Wave 0) | pending |

---

## Wave 0 Gaps

- [ ] `__tests__/hooks/useAdaptivePlan.test.ts` — covers BRAIN-01 debounce gate (new file)
- [ ] `__tests__/components/SleepDebtCard.test.ts` — covers BRAIN-02 conditional render (new file)
- [ ] `__tests__/components/AdaptiveInsightCard.test.ts` — covers BRAIN-04 X button calls onDismiss (new file)
- [ ] Extend `__tests__/store/plan-store.test.ts` — add persist + changeLog + dismissChanges tests

---

## Project Constraints (from CLAUDE.md)

- `npm test` (354 tests) must pass before any commit
- Algorithm changes to `src/lib/circadian/` must maintain all existing tests
- Phase 8 does NOT touch `src/lib/circadian/` — only stores, hooks, and components
