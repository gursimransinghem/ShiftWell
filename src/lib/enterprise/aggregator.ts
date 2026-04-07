/**
 * Cohort aggregator — builds employer-safe aggregate metrics.
 * Phase 27 — Outcome Data Pipeline
 *
 * Implements:
 *  - percentile: compute p-th percentile of a numeric array
 *  - buildCohortMetrics: aggregate UserRecord[] → AnonymizedExport
 *  - toJSON: serialize AnonymizedExport to JSON string
 *  - toCSV: serialize AnonymizedExport to CSV string
 *
 * DP is applied server-side before results are serialized.
 * Aggregator calls anonymizer for privacy guarantees (key_link: anonymizer.ts → aggregator.ts).
 *
 * Reference: ENTERPRISE-OUTCOMES-FRAMEWORK.md metrics schema
 *            HIPAA-COMPLIANCE-ASSESSMENT.md DP specification
 */

import { UserRecord, CohortMetrics, AnonymizedExport, DifferentialPrivacyConfig } from './types';
import { applyDifferentialPrivacy, shouldApplyDP, laplaceSample } from './anonymizer';

/**
 * Compute the p-th percentile of an array of numbers using linear interpolation.
 *
 * @param values - Array of numbers (unsorted is fine; will be sorted internally)
 * @param p - Percentile (0-100)
 * @returns The value at the p-th percentile
 */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];

  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) return sorted[lower];

  // Linear interpolation
  const fraction = index - lower;
  return sorted[lower] + fraction * (sorted[upper] - sorted[lower]);
}

/**
 * Compute per-user average recovery score from their last 30 days of data.
 */
function userAvgRecovery(user: UserRecord): number {
  if (user.recoveryScores.length === 0) return 0;
  return user.recoveryScores.reduce((sum, s) => sum + s, 0) / user.recoveryScores.length;
}

/**
 * Compute per-user adherence rate from their daily flags.
 */
function userAdherenceRate(user: UserRecord): number {
  if (user.adherenceDays.length === 0) return 0;
  const adherentCount = user.adherenceDays.filter(Boolean).length;
  return adherentCount / user.adherenceDays.length;
}

/**
 * Build cohort metrics from a list of UserRecords.
 *
 * Steps:
 * 1. Compute per-user metrics (avg recovery score, adherence rate, debt balance)
 * 2. Aggregate to cohort means
 * 3. Compute p25/p75 recovery score distribution
 * 4. Compute lowRecoveryWorkerPct (fraction with avg score < 40)
 * 5. Apply differential privacy to numeric metrics if cohort < threshold
 * 6. Return AnonymizedExport with metadata (dpApplied, epsilon)
 *
 * @param users - Array of UserRecord (may include PII; not transmitted externally)
 * @param config - Differential privacy configuration
 * @param period - Reporting period {start, end} as ISO date strings
 */
