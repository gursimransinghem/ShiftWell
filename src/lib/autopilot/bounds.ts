/**
 * Autopilot Safety Bounds — Phase 34 (30-Day Autopilot)
 *
 * Before any autonomous plan change is applied, it must pass the bounds check.
 * This prevents dangerous sleep window shifts that could worsen circadian health.
 *
 * Safety limits (based on circadian literature):
 *   - Max shift magnitude: 30 minutes per cycle (prevents acute circadian disruption)
 *   - Min sleep duration: 6 hours (AASM minimum for adults)
 *   - Max sleep duration: 10 hours (beyond this is oversleeping, not beneficial)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProposedChange {
  /** Current bedtime in 24h format "HH:MM" */
  currentBedtime: string;
  /** Proposed bedtime in 24h format "HH:MM" */
  proposedBedtime: string;
  /** Current wake time in 24h format "HH:MM" */
  currentWakeTime: string;
  /** Proposed wake time in 24h format "HH:MM" */
  proposedWakeTime: string;
}

export interface BoundsResult {
  withinBounds: boolean;
  /** Human-readable list of violations (empty when withinBounds=true) */
  violations: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const MAX_SHIFT_MINUTES = 30;
const MIN_SLEEP_HOURS = 6;
const MAX_SLEEP_HOURS = 10;

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Convert "HH:MM" to total minutes from midnight.
 */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Compute absolute shift in minutes between two "HH:MM" times.
 * Accounts for times that may cross midnight in either direction.
 */
function shiftMagnitudeMinutes(from: string, to: string): number {
  const fromMin = timeToMinutes(from);
  const toMin = timeToMinutes(to);
  const diff = Math.abs(fromMin - toMin);
  // When the diff wraps midnight (e.g., 23:45 to 00:00), take the shorter path
  return Math.min(diff, 24 * 60 - diff);
}

/**
 * Calculate sleep duration in hours from bedtime to wake time.
 * Handles the common case where bedtime is before midnight and wake is after.
 *
 * @param bedtime   "HH:MM" 24h
 * @param wakeTime  "HH:MM" 24h
 * @returns         hours of sleep (may be fractional)
 */
export function computeSleepDurationHours(bedtime: string, wakeTime: string): number {
  const bedMinutes = timeToMinutes(bedtime);
  const wakeMinutes = timeToMinutes(wakeTime);

  let durationMinutes = wakeMinutes - bedMinutes;

  // If negative, wake time is next day (most common shift-work scenario)
  if (durationMinutes <= 0) {
    durationMinutes += 24 * 60;
  }

  return durationMinutes / 60;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Validate a proposed sleep window change against safety bounds.
 *
 * Returns a BoundsResult with withinBounds=true only when ALL of the
 * following are satisfied:
 *   1. Bedtime shift <= MAX_SHIFT_MINUTES (30 min)
 *   2. Wake time shift <= MAX_SHIFT_MINUTES (30 min)
 *   3. Proposed sleep duration >= MIN_SLEEP_HOURS (6h)
 *   4. Proposed sleep duration <= MAX_SLEEP_HOURS (10h)
 *
 * @param change - The proposed sleep window change to evaluate
 */
export function isWithinBounds(change: ProposedChange): BoundsResult {
  const violations: string[] = [];

  // Check bedtime shift magnitude
  const bedtimeShift = shiftMagnitudeMinutes(
    change.currentBedtime,
    change.proposedBedtime,
  );
  if (bedtimeShift > MAX_SHIFT_MINUTES) {
    violations.push(
      `Bedtime shift would be ${bedtimeShift} minutes (max ${MAX_SHIFT_MINUTES} minutes)`,
    );
  }

  // Check wake time shift magnitude
  const wakeShift = shiftMagnitudeMinutes(
    change.currentWakeTime,
    change.proposedWakeTime,
  );
  if (wakeShift > MAX_SHIFT_MINUTES) {
    violations.push(
      `Wake time shift would be ${wakeShift} minutes (max ${MAX_SHIFT_MINUTES} minutes)`,
    );
  }

  // Check resulting sleep duration
  const proposedDuration = computeSleepDurationHours(
    change.proposedBedtime,
    change.proposedWakeTime,
  );

  if (proposedDuration < MIN_SLEEP_HOURS) {
    violations.push(
      `Proposed sleep window is ${proposedDuration.toFixed(1)}h — minimum is ${MIN_SLEEP_HOURS}h`,
    );
  }

  if (proposedDuration > MAX_SLEEP_HOURS) {
    violations.push(
      `Proposed sleep window is ${proposedDuration.toFixed(1)}h — maximum is ${MAX_SLEEP_HOURS}h`,
    );
  }

  return {
    withinBounds: violations.length === 0,
    violations,
  };
}
