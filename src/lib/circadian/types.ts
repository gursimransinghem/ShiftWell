/**
 * Core types for the ShiftWell circadian algorithm.
 *
 * Based on the Two-Process Model of sleep regulation (Borbely, 1982):
 * - Process S: Homeostatic sleep pressure (increases with wakefulness)
 * - Process C: Circadian oscillator (~24.1h free-running period)
 */

/** Chronotype based on Morningness-Eveningness Questionnaire (MEQ) */
export type Chronotype = 'early' | 'intermediate' | 'late';

/** Classification of a work period based on its timing */
export type ShiftType = 'day' | 'evening' | 'night' | 'extended';

/** What kind of day this is in the schedule */
export type DayType =
  | 'work-day'       // Day shift (roughly 06:00-18:00)
  | 'work-evening'   // Evening shift (roughly 14:00-23:00)
  | 'work-night'     // Night shift (roughly 18:00-08:00)
  | 'work-extended'  // 24h shift or >16h
  | 'off'            // No shift scheduled
  | 'transition-to-nights'  // Day off before a night shift stretch
  | 'transition-to-days'    // Day off after a night shift stretch
  | 'recovery';             // First day off after nights (needs special handling)

/** A single shift event imported from calendar */
export interface ShiftEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  shiftType: ShiftType;
  /** Whether this shift came from calendar sync or manual entry (D-16) */
  source?: 'calendar' | 'manual';
}

/** A non-shift calendar event (appointments, activities, etc.) */
export interface PersonalEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

/** A single activity in an AM or PM routine */
export interface RoutineStep {
  id: string;
  label: string;
  icon: string;
  durationMinutes: number;
  enabled: boolean;
}

/** User profile collected during onboarding */
export interface UserProfile {
  chronotype: Chronotype;
  /** Desired sleep hours per 24h period (default: 7.5) */
  sleepNeed: number;
  /** Individual caffeine half-life in hours (default: 5) */
  caffeineHalfLife: number;
  /** Whether user is open to strategic naps */
  napPreference: boolean;
  /** Number of people in household */
  householdSize: number;
  /** Whether there are young children (affects noise modeling) */
  hasYoungChildren: boolean;
  /** Whether there are pets that may disrupt sleep (adds wake buffer) */
  hasPets: boolean;
  /** Typical commute duration in minutes */
  commuteDuration: number;
  /** Work address for commute calculation */
  workAddress: string;
  /** Home address for commute calculation */
  homeAddress: string;
  /** Morning routine activities */
  amRoutine: RoutineStep[];
  /** Evening routine activities */
  pmRoutine: RoutineStep[];
  /**
   * Optional measured / user-tuned DLMO (dim-light melatonin onset), hour-of-day 0-24.
   * When present, the circadian phase model uses it instead of the chronotype seed and
   * reports higher confidence. Wearable-refined estimates are a v2 extension point.
   */
  measuredDlmoHour?: number;
}

/** Default profile for new users */
export const DEFAULT_PROFILE: UserProfile = {
  chronotype: 'intermediate',
  sleepNeed: 7.5,
  caffeineHalfLife: 5,
  napPreference: true,
  householdSize: 1,
  hasYoungChildren: false,
  hasPets: false,
  commuteDuration: 30,
  workAddress: '',
  homeAddress: '',
  amRoutine: [],
  pmRoutine: [],
};

// Re-exported decision-trace entry type (defined in telemetry.ts).
import type { DecisionTraceEntry } from './telemetry';
export type { DecisionTraceEntry } from './telemetry';

/** A classified day in the schedule with its type */
export interface ClassifiedDay {
  date: Date;
  dayType: DayType;
  shift: ShiftEvent | null;
  personalEvents: PersonalEvent[];
}

/** Types of blocks in the generated sleep plan */
export type SleepBlockType =
  | 'main-sleep'
  | 'nap'
  | 'wind-down'
  | 'wake'
  | 'caffeine-cutoff'
  | 'meal-window'
  | 'light-seek'
  | 'light-avoid';

/** A single block in the generated plan */
export interface PlanBlock {
  id: string;
  type: SleepBlockType;
  start: Date;
  end: Date;
  /** Human-readable label, e.g., "Main Sleep", "Pre-shift Nap" */
  label: string;
  /** Longer description with science context */
  description: string;
  /** Priority: 1 = critical (main sleep), 2 = important (nap), 3 = recommended (meal) */
  priority: 1 | 2 | 3;
}

/** The complete sleep plan for a date range */
export interface SleepPlan {
  blocks: PlanBlock[];
  /** Start of the planning period */
  startDate: Date;
  /** End of the planning period */
  endDate: Date;
  /** The classified days used to generate this plan */
  classifiedDays: ClassifiedDay[];
  /** Summary stats */
  stats: PlanStats;
  /**
   * Inspectable trace of the circadian decisions behind this plan (phase estimate,
   * Hold/Adapt mode per night). Plain serializable primitives only — byte-stable
   * across runs. Lets decisions be audited without enabling telemetry.
   */
  decisionTrace?: DecisionTraceEntry[];
}

