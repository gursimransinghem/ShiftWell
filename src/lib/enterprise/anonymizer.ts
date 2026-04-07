/**
 * HIPAA Safe Harbor de-identification and differential privacy.
 * Phase 27 — Outcome Data Pipeline
 *
 * Implements:
 *  - stripPII: removes name, email, employeeId, deviceId, userId
 *  - safeHarborStrip: removes all 18 HIPAA Safe Harbor identifiers
 *  - laplaceSample: Laplace noise via inverse CDF
 *  - applyDifferentialPrivacy: adds Laplace noise with sensitivity/epsilon scale
 *  - shouldApplyDP: returns true when cohortSize < threshold
 *
 * Reference: 45 CFR §164.514(b)(2) — Safe Harbor method
 */

import { UserRecord, DifferentialPrivacyConfig } from './types';

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
 * @param value - The true aggregate value
 * @param config - DP configuration: epsilon, sensitivity, cohortThreshold
 * @returns Noisy value clamped to [0, 100]
 */
export function applyDifferentialPrivacy(
  value: number,
  config: DifferentialPrivacyConfig
): number {
  const scale = config.sensitivity / config.epsilon;
  const noise = laplaceSample(scale);
  const noisy = value + noise;
  // Clamp to [0, 100] — valid for recovery score queries
  return Math.max(0, Math.min(100, noisy));
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
