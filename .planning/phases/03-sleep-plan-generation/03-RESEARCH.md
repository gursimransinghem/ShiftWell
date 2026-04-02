# Phase 3: Sleep Plan Generation - Research

**Researched:** 2026-04-02
**Domain:** Zustand state wiring, calendar write-back, React Native UI integration
**Confidence:** HIGH

## Summary

Phase 3 is fundamentally a wiring phase, not a build phase. The algorithm (`generateSleepPlan()`) is complete with 83 tests. The calendar write infrastructure (`writeSleepBlock`, `updateSleepBlock`, `deleteSleepBlock`) is built. A `plan-store.ts` already exists and already calls `generateSleepPlan()` with reactive subscriptions to `shiftsStore` and `userStore`.

The critical finding: `plan-store.ts` is partially built. It already handles `regeneratePlan()`, stores the result, and subscribes to shift/profile changes. What is missing: (1) calendar write-back after generation (Phase 2 only writes sleep blocks — full plan items like caffeine/meal/light are deferred to here), (2) consumption of the `recalculationNeeded` flag for Circadian Reset, (3) the `SchedulePreview` component on the Today screen, (4) debounce protection against rapid regeneration, and (5) the plan block → calendar event ID diff/update cycle.

The Today screen (`app/(tabs)/index.tsx`) already imports `usePlanStore`, renders plan blocks via `useTodayPlan`, and has a well-defined section architecture. Adding the schedule preview section is an incremental UI addition.

**Primary recommendation:** Extend `plan-store.ts` with calendar write-back and recalculation-consumed logic. Add a `SchedulePreview` component to the Today screen. All new code follows existing Zustand + AsyncStorage + pure-function patterns.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** `generateSleepPlan()` already exists — Phase 3 wires it to real calendar data, no algorithm changes needed.
- **D-02:** Plan generation triggers automatically after initial shift detection confirmation AND on every calendar sync that detects changes.
- **D-03:** The `markRecalculationNeeded` flag set by Phase 2's deletion path triggers plan regeneration here.
- **D-04:** Plan results written to calendars via two-tier strategy: full plan to ShiftWell calendar, sleep blocks only to native calendar.
- **D-05:** `UserProfile.commuteDuration` flows through to the algorithm — wake time = `shiftStart - commuteDuration - amRoutineDuration`. Verify it passes through correctly.
- **D-06:** If `commuteDuration` is 0 or not set, default to 30 minutes (existing behavior).
- **D-07:** Off days and recovery days (`DayType: 'off' | 'recovery'`) should not set an alarm. Algorithm already handles via `classifyDays()` — verify Today screen reflects "sleep in" messaging.
- **D-08:** Free morning = no shift AND no personal events with early start times. Personal events before 10am on off days still trigger a wake time.
- **D-09:** Today screen shows forward-looking preview: "3 nights next week — pre-adapt starting Thursday". Uses `detectPatterns()` which already returns upcoming shift pattern info.
- **D-10:** Preview section appears below the existing today timeline. Shows: upcoming shift count, next shift date/type, pre-adaptation suggestion if transitioning to/from nights.
- **D-11:** When calendar sync detects changes, regenerate sleep plan for the affected date range only (not the entire plan).
- **D-12:** After regeneration, diff old vs new plan blocks. Update/create/delete calendar events only for changed blocks (avoid event flickering).
- **D-13:** When shifts are removed (Circadian Reset), regenerate plan optimized for returning to core circadian rhythm.

### Claude's Discretion

- Preview message wording and formatting
- How much of the plan to show on the Today screen vs. just in the calendar
- Debounce timing for plan regeneration after rapid calendar changes
- Whether to show a "Plan generating..." loading state or generate silently

### Deferred Ideas (OUT OF SCOPE)

