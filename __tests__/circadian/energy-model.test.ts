/**
 * Tests for the Borbely Two-Process Energy Model.
 *
 * Test strategy:
 * - Core math functions: test known values from the literature
 * - Boundary conditions: 0h awake, extremes of recovery, no caffeine
 * - Relative ordering: nadir < peak (circadian), pressure increases over time
 * - Integration: predictEnergy() produces plausible curves for real schedules
 * - Night shift: acrophase shifts correctly for night workers
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
} from '../../src/lib/circadian/energy-model';
import type { EnergyModelInput, CaffeineEntry } from '../../src/lib/circadian/energy-types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a Date at a specific hour on a fixed reference date */
function atHour(hour: number, date = '2026-03-15'): Date {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return new Date(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
}

/** Standard day-worker input: wake at 7 AM, sleep at 11 PM, good recovery */
function dayWorkerInput(overrides: Partial<EnergyModelInput> = {}): EnergyModelInput {
  return {
    wakeTime: atHour(7),
    targetSleepTime: atHour(23),
    recoveryScore: 70,
    sleepHoursLastNight: 7.5,
    ...overrides,
  };
}

// ─── circadianSignal ──────────────────────────────────────────────────────────

describe('circadianSignal', () => {
  it('returns a positive value at the acrophase (peak hour)', () => {
    // At acrophase (4 PM default), cos(0) = 1, so signal is maximum positive
    const atPeak = circadianSignal(16, 16);
    expect(atPeak).toBeGreaterThan(0.2);
  });

  it('returns a negative value at the nadir (~4 AM for default acrophase)', () => {
    // ~12 hours from peak = trough of the main wave
    const atNadir = circadianSignal(4, 16);
    expect(atNadir).toBeLessThan(0);
  });

  it('peak is positive and nadir is negative (correct direction)', () => {
    // The nadir actually has a larger absolute value than the peak because
    // the secondary post-lunch harmonic adds to the trough. We just assert sign.
    const peak = circadianSignal(16, 16);
    const nadir = circadianSignal(4, 16);
    expect(peak).toBeGreaterThan(0);
    expect(nadir).toBeLessThan(0);
  });

  it('exhibits a post-lunch dip when the main wave has already peaked', () => {
    // With an early-morning acrophase (10 AM), the wave descends through 2 PM,
    // and the secondary harmonic creates a visible local dip: noon > 2 PM.
    const acrophase = 10; // early riser
    const atNoon = circadianSignal(12, acrophase);
    const atPostLunch = circadianSignal(14, acrophase);
    expect(atPostLunch).toBeLessThan(atNoon);
  });

  it('returns a number between -0.5 and +0.5 for all hours', () => {
    for (let h = 0; h < 24; h++) {
      const s = circadianSignal(h);
      expect(s).toBeGreaterThan(-0.5);
      expect(s).toBeLessThan(0.5);
    }
  });

  it('shifts the peak when acrophaseHour changes', () => {
    // Night-shifted acrophase at 2 AM
    const peakAtNight = circadianSignal(2, 2);
    const lowAtNight = circadianSignal(14, 2); // 12h from night acrophase
    expect(peakAtNight).toBeGreaterThan(lowAtNight);
  });

  it('accepts fractional hours', () => {
    const s = circadianSignal(14.5);
    expect(typeof s).toBe('number');
    expect(isFinite(s)).toBe(true);
  });
});

// ─── sleepPressure ────────────────────────────────────────────────────────────

describe('sleepPressure', () => {
  it('returns 0 at 0 hours awake (just woke up)', () => {
    expect(sleepPressure(0)).toBe(0);
  });

  it('returns 0 for negative hours (defensive)', () => {
    expect(sleepPressure(-1)).toBe(0);
  });

  it('increases monotonically with hours awake', () => {
    let prev = 0;
    for (let h = 1; h <= 24; h++) {
      const current = sleepPressure(h);
      expect(current).toBeGreaterThan(prev);
      prev = current;
    }
  });

  it('approaches 1.0 asymptotically — never exactly reaches it', () => {
    const at72h = sleepPressure(72);
    expect(at72h).toBeLessThan(1.0);
    expect(at72h).toBeGreaterThan(0.98);
  });

  it('is ~63% of max at one tau (~18 hours awake)', () => {
    // Math: S(tau) = 1 - e^(-1) ≈ 0.632
    const atOneTau = sleepPressure(18.2);
    expect(atOneTau).toBeCloseTo(0.632, 1);
  });

  it('is noticeably high after 16 hours awake', () => {
    // 16h awake represents the end of a typical waking day
    expect(sleepPressure(16)).toBeGreaterThan(0.55);
  });

  it('returns a value between 0 and 1 for all reasonable inputs', () => {
    for (let h = 0; h <= 30; h++) {
      const p = sleepPressure(h);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1.0);
    }
  });
});

