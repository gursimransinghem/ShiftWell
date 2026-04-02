# Phase 3: Sleep Plan Generation - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning
**Source:** Auto-generated (autonomous execution mode — decisions based on established project preferences)

<domain>
## Phase Boundary

Wire the existing circadian algorithm (`generateSleepPlan()`) to Phase 2's calendar sync infrastructure. When shifts are detected from connected calendars, automatically generate a complete sleep plan and write it back as calendar events. Plan recalculates dynamically when calendar changes. The Today screen shows schedule preview messages.

</domain>

<decisions>
## Implementation Decisions

### Plan Generation Pipeline
- **D-01:** `generateSleepPlan()` already exists and produces: sleep windows, naps, caffeine cutoffs, meal timing, light protocols. Phase 3 wires this to real calendar data — no algorithm changes needed.
- **D-02:** Plan generation triggers automatically after initial shift detection (Phase 2 review screen confirmation) and on every calendar sync that detects changes.
- **D-03:** The `markRecalculationNeeded` flag set by Phase 2's D-16 deletion path triggers plan regeneration here.
- **D-04:** Plan results are written to calendars via Phase 2's two-tier strategy: full plan to ShiftWell calendar, sleep blocks only to native calendar.

### Commute-Aware Wake Times
- **D-05:** `UserProfile.commuteDuration` (captured in Phase 1 onboarding) is already used by the algorithm. Verify it flows through correctly — wake time should be `shiftStart - commuteDuration - amRoutineDuration`.
- **D-06:** If commute duration is 0 or not set, default to 30 minutes (existing behavior from Phase 1).

### Free Morning Detection
- **D-07:** Off days and recovery days (`DayType: 'off' | 'recovery'`) should not set an alarm. The algorithm already handles this via `classifyDays()` — verify the Today screen reflects "sleep in" messaging.
- **D-08:** Free morning = no shift AND no personal events with early start times. Personal events before 10am on off days should still trigger a wake time.

### Schedule Preview (Today Screen)
- **D-09:** Today screen shows a forward-looking preview: "3 nights next week — pre-adapt starting Thursday". Uses `detectPatterns()` from the algorithm which already returns upcoming shift pattern info.
- **D-10:** Preview section appears below the existing today timeline. Shows: upcoming shift count, next shift date/type, pre-adaptation suggestion if transitioning to/from nights.

### Dynamic Rescheduling
- **D-11:** When calendar sync detects changes (Phase 2 `runCalendarSync`), regenerate the sleep plan for the affected date range (not the entire plan).
- **D-12:** After regeneration, diff old vs new plan blocks. Update/create/delete calendar events only for changed blocks (avoid event flickering — Phase 2 anti-pattern).
- **D-13:** The Circadian Reset behavior (D-16 from Phase 2): when shifts are removed, regenerate plan optimized for returning to core circadian rhythm.

### Claude's Discretion
- Preview message wording and formatting
- How much of the plan to show on the Today screen vs. just in the calendar
- Debounce timing for plan regeneration after rapid calendar changes
- Whether to show a "Plan generating..." loading state or generate silently

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Circadian Algorithm
- `src/lib/circadian/index.ts` — Main entry: `generateSleepPlan()` pipeline
- `src/lib/circadian/types.ts` — `SleepPlan`, `PlanBlock`, `ClassifiedDay`, `UserProfile`, `PlanStats`
- `src/lib/circadian/classify-shifts.ts` — `classifyDays()`, `detectPatterns()`
- `src/lib/circadian/sleep-windows.ts` — `computeSleepBlocks()`
- `src/lib/circadian/nap-engine.ts` — `generateNaps()`
- `src/lib/circadian/caffeine.ts` — `computeCaffeineCutoff()`, `computeCaffeineWindow()`
- `src/lib/circadian/meals.ts` — `generateMealWindows()`
- `src/lib/circadian/light-protocol.ts` — `generateLightProtocol()`

### Calendar Infrastructure (Phase 2)
- `src/lib/calendar/calendar-service.ts` — `runCalendarSync()`, `writeSleepBlock()`, `updateSleepBlock()`, `deleteSleepBlock()`, `fetchAllEvents()`, `getOrCreateShiftWellCalendar()`
- `src/lib/calendar/calendar-store.ts` — Zustand store with calendar state + `markRecalculationNeeded`
- `src/lib/calendar/calendar-types.ts` — `RawCalendarEvent`, `CalendarMeta`
- `src/lib/calendar/shift-detector.ts` — `shiftConfidence()`, `separateShiftsFromPersonalWithConfidence()`

### UI
- `app/(tabs)/index.tsx` — Today screen (add preview section here)
- `src/components/today/` — Existing Today screen components

### Design System
- `src/theme/colors.ts` — Blend design tokens

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `generateSleepPlan()` — Complete algorithm, 83 tests, pure functions. Takes shifts + profile → full plan.
- `detectPatterns()` — Returns upcoming shift patterns (transitions, night stretches). Use for preview messaging.
- `writeSleepBlock()`, `updateSleepBlock()`, `deleteSleepBlock()` — Calendar event CRUD from Phase 2.
- `calendar-store.ts` — Has `markRecalculationNeeded` flag already wired by Phase 2 D-16.

### Established Patterns
- Zustand + AsyncStorage for state
- Pure functions for algorithm (no side effects)
- Calendar events written via expo-calendar (Apple) and REST API (Google)
- Test-driven with Jest, 237 tests passing

### Integration Points
- `runCalendarSync()` in calendar-service.ts — After shift detection, trigger plan generation
- Today screen (`app/(tabs)/index.tsx`) — Add schedule preview section
- Calendar store — Store generated plan, manage plan block → calendar event ID mapping
- Background sync — Plan regeneration on calendar change detection

</code_context>

<specifics>
## Specific Ideas

- Circadian Reset: This is the flagship selling feature. When shifts are removed, the algorithm should optimize for returning to core circadian rhythm — not just delete sleep blocks. The preview messaging should reflect this: "Night shifts end Friday — Circadian Reset plan active through Monday."
- The algorithm is the IP — 11 modules, 83 tests. Do NOT modify the core algorithm. Wire it, don't change it.

</specifics>

<deferred>
## Deferred Ideas

None — staying within phase scope.

</deferred>

---

*Phase: 03-sleep-plan-generation*
*Context gathered: 2026-04-02 (auto-generated for autonomous execution)*
