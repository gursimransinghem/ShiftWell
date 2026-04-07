# Phase 8: Adaptive Brain Core — Research

**Researched:** 2026-04-07
**Domain:** React Native / Zustand / AsyncStorage — wiring existing adaptive modules to production
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** SleepDebtCard is threshold-gated — show only when `severity !== 'none'` (debt >= 0.5h) OR `bankHours > 0`. At zero debt and zero bank, the card does not render.
- **D-02:** When rendered, SleepDebtCard sits below AdaptiveInsightCard and above the recovery block in the Today card stack. No special prominence unless `severity === 'severe'`.
- **D-03:** Undo reverts to `planSnapshot` (pre-regeneration state already saved in plan-store). No new snapshot infrastructure needed.
- **D-04:** X button dismisses the card for this adaptive cycle. Dismissed = gone until the next morning's adaptive run. If the same adjustment is still warranted tomorrow, a new card surfaces naturally.
- **D-05:** No persistence of `pendingChanges` to AsyncStorage — the adaptive brain regenerates fresh on each app open.
- **D-06:** Wire existing `onUndo` to `usePlanStore().undoPlan()` and `onDismiss` to `usePlanStore().dismissChanges()` in the Today screen.
- **D-07:** Persist `changeLog: AdaptiveChange[]` in plan-store via Zustand's existing `persist` middleware. Cap at 30 entries (~200 bytes each). On dismiss, move `pendingChanges` into `changeLog` with a `timestamp` field.
- **D-08:** Show one primary reason per change in the InsightCard UI. Store all factor weights in the persisted log for future explainability/history view.

### Claude's Discretion

- **Daily debounce mechanism** (BRAIN-01): Claude decides implementation — AsyncStorage date key vs Zustand persisted flag for the once-per-day gate on `useAdaptivePlan`.
- **Card ordering** within Today screen: Claude decides exact z-order/position beyond the D-02 guideline.
- **Error/empty states**: If HealthKit is unavailable or no sleep data exists, Claude decides the fallback behavior.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BRAIN-01 | Morning recalculation runs once per day on app foreground — AppState background→active trigger with AsyncStorage daily debounce, no expo-background-task | Debounce pattern via AsyncStorage `adaptive-last-run` date key; hook already exists, needs gate |
| BRAIN-02 | Sleep debt engine operational — rolling 14-night debt tracker with banking protocol visible on Today screen | `computeDebtLedger()` fully implemented; SleepDebtCard needs conditional render gate using `adaptiveContext.debt.severity` |
| BRAIN-04 | AdaptiveInsightCard renders on Today screen when plan changes — shows what changed, which factors drove it, with undo action | Card shell complete; `onUndo`/`onDismiss` need wiring to plan-store; already rendered conditionally in index.tsx |
| BRAIN-06 | Plan change logger produces human-readable explanation | `computeDelta()` already produces `AdaptiveChange[]` with `humanReadable` + `reason`; need `changeLog` array added to plan-store with persist |
</phase_requirements>

---

## Summary

Phase 8 is primarily a **wiring phase**, not a build phase. All six adaptive brain modules are complete and test-passing (354 tests total, 55 in adaptive suite). The components exist, the stores have the right shape, and the hook already fires on mount. Three specific gaps remain: (1) the daily debounce gate is missing from `useAdaptivePlan`, (2) `SleepDebtCard` renders unconditionally, and (3) `changeLog` does not exist in plan-store and the store is not yet wrapped with `persist`.

The key technical risk is adding `persist` middleware to `plan-store` for the first time. The existing store is not persisted at all — adding it mid-lifecycle requires careful `partialize` scoping to avoid serializing large `SleepPlan` objects or breaking existing tests.

**Primary recommendation:** Implement the daily debounce in `_layout.tsx`'s AppState handler (same location as BUG-02's `finalizeDay` call) rather than inside the hook, so the gate runs at the correct system lifecycle point. Use AsyncStorage directly (not Zustand persist) for the date key — simpler and avoids store rehydration timing issues.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | (project) | State store + persist middleware | Already used by all stores; `persist` + `createJSONStorage` pattern established |
| `@react-native-async-storage/async-storage` | (project) | Persistent key-value storage | Already mocked in jest, used across all stores |
| `date-fns` | (project) | Date formatting and comparison | `format(new Date(), 'yyyy-MM-dd')` already used in `_layout.tsx` |
| React Native `AppState` | (project) | App foreground detection | Already wired in `_layout.tsx` for BUG-02 |