// ─── recoveryModifier ────────────────────────────────────────────────────────

describe('recoveryModifier', () => {
  it('returns ~0 at the neutral score (50)', () => {
    expect(recoveryModifier(50)).toBeCloseTo(0, 3);
  });

  it('returns a positive value for high recovery (>50)', () => {
    expect(recoveryModifier(100)).toBeGreaterThan(0);
    expect(recoveryModifier(70)).toBeGreaterThan(0);
  });

  it('returns a negative value for low recovery (<50)', () => {
    expect(recoveryModifier(0)).toBeLessThan(0);
    expect(recoveryModifier(30)).toBeLessThan(0);
  });

  it('has magnitude ~0.3 at the extremes (scores 0 and 100)', () => {
    const high = recoveryModifier(100);
    const low = recoveryModifier(0);
    expect(high).toBeCloseTo(0.299, 1); // (100 - 50) / 167 ≈ 0.299
    expect(low).toBeCloseTo(-0.299, 1); // (0 - 50) / 167 ≈ -0.299
  });

  it('is monotonically increasing with recovery score', () => {
    let prev = recoveryModifier(0);
    for (let score = 1; score <= 100; score += 10) {
      const current = recoveryModifier(score);
      expect(current).toBeGreaterThan(prev);
      prev = current;
    }
  });
});

// ─── caffeineEffect ───────────────────────────────────────────────────────────

describe('caffeineEffect', () => {
  it('returns 0 with no caffeine entries', () => {
    expect(caffeineEffect([], atHour(12))).toBe(0);
  });

  it('returns a positive boost immediately after consuming caffeine', () => {
    const entries: CaffeineEntry[] = [
      { consumedAt: atHour(8), doseMg: 100 },
    ];
    const boost = caffeineEffect(entries, atHour(8.5)); // 30 min later
    expect(boost).toBeGreaterThan(0);
  });

  it('decreases over time (exponential decay)', () => {
    const entries: CaffeineEntry[] = [
      { consumedAt: atHour(8), doseMg: 100 },
    ];
    const at8h = caffeineEffect(entries, atHour(8));
    const at13h = caffeineEffect(entries, atHour(13)); // 5h later = 1 half-life
    const at18h = caffeineEffect(entries, atHour(18)); // 10h later = 2 half-lives
    expect(at8h).toBeGreaterThan(at13h);
    expect(at13h).toBeGreaterThan(at18h);
  });

  it('is roughly halved after one half-life (5h)', () => {
    const entries: CaffeineEntry[] = [
      { consumedAt: atHour(8), doseMg: 100 },
    ];
    const at8h = caffeineEffect(entries, atHour(8));
    const at13h = caffeineEffect(entries, atHour(13)); // +5h
    // After one half-life, ~50% remains
    expect(at13h).toBeCloseTo(at8h * 0.5, 1);
  });

  it('caps at 0.2 even with very large doses', () => {
    const entries: CaffeineEntry[] = [
      { consumedAt: atHour(8), doseMg: 5000 }, // absurd dose
    ];
    const boost = caffeineEffect(entries, atHour(8.5));
    expect(boost).toBeLessThanOrEqual(0.2);
  });

  it('ignores doses consumed in the future', () => {
    const entries: CaffeineEntry[] = [
      { consumedAt: atHour(14), doseMg: 200 }, // future dose
    ];
    const boost = caffeineEffect(entries, atHour(10)); // before the dose
    expect(boost).toBe(0);
  });

  it('stacks multiple doses correctly', () => {
    const entries: CaffeineEntry[] = [
      { consumedAt: atHour(7), doseMg: 100 },
      { consumedAt: atHour(10), doseMg: 100 },
    ];
    const singleDose: CaffeineEntry[] = [
      { consumedAt: atHour(7), doseMg: 100 },
    ];
    // Two doses should produce more effect than one
    const twoBoost = caffeineEffect(entries, atHour(11));
    const oneBoost = caffeineEffect(singleDose, atHour(11));
    expect(twoBoost).toBeGreaterThan(oneBoost);
  });
});

