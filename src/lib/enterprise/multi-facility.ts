/**
 * Multi-facility enterprise support.
 * Phase 38 — Advanced Platform Features
 *
 * Provides per-facility CohortMetrics aggregation and cross-facility comparison.
 * Calls buildCohortMetrics from aggregator for each facility independently.
 *
 * HIPAA Note: UserRecord is never transmitted externally. Only CohortMetrics
 * (anonymized aggregates) are exposed via FacilityMetrics. Per HIPAA §164.514(b).
 *
 * Scientific references:
 * - Folkard & Tucker (2003): shift pattern adaptation metrics
 * - Eastman & Burgess (2009): circadian disruption scoring
 */

import { UserRecord, DifferentialPrivacyConfig } from './types';
import { buildCohortMetrics } from './aggregator';

export interface FacilityConfig {
  facilityId: string;
  facilityName: string;
  location?: string;
}

export interface FacilityMetrics {
  facility: FacilityConfig;
  /** Anonymized aggregate metrics for this facility's cohort. */
  metrics: ReturnType<typeof buildCohortMetrics>['metrics'];
  /** True if differential privacy noise was applied to this facility's metrics. */
  dpApplied: boolean;
  /** Rank among all facilities by avgRecoveryScore (1 = best). Set by getFacilityRanking. */
  rank?: number;
}

export interface CrossFacilityReport {
  facilities: FacilityMetrics[];
  bestPerforming: FacilityMetrics;
  worstPerforming: FacilityMetrics;
  /** Weighted average recovery score across all facilities (weighted by cohort size). */
  networkAvgRecoveryScore: number;
  /** Weighted average adherence rate across all facilities. */
  networkAdherenceRate: number;
  /** ISO datetime string when this report was generated. */
  generatedAt: string;
}

/**
 * Build a cross-facility report by computing CohortMetrics for each facility's users.
 *
 * Steps:
 * 1. For each facility, call buildCohortMetrics on that facility's users
 * 2. Compute network-wide weighted averages
 * 3. Identify best and worst performing facility by avgRecoveryScore
 * 4. Assign ranks
 *
 * @param facilityUserMap - Map from FacilityConfig to that facility's UserRecord[]
 * @param config - Differential privacy configuration
 * @param period - Reporting period {start, end} as ISO date strings
 */
export function buildMultiFacilityReport(
  facilityUserMap: Map<FacilityConfig, UserRecord[]>,
  config: DifferentialPrivacyConfig,
  period: { start: string; end: string }
): CrossFacilityReport {
  const facilityMetricsList: FacilityMetrics[] = [];

  for (const [facility, users] of facilityUserMap.entries()) {
    const export_ = buildCohortMetrics(users, config, period);
    facilityMetricsList.push({
      facility,
      metrics: export_.metrics,
      dpApplied: export_.metadata.dpApplied,
    });
  }

  // Compute weighted network averages
  const totalWorkers = facilityMetricsList.reduce(
    (sum, f) => sum + f.metrics.cohortSize,
    0
  );

  let networkAvgRecoveryScore = 0;
  let networkAdherenceRate = 0;

  if (totalWorkers > 0) {
    networkAvgRecoveryScore =
      facilityMetricsList.reduce(
        (sum, f) => sum + f.metrics.avgRecoveryScore * f.metrics.cohortSize,
        0
      ) / totalWorkers;

    networkAdherenceRate =
      facilityMetricsList.reduce(
        (sum, f) => sum + f.metrics.adherenceRate * f.metrics.cohortSize,
        0
      ) / totalWorkers;
  }

  // Identify best and worst by avgRecoveryScore
  const sorted = [...facilityMetricsList].sort(
    (a, b) => b.metrics.avgRecoveryScore - a.metrics.avgRecoveryScore
  );

  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  // Assign ranks
  sorted.forEach((f, idx) => {
    f.rank = idx + 1;
  });

  return {
    facilities: facilityMetricsList,
    bestPerforming: best,
    worstPerforming: worst,
    networkAvgRecoveryScore,
    networkAdherenceRate,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Sort facilities by avgRecoveryScore descending and assign rank 1..N.
 *
 * @param facilities - Array of FacilityMetrics (from buildMultiFacilityReport or fresh)
 * @returns New array sorted descending with rank fields set
 */
export function getFacilityRanking(facilities: FacilityMetrics[]): FacilityMetrics[] {
  const sorted = [...facilities].sort(
    (a, b) => b.metrics.avgRecoveryScore - a.metrics.avgRecoveryScore
  );

  sorted.forEach((f, idx) => {
    f.rank = idx + 1;
  });

  return sorted;
}

/**
 * Identify the best and worst performing facilities and compute the performance gap.
 *
 * @param facilities - Array of FacilityMetrics
 * @returns { best, worst, gap } where gap = best.avgRecoveryScore - worst.avgRecoveryScore
 */
export function getCrossFacilityComparison(
  facilities: FacilityMetrics[]
): { best: FacilityMetrics; worst: FacilityMetrics; gap: number } {
  if (facilities.length === 0) {
    throw new Error('getCrossFacilityComparison requires at least one facility');
  }

  const sorted = [...facilities].sort(
    (a, b) => b.metrics.avgRecoveryScore - a.metrics.avgRecoveryScore
  );

  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const gap = best.metrics.avgRecoveryScore - worst.metrics.avgRecoveryScore;

  return { best, worst, gap };
}
