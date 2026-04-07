# Predictive Circadian Scheduling Algorithm Specification

---
date: 2026-04-07
tags: [algorithm, prediction, circadian, transition-stress, lookahead, scheduling]
source: literature-review-and-codebase-analysis
confidence: HIGH (mathematical foundation), MEDIUM (tuning parameters -- will need empirical validation)
---

## Purpose

Define the lookahead algorithm that scans a 14-day shift calendar and predicts circadian stress for each upcoming transition, generating pre-adaptation protocols. This sits on top of the existing circadian engine (`src/lib/circadian/`) and produces actionable warnings + countermeasures before transitions happen.

---

## Architecture Overview

```
                        +-------------------+
                        |  Calendar Import  |
                        |  (ICS / Manual)   |
                        +--------+----------+
                                 |
                                 v
                        +-------------------+
                        |  classify-shifts   |  (EXISTING)
                        |  classifyDays()    |
                        +--------+----------+
                                 |
                                 v
                    +--------------------------+
                    |  Transition Detector      |  (NEW)
                    |  findTransitions()        |
                    +--------+-----------------+
                             |
              +--------------+--------------+
              |                             |
              v                             v
   +--------------------+       +------------------------+
   | Schedule Stress     |       | Physiological Predictor |
   | Scorer (FAID-like)  |       | (Three-Process Model)   |
   | scoreTransition()   |       | predictFatigueWindow()  |
   +--------+-----------+       +--------+---------------+
            |                             |
            +-------------+---------------+
                          |
                          v
              +------------------------+
              | Transition Stress Score |  (NEW)
              | LOW / MED / HIGH / CRIT|
              +--------+---------------+
                       |
                       v
              +------------------------+
              | Pre-Adaptation Protocol |  (NEW)
              | generateProtocol()      |
              +------------------------+
                       |
                       v
              +------------------------+
              | Integration Layer       |
              | -> Existing PlanBlocks  |
              | -> Notifications        |
              | -> Calendar Export       |
              +------------------------+
```

---

## Module 1: Transition Detector

### Purpose
Scan the classified day array from `classifyDays()` and identify every point where the schedule demands a circadian phase change.

### Input
```typescript
interface TransitionDetectorInput {
  classifiedDays: ClassifiedDay[];  // from classify-shifts.ts
  currentSleepDebt: number;         // hours, from HealthKit or manual
  currentCircadianPhase: number;    // estimated acrophase hour (0-24)
}
```

### Output
```typescript
interface DetectedTransition {
  id: string;
  date: Date;                        // day the transition begins
  type: TransitionType;
  fromShiftType: ShiftType | 'off';
  toShiftType: ShiftType | 'off';
  daysUntil: number;                 // from today
  recoveryDaysAvailable: number;     // off days between last shift and this transition
  consecutiveNightsAhead: number;    // how many nights in the upcoming stretch
  consecutiveNightsBehind: number;   // how many nights in the stretch just ending
  phaseShiftRequired: number;        // hours of circadian shift needed (signed: + = delay, - = advance)
}

type TransitionType =
  | 'day-to-night'       // Most stressful: requires 8-12h phase delay
  | 'night-to-day'       // Second most stressful: requires 8-12h phase advance
  | 'day-to-evening'     // Moderate: requires 3-5h phase delay
  | 'evening-to-night'   // Moderate: requires 3-5h phase delay
  | 'evening-to-day'     // Moderate: requires 3-5h phase advance
  | 'night-to-evening'   // Moderate: requires 3-5h phase advance
  | 'off-to-night'       // Stressful if coming off day-aligned rest
  | 'off-to-extended'    // Requires sleep banking
  | 'extended-recovery'; // Post-24h shift recovery
```

### Detection Logic

