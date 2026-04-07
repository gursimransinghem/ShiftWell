/**
 * TDD: Aggregator tests — RED phase
 * Tests for buildCohortMetrics, toJSON, toCSV, percentile
 */
import { UserRecord, DifferentialPrivacyConfig } from '../types';
import { buildCohortMetrics, toJSON, toCSV, percentile } from '../aggregator';

const defaultConfig: DifferentialPrivacyConfig = {
  epsilon: 1.0,
  sensitivity: 100,
  cohortThreshold: 50,
};

const period = { start: '2026-03-01', end: '2026-03-31' };

const makeUser = (
  recoveryScores: number[],
  adherenceDays: boolean[],
  debtBalance: number,
  orgId = 'org-hosp-1'
): UserRecord => ({
  userId: `user-${Math.random()}`,
  recoveryScores,
  adherenceDays,
  debtBalance,
  shiftType: 'night',
  orgId,
});

describe('percentile', () => {
  it('returns median for p=50', () => {
    expect(percentile([10, 20, 30, 40, 50], 50)).toBe(30);
  });

  it('returns min for p=0', () => {
    expect(percentile([10, 30, 20], 0)).toBe(10);
  });

  it('returns max for p=100', () => {
    expect(percentile([10, 30, 20], 100)).toBe(30);
  });

  it('handles single-element array', () => {
    expect(percentile([42], 25)).toBe(42);
    expect(percentile([42], 75)).toBe(42);
  });

  it('computes p25 and p75 correctly for known distribution', () => {
    const values = [20, 40, 60, 80];
    const p25 = percentile(values, 25);
    const p75 = percentile(values, 75);
    expect(p25).toBeGreaterThanOrEqual(20);
    expect(p25).toBeLessThanOrEqual(40);
    expect(p75).toBeGreaterThanOrEqual(60);
    expect(p75).toBeLessThanOrEqual(80);
  });
});

describe('buildCohortMetrics — large cohort (no DP)', () => {
  it('returns correct avgRecoveryScore for 3 users all with score 80', () => {
    const scores = Array(30).fill(80) as number[];
    const adherence = Array(30).fill(true) as boolean[];
    const users = Array.from({ length: 100 }, () => makeUser(scores, adherence, 0));
    const result = buildCohortMetrics(users, defaultConfig, period);
    // 100 users >= 50, so DP not applied
    expect(result.metadata.dpApplied).toBe(false);
    expect(result.metrics.avgRecoveryScore).toBeCloseTo(80, 0);
  });

  it('returns dpApplied=false for cohort of 100 users', () => {
    const users = Array.from({ length: 100 }, () =>
      makeUser([80], [true], 60)
    );
    const result = buildCohortMetrics(users, defaultConfig, period);
    expect(result.metadata.dpApplied).toBe(false);
    expect(result.metadata.cohortSize).toBe(100);
  });

  it('computes adherenceRate correctly', () => {
    // 2 users: first has 100% adherence, second has 0% adherence → avg 50%
    const user1 = makeUser([80], [true, true, true, true], 0);
    const user2 = makeUser([80], [false, false, false, false], 0);
    const users = Array.from({ length: 50 }, (_, i) => i < 25 ? user1 : user2);
    const result = buildCohortMetrics(users, defaultConfig, period);
    expect(result.metadata.dpApplied).toBe(false);
    expect(result.metrics.adherenceRate).toBeCloseTo(0.5, 1);
  });

  it('computes avgDebtBalance correctly', () => {
    const users = [
      ...Array.from({ length: 50 }, () => makeUser([70], [true], 120)),
    ];
    const result = buildCohortMetrics(users, defaultConfig, period);
    expect(result.metrics.avgDebtBalance).toBeCloseTo(120, 0);
  });
});

