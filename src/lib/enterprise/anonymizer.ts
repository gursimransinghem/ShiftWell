/**
 * HIPAA Safe Harbor de-identification and differential privacy.
 * Phase 27 — Outcome Data Pipeline
 *
 * Implements:
 *  - stripPII: removes name, email, employeeId, deviceId, userId
 *  - safeHarborStrip: removes all 18 HIPAA Safe Harbor identifiers
 *  - laplaceSample: Laplace noise via inverse CDF
 *  - applyDifferentialPrivacy: (overloaded)
 *      - (value, config) → noisy number (used by aggregator)
 *      - (records, minCohortSize) → aggregated AnonymizedRecord[] (used by pipeline)
 *  - shouldApplyDP: returns true when cohortSize < threshold
 *  - anonymizeUserData: convert per-user data into a single AnonymizedRecord
 *
 * Reference: 45 CFR §164.514(b)(2) — Safe Harbor method
 */

import { UserRecord, DifferentialPrivacyConfig } from './types';
import type { SleepDiscrepancy } from '../feedback/types';
import type { PersonalOutcome } from '../intelligence/outcome-calculator';

/**
 * HIPAA Safe Harbor 18 identifiers (45 CFR §164.514(b)(2)).
 * Any key matching these strings is considered a PHI identifier.
 */
const SAFE_HARBOR_FIELDS: ReadonlySet<string> = new Set([
  'name', 'email', 'phone', 'fax', 'address', 'city', 'zip', 'county',
  'preciseDate', 'age', 'ssn', 'mrn', 'healthPlanId', 'accountNumber',
  'certificateId', 'deviceId', 'vehicleId', 'biometricId', 'photo', 'ipAddress',
  'employeeId', 'dob', 'userId',
]);

/**
 * Anonymized record for a single user, keyed by cohort and period.
 * Contains only aggregate-safe metrics — no PII.
 */
export interface AnonymizedRecord {
  cohortId: string;
  periodISO: string;
  metrics: {
    avgAdherenceRate: number;
    avgDebtHours: number;
    avgRecoveryScore: number;
    transitionRecoveryDays: number;
    participantCount: number;
  };
}

/**
 * Remove direct PII identifiers from a UserRecord.
 * Returns a new object without userId, name, email, employeeId, deviceId.
 * Does not mutate the input.
 */
export function stripPII(
  record: UserRecord
): Omit<UserRecord, 'name' | 'email' | 'employeeId' | 'deviceId' | 'userId'> {
  const { userId: _userId, name: _name, email: _email, employeeId: _eid, deviceId: _did, ...safe } = record;
  return safe;
}

/**
 * Remove all HIPAA Safe Harbor identifiers from an arbitrary record.
 * Returns a shallow copy with identified fields removed. Does not mutate input.
 */
export function safeHarborStrip<T extends Record<string, unknown>>(record: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key in record) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      if (!SAFE_HARBOR_FIELDS.has(key)) {
        result[key] = record[key];
      }
    }
  }
  return result;
}

/**
 * Sample from the Laplace distribution with given scale parameter b.
 * Uses the inverse CDF method: X = -b * sign(U) * ln(1 - 2|U|)
 * where U ~ Uniform(-0.5, 0.5).
 *
 * @param scale - Scale parameter b (= sensitivity / epsilon)
 */
export function laplaceSample(scale: number): number {
  // U in (-0.5, 0.5) — use uniform random in (0, 1) mapped to (-0.5, 0.5)
  const u = Math.random() - 0.5;
  // Inverse CDF: -b * sign(u) * ln(1 - 2|u|)
  const sign = u < 0 ? -1 : 1;
  return -scale * sign * Math.log(1 - 2 * Math.abs(u));
}

/**
 * Apply Laplace differential privacy noise to a numeric value.
 * Adds Laplace noise with scale = sensitivity / epsilon.
 * Result is clamped to [0, 100] to remain in valid recovery score range.
 *
 * Overload 1: single-value DP (used by aggregator.ts)
 * @param value - The true aggregate value
 * @param config - DP configuration: epsilon, sensitivity, cohortThreshold
 * @returns Noisy value clamped to [0, 100]
 *
 * Overload 2: cohort aggregation with DP (used by outcome pipeline)
 * @param records - Array of AnonymizedRecord from individual users
 * @param minCohortSize - Suppress cohorts with fewer than this many members;
 *                        apply Laplacian noise to cohorts below this threshold
 * @returns Aggregated records per cohort, with suppressed small cohorts removed
 */
