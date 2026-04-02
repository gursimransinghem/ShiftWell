---
phase: 1
slug: foundation-onboarding
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-02
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30 + ts-jest 29 |
| **Config file** | `jest.config.js` (root — uses `ts-jest` preset, roots: `__tests__/`) |
| **Quick run command** | `npx jest --testPathPattern="circadian"` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~10 seconds (83 existing tests) |

---

## Sampling Rate

- **After every task commit:** Run `npx jest` (all 83 algorithm tests must stay green)
- **After every plan wave:** Full flow simulation on iOS Simulator (welcome → healthkit)
- **Before `/gsd:verify-work`:** Full suite must be green + grep audit for hardcoded hex
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-xx | 01 | 1 | DES-01 | Lint/grep audit | `grep -rn '#[0-9A-Fa-f]\{3,6\}' src/ --include='*.tsx' --include='*.ts'` | N/A — manual | ⬜ pending |
| 01-01-xx | 01 | 1 | DES-02 | Manual device test | — | N/A — manual | ⬜ pending |
| 01-01-xx | 01 | 1 | DES-03 | Design review | — | N/A — manual | ⬜ pending |
| 01-02-xx | 02 | 2 | ONB-01 | Unit (store) | `npx jest --testPathPattern="user-store"` | ❌ Wave 0 | ⬜ pending |
| 01-02-xx | 02 | 2 | ONB-02 | Unit (store) | `npx jest --testPathPattern="user-store"` | ❌ Wave 0 | ⬜ pending |
| 01-02-xx | 02 | 2 | ONB-03 | Unit (store) | `npx jest --testPathPattern="user-store"` | ❌ Wave 0 | ⬜ pending |
| 01-03-xx | 03 | 2 | ONB-04 | Unit (geocoding) | `npx jest --testPathPattern="commute"` | ❌ Wave 0 | ⬜ pending |
| 01-02-xx | 02 | 2 | ONB-05 | Unit (store) | `npx jest --testPathPattern="user-store"` | ❌ Wave 0 | ⬜ pending |
| 01-02-xx | 02 | 2 | ONB-06 | Unit (store) | `npx jest --testPathPattern="user-store"` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/store/user-store.test.ts` — stubs for ONB-01 through ONB-06 store persistence
- [ ] `__tests__/utils/commute.test.ts` — covers Haversine calculation and geocoding fallback

*Existing `__tests__/circadian/` tests cover algorithm — no gaps there*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| All screens use blend design tokens | DES-01 | Visual review required for color consistency | Walk through every screen on simulator, compare against token values |
| Animations at 60fps, no jank | DES-02 | FPS measurement requires device profiling | Run on physical device, observe transitions for dropped frames |
| Premium visual identity | DES-03 | Aesthetic judgment | Design review against brand guidelines |
| Full onboarding flow completion | All ONB-* | Integration of 8 screens end-to-end | Complete full onboarding flow on simulator, verify all data saved |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
