---
phase: 01-foundation-onboarding
plan: "02"
subsystem: onboarding-screens
tags: [onboarding, routine-builder, am-routine, pm-routine, react-native, animations]
dependency_graph:
  requires:
    - RoutineStep-type
    - UserProfile-extended
    - ONBOARDING_TOTAL_STEPS-constant
    - ui-component-theme-imports
  provides:
    - am-routine-screen
    - pm-routine-screen
    - preferences-commute-removed
    - preferences-nav-to-am-routine
  affects:
    - onboarding-navigation-chain
    - user-profile-amRoutine
    - user-profile-pmRoutine
tech_stack:
  added: []
  patterns:
    - toggleable activity cards with AnimatedTransition stagger (80ms delay per card)
    - duration chip picker embedded in activity card when enabled and timed
    - marker activities (durationMinutes=0) show no duration picker
key_files:
  created:
    - app/(onboarding)/am-routine.tsx
    - app/(onboarding)/pm-routine.tsx
  modified:
    - app/(onboarding)/preferences.tsx
decisions:
  - AM and PM marker activities (wake, phone-down, lights-out) have durationMinutes=0 and no duration picker — they mark time boundaries, not durations
  - Duration options are fixed presets (10, 15, 20, 30, 45, 60 min) not free-entry — reduces cognitive load and keeps data clean for algorithm
metrics:
  duration: ~5 minutes
  completed_date: "2026-04-02"
  tasks_completed: 2
  files_modified: 1
  files_created: 2
---

# Phase 01 Plan 02: AM/PM Routine Builder Screens Summary

**One-liner:** AM and PM routine builder screens with toggleable OptionCard activities, stagger animations, and duration chip pickers — commute chip picker removed from preferences since commute is now captured in the routine builders.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | AM routine builder screen | 5bd719d | app/(onboarding)/am-routine.tsx (new, 161 lines) |
| 2 | PM routine builder screen + preferences commute removal | e4c5991 | app/(onboarding)/pm-routine.tsx (new, 161 lines), app/(onboarding)/preferences.tsx (modified) |

## Verification Results

- `app/(onboarding)/am-routine.tsx` exists — 161 lines, > 100 line minimum
- `app/(onboarding)/pm-routine.tsx` exists — 161 lines, > 100 line minimum
- `import type { RoutineStep }` present in both routine screens
- `ONBOARDING_STEPS.amRoutine` / `ONBOARDING_STEPS.pmRoutine` used in ProgressBar
- `setProfile({ amRoutine: ... })` and `setProfile({ pmRoutine: ... })` present
- `router.push('/(onboarding)/pm-routine')` in am-routine
- `router.push('/(onboarding)/addresses')` in pm-routine
- `AnimatedTransition` with `delay={index * 80}` stagger in both screens
- Zero hardcoded hex strings in routine screen StyleSheets
- `COMMUTE_OPTIONS` and `commuteDuration` absent from preferences.tsx
- `router.push('/(onboarding)/am-routine')` present in preferences.tsx
- `ONBOARDING_TOTAL_STEPS` in preferences.tsx ProgressBar
- 197 tests pass (all suites green)
- Navigation chain correct: preferences -> am-routine -> pm-routine -> addresses

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — both screens use real local state initialized from AM_DEFAULTS / PM_DEFAULTS constants and save to the Zustand store on Next press. Data flows to algorithm via `userProfile.amRoutine` and `userProfile.pmRoutine`.

## Self-Check: PASSED

- `app/(onboarding)/am-routine.tsx` — FOUND (161 lines)
- `app/(onboarding)/pm-routine.tsx` — FOUND (161 lines)
- `app/(onboarding)/preferences.tsx` — FOUND (COMMUTE_OPTIONS absent, am-routine nav present)
- Commits 5bd719d, e4c5991 — FOUND in git log
