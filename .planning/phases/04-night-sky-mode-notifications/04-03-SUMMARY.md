---
phase: 04-night-sky-mode-notifications
plan: "03"
subsystem: night-sky-ui
tags: [animation, reanimated, svg, night-sky, components]
one_liner: "Night Sky visual components — 30-particle star field, SVG recharge arc with Reanimated 4, 6s tip cycler, full-screen overlay shell"
dependency_graph:
  requires:
    - 04-01 (react-native-svg installed, Reanimated v4.2.1, theme tokens)
    - 04-02 (notification-store for wind-down state — consumed by Plan 04-04)
  provides:
    - NightSkyOverlay full-screen UI shell with alarm time + wake time + tomorrow schedule
    - StarParticles 30-particle animated field
    - RechargeArc SVG arc with animated strokeDashoffset
    - BedtimeTipCycler 3-tip 6s interval cycler
  affects:
    - 04-04 (will import NightSkyOverlay to show on Today screen during wind-down window)
tech_stack:
  added: []
  patterns:
    - "react-native-reanimated createAnimatedComponent at module scope for SVG Circle"
    - "useMemo with deterministic pseudoRandom seed for particle positions"
    - "React useEffect (not reanimated useEffect) — useEffect not exported from reanimated v4.2.1"
key_files:
  created:
    - src/components/night-sky/StarParticles.tsx
    - src/components/night-sky/RechargeArc.tsx
    - src/components/night-sky/BedtimeTipCycler.tsx
    - src/components/night-sky/NightSkyOverlay.tsx
    - src/components/night-sky/index.ts
  modified: []
decisions:
  - "useEffect from react (not react-native-reanimated) — reanimated v4.2.1 does not export useEffect as named export"
  - "pseudoRandom seed function instead of Math.random in useMemo — deterministic values prevent re-render churn"
  - "NightSkyOverlayProps exported from NightSkyOverlay.tsx and re-exported from index.ts — enables typed usage in Plan 04-04"
metrics:
  duration: "3 min"
  completed_date: "2026-04-02"
  tasks_completed: 2
  files_created: 5
  files_modified: 0
---

# Phase 04 Plan 03: Night Sky Visual Components Summary

Night Sky visual components — 30-particle star field, SVG recharge arc with Reanimated 4, 6s tip cycler, full-screen overlay shell.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | StarParticles and RechargeArc | fc6ee9a | StarParticles.tsx, RechargeArc.tsx |
| 2 | BedtimeTipCycler and NightSkyOverlay shell | c905bb2 | BedtimeTipCycler.tsx, NightSkyOverlay.tsx, index.ts |

## What Was Built

**StarParticles.tsx** — 30 animated star dots generated via `useMemo` with a deterministic `pseudoRandom` seed function. Each particle gets individual `useSharedValue` for opacity and translateY, driven by `withRepeat`/`withSequence`/`withDelay` loops. `cancelAnimation` cleanup on unmount.

**RechargeArc.tsx** — SVG circular arc (`react-native-svg`) driven by Reanimated 4 `useAnimatedProps` on `strokeDashoffset`. `AnimatedCircle = Animated.createAnimatedComponent(Circle)` at module scope. Arc fills proportionally to `fillFraction` (0.0–1.0) with 1500ms `Easing.out(Easing.cubic)` animation. Shows percentage label centered inside the arc.

**BedtimeTipCycler.tsx** — cycles 3 bedtime tips (water, phone, thermostat) on a 6-second `setInterval`. Tips are static constants. `clearInterval` cleanup on unmount.

**NightSkyOverlay.tsx** — full-screen `position:absolute` shell combining all sub-components. Props: `alarmTime`, `latestWakeTime`, `tomorrowSchedule`, `fillFraction`, `onDismiss`. Renders: star field background, sleep quality arc, alarm time, latest wake time, tomorrow schedule (max 3 items), bedtime tip cycler.

**index.ts** — barrel export for all four components plus `NightSkyOverlayProps` type.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `useEffect` not exported from react-native-reanimated v4**
- **Found during:** Task 1 (TypeScript check)
- **Issue:** Plan specified `import { useEffect } from 'react-native-reanimated'` but reanimated v4.2.1 does not export `useEffect` as a named export. TypeScript error: `Module '"react-native-reanimated"' has no exported member 'useEffect'`.
- **Fix:** Changed to `import { useEffect } from 'react'` in both StarParticles.tsx and RechargeArc.tsx. Reanimated shared value mutations via `withTiming`/`withRepeat` are thread-safe when called from React's useEffect.
- **Files modified:** StarParticles.tsx, RechargeArc.tsx
- **Commit:** fc6ee9a

## Known Stubs

None — all components wire real props. `fillFraction`, `alarmTime`, `latestWakeTime`, and `tomorrowSchedule` are passed directly through to rendering. Wiring to live data (plan-store) occurs in Plan 04-04.

## Verification Results

- `ls src/components/night-sky/` — 5 files confirmed
- `grep -n "NightSkyOverlayProps" NightSkyOverlay.tsx` — found line 13
- `grep -n "fillFraction" RechargeArc.tsx` — found lines 26, 32, 33, 36, 41, 47
- `grep -n "TIPS" BedtimeTipCycler.tsx` — found with 3 tip entries
- `npx tsc --noEmit 2>&1 | grep night-sky` — empty (no TS errors)
