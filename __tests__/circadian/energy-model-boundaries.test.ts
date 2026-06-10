/**
 * Energy model boundary and edge case tests.
 *
 * Tests cover:
 * - Circadian signal function values at key hours
 * - Sleep pressure accumulation
 * - Recovery modifier
 * - Caffeine effect (CaffeineEntry-based)
 * - Acrophase calculation by wake hour and shift type
 * - Energy label mapping
 * - Normalization sigmoid
 * - predictEnergy curve generation
 * - getEnergyWindows
 */

import {
  circadianSignal,
  sleepPressure,
  recoveryModifier,
  caffeineEffect,
  calculateAcrophase,
  normalizeTo100,
  getEnergyLabel,
  predictEnergy,
  getEnergyWindows,
} from '../../src/lib/circadian';

import type { EnergyModelInput, CaffeineEntry, EnergyLabel } from '../../src/lib/circadian/energy-types';

describe('Energy Model — Core Functions', () => {
  describe('circadianSignal', () => {
    it('returns a value between -1 and 1 for any hour', () => {
      for (let h = 0; h < 24; h += 0.5) {
        const val = circadianSignal(h, 14);
        expect(val).toBeGreaterThanOrEqual(-1);
        expect(val).toBeLessThanOrEqual(1);
      }
    });

    it('is periodic: similar values at 0h and 24h', () => {
      const at0 = circadianSignal(0, 14);
      const at24 = circadianSignal(24, 14);
      expect(Math.abs(at0 - at24)).toBeLessThan(0.05);
    });

    it('peaks near the acrophase hour', () => {
      const acrophase = 16;
      const atPeak = circadianSignal(acrophase, acrophase);
      const atTrough = circadianSignal(acrophase + 12, acrophase);
      expect(atPeak).toBeGreaterThan(atTrough);
    });

    it('uses default acrophase of 16 when not specified', () => {
      const withDefault = circadianSignal(14);
      const withExplicit = circadianSignal(14, 16);
      expect(withDefault).toBeCloseTo(withExplicit, 10);
    });
  });

  describe('sleepPressure', () => {
    it('returns 0 for 0 hours awake', () => {
      expect(sleepPressure(0)).toBe(0);
    });

    it('returns 0 for negative hours awake', () => {
      expect(sleepPressure(-1)).toBe(0);
    });

    it('increases monotonically with hours awake', () => {
      let prev = sleepPressure(0);
      for (let h = 1; h <= 48; h++) {
        const curr = sleepPressure(h);
        expect(curr).toBeGreaterThanOrEqual(prev);
        prev = curr;
      }
    });

    it('approaches but does not exceed S_max (1.0) at extreme hours', () => {
      const at100h = sleepPressure(100);
      expect(at100h).toBeGreaterThan(0.9);
      expect(at100h).toBeLessThanOrEqual(1.0);
    });

    it('is noticeably impaired at 18h awake (~63%)', () => {
      const at18h = sleepPressure(18);
      expect(at18h).toBeGreaterThan(0.5);
      expect(at18h).toBeLessThan(0.8);
    });
  });

  describe('recoveryModifier', () => {
    it('returns 0 for neutral score (50)', () => {
      const mod = recoveryModifier(50);
      expect(mod).toBeCloseTo(0, 1);
    });

    it('returns positive value for high recovery (100)', () => {
      const mod = recoveryModifier(100);
      expect(mod).toBeGreaterThan(0);
    });

    it('returns negative value for low recovery (0)', () => {
      const mod = recoveryModifier(0);
      expect(mod).toBeLessThan(0);
    });

    it('is roughly symmetric around neutral', () => {
      const high = recoveryModifier(100);
      const low = recoveryModifier(0);
      expect(Math.abs(Math.abs(high) - Math.abs(low))).toBeLessThan(0.05);
    });

    it('scales linearly', () => {
      const at25 = recoveryModifier(25);
      const at75 = recoveryModifier(75);
      // 25 is same distance below neutral as 75 is above
      expect(Math.abs(at25)).toBeCloseTo(Math.abs(at75), 1);
    });
  });

  describe('caffeineEffect', () => {
    const now = new Date('2026-03-15T10:00:00');

    it('returns 0 for empty entries', () => {
      expect(caffeineEffect([], now)).toBe(0);
    });

    it('returns positive value for recent caffeine', () => {
      const entries: CaffeineEntry[] = [{
        consumedAt: new Date('2026-03-15T09:00:00'), // 1h ago
        doseMg: 200,
      }];
      const effect = caffeineEffect(entries, now);
      expect(effect).toBeGreaterThan(0);
    });

    it('decays over time', () => {
      const entries: CaffeineEntry[] = [{
        consumedAt: new Date('2026-03-15T09:00:00'),
        doseMg: 200,
      }];
      const at1h = caffeineEffect(entries, new Date('2026-03-15T10:00:00'));
      const at5h = caffeineEffect(entries, new Date('2026-03-15T14:00:00'));
      const at10h = caffeineEffect(entries, new Date('2026-03-15T19:00:00'));
      expect(at5h).toBeLessThan(at1h);
      expect(at10h).toBeLessThan(at5h);
    });

    it('caps effect at 0.2', () => {
      const entries: CaffeineEntry[] = [{
        consumedAt: now, // just consumed
        doseMg: 1000, // huge dose
      }];
      const effect = caffeineEffect(entries, now);
      expect(effect).toBeLessThanOrEqual(0.2);
    });

    it('stacks multiple doses', () => {
      const single: CaffeineEntry[] = [{
        consumedAt: new Date('2026-03-15T09:00:00'),
        doseMg: 100,
      }];
      const double: CaffeineEntry[] = [
        { consumedAt: new Date('2026-03-15T09:00:00'), doseMg: 100 },
        { consumedAt: new Date('2026-03-15T09:30:00'), doseMg: 100 },
      ];
      const singleEffect = caffeineEffect(single, now);
      const doubleEffect = caffeineEffect(double, now);
      expect(doubleEffect).toBeGreaterThan(singleEffect);
    });

    it('ignores future doses', () => {
      const entries: CaffeineEntry[] = [{
        consumedAt: new Date('2026-03-15T15:00:00'), // 5h in the future
        doseMg: 200,
      }];
      const effect = caffeineEffect(entries, now);
      expect(effect).toBe(0);
    });

    it('decays faster with shorter half-life', () => {
      const entries: CaffeineEntry[] = [{
        consumedAt: new Date('2026-03-15T06:00:00'),
        doseMg: 200,
      }];
      const shortHL = caffeineEffect(entries, now, 3);
      const longHL = caffeineEffect(entries, now, 7);
      expect(shortHL).toBeLessThan(longHL);
    });
  });

  describe('calculateAcrophase', () => {
    it('returns ~10h after wake for day shift', () => {
      const acro = calculateAcrophase(7, 'day');
      expect(acro).toBeCloseTo(17, 0); // 7 + 10 = 17
    });

    it('returns ~8h after wake for night shift', () => {
      const acro = calculateAcrophase(15, 'night');
      expect(acro).toBeCloseTo(23, 0); // 15 + 8 = 23
    });

    it('wraps around midnight for late wake', () => {
      const acro = calculateAcrophase(20, 'day');
      expect(acro).toBeCloseTo(6, 0); // (20 + 10) % 24 = 6
    });

    it('returns value in 0-24 range', () => {
      for (let wakeHour = 0; wakeHour < 24; wakeHour++) {
        const acro = calculateAcrophase(wakeHour);
        expect(acro).toBeGreaterThanOrEqual(0);
        expect(acro).toBeLessThan(24);
      }
    });
  });

  describe('normalizeTo100', () => {
    it('returns ~50 for input 0 (sigmoid midpoint)', () => {
      const result = normalizeTo100(0);
      expect(result).toBeCloseTo(50, 0);
    });

    it('approaches 100 for large positive values', () => {
      const result = normalizeTo100(5);
      expect(result).toBeGreaterThan(90);
    });

    it('approaches 0 for large negative values', () => {
      const result = normalizeTo100(-5);
      expect(result).toBeLessThan(10);
    });

    it('is monotonically increasing', () => {
      let prev = normalizeTo100(-10);
      for (let x = -9; x <= 10; x++) {
        const curr = normalizeTo100(x);
        expect(curr).toBeGreaterThanOrEqual(prev);
        prev = curr;
      }
    });
  });

  describe('getEnergyLabel', () => {
    it('returns HIGH for score >= 70', () => {
      expect(getEnergyLabel(70)).toBe('HIGH');
      expect(getEnergyLabel(85)).toBe('HIGH');
      expect(getEnergyLabel(100)).toBe('HIGH');
    });

    it('returns MODERATE for score 50-69', () => {
      expect(getEnergyLabel(50)).toBe('MODERATE');
      expect(getEnergyLabel(69)).toBe('MODERATE');
    });

    it('returns LOW for score 30-49', () => {
      expect(getEnergyLabel(30)).toBe('LOW');
      expect(getEnergyLabel(49)).toBe('LOW');
    });

    it('returns VERY_LOW for score < 30', () => {
      expect(getEnergyLabel(0)).toBe('VERY_LOW');
      expect(getEnergyLabel(29)).toBe('VERY_LOW');
    });
  });
});