```typescript
function findTransitions(input: TransitionDetectorInput): DetectedTransition[] {
  const transitions: DetectedTransition[] = [];

  for (let i = 1; i < input.classifiedDays.length; i++) {
    const prev = input.classifiedDays[i - 1];
    const curr = input.classifiedDays[i];

    // Identify shift type changes (ignoring off-to-off)
    const prevType = extractShiftCategory(prev.dayType);
    const currType = extractShiftCategory(curr.dayType);

    if (prevType !== currType && currType !== 'off') {
      // This is a transition point
      const phaseShift = calculateRequiredPhaseShift(prevType, currType);
      const recovery = countRecoveryDays(input.classifiedDays, i);
      const nightsAhead = countConsecutiveNights(input.classifiedDays, i);
      const nightsBehind = countConsecutiveNightsBehind(input.classifiedDays, i);

      transitions.push({
        id: `transition-${curr.date.toISOString().slice(0, 10)}`,
        date: curr.date,
        type: categorizeTransition(prevType, currType),
        fromShiftType: prevType,
        toShiftType: currType,
        daysUntil: daysBetween(new Date(), curr.date),
        recoveryDaysAvailable: recovery,
        consecutiveNightsAhead: nightsAhead,
        consecutiveNightsBehind: nightsBehind,
        phaseShiftRequired: phaseShift,
      });
    }
  }

  return transitions;
}
```

### Phase Shift Calculation

Based on Eastman & Burgess (2009) and Crowley et al. (2003):

| Transition | Phase Shift Required | Direction | Difficulty |
|------------|---------------------|-----------|------------|
| Day -> Night | +8 to +12h | Delay | Hard |
| Night -> Day | -8 to -12h | Advance | Very Hard |
| Day -> Evening | +3 to +5h | Delay | Moderate |
| Evening -> Day | -3 to -5h | Advance | Moderate |
| Evening -> Night | +3 to +5h | Delay | Moderate |
| Night -> Evening | -3 to -5h | Advance | Moderate |

