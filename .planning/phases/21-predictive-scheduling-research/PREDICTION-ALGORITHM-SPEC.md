# ShiftWell Predictive Scheduling Algorithm Specification

**Phase:** 21 — Predictive Scheduling Research
**Date:** 2026-04-07
**Implements:** Recommendation from [FATIGUE-MODEL-COMPARISON.md](./FATIGUE-MODEL-COMPARISON.md)
**Algorithm Name:** ShiftWell Circadian Stress Index (SCSI)
**Lineage:** Modified Three-Process Model (Akerstedt & Folkard 1997) + FAID-inspired schedule scorer (per FATIGUE-MODEL-COMPARISON section 4)

---

## Section 1: Algorithm Overview

### Name and Purpose

**ShiftWell Circadian Stress Index (SCSI)**

Given a 14-day shift schedule, SCSI produces a stress score and pre-adaptation recommendation for each identified circadian transition. It answers the question: *"For every upcoming shift change in your calendar, how hard will it be on your body, and what can you do about it starting today?"*

### Lineage

SCSI extends ShiftWell's existing Two-Process Model engine (`energy-model.ts`) with three additions derived from the comparative analysis in FATIGUE-MODEL-COMPARISON.md:

1. **Process W (sleep inertia)** — from Three-Process Model (Akerstedt & Folkard 1997)
2. **Multi-day circadian state propagation** — extends the existing single-day prediction to 14-day lookahead
3. **FAID-inspired Transition Stress Scorer** — schedule-only risk scoring using published risk curves (Folkard & Tucker 2003, Folkard & Lombardi 2006)

### Relationship to Existing Codebase

```
EXISTING (do not modify):
- src/lib/circadian/energy-model.ts     → Single-day alertness prediction
- src/lib/circadian/classify-shifts.ts  → DayType classification from calendar
- src/lib/circadian/sleep-windows.ts    → computeSleepBlocks() with bedtimeOffsetMinutes param
- src/lib/circadian/types.ts            → ShiftType, DayType, PlanBlock, UserProfile

NEW (Phase 22 will create):
- src/lib/prediction/types.ts           → PredictionInput, TransitionPrediction, CircadianState
- src/lib/prediction/transition-detector.ts
- src/lib/prediction/stress-scorer.ts
- src/lib/prediction/protocol-generator.ts
- src/lib/prediction/lookahead.ts       → Top-level runLookahead()
```

---

## Section 2: Inputs

### Primary Input Interface

```typescript
interface PredictionInput {
  shifts: Array<{
    date: string;        // yyyy-MM-dd (ISO date only, no time)
    startHour: number;   // 0-23 (hour shift begins)
    endHour: number;     // 0-23 (hour shift ends; endHour < startHour means crosses midnight)
    type: 'day' | 'evening' | 'night' | 'off';
  }>;
  currentSleepDebt: number;    // hours, from HealthKit history or user report
  baselineMidsleep: number;    // Current circadian anchor point (hours, 0-24); e.g., 2.5 = 2:30 AM
  lookAheadDays: number;       // 14 for Phase 22; must be >= 7
}
```

### Supplementary Inputs (Optional — from HealthKit if available)

```typescript
interface CircadianState {
  acrophaseHour: number;              // Estimated peak alertness time (0-24); default 16.0
  sleepDebtHours: number;             // Cumulative sleep debt; from PredictionInput.currentSleepDebt
  sleepPressureBaseline: number;      // Process S level at last wake; default 0.0
  lastSleepQuality: number;           // 0-100 recovery score; default 50 (neutral)
  consecutiveNightShifts: number;     // Ongoing night shift stretch; default 0
  daysSinceLastFullRecovery: number;  // Days since 7+ hours of aligned sleep; default 0
}
```

### Input Derivation Notes

- `baselineMidsleep` is derived from the user's chronotype offset: `(CHRONOTYPE_OFFSETS[chronotype].naturalSleepOnset + CHRONOTYPE_OFFSETS[chronotype].naturalWake) / 2`
- `currentSleepDebt` comes from the existing `sleepDebt` calculation in the energy model. If HealthKit data is unavailable, falls back to 0 (optimistic default with "ESTIMATED" label in UI).
- `shifts[].type` maps from the existing `ShiftType` in `classify-shifts.ts`: `'day' | 'evening' | 'night' | 'extended'` → `'day' | 'evening' | 'night' | 'night'` (extended treated as night for phase-shift purposes; gets additional duration penalty).

