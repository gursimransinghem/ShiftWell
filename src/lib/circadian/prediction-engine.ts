/**
 * Prediction Engine — Phase 22
 *
 * Implements the ShiftWell Circadian Stress Index (SCSI):
 * - 14-day lookahead scanner that detects shift transitions
 * - Severity scoring based on phase shift magnitude and sleep debt
 * - Pre-adaptation protocol generation (Eastman & Burgess 2009)
 *
 * Scientific basis:
 *   - Eastman & Burgess (2009) PMID:19346453 — transition threshold, shift rates
 *   - Crowley et al. (2003) PMC1262683 — 3-5 day pre-adaptation window
 *   - Hursh et al. (2004) PMID:15018265 — SAFTE severity band derivation
 *   - Van Dongen et al. (2003) SLEEP — sleep debt escalation (>8h threshold)
 *   - Folkard & Tucker (2003) PMID:12637593 — consecutive nights risk multipliers
 */

import type {
  PredictionInput,
  TransitionPrediction,
  TransitionType,
  PreAdaptationStep,
} from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** TSS severity thresholds per PREDICTION-ALGORITHM-SPEC.md Section 5 */
const SEVERITY_THRESHOLDS = {
  critical: 70,
  high: 45,
  medium: 25,
  // < 25 = low
};

/** Alertness nadir thresholds mapping to severity bands */
const ALERTNESS_NADIR_THRESHOLDS = {
  critical: 40,  // < 40 → critical
  high: 55,      // 40-55 → high
  medium: 70,    // 55-70 → medium
  // > 70 → low
};

/** Pre-adaptation lead days per severity per PREDICTION-ALGORITHM-SPEC.md Section 6 */
const ADAPTATION_DAYS: Record<string, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 0,
};

/** Protocol type mapping per PREDICTION-ALGORITHM-SPEC.md Section 7 */
const PROTOCOL_MAP: Record<string, Record<string, string>> = {
  critical: {
    'day-to-night': 'pre-night-critical',
    'night-to-day': 'post-night-critical',
    default: 'standard-transition',
  },
  high: {
    'day-to-night': 'pre-night-high',
    'night-to-day': 'post-night-high',
    default: 'standard-transition',
  },
  medium: {
    default: 'standard-transition',
  },
  low: {
    default: 'default',
  },
};

/** Escalation ladder for sleep debt > 8h rule */
const ESCALATE: Record<string, string> = {
  low: 'medium',
  medium: 'high',
  high: 'critical',
  critical: 'critical',
};