**Key biological constraint:** The circadian clock can shift approximately:
- **Phase delay:** ~1.5-2.0 hours/day with optimal light exposure (easier, aligned with >24h free-running period)
- **Phase advance:** ~1.0-1.5 hours/day with morning bright light + afternoon melatonin (harder, fighting the clock's natural tendency)

Source: Burgess et al. (2003, PMC1262683), Eastman & Burgess (2009, PMC2603486)

---

## Module 2: Schedule Stress Scorer

### Purpose
Score each detected transition's difficulty using only schedule data (no biometrics required). This provides immediate value on calendar import.

### Scoring Formula

The Transition Stress Score (TSS) is computed as a weighted sum of five risk factors, each derived from published epidemiological data:

```typescript
interface TransitionStressFactors {
  rotationDirectionPenalty: number;   // 0-30 points
  recoveryTimePenalty: number;        // 0-25 points
  consecutiveNightsPenalty: number;   // 0-20 points
  cumulativeDebtPenalty: number;      // 0-15 points
  shiftDurationPenalty: number;       // 0-10 points
}

// Total: 0-100 scale
type StressLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
```

#### Factor 1: Rotation Direction Penalty (0-30 points)

Based on Crowley et al. (2003) and the Phase Response Curve literature:

```typescript
function rotationDirectionPenalty(transition: DetectedTransition): number {
  // Phase advances are harder than phase delays
  // Night-to-day is the hardest transition (large advance required)
  const phaseShift = Math.abs(transition.phaseShiftRequired);
  const isAdvance = transition.phaseShiftRequired < 0;

  // Base penalty: proportional to magnitude of required shift
  let penalty = (phaseShift / 12) * 20; // 12h shift = 20 points

  // Advance multiplier: advances are ~1.5x harder than delays
  // (Czeisler et al. 1990: circadian period > 24h means delay is natural)
  if (isAdvance) {
    penalty *= 1.5;
  }

  return Math.min(30, Math.round(penalty));
}
```

#### Factor 2: Recovery Time Penalty (0-25 points)

Based on Belenky et al. (2003): 3 recovery nights at 8h TIB are insufficient to fully restore performance after 7 nights of 5h sleep. And Folkard & Tucker (2003): safety degrades with insufficient inter-shift recovery.

```typescript
function recoveryTimePenalty(transition: DetectedTransition): number {
  const recoveryDays = transition.recoveryDaysAvailable;
  const phaseShift = Math.abs(transition.phaseShiftRequired);

  // Minimum recovery days needed = phaseShift / maxShiftRate
  // For advances: maxShiftRate = 1.0 h/day
  // For delays: maxShiftRate = 1.5 h/day
  const isAdvance = transition.phaseShiftRequired < 0;
  const maxRate = isAdvance ? 1.0 : 1.5;
  const idealRecoveryDays = Math.ceil(phaseShift / maxRate);

  // Deficit ratio: 0 = fully recovered, 1 = no recovery time at all
  const deficit = Math.max(0, 1 - (recoveryDays / idealRecoveryDays));

  return Math.round(deficit * 25);
}
```

#### Factor 3: Consecutive Nights Penalty (0-20 points)

Based on Folkard & Tucker (2003): relative risk of accident increases with each successive night shift.

Published risk multipliers (from meta-analysis):
- Night 1: 1.0x (baseline)
- Night 2: 1.08x
- Night 3: 1.17x
- Night 4: 1.28x
- Night 5+: ~1.4x+

```typescript
function consecutiveNightsPenalty(transition: DetectedTransition): number {
  const nights = transition.consecutiveNightsAhead;

  if (nights <= 1) return 0;
  if (nights === 2) return 4;
  if (nights === 3) return 8;
  if (nights === 4) return 13;
  if (nights === 5) return 17;
  return 20; // 6+ consecutive nights
}
```

#### Factor 4: Cumulative Sleep Debt Penalty (0-15 points)

Based on Van Dongen et al. (2003) chronic sleep restriction: cognitive deficits accumulate across days of restricted sleep and do NOT self-correct without extended recovery.

```typescript
function cumulativeDebtPenalty(
  transition: DetectedTransition,
  currentDebtHours: number,
): number {
  // Sleep debt from the preceding period compounds transition difficulty
  // Belenky (2003): even 7h/night for 7 days causes cumulative impairment
  // Threshold: >5h cumulative debt = meaningful impairment
  // Ceiling: >15h cumulative debt = severe

  if (currentDebtHours <= 2) return 0;
  if (currentDebtHours <= 5) return 4;
  if (currentDebtHours <= 10) return 8;
  if (currentDebtHours <= 15) return 12;
  return 15;
}
```

#### Factor 5: Shift Duration Penalty (0-10 points)

Based on Folkard & Lombardi (2006): risk increases non-linearly with shift length beyond 8 hours.

```typescript
function shiftDurationPenalty(transition: DetectedTransition): number {
  // Duration of the upcoming shifts in the stretch
  // 8h = baseline (0 points)
  // 10h = +3 points
  // 12h = +6 points
  // 16h+ = +10 points (extended shifts)

  const upcomingShift = transition.toShiftType;
  if (upcomingShift === 'extended') return 10;

  // Assume standard shift durations by type
  // (actual duration from calendar data when available)
  const typicalDurations: Record<string, number> = {
    day: 10,      // ED shifts are typically 10h
    evening: 10,
    night: 12,    // Night shifts typically longer
  };

  const duration = typicalDurations[upcomingShift] || 8;
  if (duration <= 8) return 0;
  if (duration <= 10) return 3;
  if (duration <= 12) return 6;
  return 10;
}
```

### Composite Score and Classification

```typescript
function scoreTransition(
  transition: DetectedTransition,
  currentDebtHours: number,
): TransitionStressScore {
  const factors: TransitionStressFactors = {
    rotationDirectionPenalty: rotationDirectionPenalty(transition),
    recoveryTimePenalty: recoveryTimePenalty(transition),
    consecutiveNightsPenalty: consecutiveNightsPenalty(transition),
    cumulativeDebtPenalty: cumulativeDebtPenalty(transition, currentDebtHours),
    shiftDurationPenalty: shiftDurationPenalty(transition),
  };

  const total = Object.values(factors).reduce((sum, v) => sum + v, 0);

  const level: StressLevel =
    total >= 70 ? 'CRITICAL' :
    total >= 45 ? 'HIGH' :
    total >= 25 ? 'MEDIUM' :
    'LOW';

  return { total, level, factors, transition };
}
```

### Threshold Rationale

| Level | Score Range | Meaning | Action |
|-------|------------|---------|--------|
| LOW | 0-24 | Manageable transition. Standard protocols sufficient. | Default plan |
| MEDIUM | 25-44 | Noticeable circadian stress. Pre-adaptation recommended. | 1-2 day protocol |
| HIGH | 45-69 | Significant circadian disruption expected. Active countermeasures needed. | 2-3 day protocol |
| CRITICAL | 70-100 | Dangerous transition. Insufficient recovery time or extreme rotation. | Maximum protocol + warning |

---

## Module 3: Physiological Predictor (Three-Process Extension)

### Purpose
When sleep data is available (from HealthKit, WHOOP, or manual entry), generate a more accurate fatigue prediction for the transition period using the Three-Process Model.

### Multi-Day State Propagation

The existing `predictEnergy()` in `energy-model.ts` operates on a single wake-to-sleep cycle. For predictive scheduling, we need to propagate state across days:

```typescript
interface CircadianState {
  acrophaseHour: number;              // current estimated peak alertness time
  sleepDebtHours: number;             // cumulative sleep debt
  sleepPressureBaseline: number;      // Process S level at wake
  lastSleepQuality: number;           // 0-100 recovery score
  consecutiveNightShifts: number;     // for phase drift estimation
  daysSinceLastFullRecovery: number;  // days since 7+ hours of aligned sleep
}

function propagateState(
  currentState: CircadianState,
  day: ClassifiedDay,
  sleepData?: { onset: Date; offset: Date; quality: number },
): CircadianState {
  const nextState = { ...currentState };

  // 1. Estimate sleep obtained
  const sleepHours = sleepData
    ? (sleepData.offset.getTime() - sleepData.onset.getTime()) / 3_600_000
    : estimateSleepFromSchedule(day); // fallback: predicted sleep

  // 2. Update sleep debt
  const SLEEP_NEED = 7.63; // WHOOP population average
  nextState.sleepDebtHours += Math.max(0, SLEEP_NEED - sleepHours);
  // Debt recovery: excess sleep reduces debt but at 50% efficiency
  // (Belenky 2003: recovery sleep is less efficient than baseline sleep)
  if (sleepHours > SLEEP_NEED) {
    nextState.sleepDebtHours -= (sleepHours - SLEEP_NEED) * 0.5;
  }
  nextState.sleepDebtHours = Math.max(0, nextState.sleepDebtHours);

  // 3. Update circadian phase (acrophase drift)
  if (day.dayType === 'work-night') {
    // Night shift with light protocol compliance: ~1.5h delay per night
    // Without compliance: ~0.5h delay per night (ambient light exposure)
    nextState.acrophaseHour = (nextState.acrophaseHour + 1.5) % 24;
    nextState.consecutiveNightShifts++;
  } else if (day.dayType === 'recovery' || day.dayType === 'transition-to-days') {
    // Recovery day with morning light: ~1.0h advance back toward normal
    nextState.acrophaseHour = (nextState.acrophaseHour - 1.0 + 24) % 24;
    nextState.consecutiveNightShifts = 0;
  } else {
    // Day-aligned schedule: clock anchors to normal position
    // Rate of return depends on distance from natural acrophase
    const naturalAcrophase = 16.0; // 4 PM
    const drift = nextState.acrophaseHour - naturalAcrophase;
    // Correct ~30% of remaining drift per day with normal light exposure
    nextState.acrophaseHour -= drift * 0.3;
    nextState.consecutiveNightShifts = 0;
  }

  // 4. Update sleep pressure baseline
  // After insufficient sleep, baseline Process S is elevated at next wake
  nextState.sleepPressureBaseline = 0.1 * (nextState.sleepDebtHours / SLEEP_NEED);

  // 5. Recovery tracking
  if (sleepHours >= SLEEP_NEED && day.dayType !== 'work-night') {
    nextState.daysSinceLastFullRecovery = 0;
  } else {
    nextState.daysSinceLastFullRecovery++;
  }

  return nextState;
}
```

### Predicted Fatigue Window

For each day in the lookahead, generate a predicted alertness profile:

```typescript
function predictFatigueWindow(
  state: CircadianState,
  day: ClassifiedDay,
): PredictedFatigueWindow {
  // Use existing predictEnergy() with state-derived parameters
  const wakeTime = estimateWakeTime(day);
  const sleepTime = estimateSleepTime(day);

  const curve = predictEnergy({
    wakeTime,
    targetSleepTime: sleepTime,
    recoveryScore: state.lastSleepQuality,
    sleepHoursLastNight: Math.max(0, 7.63 - state.sleepDebtHours / 7),
    shiftType: day.shift?.shiftType,
  });

  // Identify critical windows (score < 30 during work hours)
  const criticalWindows = getEnergyWindows(curve, 30, false)
    .filter(w => isOverlappingShift(w, day.shift));

  return {
    date: day.date,
    predictedAverage: curve.averageScore,
    predictedTrough: curve.predictions.reduce(
      (min, p) => Math.min(min, p.score), 100
    ),
    criticalWindows,
    circadianPhase: state.acrophaseHour,
    accumulatedDebt: state.sleepDebtHours,
  };
}
```

---

## Module 4: Pre-Adaptation Protocol Generator

### Purpose
Generate concrete preparation steps for each scored transition. The protocol starts N days before the transition, where N depends on the stress level.

### Protocol Timeline

| Stress Level | Protocol Start | Light Therapy | Melatonin | Sleep Shift/Day | Nap Strategy |
|-------------|----------------|---------------|-----------|-----------------|--------------|
| LOW | 0 days before | Standard | None | None | Standard |
| MEDIUM | 1-2 days before | Timed exposure | Optional | 1.0-1.5h/day | Pre-shift nap |
| HIGH | 2-3 days before | Aggressive timed | Recommended | 1.5-2.0h/day | Banking nap + pre-shift |
| CRITICAL | 3-4 days before | Maximum protocol | Recommended | 2.0h/day | Full banking strategy |

### Protocol Generation

```typescript
interface PreAdaptationProtocol {
  transitionId: string;
  startDate: Date;          // when to begin adaptation
  endDate: Date;            // the transition day
  stressLevel: StressLevel;
  dailyAdjustments: DailyAdjustment[];
  warnings: string[];       // human-readable warnings
  integrationBlocks: PlanBlock[];  // blocks to merge into existing plan
}

interface DailyAdjustment {
  date: Date;
  bedtimeShift: number;           // minutes to shift bedtime (+ = later, - = earlier)
  cumulativeBedtimeShift: number; // total shift from baseline
  lightProtocol: LightAdjustment;
  melatoninTiming?: Date;         // when to take melatonin (if recommended)
  napRecommendation?: NapBlock;
  description: string;            // human-readable explanation
}

interface LightAdjustment {
  seekStart: Date;
  seekEnd: Date;
  seekDescription: string;
  avoidStart: Date;
  avoidEnd: Date;
  avoidDescription: string;
}
```

### Protocol Logic by Transition Type

#### Day-to-Night Transition (Phase Delay)

Based on Eastman & Burgess (2009) compromise circadian position protocol:

```typescript
function generateDayToNightProtocol(
  transition: TransitionStressScore,
  profile: UserProfile,
): PreAdaptationProtocol {
  const stressLevel = transition.level;
  const transitionDate = transition.transition.date;

  // Determine protocol length
  const protocolDays = {
    LOW: 0,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4,
  }[stressLevel];

  // Bedtime delay per day: 1.5-2.0 hours (within circadian delay capacity)
  const delayPerDay = stressLevel === 'CRITICAL' ? 2.0 : 1.5;

  const dailyAdjustments: DailyAdjustment[] = [];
  const offsets = CHRONOTYPE_OFFSETS[profile.chronotype];

  for (let d = protocolDays; d > 0; d--) {
    const date = addDays(transitionDate, -d);
    const dayIndex = protocolDays - d; // 0-based day of protocol
    const cumulativeDelay = (dayIndex + 1) * delayPerDay * 60; // minutes

    dailyAdjustments.push({
      date,
      bedtimeShift: delayPerDay * 60, // minutes later each day
      cumulativeBedtimeShift: cumulativeDelay,
      lightProtocol: {
        // Evening bright light to promote delay
        seekStart: setTime(date, 19), // 7 PM
        seekEnd: setTime(date, 21),   // 9 PM
        seekDescription: 'Seek bright light (outdoors or light therapy lamp >2500 lux) to delay your clock.',
        // Morning light avoidance
        avoidStart: setTime(addDays(date, 1), 6), // 6 AM next morning
        avoidEnd: setTime(addDays(date, 1), 10),  // 10 AM
        avoidDescription: 'Avoid bright morning light. Wear blue-blocking glasses if you must be outside.',
      },
      melatoninTiming: stressLevel !== 'LOW'
        ? setTime(addDays(date, 1), offsets.naturalSleepOnset + cumulativeDelay / 60)
        : undefined,
      description: `Day ${dayIndex + 1} of ${protocolDays}: Stay up ${(cumulativeDelay / 60).toFixed(1)}h later than normal. Evening light therapy recommended.`,
    });
  }

  return {
    transitionId: transition.transition.id,
    startDate: addDays(transitionDate, -protocolDays),
    endDate: transitionDate,
    stressLevel,
    dailyAdjustments,
    warnings: generateWarnings(transition),
    integrationBlocks: convertToBlocks(dailyAdjustments),
  };
}
```

#### Night-to-Day Transition (Phase Advance)

Based on Burgess et al. (2003): morning bright light + afternoon melatonin advance protocol.

```typescript
function generateNightToDayProtocol(
  transition: TransitionStressScore,
  profile: UserProfile,
): PreAdaptationProtocol {
  // Phase advance protocol: harder than delay
  // Maximum advance rate: ~1.0h/day with combined light + melatonin
  // Protocol STARTS with the recovery day after the last night shift

  const protocolDays = {
    LOW: 1,     // recovery day handling only
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4,
  }[transition.level];

  const advancePerDay = 1.0; // hours -- more conservative for advances

  // Recovery day 1: Short sleep (4-5h post-shift), then BRIGHT LIGHT
  // Recovery day 2+: Advance bedtime by 1h/day, morning light, PM melatonin

  // ... (similar structure to delay protocol but with reversed light timing)
  // Key difference: morning light exposure is the primary zeitgeber for advances
  // Melatonin at ~6h before bedtime assists the advance
}
```

### Integration with Existing Circadian Protocols

The pre-adaptation protocol produces `PlanBlock[]` that integrate with the existing 5 transition types in `sleep-windows.ts`:

```typescript
// In computeSleepBlocks(), the bedtimeOffsetMinutes parameter already exists:
export function computeSleepBlocks(
  day: ClassifiedDay,
  profile: UserProfile,
  options?: { bedtimeOffsetMinutes?: number },
): PlanBlock[];

// The predictive scheduler provides the offset:
function applyPredictiveProtocol(
  day: ClassifiedDay,
  protocol: PreAdaptationProtocol,
): PlanBlock[] {
  const adjustment = protocol.dailyAdjustments.find(
    a => isSameDay(a.date, day.date)
  );

  if (!adjustment) {
    // No protocol adjustment for this day
    return computeSleepBlocks(day, profile);
  }

  // Apply the cumulative bedtime shift
  return computeSleepBlocks(day, profile, {
    bedtimeOffsetMinutes: adjustment.cumulativeBedtimeShift,
  });
}
```

This means the predictive scheduler feeds directly into the existing `bedtimeOffsetMinutes` parameter that `computeSleepBlocks()` already accepts. Zero breaking changes to the existing engine.

---

## Module 5: Lookahead Orchestrator

### Purpose
The top-level function that ties all modules together. Called on calendar import and daily refresh.

```typescript
interface LookaheadResult {
  scanPeriod: { start: Date; end: Date };
  transitions: TransitionStressScore[];
  protocols: PreAdaptationProtocol[];
  predictedFatigueWindows: PredictedFatigueWindow[];
  overallRiskLevel: StressLevel;
  summary: LookaheadSummary;
}

interface LookaheadSummary {
  totalTransitions: number;
  criticalTransitions: number;
  highTransitions: number;
  nextTransition: TransitionStressScore | null;
  nextActionDate: Date | null;          // when to start the next protocol
  peakDebtDay: Date | null;             // day with highest predicted sleep debt
  peakDebtHours: number;
  recommendedActions: string[];         // top 3 human-readable actions
}

async function runLookahead(
  shifts: ShiftEvent[],
  personalEvents: PersonalEvent[],
  profile: UserProfile,
  currentState: CircadianState,
  sleepHistory?: SleepRecord[],       // from HealthKit
): Promise<LookaheadResult> {
  const today = new Date();
  const endDate = addDays(today, 14);

  // Step 1: Classify all days in the window
  const classifiedDays = classifyDays(today, endDate, shifts, personalEvents);

  // Step 2: Detect transitions
  const transitions = findTransitions({
    classifiedDays,
    currentSleepDebt: currentState.sleepDebtHours,
    currentCircadianPhase: currentState.acrophaseHour,
  });

  // Step 3: Score each transition
  const scoredTransitions = transitions.map(t =>
    scoreTransition(t, currentState.sleepDebtHours)
  );

  // Step 4: Generate protocols for transitions that need them
  const protocols = scoredTransitions
    .filter(t => t.level !== 'LOW')
    .map(t => generateProtocol(t, profile));

  // Step 5: Propagate physiological state across the window
  let state = { ...currentState };
  const fatigueWindows: PredictedFatigueWindow[] = [];

  for (const day of classifiedDays) {
    const sleepData = sleepHistory?.find(s => isSameDay(s.date, day.date));
    fatigueWindows.push(predictFatigueWindow(state, day));
    state = propagateState(state, day, sleepData);
  }

  // Step 6: Compute summary
  const overallRisk = computeOverallRisk(scoredTransitions);
  const summary = computeSummary(scoredTransitions, protocols, fatigueWindows);

  return {
    scanPeriod: { start: today, end: endDate },
    transitions: scoredTransitions,
    protocols,
    predictedFatigueWindows: fatigueWindows,
    overallRiskLevel: overallRisk,
    summary,
  };
}
```

---

## Edge Cases

### 1. Unpredictable Schedules (ER Physician Workflow)

**Problem:** Many ER physicians get schedules only 2-4 weeks in advance with irregular patterns. The schedule may change mid-period.

**Handling:**
- The lookahead runs on whatever data is available. If only 7 days of shifts are imported, it scans 7 days.
- When new shifts are added, the lookahead re-runs and protocols are regenerated.
- Already-started protocols show a "protocol adjusted" indicator if the underlying schedule changes.

### 2. Shift Swaps

**Problem:** A colleague asks you to swap shifts. The swap may create a transition that didn't exist before.

**Handling:**
- On calendar change detection (ICS re-import or manual edit), re-run the full lookahead.
- If a swap creates a new HIGH or CRITICAL transition with insufficient lead time, generate an **emergency protocol** with compressed timeline:
  - Emergency protocol uses maximum intervention intensity (bright light + melatonin + banking nap)
  - Warning: "This swap creates a hard transition in X days. Here's an aggressive protocol, but expect some circadian stress."

### 3. Travel Across Time Zones

**Problem:** Shift worker travels for a conference or vacation, then returns to work.

**Handling:**
- Travel introduces a timezone offset that compounds with the shift transition.
- If `timezone_offset` is provided (from calendar event location or manual entry):
  - Add `abs(timezone_offset)` hours to the required phase shift for the next transition.
  - Eastward travel (advance) is harder than westward (delay) -- apply the advance multiplier.
  - Generate a combined jet-lag + transition protocol.

### 4. Partial Data (No Sleep History)

**Problem:** New user imports calendar but has no HealthKit sleep data yet.

**Handling:**
- Default `CircadianState` assumes:
  - Acrophase: 16.0 (standard 4 PM peak)
  - Sleep debt: 0h (optimistic default)
  - Last sleep quality: 50 (neutral)
- Schedule Stress Scorer still works fully (calendar-only mode)
- Physiological predictions are labeled "ESTIMATED" in the UI
- As sleep data accumulates, predictions auto-calibrate

### 5. Very Short Rotation Cycles (2-on, 2-off)

**Problem:** Some schedules have very rapid rotation (e.g., 2 night shifts, 2 off, 2 day shifts). These create constant small transitions.

**Handling:**
- Transitions < 4h phase shift required are classified as MINOR and grouped.
- Protocol for rapid rotation: do NOT attempt full circadian adaptation. Instead, use the Eastman compromise position (DLMO target ~03:00) and maintain it through the rotation.
- This aligns with the existing `computeNightShiftSleep()` strategy in `sleep-windows.ts`.

### 6. Extended Shifts (24h+)

**Problem:** 24-hour shifts (common in resident physicians, fire/EMS) create massive sleep debt in a single cycle.

**Handling:**
- Extended shifts get automatic HIGH stress classification regardless of other factors.
- Protocol emphasizes sleep banking (pre-shift 90-min nap), not circadian shifting.
- Post-shift recovery is extended (10h sleep window instead of 7.5h).
- Next-day performance prediction is automatically downgraded by the accumulated debt.

---

## Data Flow Diagram

```
User imports calendar
        |
        v
classifyDays() -----> [ClassifiedDay[]]
        |
        v
findTransitions() --> [DetectedTransition[]]
        |
        +--> scoreTransition() --> [TransitionStressScore[]]
        |         |
        |         v
        |    generateProtocol() --> [PreAdaptationProtocol[]]
        |         |
        |         v
        |    convertToBlocks() --> [PlanBlock[]]
        |         |
        |         +---> Merge with existing sleep/nap/light blocks
        |
        +--> propagateState() loop --> [CircadianState per day]
                  |
                  v
           predictFatigueWindow() --> [PredictedFatigueWindow[]]
                  |
                  v
           LookaheadResult --> UI / Notifications / Calendar Export
```

---

## Notification Triggers

| Trigger | Timing | Message Pattern |
|---------|--------|----------------|
| CRITICAL transition detected | On calendar import | "Your schedule has a critical transition on [date]. Start preparing [N] days before." |
| Protocol start reminder | Morning of protocol day 1 | "Tonight begins your transition prep. Stay up until [time]. Evening light therapy recommended." |
| Daily protocol step | Morning of each protocol day | "Day [X] of [N]: Shift bedtime to [time]. [Light/melatonin guidance]." |
| Transition day | Day of transition | "Your [night/day] stretch starts today. [Specific guidance for this shift type]." |
| Schedule change alert | On calendar update | "Your schedule changed. [New transition detected / Existing protocol adjusted]." |
| Debt warning | When predicted debt > 10h | "Your sleep debt is projected to reach [X]h by [date]. Consider [action]." |

---

## Sources

- Eastman & Burgess (2009). "Practical interventions to promote circadian adaptation." Journal of Biological Rhythms. [PMID: 19346453](https://pubmed.ncbi.nlm.nih.gov/19346453/)
- Burgess, Crowley, Gazda, Fogg & Eastman (2003). "Preflight adjustment to eastward travel." Journal of Biological Rhythms. [PMC1262683](https://pmc.ncbi.nlm.nih.gov/articles/PMC1262683/)
- Folkard & Tucker (2003). "Shift work, safety and productivity." Occupational Medicine. [PMID: 12637593](https://pubmed.ncbi.nlm.nih.gov/12637593/)
- Folkard & Lombardi (2006). "Modeling the impact of long work hours on injuries." Chronobiology International. [PMID: 16570251](https://pubmed.ncbi.nlm.nih.gov/16570251/)
- Belenky et al. (2003). "Sleep dose-response study." Journal of Sleep Research. PMID: 12603781.
- Van Dongen et al. (2003). "Cumulative cost of additional wakefulness." SLEEP.
- Akerstedt & Folkard (1997). "Three-process model of alertness." Chronobiology International. [PMID: 9095372](https://pubmed.ncbi.nlm.nih.gov/9095372/)
- Hursh et al. (2004). "SAFTE model for applied research." ASEM. [PMID: 15018265](https://pubmed.ncbi.nlm.nih.gov/15018265/)