None — staying within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PLAN-01 | Algorithm generates complete sleep plan from calendar + profile data | `plan-store.ts` already calls `generateSleepPlan()` — need to verify calendar data feeds in correctly via `shiftsStore` and `personalEvents` |
| PLAN-02 | Plan includes: sleep windows, naps, caffeine cutoffs, meal timing, light protocols | Algorithm produces all block types — wiring to calendar write-back (ShiftWell calendar) is the gap |
| PLAN-03 | Plan accounts for commute time when calculating wake-up | `UserProfile.commuteDuration` is passed to algorithm; `computeSleepBlocks()` uses it; verify flow from onboarding store |
| PLAN-04 | Plan detects free mornings and extends sleep-in opportunity | Algorithm already handles via `classifyDays()` returning `'off'`/`'recovery'` DayType; D-08 adds personal event check |
| PLAN-05 | Plan provides schedule preview ("3 nights next week, pre-adapt starting Thursday") | `detectPatterns()` returns `nightStretchLengths`, `hardTransitions`, `consecutiveWorkDays` — new `SchedulePreview` component consumes this |
| PLAN-06 | Plan updates dynamically when calendar or profile changes | `plan-store.ts` already subscribes to shifts/profile changes; need to add recalculation-needed consumption and calendar write-back on update |
</phase_requirements>

---

## Standard Stack

### Core (all already in project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | 5.0.11 | State management for plan-store | Already used for all stores |
| @react-native-async-storage/async-storage | 3.0.1 | Persist plan state across sessions | Already used for shifts/calendar stores |
| expo-calendar | 55.0.10 | Write plan blocks as calendar events | Already used in Phase 2 |
| date-fns | 4.1.0 | Date arithmetic for plan block diffing | Already used throughout |

### No New Dependencies Required

All functionality is achievable with existing stack. Phase 3 adds no new packages.

**Verification:** `npm view zustand version` → 5.0.11 (confirmed in package.json). All packages already installed.

---

## Architecture Patterns

### Recommended Project Structure (additions only)
```
src/
├── store/
│   └── plan-store.ts           # EXTEND: add calendar write-back + recalculation consumer
├── components/
│   └── today/
│       ├── SchedulePreview.tsx  # NEW: forward-looking preview component
│       └── index.ts             # EXTEND: export SchedulePreview
app/
└── (tabs)/
    └── index.tsx                # EXTEND: add SchedulePreview section
```

### Pattern 1: Extend plan-store.ts — Calendar Write-Back

The existing `plan-store.ts` generates a plan but does not write it to the calendar. The gap is:
1. After `generateSleepPlan()` succeeds, call calendar write functions
2. Diff old plan blocks vs. new plan blocks before writing (D-12 anti-flicker)
3. The store needs to track `blockToEventIdMap: Record<string, string>` — mapping `planBlockId → calendarEventId` — to enable targeted updates