No new packages are needed. All dependencies already exist in the project.

**Installation:** None required.

---

## Architecture Patterns

### Pattern 1: Daily Debounce via AsyncStorage Date Key (BRAIN-01)

**What:** Before running the adaptive brain, read/write a date string to AsyncStorage. If today's ISO date matches what's stored, skip. Update the key after a successful run.

**When to use:** The AppState `background→active` handler in `_layout.tsx` is the best trigger point — it already houses the BUG-02 `finalizeDay` call and runs at the exact lifecycle moment needed.

**Two valid implementation locations:**

Option A — In `_layout.tsx` AppState handler (RECOMMENDED):
```typescript
// _layout.tsx — inside the AppState 'change' listener, after existing finalizeDay call
if (lastState !== 'active' && next === 'active') {
  // ... existing finalizeDay code ...

  // Daily adaptive brain gate
  const TODAY_KEY = 'adaptive-last-run';
  const todayISO = format(new Date(), 'yyyy-MM-dd');
  AsyncStorage.getItem(TODAY_KEY).then((lastRun) => {
    if (lastRun !== todayISO) {
      AsyncStorage.setItem(TODAY_KEY, todayISO);
      // Signal the hook to run — or call useAdaptivePlan imperatively
    }
  });
}
```

Option B — Inside `useAdaptivePlan` hook (alternative):
```typescript
// useAdaptivePlan.ts — gate inside the useEffect
const TODAY_KEY = 'adaptive-last-run';
const todayISO = format(new Date(), 'yyyy-MM-dd');
const lastRun = await AsyncStorage.getItem(TODAY_KEY);
if (lastRun === todayISO) {
  setIsLoading(false);
  return; // already ran today
}
await AsyncStorage.setItem(TODAY_KEY, todayISO);
// ... rest of run() ...
```

**Recommended approach:** Option B — inside `useAdaptivePlan.ts`. It is self-contained, testable in isolation, and does not require threading state between `_layout.tsx` and the hook. The `_layout.tsx` AppState handler is already complex; adding async AsyncStorage logic there increases coupling. The hook already wraps everything in `async function run()` so the `await AsyncStorage.getItem()` call fits naturally at the top of `run()`.

**Source:** Established pattern in `_layout.tsx` using `format(new Date(), 'yyyy-MM-dd')` for date ISO strings (confirmed in context builder and plan-store).

### Pattern 2: SleepDebtCard Conditional Render (BRAIN-02)

**What:** Wrap `SleepDebtCard` in a guard using `adaptiveContext` from plan-store.

**Current state:** `SleepDebtCard` always renders in the `recovery` state section of `index.tsx`. The component itself shows "No debt detected — you're on track!" as a zero-state message. Per D-01, the card should not render at all when debt is zero and bank is zero.

**Where the gate lives:** In `index.tsx`, wrapping the `<SleepDebtCard />` render:

```typescript
// Read from store
const adaptiveContext = usePlanStore((s) => s.adaptiveContext);

// Gate computation
const showDebtCard = adaptiveContext
  ? (adaptiveContext.debt.severity !== 'none' || adaptiveContext.debt.bankHours > 0)
  : true; // show by default when no context yet (fallback to score-based estimate)

// In JSX
{showDebtCard && (
  <View style={styles.section}>
    <SleepDebtCard />
  </View>
)}
```

**Fallback:** When `adaptiveContext` is null (HealthKit unavailable or first launch), show the card — `SleepDebtCard` already has an internal score-based fallback that works without adaptive context.

**Card position per D-02:** The current render order in `index.tsx` places `SleepDebtCard` at the correct relative position (below `AdaptiveInsightCard`, which is above the `HeroScore` / `ScoreBreakdownCard` blocks). No reordering needed — the existing stack is correct.

### Pattern 3: AdaptiveInsightCard Wiring (BRAIN-04)

**Current state:** `AdaptiveInsightCard` is already rendered conditionally in `index.tsx` for both `recovery` and `on-shift` states:
```typescript
{adaptiveContext && adaptiveChanges.length > 0 && (
  <View style={styles.section}>
    <AdaptiveInsightCard
      changes={adaptiveChanges}
      context={adaptiveContext}
      onUndo={undoPlan}
      onDismiss={dismissChanges}
    />
  </View>
)}
```

