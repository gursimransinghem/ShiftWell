/**
 * ShiftWell Enterprise API — Outcomes Pull Endpoint
 *
 * GET /v1/outcomes
 *
 * Returns anonymized cohort-level sleep and recovery metrics for the
 * requesting organization over a specified date range.
 *
 * Privacy guarantees:
 *   - Cohorts < 5 workers: 204 suppressed (no data returned)
 *   - Cohorts 5-49 workers: Laplace differential privacy noise applied (ε=1.0)
 *   - Cohorts ≥ 50 workers: clean aggregate, no noise
 *   - No individual-level data ever returned
 *
 * Differential privacy: Laplace mechanism (Dwork et al. 2006)
 * HIPAA basis: Safe Harbor de-identification standard (45 CFR §164.514(b))
 *
 * Phase 29 — API Layer (ENT-06)
 */

import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import type { Request, Response } from 'express';
import type { CohortMetrics, OutcomesResponse } from '../types/api';
import { authenticate, requireScope } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';

// ─── Query Params Schema ───────────────────────────────────────────────────────

const OutcomesQuerySchema = z.object({
  start: z.string().min(1, 'start date is required (YYYY-MM-DD)'),
  end: z.string().min(1, 'end date is required (YYYY-MM-DD)'),
  period: z.enum(['daily', 'weekly', 'monthly']).default('monthly'),
  format: z.enum(['json', 'csv']).default('json'),
});

// ─── User Repository ───────────────────────────────────────────────────────────

/** Minimal representation of a user record for metrics computation */
export interface UserRecord {
  userId: string;
  orgId: string;
  recoveryScores: number[];   // daily scores (0-100)
  adherenceDays: boolean[];   // daily adherence flags
  debtBalance: number;        // sleep debt in minutes
}

export interface UserRepository {
  findByOrgId(orgId: string, options: { start: string; end: string }): Promise<UserRecord[]>;
}

/** Development/test stub — returns synthetic cohort data for 'test-org' */
export const inMemoryUserRepo: UserRepository = {
  async findByOrgId(orgId: string, _options: { start: string; end: string }): Promise<UserRecord[]> {
    if (orgId === 'test-org') {
      // Return 60 synthetic users so DP is NOT applied (cohort >= 50)
      return Array.from({ length: 60 }, (_, i) => ({
        userId: `user-${i}`,
        orgId,
        recoveryScores: [65 + Math.round(Math.sin(i) * 10), 70, 68, 72, 65],
        adherenceDays: [true, true, false, true, true],
        debtBalance: 90 + i * 2,
      }));
    }
    return [];
  },
};

// ─── Aggregation ───────────────────────────────────────────────────────────────

const MIN_OUTPUT_COHORT = 5;
const DP_COHORT_THRESHOLD = 50;
const EPSILON = 1.0;
const SENSITIVITY = 100; // max metric range

/** Laplace noise via inverse CDF of Laplace distribution */
function laplaceNoise(sensitivity: number, epsilon: number): number {
  const scale = sensitivity / epsilon;
  const u = Math.random() - 0.5;
  return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.floor((p / 100) * (sorted.length - 1));
  return sorted[idx] ?? 0;
}

/**
 * Compute cohort metrics from user records.
 * Applies differential privacy when cohort < DP_COHORT_THRESHOLD.
 * Returns null if cohort < MIN_OUTPUT_COHORT (suppressed).
 */
