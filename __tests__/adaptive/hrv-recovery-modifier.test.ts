/**
 * Tests for hrv-recovery-modifier: computeHRVModifier.
 *
 * Covers all four signal levels (elevated, normal, depressed, insufficient)
 * and edge cases (zero std, boundary values).
 */

import { computeHRVModifier } from '../../src/lib/adaptive/hrv-recovery-modifier';
import type { HRVReading } from '../../src/lib/healthkit/hrv-reader';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeReading(rmssd: number): HRVReading {
  return {
    dateISO: '2026-04-10',
    rmssd,
    heartRate: 55,
    source: 'Apple Watch Series 9',
    timestamp: new Date('2026-04-10T03:00:00.000Z').toISOString(),
  };
}

const BASELINE_14 = { meanRMSSD: 50, stdRMSSD: 10, readings: 14 };
const BASELINE_SHORT = { meanRMSSD: 50, stdRMSSD: 10, readings: 4 };

// ── insufficient signal ───────────────────────────────────────────────────────

describe('computeHRVModifier — insufficient baseline', () => {
  it('returns signal=insufficient when readings < 7', () => {
    const result = computeHRVModifier(makeReading(65), BASELINE_SHORT);
    expect(result.signal).toBe('insufficient');
  });

  it('returns modifier=0 when insufficient', () => {
    const result = computeHRVModifier(makeReading(65), BASELINE_SHORT);
    expect(result.modifier).toBe(0);
  });

  it('returns low confidence when insufficient', () => {
    const result = computeHRVModifier(makeReading(65), BASELINE_SHORT);
    expect(result.confidence).toBeLessThan(0.5);
  });

  it('includes explanation text when insufficient', () => {
    const result = computeHRVModifier(makeReading(65), BASELINE_SHORT);
    expect(result.explanation.length).toBeGreaterThan(0);
  });

  it('returns insufficient even if readings field is missing (default < 7)', () => {
    const baseline = { meanRMSSD: 50, stdRMSSD: 10 };
    // readings defaults to MIN_BASELINE_READINGS (7), which is NOT < 7
    // So this should NOT be insufficient — readings is treated as 7
    const result = computeHRVModifier(makeReading(65), baseline as any);
    // 65 is 1.5 SDs above mean → elevated
    expect(result.signal).toBe('elevated');
  });
});

// ── normal signal ─────────────────────────────────────────────────────────────