---

## Section 3: Algorithm Steps (Numbered Pseudocode)

```
ALGORITHM: runLookahead(input: PredictionInput): TransitionPrediction[]

INPUT:
  - Shift schedule (14 days)
  - Current sleep debt (hours)
  - Baseline midsleep (circadian anchor)

OUTPUT:
  - Array of TransitionPrediction objects, one per detected transition

STEP 1: CLASSIFY DAYS
  For each day in the 14-day window:
    - Map PredictionInput.shifts[] to ClassifiedDay[] using classify-shifts.ts
    - Days with no shift entry are classified as 'off'

STEP 2: DETECT TRANSITIONS
  For each consecutive pair of days (day[i-1], day[i]):
    a. Extract shift category: 'day', 'evening', 'night', or 'off'
    b. IF shift category changes AND day[i] is not 'off':
       - This is a transition point
    c. Calculate required phase shift:
       - Day -> Night: +10h (delay)
       - Night -> Day: -10h (advance)
       - Day -> Evening: +4h (delay)
       - Evening -> Day: -4h (advance)
       - Evening -> Night: +4h (delay)
       - Night -> Evening: -4h (advance)
       - Off -> Night (after day-aligned rest): +10h (delay)
    d. Count consecutive nights ahead, recovery days available
    e. Record DetectedTransition object

STEP 3: SCORE EACH TRANSITION
  For each DetectedTransition:
    a. Factor 1 — Rotation direction penalty (0-30 pts):
       penalty = |phaseShift| / 12 * 20
       IF advance: penalty *= 1.5  // advances are ~1.5x harder
       cap at 30
    b. Factor 2 — Recovery time penalty (0-25 pts):
       idealRecoveryDays = |phaseShift| / maxShiftRate
       maxShiftRate = 1.0 h/day (advance) or 1.5 h/day (delay)
       deficit = max(0, 1 - (recoveryDaysAvailable / idealRecoveryDays))
       penalty = round(deficit * 25)
    c. Factor 3 — Consecutive nights penalty (0-20 pts):
       1 night: 0, 2 nights: 4, 3: 8, 4: 13, 5: 17, 6+: 20
    d. Factor 4 — Cumulative sleep debt penalty (0-15 pts):
       ≤ 2h debt: 0,  ≤ 5h: 4,  ≤ 10h: 8,  ≤ 15h: 12,  > 15h: 15
    e. Factor 5 — Shift duration penalty (0-10 pts):
       extended: 10, night (12h): 6, day/evening (10h): 3, ≤ 8h: 0
    f. Total TSS = sum of 5 factors (0-100 scale)

STEP 4: MAP TSS TO SEVERITY
  total >= 70 -> 'critical'
  total >= 45 -> 'high'
  total >= 25 -> 'medium'
  total < 25  -> 'low'

STEP 5: CALCULATE PREDICTED ALERTNESS NADIR
  Using Three-Process Model (simplified):
  a. Propagate CircadianState through each preceding day using propagateState()
  b. At transition day: call predictEnergy() with state-derived parameters
  c. Identify minimum alertness score during shift work hours
  d. This is predictedAlertnesNadir (0-100 scale, higher = more alert)

STEP 6: CALCULATE PRE-ADAPTATION WINDOW
  a. Determine protocol start date:
     'critical': transitionDate - 4 days
     'high':     transitionDate - 3 days
     'medium':   transitionDate - 2 days
     'low':      transitionDate - 0 days (no protocol)
  b. Map severity to protocol type (from Phase 9 protocols):
     'critical' + day-to-night -> 'transition-to-nights' with 4-day ramp
     'critical' + night-to-day -> 'anchor-sleep' + 'transition-to-days' with 4-day ramp
     'high' -> standard transition protocol with 3-day ramp
     'medium' -> standard transition protocol with 2-day ramp
     'low' -> default day-type protocol (no change)

STEP 7: CONSTRUCT TransitionPrediction
  For each scored transition, emit TransitionPrediction object (see Section 4)
```

---

## Section 4: Outputs

### Primary Output Interface

