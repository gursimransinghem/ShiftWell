# Phase 5: Live Activities & Recovery Score - Research

**Researched:** 2026-04-02
**Domain:** iOS ActivityKit / expo-widgets alpha, plan-adherence scoring without HealthKit, score visualization
**Confidence:** MEDIUM overall (Live Activities: LOW-MEDIUM due to alpha status; Recovery Score: HIGH)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Live Activities require ActivityKit (iOS 16.2+). In Expo, this means a native Swift widget extension via expo-live-activities or a custom config plugin. Research needed on best approach with Expo SDK 55.
- **D-02:** Three states: Wind-down countdown → Bedtime ("Sleep" message with logo) → Morning (score or AM routine countdown).
- **D-03:** Wind-down Live Activity starts automatically when Night Sky Mode would activate (plan's wind-down block start).
- **D-04:** Live Activity transitions are scheduled based on plan block times, not real-time detection.
- **D-05:** Score = plan adherence metric. Compare actual behavior against planned blocks. For v1.0 (no HealthKit feedback), this is based on: (a) did the user receive/not-dismiss notifications on time, (b) did Night Sky Mode activate, (c) were sleep blocks not manually deleted.
- **D-06:** Score displayed prominently on Today screen — large circular score indicator similar to Apple Activity rings.
- **D-07:** Score trends: store daily scores, show a 7-day sparkline or bar chart on the Today screen.
- **D-08:** The existing `useRecoveryScore.ts` hook already exists in `src/hooks/` — extend it, don't rebuild.

### Claude's Discretion
- Live Activities implementation approach (expo-live-activities vs. custom config plugin vs. stub)
- Score calculation formula details
- Score visualization design (ring, gauge, number)
- Trend chart library choice (if needed)

### Deferred Ideas (OUT OF SCOPE)
None.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LIVE-01 | Wind-down countdown appears on Dynamic Island / lock screen | expo-widgets alpha approach documented; stub fallback if alpha unstable |
| LIVE-02 | At bedtime, Live Activity displays "Sleep [logo]" or calm message | ActivityKit state transition pattern documented |
| LIVE-03 | Morning Live Activity shows sleep score or AM routine countdown | Morning state content and end-timing documented |
| SCORE-01 | App calculates Shift Readiness Score based on plan adherence | Non-HealthKit proxy formula documented; new score-store needed |
| SCORE-02 | Score displays prominently on Today screen | Existing RecoveryScoreCard already built — needs data plumbing update |
| SCORE-03 | Score trends visible over time (improving/declining) | Existing WeeklyTrendChart already built; score-store persistence needed |
</phase_requirements>

---

## Summary

Phase 5 has two distinct tracks. The Recovery Score track is largely pre-built: `useRecoveryScore.ts`, `RecoveryScoreCard`, `WeeklyTrendChart`, and `SleepComparisonCard` already exist. The existing hook is wired to HealthKit, which won't be available on most test devices. The core work is creating a parallel non-HealthKit adherence path in a new `score-store.ts` — storing daily adherence events (notification delivered, Night Sky activated, sleep block intact) and computing a nightly score — then connecting it to the existing display components on the Today screen.

The Live Activities track is technically complex and carries significant risk. The official Expo approach is `expo-widgets` (v55.0.8, alpha), which uses React/SwiftUI-via-`@expo/ui` and requires a development build (no Expo Go). A second community approach, `@software-mansion-labs/expo-live-activity`, offers a simpler API but less ecosystem backing. Both require prebuild, `NSSupportsLiveActivities: true` in infoPlist, app group entitlements, and iOS 16.2+. **Xcode is not installed on this machine** — Live Activities cannot be built or tested locally. The recommended path for TestFlight is a complete, well-designed stub that activates the same UI path as real Live Activities (background notification while app is in foreground/background), deferred to when Xcode is available.

The Recovery Score non-HealthKit formula and score-store architecture are the primary deliverables for this phase. Live Activities should be implemented as a well-structured stub so the plan architecture is wired correctly and can be activated with a native build.

**Primary recommendation:** Build the full Recovery Score (non-HealthKit path) and ship a Live Activity stub with the correct API surface. Real Live Activities are a Day 1 post-TestFlight activation once Xcode/EAS build is available.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-widgets | 55.0.8 | Live Activities + home screen widgets (alpha) | Official Expo solution for SDK 55; zero native code; config plugin automates entitlements |
| @expo/ui | (peer of expo-widgets) | SwiftUI-primitive React components for widget layouts | Required companion for expo-widgets rendering |
| zustand + AsyncStorage | 5.0.11 / 3.0.1 | Persist daily adherence scores | Already used project-wide; same pattern as notification-store |
| date-fns | 4.1.0 | Date arithmetic for score windows | Already installed; isSameDay, subDays, startOfDay already used in hook |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-svg | 15.15.3 | SVG rendering for future animated ring | Already installed; use if adding animated progress arc |
| expo-notifications | 55.0.12 | Notification delivery events for adherence signal | Already installed; Phase 4 already uses it |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| expo-widgets (alpha) | @software-mansion-labs/expo-live-activity | Simpler API, more mature; but less official Expo support and requires more Swift boilerplate |
| expo-widgets (alpha) | Full custom Swift module via expo-modules-core | Maximum control; requires significant Swift code, full native dev setup |
| expo-widgets (alpha) | Stub only | Zero native risk; correct for TestFlight given no Xcode on this machine |
| Zustand score-store | In-hook useState | useState is ephemeral; scores must survive app restarts — persist required |

**Installation (if proceeding with expo-widgets):**
```bash
npx expo install expo-widgets @expo/ui
```

**Version verification (confirmed 2026-04-02):**
- `expo-widgets`: 55.0.8
- `@bacons/apple-targets`: 4.0.6
- `react-native-svg`: 15.15.3 (already installed)

---

## Architecture Patterns

### Recommended Project Structure (additions only)

```
src/
├── store/
│   └── score-store.ts          # New: daily adherence events + computed scores
├── lib/
│   └── adherence/
│       ├── adherence-calculator.ts  # New: non-HealthKit score formula
│       └── live-activity-service.ts # New: start/update/end Live Activity (or stub)
├── components/
│   └── recovery/               # Already exists — no new components needed
targets/
└── ShiftWellLiveActivity/      # New: Swift widget extension (if using real Live Activities)
    ├── ShiftWellLiveActivity.swift
    └── expo-target.config.js
```

### Pattern 1: Non-HealthKit Adherence Score Store

**What:** A Zustand store that records adherence events as they happen during the day, computes a nightly score at midnight, and persists a rolling 7-day history in AsyncStorage.

**When to use:** Required because `useRecoveryScore.ts` currently only scores when HealthKit data is available (`isAvailable` gate). For v1.0, the vast majority of users will not have Apple Watch data.

**Adherence event types (from D-05):**
1. `notification_delivered` — wind-down or morning brief notification fired (from expo-notifications)
2. `night_sky_activated` — Night Sky Mode was active for >=1 tick (from useNightSkyMode)
3. `sleep_block_intact` — a main-sleep block was not deleted by the time its start passes

**Score formula (Claude's discretion — research-supported):**

```typescript
// Source: decision D-05 + research on shift worker adherence proxies
// Weights are intentionally motivating: easier to score 70+ even with imperfect behavior
export function computeAdherenceScore(events: AdherenceEvent[], plan: SleepPlan, date: Date): number {
  // Each planned main-sleep block on `date` contributes up to 100 points
  // Components:
  //   40pts — wind-down notification received (windDownEnabled && notification fired)
  //   35pts — Night Sky Mode activated within 30min of plan's wind-down start
  //   25pts — sleep block still present at its planned start time
  // If no main-sleep block is planned for this date → score is null (no shift night)
}
```

**Store shape:**

```typescript
// Source: project pattern from notification-store.ts / plan-store.ts
export interface ScoreStore {
  // Rolling 7-day history { date: 'YYYY-MM-DD', score: number | null }[]
  dailyHistory: DailyScore[];
  // Record an adherence event for today
  recordEvent: (event: AdherenceEvent) => void;
  // Called at midnight (or app open next day) to compute + archive yesterday's score
  finalizeDay: (date: Date, plan: SleepPlan) => void;
  // Computed: { day: string, score: number | null }[] for WeeklyTrendChart
  weeklyScores: () => { day: string; score: number | null }[];
}
```

**Example:**
```typescript
// Source: same persist pattern as notification-store.ts
export const useScoreStore = create<ScoreStore>()(
  persist(
    (set, get) => ({
      dailyHistory: [],
      recordEvent: (event) => set((s) => ({
        // append event, deduplicate by type+date
      })),
      finalizeDay: (date, plan) => {
        const score = computeAdherenceScore(get().events, plan, date);
        // push to dailyHistory, trim to 30 days
      },
      weeklyScores: () => {
        // map last 7 days from dailyHistory → { day, score } format for WeeklyTrendChart
      },
    }),
    {
      name: 'score-history',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ dailyHistory: s.dailyHistory }),
    },
  ),
);
```

### Pattern 2: Extended useRecoveryScore Hook

**What:** Modify `useRecoveryScore.ts` to return non-HealthKit scores when HealthKit is unavailable. The hook checks `isAvailable` (already present). When false, it falls back to `useScoreStore` data.

**When to use:** The Today screen already consumes `useRecoveryScore` — extending it (not replacing it) means zero UI changes to `index.tsx` gating logic.

**Key change:**
```typescript
// Extend RecoveryScoreData interface with new optional field
export interface RecoveryScoreData {
  // ... existing fields ...
  /** Non-HealthKit score for v1.0 display when HK unavailable */
  adherenceScore: number | null;
  adherenceDailyScores: { day: string; score: number | null }[];
}

// In fetchData(): when !hkAvailable, read from useScoreStore instead
if (!hkAvailable) {
  const scoreStore = useScoreStore.getState();
  setAdherenceScore(scoreStore.todayScore());
  setAdherenceDailyScores(scoreStore.weeklyScores());
}
```

**Critical: hooks cannot call other hooks imperatively.** Use `useScoreStore.getState()` (Zustand's imperative accessor) outside of the hook's render cycle — safe inside `useCallback`/`useEffect`.

### Pattern 3: Live Activity Service Stub

**What:** A service module with the correct API surface for Live Activities. When Expo builds with `expo-widgets` are available, the real implementation slots in. For TestFlight on EAS, the stub fires a local notification with the same content to simulate the Live Activity.

**When to use:** Xcode is not installed on this machine. EAS Build (cloud) is required to compile the native widget extension. The stub ensures Today screen + scheduling logic is wired correctly and can be upgraded to real ActivityKit with a single implementation swap.

```typescript
// src/lib/adherence/live-activity-service.ts
// Source: expo-widgets API + stub pattern

export interface LiveActivityState {
  phase: 'wind-down' | 'sleep' | 'morning';
  countdownMinutes?: number;      // wind-down or morning countdown
  score?: number;                 // morning state only
  label: string;                  // e.g. "Wind-down in 45 min"
}

/**
 * Start the Live Activity for tonight's sleep cycle.
 * In production builds: calls expo-widgets LiveActivityFactory.start()
 * In stub (no Xcode): schedules a persistent local notification as fallback.
 */
export async function startSleepActivity(state: LiveActivityState): Promise<void> {
  if (LIVE_ACTIVITIES_AVAILABLE) {
    // real implementation
  } else {
    // stub: schedule a persistent notification
  }
}

export async function updateSleepActivity(state: LiveActivityState): Promise<void> { ... }
export async function endSleepActivity(): Promise<void> { ... }
```

**Scheduling trigger** (D-03, D-04): Called from the same place `useNightSkyMode` currently triggers — when plan's wind-down block start time arrives. The scheduler can be a `useEffect` on plan blocks in the Today screen, or a background task.

### Pattern 4: Today Screen Score Display Update

**What:** The Today screen already has `showRecovery` gating that requires `recovery.isAvailable`. For non-HealthKit scores, the condition must be relaxed.

**Current gate:**
```typescript
const showRecovery =
  recovery.isAvailable &&
  !recovery.isLoading &&
  canAccess('accuracy_tracking') &&
  (recovery.lastNight !== null || recovery.weeklyAccuracy !== null);
```

**Updated gate:**
```typescript
// Show score if EITHER HealthKit data OR adherence score is available
const showRecovery =
  !recovery.isLoading &&
  canAccess('accuracy_tracking') &&
  (recovery.lastNight !== null || recovery.weeklyAccuracy !== null || recovery.adherenceScore !== null);
```

The `RecoveryScoreCard` and `WeeklyTrendChart` components already accept `score: number | null` and `dailyScores: { day, score }[]` — no component changes needed, just pass new data source.

### Anti-Patterns to Avoid

- **Don't call `finalizDay` on every render:** It must only fire once per calendar day, guarded by comparing `lastFinalizedDate` to `startOfDay(new Date())`.
- **Don't mix HealthKit and non-HealthKit scores in the same display:** When HK is available, use HK path. When unavailable, use adherence-store path. Never average them.
- **Don't store Date objects in Zustand persist:** AsyncStorage serializes to JSON. Store dates as ISO strings (`toISOString()`) and parse on rehydrate.
- **Don't start Live Activity in Expo Go:** The `expo-widgets` library is not available in Expo Go. Gate the call behind `Constants.appOwnership !== 'expo'` or a feature flag.
- **Don't schedule Live Activity using setInterval:** Use plan block times → compute delay → `setTimeout` or BackgroundTask. The plan's `wind-down` block start is the trigger.

---

## What the Existing Code Already Does

This is critical context — significant infrastructure is pre-built:

### useRecoveryScore.ts (existing)
- Computes `lastNight: SleepComparison | null` — comparison of planned vs actual last night
- Computes `weeklyAccuracy: PlanAccuracy | null` — 7-day aggregate with trend + streak
- Computes `dailyScores: { day, score }[]` — 7 daily scores for bar chart
- **All gated behind `isAvailable()` (HealthKit)** — returns `isAvailable: false` on most devices
- References `getLastNightSleep`, `getSleepHistory`, `comparePlannedVsActual`, `calculateWeeklyAccuracy`
- Uses `findLastNightSleepBlock` and `findPlannedBlockForDate` from plan store

### RecoveryScoreCard.tsx (existing)
- Renders circular ring with score number, trend badge, streak badge, insight text
- Color thresholds: 0-40 = red, 41-70 = yellow, 71-100 = green
- Props: `score: number | null`, `insight: string`, `streakDays: number`, `weeklyTrend`
- **Fully built — no changes needed if data props are correct**

### WeeklyTrendChart.tsx (existing)
- Pure React Native bar chart (no external chart library)
- Props: `dailyScores: { day: string; score: number | null }[]`
- **Fully built — no changes needed**

### Today screen (existing)
- Already imports and renders `RecoveryScoreCard`, `SleepComparisonCard`, `WeeklyTrendChart`
- Gate: `showRecovery` requires `recovery.isAvailable` — **this gate must be relaxed**
- RecoveryScoreCard receives `score={recovery.weeklyAccuracy?.overallScore ?? recovery.lastNight?.adherenceScore ?? null}`

### What is NOT built
- `score-store.ts` — daily adherence event storage and history persistence
- `adherence-calculator.ts` — non-HealthKit score formula
- `live-activity-service.ts` — Live Activity lifecycle management (or stub)
- Extension of `useRecoveryScore.ts` to use adherence-store when HealthKit unavailable
- Plan block change listener to record `sleep_block_intact` events

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| iOS widget extension scaffolding | Manual Xcode target creation | `expo-widgets` config plugin OR `@bacons/apple-targets` | prebuild regenerates ios/ folder — any manual Xcode changes are lost on next prebuild |
| Score bar chart | Custom SVG chart | Existing `WeeklyTrendChart.tsx` | Already built, tested, uses project design tokens |
| Score ring display | New circular component | Existing `RecoveryScoreCard.tsx` | Already built with correct color thresholds and layout |
| Date arithmetic for 7-day window | Custom rolling window | `subDays`, `isSameDay`, `startOfDay` from date-fns | Already imported in `useRecoveryScore.ts` |
| App group data sharing | Custom shared container | expo-widgets config plugin auto-configures `com.apple.security.application-groups` | Manual entitlement setup is error-prone |

**Key insight:** The display layer for SCORE-01, SCORE-02, SCORE-03 is already built. The missing piece is the data layer (score-store) and the hook bridge. Phase 5 is primarily a plumbing/data problem, not a UI problem.

---

## Common Pitfalls

### Pitfall 1: HealthKit Gate Hides Score on All TestFlight Devices
**What goes wrong:** `showRecovery` in `index.tsx` requires `recovery.isAvailable === true`. Since most testers won't have Apple Watch, they'll see no score at all — SCORE-02 fails silently.
**Why it happens:** The existing hook was built for HealthKit v1.1 (HEALTH-01). Phase 5 needs a v1.0 path.
**How to avoid:** Extend `useRecoveryScore` to return non-HealthKit adherence data when HK unavailable. Update the gate in `index.tsx`.
**Warning signs:** RecoveryScoreCard is hidden on all TestFlight builds.

### Pitfall 2: Date Objects in Zustand Persist
**What goes wrong:** Zustand serializes state to JSON via AsyncStorage. `Date` objects become strings. On rehydrate, they remain strings — code calling `.getTime()` or `isSameDay()` throws.
**Why it happens:** JSON serialization doesn't preserve `Date` prototype.
**How to avoid:** Store all dates in score-store as ISO strings. Parse on read: `new Date(stored.date)`. Or use a custom serializer in the `storage` config.
**Warning signs:** `TypeError: date.getTime is not a function` in score-related code after app restart.

### Pitfall 3: finalizeDay Running Multiple Times Per Day
**What goes wrong:** Score gets computed repeatedly as the app re-renders, appending duplicate entries.
**Why it happens:** No guard on daily finalization trigger.
**How to avoid:** Store `lastFinalizedDate: string | null` in score-store. In `finalizeDay`, check `if (lastFinalizedDate === format(date, 'yyyy-MM-dd')) return`.
**Warning signs:** `dailyHistory` grows unexpectedly; duplicate entries for same date.

### Pitfall 4: expo-widgets in Expo Go Crashes
**What goes wrong:** `expo-widgets` and ActivityKit are not available in Expo Go. Calling `LiveActivityFactory.start()` throws a native module not found error.
**Why it happens:** expo-widgets requires a development build (prebuild + native compilation).
**How to avoid:** Wrap all Live Activity calls in a guard: `if (!IS_DEVELOPMENT_BUILD) return`. Use `Constants.appOwnership` or `__DEV__` + a feature flag.
**Warning signs:** App crashes on launch when run in Expo Go after importing live-activity-service.

### Pitfall 5: Activity Doesn't Transition Between States (D-02)
**What goes wrong:** Wind-down Live Activity never transitions to the Sleep state — it just shows stale countdown content.
**Why it happens:** ActivityKit requires explicit `update()` calls; iOS won't automatically change state based on time.
**How to avoid:** Schedule three `setTimeout` calls at plan block boundaries: one to `start()` (wind-down block start), one to `update({phase: 'sleep'})` (bedtime), one to `update({phase: 'morning'})` (wake time). All three must be scheduled up front using actual plan block timestamps.
**Warning signs:** Live Activity shows wind-down countdown after bedtime has passed.

### Pitfall 6: ios/ Folder Regeneration Wipes Widget Target
**What goes wrong:** Running `npx expo prebuild --clean` deletes the manually-created widget Swift files.
**Why it happens:** Expo manages the ios/ folder. Any file placed there manually is not tracked.
**How to avoid:** Use `expo-widgets` config plugin (manages targets outside ios/ folder) or `@bacons/apple-targets` which places widget code in a `targets/` directory at the project root — outside the regenerated ios/ path.
**Warning signs:** Widget target disappears after prebuild; Swift files gone.

### Pitfall 7: Xcode Not Installed — Live Activities Require EAS Build
**What goes wrong:** `expo-widgets` requires compilation of the Swift widget extension. Running `expo start` or `expo run:ios` locally requires Xcode.
**Why it happens:** Xcode is not installed on this machine (confirmed 2026-04-02). Only Swift CLI is present (Swift 6.1.2).
**How to avoid:** Use EAS Build (`eas build --platform ios --profile development`) for the first native build. Or implement the stub path entirely (no expo-widgets dependency at all) and defer real ActivityKit to a post-TestFlight release.
**Warning signs:** `npx expo run:ios` fails with "xcode-select: error: tool 'xcodebuild' requires Xcode".

---

## Code Examples

### Live Activity app.json Configuration (if using expo-widgets)
```json
// Source: https://docs.expo.dev/versions/latest/sdk/widgets/
// Add to existing ios block in app.json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSSupportsLiveActivities": true
      },
      "entitlements": {
        "com.apple.security.application-groups": [
          "group.com.shiftwell.app"
        ]
      }
    },
    "plugins": [
      ["expo-widgets", {
        "bundleIdentifier": "com.shiftwell.app.widgets",
        "groupIdentifier": "group.com.shiftwell.app",
        "enablePushNotifications": false,
        "widgets": [{
          "name": "ShiftWellLiveActivity",
          "displayName": "ShiftWell Sleep",
          "description": "Sleep countdown and status"
        }]
      }]
    ]
  }
}
```

### Live Activity Component (expo-widgets approach)
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/widgets/
// targets/ShiftWellLiveActivity/index.tsx
'widget';

import { createLiveActivity } from 'expo-widgets';
import { Text, VStack, HStack } from '@expo/ui/swift-ui';

interface SleepActivityProps {
  phase: 'wind-down' | 'sleep' | 'morning';
  countdownMinutes?: number;
  score?: number;
  label: string;
}

export const ShiftWellLiveActivity = createLiveActivity<SleepActivityProps>(
  'ShiftWellLiveActivity',
  (props) => ({
    compactLeading: <Text>{props.phase === 'sleep' ? '😴' : '⏰'}</Text>,
    compactTrailing: <Text>{props.label}</Text>,
    expandedLeading: (
      <VStack>
        <Text style={{ fontSize: 14, color: '#C8A84B' }}>ShiftWell</Text>
        <Text style={{ fontSize: 12 }}>{props.label}</Text>
      </VStack>
    ),
    expandedTrailing: props.phase === 'morning' && props.score !== undefined
      ? <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{props.score}</Text>
      : null,
    banner: (
      <HStack>
        <Text style={{ color: '#C8A84B', fontWeight: 'bold' }}>ShiftWell</Text>
        <Text>{props.label}</Text>
      </HStack>
    ),
  }),
);
```

### Starting and Transitioning Live Activities
```typescript
// Source: expo-widgets docs + ActivityKit state machine
import { ShiftWellLiveActivity } from '../../../targets/ShiftWellLiveActivity';

let activityInstance: ReturnType<typeof ShiftWellLiveActivity.start> | null = null;

export async function startSleepCycle(windDownMinutes: number): Promise<void> {
  activityInstance = ShiftWellLiveActivity.start({
    phase: 'wind-down',
    countdownMinutes: windDownMinutes,
    label: `Wind-down in ${windDownMinutes} min`,
  });
}

export async function transitionToSleep(): Promise<void> {
  await activityInstance?.update({
    phase: 'sleep',
    label: 'Sleep well',
  });
}

export async function transitionToMorning(score?: number): Promise<void> {
  await activityInstance?.update({
    phase: 'morning',
    score,
    label: score ? `Recovery: ${score}/100` : 'Morning routine',
  });
}

export async function endSleepCycle(): Promise<void> {
  await activityInstance?.end('default', { phase: 'morning', label: 'Great sleep' });
  activityInstance = null;
}
```

### Non-HealthKit Adherence Score Store (pattern)
```typescript
// Source: notification-store.ts project pattern + D-05 formula
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, subDays, startOfDay } from 'date-fns';

export type AdherenceEventType = 'notification_delivered' | 'night_sky_activated' | 'sleep_block_intact';

export interface AdherenceEvent {
  type: AdherenceEventType;
  date: string;           // ISO string, not Date object — JSON-safe
  timestamp: string;
}

export interface DailyScore {
  date: string;           // 'YYYY-MM-DD'
  score: number | null;   // null if no sleep block planned
  events: AdherenceEventType[];
}

export interface ScoreStoreState {
  dailyHistory: DailyScore[];
  pendingEvents: AdherenceEvent[];
  lastFinalizedDate: string | null;
  recordEvent: (type: AdherenceEventType) => void;
  finalizeDay: (date: Date, hadSleepBlock: boolean) => void;
  weeklyScores: () => { day: string; score: number | null }[];
  todayScore: () => number | null;
}
```

### Score Formula Implementation (non-HealthKit)
```typescript
// Source: decision D-05 + adherence research
// Weights: 40/35/25 split favoring actionable user behaviors
function computeDayScore(events: AdherenceEventType[], hadSleepBlock: boolean): number | null {
  if (!hadSleepBlock) return null; // No sleep block planned → no score for this day

  let score = 0;
  // 40pts: wind-down notification received and not immediately dismissed
  if (events.includes('notification_delivered')) score += 40;
  // 35pts: Night Sky Mode was active (user was in the wind-down environment)
  if (events.includes('night_sky_activated')) score += 35;
  // 25pts: sleep block was still in plan at its scheduled start (not manually deleted)
  if (events.includes('sleep_block_intact')) score += 25;
  return score;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| expo-apple-targets + raw Swift | expo-widgets React components | SDK 52-55 | No Swift knowledge required for basic Live Activities |
| Manual Xcode target creation | Config plugin automates targets | SDK 52+ | Survives `prebuild --clean` |
| HealthKit-only recovery score | Proxy adherence score (notification + Night Sky) | Phase 5 design | Score available to all users, not just Apple Watch owners |
| Custom chart component | Existing WeeklyTrendChart | Phase 4 pre-build | No chart library needed |

**Deprecated/outdated:**
- Manual ios/ folder widget file placement: lost on prebuild. Use targets/ directory via expo-widgets or @bacons/apple-targets.
- `expo-live-activity` (old unmaintained package at v0.0.0): do not use, npm shows version 0.0.0 which is a placeholder.
- `react-native-live-activities` (v0.1.1): community package, minimal maintenance. Prefer expo-widgets.

---

## Open Questions

1. **Should Live Activities use expo-widgets (alpha) or pure stub for TestFlight?**
   - What we know: expo-widgets v55.0.8 is available; Xcode is not installed locally; EAS Build can compile it
   - What's unclear: Stability of expo-widgets alpha for the three-state transition pattern; whether EAS build is configured and the Apple Developer account is enrolled (blocked on LLC formation per STATE.md)
   - Recommendation: Implement the stub with the correct API surface. When EAS build is available (post-LLC), swap in the real expo-widgets implementation. The stub allows all other code to be correct and testable.

2. **What triggers `finalizeDay` in the score store?**
   - What we know: It should fire once when the day rolls over; options are app-open check (compare today's date to `lastFinalizedDate`), BackgroundTask, or AppState change listener
   - What's unclear: BackgroundTask has constraints on iOS — won't fire at exact midnight
   - Recommendation: Use app-open check pattern — on `AppState` change to `active`, compare date and finalize if needed. This is simpler and reliable without requiring BackgroundTask registration.

3. **How does `sleep_block_intact` get recorded?**
   - What we know: plan-store has the current plan; blocks can be deleted (plan regeneration)
   - What's unclear: There is no "block deleted" event in the current plan-store; regeneration replaces the entire plan
   - Recommendation: Subscribe to plan-store changes. When a main-sleep block that existed yesterday is absent in the new plan AND the block's start time has passed, record the event. If the block is still present when its start time arrives, record `sleep_block_intact`. Use a plan-store subscription (same pattern as Phase 3's recalculationNeeded subscription).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|---------|
| Node.js | Build tooling | Yes | 22.22.1 | — |
| Swift | Native compilation | Yes | 6.1.2 | — |
| Xcode | `expo run:ios`, native build | No | — | EAS Build (cloud) |
| EAS Build | Production iOS builds | Blocked | — | Apple Developer enrollment pending LLC formation |
| iOS Simulator | Local Live Activity testing | No (no Xcode) | — | Physical device via EAS development build |
| Jest | Unit tests | Yes | 30.x | — |

**Missing dependencies with no fallback:**
- **Xcode**: Required to build and test the native widget extension locally. No local fallback exists. EAS Build is the only path for Live Activity integration tests.
- **EAS Build / Apple Developer Program**: Blocked on LLC formation (per STATE.md). Live Activity production testing is blocked until LLC resolves.

**Missing dependencies with fallback:**
- **Real Live Activities**: Stub service + local notification fallback provides equivalent user value for TestFlight evaluation.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.x + ts-jest 29.x |
| Config file | jest.config.js |
| Quick run command | `npx jest __tests__/accuracy-score.test.ts` |
| Full suite command | `npx jest` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCORE-01 | `computeDayScore` returns correct value for each event combination | unit | `npx jest __tests__/adherence-calculator.test.ts` | No — Wave 0 |
| SCORE-01 | `finalizeDay` appends to dailyHistory with correct date guard | unit | `npx jest __tests__/store/score-store.test.ts` | No — Wave 0 |
| SCORE-01 | `recordEvent` deduplicates same-type same-day events | unit | `npx jest __tests__/store/score-store.test.ts` | No — Wave 0 |
| SCORE-03 | `weeklyScores()` returns 7-day array with correct day labels | unit | `npx jest __tests__/store/score-store.test.ts` | No — Wave 0 |
| SCORE-02 | Today screen shows RecoveryScoreCard when adherenceScore is not null (HK unavailable) | manual | Run app → verify score card visible without Apple Watch | — |
| LIVE-01 | `startSleepActivity` calls through to stub without crash | unit | `npx jest __tests__/lib/live-activity-service.test.ts` | No — Wave 0 |
| LIVE-02 | `transitionToSleep` updates state correctly | unit | `npx jest __tests__/lib/live-activity-service.test.ts` | No — Wave 0 |
| LIVE-03 | `transitionToMorning` with score included in state | unit | `npx jest __tests__/lib/live-activity-service.test.ts` | No — Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest __tests__/adherence-calculator.test.ts __tests__/store/score-store.test.ts`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite (272 + new tests) green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `__tests__/adherence-calculator.test.ts` — covers SCORE-01 formula
- [ ] `__tests__/store/score-store.test.ts` — covers SCORE-01 store, SCORE-03 weekly view
- [ ] `__tests__/lib/live-activity-service.test.ts` — covers LIVE-01/02/03 stub
- [ ] `__mocks__/expo-widgets.ts` — mock for expo-widgets if installed (currently absent)

---

## Sources

### Primary (HIGH confidence)
- [expo-widgets Expo Docs v55](https://docs.expo.dev/versions/latest/sdk/widgets/) — Live Activity layout API, config, limitations
- [Expo Blog: Home screen widgets and Live Activities](https://expo.dev/blog/home-screen-widgets-and-live-activities-in-expo) — Official announcement, design philosophy
- Project source: `src/hooks/useRecoveryScore.ts` — existing hook capabilities
- Project source: `src/components/recovery/` — pre-built display components (RecoveryScoreCard, WeeklyTrendChart, SleepComparisonCard)
- Project source: `src/store/notification-store.ts` — Zustand persist pattern to replicate in score-store
- npm registry (verified 2026-04-02): expo-widgets@55.0.8, @bacons/apple-targets@4.0.6

### Secondary (MEDIUM confidence)
- [Fizl: Live Activities in Expo](https://fizl.io/blog/posts/live-activities) — Native module + Swift approach
- [Inkitt Tech: Live Activity in Expo managed workflow](https://medium.com/inkitt-tech/live-activity-widget-in-expo-react-native-project-607df51f8a15) — Entitlements, app groups, pitfalls
- [Kutay: Live Activities Expo](https://kutay.boo/blog/expo-live-activity/) — Implementation steps, iOS version requirements
- expo-widgets@55.0.8 npm package — confirmed version, "alpha" status

### Tertiary (LOW confidence)
- @software-mansion-labs/expo-live-activity GitHub — early development, breaking change warning
- react-native-live-activities v0.1.1 — found on npm but minimal community signal

---

## Metadata

**Confidence breakdown:**
- Standard stack (Recovery Score): HIGH — existing code read directly, libraries confirmed installed
- Standard stack (Live Activities): LOW-MEDIUM — expo-widgets is alpha, Xcode absent blocks local verification
- Architecture (score-store): HIGH — follows established project patterns (notification-store, plan-store)
- Architecture (hook extension): HIGH — hook code read directly, extension path is clear
- Architecture (Live Activity state machine): MEDIUM — API verified in docs, but untestable without Xcode
- Common pitfalls: HIGH — date serialization and gate logic derived from direct code reading; prebuild pitfall from official Expo docs

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (stable for score/store patterns); 2026-04-16 for expo-widgets (alpha moves fast)