export function applyDifferentialPrivacy(value: number, config: DifferentialPrivacyConfig): number;
export function applyDifferentialPrivacy(records: AnonymizedRecord[], minCohortSize: number): AnonymizedRecord[];
export function applyDifferentialPrivacy(
  valueOrRecords: number | AnonymizedRecord[],
  configOrMinCohort: DifferentialPrivacyConfig | number,
): number | AnonymizedRecord[] {
  // Overload 1: single numeric value
  if (typeof valueOrRecords === 'number') {
    const config = configOrMinCohort as DifferentialPrivacyConfig;
    const scale = config.sensitivity / config.epsilon;
    const noise = laplaceSample(scale);
    const noisy = valueOrRecords + noise;
    return Math.max(0, Math.min(100, noisy));
  }

  // Overload 2: cohort aggregation
  const records = valueOrRecords;
  const minCohortSize = configOrMinCohort as number;
  const MIN_SUPPRESS = 5; // Always suppress cohorts with fewer than 5 members

  // Group records by cohortId
  const groups = new Map<string, AnonymizedRecord[]>();
  for (const rec of records) {
    const group = groups.get(rec.cohortId) ?? [];
    group.push(rec);
    groups.set(rec.cohortId, group);
  }

  const output: AnonymizedRecord[] = [];

  for (const [cohortId, members] of groups.entries()) {
    const count = members.length;

    // Suppress cohorts with fewer than MIN_SUPPRESS members
    if (count < MIN_SUPPRESS) continue;

    const periodISO = members[0].periodISO;
    const avgAdherence = members.reduce((s, r) => s + r.metrics.avgAdherenceRate, 0) / count;
    const avgDebt = members.reduce((s, r) => s + r.metrics.avgDebtHours, 0) / count;
    const avgRecovery = members.reduce((s, r) => s + r.metrics.avgRecoveryScore, 0) / count;
    const avgTransition = members.reduce((s, r) => s + r.metrics.transitionRecoveryDays, 0) / count;

    // Apply Laplacian noise when cohort is below minCohortSize threshold
    const applyNoise = count < minCohortSize;
    const noisyAdherence = applyNoise
      ? Math.max(0, Math.min(100, avgAdherence + laplaceSample(10)))
      : avgAdherence;

    output.push({
      cohortId,
      periodISO,
      metrics: {
        avgAdherenceRate: noisyAdherence,
        avgDebtHours: avgDebt,
        avgRecoveryScore: avgRecovery,
        transitionRecoveryDays: avgTransition,
        participantCount: count,
      },
    });
  }

  return output;
}

/**
 * Determine whether differential privacy should be applied.
 * Returns true when cohortSize is strictly less than threshold.
 *
 * @param cohortSize - Number of users in the cohort
 * @param threshold - Cohort size threshold (default: 50)
 */
export function shouldApplyDP(cohortSize: number, threshold = 50): boolean {
  return cohortSize < threshold;
}

/**
 * Convert per-user data into a single AnonymizedRecord for cohort aggregation.
 * Strips all PII — only aggregate metrics survive.
 *
 * @param _userId - User ID (stripped, never stored in output)
 * @param history - Sleep discrepancy history
 * @param outcome - Personal outcome metrics
 * @param cohortId - Cohort identifier (e.g. facility or org ID)
 * @returns A single AnonymizedRecord representing this user's contribution
 */
export function anonymizeUserData(
  _userId: string,
  history: SleepDiscrepancy[],
  outcome: PersonalOutcome,
  cohortId: string,
): AnonymizedRecord {
  // Derive period from latest history record, or fall back to current month
  let periodISO: string;
  if (history.length > 0) {
    const sorted = [...history].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    const latest = sorted[sorted.length - 1].dateISO; // 'YYYY-MM-DD'
    periodISO = latest.slice(0, 7); // 'YYYY-MM'
  } else {
    const now = new Date();
    periodISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  return {
    cohortId,
    periodISO,
    metrics: {
      avgAdherenceRate: outcome.adherenceRate,
      avgDebtHours: outcome.debtReduction,
      avgRecoveryScore: outcome.sleepImprovement,
      transitionRecoveryDays: outcome.transitionsHandled,
      participantCount: 1,
    },
  };
}
