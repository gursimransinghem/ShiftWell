# Phase 5: Live Activities & Recovery Score - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning
**Source:** Auto-generated (autonomous execution mode)

<domain>
## Phase Boundary

Two capabilities: (1) Live Activities on Dynamic Island and Lock Screen showing sleep countdown/status, and (2) Shift Readiness Score based on plan adherence displayed on the Today screen with trends over time.

</domain>

<decisions>
## Implementation Decisions

### Live Activities
- **D-01:** Live Activities require ActivityKit (iOS 16.2+). In Expo, this means a native Swift widget extension via expo-live-activities or a custom config plugin. Research needed on best approach with Expo SDK 55.
- **D-02:** Three states: Wind-down countdown → Bedtime ("Sleep" message with logo) → Morning (score or AM routine countdown).
- **D-03:** Wind-down Live Activity starts automatically when Night Sky Mode would activate (plan's wind-down block start).
- **D-04:** Live Activity transitions are scheduled based on plan block times, not real-time detection.

### Recovery Score (Shift Readiness Score)
- **D-05:** Score = plan adherence metric. Compare actual behavior against planned blocks. For v1.0 (no HealthKit feedback), this is based on: (a) did the user receive/not-dismiss notifications on time, (b) did Night Sky Mode activate, (c) were sleep blocks not manually deleted.
- **D-06:** Score displayed prominently on Today screen — large circular score indicator similar to Apple Activity rings.
- **D-07:** Score trends: store daily scores, show a 7-day sparkline or bar chart on the Today screen.
- **D-08:** The existing `useRecoveryScore.ts` hook already exists in `src/hooks/` — extend it, don't rebuild.

### Claude's Discretion
- Live Activities implementation approach (expo-live-activities vs. custom config plugin vs. stub)
- Score calculation formula details
- Score visualization design (ring, gauge, number)
- Trend chart library choice (if needed)

</decisions>

<canonical_refs>
## Canonical References

### Existing Recovery Score
- `src/hooks/useRecoveryScore.ts` — Existing hook (may need extension)

### Plan Data
- `src/store/plan-store.ts` — Current plan, blocks, lastResetAt
- `src/lib/circadian/types.ts` — PlanBlock, SleepPlan, PlanStats

### Today Screen
- `app/(tabs)/index.tsx` — Today screen (add score display)
- `src/components/today/` — Existing components

### Design System
- `src/theme/colors.ts` — ACCENT.primary '#C8A84B'

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useRecoveryScore.ts` — Existing hook, check what it already computes
- `plan-store.ts` — Plan data for adherence calculation
- Notification history — Can infer adherence from notification delivery/timing

### Integration Points
- Today screen — Score display, trend chart
- Live Activity — May need native module or Expo plugin

</code_context>

<specifics>
## Specific Ideas

- Live Activities is the most technically challenging part — may require deferring full implementation if Expo SDK 55 support is limited. A well-designed stub that's ready for ActivityKit when available is acceptable for TestFlight.
- Recovery Score should feel motivating, not punitive. The visual should emphasize progress and streaks, not failures.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>

---

*Phase: 05-live-activities-recovery-score*
*Context gathered: 2026-04-02*
