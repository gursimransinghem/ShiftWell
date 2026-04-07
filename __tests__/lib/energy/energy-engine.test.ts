/**
 * Tests for the Energy Curve Engine (Borbely Two-Process Model port).
 *
 * Validates: 24-hour curve, zone labels, caffeine cutoff, recovery modifier,
 * night shift peak shift, and post-lunch dip.
 *
 * ENERGY-01: Two-Process Model energy prediction (HK requirement).
 */

import {
  predictEnergyCurve,
  calculateCaffeineCutoff,
  zoneFromScore,
} from '../../../src/lib/energy/energy-engine';
import type { CaffeineDose, EnergyPrediction } from '../../../src/lib/energy/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Create a date at local midnight today + given hours.
 * Matches the engine's internal reference date (today at local hour 0).
 */
function makeTodayAt(hour: number, minute = 0): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('predictEnergyCurve', () => {
  test('returns exactly 24 entries (0-23)', () => {
    // Day worker: wake at 7 AM, sleep duration 7.5h
    const curve = predictEnergyCurve(7, 7.5);
    expect(curve).toHaveLength(24);
    // Verify hours 0-23 are present
    const hours = curve.map((e) => e.hour);
    for (let h = 0; h < 24; h++) {
      expect(hours).toContain(h);
    }
  });

  test('all scores are valid (0-100)', () => {
    const curve = predictEnergyCurve(7, 7.5);
    for (const entry of curve) {
      expect(entry.score).toBeGreaterThanOrEqual(0);
      expect(entry.score).toBeLessThanOrEqual(100);
    }
  });

  test('well-rested day worker peaks in late morning / afternoon window', () => {
    // Wake at 7 AM, 8h sleep, good recovery
    // calculateAcrophase(7) = (7 + 10) % 24 = 17 → peak around 5 PM for day shift
    const curve = predictEnergyCurve(7, 8, 80);
    const peakEntry = curve.reduce((best, e: EnergyPrediction) => (e.score > best.score ? e : best), curve[0]);
    // Peak is around wake+10h (17:00) for day workers; should be in afternoon window
    expect(peakEntry.hour).toBeGreaterThanOrEqual(9);
    expect(peakEntry.hour).toBeLessThanOrEqual(20);
  });

  test('post-lunch dip — secondary harmonic creates circadian dip around 2 PM', () => {
    // The energy model includes a 12h secondary harmonic with trough at 14:00 (2 PM).
    // The circadian dip is visible as a lower circadianComponent at hour 14
    // compared to hours 11 and 17 (both away from the 14h trough).
    const curve = predictEnergyCurve(7, 7.5, 70);
    const hourMap = Object.fromEntries(curve.map((e) => [e.hour, e.circadianComponent]));
    // circadianComponent at 14 should be lower than at 17 (acrophase peak direction)
    // This tests the secondary harmonic dipSignal subtraction in circadianSignal()
    expect(hourMap[14]).toBeLessThan(hourMap[17] ?? 0);
  });

  test('night worker with shifted sleep has peak in different time window', () => {
    // Night worker: sleep ends at 14:00 (2 PM), slept 8h
    // wakeHour=14, so peak should be ~8h later (22:00-ish)
    const dayWorkerCurve = predictEnergyCurve(7, 7.5, 70);
    const nightWorkerCurve = predictEnergyCurve(14, 8, 70);

    const dayPeak = dayWorkerCurve.reduce(
      (best, e: EnergyPrediction) => (e.score > best.score ? e : best),
      dayWorkerCurve[0],
    );
    const nightPeak = nightWorkerCurve.reduce(
      (best, e: EnergyPrediction) => (e.score > best.score ? e : best),
      nightWorkerCurve[0],
    );

    // Night worker peak should be later in the day (or shifted window)
    expect(nightPeak.hour).not.toBe(dayPeak.hour);
  });

  test('caffeine dose increases score temporarily around dose time', () => {
    const withoutCaffeine = predictEnergyCurve(7, 6, 50); // somewhat sleep-deprived
    const caffeineDose: CaffeineDose = {
      timeISO: makeTodayAt(8).toISOString(), // 8 AM today — matches engine reference
      mgCaffeine: 200, // strong dose
    };
    const withCaffeine = predictEnergyCurve(7, 6, 50, [caffeineDose]);

    // Score at 9 AM should be higher with caffeine (1h after dose, near peak effect)
    const hour9without = withoutCaffeine.find((e) => e.hour === 9)?.score ?? 0;
    const hour9with = withCaffeine.find((e) => e.hour === 9)?.score ?? 0;
    expect(hour9with).toBeGreaterThanOrEqual(hour9without);
    // caffeineEffect field at hour 9 should be > 0
    const caffeineFieldAt9 = withCaffeine.find((e) => e.hour === 9)?.caffeineEffect ?? 0;
    expect(caffeineFieldAt9).toBeGreaterThan(0);
  });

  test('low recovery modifier depresses all scores vs high recovery', () => {
    const lowRecovery = predictEnergyCurve(7, 7.5, 10); // terrible recovery
    const highRecovery = predictEnergyCurve(7, 7.5, 95); // great recovery

    const avgLow =
      lowRecovery.reduce((s, e: EnergyPrediction) => s + e.score, 0) / lowRecovery.length;
    const avgHigh =
      highRecovery.reduce((s: number, e: EnergyPrediction) => s + e.score, 0) / highRecovery.length;

    expect(avgHigh).toBeGreaterThan(avgLow);
  });

  test('zone labels map correctly to score thresholds', () => {
    const curve = predictEnergyCurve(7, 7.5);
    for (const entry of curve) {
      const expectedZone = zoneFromScore(entry.score);
      expect(entry.zone).toBe(expectedZone);
    }
  });

  test('caffeineEffect and circadianComponent fields populated', () => {
    const dose: CaffeineDose = {
      timeISO: makeTodayAt(8).toISOString(),
      mgCaffeine: 100,
    };
    const curve = predictEnergyCurve(7, 7.5, 70, [dose]);
    for (const entry of curve) {
      expect(typeof entry.circadianComponent).toBe('number');
      expect(typeof entry.sleepPressureComponent).toBe('number');
      expect(typeof entry.recoveryModifier).toBe('number');
      expect(typeof entry.caffeineEffect).toBe('number');
    }
  });
});

