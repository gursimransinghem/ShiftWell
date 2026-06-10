---
phase: 07
slug: critical-bug-fixes
status: reconstructed
nyquist_compliant: false
nyquist_status: partial
wave_0_complete: true
created: 2026-04-17
reconstructed_from: [07-01-SUMMARY.md, 07-02-SUMMARY.md, 07-VERIFICATION.md]
---

# Phase 07 — Validation Strategy (Reconstructed)

> Retrofit built from existing SUMMARY + VERIFICATION artifacts on 2026-04-17. Phase 07 was executed 2026-04-07 without a VALIDATION.md.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x + ts-jest |
| **Config file** | `jest.config.js` (root) |
| **Quick run command** | `npx jest --testPathPatterns="premium\|plan-store\|useAdaptivePlan\|AdaptiveInsightCard"` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~8-10 seconds (full), ~2s (quick) |
| **TS check** | `npx tsc --noEmit` (exits 0) |

---

## Per-Task Verification Map

| Task | Requirement | Test Type | Command / File | Status |
|------|-------------|-----------|----------------|--------|
| 07-01 Task 1 | BUG-01 Trial auto-start | unit (MISSING) | *no `premium-store.test.ts` exists* — verified via grep + VERIFICATION spot-check only | ⚠️ partial |
| 07-01 Task 1 | BUG-02 Score finalization in AppState | integration (MISSING) | *no `_layout.test.ts`* — AppState handler not unit-covered | ⚠️ partial |
| 07-01 Task 2 | BUG-03 Downgrade screen routing | component (MISSING) | *no `downgrade.test.ts`* — verified via file existence + line refs | ⚠️ partial |
| 07-02 Task 1 | BUG-04 TypeScript errors | infra | `npx tsc --noEmit` → exit 0 | ✅ green |
| 07-02 Task 2 | BUG-05 planSnapshot delta | unit | `__tests__/hooks/useAdaptivePlan.test.ts` + `__tests__/components/AdaptiveInsightCard.test.ts` | ✅ green |
| 07-02 Task 2 | BUG-06 Dynamic Island score | integration (MISSING) | *no `useNightSkyMode.test.ts`* — verified via grep only | ⚠️ partial |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ partial · 🚫 missing*

---

## Sampling Rate

- **After every task commit:** `npx jest --testPathPatterns` (scoped to touched file)
- **After every plan wave:** `npm test`
- **Before `/gsd:verify-work`:** Full suite + `npx tsc --noEmit` both green
- **Max feedback latency:** <10 seconds

---

## Wave 0 Requirements

Not applicable — Phase 07 built on existing jest+ts-jest infrastructure established in Phases 1-5. No new test framework installs needed.

---

## Identified Gaps (Nyquist non-compliance)

Four requirements have no dedicated regression test. Verified only via code inspection + spot-check in 07-VERIFICATION.md:

| Gap | Suggested Test | Why it wasn't added | Risk of regression |
|-----|---------------|---------------------|-------------------|
| BUG-01 | `__tests__/store/premium-store.test.ts` — mock AsyncStorage, assert `initializePremium` calls `startTrial` when `trialStartedAt` is null | Wiring fix; executor chose code-inspection verification | LOW — inside a single `if (!trialStartedAt)` branch; hard to silently break |
| BUG-02 | `__tests__/integration/app-state-lifecycle.test.ts` — simulate background→active transition, assert `finalizeDay` called | AppState handler is in `_layout.tsx` (not easily unit-testable) | MEDIUM — easy to accidentally remove during future _layout.tsx refactors |
| BUG-03 | `__tests__/components/downgrade.test.tsx` — render + assert CTA routes to `/paywall` | Navigation test; executor chose file-existence verification | LOW — screen is stable, routing is single-line |
| BUG-06 | `__tests__/hooks/useNightSkyMode.test.ts` — assert `startSleepActivity` receives `score` field when `todayScore()` returns non-null | Hook integration test; skipped for time | MEDIUM — score plumbing crosses hook + Live Activity service |

---

## Manual-Only Verifications

The 4 human-test items in 07-VERIFICATION.md map 1:1 to the gaps above + Dynamic Island hardware dependency:

| Behavior | Requirement | Why Manual | Status |
|----------|-------------|------------|--------|
| First-launch trial UX | BUG-01 | Clean AsyncStorage cold start | Pending device |
| Downgrade screen nav + visual | BUG-03 | Ionicons render + aesthetic check | Pending device |
| Score accumulates on re-foreground | BUG-02 | AppState differs in simulator | Pending device |
| Morning Dynamic Island shows score | BUG-06 | iPhone 14 Pro+ hardware | Pending device |

---

## Validation Sign-Off

- [x] TypeScript compiles clean (BUG-04)
- [x] Full suite green (354/354 at phase close; 1,059/1,059 current)
- [x] BUG-05 has dedicated unit + component tests
- [ ] BUG-01, 02, 03, 06 have dedicated regression tests → **4 gaps**
- [ ] `nyquist_compliant: true` — **NOT SET** (partial status)

**Nyquist verdict:** PARTIAL. Phase functionally verified, but wiring-bug regression coverage is thin. Gaps documented; test generation deferred to pre-production hardening.

**Reconstructed:** 2026-04-17
**Last reviewed:** 2026-04-17