**Gap:** The `onUndo` and `onDismiss` callbacks are already wired to `undoPlan` and `dismissChanges` respectively (confirmed reading `index.tsx` lines 147-148). The card's internal `dismissed` state guards re-render. The X button calls `setDismissed(true)` internally but does NOT call `onDismiss`. This means dismissal clears the UI but does not move `pendingChanges` to `changeLog` (D-07).

**Fix:** The X button inside `AdaptiveInsightCard` currently calls only `setDismissed(true)`. It must also call `onDismiss()` so the store updates.

```typescript
// AdaptiveInsightCard.tsx — X button Pressable
<Pressable onPress={() => { onDismiss(); setDismissed(true); }} hitSlop={10}>
```

### Pattern 4: changeLog Persistence (BRAIN-06)

**What:** Add `changeLog: AdaptiveChange[]` to plan-store with Zustand `persist` middleware.

**Critical finding:** `plan-store.ts` currently has NO persist middleware. Adding it for the first time requires wrapping the entire store creation with `persist(...)` and using `partialize` to exclude large/volatile state.

**What MUST be excluded from persist:**
- `plan: SleepPlan | null` — large object (~50+ blocks), regenerated on open
- `isGenerating: boolean` — ephemeral UI state
- `error: string | null` — ephemeral
- `adaptiveContext: AdaptiveContext | null` — regenerated fresh each morning
- `pendingChanges: AdaptiveChange[]` — per D-05, not persisted
- `planSnapshot: SleepPlan | null` — another large plan object

**What to persist:**
- `changeLog: AdaptiveChange[]` — the 30-entry capped log (D-07)
- `daysUntilTransition: number` — lightweight, useful for conditional tab bar
- `snapshotTimestamp: Date | null` — needed for 24h undo window to survive app restart

**Implementation shape:**
```typescript
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// New state shape additions:
changeLog: AdaptiveChange[];  // persisted, capped at 30
addToChangeLog: (changes: AdaptiveChange[]) => void;

// In persist config:
{
  name: 'adaptive-plan-store',
  storage: createJSONStorage(() => AsyncStorage),
  partialize: (s) => ({
    changeLog: s.changeLog,
    daysUntilTransition: s.daysUntilTransition,
    snapshotTimestamp: s.snapshotTimestamp,
  }),
}
```

**changeLog population:** On `dismissChanges()`, move `pendingChanges` into `changeLog` with a `timestamp` added. Cap at 30 entries (trim oldest).

```typescript
dismissChanges: () => {
  const { pendingChanges, changeLog } = get();
  const timestamp = new Date().toISOString();
  const stamped = pendingChanges.map((c) => ({ ...c, timestamp }));
  const updated = [...changeLog, ...stamped].slice(-30);
  set({ pendingChanges: [], changeLog: updated });
},
```

**AdaptiveChange type extension:** The `AdaptiveChange` interface in `types.ts` currently has no `timestamp` field. Add `timestamp?: string` as an optional field so the stored log entries carry a timestamp without breaking existing tests.

### Pattern 5: Zustand persist — migration version

Since `plan-store` has no prior persist config, there is no migration concern. The store key `'adaptive-plan-store'` is new. On first launch after the update, AsyncStorage will have no matching key — Zustand's persist middleware initializes with the default state. No migration needed.

### Anti-Patterns to Avoid

- **Persisting SleepPlan objects:** Each plan has 50+ blocks with Date objects. Date serialization in JSON requires custom reviver or will come back as strings. Use `partialize` to exclude `plan`, `planSnapshot`, and `adaptiveContext` from persist.
- **Running adaptive brain on every app switch:** iOS app switch (home/back to app) fires `AppState` events. The debounce gate MUST be checked before any HealthKit reads. Not doing this would drain battery and cause excessive plan churn.
- **Calling `useAdaptivePlan()` from multiple components:** The hook is called once in `app/(tabs)/index.tsx`. Do not add a second call elsewhere — it would trigger a duplicate adaptive run.
- **Adding persist to plan-store without partialize:** Without `partialize`, Zustand would attempt to serialize the entire `SleepPlan` including `Date` objects, which serialize to strings and will not deserialize correctly.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Daily run gate | Custom debounce timer or ref | AsyncStorage date key | Already proven pattern; persists across app restarts; `format(new Date(), 'yyyy-MM-dd')` already in codebase |
| Plan change diff | Custom delta algorithm | `computeDelta()` in `change-logger.ts` | Already implemented, tested (55 tests passing), handles bedtime/wake/nap/banking cases |
| Debt computation | Re-implement rolling ledger | `computeDebtLedger()` | Already tested for all severity tiers, banking window logic, cap behavior |
| Context assembly | Read stores directly | `buildAdaptiveContext()` | Already handles all 4 factors, graceful HealthKit fallback |
| State persistence | Custom AsyncStorage write | Zustand `persist` middleware | Pattern already used in 5 other stores; mock already in `jest.config.js` |

