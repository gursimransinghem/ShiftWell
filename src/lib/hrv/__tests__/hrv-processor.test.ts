/**
 * HRV Processor Unit Tests
 *
 * Tests calculateHRVScore, shouldIncludeHRV, updateBaseline, buildHRVWeights
 * per BIOMETRIC-ALGORITHM-SPEC.md formulas and 33-01-PLAN.md behavior spec.
 */

import {
  calculateHRVScore,
  shouldIncludeHRV,
  updateBaseline,
  buildHRVWeights,
} from '../hrv-processor';

// ─── calculateHRVScore ────────────────────────────────────────────────────────

describe('calculateHRVScore', () => {
  it('returns 100 when rmssd is 30%+ above baseline', () => {
    const baseline = 50;
    const rmssd = baseline * 1.3; // +30%
    expect(calculateHRVScore(rmssd, baseline)).toBe(100);
  });

  it('returns > 100 clamped to 100 when rmssd is 50%+ above baseline', () => {
    const baseline = 50;
    const rmssd = baseline * 1.5; // +50%
    expect(calculateHRVScore(rmssd, baseline)).toBe(100);
  });

  it('returns 70 when rmssd equals baseline', () => {
    const baseline = 50;
    expect(calculateHRVScore(baseline, baseline)).toBe(70);
  });

  it('returns 0 when rmssd is 30%+ below baseline', () => {
    const baseline = 50;
    const rmssd = baseline * 0.7; // -30%
    expect(calculateHRVScore(rmssd, baseline)).toBe(40); // 70 + (-0.30/0.30)*30 = 70-30=40
  });

  it('returns 0 when rmssd is 70%+ below baseline (clamped)', () => {
    const baseline = 50;
    const rmssd = baseline * 0.3; // -70%
    expect(calculateHRVScore(rmssd, baseline)).toBe(0);
  });

  it('clamps output to minimum of 0', () => {
    expect(calculateHRVScore(0, 50)).toBe(0);
  });

  it('clamps output to maximum of 100', () => {
    expect(calculateHRVScore(200, 50)).toBe(100);
  });

  it('returns 80 at +10% above baseline', () => {
    const baseline = 50;
    const rmssd = baseline * 1.1; // +10%
    expect(calculateHRVScore(rmssd, baseline)).toBe(80);
  });

  it('returns 60 at -10% below baseline', () => {
    const baseline = 50;
    const rmssd = baseline * 0.9; // -10%
    expect(calculateHRVScore(rmssd, baseline)).toBe(60);
  });
});

// ─── shouldIncludeHRV ─────────────────────────────────────────────────────────

describe('shouldIncludeHRV', () => {
  it('returns false when baselineDays < 14', () => {
    expect(shouldIncludeHRV(true, 13, false)).toBe(false);
  });

  it('returns false when baselineDays === 0', () => {
    expect(shouldIncludeHRV(true, 0, false)).toBe(false);
  });

  it('returns false when inCircadianTransition is true', () => {
    expect(shouldIncludeHRV(true, 20, true)).toBe(false);
  });

  it('returns false when hrv_available is false', () => {
    expect(shouldIncludeHRV(false, 20, false)).toBe(false);
  });

  it('returns true when hrv_available && baselineDays >= 14 && not in transition', () => {
    expect(shouldIncludeHRV(true, 14, false)).toBe(true);
  });

  it('returns true when baselineDays is 30 and not in transition', () => {
    expect(shouldIncludeHRV(true, 30, false)).toBe(true);
  });

  it('returns false when all conditions false', () => {
    expect(shouldIncludeHRV(false, 5, true)).toBe(false);
  });
});

// ─── updateBaseline ───────────────────────────────────────────────────────────

describe('updateBaseline', () => {
  it('adds new value to empty array', () => {
    const result = updateBaseline([], 50);
    expect(result.values).toEqual([50]);
    expect(result.mean).toBe(50);
  });

  it('computes correct mean of two values', () => {
    const result = updateBaseline([40], 60);
    expect(result.mean).toBe(50);
    expect(result.values).toEqual([40, 60]);
  });

  it('does not exceed maxDays entries (default 30)', () => {
    const existing = Array.from({ length: 30 }, (_, i) => i + 1);
    const result = updateBaseline(existing, 100);
    expect(result.values.length).toBe(30);
    // Oldest entry (1) should be removed
    expect(result.values[0]).toBe(2);
    expect(result.values[29]).toBe(100);
  });

  it('respects custom maxDays', () => {
    const result = updateBaseline([10, 20, 30], 40, 3);
    expect(result.values.length).toBe(3);
    expect(result.values).toEqual([20, 30, 40]);
  });

  it('returns rolling mean of up to 30 values', () => {
    const values = Array.from({ length: 30 }, () => 50);
    const result = updateBaseline(values, 80, 30);
    // After removing oldest 50 and adding 80: 29 * 50 + 80 = 1530, / 30 = 51
    expect(result.mean).toBeCloseTo(51, 1);
  });

  it('returns same value for single-element array', () => {
    const result = updateBaseline([], 42);
    expect(result.mean).toBe(42);
    expect(result.values.length).toBe(1);
  });
});

// ─── buildHRVWeights ──────────────────────────────────────────────────────────

describe('buildHRVWeights', () => {
  it('returns HRV-active weights when hrv_available and baselineDays >= 14', () => {
    const weights = buildHRVWeights(true, 14);
    expect(weights.adherence).toBe(0.40);
    expect(weights.debt).toBe(0.30);
    expect(weights.hrv).toBe(0.25);
    expect(weights.transition).toBe(0.05);
  });

  it('all HRV-active weights sum to 1.0', () => {
    const weights = buildHRVWeights(true, 20);
    const sum = weights.adherence + weights.debt + weights.hrv + weights.transition;
    expect(sum).toBeCloseTo(1.0, 10);
  });

  it('returns no-HRV weights when hrv_available is false', () => {
    const weights = buildHRVWeights(false, 20);
    expect(weights.hrv).toBe(0);
    expect(weights.adherence).toBe(0.50);
    expect(weights.debt).toBe(0.45);
    expect(weights.transition).toBe(0.05);
  });

  it('returns no-HRV weights when baselineDays < 14', () => {
    const weights = buildHRVWeights(true, 10);
    expect(weights.hrv).toBe(0);
  });

  it('all no-HRV weights sum to 1.0', () => {
    const weights = buildHRVWeights(false, 0);
    const sum = weights.adherence + weights.debt + weights.hrv + weights.transition;
    expect(sum).toBeCloseTo(1.0, 10);
  });

  it('transitions weights correctly at exactly 14 days', () => {
    const weights14 = buildHRVWeights(true, 14);
    const weights13 = buildHRVWeights(true, 13);
    expect(weights14.hrv).toBe(0.25);
    expect(weights13.hrv).toBe(0);
  });
});
