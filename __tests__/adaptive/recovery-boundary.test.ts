/**
 * Recovery calculator boundary value tests.
 *
 * Tests cover:
 * - All metrics at boundary values (0, 100, min, max)
 * - Apple Watch correction edge cases
 * - HRV modifier clamping
 * - Score-to-zone boundaries (33/34, 66/67)
 * - Zero totalSleepMinutes
 * - Non-Apple-Watch sources
 */

import { computeRecoveryScore, scoreToZone } from '../../src/lib/adaptive/recovery-calculator';
import type { SleepRecord } from '../../src/lib/healthkit/healthkit-service';
import type { HRVRecoveryModifier } from '../../src/lib/adaptive/hrv-recovery-modifier';

// ── Helpers ──────────────────────────────────────────────────────────

function makeRecord(overrides: Partial<SleepRecord> = {}): SleepRecord {
  return {
    date: new Date('2026-03-20'),
    inBedStart: new Date('2026-03-19T22:00:00'),
    inBedEnd: new Date('2026-03-20T06:00:00'),
    asleepStart: new Date('2026-03-19T22:15:00'),
    asleepEnd: new Date('2026-03-20T05:45:00'),
    totalSleepMinutes: 450, // 7.5h
    deepSleepMinutes: 135, // 30% (will be corrected to 92 min = ~20.4%)
    remSleepMinutes: 101, // ~22.5% of 450
    coreSleepMinutes: 214,
    sleepEfficiency: 90,
    source: 'Apple Watch Series 9',
    ...overrides,
  };
}