**Key insight:** All algorithmic logic is complete. The planner should structure tasks as "wire X to Y" rather than "build X."

---

## Common Pitfalls

### Pitfall 1: AdaptiveInsightCard X button doesn't call onDismiss

**What goes wrong:** User taps X, card disappears from UI (`setDismissed(true)`) but `pendingChanges` are never moved to `changeLog`. BRAIN-06 requirement fails silently.

**Why it happens:** The card has internal `dismissed` state for immediate UI feedback, but the external `onDismiss` callback is only called in the explicit "Dismiss" button path, not the X button path.

**How to avoid:** In `AdaptiveInsightCard.tsx`, the X button Pressable `onPress` must call BOTH `onDismiss()` and `setDismissed(true)`. Check the "Accept" button in learning mode as well — it should also call `onDismiss()`.

**Warning signs:** `changeLog` remains empty after multiple dismiss actions.

### Pitfall 2: Date serialization in persisted plan-store

**What goes wrong:** If `planSnapshot` or `adaptiveContext` are accidentally included in `partialize`, their `Date` objects serialize to ISO strings. On rehydration, they come back as strings, breaking all `date-fns` operations.

**Why it happens:** Zustand persist uses `JSON.stringify`/`JSON.parse` by default. `Date` objects become strings.

**How to avoid:** The `partialize` config must explicitly list ONLY the fields to persist. Do not use `omit` logic — use explicit allowlist. Only persist `changeLog`, `daysUntilTransition`, and `snapshotTimestamp` (as ISO string).

**Warning signs:** TypeScript errors on `Date` operations, or `differenceInHours` returning `NaN` after app restart.

### Pitfall 3: adaptive brain runs immediately on cold launch, not just on foreground

**What goes wrong:** `useAdaptivePlan` fires on hook mount (app/(tabs)/index.tsx). On cold launch, this runs once correctly. But if the AppState handler also triggers a re-run, the brain runs twice within seconds.

**Why it happens:** The hook's `useEffect` runs on mount (which happens on cold launch). If the debounce is placed ONLY in the AppState handler, the initial cold-launch run bypasses the gate.

**How to avoid:** The debounce gate belongs INSIDE the hook's `run()` function — it runs on both cold launch AND AppState-triggered re-mounts. This ensures the gate is checked regardless of how the run is triggered.

### Pitfall 4: plan-store persist wrapping breaks existing tests

**What goes wrong:** `plan-store.test.ts` uses `usePlanStore.setState({...})` for test setup. Adding `persist` middleware changes how state is initialized (requires hydration). Tests that run before hydration completes may see default state instead of test-injected state.

**Why it happens:** Zustand's persist middleware is async — it reads from AsyncStorage before populating state. In tests, AsyncStorage is mocked with an in-memory implementation that is synchronous, but the `persist` hydration still wraps in a promise.

**How to avoid:** After adding persist, add `await usePlanStore.persist.rehydrate()` (or `usePlanStore.persist.setOptions({ skipHydration: true })`) to test setup. Check existing store test patterns — `score-store.test.ts` and `notification-store.test.ts` already handle persisted stores and can serve as reference.

**Warning signs:** Tests that previously passed begin asserting default values instead of mock-injected values.

### Pitfall 5: SleepDebtCard shows incorrect data when adaptiveContext is null

**What goes wrong:** The gate logic `adaptiveContext ? ... : true` shows the card (fallback=true) when context is null. But if HealthKit permanently fails, the card always shows the score-based estimate, which may be stale.

**Why it happens:** The fallback exists to handle the first-launch case before HealthKit has been read.

**How to avoid:** This is acceptable behavior per D-01 — the fallback state (no adaptive context) shows the card with the score-based estimate. This is better than hiding data from the user. The fallback is intentional.

---

## Code Examples

### Complete debounce gate in useAdaptivePlan

