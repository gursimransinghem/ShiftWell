/**
 * Enterprise data pipeline types.
 * Phase 27 — Outcome Data Pipeline
 *
 * Defines the type contracts for:
 *  - UserRecord: per-user data collected by the app (may contain PII — server-side only)
 *  - CohortMetrics: anonymized aggregate metrics suitable for employer dashboard
 *  - AnonymizedExport: full export payload including metadata about DP application
 *  - DifferentialPrivacyConfig: configuration for Laplace mechanism noise injection
 *
 * HIPAA Note: UserRecord is never transmitted to employers. Only AnonymizedExport
 * (containing CohortMetrics) crosses the server → employer boundary.
 * Reference: 45 CFR §164.514(b) Safe Harbor; HIPAA-COMPLIANCE-ASSESSMENT.md
 */

/**
 * Per-user data record maintained server-side.
 * Contains PII fields (name, email, employeeId, deviceId) that must be stripped
 * via anonymizer.stripPII() or anonymizer.safeHarborStrip() before any export.
 */
export interface UserRecord {
  userId: string;
  name?: string;
  email?: string;
  employeeId?: string;
  deviceId?: string;
  /** Daily recovery scores, last 30 days. Range: 0-100. */
  recoveryScores: number[];
  /** Daily adherence flags — true if user followed recommended sleep window. */
  adherenceDays: boolean[];
  /** Current cumulative sleep debt in minutes. */
  debtBalance: number;
  shiftType: 'day' | 'evening' | 'night' | 'rotating';
  orgId: string;
}

/**
 * Anonymized cohort-level aggregate metrics for employer dashboard.
 * All fields are aggregates — no individual-level data.
 * Maps to ENTERPRISE-OUTCOMES-FRAMEWORK.md section 2 (primary metrics).
 */
export interface CohortMetrics {
  orgId: string;
  cohortSize: number;
  /** Cohort mean recovery score. Range: 0-100. */
  avgRecoveryScore: number;
  /** Cohort mean adherence rate. Range: 0-1. */
  adherenceRate: number;
  /** Cohort mean sleep debt balance in minutes. */
  avgDebtBalance: number;
  /** 25th percentile of per-user average recovery scores. */
  p25RecoveryScore: number;
  /** 75th percentile of per-user average recovery scores. */
  p75RecoveryScore: number;
  /** Fraction of workers whose average recovery score is below 40 (high-risk threshold). */
  lowRecoveryWorkerPct: number;
  /** ISO date string: start of reporting period. */
  periodStart: string;
  /** ISO date string: end of reporting period. */
  periodEnd: string;
}

/**
 * Full anonymized export payload.
 * Transmitted via employer dashboard API (Phase 28) and REST API (Phase 29).
 */
export interface AnonymizedExport {
  metadata: {
    orgId: string;
    /** ISO datetime string when this export was generated. */
    generatedAt: string;
    cohortSize: number;
    /** True if Laplace differential privacy noise was applied. */
    dpApplied: boolean;
    /** Epsilon value used for DP (only present when dpApplied=true). */
    epsilon?: number;
  };
  metrics: CohortMetrics;
}

/**
 * Configuration for the Laplace differential privacy mechanism.
 * Reference: HIPAA-COMPLIANCE-ASSESSMENT.md §3.3
 * Recommended: epsilon=1.0, cohortThreshold=50.
 */
export interface DifferentialPrivacyConfig {
  /** Privacy budget. Lower = more privacy, higher noise. Recommended: 1.0. */
  epsilon: number;
  /** Global sensitivity — maximum change to statistic from adding/removing one user. */
  sensitivity: number;
  /** Apply DP when cohort size is strictly below this value. Default: 50. */
  cohortThreshold: number;
}