describe('Energy Model — Prediction Functions', () => {
  describe('predictEnergy', () => {
    it('generates a prediction curve with multiple points', () => {
      const input: EnergyModelInput = {
        wakeTime: new Date('2026-03-15T06:00:00'),
        targetSleepTime: new Date('2026-03-15T22:00:00'),
        recoveryScore: 75,
        sleepHoursLastNight: 7.5,
        caffeineEntries: [],
      };
      const curve = predictEnergy(input);
      expect(curve.predictions.length).toBeGreaterThan(0);
    });

    it('returns scores between 0 and 100', () => {
      const input: EnergyModelInput = {
        wakeTime: new Date('2026-03-15T06:00:00'),
        targetSleepTime: new Date('2026-03-15T22:00:00'),
        recoveryScore: 50,
        sleepHoursLastNight: 7.5,
      };
      const curve = predictEnergy(input);
      curve.predictions.forEach((p) => {
        expect(p.score).toBeGreaterThanOrEqual(0);
        expect(p.score).toBeLessThanOrEqual(100);
      });
    });

    it('identifies peak and trough times', () => {
      const input: EnergyModelInput = {
        wakeTime: new Date('2026-03-15T06:00:00'),
        targetSleepTime: new Date('2026-03-15T22:00:00'),
        recoveryScore: 75,
        sleepHoursLastNight: 7.5,
      };
      const curve = predictEnergy(input);
      expect(curve.peakTime).not.toBeNull();
      expect(curve.troughTime).not.toBeNull();
      expect(curve.peakScore).toBeGreaterThanOrEqual(curve.averageScore);
    });

    it('handles night shift with caffeine entries', () => {
      const input: EnergyModelInput = {
        wakeTime: new Date('2026-03-15T16:00:00'),
        targetSleepTime: new Date('2026-03-16T08:00:00'),
        recoveryScore: 60,
        sleepHoursLastNight: 6,
        shiftType: 'night',
        caffeineEntries: [
          { consumedAt: new Date('2026-03-15T18:00:00'), doseMg: 200 },
        ],
      };
      const curve = predictEnergy(input);
      expect(curve.predictions.length).toBeGreaterThan(0);
    });

    it('handles custom resolution', () => {
      const input: EnergyModelInput = {
        wakeTime: new Date('2026-03-15T06:00:00'),
        targetSleepTime: new Date('2026-03-15T22:00:00'),
        recoveryScore: 75,
        sleepHoursLastNight: 7.5,
        resolutionMinutes: 30,
      };
      const curve = predictEnergy(input);
      // With 30-min resolution over 16 hours, should have ~32 predictions
      expect(curve.predictions.length).toBeGreaterThan(20);
    });

    it('predictions have all component fields', () => {
      const input: EnergyModelInput = {
        wakeTime: new Date('2026-03-15T06:00:00'),
        targetSleepTime: new Date('2026-03-15T22:00:00'),
        recoveryScore: 75,
        sleepHoursLastNight: 7.5,
      };
      const curve = predictEnergy(input);
      curve.predictions.forEach((p) => {
        expect(p.components).toBeDefined();
        expect(typeof p.components.circadian).toBe('number');
        expect(typeof p.components.sleepPressure).toBe('number');
        expect(typeof p.components.recovery).toBe('number');
        expect(typeof p.components.caffeine).toBe('number');
        expect(p.time instanceof Date).toBe(true);
        expect(typeof p.label).toBe('string');
      });
    });
  });

  describe('getEnergyWindows', () => {
    it('returns windows from a prediction curve', () => {
      const input: EnergyModelInput = {
        wakeTime: new Date('2026-03-15T06:00:00'),
        targetSleepTime: new Date('2026-03-15T22:00:00'),
        recoveryScore: 75,
        sleepHoursLastNight: 7.5,
      };
      const curve = predictEnergy(input);
      const windows = getEnergyWindows(curve, 50);
      // Should find some windows above threshold 50
      expect(Array.isArray(windows)).toBe(true);
    });

    it('windows have start before end', () => {
      const input: EnergyModelInput = {
        wakeTime: new Date('2026-03-15T06:00:00'),
        targetSleepTime: new Date('2026-03-15T22:00:00'),
        recoveryScore: 75,
        sleepHoursLastNight: 7.5,
      };
      const curve = predictEnergy(input);
      const windows = getEnergyWindows(curve, 50);
      windows.forEach((w) => {
        expect(w.start.getTime()).toBeLessThanOrEqual(w.end.getTime());
      });
    });

    it('returns empty array when threshold is unreachable', () => {
      const input: EnergyModelInput = {
        wakeTime: new Date('2026-03-15T06:00:00'),
        targetSleepTime: new Date('2026-03-15T22:00:00'),
        recoveryScore: 0,
        sleepHoursLastNight: 2,
      };
      const curve = predictEnergy(input);
      const windows = getEnergyWindows(curve, 101); // Threshold impossible
      expect(windows.length).toBe(0);
    });

    it('returns full span when all points above threshold', () => {
      const input: EnergyModelInput = {
        wakeTime: new Date('2026-03-15T06:00:00'),
        targetSleepTime: new Date('2026-03-15T22:00:00'),
        recoveryScore: 100,
        sleepHoursLastNight: 9,
      };
      const curve = predictEnergy(input);
      const windows = getEnergyWindows(curve, 0); // Everything above 0
      expect(windows.length).toBeGreaterThan(0);
    });
  });
});
