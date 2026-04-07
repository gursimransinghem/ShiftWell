# Architecture: ShiftWell v1.1 Integration

**Scope:** Adaptive Brain morning loop, score finalization, ActivityKit, downgrade screen
**Codebase baseline:** Expo SDK 55 managed workflow, 28K LOC, Zustand local-first
**Researched:** 2026-04-06

---

## Summary

The v1.1 integration is largely a wiring job, not a greenfield build. The Adaptive Brain
modules are written (`src/lib/adaptive/` — 6 files, all complete). The hook exists
(`useAdaptivePlan.ts`). The component exists (`AdaptiveInsightCard.tsx`). The Today screen
already imports and renders all three. The blocker is not missing code; it is three broken
pipes: the score never accumulates real data, the trial never starts in production, and the
downgrade screen is absent. Each answer below is grounded in the actual file state.

---

## Integration Points by Feature

### 1. Adaptive Brain Morning Loop — Where Should Recalculation Live?

**Answer: it already lives in the right place. No change needed.**

`useAdaptivePlan` is imported and called at the top of `app/(tabs)/index.tsx` (line 146).
It fires a `useEffect([], [])` — once on mount — reads 14-night HealthKit history,
assembles `AdaptiveContext` via `buildAdaptiveContext()`, then calls
`usePlanStore.setAdaptiveContext()` which immediately calls `regeneratePlan()` with the
new context. The plan store subscription chain (`useShiftsStore.subscribe`,
`useUserStore.subscribe`) already handles all other recalculation triggers.

**Why not `_layout.tsx`?**
`_layout.tsx` is the right place for app-open side effects that must run before any screen
renders (auth, premium init, calendar sync — all already there). Adaptive context assembly
reads HealthKit and runs async; it is appropriate to begin it concurrently with screen
render, not block the navigation tree on it. `useAdaptivePlan` in the Today tab achieves
this without blocking `_layout.tsx`.

**Why not a background task?**
`expo-background-task` (already used for calendar sync) executes outside the React render
tree with no access to Zustand's React context. The adaptive pipeline needs to write into
`plan-store` and trigger `regeneratePlan()`. The `setAdaptiveContext` method calls
`get().regeneratePlan()` synchronously — this only works from within the JS thread where
Zustand state lives. Background tasks cannot do this safely. Additionally, the Adaptive
Brain spec is explicit: it is an enhancement layer, not a hard blocker. The `try/catch` in
`useAdaptivePlan` ensures it never crashes the app.

**Why not a notification handler?**
The morning-brief notification fires at wake time (see `scheduleMorningBrief` in
`notification-service.ts` line 141). Users do not always open the app from a notification.
Tying recalculation to a notification tap would mean recalculation never fires for users
who open the app cold. The existing `useEffect` on mount covers all open paths.

**One bug to fix:** `computeDelta` in `useAdaptivePlan.ts` (line 63-65) passes `currentPlan`
as both `oldPlan` and `newPlan`:
```typescript
const changes = currentPlan
  ? computeDelta(currentPlan, currentPlan, context)  // BUG: both args identical
  : [];
```
This will always return zero changes. The correct logic: call `computeDelta` after
`setAdaptiveContext` triggers `regeneratePlan`, comparing the plan snapshot
(pre-adaptive) against the newly generated plan. The fix is to wire the diff inside
`plan-store.setAdaptiveContext` — after `regeneratePlan()` resolves, compare
`planSnapshot` against the new `plan` and write `pendingChanges`. The hook's return
value should then read `usePlanStore((s) => s.pendingChanges)` directly rather than
computing a local diff.

**Files to modify:** `src/hooks/useAdaptivePlan.ts` (remove local diff call),
`src/store/plan-store.ts` (move diff computation post-regenerate inside `setAdaptiveContext`).

---

### 2. `score-store.finalizeDay()` — Where to Call It?

**Answer: call it from the morning-brief notification handler, with AppState as backup.**

The score model (`src/lib/adherence/adherence-calculator.ts`) uses three signals:
- `notification_delivered` — 40 pts (sleep reminder received)
- `night_sky_activated` — 35 pts (user entered wind-down UI)
- `sleep_block_intact` — 25 pts (sleep block not deleted/moved)

None of these are currently recorded in production code. `finalizeDay` has no caller
outside `app/index.tsx` (dev seed only). The fix has two parts:

**Part A — Record adherence events in production:**

1. `notification_delivered`: in `app/_layout.tsx`, add a
   `Notifications.addNotificationReceivedListener` that checks
   `notification.request.content.data.type === 'sleep-reminder'` and calls
   `useScoreStore.getState().recordEvent({ type: 'notification_delivered', dateISO })`.
   This fires when the OS delivers any foreground notification. For background delivery
   recording, it is not possible to hook into OS-delivered notifications without a
   background task; treat this as best-effort foreground recording only.