/** Phase shift magnitudes by transition type (hours) */
const PHASE_SHIFT_HOURS: Record<string, number> = {
  'day-to-night': 10,
  'night-to-day': 10,
  'day-to-evening': 4,
  'evening-to-day': 4,
  'evening-to-night': 4,
  'night-to-evening': 4,
  'off-to-night': 10,
  'off-to-extended': 10,
  'extended-recovery': 6,
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function addDaysToISO(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysBetweenISO(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + 'T00:00:00');
  const to = new Date(toISO + 'T00:00:00');
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Determine TransitionType from two consecutive shift type strings.
 * Returns null if no notable transition detected.
 */
function detectTransitionType(
  prev: string | null,
  curr: string,
): TransitionType | null {
  if (curr === 'off') return null;

  if (prev === null || prev === 'off') {
    if (curr === 'night') return 'off-to-night';
    return null; // off→day or off→evening are not tracked as stress transitions
  }

  if (prev === curr) return null; // same type, no transition

  if (prev === 'day' && curr === 'night') return 'day-to-night';
  if (prev === 'night' && curr === 'day') return 'night-to-day';
  if (prev === 'day' && curr === 'evening') return 'day-to-evening';
  if (prev === 'evening' && curr === 'day') return 'evening-to-day';
  if (prev === 'evening' && curr === 'night') return 'evening-to-night';
  if (prev === 'night' && curr === 'evening') return 'night-to-evening';

  return null;
}

/**
 * Score the transition stress using the SCSI algorithm.
 *
 * Based on PREDICTION-ALGORITHM-SPEC.md Section 3, Step 3.
 *
 * Returns a 0-100 score. Higher = more stressful.
 */
function scoreTransitionStress(
  transitionType: TransitionType,
  phaseShiftHours: number,
  recoveryDaysAvailable: number,
  consecutiveNights: number,
  currentSleepDebt: number,
): { tss: number; alertnessNadir: number } {
  // Factor 1 — Rotation direction penalty (0-30 pts)
  const isAdvance = transitionType === 'night-to-day' ||
    transitionType === 'evening-to-day' ||
    transitionType === 'night-to-evening';

  let f1 = (phaseShiftHours / 12) * 20;
  if (isAdvance) f1 *= 1.5;
  f1 = Math.min(f1, 30);

  // Factor 2 — Recovery time penalty (0-25 pts)
  const maxShiftRate = isAdvance ? 1.0 : 1.5; // h/day; advances are harder
  const idealRecoveryDays = phaseShiftHours / maxShiftRate;
  const deficit = Math.max(0, 1 - (recoveryDaysAvailable / idealRecoveryDays));
  const f2 = Math.round(deficit * 25);

  // Factor 3 — Consecutive nights penalty (0-20 pts)
  const f3 = consecutiveNights <= 1 ? 0
    : consecutiveNights === 2 ? 4
    : consecutiveNights === 3 ? 8
    : consecutiveNights === 4 ? 13
    : consecutiveNights === 5 ? 17
    : 20;

  // Factor 4 — Sleep debt penalty (0-15 pts)
  const f4 = currentSleepDebt <= 2 ? 0
    : currentSleepDebt <= 5 ? 4
    : currentSleepDebt <= 10 ? 8
    : currentSleepDebt <= 15 ? 12
    : 15;

  // Factor 5 — Shift duration penalty (simplified: use phase shift as proxy)
  // Large phase shifts (≥8h) imply night/extended shifts
  const f5 = phaseShiftHours >= 8 ? 6 : phaseShiftHours >= 4 ? 3 : 0;

  const tss = clamp(Math.round(f1 + f2 + f3 + f4 + f5), 0, 100);

  // Predicted alertness nadir (simplified SAFTE-derived model per spec Section 3 Step 5)
  // Base alertness = 100 - (phaseShiftHours * 8) - (sleepDebt * 4)
  const alertnessNadir = clamp(
    100 - (phaseShiftHours * 8) - (currentSleepDebt * 4),
    0,
    100,
  );

  return { tss, alertnessNadir };
}

/**
 * Map TSS score and alertness nadir to severity band.
 * Alertness nadir takes precedence (direct physiological measure).
 */
function mapToSeverity(
  tss: number,
  alertnessNadir: number,
): 'low' | 'medium' | 'high' | 'critical' {
  // Primary: alertness nadir bands per PREDICTION-ALGORITHM-SPEC.md Section 5
  if (alertnessNadir < ALERTNESS_NADIR_THRESHOLDS.critical) return 'critical';
  if (alertnessNadir < ALERTNESS_NADIR_THRESHOLDS.high) return 'high';
  if (alertnessNadir < ALERTNESS_NADIR_THRESHOLDS.medium) return 'medium';

  // Secondary: TSS score (tie-breaker / cross-validation)
  if (tss >= SEVERITY_THRESHOLDS.critical) return 'critical';
  if (tss >= SEVERITY_THRESHOLDS.high) return 'high';
  if (tss >= SEVERITY_THRESHOLDS.medium) return 'medium';
  return 'low';
}

/**
 * Select the protocol type string for a given severity + transition type.
 */
function selectProtocolType(
  severity: string,
  transitionType: TransitionType,
): string {
  const severityMap = PROTOCOL_MAP[severity] ?? PROTOCOL_MAP.low;
  return severityMap[transitionType] ?? severityMap.default ?? 'default';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Scan the next N days of shifts and return TransitionPrediction objects
 * for each detected circadian transition.
 *
 * Results are sorted soonest → latest.
 *
 * @param input PredictionInput with shifts, sleep debt, and circadian anchor
 */
export function scanUpcomingTransitions(input: PredictionInput): TransitionPrediction[] {
  const { shifts, currentSleepDebt, lookAheadDays } = input;

  if (shifts.length === 0) return [];

  // Sort shifts by date
  const sorted = [...shifts].sort((a, b) => a.date.localeCompare(b.date));

  // Build a date→shift map for fast lookup
  const shiftByDate = new Map<string, typeof sorted[0]>();
  for (const s of sorted) {
    shiftByDate.set(s.date, s);
  }

  // Determine scan window
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString().slice(0, 10);

  // Use first shift date or today as scan start
  const firstDate = sorted[0].date;
  const scanStart = firstDate < todayISO ? todayISO : firstDate;
  const scanEnd = addDaysToISO(todayISO, lookAheadDays);

  const predictions: TransitionPrediction[] = [];

  // Collect unique dates within window
  const allDates: string[] = [];
  const start = new Date(scanStart + 'T00:00:00');
  const end = new Date(scanEnd + 'T00:00:00');
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    allDates.push(d.toISOString().slice(0, 10));
  }

  let prevType: string | null = null;
  let consecutiveNights = 0;

  for (let i = 0; i < allDates.length; i++) {
    const dateISO = allDates[i];
    const shift = shiftByDate.get(dateISO);
    const currType = shift?.type ?? 'off';

    // Track consecutive nights for factor 3
    if (currType === 'night') {
      consecutiveNights++;
    } else {
      consecutiveNights = 0;
    }

    const transitionType = detectTransitionType(prevType, currType);

    if (transitionType !== null) {
      const phaseShiftHours = PHASE_SHIFT_HOURS[transitionType] ?? 4;

      // Count recovery days available before this transition
      // = number of 'off' days immediately before this date in the sorted input
      let recoveryDaysAvailable = 0;
      for (let j = i - 1; j >= 0; j--) {
        const prevDateISO = allDates[j];
        const prevShift = shiftByDate.get(prevDateISO);
        if (!prevShift || prevShift.type === 'off') {
          recoveryDaysAvailable++;
        } else {
          break;
        }
      }

      const { tss, alertnessNadir } = scoreTransitionStress(
        transitionType,
        phaseShiftHours,
        recoveryDaysAvailable,
        consecutiveNights,
        currentSleepDebt,
      );

      let severity = mapToSeverity(tss, alertnessNadir);

      // Sleep debt escalation rule (Van Dongen et al. 2003)
      if (currentSleepDebt > 8 && severity !== 'critical') {
        severity = ESCALATE[severity] as typeof severity;
      }

      const adaptDays = ADAPTATION_DAYS[severity] ?? 0;
      const preAdaptationStartDate = adaptDays > 0
        ? addDaysToISO(dateISO, -adaptDays)
        : dateISO;

      const daysUntilTransition = daysBetweenISO(todayISO, dateISO);

      // Only include transitions within the lookahead window and in the future
      if (daysUntilTransition >= 0 && daysUntilTransition <= lookAheadDays) {
        predictions.push({
          transitionDate: dateISO,
          transitionType,
          severityScore: tss,
          severity,
          preAdaptationStartDate,
          protocolType: selectProtocolType(severity, transitionType),
          predictedAlertnesNadir: alertnessNadir,
          daysUntilTransition,
        });
      }
    }

    prevType = currType;
  }

  // Sort by soonest first
  predictions.sort((a, b) => a.transitionDate.localeCompare(b.transitionDate));

  return predictions;
}

/**
 * Build a day-by-day pre-adaptation protocol for a given TransitionPrediction.
 *
 * Distributes total phase shift evenly across adaptation days.
 * Maximum 90 min/day per Eastman & Burgess (2009).
 *
 * @param prediction The transition to prepare for
 * @param today      Reference date (defaults to now)
 */
export function buildPreAdaptationProtocol(
  prediction: TransitionPrediction,
  today: Date = new Date(),
): PreAdaptationStep[] {
  const { transitionDate, transitionType, preAdaptationStartDate } = prediction;

  const startDate = new Date(preAdaptationStartDate + 'T00:00:00');
  const endDate = new Date(transitionDate + 'T00:00:00');

  // Effective start = later of preAdaptationStartDate or today
  const effectiveStart = startDate < today ? today : startDate;
  const daysAvailable = Math.round(
    (endDate.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysAvailable <= 0) return [];

  const totalPhaseShiftHours = PHASE_SHIFT_HOURS[transitionType] ?? 4;
  const totalShiftMinutes = totalPhaseShiftHours * 60;

  // Distribute shift evenly, cap at 90 min/day
  const idealPerDay = totalShiftMinutes / daysAvailable;
  const shiftPerDay = Math.min(idealPerDay, 90);

  // Determine direction (delay = positive minutes, advance = negative)
  const isDelay = transitionType === 'day-to-night' ||
    transitionType === 'evening-to-night' ||
    transitionType === 'off-to-night' ||
    transitionType === 'off-to-extended';
  const shiftDirection = isDelay ? 1 : -1;
  const shiftMinutes = Math.round(shiftPerDay) * shiftDirection;

  const steps: PreAdaptationStep[] = [];

  for (let i = 0; i < daysAvailable; i++) {
    const stepDate = new Date(effectiveStart.getTime() + i * 24 * 60 * 60 * 1000);
    const dateISO = stepDate.toISOString().slice(0, 10);
    const dayNum = i + 1;
    const cumulativeHours = (shiftMinutes * dayNum) / 60;

    let action: string;

    if (isDelay) {
      // Delaying clock (day→night transition)
      if (i === 0) {
        action = 'Seek bright light in the evening (8–10 PM) to begin delaying your clock. Dim lights after 11 PM.';
      } else if (i < daysAvailable - 1) {
        action = `Extend evening bright light by ${Math.abs(shiftMinutes)} min. Shift bedtime ${Math.abs(cumulativeHours).toFixed(1)}h later than baseline.`;
      } else {
        action = 'Final pre-adaptation day. Consider a 90-min nap before your first night shift to top up alertness.';
      }
    } else {
      // Advancing clock (night→day transition)
      if (i === 0) {
        action = 'Get bright sunlight within 30 min of waking — this is the most powerful clock-advance signal.';
      } else if (i < daysAvailable - 1) {
        action = `Morning bright light immediately after waking. Advance bedtime ${Math.abs(cumulativeHours).toFixed(1)}h earlier than baseline.`;
      } else {
        action = 'Final pre-adaptation day. Avoid light after 9 PM to protect melatonin onset for your day schedule.';
      }
    }

    steps.push({ date: dateISO, action, shiftMinutes });
  }

  return steps;
}