The `calendarStore.eventIdMap` already exists but maps `calendarEventId → planBlockId` (for Phase 2's cleanup path). Phase 3 needs the inverse mapping OR can use the same map with a lookup. Use the existing `mapEventId`/`removeEventId` actions; add a helper that inverts the map for plan-to-event lookups.

```typescript
// Source: src/store/plan-store.ts (existing pattern)
// After generateSleepPlan(), write only changed blocks:
async function writeChangedBlocks(
  oldPlan: SleepPlan | null,
  newPlan: SleepPlan,
  calStore: CalendarState,
): Promise<void> {
  const shiftWellCalId = calStore.shiftWellCalendarId;
  if (!shiftWellCalId) return;

  // Invert eventIdMap: planBlockId -> calendarEventId
  const planToEventId = Object.fromEntries(
    Object.entries(calStore.eventIdMap).map(([calId, planId]) => [planId, calId])
  );

  const oldBlockIds = new Set(oldPlan?.blocks.map(b => b.id) ?? []);
  const newBlockIds = new Set(newPlan.blocks.map(b => b.id));

  // Delete removed blocks
  for (const [calEventId, planBlockId] of Object.entries(calStore.eventIdMap)) {
    if (!newBlockIds.has(planBlockId)) {
      await deleteSleepBlock(calEventId, shiftWellCalId);
      calStore.removeEventId(calEventId);
    }
  }

  // Create or update new/changed blocks
  for (const block of newPlan.blocks) {
    // Two-tier: ShiftWell calendar gets all blocks; native gets only sleep/nap
    const existingEventId = planToEventId[block.id];
    if (existingEventId) {
      // Block existed before — update only if times changed
      const oldBlock = oldPlan?.blocks.find(b => b.id === block.id);
      if (oldBlock && blockChanged(oldBlock, block)) {
        await updateSleepBlock(existingEventId, block, shiftWellCalId);
      }
    } else {
      // New block — create it
      const newEventId = await writeSleepBlock(block, shiftWellCalId);
      calStore.mapEventId(newEventId, block.id);
    }
  }
}

function blockChanged(a: PlanBlock, b: PlanBlock): boolean {
  return a.start.getTime() !== b.start.getTime() ||
         a.end.getTime() !== b.end.getTime();
}
```

### Pattern 2: Circadian Reset — Consuming recalculationNeeded

The `shiftsStore.recalculationNeeded` array is populated by Phase 2's deletion path (D-16). Phase 3 must:
1. Subscribe to `recalculationNeeded` changes in `shiftsStore`
2. When non-empty, regenerate the plan and then clear the flag
3. After regeneration, the algorithm naturally produces a rest-optimized plan because the removed shifts are gone from the input

The Circadian Reset message on the Today screen is handled by `SchedulePreview` reading `plan.stats` and `detectPatterns()` output — specifically when `hardTransitions` are 0 (returning to baseline).

```typescript
// In plan-store.ts — add subscription:
useShiftsStore.subscribe((state, prevState) => {
  if (state.recalculationNeeded !== prevState.recalculationNeeded &&
      state.recalculationNeeded.length > 0) {
    usePlanStore.getState().regeneratePlan();
    // Clear the flag after consumption
    useShiftsStore.setState({ recalculationNeeded: [] });
  }
});
```

### Pattern 3: SchedulePreview Component

`detectPatterns()` returns `{ nightStretchLengths, hardTransitions, consecutiveWorkDays }`. This is called inside `generateSleepPlan()` but the result is embedded in `plan.stats`. For preview messaging, the `classifiedDays` array from the plan is needed.

The preview logic requires looking 7+ days forward, so it operates on `plan.classifiedDays` (available on `SleepPlan`):

```typescript
// Source: src/lib/circadian/classify-shifts.ts (detectPatterns signature)
// Input: ClassifiedDay[] — available as plan.classifiedDays
// Output: { nightStretchLengths: number[], hardTransitions: number, consecutiveWorkDays: number }

function buildPreviewMessage(plan: SleepPlan): string | null {
  const futureDays = plan.classifiedDays.filter(
    d => d.date > new Date() && d.date <= addDays(new Date(), 14)
  );
  const patterns = detectPatterns(futureDays);

  const nightCount = futureDays.filter(d => d.dayType === 'work-night').length;
  const nextNight = futureDays.find(d => d.dayType === 'work-night');
  const hasTransitionToNights = futureDays.some(d => d.dayType === 'transition-to-nights');

  if (nightCount > 0 && hasTransitionToNights) {
    const startDay = futureDays.find(d => d.dayType === 'transition-to-nights');
    const dayName = format(startDay!.date, 'EEEE');
    return `${nightCount} night${nightCount > 1 ? 's' : ''} ahead — pre-adapt starting ${dayName}`;
  }
  if (nightCount > 0) {
    return `${nightCount} night shift${nightCount > 1 ? 's' : ''} next 2 weeks`;
  }
  // Circadian Reset messaging
  if (plan.stats.nightShiftCount === 0 && plan.stats.circadianDebtScore < 20) {
    return 'Circadian Reset — returning to day rhythm';
  }
  return null;
}
```

### Pattern 4: Debounce for Rapid Regeneration

Calendar sync can fire multiple change events in quick succession. Without debouncing, `regeneratePlan()` would fire once per changed shift event.

Use a simple `setTimeout`-based debounce stored as a module-level ref. The plan-store already calls `regeneratePlan()` synchronously — wrapping it is safe:

```typescript
// In plan-store.ts:
let regenerateTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedRegenerate(ms = 500) {
  if (regenerateTimer) clearTimeout(regenerateTimer);
  regenerateTimer = setTimeout(() => {
    usePlanStore.getState().regeneratePlan();
    regenerateTimer = null;
  }, ms);
}
```

The 500ms default aligns with the "Claude's Discretion" area. This prevents redundant generations when Phase 2 `runCalendarSync()` adds/removes multiple shifts in a batch.

### Pattern 5: Two-Tier Calendar Write (D-04)

Phase 2 implemented write functions for Apple Calendar. The two-tier rule:
- **ShiftWell calendar** (`shiftWellCalendarId`): ALL plan block types (main-sleep, nap, caffeine-cutoff, meal-window, light-seek, light-avoid)
- **Native calendar** (`nativeWriteCalendarId`): Only `main-sleep` and `nap` blocks (sleep-only, less noise for the user's personal calendar)

The existing `writeSleepBlock()` builds titles as "Sleep — 11:00 PM" and "Nap — 2:30 PM". For non-sleep blocks written to ShiftWell calendar, a new `writePlanBlock()` function should handle the different block types (caffeine, meal, light) with appropriate titles.

### Anti-Patterns to Avoid

- **Re-generating the entire plan when only one shift changed:** D-11 says "regenerate for the affected date range." However, since `generateSleepPlan()` is pure and fast (< 5ms for 14 days), full regeneration is acceptable; the diff/update cycle in calendar write-back handles the "only update changed events" requirement.
- **Writing all blocks on every sync:** Always diff first (D-12). The `eventIdMap` in `calendarStore` is the source of truth for what's already written.
- **Modifying the circadian algorithm modules:** The 11 modules are IP with 83 tests. Any behavior change that seems needed in the algorithm is actually a wiring or profile-data issue.
- **Storing plan.blocks in AsyncStorage directly:** `SleepPlan.blocks` contain `Date` objects. If persisting the plan, use the same `dateAwareStorage` pattern from `shifts-store.ts` with custom serialization. Alternatively, don't persist the plan at all — regenerate on app launch (current behavior in `plan-store.ts`).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date diffing for changed blocks | Custom deep equality | `start.getTime() !== b.start.getTime()` comparison | Plan block identity is based on ID (stable) + times (what changes) |
| Sleep window calculation | Any custom sleep logic | `generateSleepPlan()` | 83 tests, pure, handles all edge cases |
| Shift pattern detection | Custom regex/heuristics | `detectPatterns()` | Already implemented and tested in classify-shifts.ts |
| Debounce utility | npm debounce library | `setTimeout` in module scope | Trivial use case, no library needed |
| Calendar event CRUD | Direct expo-calendar calls | `writeSleepBlock()`, `updateSleepBlock()`, `deleteSleepBlock()` | Phase 2 handles title formatting, alarms, error handling |

**Key insight:** The algorithm and calendar CRUD are done. Phase 3 is plumbing — connecting existing pipes, not building new ones.

---

## Common Pitfalls

### Pitfall 1: eventIdMap Inversion Needed for Write-Back

**What goes wrong:** `calendarStore.eventIdMap` stores `calendarEventId → planBlockId`. To check whether a plan block already has a calendar event, you need the inverse. If you iterate `newPlan.blocks` and try to look up `eventIdMap[block.id]`, you'll always get `undefined`.

**Why it happens:** The map was designed for Phase 2's deletion path (given a calendar event, find the plan block to clean up). Phase 3 needs the reverse.

**How to avoid:** Build the inverse map at the start of `writeChangedBlocks()`:
```typescript
const planToEventId = Object.fromEntries(
  Object.entries(calStore.eventIdMap).map(([calId, planId]) => [planId, calId])
);
```

**Warning signs:** Every plan regeneration creates duplicate calendar events instead of updating existing ones.

### Pitfall 2: recalculationNeeded Never Gets Cleared

**What goes wrong:** `shiftsStore.markRecalculationNeeded(shiftId)` appends to the array. If Phase 3 subscribes and regenerates but never calls `useShiftsStore.setState({ recalculationNeeded: [] })`, the plan will keep regenerating on every subsequent state change.

**Why it happens:** The flag is a persistent array in Zustand (and AsyncStorage). It's written to by Phase 2 and consumed by Phase 3 — but the "consume" step must include clearing.

**How to avoid:** After `regeneratePlan()` is triggered by `recalculationNeeded`, clear the array: `useShiftsStore.setState({ recalculationNeeded: [] })`.

**Warning signs:** `regeneratePlan()` is called in a tight loop; plan generation log shows multiple consecutive generations without new shifts being added.

### Pitfall 3: Plan Block IDs Are Date-Derived — Regeneration Produces New IDs

**What goes wrong:** If `PlanBlock.id` values are generated with `Date.now()` or random strings on each `generateSleepPlan()` call, the diff logic will think every block is new and delete/recreate all calendar events on every sync.

**Actual behavior:** Block IDs follow the pattern `"YYYY-MM-DD-main-sleep"`, `"YYYY-MM-DD-wind-down"` (verified in `resolveOverlaps()` which checks `b.id.replace('-wind-down', '-main-sleep')`). This means IDs are stable across regenerations for the same date range — the diff will correctly identify changed vs. unchanged blocks.

**How to avoid:** Trust the ID scheme. Do not regenerate IDs. The `blockChanged()` comparison on start/end times is the correct change detection mechanism.

**Warning signs:** All calendar events are deleted and recreated on every sync, causing event "flickering" (D-12 anti-pattern).

### Pitfall 4: detectPatterns() Returns Past + Future Mixed

**What goes wrong:** `detectPatterns(plan.classifiedDays)` operates on the entire planning window including past days. `nightStretchLengths` will include stretches that already happened. The SchedulePreview should show forward-looking data only.

**Why it happens:** `plan.classifiedDays` spans from `now` to `now+14`. But if the plan was generated some hours ago and covers a period that started in the past, the first few classified days may be today or yesterday.

**How to avoid:** Filter `plan.classifiedDays` to only future days before calling `detectPatterns()` for UI messaging:
```typescript
const futureDays = plan.classifiedDays.filter(d => d.date >= startOfDay(new Date()));
const patterns = detectPatterns(futureDays);
```

**Warning signs:** Preview says "0 nights ahead" when there are clearly upcoming nights.

### Pitfall 5: Google Calendar Write-Back Not Implemented

**What goes wrong:** Phase 2 built Apple Calendar write functions. There are no Google Calendar event creation functions (only read/sync). Phase 3's two-tier write-back needs to check the provider.

**Actual state:** Phase 2 `calendar-service.ts` has `writeSleepBlock()`, `updateSleepBlock()`, `deleteSleepBlock()` for Apple Calendar only. The ShiftWell calendar is an Apple calendar created by `getOrCreateShiftWellCalendar()`. Google Calendar write-back was NOT built in Phase 2.

**How to avoid:** For Phase 3, write-back goes to the ShiftWell Apple calendar only. Google Calendar write-back is a future enhancement. The `writeToNativeCalendar` flag in `calendarStore` already has this distinction — the native write goes to the Apple calendar specified by `nativeWriteCalendarId`.

**Warning signs:** Attempting to write to `googleConnected` users' primary Google Calendar — this will fail with a network error since no Google Calendar write API is implemented.

---

## Code Examples

Verified patterns from existing codebase:

### Accessing plan.classifiedDays for preview
```typescript
// Source: src/store/plan-store.ts + src/lib/circadian/types.ts
// SleepPlan.classifiedDays is ClassifiedDay[] — available on the plan object
const plan = usePlanStore(s => s.plan);
const futureDays = plan?.classifiedDays.filter(
  d => d.date >= startOfDay(new Date())
) ?? [];
```

### Reading commuteDuration from UserProfile
```typescript
// Source: src/lib/circadian/types.ts
// UserProfile.commuteDuration: number (minutes)
// DEFAULT_PROFILE.commuteDuration = 30
// Stored in user-store.ts as profile.commuteDuration
const profile = useUserStore(s => s.profile);
// Passed directly to generateSleepPlan() — algorithm uses it in computeSleepBlocks()
```

### Existing plan-store subscribe pattern
```typescript
// Source: src/store/plan-store.ts (lines 78-91)
// Already established — Phase 3 adds one more subscription for recalculationNeeded
useShiftsStore.subscribe((state, prevState) => {
  if (state.shifts !== prevState.shifts) {
    usePlanStore.getState().regeneratePlan();
  }
});
```

### detectPatterns() return shape
```typescript
// Source: src/lib/circadian/classify-shifts.ts (lines 202-248)
// Returns: { nightStretchLengths: number[], hardTransitions: number, consecutiveWorkDays: number }
// nightStretchLengths: array of consecutive night shift run lengths (e.g., [3, 2] = two stretches)
// hardTransitions: count of transition-to-nights + recovery days
// consecutiveWorkDays: max consecutive work days in the period
```

### Writing a plan block to ShiftWell calendar
```typescript
// Source: src/lib/calendar/calendar-service.ts (lines 118-128)
// writeSleepBlock handles title formatting and alarm attachment
// Only works for main-sleep and nap block types per existing title builder
// For other block types (caffeine, meal, light), a new writePlanBlock() is needed
const eventId = await writeSleepBlock(block, shiftWellCalendarId);
calendarStore.mapEventId(eventId, block.id);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| plan-store without calendar write-back | Phase 2 deferred calendar writes for full plan items | Phase 2 completion (D-10) | Phase 3 must implement the full-plan write-back that Phase 2 intentionally deferred |
| No recalculationNeeded flag | Phase 2 added `markRecalculationNeeded()` to shifts-store | Phase 2 completion | Phase 3 is the designated consumer; the contract is already established |
| plan-store generates plan but has no persistence | Current plan-store: no AsyncStorage persist | App launch triggers `regeneratePlan()` from subscribers | Acceptable — plan regenerates fast (<5ms), no persistence needed |

**Current state:** `plan-store.ts` already exists with `regeneratePlan()`, `isGenerating`, `error`, and reactive subscriptions. The Today screen already renders plan blocks. Phase 3 fills three specific gaps: calendar write-back, `recalculationNeeded` consumption, and SchedulePreview UI.

---

## Open Questions

1. **writePlanBlock() for non-sleep block types**
   - What we know: `writeSleepBlock()` only formats titles for `main-sleep` and `nap`. Caffeine, meal, light blocks have different label patterns.
   - What's unclear: Should non-sleep blocks (caffeine, meal, light) be written to ShiftWell calendar in Phase 3? D-04 says "full plan to ShiftWell calendar" — yes.
   - Recommendation: Add `writePlanBlock(block, calendarId)` that handles all `SleepBlockType` values with appropriate title formatting. Use `block.label` (already human-readable per type) as the title base.

2. **Partial date range regeneration (D-11)**
   - What we know: D-11 says "regenerate for the affected date range, not the entire plan." The `setDateRange()` action exists.
   - What's unclear: "Affected date range" means the dates containing changed shifts. Requires extracting the shift's date ± buffer before regenerating.
   - Recommendation: For Phase 3, full 14-day regeneration is acceptable since `generateSleepPlan()` is pure and fast. The "affected range" optimization is premature. The diff logic (D-12) ensures only changed calendar events are touched. Mark as technical debt but don't block Phase 3 delivery.

3. **SchedulePreview: Circadian Reset detection logic**
   - What we know: `plan.stats.nightShiftCount` and `plan.stats.circadianDebtScore` are available. D-13 describes the behavior.
   - What's unclear: Exact threshold for "returning to core rhythm" messaging vs. "normal off day" messaging.
   - Recommendation: Show Circadian Reset message when: `recalculationNeeded` was recently consumed AND `plan.stats.nightShiftCount === 0` for the next 7 days. The "recently consumed" part needs a flag (e.g., `lastResetAt: Date | null` in plan-store).

---

## Environment Availability

Step 2.6: SKIPPED — Phase 3 is code/config changes only. All runtime dependencies (expo-calendar, AsyncStorage, expo-secure-store) are already installed and validated in Phase 2.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.3.0 with ts-jest 29.4.6 |
| Config file | `jest.config.js` (root) |
| Quick run command | `npx jest --testPathPattern="plan" --passWithNoTests` |
| Full suite command | `npx jest --passWithNoTests` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PLAN-01 | `generateSleepPlan()` called with calendar shifts + user profile | unit | `npx jest --testPathPattern="plan-store" -x` | ❌ Wave 0 |
| PLAN-02 | All block types produced and written to ShiftWell calendar | unit | `npx jest --testPathPattern="plan-store" -x` | ❌ Wave 0 |
| PLAN-03 | `commuteDuration` from user profile reaches algorithm | unit | `npx jest --testPathPattern="plan-store" -x` | ❌ Wave 0 |
| PLAN-04 | Off/recovery days → no alarm block in plan | unit | `npx jest --testPathPattern="plan-store" -x` | ❌ Wave 0 |
| PLAN-05 | `SchedulePreview` renders correct message for upcoming nights | unit | `npx jest --testPathPattern="SchedulePreview" -x` | ❌ Wave 0 |
| PLAN-06 | Shift change triggers plan regeneration + calendar diff | unit | `npx jest --testPathPattern="plan-store" -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest --passWithNoTests --silent` (full suite, 237 tests run in ~4s — fast enough for every commit)
- **Per wave merge:** Same as per task — suite is fast
- **Phase gate:** 237 + new Phase 3 tests green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `__tests__/store/plan-store.test.ts` — covers PLAN-01, PLAN-02, PLAN-03, PLAN-04, PLAN-06
- [ ] `__tests__/components/SchedulePreview.test.tsx` — covers PLAN-05 (or can be manual-only given React Native rendering complexity)
- [ ] `__mocks__/expo-notifications.ts` — already exists via `notification-service` mock if needed

*(Note: React component tests for `SchedulePreview` may require `@testing-library/react-native` which is not in devDependencies. If not available, PLAN-05 becomes manual-only. The store tests (PLAN-01 through PLAN-04, PLAN-06) are pure Node.js and require no new testing infrastructure.)*

---

## Sources

### Primary (HIGH confidence)
- Direct file read: `src/lib/circadian/index.ts` — `generateSleepPlan()` signature, pipeline, all exports
- Direct file read: `src/lib/circadian/types.ts` — `SleepPlan`, `PlanBlock`, `UserProfile`, `ClassifiedDay` shapes
- Direct file read: `src/store/plan-store.ts` — existing plan-store structure, subscriptions, `regeneratePlan()` implementation
- Direct file read: `src/lib/calendar/calendar-service.ts` — `writeSleepBlock`, `updateSleepBlock`, `deleteSleepBlock`, `runCalendarSync()` with D-16 note
- Direct file read: `src/lib/calendar/calendar-store.ts` — `eventIdMap`, `mapEventId`, `removeEventId` interface
- Direct file read: `src/store/shifts-store.ts` — `recalculationNeeded`, `markRecalculationNeeded()`, `getCalendarSyncedShiftIds()`
- Direct file read: `app/(tabs)/index.tsx` — Today screen structure, existing section layout
- Direct file read: `src/lib/circadian/classify-shifts.ts` — `detectPatterns()` return shape
- Direct file read: `jest.config.js`, `package.json` — test infrastructure, installed packages

### Secondary (MEDIUM confidence)
- Jest run output: "237 passed, 237 total" — confirmed current test baseline

---

## Project Constraints (from CLAUDE.md)

No `CLAUDE.md` found in `/Users/claud/Projects/ShiftWell/`. Project-level constraints come from the global CLAUDE.md and STATE.md decisions:

- **Do NOT modify circadian algorithm modules** — 11 modules, 83 tests, IP. Wire it, don't change it.
- **No new npm dependencies** — all functionality achievable with existing stack.
- **Keep files under 500 lines** — `plan-store.ts` is currently 91 lines; write-back additions should stay within this limit or split into `plan-write-service.ts`.
- **Run tests after every code change** — `npx jest --passWithNoTests --silent` (confirmed ~4s runtime).
- **Zustand + AsyncStorage pattern** — match existing store patterns exactly.
- **Pure functions for algorithm** — no side effects inside `generateSleepPlan()` or its modules.
- **Google Calendar write-back is NOT implemented** — write-back goes to ShiftWell Apple calendar only.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already in project, verified in package.json
- Architecture: HIGH — based on direct code reads, not training data
- Pitfalls: HIGH — identified from direct inspection of existing code contracts (eventIdMap direction, recalculationNeeded clearing, block ID stability)
- Algorithm behavior: HIGH — source code read directly, 83 tests already validate it

**Research date:** 2026-04-02
**Valid until:** 2026-06-01 (stable codebase, no external API dependencies added)