describe('calculateCaffeineCutoff', () => {
  test('caffeine cutoff is 2x half-life before planned sleep (default 5h half-life)', () => {
    // Planned sleep at 22:00 (22), default half-life 5h → cutoff = 22 - 10 = 12
    const cutoff = calculateCaffeineCutoff(22);
    expect(cutoff).toBe(12);
  });

  test('custom half-life used when provided', () => {
    // Planned sleep at 22:00, half-life 6h → cutoff = 22 - 12 = 10
    const cutoff = calculateCaffeineCutoff(22, 6);
    expect(cutoff).toBe(10);
  });

  test('handles midnight-crossing correctly (sleep at 1 AM)', () => {
    // Sleep at 1 AM (hour=1), cutoff = 1 - 10 = -9 → 15 (modulo 24)
    const cutoff = calculateCaffeineCutoff(1);
    expect(cutoff).toBe(15); // (1 - 10 + 24) % 24
  });
});

describe('zoneFromScore', () => {
  test('score > 80 → peak', () => {
    expect(zoneFromScore(85)).toBe('peak');
    expect(zoneFromScore(100)).toBe('peak');
  });

  test('score 60-80 → good', () => {
    expect(zoneFromScore(70)).toBe('good');
    expect(zoneFromScore(60)).toBe('good');
  });

  test('score 40-60 → low', () => {
    expect(zoneFromScore(50)).toBe('low');
    expect(zoneFromScore(40)).toBe('low');
  });

  test('score < 40 → critical', () => {
    expect(zoneFromScore(39)).toBe('critical');
    expect(zoneFromScore(0)).toBe('critical');
  });
});