export interface PlanStats {
  /** Average planned sleep hours per 24h */
  avgSleepHours: number;
  /** Number of night shifts in the period */
  nightShiftCount: number;
  /** Number of hard transitions (night-to-day or day-to-night) */
  hardTransitions: number;
  /** Estimated circadian debt score (0-100, lower is better) */
  circadianDebtScore: number;
}

// ─── Prediction Engine Types (Phase 22) ──────────────────────────────────────

/**
 * Extended transition type for the predictive engine.
 * Augments existing DayType with directional phase-shift labels.
 *
 * Reference: Eastman & Burgess (2009) — transition type taxonomy
 */
export type TransitionType =
  | 'day-to-night'
  | 'night-to-day'
  | 'day-to-evening'
  | 'evening-to-day'
  | 'evening-to-night'
  | 'night-to-evening'
  | 'off-to-night'
  | 'off-to-extended'
  | 'extended-recovery';

/**
 * Input to the 14-day circadian lookahead scanner.
 *
 * Reference: ShiftWell Circadian Stress Index (SCSI) spec, Phase 21
 */
export interface PredictionInput {
  shifts: Array<{
    date: string;       // yyyy-MM-dd
    startHour: number;  // 0-23
    endHour: number;    // 0-23 (endHour < startHour means crosses midnight)
    type: 'day' | 'evening' | 'night' | 'off';
  }>;
  currentSleepDebt: number;   // hours
  baselineMidsleep: number;   // circadian anchor (0-24)
  lookAheadDays: number;      // 14
  /** Optional deterministic scan anchor for tests/simulations. Defaults to today. */
  referenceDate?: string | Date;
}

/**
 * A single transition prediction with severity scoring and pre-adaptation window.
 *
 * Reference: PREDICTION-ALGORITHM-SPEC.md Section 4 (Phase 21 output)
 */
export interface TransitionPrediction {
  transitionDate: string;           // yyyy-MM-dd
  transitionType: TransitionType;
  severityScore: number;            // 0-100 (higher = more stressful)
  severity: 'low' | 'medium' | 'high' | 'critical';
  preAdaptationStartDate: string;   // yyyy-MM-dd — when to begin pre-adaptation
  protocolType: string;             // Phase 9 protocol type name
  predictedAlertnesNadir: number;   // Estimated alertness % at transition nadir (0-100)
  daysUntilTransition: number;      // Calendar days from today to transitionDate
  /** Consecutive nights in the block this transition leads into — feeds the R1 gate. */
  consecutiveNights?: number;
}

/**
 * A single step in a pre-adaptation protocol.
 */
export interface PreAdaptationStep {
  date: string;         // yyyy-MM-dd
  action: string;       // human-readable guidance
  shiftMinutes: number; // minutes to shift bedtime (positive = delay, negative = advance)
}

// ─── Chronotype Offsets ───────────────────────────────────────────────────────

/**
 * Chronotype-based sleep preference offsets (hours from midnight).
 * Based on MEQ normative data.
 *
 * Reference: Horne & Ostberg (1976) — Morningness-Eveningness Questionnaire
 */
export const CHRONOTYPE_OFFSETS: Record<Chronotype, { naturalSleepOnset: number; naturalWake: number }> = {
  early: { naturalSleepOnset: 21.5, naturalWake: 5.5 },        // 9:30 PM - 5:30 AM
  intermediate: { naturalSleepOnset: 23.0, naturalWake: 7.0 },  // 11:00 PM - 7:00 AM
  late: { naturalSleepOnset: 0.5, naturalWake: 8.5 },           // 12:30 AM - 8:30 AM
};

// ─── Circadian Phase Model (R6-core) ──────────────────────────────────────────

/**
 * An estimate of where the body clock currently sits.
 *
 * The whole point of R6: every downstream timing decision (light, naps, melatonin
 * guidance) anchors to an estimated phase instead of to clock time / "half the shift".
 *
 * Hours are local hour-of-day in [0, 24) — treat as CIRCULAR (a `dlmoHour` of 23.5 and
 * a `cbtMinHour` of (23.5+7) mod 24 = 6.5 are both valid).
 *
 * Reference: Khalsa et al. 2003 (light PRC pivots on CBTmin); Smith/Fogg/Eastman 2009
 * (CBTmin = DLMO + 7h); Kantermann/Sung/Burgess 2015 (DLMO ≈ MSFsc − 6h, ±2h spread).
 */
export interface CircadianPhase {
  /** Estimated dim-light melatonin onset, hour-of-day [0,24). */
  dlmoHour: number;
  /** Estimated core-body-temperature minimum = (dlmoHour + 7) mod 24. */
  cbtMinHour: number;
  /** ± half-width of the estimate, hours. Never below 1.5 for a seeded estimate. */
  confidenceHours: number;
  /** Where the estimate came from. */
  source: 'chronotype-seed' | 'user-tuned' | 'wearable-refined';
}
