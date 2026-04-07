# Phase 8: Adaptive Brain Core - Context

**Gathered:** 2026-04-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire the existing Adaptive Brain modules (6 files, 1,117 lines in `src/lib/adaptive/`) to production. The morning trigger runs once per day, calculates 14-night sleep debt, and surfaces human-readable plan change explanations on the Today screen with undo capability.

Requirements: BRAIN-01, BRAIN-02, BRAIN-04, BRAIN-06

</domain>

<decisions>
## Implementation Decisions

### Sleep Debt Visibility (BRAIN-02)
- **D-01:** SleepDebtCard is **threshold-gated** — show only when `severity !== 'none'` (debt >= 0.5h) OR `bankHours > 0`. At zero debt and zero bank, the card does not render. Silence = well-rested signal.
- **D-02:** When rendered, SleepDebtCard sits below AdaptiveInsightCard and above the recovery block in the Today card stack. No special prominence unless `severity === 'severe'`.

### Insight Card UX + Undo (BRAIN-04)
- **D-03:** Undo reverts to `planSnapshot` (pre-regeneration state already saved in plan-store). No new snapshot infrastructure needed.
- **D-04:** X button dismisses the card for this adaptive cycle. Dismissed = gone until the next morning's adaptive run. If the same adjustment is still warranted tomorrow, a new card surfaces naturally.
- **D-05:** No persistence of `pendingChanges` to AsyncStorage — the adaptive brain regenerates fresh on each app open.
- **D-06:** Wire existing `onUndo` to `usePlanStore().undoPlan()` and `onDismiss` to `usePlanStore().dismissChanges()` in the Today screen.

### Change Log Storage (BRAIN-06)
- **D-07:** Persist `changeLog: AdaptiveChange[]` in plan-store via Zustand's existing `persist` middleware. Cap at 30 entries (~200 bytes each). On dismiss, move `pendingChanges` into `changeLog` with a `timestamp` field.
- **D-08:** Show **one primary reason** per change in the InsightCard UI (e.g., "Bedtime moved earlier because debt is high"). Store all factor weights in the persisted log for future explainability/history view.

### Claude's Discretion
- **Daily debounce mechanism** (BRAIN-01): Claude decides implementation — AsyncStorage date key vs Zustand persisted flag for the once-per-day gate on `useAdaptivePlan`.
- **Card ordering** within Today screen: Claude decides exact z-order/position beyond the D-02 guideline.
- **Error/empty states**: If HealthKit is unavailable or no sleep data exists, Claude decides the fallback behavior.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Spec
- `docs/superpowers/specs/2026-04-06-adaptive-brain-design.md` -- Full Adaptive Brain architecture: 4-factor weights (circadian 50%/debt 20%/lookahead 20%/recovery 10%), 5 circadian transition protocols, sleep banking engine, learning phase rules

### Adaptive Brain Modules (existing implementation)
- `src/lib/adaptive/types.ts` -- Core types: AdaptiveContext, AdaptiveChange, TransitionType, DebtLedger
- `src/lib/adaptive/context-builder.ts` -- Assembles 4-factor context from HealthKit + stores
- `src/lib/adaptive/sleep-debt-engine.ts` -- 14-night rolling debt ledger with banking protocol
- `src/lib/adaptive/change-logger.ts` -- computeDelta producing AdaptiveChange[] with reason/factor
- `src/lib/adaptive/circadian-protocols.ts` -- Transition detection and protocol building (Phase 9 scope, but types needed)
- `src/lib/adaptive/recovery-calculator.ts` -- Recovery score computation

### Stores and Hooks
- `src/store/plan-store.ts` -- planSnapshot, undoPlan(), dismissChanges(), setAdaptiveContext(), regeneratePlan()
- `src/store/score-store.ts` -- finalizeDay(), todayScore(), dailyHistory
- `src/hooks/useAdaptivePlan.ts` -- Current hook (fires on mount, no debounce yet)

### Today Screen Components
- `src/components/today/AdaptiveInsightCard.tsx` -- Existing card shell (needs onUndo/onDismiss wiring)
- `src/components/today/SleepDebtCard.tsx` -- Existing component (needs threshold gating)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AdaptiveInsightCard.tsx`: Has color-coded left border + icon for factor attribution. Needs `onUndo`/`onDismiss` callback wiring.
- `SleepDebtCard.tsx`: Renders debt/credit visualization. Needs conditional render gate.
- `useAdaptivePlan.ts`: Fires on mount, assembles context, calls computeDelta. Needs daily debounce wrapper.
- `computeDelta()`: Already returns `AdaptiveChange[]` with `field`, `oldValue`, `newValue`, `reason`, `factor`.
- `computeDebtLedger()`: 14-night rolling debt calculation already implemented.
- `planSnapshot` + `undoPlan()`: Already in plan-store, ready to wire.

### Established Patterns
- Zustand stores with `persist(createJSONStorage(() => AsyncStorage))` for persistence
- AppState background->active handler in `_layout.tsx` for triggers
- `format(new Date(), 'yyyy-MM-dd')` for date ISO strings throughout

### Integration Points
- `app/(tabs)/index.tsx` calls `useAdaptivePlan()` — hook mount point
- `_layout.tsx` AppState handler — where daily debounce check would run
- Today screen card stack — where SleepDebtCard conditional render goes

</code_context>

<specifics>
## Specific Ideas

No specific requirements -- open to standard approaches using existing modules.

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope.

</deferred>

---

*Phase: 08-adaptive-brain-core*
*Context gathered: 2026-04-07*
