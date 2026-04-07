/**
 * Adaptive Brain — Core Types
 *
 * These types define the AdaptiveContext assembled each morning from
 * HealthKit + stores, and the change records surfaced on the Today screen.
 *
 * Scientific basis: docs/superpowers/specs/2026-04-06-adaptive-brain-design.md
 */

import type { ShiftEvent, PersonalEvent } from '../circadian/types';

// ─── Transition Types ──────────────────────────────────────────────────────────

/**
 * The type of circadian transition the user is approaching or currently in.
 * 'none' means stable rotation — maintenance mode.
 */
export type TransitionType =
  | 'day-to-night'
  | 'night-to-day'
  | 'evening-to-night'
  | 'day-to-evening'
  | 'isolated-night'
  | 'none';

// ─── Circadian Protocol ────────────────────────────────────────────────────────

/**
 * A single day's target within a circadian protocol.
 * bedtimeAdjustMinutes is cumulative from the chronotype baseline.
 */
export interface ProtocolDayTarget {
  date: Date;
  /** Minutes to shift bedtime from chronotype baseline. Positive = later, negative = earlier. */
  bedtimeAdjustMinutes: number;
  /** Human-readable light guidance for this day */
  lightGuidance: string;
  /** Optional: nap recommendation (prophylactic pre-shift or anchor recovery) */
  napGuidance?: string;
}

/**
 * The active circadian transition protocol.
 * dailyTargets is empty in maintenance mode (no transition detected).
 */
export interface CircadianProtocol {
  transitionType: TransitionType;
  daysUntilTransition: number;
  /** Ordered list of day-specific bedtime targets during the transition */
  dailyTargets: ProtocolDayTarget[];
}

// ─── Sleep Debt / Bank ─────────────────────────────────────────────────────────

export type DebtSeverity = 'none' | 'mild' | 'moderate' | 'severe';

/**
 * Rolling 14-night debt/bank ledger.
 * rollingHours: positive = owed, negative = banked surplus.
 */
export interface DebtLedger {
  /** Total hours owed (positive) or banked (negative) across 14 nights */
  rollingHours: number;
  /** Sleep bank credit, capped at 2h display (min(0, -rollingHours), cap 2) */
  bankHours: number;
  severity: DebtSeverity;
  /** True when a shift restriction cluster is 3–7 days out and 7-day avg < sleepNeed */
  bankingWindowOpen: boolean;
}

// ─── Recovery Score ────────────────────────────────────────────────────────────

export type RecoveryZone = 'green' | 'yellow' | 'red';

// ─── Pattern Alerts (re-exported from PatternAlertCard for context builder) ────

export interface PatternAlert {
  id: string;
  type: 'night-soon' | 'consecutive-nights' | 'mixed-week';
  message: string;
  color: string;
}

// ─── AdaptiveContext ───────────────────────────────────────────────────────────

/**
 * Full context assembled each morning. Passed as optional 6th argument to
 * generateSleepPlan(). When non-null, the algorithm uses these as constraints.
 */
export interface AdaptiveContext {
  circadian: {
    protocol: CircadianProtocol | null;
    /** Minutes the current plan's bedtime deviates from optimal circadian phase */
    phaseOffsetMinutes: number;
    /** True when no transition detected — optimize quality, stop shifting */
    maintenanceMode: boolean;
  };
  debt: {
    rollingHours: number;
    bankHours: number;
    severity: DebtSeverity;
  };
  schedule: {
    transitionType: TransitionType | null;
    daysUntilTransition: number;
    calendarConflicts: PersonalEvent[];
    patternAlerts: PatternAlert[];
    /** True when upcoming shift restriction is 3–7 days out */
    bankingWindowOpen: boolean;
  };
  recovery: {
    /** null if no Apple Watch or insufficient baseline */
    score: number | null;
    zone: RecoveryZone | null;
    /** True after 30 nights per shift type — score is reliable */
    baselineMature: boolean;
  };
  meta: {
    /** days 1–30: propose mode (user confirms changes). Day 31+: autopilot. */
    learningPhase: boolean;
    daysTracked: number;
    lastUpdated: Date;
  };
}

// ─── Feedback Engine ──────────────────────────────────────────────────────────

export type ConvergenceStatus = 'converging' | 'converged' | 'stalled' | 'insufficient_data';

/**
 * HRV context passed to computeFeedbackOffset.
 * When currentRMSSD < p20RMSSD, feedback dead zone expands to 30 min
 * (noisy sleep data on poor-recovery nights — Phillips et al. 2017).
 */
export interface HRVFeedbackContext {
  currentRMSSD: number;
  p20RMSSD: number;
  percentile: number;
}

/**
 * Result of computeFeedbackOffset — the adjustments to apply to the sleep plan.
 * feedbackActive=false means the plan is frozen at current offsets.
 */
export interface FeedbackResult {
  adjustedBedtimeOffsetMinutes: number;
  adjustedWakeOffsetMinutes: number;
  feedbackActive: boolean;
  feedbackReason: string;
  smoothedBedtimeDeviation: number;
  convergenceStatus: ConvergenceStatus;
  /** Active dead zone in minutes — 20 normally, 30 on low-HRV nights (HK-11) */
  activeDeadZoneMinutes: number;
}

// ─── Change Log ────────────────────────────────────────────────────────────────

export type ChangeType =
  | 'bedtime-shifted'
  | 'wake-shifted'
  | 'nap-added'
  | 'nap-removed'
  | 'window-extended'
  | 'banking-triggered';

export type ChangeFactor = 'circadian' | 'debt' | 'schedule' | 'recovery';

/**
 * A single meaningful plan change, surfaced on the AdaptiveInsightCard.
 */
export interface AdaptiveChange {
  type: ChangeType;
  factor: ChangeFactor;
  magnitudeMinutes: number;
  /** "Bedtime shifted 90 min later" */
  humanReadable: string;
  /** "Night shift starts Friday" */
  reason: string;
  citation?: string;
  /** ISO string, populated when moved to changeLog on dismiss (D-08) */
  timestamp?: string;
}
