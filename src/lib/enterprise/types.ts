/**
 * Enterprise data pipeline types.
 * Phase 27 — Outcome Data Pipeline
 * HIPAA Safe Harbor de-identification + differential privacy for employer dashboard.
 */

export interface UserRecord {
  userId: string;
  name?: string;
  email?: string;
  employeeId?: string;
  deviceId?: string;
  recoveryScores: number[];      // daily scores, last 30 days (0-100)
  adherenceDays: boolean[];      // daily adherence flags, last 30 days
  debtBalance: number;           // current sleep debt in minutes
  shiftType: 'day' | 'evening' | 'night' | 'rotating';
  orgId: string;
}

export interface CohortMetrics {
  orgId: string;
  cohortSize: number;
  avgRecoveryScore: number;        // 0-100
  adherenceRate: number;           // 0-1
  avgDebtBalance: number;          // minutes
  p25RecoveryScore: number;        // 25th percentile recovery score
  p75RecoveryScore: number;        // 75th percentile recovery score
  lowRecoveryWorkerPct: number;    // fraction with avg score < 40
  periodStart: string;             // ISO date
  periodEnd: string;               // ISO date
}

export interface AnonymizedExport {
  metadata: {
    orgId: string;
    generatedAt: string;
    cohortSize: number;
    dpApplied: boolean;
    epsilon?: number;
  };
  metrics: CohortMetrics;
}

export interface DifferentialPrivacyConfig {
  epsilon: number;          // default 1.0
  sensitivity: number;      // global sensitivity of query (context-dependent)
  cohortThreshold: number;  // apply DP when cohort < this value (default 50)
}