export function buildCohortMetrics(
  users: UserRecord[],
  options: { epsilon?: number; sensitivity?: number; cohortThreshold?: number },
  period: { start: string; end: string },
): { metrics: CohortMetrics; dpApplied: boolean } | null {
  const n = users.length;
  if (n < MIN_OUTPUT_COHORT) return null; // suppressed

  const epsilon = options.epsilon ?? EPSILON;
  const sensitivity = options.sensitivity ?? SENSITIVITY;
  const threshold = options.cohortThreshold ?? DP_COHORT_THRESHOLD;
  const applyDP = n < threshold;

  // Flatten recovery scores and compute stats
  const allScores = users.flatMap((u) => u.recoveryScores);
  const avgRecoveryRaw = allScores.reduce((a, b) => a + b, 0) / (allScores.length || 1);

  // Adherence rate
  const allAdherence = users.flatMap((u) => u.adherenceDays);
  const adherenceRaw = allAdherence.filter(Boolean).length / (allAdherence.length || 1);

  // Average debt balance
  const avgDebtRaw = users.reduce((a, u) => a + u.debtBalance, 0) / n;

  // Percentiles
  const sortedScores = [...allScores].sort((a, b) => a - b);
  const p25Raw = percentile(sortedScores, 25);
  const p75Raw = percentile(sortedScores, 75);

  // Low recovery fraction
  const LOW_RECOVERY_THRESHOLD = 40;
  const avgPerUser = users.map((u) =>
    u.recoveryScores.reduce((a, b) => a + b, 0) / (u.recoveryScores.length || 1),
  );
  const lowRecoveryRaw = avgPerUser.filter((s) => s < LOW_RECOVERY_THRESHOLD).length / n;

  let avgRecoveryScore: number;
  let adherenceRate: number;
  let avgDebtBalance: number;
  let p25RecoveryScore: number;
  let p75RecoveryScore: number;
  let lowRecoveryWorkerPct: number;

  if (applyDP) {
    avgRecoveryScore = clamp(avgRecoveryRaw + laplaceNoise(sensitivity, epsilon), 0, 100);
    adherenceRate = clamp(adherenceRaw + laplaceNoise(1, epsilon), 0, 1);
    avgDebtBalance = Math.max(0, avgDebtRaw + laplaceNoise(sensitivity * 5, epsilon));
    p25RecoveryScore = clamp(p25Raw + laplaceNoise(sensitivity, epsilon), 0, 100);
    p75RecoveryScore = clamp(p75Raw + laplaceNoise(sensitivity, epsilon), 0, 100);
    lowRecoveryWorkerPct = clamp(lowRecoveryRaw + laplaceNoise(1, epsilon), 0, 1);
  } else {
    avgRecoveryScore = avgRecoveryRaw;
    adherenceRate = adherenceRaw;
    avgDebtBalance = avgDebtRaw;
    p25RecoveryScore = p25Raw;
    p75RecoveryScore = p75Raw;
    lowRecoveryWorkerPct = lowRecoveryRaw;
  }

  // Ensure p25 <= p75 after noise
  if (p25RecoveryScore > p75RecoveryScore) {
    [p25RecoveryScore, p75RecoveryScore] = [p75RecoveryScore, p25RecoveryScore];
  }

  return {
    metrics: {
      orgId: users[0]?.orgId ?? '',
      cohortSize: n,
      avgRecoveryScore: Math.round(avgRecoveryScore * 10) / 10,
      adherenceRate: Math.round(adherenceRate * 1000) / 1000,
      avgDebtBalance: Math.round(avgDebtBalance),
      p25RecoveryScore: Math.round(p25RecoveryScore * 10) / 10,
      p75RecoveryScore: Math.round(p75RecoveryScore * 10) / 10,
      lowRecoveryWorkerPct: Math.round(lowRecoveryWorkerPct * 1000) / 1000,
      periodStart: period.start,
      periodEnd: period.end,
    },
    dpApplied: applyDP,
  };
}

// ─── CSV Serialiser ────────────────────────────────────────────────────────────

/**
 * Serialise an OutcomesResponse to RFC 4180 CSV.
 * Header row matches the OpenAPI spec description.
 */
export function toCSV(response: OutcomesResponse): string {
  const m = response.metrics;
  const headers = [
    'orgId', 'periodStart', 'periodEnd', 'cohortSize',
    'avgRecoveryScore', 'adherenceRate', 'avgDebtBalance',
    'p25RecoveryScore', 'p75RecoveryScore', 'lowRecoveryWorkerPct',
    'dpApplied',
  ];
  const values = [
    m.orgId, m.periodStart, m.periodEnd, m.cohortSize,
    m.avgRecoveryScore, m.adherenceRate, m.avgDebtBalance,
    m.p25RecoveryScore, m.p75RecoveryScore, m.lowRecoveryWorkerPct,
    response.metadata.dpApplied,
  ];
  return `${headers.join(',')}\n${values.join(',')}`;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export function createOutcomesRouter(repo: UserRepository = inMemoryUserRepo): Router {
  const router = Router();

  router.get(
    '/',
    authenticate,
    requireScope('outcomes:read'),
    rateLimit(100),
    async (req: Request, res: Response): Promise<void> => {
      const requestId = req.requestId ?? uuidv4();

      // Validate query params
      const qResult = OutcomesQuerySchema.safeParse(req.query);
      if (!qResult.success) {
        res.status(400).json({
          error: 'Query parameter validation failed',
          code: 'VALIDATION_ERROR',
          requestId,
          details: qResult.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }

      const { start, end, format } = qResult.data;
      const orgId = req.orgId;

      // Fetch users for this org in the requested period
      let users: UserRecord[];
      try {
        users = await repo.findByOrgId(orgId, { start, end });
      } catch (err) {
        res.status(500).json({
          error: 'Failed to retrieve user data',
          code: 'STORAGE_ERROR',
          requestId,
        });
        return;
      }

      // Build cohort metrics (may return null if cohort is suppressed)
      const result = buildCohortMetrics(
        users,
        { epsilon: EPSILON, sensitivity: SENSITIVITY, cohortThreshold: DP_COHORT_THRESHOLD },
        { start, end },
      );

      if (result === null) {
        // Cohort suppressed — not enough users for safe de-identification
        res.status(204).end();
        return;
      }

      const response: OutcomesResponse = {
        metadata: {
          orgId,
          generatedAt: new Date().toISOString(),
          cohortSize: result.metrics.cohortSize,
          dpApplied: result.dpApplied,
          periodStart: start,
          periodEnd: end,
        },
        metrics: result.metrics,
      };

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="outcomes-${orgId}-${start}-${end}.csv"`);
        res.status(200).send(toCSV(response));
        return;
      }

      res.status(200).json(response);
    },
  );

  return router;
}