2. `night_sky_activated`: `useNightSkyMode.ts` already starts the Live Activity when
   Night Sky mode activates (line 148). Add one line there:
   `useScoreStore.getState().recordEvent({ type: 'night_sky_activated', dateISO })`.

3. `sleep_block_intact`: check at finalization time — the plan still has a `main-sleep`
   block for yesterday's date. No separate event recording needed; derive it from the
   plan state at finalization.

**Part B — Call `finalizeDay` in production:**

The natural trigger is app open in the morning. In `app/_layout.tsx`, inside the existing
`AppState.addEventListener('change', ...)` handler (already there, line 93-103), add a
`finalizeDay` call when the app becomes `active`:

```typescript
// In the AppState 'active' handler (already exists in _layout.tsx)
if (lastState !== 'active' && next === 'active') {
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const plan = usePlanStore.getState().plan;
  const hasSleepBlock = plan?.blocks.some(
    (b) => b.type === 'main-sleep' && format(b.start, 'yyyy-MM-dd') === yesterday
  ) ?? false;
  useScoreStore.getState().finalizeDay(yesterday, hasSleepBlock);
  // ... existing calendar sync ...
}
```

`finalizeDay` is idempotent (guarded by `lastFinalizedDateISO`), so calling it on every
app open is safe. This is simpler and more reliable than tying it to the morning-brief
notification tap, which requires the user to open the app from the notification.

**Why not a background task?**
HealthKit reading in background requires `BackgroundDelivery` entitlement (separate Apple
authorization, additional app review complexity). The adherence score model does not
currently use raw HealthKit sleep duration — it uses the three proxy signals above. A
background task adds complexity without benefit for this model. Revisit when the
HealthKit feedback loop lands in v1.1+.

**Files to modify:** `app/_layout.tsx` (AppState handler + notification listener),
`src/hooks/useNightSkyMode.ts` (record `night_sky_activated`).
**New import needed in `_layout.tsx`:** `useScoreStore`, `usePlanStore` (already imported
via `usePremiumStore` pattern), `format`, `subDays` from `date-fns`.

---

### 3. ActivityKit — Minimal Path Without Ejecting

**Answer: stay on notification stubs. No native module in v1.1. Real ActivityKit is a
post-Apple-Developer-enrollment task.**

**Current state:** `live-activity-service.ts` is a complete stub. It fires local
notifications as fallback. The guard:
```typescript
const LIVE_ACTIVITIES_AVAILABLE =
  Constants.appOwnership !== 'expo' &&
  typeof (global as any).__LIVE_ACTIVITY_NATIVE_MODULE__ !== 'undefined';
```
ensures it never attempts real ActivityKit calls in Expo Go or without the native module.
The stub is already wired into `useNightSkyMode.ts` (lines 148, 152). It works today.

**Why real ActivityKit requires ejection:**
ActivityKit (Live Activities) requires a Widget Extension target in Xcode, a Swift/SwiftUI
`ActivityAttributes` struct, and an `NSSupportsLiveActivities` entitlement in
`Info.plist`. In Expo managed workflow, there is no Xcode project to modify. The only
supported path without ejecting is an **Expo config plugin** that generates the native
files during `eas build`.

**Options in 2026:**
- `expo-live-activities` — community package (not in Context7; unverified status). Requires
  EAS Build (not Expo Go). Adds a config plugin entry in `app.json`. LOW confidence it is
  production-ready without Xcode validation.
- Custom Expo config plugin — write a `withLiveActivities` plugin that injects the Swift
  extension and entitlements. Requires Xcode familiarity. MEDIUM effort.
- Bare workflow — full eject. BREAKS the managed workflow advantage. Not recommended.

**Recommendation for v1.1:** Implement LIVE-03 (pass recovery score to morning Dynamic
Island) by passing `score` to `startSleepActivity()` via the existing `LiveActivityState`
interface. The stub already has `score?: number` in its interface and uses it in the
notification copy (line 93: `Recovery: ${score}/100`). This satisfies LIVE-03 without
any native change. The real ActivityKit implementation is a post-Apple-Dev-enrollment
task (blocked externally).

**Files to modify:** Where `startSleepActivity` is called in `useNightSkyMode.ts` — pass
the current recovery score from `useScoreStore` into the state. This requires reading
`useScoreStore.getState().todayScore()` at wind-down activation time.

---

### 4. Downgrade Screen — User Experience When Trial Expires

**Answer: create `app/downgrade.tsx` as a full-screen modal with a path back to the paywall.**

