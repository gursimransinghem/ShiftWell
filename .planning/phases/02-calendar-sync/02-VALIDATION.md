---
phase: 2
slug: calendar-sync
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-02
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30 + ts-jest 29 |
| **Config file** | jest.config.js |
| **Quick run command** | `npx jest --testPathPattern=calendar --passWithNoTests` |
| **Full suite command** | `npx jest --passWithNoTests` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern=calendar --passWithNoTests`
- **After every plan wave:** Run `npx jest --passWithNoTests`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | CAL-01 | unit | `npx jest --testPathPattern=calendar-service` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | CAL-02 | unit | `npx jest --testPathPattern=google-calendar-api` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | CAL-03 | unit | `npx jest --testPathPattern=shift-detector` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | CAL-04 | unit | `npx jest --testPathPattern=calendar-service` | ❌ W0 | ⬜ pending |
| 02-01-05 | 01 | 1 | CAL-05 | unit | `npx jest --testPathPattern=google-calendar-api` | ❌ W0 | ⬜ pending |
| 02-01-06 | 01 | 1 | CAL-06 | unit | `npx jest --testPathPattern=calendar-store` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/calendar/__tests__/shift-detector.test.ts` — confidence scoring tests for CAL-03
- [ ] `src/lib/calendar/__tests__/calendar-service.test.ts` — Apple calendar read/write tests for CAL-01, CAL-04
- [ ] `src/lib/calendar/__tests__/google-calendar-api.test.ts` — Google API tests for CAL-02, CAL-05
- [ ] `src/lib/calendar/__tests__/calendar-store.test.ts` — Zustand store toggle tests for CAL-06
- [ ] `__mocks__/expo-calendar.ts` — Jest mock for expo-calendar
- [ ] `__mocks__/@react-native-google-signin/google-signin.ts` — Jest mock for google-signin

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Apple Calendar permission dialog | CAL-01 | OS-level permission UI | 1. Install on physical iOS device 2. Open app → Onboarding → Calendar step 3. Verify permission dialog appears with correct description |
| Google OAuth sign-in flow | CAL-02 | OAuth redirect + native sign-in sheet | 1. Development build (not Expo Go) 2. Tap Google Calendar card 3. Verify Google sign-in sheet appears and completes |
| Background task fires | CAL-05 | iOS BGTaskScheduler timing | 1. Connect calendar 2. Background the app 3. Wait 20+ min 4. Check lastSyncedAt updated |
| Sleep blocks appear in iOS Calendar | CAL-04 | Visual verification in native Calendar app | 1. Generate sleep plan 2. Open iOS Calendar app 3. Verify ShiftWell calendar exists with events |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