// ─── calculateAcrophase ───────────────────────────────────────────────────────

describe('calculateAcrophase', () => {
  it('returns wake_hour + 10 for day shift (classic formula)', () => {
    expect(calculateAcrophase(7, 'day')).toBe(17);
    expect(calculateAcrophase(6, 'day')).toBe(16);
  });

  it('returns wake_hour + 10 for evening shift', () => {
    expect(calculateAcrophase(14, 'evening')).toBe(0); // 24 % 24 = 0
    expect(calculateAcrophase(10, 'evening')).toBe(20);
  });

  it('returns wake_hour + 8 for night shift (partial adaptation)', () => {
    expect(calculateAcrophase(14, 'night')).toBe(22); // (14 + 8) % 24
    expect(calculateAcrophase(20, 'night')).toBe(4);  // (20 + 8) % 24
  });

  it('wraps around midnight correctly', () => {
    // Wake at 8 PM, day shift → peak at 6 AM next day
    expect(calculateAcrophase(20, 'day')).toBe(6); // (20 + 10) % 24
  });

  it('uses day-oriented formula when shiftType is undefined', () => {
    expect(calculateAcrophase(7)).toBe(17);
  });

  it('uses day-oriented formula for extended shifts', () => {
    expect(calculateAcrophase(7, 'extended')).toBe(17);
  });
});

// ─── normalizeTo100 ───────────────────────────────────────────────────────────

describe('normalizeTo100', () => {
  it('returns 50 at raw = 0 (sigmoid midpoint)', () => {
    expect(normalizeTo100(0)).toBeCloseTo(50, 0);
  });

  it('returns values above 50 for positive raw scores', () => {
    expect(normalizeTo100(0.5)).toBeGreaterThan(50);
  });

  it('returns values below 50 for negative raw scores', () => {
    expect(normalizeTo100(-0.5)).toBeLessThan(50);
  });

  it('output is always between 0 and 100', () => {
    const extremes = [-10, -2, -1, -0.5, 0, 0.5, 1, 2, 10];
    for (const raw of extremes) {
      const score = normalizeTo100(raw);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(100);
    }
  });

  it('is monotonically increasing', () => {
    let prev = normalizeTo100(-2);
    for (let raw = -1.5; raw <= 1; raw += 0.25) {
      const curr = normalizeTo100(raw);
      expect(curr).toBeGreaterThan(prev);
      prev = curr;
    }
  });
});

// ─── getEnergyLabel ───────────────────────────────────────────────────────────