**What the user sees:**
The user opens the app after trial day 14. `initializePremium()` (called in `_layout.tsx`
line 71) will recompute `trialDaysLeft = 0`, `isInTrial = false`. Since all features are
currently behind `canAccess(feature)` gates — and `canAccess` returns `true` when
`isPremium || isInTrial` — a user with `isInTrial: false` and `isPremium: false` will see
degraded or empty states.

**The broken pipe today:**
`startTrial()` is only called from `app/index.tsx` line 17, inside `seedMockData()` which
is dev-only. In production (after the `seedMockData()` TODO is removed), `startTrial()`
is never called, so `trialStartedAt` is null and `isInTrial` stays false from first launch.

**Fix PREM-01 first (blocks everything):**
Move `startTrial()` into `initializePremium()` in `premium-store.ts`. After the existing
`trialDaysLeft / isInTrial` recomputation block, add:
```typescript
// Start trial on first launch (no-op if already started — idempotent guard exists)
this.startTrial();  // or get().startTrial()
```
This runs on every cold launch but is idempotent.

**Downgrade screen flow:**
```
Trial expires → app open → initializePremium computes isInTrial: false
→ routing logic in app/index.tsx checks trial state
→ if (!isInTrial && !isPremium) → router.replace('/downgrade')
→ downgrade.tsx renders
```

**`app/downgrade.tsx` content:**
- Full-screen, dark base (no tabs, no nav bar). Design must match the premium, confident
  Blend system.
- Copy: "Your 14-day trial has ended" — direct, not guilt-inducing (no dark patterns).
- Show what they had: brief 3-bullet list of premium features (calendar sync always free;
  adaptive brain, accuracy tracking, live activities = premium).
- Two CTAs: "See Plans" (primary, routes to `app/paywall.tsx`) and "Continue for free"
  (secondary, routes to `/(tabs)` with degraded free tier).
- Free tier should still allow the Today screen but hide premium-gated cards
  (`AdaptiveInsightCard`, `HeroScore`, `ScoreBreakdownCard`, `SleepDebtCard`).

**Routing integration:**
In `app/index.tsx`, after removing `seedMockData()`, replace the unconditional
`router.replace('/(tabs)')` with:
```typescript
const { isInTrial, isPremium } = usePremiumStore.getState();
const trialEverStarted = !!usePremiumStore.getState().trialStartedAt;
if (!isInTrial && !isPremium && trialEverStarted) {
  router.replace('/downgrade');
} else {
  router.replace('/(tabs)');
}
```

**Files to create:** `app/downgrade.tsx`
**Files to modify:** `src/store/premium-store.ts` (PREM-01 fix), `app/index.tsx` (routing
logic + remove seedMockData TODO)

---

## Data Flow Changes

### Before (broken state):

```
App open
  └─ index.tsx: seedMockData() → startTrial() [DEV ONLY, BLOCKING]
       └─ router.replace('/(tabs)')
            └─ Today screen mounts
                 └─ useAdaptivePlan fires
                      └─ computeDelta(currentPlan, currentPlan, ...) → always [] BROKEN
                 └─ score-store: finalizeDay() never called → score always 0
```

### After (wired state):

```
App open (cold)
  └─ _layout.tsx: initializePremium() [includes startTrial on first run]
  └─ index.tsx: routing check
       ├─ trial expired? → /downgrade
       └─ normal → /(tabs)

  /(tabs)/index.tsx mounts
    └─ useAdaptivePlan fires (once on mount)
         └─ getSleepHistory(14 nights) [async, graceful if HealthKit unavailable]
         └─ buildAdaptiveContext(shifts, personalEvents, profile, history, today)
         └─ setAdaptiveContext(context)
              └─ plan-store: regeneratePlan() with new AdaptiveContext
              └─ [post-regenerate] computeDelta(planSnapshot, newPlan, context)
              └─ set({ pendingChanges: changes })

AppState becomes 'active' (every foreground resume)
  └─ _layout.tsx AppState handler:
       └─ finalizeDay(yesterday, hasSleepBlock) [idempotent]
       └─ runCalendarSync() [existing]

Notification delivered (foreground)
  └─ _layout.tsx addNotificationReceivedListener:
       └─ if type === 'sleep-reminder' → recordEvent('notification_delivered')

Night Sky Mode activates
  └─ useNightSkyMode.ts:
       └─ recordEvent('night_sky_activated')
       └─ startSleepActivity({ ..., score: todayScore() }) [passes score to stub/real]
```

---

## Build Order

Dependencies drive this order. Items marked [BLOCKS] prevent later work.

### Step 1 — Fix the three broken pipes (no new features, pure fixes)

| Order | File | Change | Type |
|-------|------|--------|------|
| 1a | `src/store/premium-store.ts` | Move `startTrial()` into `initializePremium()` | Modify |
| 1b | `app/index.tsx` | Remove `seedMockData()`, add routing guard | Modify |
| 1c | `app/downgrade.tsx` | Create downgrade screen | Create |