```typescript
interface TransitionPrediction {
  transitionDate: string;           // yyyy-MM-dd — date of the stressful transition
  transitionType: TransitionType;   // Existing enum from classify-shifts.ts
  severityScore: number;            // 0-100 (higher = more stressful)
  severity: 'low' | 'medium' | 'high' | 'critical';
  preAdaptationStartDate: string;   // yyyy-MM-dd — when to begin pre-adaptation
  protocolType: string;             // Phase 9 protocol to trigger (see Section 7)
  predictedAlertnesNadir: number;   // Estimated alertness % at transition period nadir (0-100)
  daysUntilTransition: number;      // Calendar days from today to transitionDate
}

// TransitionType maps to existing enum from src/lib/circadian/types.ts
// New values added by the prediction engine:
type TransitionType =
  | 'day-to-night'       // +8 to +12h phase delay required
  | 'night-to-day'       // -8 to -12h phase advance required
  | 'day-to-evening'     // +3 to +5h phase delay
  | 'evening-to-day'     // -3 to -5h phase advance
  | 'evening-to-night'   // +3 to +5h phase delay
  | 'night-to-evening'   // -3 to -5h phase advance
  | 'off-to-night'       // Day-aligned rest → night shift start
  | 'off-to-extended'    // Precedes 24h shift (needs sleep banking)
  | 'extended-recovery'; // First day off after 24h+ shift
```

### Full Lookahead Result

```typescript
interface LookaheadResult {
  scanPeriod: { start: string; end: string };   // ISO dates
  transitions: TransitionPrediction[];
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  nextActionDate: string | null;                // When user should start next protocol
  peakDebtDay: string | null;                  // Day with highest predicted debt
  peakDebtHours: number;
  summary: string[];                            // Top 3 human-readable actions
}
```

---

## Section 5: Thresholds and Calibration

All "magic numbers" documented with scientific source.

### Transition Detection Threshold: > 4 hours shift in work start time

**Source:** Eastman & Burgess (2009). "Practical interventions to promote circadian adaptation." J Biological Rhythms.

**Justification:** The circadian clock can spontaneously drift ~1.5-2.0h per day through light exposure. A schedule change requiring less than 4h phase adjustment is manageable without a structured protocol — ambient light and behavioral cues can accommodate it over 2-3 days without explicit intervention. Changes > 4h require a protocol.

**Derivation:** 2 free days × 2.0h maximum shift rate = 4.0h buffer before protocol is needed.

### Pre-Adaptation Window: 3-5 Days Before Transition

**Source:** Crowley et al. (2003). "Preflight adjustment to eastward travel." Journal of Biological Rhythms. PMC1262683.

**Justification:** Combined light + melatonin protocols can achieve 1.0-2.0h of circadian shift per day. For a 10h transition (day-to-night), optimal adaptation requires 5-7 days. 3-4 days achieves partial adaptation that meaningfully reduces nadir severity even if full alignment is not reached.

**Calibration:** CRITICAL transitions start 4 days before; HIGH: 3 days; MEDIUM: 2 days. This maps to 80%, 60%, 40% of ideal adaptation respectively for a typical 10h phase shift.

### Severity Band Thresholds

**Source:** Hursh et al. (2004) SAFTE validation data and Folkard & Tucker (2003) accident risk meta-analysis.

| Band | Score | TSS Interpretation |
|------|-------|-------------------|
| LOW | < 25 | Minimal fatigue risk. Standard plan sufficient. Night 1 relative risk ~1.0x. |
| MEDIUM | 25-44 | Noticeable circadian stress. Proactive protocol recommended. Relative risk ~1.1-1.3x. |
| HIGH | 45-69 | Significant disruption expected. Active countermeasures needed. Relative risk ~1.4-2.0x. |
| CRITICAL | 70-100 | Dangerous transition. Patient safety concern for clinical workers. Relative risk > 2.0x. |