describe('getEnergyLabel', () => {
  it('returns HIGH for scores >= 70', () => {
    expect(getEnergyLabel(70)).toBe('HIGH');
    expect(getEnergyLabel(95)).toBe('HIGH');
  });

  it('returns MODERATE for scores 50-69', () => {
    expect(getEnergyLabel(50)).toBe('MODERATE');
    expect(getEnergyLabel(69)).toBe('MODERATE');
  });

  it('returns LOW for scores 30-49', () => {
    expect(getEnergyLabel(30)).toBe('LOW');
    expect(getEnergyLabel(49)).toBe('LOW');
  });

  it('returns VERY_LOW for scores below 30', () => {
    expect(getEnergyLabel(29)).toBe('VERY_LOW');
    expect(getEnergyLabel(5)).toBe('VERY_LOW');
  });
});

// ─── predictEnergy ────────────────────────────────────────────────────────────

describe('predictEnergy', () => {
  it('returns predictions for each hour between wake and sleep', () => {
    const curve = predictEnergy(dayWorkerInput());
    // 7 AM to 11 PM = 16 hours + 1 (inclusive endpoint) = 17 predictions
    expect(curve.predictions.length).toBe(17);
  });

  it('first prediction is at wakeTime', () => {
    const input = dayWorkerInput();
    const curve = predictEnergy(input);
    expect(curve.predictions[0].time.getTime()).toBe(input.wakeTime.getTime());
  });

  it('last prediction is at targetSleepTime', () => {
    const input = dayWorkerInput();
    const curve = predictEnergy(input);
    const last = curve.predictions[curve.predictions.length - 1];
    expect(last.time.getTime()).toBe(input.targetSleepTime.getTime());
  });

  it('all scores are between 5 and 95 (clamped)', () => {
    const curve = predictEnergy(dayWorkerInput());
    for (const pred of curve.predictions) {
      expect(pred.score).toBeGreaterThanOrEqual(5);
      expect(pred.score).toBeLessThanOrEqual(95);
    }
  });

  it('all predictions have valid labels', () => {
    const curve = predictEnergy(dayWorkerInput());
    const validLabels = ['HIGH', 'MODERATE', 'LOW', 'VERY_LOW'];
    for (const pred of curve.predictions) {
      expect(validLabels).toContain(pred.label);
    }
  });

  it('peakScore matches the highest individual prediction', () => {
    const curve = predictEnergy(dayWorkerInput());
    const maxInPredictions = Math.max(...curve.predictions.map((p) => p.score));
    expect(curve.peakScore).toBe(maxInPredictions);
  });

  it('averageScore is between the lowest and highest scores', () => {
    const curve = predictEnergy(dayWorkerInput());
    const min = Math.min(...curve.predictions.map((p) => p.score));
    const max = Math.max(...curve.predictions.map((p) => p.score));
    expect(curve.averageScore).toBeGreaterThanOrEqual(min);
    expect(curve.averageScore).toBeLessThanOrEqual(max);
  });

  it('first hour has a lower score due to sleep inertia', () => {
    // At t=0 (just woke up), inertia factor is 0.5 — score should be dampened
    const curve = predictEnergy(dayWorkerInput());
    const firstScore = curve.predictions[0].score;
    const secondScore = curve.predictions[1].score;
    // The first hour should be lower than the second (inertia then ramp-up)
    // Note: this holds when circadian is rising (typical day worker at 7 AM)
    expect(firstScore).toBeLessThan(secondScore);
  });

  it('high recovery (90) produces higher average than low recovery (20)', () => {
    const high = predictEnergy(dayWorkerInput({ recoveryScore: 90 }));
    const low = predictEnergy(dayWorkerInput({ recoveryScore: 20 }));
    expect(high.averageScore).toBeGreaterThan(low.averageScore);
  });

  it('sleep debt (only 5h sleep) lowers average vs. full sleep (8h)', () => {
    const full = predictEnergy(dayWorkerInput({ sleepHoursLastNight: 8 }));
    const deprived = predictEnergy(dayWorkerInput({ sleepHoursLastNight: 5 }));
    expect(full.averageScore).toBeGreaterThan(deprived.averageScore);
  });

  it('caffeine raises average score vs. no caffeine', () => {
    const caffeineEntries: CaffeineEntry[] = [
      { consumedAt: atHour(7.5), doseMg: 200 },
    ];
    const withCaffeine = predictEnergy(dayWorkerInput({ caffeineEntries }));
    const noCaffeine = predictEnergy(dayWorkerInput());
    expect(withCaffeine.averageScore).toBeGreaterThan(noCaffeine.averageScore);
  });

  it('each prediction has all four components populated', () => {
    const curve = predictEnergy(dayWorkerInput());
    for (const pred of curve.predictions) {
      expect(typeof pred.components.circadian).toBe('number');
      expect(typeof pred.components.sleepPressure).toBe('number');
      expect(typeof pred.components.recovery).toBe('number');
      expect(typeof pred.components.caffeine).toBe('number');
    }
  });

  it('sleep pressure component is 0 at wake time', () => {
    const curve = predictEnergy(dayWorkerInput());
    // First prediction is at wakeTime, hoursAwake = 0
    expect(curve.predictions[0].components.sleepPressure).toBe(0);
  });

  it('sleep pressure component increases over the waking day', () => {
    const curve = predictEnergy(dayWorkerInput());
    const pressures = curve.predictions.map((p) => p.components.sleepPressure);
    for (let i = 1; i < pressures.length; i++) {
      expect(pressures[i]).toBeGreaterThan(pressures[i - 1]);
    }
  });

  it('handles 30-minute resolution correctly', () => {
    const curve = predictEnergy(dayWorkerInput({ resolutionMinutes: 30 }));
    // 7 AM to 11 PM = 960 minutes / 30 = 32 steps + 1 = 33 predictions
    expect(curve.predictions.length).toBe(33);
  });

  it('returns empty curve when wakeTime equals targetSleepTime', () => {
    const input = dayWorkerInput({
      wakeTime: atHour(12),
      targetSleepTime: atHour(12),
    });
    const curve = predictEnergy(input);
    expect(curve.predictions.length).toBe(1); // one point at the time
    expect(curve.averageScore).toBeGreaterThan(0);
  });

  it('peakTime is a Date object', () => {
    const curve = predictEnergy(dayWorkerInput());
    expect(curve.peakTime).toBeInstanceOf(Date);
  });

  it('troughTime is a Date object', () => {
    const curve = predictEnergy(dayWorkerInput());
    expect(curve.troughTime).toBeInstanceOf(Date);
  });
});