```typescript
// Source: Established pattern from _layout.tsx + plan-store context
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, subDays } from 'date-fns';

const ADAPTIVE_LAST_RUN_KEY = 'adaptive-last-run';

async function run() {
  setIsLoading(true);
  try {
    const today = new Date();
    const todayISO = format(today, 'yyyy-MM-dd');

    // Daily debounce: skip if already ran today
    const lastRun = await AsyncStorage.getItem(ADAPTIVE_LAST_RUN_KEY);
    if (lastRun === todayISO) {
      setIsLoading(false);
      return;
    }

    // ... rest of adaptive logic ...

    // Mark as run for today (after successful completion)
    await AsyncStorage.setItem(ADAPTIVE_LAST_RUN_KEY, todayISO);
  } catch (err) {
    console.warn('[useAdaptivePlan] Failed:', err);
  } finally {
    if (!cancelled) setIsLoading(false);
  }
}
```

### changeLog addition to dismissChanges

```typescript
// Source: plan-store.ts pattern, D-07 from CONTEXT.md
dismissChanges: () => {
  const { pendingChanges, changeLog } = get();
  if (pendingChanges.length === 0) {
    set({ pendingChanges: [] });
    return;
  }
  const timestamp = new Date().toISOString();
  const stamped = pendingChanges.map((c) => ({ ...c, timestamp }));
  const updated = [...changeLog, ...stamped].slice(-30); // cap at 30
  set({ pendingChanges: [], changeLog: updated });
},
```

### AdaptiveChange type extension (timestamp field)

```typescript
// Source: src/lib/adaptive/types.ts — existing AdaptiveChange interface
export interface AdaptiveChange {
  type: ChangeType;
  factor: ChangeFactor;
  magnitudeMinutes: number;
  humanReadable: string;
  reason: string;
  citation?: string;
  timestamp?: string;  // ADD: ISO string, populated on dismissal into changeLog
}
```

### plan-store persist wrapper skeleton

