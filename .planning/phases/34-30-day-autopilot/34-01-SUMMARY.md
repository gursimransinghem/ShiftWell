---
phase: 34-30-day-autopilot
plan: "01"
subsystem: adaptive-brain
tags: [autopilot, transparency, eligibility, bounds, zustand]
dependencies:
  requires: [plan-store, score-store, premium-store, adaptive-brain]
  provides: [autopilot-store, eligibility-check, bounds-validator, activation-card, transparency-log-screen]
  affects: [today-screen, settings-screen]
tech-stack:
  added: [date-fns/differenceInDays, Share API]
  patterns: [zustand-persist, tdd-node, atomic-store, transparency-log]
key-files:
  created:
    - src/lib/autopilot/eligibility.ts
    - src/lib/autopilot/bounds.ts
    - src/lib/autopilot/__tests__/autopilot.test.ts
    - src/store/autopilot-store.ts
    - src/components/AutopilotActivationCard.tsx
    - src/screens/TransparencyLogScreen.tsx
    - app/autopilot-log.tsx
  modified:
    - app/_layout.tsx
decisions:
  - "[Phase 34-01]: Dual gate for eligibility: 30 days AND 20 score records — both required, neither alone is sufficient"
  - "[Phase 34-01]: Separate autopilot-store from plan-store — richer schema (id, type enum, accepted, boundsViolations) for full transparency log screen vs plan-store's lightweight AutopilotState for real-time gating"
  - "[Phase 34-01]: isWithinBounds validates bedtime AND wake shift independently, each capped at 30 min — prevents gaming by shifting only one time"
  - "[Phase 34-01]: generateId() inline (timestamp + random) avoids nanoid dependency — sufficient collision resistance for a local log capped at 100 entries"
  - "[Phase 34-01]: 7-day dismiss cooldown for activation card via cardDismissedAt persisted to AsyncStorage"
  - "[Phase 34-01]: TransparencyLogScreen at app/autopilot-log.tsx as root Stack modal — consistent with add-shift, import, paywall patterns"
metrics:
  duration: 7min
  completed_date: "2026-04-07"
  tasks_completed: 2
  files_created: 7
  files_modified: 1
  tests_added: 16
---

# Phase 34 Plan 01: 30-Day Autopilot — Eligibility, Bounds, Store, and UI

**One-liner:** 30-day + 20-record dual-gate eligibility, 30-min safety bounds validator, Zustand transparency log store with 100-entry cap, gold activation card with 7-day dismiss, and full-screen log with accepted/rejected styling and share export.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Autopilot eligibility, bounds, store (TDD) | 777a590 | eligibility.ts, bounds.ts, autopilot-store.ts, autopilot.test.ts |
| 2 | Activation card and transparency log screen | 5266f08 | AutopilotActivationCard.tsx, TransparencyLogScreen.tsx, autopilot-log.tsx |

## What Was Built

### Task 1: Core Logic (TDD)

**`src/lib/autopilot/eligibility.ts`**
`isEligibleForAutopilot(installedAt, scoreHistoryCount)` — dual gate using `date-fns/differenceInDays`. Returns `{ eligible, daysInstalled, scoreRecords, reason? }`. Reason strings are human-readable ("Need 5 more days before Autopilot can activate"). Handles malformed dates gracefully (day 0 fallback).

**`src/lib/autopilot/bounds.ts`**
`isWithinBounds(proposedChange)` — validates all four constraints:
1. Bedtime shift ≤ 30 min (absolute diff, midnight-crossing aware)
2. Wake shift ≤ 30 min (same)
3. Proposed sleep ≥ 6h
4. Proposed sleep ≤ 10h

Returns `{ withinBounds, violations: string[] }` — violations go straight to transparency log.

**`src/store/autopilot-store.ts`**
Standalone Zustand store (not part of plan-store). Schema:
- `TransparencyLogEntry`: `id | timestamp | type | description | proposedChange? | boundsViolations? | accepted`
- Types: `activation | plan_change | user_disabled | bounds_rejection`
- 100-entry cap (trim oldest)
- `enable()` appends activation entry; `disable()` appends user_disabled entry (idempotent enable)
- `cardDismissedAt` persisted for 7-day dismiss cooldown

**16 tests passing** via TDD (RED then GREEN).

### Task 2: UI Components

**`src/components/AutopilotActivationCard.tsx`**
- Shown when `eligible=true && enabled=false && !dismissedRecently`
- Gold `speedometer-outline` icon, feature bullets with checkmarks
- Full-width gold "Enable Autopilot" button → brief success animation → card hides
- "Not Now" text link → 7-day dismiss via `cardDismissedAt`

**`src/screens/TransparencyLogScreen.tsx`**
- `SafeAreaView` with `FlatList` (newest first)
- Entry colors: green (plan_change/accepted), orange (bounds_rejection), blue (activation), gray (user_disabled)
- Tap entry to expand absolute timestamp
- `proposedChange` shown as `"Bedtime: 11:00 PM → 10:40 PM"` (green if accepted, strikethrough-orange if rejected)
- `boundsViolations` shown inline under rejected entries
- Status chip + `Switch` to toggle autopilot from within the log
- Share button (top right) exports full log as plain text via `Share` API
- Empty state: guidance copy when log is empty
- Footer: science disclaimer shown when log has entries

**`app/autopilot-log.tsx`** — Expo Router modal screen wrapping `TransparencyLogScreen` with `router.back()` close handler. Registered as `presentation: 'modal'` in `app/_layout.tsx`.

## Verification Results

1. `npx jest src/lib/autopilot/ --passWithNoTests` — **16/16 tests passing** ✓
2. `npx tsc --noEmit | grep autopilot` — **zero errors** ✓
3. `grep transparencyLog|logDecision src/store/autopilot-store.ts` — **log functions present** ✓
4. `grep isWithinBounds|MAX_SHIFT src/lib/autopilot/bounds.ts` — **safety bounds defined** ✓
5. Full test suite: 908 tests, 903 passing, 5 pre-existing failures (unrelated to this plan)

## Deviations from Plan

### Auto-fixed Issues

None.

### Architecture Notes

**Existing vs new types:** The codebase had `src/lib/adaptive/autopilot.ts` (with `AutopilotState` used in plan-store) and `src/lib/adaptive/transparency-log.ts` (with `TransparencyEntry`). The plan called for new, separate files with a richer schema. Both coexist:
- `src/lib/adaptive/autopilot.ts` — lightweight state type for real-time gating in `useAdaptivePlan`
- `src/store/autopilot-store.ts` — full persistence store with typed log entries for the Settings UI

This mirrors the existing pattern where plan-store holds the light autopilot state and the new store holds the full history.

**Route placement:** Plan said "check existing navigation structure" — placed as root Stack modal (same pattern as `add-shift.tsx`, `import.tsx`) rather than nested under `(tabs)/settings/` since the tabs use a single flat file (`settings.tsx`, not a directory).

## Checkpoint: Awaiting Human Verification

The plan includes a `checkpoint:human-verify` gate. See the checkpoint section below.

## Known Stubs

None — all components read from live `useAutopilotStore()` state. Log is empty on first use by design (empty state UI is shown).

## Self-Check: PASSED