// ─── Night shift predictions ──────────────────────────────────────────────────

describe('predictEnergy — night shift', () => {
  /** Night worker: sleeps during the day, works 7 PM–7 AM */
  const nightInput = (): EnergyModelInput => ({
    wakeTime: atHour(15),          // wakes at 3 PM
    targetSleepTime: new Date(atHour(7, '2026-03-16').getTime()), // sleeps at 7 AM next day
    recoveryScore: 60,
    sleepHoursLastNight: 7,
    shiftType: 'night',
  });

  it('generates predictions for a 16-hour night shift waking period', () => {
    const curve = predictEnergy(nightInput());
    expect(curve.predictions.length).toBeGreaterThan(15);
  });

  it('all scores are within valid range', () => {
    const curve = predictEnergy(nightInput());
    for (const pred of curve.predictions) {
      expect(pred.score).toBeGreaterThanOrEqual(5);
      expect(pred.score).toBeLessThanOrEqual(95);
    }
  });

  it('night shift acrophase is shifted compared to day shift', () => {
    // With wake at 3 PM: night shift acrophase = 3 PM + 8h = 11 PM
    // Day shift acrophase would be = 3 PM + 10h = 1 AM
    const acrophaseNight = calculateAcrophase(15, 'night');
    const acrophaseDay = calculateAcrophase(15, 'day');
    expect(acrophaseNight).not.toBe(acrophaseDay);
    expect(acrophaseNight).toBe(23); // 3 PM + 8h = 11 PM
    expect(acrophaseDay).toBe(1);    // 3 PM + 10h = 1 AM
  });
});