```typescript
// Source: score-store.ts and notification-store.ts patterns
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      // ... all existing state and actions unchanged ...
      changeLog: [],           // NEW
      addToChangeLog: ...,     // NEW (or handled inside dismissChanges)
    }),
    {
      name: 'adaptive-plan-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        changeLog: s.changeLog,
        daysUntilTransition: s.daysUntilTransition,
        snapshotTimestamp: s.snapshotTimestamp,
      }),
    },
  ),
);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `expo-background-task` for adaptive brain | AppState `background→active` trigger | Decided in requirements (REQUIREMENTS.md Out of Scope) | Background tasks can't write to Zustand/React context; AppState is superior for this use case |
| Hook-only debounce (mount once) | Hook with AsyncStorage date gate | Phase 8 | Prevents re-run on every app switch without the gate |
| `pendingChanges` as the log | `pendingChanges` (ephemeral) + `changeLog` (persisted) | Phase 8 (D-07) | Enables history view in future phases |

**Deprecated/outdated:**
- `expo-background-task`: Out of scope per REQUIREMENTS.md — cannot write to Zustand state from background context.

---

## Open Questions

1. **Should the adaptive brain also fire on cold launch, or only on foreground transitions?**
   - What we know: `useAdaptivePlan` fires on hook mount (cold launch). The AppState handler fires on background→active. The debounce gate (`lastRun === todayISO`) handles the "already ran" case.
   - What's unclear: Whether the intent is "once per day total" (first of: cold launch OR foreground) or "once per day on foreground only."
   - Recommendation: "Once per day total" is the correct interpretation per BRAIN-01: "runs once per day on app foreground." Cold launch IS an app foreground event. The date-key gate handles this correctly.

2. **Should snapshotTimestamp survive app restart for the 24h undo window?**
   - What we know: `undoPlan()` checks `differenceInHours(new Date(), snapshotTimestamp) > 24`. Currently `snapshotTimestamp` is in-memory only — resets on app kill.
   - What's unclear: Is the undo window supposed to survive app restart?
   - Recommendation: Yes, include `snapshotTimestamp` in partialize. A user who changes their plan at 9pm should still be able to undo at 8pm the next day. Including it costs near-zero (single ISO string).

---

## Environment Availability

Step 2.6: SKIPPED — Phase 8 is purely code changes to existing React Native/TypeScript files. No new external dependencies, CLI tools, or services are introduced.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 30.3.0 + ts-jest 29.4.6 |
| Config file | `jest.config.js` |
| Quick run command | `npx jest --testPathPatterns="adaptive"` |
| Full suite command | `npx jest` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BRAIN-01 | Debounce gate: skip if same-day ISO matches AsyncStorage | unit | `npx jest --testPathPatterns="useAdaptivePlan"` | ❌ Wave 0 |
| BRAIN-01 | Debounce gate: runs if date differs from stored | unit | `npx jest --testPathPatterns="useAdaptivePlan"` | ❌ Wave 0 |
| BRAIN-02 | SleepDebtCard hidden when severity=none AND bankHours=0 | unit | `npx jest --testPathPatterns="SleepDebtCard"` | ❌ Wave 0 |
| BRAIN-02 | SleepDebtCard shown when severity='mild' | unit | `npx jest --testPathPatterns="SleepDebtCard"` | ❌ Wave 0 |
| BRAIN-04 | AdaptiveInsightCard onDismiss fires when X pressed | unit | `npx jest --testPathPatterns="AdaptiveInsightCard"` | ❌ Wave 0 |
| BRAIN-04 | undoPlan restores planSnapshot | unit | `npx jest --testPathPatterns="plan-store"` | ✅ (plan-store.test.ts exists, extend) |
| BRAIN-06 | dismissChanges moves pendingChanges into changeLog | unit | `npx jest --testPathPatterns="plan-store"` | ✅ (extend plan-store.test.ts) |
| BRAIN-06 | changeLog capped at 30 entries | unit | `npx jest --testPathPatterns="plan-store"` | ✅ (extend plan-store.test.ts) |
| BRAIN-06 | changeLog entries carry timestamp field | unit | `npx jest --testPathPatterns="plan-store"` | ✅ (extend plan-store.test.ts) |

### Sampling Rate

- **Per task commit:** `npx jest --testPathPatterns="adaptive|plan-store"`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green (354+ tests) before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `__tests__/hooks/useAdaptivePlan.test.ts` — covers BRAIN-01 debounce gate (new file)
- [ ] `__tests__/components/SleepDebtCard.test.ts` — covers BRAIN-02 conditional render (new file)
- [ ] `__tests__/components/AdaptiveInsightCard.test.ts` — covers BRAIN-04 X button calls onDismiss (new file)
- [ ] Extend `__tests__/store/plan-store.test.ts` — add persist + changeLog + dismissChanges tests

---

## Project Constraints (from CLAUDE.md)

- Run `npx jest` before any commit — all 354 tests must pass
- Expo/React Native stack — `npx expo start` to test on device/simulator
- Algorithm is core IP — changes to `src/lib/circadian/` must maintain all existing tests
- Dark-mode-first UI, professional quality
- Founder is beginner coder — explain decisions clearly in comments
- Phase 8 does NOT touch `src/lib/circadian/` (algorithm off-limits here)
- `src/lib/adaptive/` modules are complete and must not be changed algorithmically — only integrated

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection: `src/hooks/useAdaptivePlan.ts` — hook structure, current gaps
- Direct code inspection: `src/store/plan-store.ts` — no persist middleware confirmed, all state fields
- Direct code inspection: `src/components/today/AdaptiveInsightCard.tsx` — X button gap (calls setDismissed only)
- Direct code inspection: `src/components/today/SleepDebtCard.tsx` — unconditional render confirmed
- Direct code inspection: `app/_layout.tsx` — AppState handler location, BUG-02 pattern
- Direct code inspection: `app/(tabs)/index.tsx` — card stack order, existing AdaptiveInsightCard wiring
- Direct code inspection: `src/store/notification-store.ts`, `score-store.ts` — persist pattern reference
- Test run: `npx jest` — 354 tests passing baseline confirmed
- Test run: `npx jest --testPathPatterns="adaptive"` — 55 adaptive tests, all passing

### Secondary (MEDIUM confidence)
- `docs/superpowers/specs/2026-04-06-adaptive-brain-design.md` — architectural decisions, factor weights
- `.planning/phases/08-adaptive-brain-core/08-CONTEXT.md` — all D-01 through D-08 decisions

### Tertiary (LOW confidence)
- None.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in project, confirmed from package.json and imports
- Architecture: HIGH — code inspected directly, all gaps confirmed by reading actual files
- Pitfalls: HIGH — each identified from reading the actual code, not hypothesized
- Test gaps: HIGH — confirmed by globbing test files and checking for missing ones

**Research date:** 2026-04-07
**Valid until:** 2026-05-07 (stable — no fast-moving dependencies)
