# Algorithm Improvement Specification

**Version:** 1.0  
**Priority:** Pre-Launch Critical (Modules 1-4) + Post-Launch Enhancement (Module 5)  
**Baseline:** Scientific Audit Report 2026-04-18 (Grade B+ → Target A-)  
**Existing Code:** `src/lib/circadian/` — 12 modules, 1,059 tests passing  

---

## Table of Contents

1. [DLMO Estimation Module](#1-dlmo-estimation-module)
2. [Compromise Phase Position Handler](#2-compromise-phase-position-handler)
3. [Substance Interaction Engine](#3-substance-interaction-engine)
4. [Fatigue Alerting System](#4-fatigue-alerting-system)
5. [Wearable Data Pipeline](#5-wearable-data-pipeline)
6. [Cross-Module Integration Map](#6-cross-module-integration-map)
7. [Implementation Timeline](#7-implementation-timeline)

---

## 1. DLMO Estimation Module

**Addresses:** Critical Gap #1 (no DLMO estimation — light protocol can backfire if timed wrong)  
**Science:** Burgess & Eastman 2005: DLMO ≈ sleep midpoint − 2h; Kantermann et al. 2015: MEQ → DLMO R²=0.68; Woelders et al. 2017: skin temperature nadir correlates with CBT nadir R²=0.961  
**File:** `src/lib/circadian/dlmo-estimator.ts`  
**Estimated Effort:** 24 hours  

### 1.1 Data Model

```typescript
// src/lib/circadian/dlmo-types.ts

/** Morningness-Eveningness Questionnaire (Horne & Östberg 1976) */
export interface MEQResult {
  score: number;           // 16-86 range
  chronotype: Chronotype;  // derived: ≤41 evening, 42-58 intermediate, ≥59 morning
  completedAt: string;     // ISO 8601
}

export type DLMOTier = 'questionnaire' | 'actigraphy' | 'temperature';

export interface DLMOEstimate {
  /** Estimated DLMO time as hours from midnight (e.g., 21.5 = 9:30 PM) */
  dlmoHour: number;
  
  /** Confidence interval in minutes — shrinks as tier improves */
  confidenceMinutes: number;
  
  /** Which estimation method produced this */
  tier: DLMOTier;
  
  /** When this estimate was computed */
  estimatedAt: string;
  
  /** Number of data days used (Tier 2+) */
  dataDays?: number;
  
  /** Raw inputs that fed the estimate */
  inputs: DLMOInputs;
}

export type DLMOInputs =
  | { tier: 'questionnaire'; meqScore: number }
  | { tier: 'actigraphy'; avgSleepMidpoint: number; avgHRVNadir: number; dataDays: number }
  | { tier: 'temperature'; skinTempNadirHour: number; dataDays: number };

/**
 * Derived circadian markers anchored to DLMO.
 * These drive every downstream timing decision.
 */
export interface CircadianMarkers {
  dlmo: DLMOEstimate;
  
  /** CBT minimum ≈ DLMO + 7h (Czeisler et al. 1999) */
  cbtMinHour: number;
  
  /** Optimal sleep onset ≈ DLMO + 2-3h (melatonin rise → sleep gate) */
  optimalSleepOnsetHour: number;
  
  /** Wake maintenance zone ≈ DLMO − 2h to DLMO (forbidden sleep zone) */
  wakeMaintZoneStart: number;
  wakeMaintZoneEnd: number;
  
  /** Phase advance light window: CBTmin to CBTmin + 4h */
  advanceLightWindowStart: number;
  advanceLightWindowEnd: number;
  
  /** Phase delay light window: DLMO − 4h to DLMO */
  delayLightWindowStart: number;
  delayLightWindowEnd: number;
}
```

### 1.2 Function Signatures

```typescript
// src/lib/circadian/dlmo-estimator.ts

import { MEQResult, DLMOEstimate, CircadianMarkers, DLMOTier } from './dlmo-types';
import { UserProfile } from './types';

/**
 * Tier 1: MEQ chronotype → DLMO estimate (±90 min).
 * Uses Kantermann regression: DLMO_h = 0.127 × MEQ + 13.6 (inverted: higher MEQ = earlier DLMO)
 * Available from Day 1 — requires only the onboarding questionnaire.
 */
export function estimateDLMOFromMEQ(meq: MEQResult): DLMOEstimate;

/**
 * Tier 2: Actigraphy + HRV refinement (±60 min).
 * Requires ≥7 days of sleep midpoint data + HRV nadir times.
 * DLMO ≈ avgSleepMidpoint − 2h, cross-validated with HRV parasympathetic peak.
 * Falls back to Tier 1 if <7 days available.
 */
export function estimateDLMOFromActigraphy(
  sleepSessions: SleepSession[],  // from wearable pipeline (Module 5)
  hrvData: HRVReading[],
  fallbackMEQ: MEQResult
): DLMOEstimate;

/**
 * Tier 3 (future): Skin temperature nadir → DLMO.
 * Woelders 2017: distal skin temp nadir tracks CBT nadir (R²=0.961).
 * CBT nadir ≈ DLMO + 7h, so DLMO ≈ skinTempNadir − 7h.
 * Requires continuous wrist temperature (WHOOP 5.0 skin temp sensor).
 */
export function estimateDLMOFromTemperature(
  skinTempReadings: SkinTempReading[],
  fallbackActigraphy: DLMOEstimate
): DLMOEstimate;

/**
 * Master function: picks the best available tier and returns markers.
 * Called by sleep-windows.ts, light-protocol.ts, nap-engine.ts before
 * generating any timed intervention.
 */
export function resolveCircadianMarkers(
  profile: UserProfile,
  meq: MEQResult,
  sleepSessions?: SleepSession[],
  hrvData?: HRVReading[],
  skinTempReadings?: SkinTempReading[]
): CircadianMarkers;

/**
 * Track DLMO drift over consecutive night shifts.
 * Eastman & Burgess: ~1-1.5h delay per night shift day with bright light protocol.
 * Returns adjusted DLMO accounting for consecutive night exposure.
 */
export function adjustDLMOForNightBlock(
  baseDLMO: DLMOEstimate,
  consecutiveNights: number,
  brightLightCompliance: number  // 0-1, from user check-in or wearable lux data
): DLMOEstimate;
```

### 1.3 Integration Points

| Downstream Module | Current Behavior | With DLMO |
|---|---|---|
| `light-protocol.ts` → `generateLightProtocol()` | Generic timing by day type | Gate all light blocks to DLMO-derived advance/delay windows |
| `sleep-windows.ts` → `computeSleepBlocks()` | Chronotype offset table (fixed) | Replace with `optimalSleepOnsetHour` from `CircadianMarkers` |
| `nap-engine.ts` → `generateNaps()` | Static timing by day type | Avoid naps in wake maintenance zone (DLMO −2h to DLMO) |
| `energy-model.ts` → `circadianSignal()` | Static acrophase (16:00 day / wake+8h night) | Derive acrophase from DLMO + 19h (Duffy & Czeisler 2009) |
| `prediction-engine.ts` → `buildPreAdaptationProtocol()` | Fixed 90 min/day shift rate | Personalize shift rate to distance between current DLMO and target DLMO |
| `caffeine.ts` → cutoff calculation | Relative to first sleep block | Also warn if caffeine within 5h of DLMO (melatonin suppression) |

### 1.4 Test Scenarios

```typescript
describe('DLMO Estimator', () => {
  // Tier 1
  it('MEQ 70 (morning type) → DLMO ~20:30, confidence ±90 min', () => {});
  it('MEQ 35 (evening type) → DLMO ~23:30, confidence ±90 min', () => {});
  it('MEQ 50 (intermediate) → DLMO ~21:45, confidence ±90 min', () => {});
  
  // Tier 2
  it('7 days sleep midpoint 03:00 → DLMO ~01:00, confidence ±60 min', () => {});
  it('<7 days data falls back to Tier 1', () => {});
  it('HRV nadir at 04:00 cross-validates sleep midpoint estimate', () => {});
  it('HRV nadir >2h divergent from sleep midpoint → flag, widen confidence to ±75 min', () => {});
  
  // Night block drift
  it('3 consecutive nights + bright light → DLMO delays ~3-4.5h', () => {});
  it('0% light compliance → DLMO delays only ~0.5h/night (natural drift)', () => {});
  
  // Circadian markers derivation
  it('DLMO 21:00 → CBTmin 04:00, sleep onset 23:00-00:00, WMZ 19:00-21:00', () => {});
  it('DLMO 02:00 (night worker) → advance light window 09:00-13:00', () => {});
  
  // Edge cases
  it('DLMO wraps past midnight correctly (e.g., 01:30 = 25.5h)', () => {});
  it('resolveCircadianMarkers prefers highest available tier', () => {});
});
```

---

## 2. Compromise Phase Position Handler

**Addresses:** Critical Gap #10 (rapid rotation whiplash), Moderate Gap #8 (day-to-night window too short), Moderate Gap #9 (night-to-day advance rate too aggressive)  
**Science:** Eastman & Burgess 2009 (compromise phase for rotating workers), Smith et al. 2009 (DLMO 3:00-4:00 AM target), NIOSH anchor sleep protocol  
**File:** `src/lib/circadian/compromise-phase.ts`  
**Estimated Effort:** 32 hours  

### 2.1 Data Model

```typescript
// src/lib/circadian/compromise-phase-types.ts

export type RotationPattern =
  | 'rapid'          // ≤2 consecutive same-shift days (2-on-2-off, DuPont)
  | 'slow'           // ≥3 consecutive same-shift days (Pitman, 4-on-4-off)
  | 'permanent'      // same shift type for ≥14 days
  | 'irregular';     // no detectable pattern

export type PhaseStrategy =
  | 'compromise'     // maintain DLMO 3:30-4:30 AM, never fully re-entrain
  | 'full-delay'     // delay DLMO to target (night blocks ≥3 days)
  | 'full-advance'   // advance DLMO back to day position
  | 'maintenance';   // hold current position (mid-block off days)

export interface RotationAnalysis {
  pattern: RotationPattern;
  avgBlockLength: number;
  maxBlockLength: number;
  transitionsPerMonth: number;
  
  /** Recommended phase strategy for this rotation */
  recommendedStrategy: PhaseStrategy;
  
  /** Why this strategy was chosen — surfaced to user */
  rationale: string;
}

export interface CompromiseProtocol {
  /** Target DLMO for compromise position (typically 3:30-4:30 AM) */
  targetDLMOHour: number;
  
  /** Current estimated DLMO */
  currentDLMOHour: number;
  
  /** Direction of needed shift */
  direction: 'advance' | 'delay' | 'hold';
  
  /** Daily steps to reach/maintain compromise */
  dailySteps: CompromiseStep[];
}

export interface CompromiseStep {
  date: string;
  
  /** Bright light pulses during night shift (Eastman protocol) */
  lightPulses?: LightPulse[];
  
  /** Blue-blocking glasses window */
  blueBlockWindow?: TimeWindow;
  
  /** Dark sleep period */
  darkSleepWindow: TimeWindow;
  
  /** Afternoon light brake (prevents over-delay) */
  afternoonLightBrake?: TimeWindow;
  
  /** Target bedtime offset from current position */
  bedtimeShiftMinutes: number;
  
  /** Expected DLMO at end of this day */
  projectedDLMOHour: number;
}

export interface LightPulse {
  startTime: string;  // ISO 8601
  durationMinutes: number;  // 15 min per Eastman protocol
  intensity: 'bright' | 'moderate';  // >2500 lux or 1000-2500 lux
}

export interface TimeWindow {
  start: string;
  end: string;
}
```

### 2.2 Function Signatures

```typescript
// src/lib/circadian/compromise-phase.ts

import { ClassifiedDay } from './types';
import { DLMOEstimate, CircadianMarkers } from './dlmo-types';
import { RotationAnalysis, CompromiseProtocol, PhaseStrategy } from './compromise-phase-types';

/**
 * Analyze 30-60 days of classified shifts to detect rotation pattern.
 * Uses run-length encoding on shift types to find repeating blocks.
 */
export function analyzeRotation(
  classifiedDays: ClassifiedDay[],
  lookbackDays?: number  // default 60
): RotationAnalysis;

/**
 * Decision logic: compromise vs full re-entrainment.
 * 
 * Rules:
 * - rapid pattern (≤2 same days) → ALWAYS compromise
 * - slow pattern (3+ same days) → full re-entrainment with bounded rate
 * - irregular pattern → compromise if avg block ≤3 days, else per-block decision
 * - permanent → full adaptation (standard protocol)
 * 
 * Override: user can force compromise for any pattern ("I'm always switching")
 */
export function selectPhaseStrategy(
  rotation: RotationAnalysis,
  currentDLMO: DLMOEstimate,
  userPreference?: PhaseStrategy  // manual override
): PhaseStrategy;

/**
 * Generate the Eastman compromise protocol for a given block of days.
 * 
 * Night shift protocol:
 *   1. 5 × 15-min bright light pulses during first half of shift
 *   2. Blue-blocking glasses from end of shift through commute
 *   3. Dark, cool bedroom for anchor sleep (08:00-15:30 typical)
 *   4. Afternoon light brake: 30 min outdoor light at 16:00-17:00
 *      (prevents DLMO from over-delaying past 4:30 AM target)
 * 
 * Day shift protocol (maintaining compromise, not snapping back):
 *   1. Avoid bright morning light before 09:00 (sunglasses)
 *   2. Sleep anchor: 00:00-07:30 (later than natural, preserving delay)
 *   3. Evening light: 30 min bright light at 20:00-21:00
 */
export function buildCompromiseProtocol(
  days: ClassifiedDay[],
  currentMarkers: CircadianMarkers,
  targetDLMOHour: number  // default 4.0 (4:00 AM)
): CompromiseProtocol;

/**
 * Generate full re-entrainment protocol for slow rotations (≥3 days).
 * Replaces current buildPreAdaptationProtocol with bounded rates:
 *   - Delay: max 2h/day (well-supported for delay direction)
 *   - Advance: max 1.5h/day (Eastman limit, audit gap #9 fix)
 *   - Total pre-adaptation: extend to 5 days for day→night (audit gap #8 fix)
 */
export function buildReEntrainmentProtocol(
  days: ClassifiedDay[],
  currentMarkers: CircadianMarkers,
  targetMarkers: CircadianMarkers
): CompromiseProtocol;

/**
 * Rapid rotation detector — plugs into classify-shifts.ts.
 * Returns true if pattern is 2-on-2-off, DuPont, or any ≤2-day blocks.
 * When true, prediction-engine should NOT generate re-entrainment predictions.
 */
export function isRapidRotation(classifiedDays: ClassifiedDay[]): boolean;
```

### 2.3 Integration Points

| Downstream Module | Change Required |
|---|---|
| `classify-shifts.ts` → `detectPatterns()` | Add `rotationPattern: RotationPattern` to output; call `analyzeRotation()` |
| `prediction-engine.ts` → `scanUpcomingTransitions()` | If `isRapidRotation()`, suppress transition predictions; generate maintenance alerts instead |
| `prediction-engine.ts` → `buildPreAdaptationProtocol()` | Replace with `buildReEntrainmentProtocol()` for slow rotations, `buildCompromiseProtocol()` for rapid |
| `sleep-windows.ts` → `computeSleepBlocks()` | For compromise strategy: use compromise anchor sleep times, not natural circadian position |
| `light-protocol.ts` → `generateLightProtocol()` | For compromise: inject 5×15-min pulse schedule + afternoon brake |
| `energy-model.ts` → acrophase | For compromise workers: fix acrophase at compromise position (not oscillating) |

### 2.4 Test Scenarios

```typescript
describe('Compromise Phase Position', () => {
  // Pattern detection
  it('2-on-2-off detected as rapid rotation', () => {});
  it('4-on-3-off detected as slow rotation', () => {});
  it('DuPont (2-2-3) detected as rapid rotation', () => {});
  it('14+ consecutive nights detected as permanent', () => {});
  it('mixed random shifts detected as irregular', () => {});
  
  // Strategy selection
  it('rapid rotation → always compromise, never re-entrainment', () => {});
  it('slow rotation (4-on-4-off) → full re-entrainment', () => {});
  it('irregular with avg block 2.5 → compromise', () => {});
  it('user override to compromise respected for slow rotation', () => {});
  
  // Compromise protocol
  it('generates 5 light pulses × 15 min during night shift first half', () => {});
  it('blue-blocking window covers shift end through sleep onset', () => {});
  it('afternoon light brake prevents DLMO over-delay past 4:30 AM', () => {});
  it('day shift protocol preserves compromise (no morning light, late sleep)', () => {});
  it('target DLMO converges to 3:30-4:30 AM within 3 days', () => {});
  
  // Re-entrainment bounds
  it('advance rate capped at 1.5h/day (not 2h)', () => {});
  it('delay rate capped at 2h/day', () => {});
  it('day-to-night pre-adaptation window extended to 5 days', () => {});
  it('10h phase shift requires 5 days advance (not 3)', () => {});
  
  // Edge cases
  it('off day between night blocks → maintenance, not re-entrain', () => {});
  it('single night shift sandwiched between days → compromise nap strategy, no shift', () => {});
});
```

---

## 3. Substance Interaction Engine

**Addresses:** Critical Gap #4 (no substance interaction flags — alcohol, melatonin, OTC sleep aids invalidate recovery scoring)  
**Science:** Burke et al. 2015 (caffeine phase delay ~40 min); Lewy et al. 2006 (melatonin PRC); Ebrahim et al. 2013 (alcohol + sleep architecture); Rae et al. 2023 (modafinil pharmacokinetics)  
**File:** `src/lib/circadian/substance-engine.ts`  
**Estimated Effort:** 28 hours  

### 3.1 Data Model

```typescript
// src/lib/circadian/substance-types.ts

export type SubstanceCategory =
  | 'caffeine'
  | 'melatonin'
  | 'alcohol'
  | 'antihistamine'
  | 'modafinil'
  | 'other';

export interface SubstanceEntry {
  id: string;
  category: SubstanceCategory;
  timestamp: string;         // ISO 8601 — when consumed
  
  /** Category-specific payload */
  details: SubstanceDetails;
}

export type SubstanceDetails =
  | CaffeineDetails
  | MelatoninDetails
  | AlcoholDetails
  | AntihistamineDetails
  | ModafinilDetails
  | OtherSubstanceDetails;

export interface CaffeineDetails {
  category: 'caffeine';
  doseMg: number;            // standard: coffee 95mg, espresso 63mg, energy drink 80-300mg
  source: string;            // 'coffee' | 'espresso' | 'tea' | 'energy_drink' | 'supplement'
}

export interface MelatoninDetails {
  category: 'melatonin';
  doseMg: number;            // recommendation: 0.5mg fast-release
  formulation: 'fast-release' | 'extended-release';
  /** Hours before target sleep onset */
  hoursBeforeSleep: number;
}

export interface AlcoholDetails {
  category: 'alcohol';
  standardDrinks: number;    // 14g ethanol per standard drink
  /** Hours before target sleep onset */
  hoursBeforeSleep: number;
}

export interface AntihistamineDetails {
  category: 'antihistamine';
  compound: 'diphenhydramine' | 'doxylamine' | 'hydroxyzine' | 'other';
  doseMg: number;
  /** Consecutive nights of use */
  consecutiveNights: number;
}

export interface ModafinilDetails {
  category: 'modafinil';
  doseMg: number;            // standard 100-200mg
}

export interface OtherSubstanceDetails {
  category: 'other';
  name: string;
  notes: string;
}

/** Interaction rules output */
export interface SubstanceAlert {
  severity: 'info' | 'warning' | 'critical';
  category: SubstanceCategory;
  title: string;
  message: string;
  
  /** What the engine recommends */
  recommendation: string;
  
  /** Which scoring modules are affected */
  affectedModules: AffectedModule[];
}

export type AffectedModule =
  | { module: 'recovery'; action: 'suppress-confidence'; reason: string }
  | { module: 'sleep-staging'; action: 'flag-unreliable'; duration48h: boolean }
  | { module: 'energy-model'; action: 'adjust-caffeine-curve'; params: Record<string, number> }
  | { module: 'light-protocol'; action: 'shift-melatonin-window'; offsetMinutes: number }
  | { module: 'fatigue-model'; action: 'elevate-risk'; levels: number };

/** Rolling substance state for a user */
export interface SubstanceState {
  /** Active caffeine in system (mg, after decay) */
  activeCaffeineMg: number;
  
  /** Hours until caffeine drops below 25mg (sleep-safe threshold) */
  caffeineClearanceHours: number;
  
  /** Personalized caffeine cutoff for today's first sleep block */
  caffeineCutoffTime: string;
  
  /** Alcohol consumed in last 48h — flags HRV distortion */
  alcoholLast48h: number;  // standard drinks
  
  /** Consecutive antihistamine nights — tolerance flag at 3-5 */
  antihistamineStreak: number;
  
  /** Active alerts */
  alerts: SubstanceAlert[];
}
```

### 3.2 Function Signatures

```typescript
// src/lib/circadian/substance-engine.ts

import { SubstanceEntry, SubstanceAlert, SubstanceState } from './substance-types';
import { DLMOEstimate } from './dlmo-types';
import { UserProfile, PlanBlock } from './types';

/**
 * Process a new substance entry and return immediate alerts.
 * Called when user logs a substance via daily check-in or manual entry.
 */
export function processSubstanceEntry(
  entry: SubstanceEntry,
  currentState: SubstanceState,
  dlmo: DLMOEstimate,
  profile: UserProfile,
  todaysSleepBlocks: PlanBlock[]
): SubstanceAlert[];

/**
 * Caffeine phase delay model (Burke et al. 2015).
 * Evening caffeine (400mg, 3h before sleep) delays DLMO by ~40 min.
 * Scales linearly with dose relative to 400mg reference.
 * Returns projected DLMO shift in minutes.
 */
export function estimateCaffeinePhaseDelay(
  doseMg: number,
  hoursBeforeDLMO: number,
  currentDLMO: DLMOEstimate
): number;  // minutes of DLMO delay

/**
 * Personalized caffeine cutoff calculator (replaces simple half-life model).
 * Cutoff = earliest time such that caffeine < 25mg at target sleep onset.
 * Enhanced: also checks that no caffeine within 5h of DLMO (melatonin suppression).
 * 
 * Uses: profile.caffeineHalfLife (3-7h, CYP1A2 dependent)
 * Slow metabolizer (8-10h half-life): cutoff is 8.8-13.2h before target sleep.
 */
export function computePersonalizedCaffeineCutoff(
  profile: UserProfile,
  targetSleepOnset: Date,
  dlmo: DLMOEstimate,
  plannedDoses: CaffeineDetails[]
): { cutoffTime: Date; rationale: string };

/**
 * Melatonin timing optimizer.
 * Melatonin PRC (Lewy et al. 2006): 
 *   - Before DLMO → phase advance (max at DLMO −5h)
 *   - After DLMO → phase delay (max at DLMO +8h, near CBTmin)
 * Dose recommendation: 0.5mg fast-release (saturates MT1/MT2 receptors).
 * Higher doses don't improve efficacy, increase grogginess.
 */
export function optimizeMelatoninTiming(
  dlmo: DLMOEstimate,
  targetShiftDirection: 'advance' | 'delay' | 'sleep-aid-only',
  currentDoseMg?: number
): { 
  optimalTime: Date; 
  recommendedDoseMg: number; 
  formulation: 'fast-release' | 'extended-release';
  expectedPhaseShiftMinutes: number;
  warnings: string[];
};

/**
 * Alcohol impact assessment.
 * Ebrahim et al. 2013: alcohol disrupts REM in second half of night.
 * >2 standard drinks within 4h of sleep: 
 *   - Suppress recovery score confidence
 *   - Flag HRV data as unreliable for 48h
 *   - Elevate next-day fatigue risk by 1 tier
 */
export function assessAlcoholImpact(
  entry: AlcoholDetails,
  nextSleepOnset: Date,
  existingAlcoholLast48h: number
): SubstanceAlert[];

/**
 * Antihistamine tolerance tracker.
 * Diphenhydramine/doxylamine: REM suppression, tolerance at 3-5 consecutive nights.
 * Flags: 
 *   - Night 1-2: "REM suppression likely, sleep staging unreliable"
 *   - Night 3-5: "Tolerance developing, reduced efficacy expected"  
 *   - Night 5+: "Recommend discussing with physician, rebound insomnia risk"
 */
export function assessAntihistamineUse(
  entry: AntihistamineDetails,
  currentStreak: number
): SubstanceAlert[];

/**
 * Modafinil interaction check.
 * No direct sleep quality impact (distinct from amphetamines).
 * Duration shortening ~30% — warn if sleep block < 5h after modafinil.
 * Half-life: 12-15h. Safe for shift work when timed correctly.
 */
export function assessModafinilUse(
  entry: ModafinilDetails,
  nextSleepOnset: Date
): SubstanceAlert[];

/**
 * Compute full substance state snapshot for dashboard display.
 * Called on app open and after each substance log.
 */
export function computeSubstanceState(
  entries: SubstanceEntry[],  // last 72h
  profile: UserProfile,
  dlmo: DLMOEstimate,
  todaysSleepBlocks: PlanBlock[]
): SubstanceState;
```

### 3.3 Integration Points

| Downstream Module | Integration |
|---|---|
| `energy-model.ts` → `caffeineEffect()` | Replace with `substance-engine` caffeine curve; add phase delay impact to circadian signal |
| `caffeine.ts` → `computeCutoffHours()` | Wrap with `computePersonalizedCaffeineCutoff()` — adds DLMO-relative melatonin suppression check |
| `fatigue-model.ts` → risk classification | If `alcoholLast48h > 2`, elevate risk by 1 tier; add "alcohol-impaired" flag to `FatigueState` |
| `sleep-windows.ts` | On alcohol nights: extend wind-down by 30 min, flag recovery score as unreliable |
| `light-protocol.ts` | If melatonin logged: adjust light-avoid window to align with melatonin PRC timing |
| Recovery score (future) | Suppress confidence when `affectedModules` includes `recovery` → show "~" prefix on score |
| Wearable pipeline (Module 5) | If `alcoholLast48h > 0`: flag HRV readings, downweight sleep staging confidence |

### 3.4 Test Scenarios

```typescript
describe('Substance Interaction Engine', () => {
  // Caffeine
  it('200mg coffee at 14:00, sleep at 23:00, half-life 5h → caffeine ~35mg at sleep → warning', () => {});
  it('200mg coffee at 08:00, sleep at 23:00, half-life 5h → caffeine ~6mg → safe', () => {});
  it('caffeine within 5h of DLMO (21:00) → melatonin suppression warning', () => {});
  it('slow metabolizer (8h half-life) → cutoff 13.2h before sleep', () => {});
  it('Burke phase delay: 400mg at DLMO-3h → ~40 min DLMO delay', () => {});
  it('Burke phase delay: 200mg → ~20 min (linear scaling)', () => {});
  
  // Melatonin
  it('advance goal + DLMO 22:00 → optimal melatonin at 17:00 (DLMO-5h)', () => {});
  it('sleep-aid-only → 30 min before target bedtime, 0.5mg fast-release', () => {});
  it('dose >1mg → warning: no added benefit, increased grogginess', () => {});
  it('extended-release for sleep maintenance, fast-release for phase shifting', () => {});
  
  // Alcohol
  it('3 drinks 2h before sleep → critical alert, suppress recovery confidence', () => {});
  it('1 drink 4h+ before sleep → info only, no scoring suppression', () => {});
  it('any alcohol → 48h HRV distortion flag', () => {});
  it('alcohol + night shift next day → elevate fatigue risk 1 tier', () => {});
  
  // Antihistamines
  it('night 1 diphenhydramine → REM suppression warning', () => {});
  it('night 3 → tolerance developing warning', () => {});
  it('night 5+ → recommend physician discussion, rebound risk', () => {});
  it('streak resets after 48h without use', () => {});
  
  // Modafinil
  it('200mg at 22:00, sleep at 08:00 (10h later) → safe, duration shortening note', () => {});
  it('200mg at 04:00, sleep at 08:00 (4h later) → warning: may shorten sleep', () => {});
  
  // Composite state
  it('computeSubstanceState aggregates all entries from last 72h', () => {});
  it('stale entries (>72h) excluded from state', () => {});
  it('multiple caffeine doses accumulate correctly', () => {});
});
```

---

## 4. Fatigue Alerting System

**Addresses:** Critical Gap #3 (no active fatigue alerting — app silently fails when energy < 30 during shift), Critical Gap #2 (no subjective override)  
**Science:** Borbely 1982 (Process S + C), Kaida et al. 2006 (KSS validated against EEG), Basner & Dinges 2011 (PVT-B 3-min mobile version), Dawson & Reid 1997 (>17h awake ≈ BAC 0.05)  
**File:** `src/lib/circadian/fatigue-alerting.ts`  
**Estimated Effort:** 20 hours  

### 4.1 Data Model

```typescript
// src/lib/circadian/fatigue-alert-types.ts

export type AlertLevel = 'green' | 'yellow' | 'red' | 'critical';

export type AlertTrigger =
  | 'energy-model'       // Process S + C prediction drops below threshold
  | 'kss-checkin'        // Karolinska Sleepiness Scale self-report
  | 'pvt-lapse'          // PVT-B reaction time lapse detected
  | 'time-awake'         // >16h continuous wakefulness
  | 'substance-flag'     // substance engine elevated risk
  | 'cumulative-debt';   // fatigue-model.ts critical debt

export interface FatigueAlert {
  id: string;
  level: AlertLevel;
  trigger: AlertTrigger;
  timestamp: string;
  
  /** Human-readable alert */
  title: string;
  message: string;
  
  /** Actionable steps */
  actions: FatigueAction[];
  
  /** Should this trigger a push notification? */
  pushNotification: boolean;
  
  /** Time-to-live: auto-dismiss after this period (minutes) */
  ttlMinutes: number;
  
  /** If triggered by KSS/PVT, include the measurement */
  measurement?: KSSResult | PVTResult;
}

export interface FatigueAction {
  type: 'take-nap' | 'caffeine-ok' | 'call-someone' | 'pull-over' | 'delegate-tasks' | 'extend-sleep';
  label: string;
  detail: string;
}

/**
 * Karolinska Sleepiness Scale (KSS) — 10-second self-report.
 * Validated against EEG alpha/theta activity (Kaida et al. 2006).
 * Scale: 1 (extremely alert) to 9 (extremely sleepy, fighting sleep).
 */
export interface KSSResult {
  score: number;       // 1-9
  timestamp: string;
  context: 'pre-shift' | 'mid-shift' | 'post-shift' | 'driving' | 'on-demand';
}

/**
 * Psychomotor Vigilance Task — Brief (PVT-B).
 * 3-minute mobile version (Basner & Dinges 2011).
 * Lapse = reaction time > 355ms.
 * Mean RT and lapse count correlate with sleep deprivation severity.
 */
export interface PVTResult {
  meanReactionTimeMs: number;
  lapseCount: number;          // RT > 355ms
  falseStarts: number;         // RT < 100ms (anticipatory)
  testDurationSeconds: number; // should be ~180s
  timestamp: string;
}

/** Configuration for alert thresholds — user-tunable */
export interface FatigueAlertConfig {
  /** Energy model threshold for yellow alert (default 50) */
  energyYellowThreshold: number;
  /** Energy model threshold for red alert (default 30) */
  energyRedThreshold: number;
  /** Hours awake before time-based alert (default 16) */
  timeAwakeAlertHours: number;
  /** Enable PVT-B prompts (optional, off by default) */
  pvtEnabled: boolean;
  /** KSS check-in frequency during shifts (minutes, default 120) */
  kssIntervalMinutes: number;
  /** Quiet hours — suppress non-critical notifications */
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

/** Real-time fatigue snapshot — feeds dashboard widget */
export interface FatigueSnapshot {
  currentLevel: AlertLevel;
  hoursAwake: number;
  currentEnergyScore: number;
  lastKSS?: KSSResult;
  lastPVT?: PVTResult;
  activeAlerts: FatigueAlert[];
  nextScheduledCheckin: string;  // ISO 8601
  
  /** Modified Borbely real-time estimate */
  processS: number;  // 0-1, current sleep pressure
  processC: number;  // 0-1, current circadian drive
  combinedFatigue: number;  // 0-100
}
```

### 4.2 Function Signatures

```typescript
// src/lib/circadian/fatigue-alerting.ts

import { FatigueAlert, FatigueSnapshot, KSSResult, PVTResult, FatigueAlertConfig } from './fatigue-alert-types';
import { EnergyPrediction } from './energy-types';
import { SubstanceState } from './substance-types';
import { FatigueState } from './fatigue-model'; // existing
import { UserProfile, PlanBlock } from './types';

/**
 * Core evaluation: compute real-time fatigue snapshot.
 * Called every 15 minutes during active hours (timer-driven).
 * Combines:
 *   - Modified Borbely (Process S from hours awake, Process C from DLMO-derived circadian)
 *   - Latest energy model prediction
 *   - Most recent KSS if available
 *   - Cumulative debt from fatigue-model.ts
 *   - Substance state modifiers
 */
export function evaluateFatigue(
  wakeTime: Date,
  now: Date,
  energyPrediction: EnergyPrediction,
  cumulativeFatigue: FatigueState,
  substanceState: SubstanceState,
  config: FatigueAlertConfig,
  recentKSS?: KSSResult,
  recentPVT?: PVTResult
): FatigueSnapshot;

/**
 * Process a KSS check-in response.
 * Triggered by scheduled notification every kssIntervalMinutes during shift.
 * 10-second interaction: "How sleepy are you right now?" → 1-9 scale.
 * 
 * Alert mapping:
 *   1-5: Green (no alert)
 *   6-7: Yellow ("Consider a 20-min nap or caffeine boost")
 *   8-9: Red ("High drowsiness — take a break, avoid driving")
 */
export function processKSSCheckin(
  result: KSSResult,
  currentSnapshot: FatigueSnapshot
): FatigueAlert | null;

/**
 * Process a PVT-B test result.
 * Optional feature — user can trigger from dashboard or prompted at shift start.
 * 
 * Alert mapping (Basner & Dinges 2011):
 *   0 lapses, mean RT <300ms: Green
 *   1-2 lapses OR mean RT 300-355ms: Yellow
 *   3+ lapses OR mean RT >355ms: Red
 *   5+ lapses: Critical ("Impairment equivalent to BAC >0.05")
 */
export function processPVTResult(
  result: PVTResult,
  currentSnapshot: FatigueSnapshot
): FatigueAlert;

/**
 * Time-awake monitor.
 * Called by evaluateFatigue; extracted for testability.
 * 
 * Thresholds (Dawson & Reid 1997):
 *   >16h: Yellow ("Extended wakefulness — plan for sleep soon")
 *   >17h: Red ("Cognitive impairment equivalent to BAC 0.05")
 *   >20h: Critical ("Severe impairment — BAC 0.08 equivalent, do not drive")
 */
export function checkTimeAwake(
  hoursAwake: number
): FatigueAlert | null;

/**
 * Generate push notification payload from a FatigueAlert.
 * Respects quiet hours and notification frequency caps.
 * Max 1 push per 30 minutes unless critical.
 */
export function buildNotificationPayload(
  alert: FatigueAlert,
  config: FatigueAlertConfig,
  lastNotificationTime?: Date
): PushNotification | null;

export interface PushNotification {
  title: string;
  body: string;
  category: 'fatigue-alert';
  data: {
    alertId: string;
    level: AlertLevel;
    actions: string[];  // deep link action identifiers
  };
  /** 
   * Expo push notification channel.
   * Maps to existing notification infrastructure.
   */
  channelId: 'fatigue-critical' | 'fatigue-warning' | 'fatigue-info';
}

/**
 * Schedule KSS check-ins for a shift block.
 * Returns notification times based on config.kssIntervalMinutes.
 * First check-in: 2h into shift. Last: 1h before shift end.
 */
export function scheduleKSSCheckins(
  shiftBlock: PlanBlock,
  config: FatigueAlertConfig
): Date[];
```

### 4.3 Integration Points

| Downstream Module | Integration |
|---|---|
| `energy-model.ts` → `predictEnergy()` | Feed hourly predictions to `evaluateFatigue()` for real-time Process S/C comparison |
| `fatigue-model.ts` → `modelCumulativeFatigue()` | `FatigueState.riskLevel` feeds `evaluateFatigue()` as cumulative modifier |
| `substance-engine.ts` → `SubstanceState` | Alcohol/antihistamine flags elevate baseline fatigue tier |
| Expo Notifications (`expo-notifications`) | `buildNotificationPayload()` → existing push notification system |
| App state / background timer | 15-minute `evaluateFatigue()` cycle via Expo BackgroundFetch or TaskManager |
| Dashboard UI | `FatigueSnapshot` drives real-time fatigue widget (green/yellow/red/critical gauge) |
| Sleep plan generation | If `critical` alert during shift, inject emergency nap block into today's plan |

### 4.4 Test Scenarios

```typescript
describe('Fatigue Alerting System', () => {
  // Energy-based alerts
  it('energy score 65 → green, no alert', () => {});
  it('energy score 45 → yellow alert with nap recommendation', () => {});
  it('energy score 25 → red alert with "avoid driving" warning', () => {});
  it('energy score 15 → critical alert with push notification', () => {});
  
  // KSS check-ins
  it('KSS 5 → green, no alert', () => {});
  it('KSS 7 → yellow: "Consider a 20-min nap"', () => {});
  it('KSS 9 → red: "High drowsiness, take a break"', () => {});
  it('KSS scheduled every 2h during shift, first at shift+2h', () => {});
  
  // PVT-B
  it('0 lapses, mean RT 280ms → green', () => {});
  it('2 lapses, mean RT 340ms → yellow', () => {});
  it('5 lapses → critical: "BAC >0.05 equivalent"', () => {});
  it('false starts >3 → flag: "Anticipatory responses, retest"', () => {});
  
  // Time awake
  it('14h awake → no alert', () => {});
  it('16.5h awake → yellow alert', () => {});
  it('18h awake → red: "BAC 0.05 equivalent"', () => {});
  it('21h awake → critical with push notification', () => {});
  
  // Composite evaluation
  it('energy green + KSS 8 → escalate to red (subjective override)', () => {});
  it('energy red + KSS 3 → maintain red (objective wins when worse)', () => {});
  it('critical alcohol flag + moderate energy → elevate to red', () => {});
  
  // Notification throttling
  it('max 1 push per 30 min for non-critical', () => {});
  it('critical alerts bypass 30-min throttle', () => {});
  it('quiet hours suppress yellow/green notifications', () => {});
  it('quiet hours do NOT suppress red/critical', () => {});
  
  // Background scheduling
  it('evaluateFatigue runs every 15 min during active hours', () => {});
  it('does not run during sleep blocks', () => {});
});
```

---

## 5. Wearable Data Pipeline

**Addresses:** Enables Tier 2 DLMO estimation (Module 1), HRV distortion flagging (Module 3), real sleep data for fatigue model  
**Science:** Chinoy et al. 2021 (Apple Watch 38% REM misclassification), WHOOP validation studies  
**File:** `src/lib/wearable/` (new directory)  
**Estimated Effort:** 36 hours  

### 5.1 Data Model

```typescript
// src/lib/wearable/wearable-types.ts

export type WearableSource = 'whoop' | 'apple-watch' | 'manual';

/**
 * Unified sleep session — normalized regardless of source.
 * This is the single interface all algorithm modules consume.
 */
export interface SleepSession {
  id: string;
  source: WearableSource;
  
  /** Sleep onset (actual, not bedtime) */
  sleepOnset: string;
  /** Wake time */
  wakeTime: string;
  /** Total sleep time in minutes (excluding wake-after-sleep-onset) */
  tstMinutes: number;
  /** Sleep efficiency: TST / time in bed */
  efficiency: number;
  
  /** Sleep stages — null if source doesn't provide or confidence too low */
  stages: SleepStages | null;
  
  /** HRV data — null if unavailable */
  hrv: HRVSummary | null;
  
  /** Skin temperature — WHOOP 5.0 only */
  skinTemp?: SkinTempSummary;
  
  /** Confidence scores for each metric */
  confidence: DataConfidence;
  
  /** Raw source data hash — for dedup */
  sourceHash: string;
}

export interface SleepStages {
  /** Minutes in each stage */
  awakeMinutes: number;
  lightMinutes: number;
  deepMinutes: number;   // N3 / SWS
  remMinutes: number;
  
  /** Stage percentages (of TST, not TIB) */
  deepPercent: number;
  remPercent: number;
}

export interface HRVSummary {
  /** Average RMSSD during sleep (ms) */
  avgRmssd: number;
  /** HRV nadir time — lowest point, correlates with CBT minimum */
  nadirTime: string;
  /** Resting heart rate */
  restingHR: number;
}

export interface HRVReading {
  timestamp: string;
  rmssd: number;
  heartRate: number;
}

export interface SkinTempSummary {
  /** Average skin temp deviation from baseline (°C) */
  avgDeviation: number;
  /** Nadir time — correlates with CBT minimum (R²=0.961) */
  nadirTime: string;
  /** Nadir temperature (°C) */
  nadirTemp: number;
}

export interface SkinTempReading {
  timestamp: string;
  tempCelsius: number;
}

/**
 * Per-metric confidence (0-1).
 * Used to weight data in algorithm decisions.
 */
export interface DataConfidence {
  tst: number;            // both sources good: 0.85-0.95
  sleepStaging: number;   // WHOOP: 0.80, Apple Watch: 0.55 (38% REM misclass)
  hrv: number;            // both good when worn: 0.85
  skinTemp: number;       // WHOOP only: 0.90, Apple Watch: 0 (not available)
  overall: number;        // weighted composite
}

/** Wearable connection status */
export interface WearableConnection {
  source: WearableSource;
  connected: boolean;
  lastSyncTime: string | null;
  authToken?: string;      // stored in secure keychain, not in state
  capabilities: WearableCapability[];
}

export type WearableCapability =
  | 'tst'
  | 'sleep-stages'
  | 'hrv'
  | 'heart-rate'
  | 'skin-temperature'
  | 'blood-oxygen'
  | 'respiratory-rate';

/** Source-specific raw data (before normalization) */
export interface WHOOPSleepData {
  id: number;
  start: string;
  end: string;
  score: {
    stage_summary: {
      total_in_bed_time_milli: number;
      total_awake_time_milli: number;
      total_light_sleep_time_milli: number;
      total_slow_wave_sleep_time_milli: number;
      total_rem_sleep_time_milli: number;
    };
    sleep_needed: { baseline_milli: number };
    respiratory_rate: number;
    sleep_performance_percentage: number;
  };
  /** WHOOP 5.0 skin temp (new field) */
  skin_temperature_readings?: Array<{ timestamp: string; temp_celsius: number }>;
}

export interface HealthKitSleepData {
  uuid: string;
  startDate: string;
  endDate: string;
  value: 'InBed' | 'Asleep' | 'Awake' | 'Core' | 'Deep' | 'REM';  // iOS 16+ stages
  sourceBundleIdentifier: string;
}
```

### 5.2 Function Signatures

```typescript
// src/lib/wearable/whoop-adapter.ts

import { WHOOPSleepData, SleepSession, HRVReading, SkinTempReading } from './wearable-types';

/**
 * WHOOP 5.0 API adapter.
 * Endpoints: /v2/activity/sleep, /v2/recovery, /v2/cycle
 * Auth: OAuth 2.0 PKCE flow.
 */
export function fetchWHOOPSleep(
  authToken: string,
  startDate: string,
  endDate: string
): Promise<WHOOPSleepData[]>;

export function normalizeWHOOPSession(raw: WHOOPSleepData): SleepSession;

export function extractWHOOPHRV(
  authToken: string,
  sleepId: number
): Promise<HRVReading[]>;

export function extractWHOOPSkinTemp(
  raw: WHOOPSleepData
): SkinTempReading[] | null;


// src/lib/wearable/healthkit-adapter.ts

import { HealthKitSleepData, SleepSession, HRVReading } from './wearable-types';

/**
 * Apple Watch / HealthKit adapter.
 * Uses react-native-health (Expo HealthKit module).
 * Permissions: HKCategoryTypeIdentifierSleepAnalysis, HKQuantityTypeIdentifierHeartRateVariabilitySDNN
 * 
 * Known limitation: 38% REM misclassification (Chinoy et al. 2021).
 * Sleep staging confidence capped at 0.55.
 */
export function fetchHealthKitSleep(
  startDate: string,
  endDate: string
): Promise<HealthKitSleepData[]>;

export function normalizeHealthKitSession(
  rawSamples: HealthKitSleepData[]
): SleepSession;

export function fetchHealthKitHRV(
  startDate: string,
  endDate: string
): Promise<HRVReading[]>;


// src/lib/wearable/data-pipeline.ts

import { SleepSession, WearableConnection, WearableSource, DataConfidence } from './wearable-types';

/**
 * Unified data pipeline — single entry point for all wearable data.
 * Handles: fetch → normalize → deduplicate → confidence score → store.
 */
export function syncWearableData(
  connections: WearableConnection[],
  dateRange: { start: string; end: string }
): Promise<SleepSession[]>;

/**
 * Merge sessions when multiple sources report the same sleep period.
 * Strategy: take TST from higher-confidence source, merge HRV if available.
 * Dedup by overlap threshold: >80% time overlap = same session.
 */
export function deduplicateSessions(
  sessions: SleepSession[]
): SleepSession[];

/**
 * Confidence scoring engine.
 * Base confidence by source:
 *   WHOOP TST: 0.90, stages: 0.80, HRV: 0.85, skinTemp: 0.90
 *   Apple Watch TST: 0.85, stages: 0.55, HRV: 0.85, skinTemp: 0.0
 *   Manual: TST: 0.60, stages: 0.0, HRV: 0.0, skinTemp: 0.0
 * 
 * Modifiers:
 *   - Alcohol in last 48h (from substance engine): -0.15 on HRV
 *   - Device off-wrist detected: 0.0 for affected metrics
 *   - <4h session: -0.10 on staging (insufficient cycles)
 */
export function scoreConfidence(
  session: SleepSession,
  substanceFlags?: { alcoholLast48h: boolean }
): DataConfidence;

/**
 * Pick the best available data source for each metric when multiple are connected.
 * Returns a composite SleepSession with per-field provenance.
 */
export function fuseMultiSourceSession(
  sessions: SleepSession[]  // same sleep period, different sources
): SleepSession & { provenance: Record<string, WearableSource> };

/**
 * Manual sleep entry fallback — when no wearable connected.
 * User enters: bedtime, wake time, subjective quality (1-5).
 * TST estimated as (wake - bed) × 0.85 (average sleep efficiency).
 */
export function createManualSession(
  bedtime: Date,
  wakeTime: Date,
  subjectiveQuality: number  // 1-5
): SleepSession;
```

### 5.3 Integration Points

| Downstream Module | Integration |
|---|---|
| `dlmo-estimator.ts` (Module 1) | `SleepSession[]` → Tier 2 DLMO via avg sleep midpoint; `HRVReading[]` → HRV nadir cross-validation; `SkinTempReading[]` → Tier 3 DLMO |
| `fatigue-model.ts` | Replace assumed `actualSleep` with `session.tstMinutes` from wearable pipeline |
| `energy-model.ts` | Actual wake time from wearable → more accurate Process S calculation |
| `substance-engine.ts` (Module 3) | Pipeline checks `alcoholLast48h` before scoring HRV confidence |
| `fatigue-alerting.ts` (Module 4) | Real sleep data improves cumulative debt accuracy → better alert calibration |
| Recovery score (future) | Use `deepPercent`, `remPercent`, HRV for evidence-based recovery composite |

### 5.4 Test Scenarios

```typescript
describe('Wearable Data Pipeline', () => {
  // WHOOP normalization
  it('converts WHOOP millisecond durations to SleepSession minutes', () => {});
  it('extracts skin temp readings and computes nadir', () => {});
  it('WHOOP session gets staging confidence 0.80', () => {});
  
  // HealthKit normalization
  it('merges fragmented HealthKit samples into single session', () => {});
  it('handles iOS 16 sleep stages (Core/Deep/REM)', () => {});
  it('caps staging confidence at 0.55 for Apple Watch', () => {});
  it('ignores "InBed" samples — only counts Asleep+stages for TST', () => {});
  
  // Deduplication
  it('80% overlap between WHOOP and Apple Watch → merged session', () => {});
  it('<80% overlap → treated as separate sessions (nap + main sleep)', () => {});
  
  // Multi-source fusion
  it('WHOOP staging preferred over Apple Watch when both available', () => {});
  it('Apple Watch HRV used when WHOOP not connected', () => {});
  it('provenance tracks which source provided each field', () => {});
  
  // Confidence scoring
  it('alcohol flag reduces HRV confidence by 0.15', () => {});
  it('off-wrist detection → 0.0 for all metrics', () => {});
  it('<4h session → staging confidence penalty', () => {});
  
  // Manual entry
  it('manual bedtime 23:00, wake 07:00 → TST ~408 min (8h × 0.85)', () => {});
  it('manual entry gets TST confidence 0.60, staging null', () => {});
  
  // Pipeline end-to-end
  it('syncWearableData fetches, normalizes, deduplicates, scores in order', () => {});
  it('handles API timeout gracefully — returns cached last-known data', () => {});
  it('empty response from wearable API → falls back to manual entry prompt', () => {});
});
```

---

## 6. Cross-Module Integration Map

```
┌──────────────────────────────────────────────────────────────────────┐
│                        USER INPUTS                                   │
│  MEQ Questionnaire │ Substance Log │ KSS Check-in │ Manual Sleep    │
└────────┬───────────┴───────┬───────┴───────┬───────┴───────┬────────┘
         │                   │               │               │
         ▼                   ▼               │               │
┌─────────────────┐ ┌────────────────┐       │     ┌─────────▼────────┐
│  Module 1:      │ │  Module 3:     │       │     │  Module 5:       │
│  DLMO Estimator │ │  Substance     │       │     │  Wearable        │
│  (Tier 1/2/3)   │ │  Engine        │       │     │  Pipeline        │
│                 │ │                │       │     │  (WHOOP/AW)      │
└────────┬────────┘ └───────┬────────┘       │     └──┬──────┬────────┘
         │                  │                │        │      │
         │  CircadianMarkers│  SubstanceState│        │  SleepSession[]
         │                  │                │        │  HRVReading[]
         ▼                  ▼                ▼        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     EXISTING ALGORITHM CORE                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐  │
│  │ energy-      │ │ sleep-       │ │ light-       │ │ fatigue-   │  │
│  │ model.ts     │ │ windows.ts   │ │ protocol.ts  │ │ model.ts   │  │
│  │              │ │              │ │              │ │            │  │
│  │ +DLMO-aware  │ │ +compromise  │ │ +DLMO-gated  │ │ +real TST  │  │
│  │  acrophase   │ │  phase sleep │ │  windows     │ │ +substance │  │
│  │ +substance   │ │  anchors     │ │ +Eastman 5×  │ │  modifier  │  │
│  │  caffeine    │ │              │ │  pulse sched │ │            │  │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └─────┬──────┘  │
│         └────────────┬───┘               │               │          │
│                      ▼                   │               │          │
│              ┌───────────────┐            │               │          │
│              │ prediction-   │◄───────────┘               │          │
│              │ engine.ts     │                            │          │
│              │ +rotation     │                            │          │
│              │  analysis     │                            │          │
│              └───────┬───────┘                            │          │
└──────────────────────┼────────────────────────────────────┼──────────┘
                       │                                    │
         ┌─────────────▼────────────────────────────────────▼──────────┐
         │                   Module 2:                                  │
         │            Compromise Phase Position                         │
         │  (replaces rotation handler in prediction-engine)            │
         │  analyzeRotation() → selectPhaseStrategy() →                │
         │  buildCompromiseProtocol() OR buildReEntrainmentProtocol()   │
         └─────────────────────────┬───────────────────────────────────┘
                                   │
                                   ▼
         ┌─────────────────────────────────────────────────────────────┐
         │                   Module 4:                                  │
         │              Fatigue Alerting System                         │
         │  evaluateFatigue() → processKSSCheckin() →                  │
         │  buildNotificationPayload() → Expo Push Notifications       │
         └─────────────────────────────────────────────────────────────┘
```

---

## 7. Implementation Timeline

| Module | Effort | Dependencies | Priority | Ship Target |
|--------|--------|-------------|----------|-------------|
| 1. DLMO Estimator | 24h | None (Tier 1 standalone) | P0 — blocks light protocol safety | Week 1-2 |
| 2. Compromise Phase | 32h | Module 1 (DLMO for target calculation) | P0 — fixes rotation whiplash | Week 2-3 |
| 3. Substance Engine | 28h | Module 1 (DLMO for caffeine/melatonin timing) | P0 — pre-launch safety | Week 3-4 |
| 4. Fatigue Alerting | 20h | Module 3 (substance modifiers) | P0 — pre-launch safety | Week 4-5 |
| 5. Wearable Pipeline | 36h | None (enhances modules 1/3/4 but not required) | P1 — post-launch v1.1 | Week 6-8 |
| **Total** | **140h** | | | **~8 weeks** |

### Sequencing Rationale

Modules 1-4 are all **pre-launch critical** per the scientific audit (Grade B+ → A- requires closing the 4 critical gaps). Module 5 is an enhancement that improves accuracy but isn't required for safe operation — manual sleep entry and MEQ-only DLMO (Tier 1) are sufficient for launch.

The dependency chain is: **1 → 2 → 3 → 4**, with Module 5 as a parallel workstream that can be integrated incrementally (Tier 2 DLMO becomes available when wearable data starts flowing).

### New Files Created

```
src/lib/circadian/
├── dlmo-types.ts              (Module 1)
├── dlmo-estimator.ts          (Module 1)
├── compromise-phase-types.ts  (Module 2)
├── compromise-phase.ts        (Module 2)
├── substance-types.ts         (Module 3)
├── substance-engine.ts        (Module 3)
├── fatigue-alert-types.ts     (Module 4)
├── fatigue-alerting.ts        (Module 4)

src/lib/wearable/              (Module 5 — new directory)
├── wearable-types.ts
├── whoop-adapter.ts
├── healthkit-adapter.ts
├── data-pipeline.ts
├── index.ts
```

### Existing Files Modified

```
src/lib/circadian/
├── types.ts                   → Add MEQResult to UserProfile
├── energy-model.ts            → Replace static acrophase with DLMO-derived
├── light-protocol.ts          → Gate light blocks to DLMO advance/delay windows
├── sleep-windows.ts           → Use CircadianMarkers for sleep onset; add compromise anchors
├── nap-engine.ts              → Avoid wake maintenance zone
├── caffeine.ts                → Wrap with DLMO-relative melatonin suppression check
├── classify-shifts.ts         → Add RotationPattern to detectPatterns output
├── prediction-engine.ts       → Route through compromise vs re-entrainment
├── fatigue-model.ts           → Accept real TST from wearable pipeline; add substance modifier
├── index.ts                   → Export new modules
```

---

Created: 2026-04-18  
Last Reviewed: 2026-04-18  
Last Edited: 2026-04-18  
Review Notes: Initial creation from Scientific Audit Report 2026-04-18 findings. All 5 modules specified with TypeScript interfaces, function signatures, integration points, test scenarios, and effort estimates. Total estimated effort: 140 hours across 8 weeks.