These three unblock all subsequent testing. Without PREM-01 fixed, `isInTrial` is always
false in production and every premium gate breaks.

### Step 2 — Wire score finalization

| Order | File | Change | Type |
|-------|------|--------|------|
| 2a | `app/_layout.tsx` | Add `finalizeDay` call in AppState handler | Modify |
| 2b | `app/_layout.tsx` | Add `addNotificationReceivedListener` for `notification_delivered` | Modify |
| 2c | `src/hooks/useNightSkyMode.ts` | Add `recordEvent('night_sky_activated')` on activation | Modify |

Step 2 does not block Adaptive Brain wiring but should come before TestFlight so real
users accumulate real scores from day 1.

### Step 3 — Fix Adaptive Brain delta computation

| Order | File | Change | Type |
|-------|------|--------|------|
| 3a | `src/store/plan-store.ts` | Move `computeDelta` into `setAdaptiveContext`, post-regenerate | Modify |
| 3b | `src/hooks/useAdaptivePlan.ts` | Remove local `computeDelta` call; return `pendingChanges` from store | Modify |

Step 3 depends on step 1 (need real plan state to diff). The `AdaptiveInsightCard` is
already rendered correctly in `app/(tabs)/index.tsx` — it will show changes once the diff
computes non-empty results.

### Step 4 — Wire recovery score to Dynamic Island stub (LIVE-03)

| Order | File | Change | Type |
|-------|------|--------|------|
| 4a | `src/hooks/useNightSkyMode.ts` | Pass `useScoreStore.getState().todayScore()` to `startSleepActivity` | Modify |

This is a one-line change. Depends on step 2 (score needs to be real before this is
meaningful, though it works with stub 0 score).

### Step 5 — Fix TypeScript errors

| File | Known error source |
|------|-------------------|
| `app/(tabs)/circadian.tsx` | Type errors (PROJECT.md) |
| `app/(tabs)/profile.tsx` | Nav bug + type errors |
| `app/(tabs)/settings.tsx` | Type errors |
| `app/(tabs)/index.tsx` | Type errors |
| `components/ExternalLink.tsx` | Type errors |

These are independent of features but required before `eas build` succeeds.

### Step 6 — TestFlight prep

App icon, splash screen, EAS profiles. These have no code dependencies but require Apple
Developer enrollment (external blocker).

---

## Constraints

**Managed workflow boundary.** Real ActivityKit requires a native extension. In Expo managed
workflow, this means an Expo config plugin + EAS Build. Expo Go cannot run it. This work
is gated on Apple Developer enrollment and Xcode setup. Do not attempt to wire real
ActivityKit before that infrastructure exists — the stub notification fallback is
sufficient for TestFlight.

**Background task limitations.** `expo-background-task` tasks cannot write to Zustand
stores via React hooks (no React context in background). Any logic that updates plan or
score stores must run in the foreground (AppState `active` handler or notification
response listeners).

**HealthKit authorization timing.** `isAvailable()` and `getSleepHistory()` in
`useAdaptivePlan` gracefully return empty arrays if HealthKit is unauthorized. The adaptive
context builder handles null history by setting `recoveryScore: null` and
`baselineMature: false`. No special handling needed — the Learning Phase flag (days 1-30)
naturally covers the case where no history exists.

**`computeDelta` bug note.** The current `useAdaptivePlan.ts` passes `currentPlan` as both
old and new plan. This means `AdaptiveInsightCard` will never show changes even after the
fix in step 3. This is a silent bug — no crash, just no card. Verify the fix by seeding
a plan, triggering `setAdaptiveContext` with a context that would shift bedtime, and
confirming `pendingChanges.length > 0` in the store.

**`startTrial` idempotency.** `startTrial()` already has an idempotency guard
(`if (trialStartedAt) return`). Moving it into `initializePremium` is safe — it will only
start the trial on the first-ever launch.

**Downgrade screen must not be reachable on first launch.** The routing guard in
`app/index.tsx` checks `trialEverStarted` (i.e., `trialStartedAt !== null`) before
redirecting to downgrade. New users (no `trialStartedAt`) should go through onboarding,
not the downgrade screen.

**Score store `todayScore()` returns `null` before finalization.** The `useRecoveryScore`
hook in `app/(tabs)/index.tsx` already gracefully handles null by rendering `0` in the
hero score ring. No UI changes needed — the ring renders as 0 until a real score is
finalized.

---

## Sources

All findings are derived from direct codebase inspection. No external sources consulted
for this document. Confidence: HIGH — all claims are traced to specific file/line
references in the existing codebase.
