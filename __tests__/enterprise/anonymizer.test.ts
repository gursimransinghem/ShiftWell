/**
 * Tests for enterprise/anonymizer — Phase 27 (Outcome Data Pipeline)
 *
 * AN-01: anonymizeUserData strips PII — userId never appears in output
 * AN-02: anonymizeUserData returns correct periodISO from latest record
 * AN-03: anonymizeUserData returns current month when no history
 * AN-04: applyDifferentialPrivacy suppresses cohorts with < 5 users
 * AN-05: applyDifferentialPrivacy returns record for cohorts with >= 5 users
 * AN-06: applyDifferentialPrivacy adds noise for cohorts below minCohortSize
 * AN-07: applyDifferentialPrivacy produces clean averages for large cohorts
 * AN-08: applyDifferentialPrivacy handles multiple cohorts independently
 * AN-09: participantCount reflects actual member count after aggregation
 * AN-10: applyDifferentialPrivacy clamps avgAdherenceRate to [0, 100]
 */

import { anonymizeUserData, applyDifferentialPrivacy } from '../../src/lib/enterprise/anonymizer';
import type { AnonymizedRecord } from '../../src/lib/enterprise/anonymizer';
import type { SleepDiscrepancy } from '../../src/lib/feedback/types';
import type { PersonalOutcome } from '../../src/lib/intelligence/outcome-calculator';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeDiscrepancy(dateISO: string, startDelta = 10, durationDelta = -15): SleepDiscrepancy {
  return {
    dateISO,
    planned: { start: new Date(`${dateISO}T22:00:00`).toISOString(), end: new Date(`${dateISO}T06:00:00`).toISOString(), durationHours: 8 },
    actual: { start: new Date(`${dateISO}T22:00:00`).toISOString(), end: new Date(`${dateISO}T06:00:00`).toISOString(), durationHours: 7.75 },
    delta: { startMinutes: startDelta, endMinutes: 0, durationMinutes: durationDelta },
    source: 'healthkit',
    watchWorn: true,
  };
}

function makeOutcome(overrides: Partial<PersonalOutcome> = {}): PersonalOutcome {
  return {
    daysUsing: 30,
    sleepImprovement: 15,
    debtReduction: 0.5,
    adherenceRate: 75,
    bestStreak: 7,
    currentStreak: 3,
    transitionsHandled: 4,
    ...overrides,
  };
}

