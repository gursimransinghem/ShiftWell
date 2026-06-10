---
phase: 09
slug: circadian-protocols
status: reconstructed
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-17
reconstructed_from: [09-VERIFICATION.md, __tests__/adaptive/circadian-protocols.test.ts]
---

# Phase 09 — Validation Strategy (Reconstructed)

> Retrofit built from existing VERIFICATION + test files on 2026-04-17. Phase 09 was verified-complete 2026-04-07 with no separate PLAN/SUMMARY artifacts — work fell under the Adaptive Brain design umbrella established in Phase 08.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x + ts-jest |
| **Config file** | `jest.config.js` (root) |
| **Quick run command** | `npx jest --testPathPatterns="circadian-protocols"` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~2s (quick), ~10s (full) |

---

## Per-Task Verification Map

| Requirement | Test Type | File | Count | Status |
|-------------|-----------|------|-------|--------|
| BRAIN-03 Circadian transition protocols (5 types) | unit | `__tests__/adaptive/circadian-protocols.test.ts` | 14 tests | ✅ green |
| BRAIN-03 Chronotype variation | unit | `__tests__/adaptive/circadian-protocols-chronotype.test.ts` | multi-test | ✅ green |
| BRAIN-03 Multi-transition handling | unit | `__tests__/adaptive/circadian-protocols-multi.test.ts` | multi-test | ✅ green |
| BRAIN-05 SleepDebtCard dual-meter visualization | verified via | 08-VERIFICATION Required Artifacts table + `SleepDebtCard.tsx` source | — | ✅ verified |
| BRAIN-05 Bank computation | unit | `__tests__/adaptive/sleep-debt-engine.test.ts` | multi-test | ✅ green |

---

## Sampling Rate

- **After every task commit:** `npx jest --testPathPatterns="circadian\|sleep-debt"`
- **After every plan wave:** `npm test`
- **Max feedback latency:** <3s (scoped) / <10s (full)

---

## Wave 0 Requirements

None — Phase 09 extends Phase 08's test scaffolding. All requirements ride on existing `__tests__/adaptive/*` test files.

---

## Manual-Only Verifications

None specific to Phase 09. SleepDebtCard visual check rolls into Phase 08's "SleepDebtCard with Real HealthKit Data" manual test.

---

## Validation Sign-Off

- [x] BRAIN-03: 3 test files cover the 6 transition types, chronotype variation, and multi-transition cases
- [x] BRAIN-05: Component exists, dual-meter rendering verified, bank math covered in `sleep-debt-engine.test.ts`
- [x] Full suite green
- [x] `nyquist_compliant: true`

**Nyquist verdict:** COMPLIANT. All requirements have automated verification.

**Reconstructed:** 2026-04-17
**Last reviewed:** 2026-04-17
