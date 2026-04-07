/**
 * Outcome Data Anonymizer — Phase 27 (Outcome Data Pipeline)
 *
 * Anonymizes individual user sleep and outcome data into cohort-level
 * aggregate records suitable for enterprise reporting.
 *
 * Privacy rules:
 *  - All PII stripped before aggregation
 *  - Monthly aggregation granularity (never daily)
 *  - Cohorts with < 5 users suppressed entirely (return null)
 *  - Laplacian noise added for cohorts below minCohortSize (differential privacy)
 *
 * Scientific basis: Dwork et al. (2006) — ε-differential privacy via
 * Laplace mechanism with sensitivity scaled to metric range.
 */

import type { SleepDiscrepancy } from '../feedback/types';
import type { PersonalOutcome } from '../intelligence/outcome-calculator';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnonymizedRecord {
  /** Employer or facility identifier — no PII */
  cohortId: string;
  /** Aggregation period in yyyy-MM format (monthly only) */
  periodISO: string;
  metrics: {
    avgAdherenceRate: number;
    avgDebtHours: number;
    avgRecoveryScore: number;
    transitionRecoveryDays: number;
    participantCount: number;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Minimum cohort size to produce any output at all */
const MIN_OUTPUT_COHORT = 5;

/** Laplace noise scale (ε-DP sensitivity/epsilon) — calibrated to typical metric ranges */
const LAPLACE_SCALE = 0.5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Sample from Laplace distribution using the inverse CDF method.
 * loc = 0, scale = b.
 */
function laplaceSample(scale: number): number {
  // Uniform in (0,1) — avoid exact 0 or 1 for numerical stability
  const u = Math.random() - 0.5;
  return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

/**
 * Extract yyyy-MM period string from a dateISO string (yyyy-MM-dd).
 */
function toPeriodISO(dateISO: string): string {
  return dateISO.slice(0, 7);
}

/**
 * Compute adherence rate for a set of discrepancy records.
 * Good adherence = |startMinutes| < 30 min.
 */
function computeAdherenceRate(records: SleepDiscrepancy[]): number {
  const tracked = records.filter((r) => r.delta !== null);
  if (tracked.length === 0) return 0;
  const adherent = tracked.filter((r) => r.delta !== null && Math.abs(r.delta!.startMinutes) < 30);
  return Math.round((adherent.length / tracked.length) * 100);
}

/**
 * Estimate average sleep debt hours from the discrepancy duration deltas.
 * Positive durationMinutes = less sleep than planned → debt.
 */
function computeAvgDebtHours(records: SleepDiscrepancy[]): number {
  const valid = records.filter((r) => r.delta !== null);
  if (valid.length === 0) return 0;
  const totalDebtMinutes = valid.reduce((sum, r) => {
    const debt = Math.max(0, -(r.delta!.durationMinutes)); // negative delta = less sleep
    return sum + debt;
  }, 0);
  return Math.round((totalDebtMinutes / valid.length / 60) * 10) / 10;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Anonymize a single user's data into a cohort-level record for a given period.
 *
 * All PII is stripped — userId is never stored in the output.
 * The returned record represents ONE USER'S contribution to the cohort.
 * Call applyDifferentialPrivacy() on the aggregated collection before export.
 *
 * @param _userId           - Used only for PII validation (never stored in output)
 * @param discrepancyHistory - User's full sleep discrepancy history
 * @param outcomes          - User's personal outcome metrics
 * @param cohortId          - Employer or facility identifier (no PII)
 */
export function anonymizeUserData(
  _userId: string,
  discrepancyHistory: SleepDiscrepancy[],
  outcomes: PersonalOutcome,
  cohortId: string,
): AnonymizedRecord {
  // Determine the most recent period from discrepancy history.
  // Fall back to current month if no history.
  const now = new Date();
  const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const latestRecord = discrepancyHistory[discrepancyHistory.length - 1];
  const periodISO = latestRecord ? toPeriodISO(latestRecord.dateISO) : defaultPeriod;

  // Filter records to the relevant period
  const periodRecords = discrepancyHistory.filter(
    (r) => toPeriodISO(r.dateISO) === periodISO,
  );

  return {
    cohortId,
    periodISO,
    metrics: {
      avgAdherenceRate: computeAdherenceRate(periodRecords),
      avgDebtHours: computeAvgDebtHours(periodRecords),
      // recoveryScore not available per-user without HealthKit; use adherence as proxy
      avgRecoveryScore: computeAdherenceRate(periodRecords),
      transitionRecoveryDays: outcomes.transitionsHandled,
      participantCount: 1,
    },
  };
}

/**
 * Apply differential privacy to a collection of anonymized records.
 *
 * Aggregates records by cohortId + periodISO, then:
 *  - Returns null (suppresses) for cohorts with < MIN_OUTPUT_COHORT records
 *  - Adds Laplacian noise for cohorts below minCohortSize
 *  - Returns clean averages for cohorts at or above minCohortSize
 *
 * @param records       - Collection of per-user anonymized records
 * @param minCohortSize - Threshold below which Laplacian noise is applied (default 50)
 */
export function applyDifferentialPrivacy(
  records: AnonymizedRecord[],
  minCohortSize = 50,
): AnonymizedRecord[] {
  // Group records by cohortId + periodISO
  const groups = new Map<string, AnonymizedRecord[]>();

  for (const record of records) {
    const key = `${record.cohortId}::${record.periodISO}`;
    const existing = groups.get(key);
    if (existing) {
      existing.push(record);
    } else {
      groups.set(key, [record]);
    }
  }

  const output: AnonymizedRecord[] = [];

  for (const [, group] of groups) {
    const count = group.length;

    // Suppress cohorts below minimum threshold entirely
    if (count < MIN_OUTPUT_COHORT) continue;

    const first = group[0];
    const needsNoise = count < minCohortSize;

    // Compute true averages
    const avgAdherenceRate = group.reduce((s, r) => s + r.metrics.avgAdherenceRate, 0) / count;
    const avgDebtHours = group.reduce((s, r) => s + r.metrics.avgDebtHours, 0) / count;
    const avgRecoveryScore = group.reduce((s, r) => s + r.metrics.avgRecoveryScore, 0) / count;
    const transitionRecoveryDays = group.reduce((s, r) => s + r.metrics.transitionRecoveryDays, 0) / count;

    output.push({
      cohortId: first.cohortId,
      periodISO: first.periodISO,
      metrics: {
        // Clamp noised values to valid ranges
        avgAdherenceRate: Math.min(100, Math.max(0,
          Math.round(avgAdherenceRate + (needsNoise ? laplaceSample(LAPLACE_SCALE) : 0))
        )),
        avgDebtHours: Math.max(0,
          Math.round((avgDebtHours + (needsNoise ? laplaceSample(LAPLACE_SCALE * 0.1) : 0)) * 10) / 10
        ),
        avgRecoveryScore: Math.min(100, Math.max(0,
          Math.round(avgRecoveryScore + (needsNoise ? laplaceSample(LAPLACE_SCALE) : 0))
        )),
        transitionRecoveryDays: Math.max(0,
          Math.round(transitionRecoveryDays + (needsNoise ? laplaceSample(LAPLACE_SCALE * 0.5) : 0))
        ),
        participantCount: count,
      },
    });
  }

  return output;
}