function makeRecord(cohortId: string, periodISO: string, adherence = 80): AnonymizedRecord {
  return {
    cohortId,
    periodISO,
    metrics: {
      avgAdherenceRate: adherence,
      avgDebtHours: 0.5,
      avgRecoveryScore: adherence,
      transitionRecoveryDays: 3,
      participantCount: 1,
    },
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('anonymizeUserData', () => {
  // AN-01: userId must not appear anywhere in the output
  it('AN-01: strips PII — userId never appears in output', () => {
    const userId = 'user-pii-12345';
    const history = [makeDiscrepancy('2026-03-15')];
    const result = anonymizeUserData(userId, history, makeOutcome(), 'hospital-A');
    const json = JSON.stringify(result);
    expect(json).not.toContain(userId);
  });

  // AN-02: periodISO derived from latest record's dateISO
  it('AN-02: periodISO matches the latest record month', () => {
    const history = [
      makeDiscrepancy('2026-02-10'),
      makeDiscrepancy('2026-03-20'),
    ];
    const result = anonymizeUserData('uid', history, makeOutcome(), 'hospital-A');
    expect(result.periodISO).toBe('2026-03');
  });

  // AN-03: falls back to current month when no history
  it('AN-03: periodISO falls back to current month when no history', () => {
    const now = new Date();
    const expectedPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const result = anonymizeUserData('uid', [], makeOutcome(), 'hospital-A');
    expect(result.periodISO).toBe(expectedPeriod);
  });

  it('returns correct cohortId', () => {
    const result = anonymizeUserData('uid', [], makeOutcome(), 'facility-XYZ');
    expect(result.cohortId).toBe('facility-XYZ');
  });

  it('participantCount is 1 for a single user', () => {
    const result = anonymizeUserData('uid', [makeDiscrepancy('2026-03-01')], makeOutcome(), 'cohort-A');
    expect(result.metrics.participantCount).toBe(1);
  });
});

describe('applyDifferentialPrivacy', () => {
  // AN-04: suppress cohorts with < 5 members
  it('AN-04: suppresses cohorts with fewer than 5 users', () => {
    const records = [
      makeRecord('cohort-A', '2026-03'),
      makeRecord('cohort-A', '2026-03'),
      makeRecord('cohort-A', '2026-03'),
      makeRecord('cohort-A', '2026-03'),
    ]; // 4 records — below threshold
    const result = applyDifferentialPrivacy(records, 50);
    expect(result).toHaveLength(0);
  });

  // AN-05: emit record for cohorts >= 5 users
  it('AN-05: emits record for cohorts with >= 5 users', () => {
    const records = Array.from({ length: 5 }, () => makeRecord('cohort-A', '2026-03'));
    const result = applyDifferentialPrivacy(records, 50);
    expect(result).toHaveLength(1);
    expect(result[0].cohortId).toBe('cohort-A');
    expect(result[0].periodISO).toBe('2026-03');
  });

  // AN-06: noise applied for cohorts below minCohortSize (but >= 5)
  it('AN-06: applies Laplacian noise for cohorts below minCohortSize', () => {
    // Run 20 times and check that noise is sometimes applied
    // (values deviate from the exact average of 80)
    const records = Array.from({ length: 10 }, () => makeRecord('cohort-A', '2026-03', 80));
    const noiseValues: number[] = [];
    for (let i = 0; i < 20; i++) {
      const result = applyDifferentialPrivacy(records, 50); // 10 < 50 → noisy
      noiseValues.push(result[0].metrics.avgAdherenceRate);
    }
    // At least one value should differ from 80 (Laplacian noise is non-deterministic)
    const allExact = noiseValues.every((v) => v === 80);
    expect(allExact).toBe(false);
  });

  // AN-07: no noise for cohorts at or above minCohortSize
  it('AN-07: produces exact averages for cohorts at or above minCohortSize', () => {
    const records = Array.from({ length: 60 }, () => makeRecord('cohort-A', '2026-03', 80));
    // All records have adherence=80, so avg should be exactly 80 with no noise
    const result = applyDifferentialPrivacy(records, 50);
    expect(result[0].metrics.avgAdherenceRate).toBe(80);
    expect(result[0].metrics.participantCount).toBe(60);
  });

  // AN-08: multiple cohorts handled independently
  it('AN-08: handles multiple cohorts independently', () => {
    const cohortA = Array.from({ length: 10 }, () => makeRecord('cohort-A', '2026-03', 70));
    const cohortB = Array.from({ length: 3 }, () => makeRecord('cohort-B', '2026-03', 90));
    const result = applyDifferentialPrivacy([...cohortA, ...cohortB], 50);
    // cohort-A: 10 >= 5 → included. cohort-B: 3 < 5 → suppressed
    expect(result).toHaveLength(1);
    expect(result[0].cohortId).toBe('cohort-A');
  });

  // AN-09: participantCount reflects actual count
  it('AN-09: participantCount equals the number of input records for the cohort', () => {
    const records = Array.from({ length: 12 }, () => makeRecord('cohort-A', '2026-03'));
    const result = applyDifferentialPrivacy(records, 50);
    expect(result[0].metrics.participantCount).toBe(12);
  });

  // AN-10: clamp avgAdherenceRate to [0, 100]
  it('AN-10: clamps noised avgAdherenceRate to [0, 100]', () => {
    // Use extreme values near the boundary to stress the clamp
    const extremeRecords = Array.from({ length: 7 }, () => makeRecord('cohort-A', '2026-03', 99));
    for (let i = 0; i < 30; i++) {
      const result = applyDifferentialPrivacy(extremeRecords, 50);
      expect(result[0].metrics.avgAdherenceRate).toBeLessThanOrEqual(100);
      expect(result[0].metrics.avgAdherenceRate).toBeGreaterThanOrEqual(0);
    }
  });
});