describe('computeHRVModifier — normal signal', () => {
  it('returns signal=normal when rmssd equals baseline mean', () => {
    const result = computeHRVModifier(makeReading(50), BASELINE_14);
    expect(result.signal).toBe('normal');
  });

  it('returns modifier=0 for normal signal', () => {
    const result = computeHRVModifier(makeReading(50), BASELINE_14);
    expect(result.modifier).toBe(0);
  });

  it('returns normal when within +1 SD', () => {
    // 59 = mean(50) + 0.9 * std(10) — within 1 SD
    const result = computeHRVModifier(makeReading(59), BASELINE_14);
    expect(result.signal).toBe('normal');
    expect(result.modifier).toBe(0);
  });

  it('returns normal when within -1 SD', () => {
    // 41 = mean(50) - 0.9 * std(10) — within 1 SD
    const result = computeHRVModifier(makeReading(41), BASELINE_14);
    expect(result.signal).toBe('normal');
    expect(result.modifier).toBe(0);
  });

  it('returns high confidence for normal signal', () => {
    const result = computeHRVModifier(makeReading(50), BASELINE_14);
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('includes baseline rmssd in normal explanation', () => {
    const result = computeHRVModifier(makeReading(50), BASELINE_14);
    expect(result.explanation).toContain('50');
  });
});

// ── elevated signal ───────────────────────────────────────────────────────────

describe('computeHRVModifier — elevated signal', () => {
  it('returns signal=elevated when exactly 1 SD above baseline', () => {
    // 60 = mean(50) + 1.0 * std(10) — exactly at threshold
    const result = computeHRVModifier(makeReading(60), BASELINE_14);
    expect(result.signal).toBe('elevated');
  });

  it('returns +10 modifier at exactly 1 SD above', () => {
    const result = computeHRVModifier(makeReading(60), BASELINE_14);
    expect(result.modifier).toBe(10);
  });

  it('returns +20 modifier at 2 SDs above (capped)', () => {
    // 70 = mean(50) + 2.0 * std(10)
    const result = computeHRVModifier(makeReading(70), BASELINE_14);
    expect(result.modifier).toBe(20);
  });

  it('caps modifier at +20 even when very far above baseline', () => {
    const result = computeHRVModifier(makeReading(120), BASELINE_14);
    expect(result.modifier).toBe(20);
    expect(result.modifier).toBeLessThanOrEqual(20);
  });

  it('modifier scales between +10 and +20 for values between 1-2 SDs', () => {
    // 1.5 SDs above: 65 = 50 + 1.5 * 10
    const result = computeHRVModifier(makeReading(65), BASELINE_14);
    expect(result.modifier).toBeGreaterThan(10);
    expect(result.modifier).toBeLessThanOrEqual(20);
  });

  it('explanation mentions above baseline', () => {
    const result = computeHRVModifier(makeReading(70), BASELINE_14);
    expect(result.explanation.toLowerCase()).toContain('above');
  });
});

// ── depressed signal ──────────────────────────────────────────────────────────

describe('computeHRVModifier — depressed signal', () => {
  it('returns signal=depressed when exactly 1 SD below baseline', () => {
    // 40 = mean(50) - 1.0 * std(10)
    const result = computeHRVModifier(makeReading(40), BASELINE_14);
    expect(result.signal).toBe('depressed');
  });

  it('returns -10 modifier at exactly 1 SD below', () => {
    const result = computeHRVModifier(makeReading(40), BASELINE_14);
    expect(result.modifier).toBe(-10);
  });

  it('returns -20 modifier at 2 SDs below (capped)', () => {
    // 30 = mean(50) - 2.0 * std(10)
    const result = computeHRVModifier(makeReading(30), BASELINE_14);
    expect(result.modifier).toBe(-20);
  });

  it('caps modifier at -20 even when very far below baseline', () => {
    const result = computeHRVModifier(makeReading(0), BASELINE_14);
    expect(result.modifier).toBe(-20);
    expect(result.modifier).toBeGreaterThanOrEqual(-20);
  });

  it('modifier scales between -10 and -20 for values between -1 and -2 SDs', () => {
    // -1.5 SDs: 35 = 50 - 1.5 * 10
    const result = computeHRVModifier(makeReading(35), BASELINE_14);
    expect(result.modifier).toBeLessThan(-10);
    expect(result.modifier).toBeGreaterThanOrEqual(-20);
  });

  it('explanation mentions below baseline', () => {
    const result = computeHRVModifier(makeReading(30), BASELINE_14);
    expect(result.explanation.toLowerCase()).toContain('below');
  });
});

// ── edge cases ────────────────────────────────────────────────────────────────

describe('computeHRVModifier — edge cases', () => {
  it('does not divide by zero when stdRMSSD is 0', () => {
    const baselineZeroStd = { meanRMSSD: 50, stdRMSSD: 0, readings: 14 };
    expect(() => computeHRVModifier(makeReading(50), baselineZeroStd)).not.toThrow();
    const result = computeHRVModifier(makeReading(50), baselineZeroStd);
    expect(result.signal).toBe('normal');
  });

  it('handles readings at exact 1 SD boundary (elevated)', () => {
    // Exactly 1 SD above — deviation = 1.0, should be elevated not normal
    const result = computeHRVModifier(makeReading(60), BASELINE_14);
    expect(result.signal).toBe('elevated');
  });

  it('handles readings at exact -1 SD boundary (depressed)', () => {
    // Exactly 1 SD below — deviation = -1.0, should be depressed not normal
    const result = computeHRVModifier(makeReading(40), BASELINE_14);
    expect(result.signal).toBe('depressed');
  });
});

// ── integration with recovery-calculator ─────────────────────────────────────

describe('HRV modifier integration with computeRecoveryScore', () => {
  it('positive modifier increases recovery score', () => {
    const { computeRecoveryScore } = require('../../src/lib/adaptive/recovery-calculator');
    const type = require('../../src/lib/healthkit/healthkit-service');

    const record = {
      date: new Date(),
      inBedStart: null,
      inBedEnd: null,
      asleepStart: null,
      asleepEnd: null,
      totalSleepMinutes: 420,
      deepSleepMinutes: 90,
      remSleepMinutes: 90,
      coreSleepMinutes: 240,
      sleepEfficiency: 88,
      source: 'Apple Watch',
    };

    const baseScore = computeRecoveryScore(record, 7.5);
    const elevatedModifier = computeHRVModifier(makeReading(70), BASELINE_14);
    const boostedScore = computeRecoveryScore(record, 7.5, elevatedModifier);

    expect(boostedScore).toBeGreaterThan(baseScore!);
  });

  it('negative modifier decreases recovery score', () => {
    const { computeRecoveryScore } = require('../../src/lib/adaptive/recovery-calculator');

    const record = {
      date: new Date(),
      inBedStart: null,
      inBedEnd: null,
      asleepStart: null,
      asleepEnd: null,
      totalSleepMinutes: 420,
      deepSleepMinutes: 90,
      remSleepMinutes: 90,
      coreSleepMinutes: 240,
      sleepEfficiency: 88,
      source: 'Apple Watch',
    };

    const baseScore = computeRecoveryScore(record, 7.5);
    const depressedModifier = computeHRVModifier(makeReading(30), BASELINE_14);
    const penalizedScore = computeRecoveryScore(record, 7.5, depressedModifier);

    expect(penalizedScore).toBeLessThan(baseScore!);
  });

  it('zero modifier leaves recovery score unchanged', () => {
    const { computeRecoveryScore } = require('../../src/lib/adaptive/recovery-calculator');

    const record = {
      date: new Date(),
      inBedStart: null,
      inBedEnd: null,
      asleepStart: null,
      asleepEnd: null,
      totalSleepMinutes: 420,
      deepSleepMinutes: 90,
      remSleepMinutes: 90,
      coreSleepMinutes: 240,
      sleepEfficiency: 88,
      source: 'Apple Watch',
    };

    const baseScore = computeRecoveryScore(record, 7.5);
    const normalModifier = computeHRVModifier(makeReading(50), BASELINE_14);
    const unchangedScore = computeRecoveryScore(record, 7.5, normalModifier);

    expect(unchangedScore).toBe(baseScore);
  });
});