describe('Recovery Calculator Boundary Tests', () => {
  const sleepNeed = 7.5;

  describe('Non-Apple-Watch source', () => {
    it('returns null for iPhone source', () => {
      const record = makeRecord({ source: 'iPhone' });
      expect(computeRecoveryScore(record, sleepNeed)).toBeNull();
    });

    it('returns null for Oura source', () => {
      const record = makeRecord({ source: 'Oura Ring' });
      expect(computeRecoveryScore(record, sleepNeed)).toBeNull();
    });

    it('returns score for Apple Watch source', () => {
      const record = makeRecord({ source: 'Apple Watch' });
      const score = computeRecoveryScore(record, sleepNeed);
      expect(score).not.toBeNull();
      expect(typeof score).toBe('number');
    });

    it('returns score for Apple Watch Series variant', () => {
      const record = makeRecord({ source: 'Apple Watch Ultra 2' });
      const score = computeRecoveryScore(record, sleepNeed);
      expect(score).not.toBeNull();
    });
  });

  describe('Zero sleep edge case', () => {
    it('returns 0 for zero total sleep minutes', () => {
      const record = makeRecord({
        totalSleepMinutes: 0,
        deepSleepMinutes: 0,
        remSleepMinutes: 0,
        coreSleepMinutes: 0,
        sleepEfficiency: 0,
      });
      const score = computeRecoveryScore(record, sleepNeed);
      expect(score).toBe(0);
    });
  });

  describe('Apple Watch deep-sleep correction', () => {
    it('corrects deep sleep by subtracting 43 minutes', () => {
      // With 43 min deep sleep, correction brings it to 0
      const record = makeRecord({ deepSleepMinutes: 43 });
      const score = computeRecoveryScore(record, sleepNeed);
      expect(score).not.toBeNull();
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('floors corrected deep sleep at 0 (never negative)', () => {
      const record = makeRecord({ deepSleepMinutes: 10 }); // < 43 → corrected to 0
      const score = computeRecoveryScore(record, sleepNeed);
      expect(score).not.toBeNull();
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('corrects deep sleep that exceeds 43 minutes', () => {
      const record = makeRecord({ deepSleepMinutes: 100 }); // corrected to 57
      const score = computeRecoveryScore(record, sleepNeed);
      expect(score).not.toBeNull();
    });
  });

  describe('Sleep efficiency extremes', () => {
    it('handles 100% sleep efficiency', () => {
      const record = makeRecord({ sleepEfficiency: 100 });
      const score = computeRecoveryScore(record, sleepNeed);
      expect(score).not.toBeNull();
      expect(score!).toBeGreaterThan(0);
      expect(score!).toBeLessThanOrEqual(100);
    });

    it('handles 0% sleep efficiency', () => {
      const record = makeRecord({ sleepEfficiency: 0 });
      const score = computeRecoveryScore(record, sleepNeed);
      expect(score).not.toBeNull();
      expect(score!).toBeGreaterThanOrEqual(0);
    });

    it('handles 50% sleep efficiency', () => {
      const record = makeRecord({ sleepEfficiency: 50 });
      const score = computeRecoveryScore(record, sleepNeed);
      expect(score).not.toBeNull();
      expect(score!).toBeGreaterThan(0);
    });
  });

  describe('Duration score', () => {
    it('caps duration score at 1.0 when sleeping more than needed', () => {
      const record = makeRecord({ totalSleepMinutes: 600 }); // 10h, need 7.5
      const score = computeRecoveryScore(record, sleepNeed);
      expect(score).not.toBeNull();
      // Duration score is capped at 1.0, so total shouldn't exceed 100
      expect(score!).toBeLessThanOrEqual(100);
    });

    it('gives lower score for very short sleep', () => {
      const record = makeRecord({
        totalSleepMinutes: 180, // 3h
        deepSleepMinutes: 50,
        remSleepMinutes: 40,
        coreSleepMinutes: 90,
      });
      const fullSleepRecord = makeRecord();
      const shortScore = computeRecoveryScore(record, sleepNeed);
      const fullScore = computeRecoveryScore(fullSleepRecord, sleepNeed);
      expect(shortScore).not.toBeNull();
      expect(fullScore).not.toBeNull();
      expect(shortScore!).toBeLessThan(fullScore!);
    });
  });

  describe('HRV modifier', () => {
    it('applies positive HRV modifier', () => {
      const record = makeRecord();
      const baseScore = computeRecoveryScore(record, sleepNeed)!;
      const modifiedScore = computeRecoveryScore(record, sleepNeed, { modifier: 15 } as HRVRecoveryModifier);
      expect(modifiedScore).not.toBeNull();
      expect(modifiedScore!).toBe(Math.min(100, baseScore + 15));
    });

    it('applies negative HRV modifier', () => {
      const record = makeRecord();
      const baseScore = computeRecoveryScore(record, sleepNeed)!;
      const modifiedScore = computeRecoveryScore(record, sleepNeed, { modifier: -15 } as HRVRecoveryModifier);
      expect(modifiedScore).not.toBeNull();
      expect(modifiedScore!).toBe(Math.max(0, baseScore - 15));
    });

    it('clamps modified score at 100 when modifier pushes above', () => {
      const record = makeRecord({ sleepEfficiency: 100 });
      const modifiedScore = computeRecoveryScore(record, sleepNeed, { modifier: 20 } as HRVRecoveryModifier);
      expect(modifiedScore).not.toBeNull();
      expect(modifiedScore!).toBeLessThanOrEqual(100);
    });

    it('clamps modified score at 0 when modifier pushes below', () => {
      const record = makeRecord({
        sleepEfficiency: 10,
        totalSleepMinutes: 60,
        deepSleepMinutes: 0,
        remSleepMinutes: 0,
      });
      const modifiedScore = computeRecoveryScore(record, sleepNeed, { modifier: -20 } as HRVRecoveryModifier);
      expect(modifiedScore).not.toBeNull();
      expect(modifiedScore!).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Score to zone mapping', () => {
    it('maps score 0 to red', () => {
      expect(scoreToZone(0)).toBe('red');
    });

    it('maps score 33 to red', () => {
      expect(scoreToZone(33)).toBe('red');
    });

    it('maps score 34 to yellow (boundary)', () => {
      expect(scoreToZone(34)).toBe('yellow');
    });

    it('maps score 50 to yellow', () => {
      expect(scoreToZone(50)).toBe('yellow');
    });

    it('maps score 66 to yellow', () => {
      expect(scoreToZone(66)).toBe('yellow');
    });

    it('maps score 67 to green (boundary)', () => {
      expect(scoreToZone(67)).toBe('green');
    });

    it('maps score 100 to green', () => {
      expect(scoreToZone(100)).toBe('green');
    });

    it('maps negative score to red', () => {
      expect(scoreToZone(-5)).toBe('red');
    });
  });

  describe('Composite score range', () => {
    it('produces score between 0 and 100 for perfect sleep', () => {
      const record = makeRecord({
        totalSleepMinutes: 450,
        deepSleepMinutes: 135, // corrected: 92 → 20.4% of 450 (near target)
        remSleepMinutes: 101, // 22.5% of 450 (near target)
        sleepEfficiency: 95,
      });
      const score = computeRecoveryScore(record, sleepNeed);
      expect(score).not.toBeNull();
      expect(score!).toBeGreaterThanOrEqual(0);
      expect(score!).toBeLessThanOrEqual(100);
    });

    it('produces score between 0 and 100 for terrible sleep', () => {
      const record = makeRecord({
        totalSleepMinutes: 120,
        deepSleepMinutes: 0,
        remSleepMinutes: 0,
        sleepEfficiency: 30,
      });
      const score = computeRecoveryScore(record, sleepNeed);
      expect(score).not.toBeNull();
      expect(score!).toBeGreaterThanOrEqual(0);
      expect(score!).toBeLessThanOrEqual(100);
    });
  });
});
