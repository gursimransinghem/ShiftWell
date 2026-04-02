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
