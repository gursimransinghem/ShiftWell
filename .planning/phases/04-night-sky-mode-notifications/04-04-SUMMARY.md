---
phase: 04-night-sky-mode-notifications
plan: "04"
subsystem: night-sky-mode
tags: [hooks, today-screen, settings, notifications, night-sky]
dependency_graph:
  requires: [04-02, 04-03]
  provides: [useNightSkyMode, NightSkyOverlay-wiring, notification-prefs-ui]
  affects: [app/(tabs)/index.tsx, app/(tabs)/settings.tsx]
tech_stack:
  added: []
  patterns: [zustand-selector, useMemo-deps, priority-guard, fill-degradation]
key_files:
  created:
    - src/hooks/useNightSkyMode.ts
  modified:
    - src/hooks/index.ts
    - app/(tabs)/index.tsx
    - app/(tabs)/settings.tsx
decisions:
  - "useNightSkyMode reads from plan-store/notification-store/user-store — no new setInterval (piggybacks on useTodayPlan 60s tick)"
  - "Priority=1 guard + hour window [18:00–12:00) prevents nap false-positives (Pitfall 4)"
  - "fillFraction degrades with 50% penalty past bedtime: penalty = (minutesPastBedtime / plannedSleepMinutes) * 0.5"
  - "Task 3 checkpoint:human-verify auto-approved per orchestrator directive in execution prompt"
metrics:
  duration: 12min
  completed_date: "2026-04-02"
  tasks: 3
  files: 4
---

# Phase 04 Plan 04: Night Sky Mode Wiring — Summary

**One-liner:** useNightSkyMode hook bridges plan data to NightSkyOverlay on Today screen, with store-backed notification preferences in Settings.

## What Was Built

### Task 1: useNightSkyMode Hook + Today Screen Integration
Created `src/hooks/useNightSkyMode.ts` — the critical bridge between live plan data and the Night Sky overlay.

Key implementation details:
- Reads `plan` from `usePlanStore`, `windDownLeadMinutes` from `useNotificationStore`, `profile` from `useUserStore`
- Filters eligible blocks: `type === 'main-sleep' && priority === 1` AND `startHour >= 18 || startHour < 12` (prevents nap false-positives per Pitfall 4)
- `isActive` window: from `windDownLeadMinutes` before sleep until the end of the sleep block
- `fillFraction` base: `clamp(plannedSleepMinutes / (sleepNeed * 60), 0, 1)`; degraded past bedtime by `(minutesPastBedtime / plannedSleepMinutes) * 0.5`
- `tomorrowSchedule`: first 3 blocks after sleep end, before `addDays(startOfDay(sleepEnd), 1)`
- Entire computation wrapped in `useMemo` with `[plan, windDownLeadMinutes, profile]` deps
- Exported from `src/hooks/index.ts`

Updated `app/(tabs)/index.tsx`:
- Imports `useNightSkyMode` and `NightSkyOverlay`
- Calls `const nightSky = useNightSkyMode()` inside `TodayScreen`
- Wraps full return in `<View style={{ flex: 1 }}>` to contain absolute-positioned overlay
- Renders `<NightSkyOverlay>` conditionally when `nightSky.isActive && nightSky.alarmTime && nightSky.latestWakeTime`
- onDismiss is no-op (overlay auto-dismisses when time passes)

Commit: `ca78ae2`

### Task 2: Settings Notification Preferences Section
Updated `app/(tabs)/settings.tsx` to add store-backed notification preference controls.

Changes:
- Added imports: `schedulePlanNotifications` from notification-service, `useNotificationStore`
- Added store selectors: `windDownEnabled`, `windDownLeadMinutes`, `caffeineCutoffEnabled`, `morningBriefEnabled`, setters
- Added handlers: `handleToggleWindDown`, `handleToggleCaffeineCutoff`, `handleToggleMorningBrief` — each calls setter then reschedules notifications via `schedulePlanNotifications(plan.blocks)`
- Added `handleWindDownLeadTime`: Alert with 30/45/60 min options, calls `setWindDown(true, minutes)` then reschedules
- NOTIFICATIONS section now renders: Wind-down reminder toggle, conditional lead time row (tappable, shows Alert), Caffeine cutoff reminder toggle, Morning brief toggle
- All existing toggles (sleep reminders, caffeine cutoff alerts, wake alarms) and scheduled count display preserved
- All preferences persisted via notification-store's AsyncStorage backing

Commit: `6fb19e3`

### Task 3: Checkpoint (Auto-approved)
Human verification checkpoint auto-approved per orchestrator directive in execution prompt.

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

All verification checks passed:
- `grep -n "useNightSkyMode" app/(tabs)/index.tsx` — matches at lines 10, 94
- `grep -n "priority" src/hooks/useNightSkyMode.ts` — matches (nap guard confirmed)
- `grep -n "windDownEnabled" app/(tabs)/settings.tsx` — matches at lines 158, 610, 613
- `grep -n "NightSkyOverlay" src/components/night-sky/index.ts` — match at line 1
- `npx tsc --noEmit` — only pre-existing errors in settings.tsx lines 430/432/437 (syncStatus Promise issue, deferred from Phase 3); zero new errors from this plan

## Known Stubs

None. All wiring connects real store data to real components.

## Self-Check: PASSED

Files created/modified:
- `src/hooks/useNightSkyMode.ts` — FOUND
- `src/hooks/index.ts` — FOUND (modified)
- `app/(tabs)/index.tsx` — FOUND (modified)
- `app/(tabs)/settings.tsx` — FOUND (modified)

Commits:
- `ca78ae2` — feat(04-04): useNightSkyMode hook and Today screen integration
- `6fb19e3` — feat(04-04): Settings notification preferences section
