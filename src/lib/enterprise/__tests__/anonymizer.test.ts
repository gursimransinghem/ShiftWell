/**
 * TDD: Anonymizer tests — RED phase
 * Tests for stripPII, safeHarborStrip, applyDifferentialPrivacy, shouldApplyDP
 */
import { UserRecord } from '../types';
import {
  stripPII,
  safeHarborStrip,
  applyDifferentialPrivacy,
  shouldApplyDP,
  laplaceSample,
} from '../anonymizer';

const makeUser = (overrides: Partial<UserRecord> = {}): UserRecord => ({
  userId: 'user-123',
  name: 'Jane Doe',
  email: 'jane@hospital.org',
  employeeId: 'EMP-001',
  deviceId: 'device-abc',
  recoveryScores: [75, 80, 70, 85, 90],
  adherenceDays: [true, false, true, true, false],
  debtBalance: 120,
  shiftType: 'night',
  orgId: 'org-hosp-1',
  ...overrides,
});

describe('stripPII', () => {
  it('removes userId, name, email, employeeId, deviceId', () => {
    const user = makeUser();
    const stripped = stripPII(user);
    expect((stripped as Record<string, unknown>).userId).toBeUndefined();
    expect((stripped as Record<string, unknown>).name).toBeUndefined();
    expect((stripped as Record<string, unknown>).email).toBeUndefined();
    expect((stripped as Record<string, unknown>).employeeId).toBeUndefined();
    expect((stripped as Record<string, unknown>).deviceId).toBeUndefined();
  });

  it('preserves recoveryScores, adherenceDays, debtBalance, orgId, shiftType', () => {
    const user = makeUser();
    const stripped = stripPII(user);
    expect(stripped.recoveryScores).toEqual([75, 80, 70, 85, 90]);
    expect(stripped.adherenceDays).toEqual([true, false, true, true, false]);
    expect(stripped.debtBalance).toBe(120);
    expect(stripped.orgId).toBe('org-hosp-1');
    expect(stripped.shiftType).toBe('night');
  });

  it('does not mutate the original record', () => {
    const user = makeUser();
    const original = { ...user };
    stripPII(user);
    expect(user).toEqual(original);
  });
});

describe('safeHarborStrip', () => {
  it('removes HIPAA Safe Harbor identifiers present in the object', () => {
    const record = {
      name: 'Dr. Smith',
      email: 'dr.smith@hospital.org',
      deviceId: 'iphone-xyz',
      employeeId: 'EMP-999',
      recoveryScores: [80, 90],
      orgId: 'org-1',
    };
    const stripped = safeHarborStrip(record);
    expect((stripped as Record<string, unknown>).name).toBeUndefined();
    expect((stripped as Record<string, unknown>).email).toBeUndefined();
    expect((stripped as Record<string, unknown>).deviceId).toBeUndefined();
    expect((stripped as Record<string, unknown>).employeeId).toBeUndefined();
  });

  it('preserves non-PHI fields', () => {
    const record = {
      recoveryScores: [70, 80],
      orgId: 'org-2',
      debtBalance: 60,
    };
    const stripped = safeHarborStrip(record);
    expect(stripped.recoveryScores).toEqual([70, 80]);
    expect(stripped.orgId).toBe('org-2');
    expect(stripped.debtBalance).toBe(60);
  });

  it('does not mutate the original record', () => {
    const record = { name: 'Alice', recoveryScores: [50] };
    safeHarborStrip(record);
    expect(record.name).toBe('Alice');
  });

  it('handles records with no PHI fields gracefully', () => {
    const record = { cohortSize: 50, avgScore: 75 };
    const stripped = safeHarborStrip(record);
    expect(stripped).toEqual({ cohortSize: 50, avgScore: 75 });
  });
});

describe('applyDifferentialPrivacy', () => {
  it('returns a number', () => {
    const config = { epsilon: 1.0, sensitivity: 100, cohortThreshold: 50 };
    const result = applyDifferentialPrivacy(75, config);
    expect(typeof result).toBe('number');
  });

  it('result is within reasonable noise bounds (within 5x scale from original)', () => {
    const config = { epsilon: 1.0, sensitivity: 100, cohortThreshold: 50 };
    const scale = config.sensitivity / config.epsilon; // 100
    const original = 75;
    const results = Array.from({ length: 100 }, () => applyDifferentialPrivacy(original, config));
    // All results should be within [0, 100] after clamping
    results.forEach(r => {
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(100);
    });
    // Mean should be roughly close to original over many samples
    const mean = results.reduce((a, b) => a + b, 0) / results.length;
    expect(Math.abs(mean - original)).toBeLessThan(scale * 2);
  });

  it('clamps result to [0, 100] for recovery score sensitivity', () => {
    const config = { epsilon: 0.001, sensitivity: 100, cohortThreshold: 50 }; // very high noise
    const results = Array.from({ length: 50 }, () => applyDifferentialPrivacy(50, config));
    results.forEach(r => {
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(100);
    });
  });
});

describe('shouldApplyDP', () => {
  it('returns true for cohort size of 49', () => {
    expect(shouldApplyDP(49)).toBe(true);
  });

  it('returns false for cohort size of 50 (at threshold)', () => {
    expect(shouldApplyDP(50)).toBe(false);
  });

  it('returns false for cohort size of 100', () => {
    expect(shouldApplyDP(100)).toBe(false);
  });

  it('returns true for cohort size of 1', () => {
    expect(shouldApplyDP(1)).toBe(true);
  });

  it('respects custom threshold', () => {
    expect(shouldApplyDP(30, 100)).toBe(true);
    expect(shouldApplyDP(100, 100)).toBe(false);
    expect(shouldApplyDP(101, 100)).toBe(false);
  });
});

describe('laplaceSample', () => {
  it('returns a number', () => {
    expect(typeof laplaceSample(1)).toBe('number');
  });

  it('has mean close to 0 over many samples', () => {
    const samples = Array.from({ length: 1000 }, () => laplaceSample(1));
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(Math.abs(mean)).toBeLessThan(0.5); // mean of Laplace(0, b) is 0
  });
});