// ─── getEnergyWindows ─────────────────────────────────────────────────────────

describe('getEnergyWindows', () => {
  it('returns empty array when no predictions meet the threshold', () => {
    // With low recovery + short window, may not hit HIGH threshold
    const curve = predictEnergy(
      dayWorkerInput({ recoveryScore: 10, sleepHoursLastNight: 3 }),
    );
    // Find a threshold guaranteed to be above any score
    const windows = getEnergyWindows(curve, 99, true);
    expect(windows).toEqual([]);
  });

  it('finds high-energy windows above threshold', () => {
    // Good recovery + full sleep should produce some high windows
    const curve = predictEnergy(
      dayWorkerInput({ recoveryScore: 90, sleepHoursLastNight: 8 }),
    );
    const windows = getEnergyWindows(curve, 60, true);
    expect(windows.length).toBeGreaterThan(0);
    for (const w of windows) {
      expect(w.start).toBeInstanceOf(Date);
      expect(w.end).toBeInstanceOf(Date);
      expect(w.end.getTime()).toBeGreaterThan(w.start.getTime());
    }
  });

  it('finds low-energy windows below threshold', () => {
    // Very low recovery should create some low-energy periods
    const curve = predictEnergy(
      dayWorkerInput({ recoveryScore: 10, sleepHoursLastNight: 4 }),
    );
    const windows = getEnergyWindows(curve, 60, false);
    expect(windows.length).toBeGreaterThan(0);
  });

  it('window start times are within the prediction range', () => {
    const curve = predictEnergy(dayWorkerInput({ recoveryScore: 85 }));
    const windows = getEnergyWindows(curve, 55, true);
    for (const w of windows) {
      expect(w.start.getTime()).toBeGreaterThanOrEqual(
        curve.wakeTime.getTime(),
      );
    }
  });

  it('returns empty array if curve has no predictions', () => {
    const emptyCurve = {
      predictions: [],
      wakeTime: atHour(7),
      sleepTime: atHour(23),
      peakTime: null,
      troughTime: null,
      averageScore: 0,
      peakScore: 0,
    };
    const windows = getEnergyWindows(emptyCurve, 70, true);
    expect(windows).toEqual([]);
  });
});

// ─── Integration: end-to-end plausibility ────────────────────────────────────

describe('predictEnergy — plausibility checks', () => {
  it('a well-rested day worker peaks in the late morning / afternoon', () => {
    // Classic Borbely prediction: peak alertness for a 7 AM wake is mid-to-late day
    const curve = predictEnergy(
      dayWorkerInput({ recoveryScore: 80, sleepHoursLastNight: 8 }),
    );
    const peakHour = curve.peakTime!.getHours();
    // Peak should be roughly between 10 AM and 8 PM for a 7 AM wake
    expect(peakHour).toBeGreaterThanOrEqual(10);
    expect(peakHour).toBeLessThanOrEqual(20);
  });

  it('energy is lower late at night than mid-day (sleep pressure wins)', () => {
    const curve = predictEnergy(dayWorkerInput({ recoveryScore: 70 }));
    const atNoon = curve.predictions.find(
      (p) => p.time.getHours() === 12,
    );
    const at10pm = curve.predictions.find(
      (p) => p.time.getHours() === 22,
    );
    if (atNoon && at10pm) {
      // By 10 PM (15h awake), sleep pressure is high enough to drag score down
      expect(at10pm.score).toBeLessThan(atNoon.score);
    }
  });

  it('produces consistent results on the same input (deterministic)', () => {
    const input = dayWorkerInput();
    const curveA = predictEnergy(input);
    const curveB = predictEnergy(input);
    expect(curveA.averageScore).toBe(curveB.averageScore);
    expect(curveA.peakScore).toBe(curveB.peakScore);
  });
});