**Justification for 70/45/25 cutoffs:** Derived from mapping Folkard & Tucker relative risk thresholds (1.0x, 1.08x, 1.17x, 1.28x, 1.4x+) to a cumulative 0-100 score representing typical ER physician transition patterns (Sim's target user: 3-4 consecutive nights, day-to-night rotation with 1-2 days off between).

### Sleep Debt Escalation Rule

**Source:** Van Dongen et al. (2003). SLEEP.

When `currentSleepDebt > 8h` entering a transition, escalate severity one tier:
- LOW → MEDIUM
- MEDIUM → HIGH
- HIGH → CRITICAL
- CRITICAL → CRITICAL (already maximum)

**Justification:** Van Dongen demonstrated that 14 nights of 6h sleep creates impairment equivalent to 48h total sleep deprivation. Entering a hard transition while already carrying > 8h debt compounds the nadir significantly. The one-tier escalation reflects that debt-entering-transitions predicts roughly 1.3x additional risk relative to the schedule-only score.

### Phase Shift Rate Constants

**Source:** Burgess et al. (2003), Eastman & Burgess (2009).

| Direction | Maximum Rate | Mechanism |
|-----------|-------------|-----------|
| Delay (day → night) | ~1.5-2.0h/day | Evening bright light, morning light avoidance |
| Advance (night → day) | ~1.0-1.5h/day | Morning bright light, afternoon melatonin |

**Justification for asymmetry:** Human circadian free-running period > 24h (~24.2h on average). This makes phase delay more natural and faster than phase advance.

---

## Section 6: Edge Cases

### 1. No Transitions in 14-Day Window

**Behavior:** Return empty `transitions` array, `LookaheadResult.overallRisk = 'low'`.

**When it occurs:** Stable schedule (all same shift type), or schedule has only 1-2 days loaded.

**UI response:** No alert shown. Today screen shows normal plan without transition warnings.

### 2. Consecutive Transitions with No Recovery Gap

**Example:** Day shift Mon-Tue, off Wed (1 day), night shift Thu-Sat.

**Behavior:**
- Both transitions are scored independently with `recoveryDaysAvailable = 1`
- The second transition inherits accumulated debt from first transition in `propagateState()`
- If first transition is HIGH and second immediately follows, second likely scores CRITICAL via debt escalation
- Protocol generation merges overlapping protocols: the first protocol's later days overlap with the second protocol's earlier days — use the more aggressive intervention for each day

### 3. Unknown Shift Types

**Behavior:** Map to 'day' type as safe default. Log a console warning for Phase 22 debugging.

**When it occurs:** Custom calendar events with unrecognized patterns. The classify-shifts confidence score handles most cases — unclassified events become 'off' days, not unknown types.

### 4. Calendar Gaps (Days with No Shift Data)

**Behavior:**
- Gaps of 1-2 days: treated as 'off' days in propagateState()
- Gaps of 3+ days: lookahead runs on available data, emits a `LookaheadResult.summary` warning: "Your schedule is incomplete after [date]. Predictions shown are partial."
- The scanner does NOT generate transition predictions for days after the last imported shift

### 5. Sleep Debt > 8h Entering a Transition

**Behavior:** Escalate severity one tier (see Section 5 for scientific justification).

**Implementation:**
```typescript
if (input.currentSleepDebt > 8 && prediction.severity !== 'critical') {
  prediction.severity = ESCALATE[prediction.severity];
  prediction.severityScore = Math.min(100, prediction.severityScore + 15);
}
const ESCALATE = { low: 'medium', medium: 'high', high: 'critical' } as const;
```

### 6. Very Rapid Rotation (2-on, 2-off, 2-on)

**Behavior:** Transitions < 4h phase shift are classified as MINOR and NOT emitted as TransitionPredictions. Instead, SCSI recommends a "compromise position" — a fixed midsleep anchor midway between day and night alignment.

**Scientific basis:** Eastman & Burgess (2009) "compromise circadian position" strategy: workers with rapid rotation benefit more from anchoring to a fixed intermediate sleep time than from attempting full circadian adaptation on each cycle.

**Implementation flag:** When > 2 transition events detected within any 6-day window, switch to compromise-position mode and emit a single protocol recommendation instead of per-transition protocols.

### 7. Extended Shifts (24h+)

**Behavior:**
- Automatically assigned `severity: 'high'` regardless of other factors (minimum HIGH)
- Protocol emphasizes sleep banking (pre-shift nap 90 min, 6-8h before shift start) rather than circadian shifting
- Recovery period extended: post-shift sleep window target = 10h instead of 7.5h
- `predictedAlertnesNadir` automatically set to ≤ 30 for shifts > 20h duration (documented safety concern)

---

## Section 7: Integration Notes for Phase 22

### Files to Extend (DO NOT BREAK EXISTING TESTS)

**`src/lib/circadian/types.ts`:** Add `TransitionType` enum (extended from existing DayType). Add `import type { TransitionPrediction, LookaheadResult } from '../prediction/types'` for cross-module use.

**`src/lib/circadian/sleep-windows.ts`:** The `bedtimeOffsetMinutes` parameter already exists in `computeSleepBlocks()`. No changes needed — pre-adaptation protocols feed directly into this existing parameter.

**`src/lib/circadian/energy-model.ts`:** Add `propagateState()` as a new exported function. Add Process W sleep inertia term (replaces linear ramp). Existing `predictEnergy()` interface does NOT change — new behavior is opt-in via `CircadianState` parameter.

### Files to Create New

```
src/lib/prediction/
  types.ts               → PredictionInput, TransitionPrediction, LookaheadResult, CircadianState
  transition-detector.ts → findTransitions(), categorizeTransition(), calculatePhaseShift()
  stress-scorer.ts       → scoreTransition() and five penalty functions
  protocol-generator.ts  → generateProtocol(), generateDayToNightProtocol(), generateNightToDayProtocol()
  lookahead.ts           → runLookahead() (top-level orchestrator)
  index.ts               → public exports
```

### Performance Target

**Full 14-day SCSI scan < 50ms on device.**

Basis for this target:
- `classifyDays()` for 14 days: O(n) = 14 iterations, < 1ms
- `findTransitions()`: O(n) = 14 iterations, < 1ms
- `scoreTransition()` per transition: arithmetic only, < 0.1ms per transition
- `propagateState()` × 14 days: exponential functions, < 5ms total
- `predictFatigueWindow()` × 14 days: calls existing predictEnergy() once per day, < 30ms total
- Protocol generation: O(1) per transition, < 2ms

Worst case (14 days, 7 detected transitions): estimated < 40ms. Well within 50ms target.

### Mapping TransitionPrediction to Phase 9 Protocol Triggers

| Severity | Transition Type | protocolType field | Phase 9 Protocol |
|----------|----------------|-------------------|------------------|
| CRITICAL | day-to-night | `'pre-night-critical'` | `transition-to-nights` with 4-day ramp |
| CRITICAL | night-to-day | `'post-night-critical'` | `anchor-sleep` + `transition-to-days` 4-day |
| HIGH | day-to-night | `'pre-night-high'` | `transition-to-nights` with 3-day ramp |
| HIGH | night-to-day | `'post-night-high'` | `transition-to-days` with 3-day ramp |
| MEDIUM | any | `'standard-transition'` | `recovery-window` with 2-day ramp |
| LOW | any | `'default'` | Default plan, no modification |
| any | off-to-extended | `'sleep-banking'` | Pre-shift nap banking protocol |
| any | extended-recovery | `'extended-recovery'` | 10h sleep window protocol |

The `protocolType` string becomes the key that Phase 22's protocol generator looks up to select the correct pre-adaptation block sequence from Phase 9's existing transition handling logic.

### Notification Integration

| Trigger | Timing | notificationService call |
|---------|--------|--------------------------|
| CRITICAL detected on import | Immediate | `sendImmediateAlert()` |
| Protocol start | Morning of start date | `scheduleWindDown()` with custom message |
| Daily protocol step | 8 AM each protocol day | `scheduleMorningBrief()` with step content |
| Transition day | 6 AM | `scheduleMorningBrief()` with transition summary |
| Schedule change | On calendar re-sync | Re-run `runLookahead()`, diff results, alert on new HIGH/CRITICAL |

---

## Sources

1. Eastman & Burgess (2009). PMID: 19346453. — Transition detection threshold (>4h), phase shift rates
2. Crowley et al. (2003). PMC1262683. — 3-5 day pre-adaptation window
3. Hursh et al. (2004). PMID: 15018265. — Severity band derivation (SAFTE validation data)
4. Folkard & Tucker (2003). PMID: 12637593. — Consecutive nights risk multipliers
5. Folkard & Lombardi (2006). PMID: 16570251. — Shift duration risk curves
6. Van Dongen et al. (2003). SLEEP. — Sleep debt escalation rule (>8h debt threshold)
7. Belenky et al. (2003). PMID: 12603781. — Recovery efficiency at 50%
8. Akerstedt & Folkard (1997). PMID: 9095372. — Process W: tau_i = 35 min, W_0 magnitude
9. Burgess et al. (2003). PMC1262683. — Phase shift rate constants (advance vs. delay asymmetry)
10. Borbely et al. (2022). PMC9540767. — Two-Process Model foundation; existing engine reference