describe('buildCohortMetrics — small cohort (DP applied)', () => {
  it('returns dpApplied=true for cohort of 2 users', () => {
    const users = [
      makeUser([80, 80, 80], [true, true], 60),
      makeUser([80, 80, 80], [true, true], 60),
    ];
    const result = buildCohortMetrics(users, defaultConfig, period);
    expect(result.metadata.dpApplied).toBe(true);
    expect(result.metadata.epsilon).toBe(1.0);
    expect(result.metadata.cohortSize).toBe(2);
  });

  it('returns metrics within valid range after DP for small cohort', () => {
    const users = [
      makeUser(Array(30).fill(80) as number[], Array(30).fill(true) as boolean[], 60),
      makeUser(Array(30).fill(80) as number[], Array(30).fill(true) as boolean[], 60),
    ];
    const result = buildCohortMetrics(users, defaultConfig, period);
    expect(result.metrics.avgRecoveryScore).toBeGreaterThanOrEqual(0);
    expect(result.metrics.avgRecoveryScore).toBeLessThanOrEqual(100);
    expect(result.metrics.adherenceRate).toBeGreaterThanOrEqual(0);
    expect(result.metrics.adherenceRate).toBeLessThanOrEqual(1);
    expect(result.metrics.avgDebtBalance).toBeGreaterThanOrEqual(0);
  });
});

describe('buildCohortMetrics — empty cohort', () => {
  it('returns all zeros for empty user array', () => {
    const result = buildCohortMetrics([], defaultConfig, period);
    expect(result.metrics.cohortSize).toBe(0);
    expect(result.metrics.avgRecoveryScore).toBe(0);
    expect(result.metrics.adherenceRate).toBe(0);
    expect(result.metrics.avgDebtBalance).toBe(0);
    expect(result.metadata.dpApplied).toBe(false);
  });
});

describe('buildCohortMetrics — lowRecoveryWorkerPct', () => {
  it('counts users with mean recovery score < 40', () => {
    // 25 users with score 20 (low) + 25 users with score 80 (normal) = 50 total, no DP
    const lowUsers = Array.from({ length: 25 }, () => makeUser(Array(10).fill(20) as number[], [], 0));
    const highUsers = Array.from({ length: 25 }, () => makeUser(Array(10).fill(80) as number[], [], 0));
    const result = buildCohortMetrics([...lowUsers, ...highUsers], defaultConfig, period);
    expect(result.metadata.dpApplied).toBe(false);
    expect(result.metrics.lowRecoveryWorkerPct).toBeCloseTo(0.5, 1);
  });
});

describe('buildCohortMetrics — metadata fields', () => {
  it('includes orgId from first user', () => {
    const users = [makeUser([80], [true], 0, 'org-abc')];
    const result = buildCohortMetrics(users, defaultConfig, period);
    expect(result.metadata.orgId).toBe('org-abc');
  });

  it('includes periodStart and periodEnd in metrics', () => {
    const users = [makeUser([80], [true], 0)];
    const result = buildCohortMetrics(users, defaultConfig, period);
    expect(result.metrics.periodStart).toBe('2026-03-01');
    expect(result.metrics.periodEnd).toBe('2026-03-31');
  });
});

describe('toJSON', () => {
  it('returns valid JSON string', () => {
    const users = [makeUser([80], [true], 60)];
    const exported = buildCohortMetrics(users, defaultConfig, period);
    const json = toJSON(exported);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('parsed JSON matches input structure', () => {
    const users = [makeUser([70, 80], [true, false], 90, 'org-xyz')];
    const exported = buildCohortMetrics(users, defaultConfig, period);
    const parsed = JSON.parse(toJSON(exported));
    expect(parsed.metadata.orgId).toBe('org-xyz');
    expect(parsed.metrics.cohortSize).toBe(1);
  });
});

describe('toCSV', () => {
  it('starts with correct header row', () => {
    const users = [makeUser([80], [true], 0)];
    const exported = buildCohortMetrics(users, defaultConfig, period);
    const csv = toCSV(exported);
    expect(csv.startsWith('orgId,cohortSize')).toBe(true);
  });

  it('contains two rows (header + data)', () => {
    const users = [makeUser([80], [true], 0)];
    const exported = buildCohortMetrics(users, defaultConfig, period);
    const rows = toCSV(exported).trim().split('\n');
    expect(rows.length).toBe(2);
  });

  it('data row contains dpApplied as true or false string', () => {
    // small cohort → dpApplied=true
    const users = [makeUser([80], [true], 0)];
    const exported = buildCohortMetrics(users, defaultConfig, period);
    const csv = toCSV(exported);
    const dataRow = csv.split('\n')[1];
    expect(dataRow).toMatch(/true|false/);
  });
});