export function buildCohortMetrics(
  users: UserRecord[],
  config: DifferentialPrivacyConfig,
  period: { start: string; end: string }
): AnonymizedExport {
  const cohortSize = users.length;
  const orgId = users.length > 0 ? users[0].orgId : '';

  // Empty cohort — return zeros
  if (cohortSize === 0) {
    const metrics: CohortMetrics = {
      orgId,
      cohortSize: 0,
      avgRecoveryScore: 0,
      adherenceRate: 0,
      avgDebtBalance: 0,
      p25RecoveryScore: 0,
      p75RecoveryScore: 0,
      lowRecoveryWorkerPct: 0,
      periodStart: period.start,
      periodEnd: period.end,
    };
    return {
      metadata: {
        orgId,
        generatedAt: new Date().toISOString(),
        cohortSize: 0,
        dpApplied: false,
      },
      metrics,
    };
  }

  // 1. Per-user metrics
  const perUserAvgScores = users.map(userAvgRecovery);
  const perUserAdherence = users.map(userAdherenceRate);
  const perUserDebt = users.map(u => u.debtBalance);

  // 2. Cohort means
  const rawAvgRecovery = perUserAvgScores.reduce((sum, s) => sum + s, 0) / cohortSize;
  const rawAdherenceRate = perUserAdherence.reduce((sum, r) => sum + r, 0) / cohortSize;
  const rawAvgDebt = perUserDebt.reduce((sum, d) => sum + d, 0) / cohortSize;

  // 3. p25 / p75 recovery score distribution across per-user averages
  const p25 = percentile(perUserAvgScores, 25);
  const p75 = percentile(perUserAvgScores, 75);

  // 4. lowRecoveryWorkerPct — fraction of users whose average recovery score < 40
  const lowCount = perUserAvgScores.filter(s => s < 40).length;
  const lowRecoveryWorkerPct = lowCount / cohortSize;

  // 5. Apply differential privacy when cohort is small
  const applyDP = shouldApplyDP(cohortSize, config.cohortThreshold);
  let avgRecoveryScore = rawAvgRecovery;
  let adherenceRate = rawAdherenceRate;
  let avgDebtBalance = rawAvgDebt;

  if (applyDP) {
    // Recovery score: sensitivity=100, clamp [0,100]
    avgRecoveryScore = applyDifferentialPrivacy(rawAvgRecovery, {
      epsilon: config.epsilon,
      sensitivity: 100,
      cohortThreshold: config.cohortThreshold,
    });

    // Adherence rate: sensitivity=1, clamp [0,1]
    const adherenceScale = 1 / config.epsilon;
    const noisyAdherence = rawAdherenceRate + laplaceSample(adherenceScale);
    adherenceRate = Math.max(0, Math.min(1, noisyAdherence));

    // Sleep debt: sensitivity=480 (8 hours in minutes), clamp [0, Infinity)
    const debtScale = 480 / config.epsilon;
    const noisyDebt = rawAvgDebt + laplaceSample(debtScale);
    avgDebtBalance = Math.max(0, noisyDebt);
  }

  const metrics: CohortMetrics = {
    orgId,
    cohortSize,
    avgRecoveryScore,
    adherenceRate,
    avgDebtBalance,
    p25RecoveryScore: p25,
    p75RecoveryScore: p75,
    lowRecoveryWorkerPct,
    periodStart: period.start,
    periodEnd: period.end,
  };

  return {
    metadata: {
      orgId,
      generatedAt: new Date().toISOString(),
      cohortSize,
      dpApplied: applyDP,
      ...(applyDP ? { epsilon: config.epsilon } : {}),
    },
    metrics,
  };
}

/**
 * Serialize an AnonymizedExport to a formatted JSON string.
 * Matches the expected API response shape for the employer dashboard.
 */
export function toJSON(data: AnonymizedExport): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Serialize an AnonymizedExport to a CSV string.
 *
 * Header row: orgId,cohortSize,periodStart,periodEnd,avgRecoveryScore,adherenceRate,
 *             avgDebtBalance,p25RecoveryScore,p75RecoveryScore,lowRecoveryWorkerPct,dpApplied
 * Data row: corresponding values with dpApplied as "true" or "false"
 *
 * @returns Complete CSV string with \n line endings
 */
export function toCSV(data: AnonymizedExport): string {
  const { metrics, metadata } = data;
  const header = [
    'orgId', 'cohortSize', 'periodStart', 'periodEnd',
    'avgRecoveryScore', 'adherenceRate', 'avgDebtBalance',
    'p25RecoveryScore', 'p75RecoveryScore', 'lowRecoveryWorkerPct', 'dpApplied',
  ].join(',');

  const row = [
    metrics.orgId,
    metrics.cohortSize,
    metrics.periodStart,
    metrics.periodEnd,
    metrics.avgRecoveryScore.toFixed(4),
    metrics.adherenceRate.toFixed(4),
    metrics.avgDebtBalance.toFixed(4),
    metrics.p25RecoveryScore.toFixed(4),
    metrics.p75RecoveryScore.toFixed(4),
    metrics.lowRecoveryWorkerPct.toFixed(4),
    metadata.dpApplied ? 'true' : 'false',
  ].join(',');

  return `${header}\n${row}\n`;
}
