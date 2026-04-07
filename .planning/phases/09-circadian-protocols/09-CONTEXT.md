# Phase 9: Circadian Protocols - Context

**Gathered:** 2026-04-07
**Status:** Already implemented — verification only

<domain>
## Phase Boundary

Route shift transitions to one of five circadian protocol types, and show a dual-meter debt/credit visualization on the Today screen.

Requirements: BRAIN-03, BRAIN-05

**Finding: Both requirements are already satisfied by existing code.**

</domain>

<decisions>
## Implementation Decisions

### BRAIN-03: Circadian Transition Protocols — ALREADY IMPLEMENTED
- `src/lib/adaptive/circadian-protocols.ts` (245 lines) implements `detectTransition()` + `buildProtocol()`
- 6 transition types: day-to-night, night-to-day, evening-to-night, day-to-evening, isolated-night, none
- Mapping to roadmap terminology: pre-shift=day-to-night/evening-to-night, post-shift=night-to-day, rotating=day-to-evening, off-sequence=isolated-night
- `context-builder.ts:137-138` calls both functions and pipes protocol into `adaptiveContext.circadian.protocol`
- `app/(tabs)/brief.tsx` renders protocol dailyTargets, lightGuidance, napGuidance
- `__tests__/adaptive/circadian-protocols.test.ts` has 14 passing tests covering all transition types

### BRAIN-05: SleepDebtCard Dual-Meter — ALREADY IMPLEMENTED
- `src/components/today/SleepDebtCard.tsx` (230 lines) renders:
  - Debt bar (red/yellow/green based on severity)
  - Bank bar (green, shown when bankHours > 0)
  - Debt and bank numeric values in header
  - Recovery plan with payback nights estimate
- Phase 8 added conditional render gate (showDebtCard in index.tsx)
- Data flows from adaptiveContext.debt.rollingHours + bankHours

### Claude's Discretion
No remaining decisions — both requirements were implemented during the Adaptive Brain build.

</decisions>

<canonical_refs>
## Canonical References

### Circadian Protocol Engine
- `src/lib/adaptive/circadian-protocols.ts` — detectTransition + buildProtocol (6 transition types)
- `src/lib/adaptive/context-builder.ts` — Wires protocols into AdaptiveContext
- `__tests__/adaptive/circadian-protocols.test.ts` — 14 tests covering all transitions

### UI Surface
- `app/(tabs)/brief.tsx` — Pre-Shift Brief tab renders dailyTargets, lightGuidance, napGuidance
- `src/components/today/SleepDebtCard.tsx` — Dual-meter debt/bank visualization

</canonical_refs>

<code_context>
## Existing Code Insights

### Already Complete
- Protocol detection: All 6 types detected from shift schedule
- Protocol building: Daily targets with bedtime adjustments, light guidance, nap guidance
- UI rendering: Brief tab shows full protocol details, Today screen shows debt card
- Tests: 14 tests for circadian-protocols.ts passing

### No New Code Needed
Phase 9 requirements were implemented as part of the Adaptive Brain foundation in earlier phases.

</code_context>

<specifics>
## Specific Ideas

No new implementation needed — phase is verification-only.

</specifics>

<deferred>
## Deferred Ideas

None — phase requirements already satisfied.

</deferred>

---

*Phase: 09-circadian-protocols*
*Context gathered: 2026-04-07*
