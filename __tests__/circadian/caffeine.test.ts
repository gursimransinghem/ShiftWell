/**
 * Tests for caffeine cutoff calculations.
 *
 * Verifies that caffeine cutoff times are correctly computed
 * based on user sensitivity (half-life) and sleep/nap timing.
 */

import { computeCaffeineCutoff, computeCaffeineWindow, computeCutoffHours } from '../../src/lib/circadian/caffeine';
import { computeSleepBlocks } from '../../src/lib/circadian/sleep-windows';
import { generateNaps } from '../../src/lib/circadian/nap-engine';
import type { ClassifiedDay, UserProfile, PlanBlock } from '../../src/lib/circadian/types';
import { DEFAULT_PROFILE } from '../../src/lib/circadian/types';
import { differenceInMinutes } from 'date-fns';

// ── Helpers ──────────────────────────────────────────────────────────

function makeNightShiftDay(dateStr: string): ClassifiedDay {
  return {
    date: new Date(dateStr),
    dayType: 'work-night',
    shift: {
      id: `night-${dateStr}`,
      title: 'Night Shift',
      start: new Date(`${dateStr}T19:00:00`),
      end: new Date(`${dateStr.replace(/(\d{2})$/, (d) => String(Number(d) + 1).padStart(2, '0'))}T07:00:00`),
      shiftType: 'night',
    },
    personalEvents: [],
  };
}

function makeDayShiftDay(dateStr: string): ClassifiedDay {
  return {
    date: new Date(dateStr),
    dayType: 'work-day',
    shift: {
      id: `day-${dateStr}`,
      title: 'Day Shift',
      start: new Date(`${dateStr}T07:00:00`),
      end: new Date(`${dateStr}T15:00:00`),
      shiftType: 'day',
    },
    personalEvents: [],
  };
}

function getSleepAndNapBlocks(day: ClassifiedDay, profile: UserProfile): PlanBlock[] {
  const sleepBlocks = computeSleepBlocks(day, profile);
  const napBlocks = generateNaps(day, profile, sleepBlocks);
  return [...sleepBlocks, ...napBlocks];
}

// ── Tests ────────────────────────────────────────────────────────────

describe('Caffeine Cutoff', () => {
  describe('normal sensitivity (5h half-life)', () => {
    const normalProfile: UserProfile = { ...DEFAULT_PROFILE, caffeineHalfLife: 5 };

    it('computes cutoff ~8.35 hours before first sleep', () => {
      const day = makeNightShiftDay('2026-03-15');
      const blocks = getSleepAndNapBlocks(day, normalProfile);
      const cutoff = computeCaffeineCutoff(day, normalProfile, blocks);

      expect(cutoff).not.toBeNull();
      expect(cutoff!.type).toBe('caffeine-cutoff');
      expect(cutoff!.label).toBe('Caffeine Cutoff');

      // Find the earliest sleep/nap block
      const earliestSleep = blocks
        .filter((b) => b.type === 'main-sleep' || b.type === 'nap')
        .sort((a, b) => a.start.getTime() - b.start.getTime())[0];

      const minutesBefore = differenceInMinutes(earliestSleep.start, cutoff!.start);
      const hoursBefore = minutesBefore / 60;

      // 5h * 1.67 = 8.35h
      expect(hoursBefore).toBeCloseTo(8.35, 0);
    });
  });

  describe('high sensitivity (7h half-life)', () => {
    const highProfile: UserProfile = { ...DEFAULT_PROFILE, caffeineHalfLife: 7 };

    it('computes cutoff ~11.69 hours before first sleep', () => {
      const day = makeNightShiftDay('2026-03-15');
      const blocks = getSleepAndNapBlocks(day, highProfile);
      const cutoff = computeCaffeineCutoff(day, highProfile, blocks);

      expect(cutoff).not.toBeNull();

      const earliestSleep = blocks
        .filter((b) => b.type === 'main-sleep' || b.type === 'nap')
        .sort((a, b) => a.start.getTime() - b.start.getTime())[0];

      const minutesBefore = differenceInMinutes(earliestSleep.start, cutoff!.start);
      const hoursBefore = minutesBefore / 60;

      // 7h * 1.67 = 11.69h
      expect(hoursBefore).toBeCloseTo(11.69, 0);
    });
  });

  describe('low sensitivity (3h half-life)', () => {
    const lowProfile: UserProfile = { ...DEFAULT_PROFILE, caffeineHalfLife: 3 };

    it('computes cutoff ~5.01 hours before first sleep', () => {
      const day = makeDayShiftDay('2026-03-15');
      const blocks = getSleepAndNapBlocks(day, lowProfile);
      const cutoff = computeCaffeineCutoff(day, lowProfile, blocks);

      expect(cutoff).not.toBeNull();

      const earliestSleep = blocks
        .filter((b) => b.type === 'main-sleep' || b.type === 'nap')
        .sort((a, b) => a.start.getTime() - b.start.getTime())[0];

      const minutesBefore = differenceInMinutes(earliestSleep.start, cutoff!.start);
      const hoursBefore = minutesBefore / 60;

      // 3h * 1.67 = 5.01h
      expect(hoursBefore).toBeCloseTo(5.01, 0);
    });
  });

  describe('cutoff relative to sleep/nap', () => {
    it('cutoff is always before the first sleep or nap block', () => {
      const profile: UserProfile = { ...DEFAULT_PROFILE, caffeineHalfLife: 5, napPreference: true };
      const day = makeNightShiftDay('2026-03-15');
      const blocks = getSleepAndNapBlocks(day, profile);
      const cutoff = computeCaffeineCutoff(day, profile, blocks);

      expect(cutoff).not.toBeNull();

      const allSleepNap = blocks
        .filter((b) => b.type === 'main-sleep' || b.type === 'nap')
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      // Cutoff must be before the earliest sleep/nap block
      expect(cutoff!.start.getTime()).toBeLessThan(allSleepNap[0].start.getTime());
    });
  });

  describe('no sleep blocks', () => {
    it('returns null when no sleep blocks exist', () => {
      const day = makeDayShiftDay('2026-03-15');
      // Pass empty blocks array
      const cutoff = computeCaffeineCutoff(day, DEFAULT_PROFILE, []);
      expect(cutoff).toBeNull();
    });
  });

  describe('dose-aware cutoff (computeCutoffHours)', () => {
    // Formula: halfLife * log2(doseMg / 25mg threshold)
    // At 5h half-life:
    //   100mg: log2(100/25) = log2(4) = 2.0 × 5h = 10.0h
    //   200mg: log2(200/25) = log2(8) = 3.0 × 5h = 15.0h
    //   300mg: log2(300/25) ≈ 3.585 × 5h ≈ 17.9h

    it('100mg at 5h half-life requires ~10.0h cutoff', () => {
      const hours = computeCutoffHours(100, 5);
      expect(hours).toBeCloseTo(10.0, 1);
    });

    it('200mg (double dose) at 5h half-life requires ~15.0h cutoff', () => {
      const hours = computeCutoffHours(200, 5);
      expect(hours).toBeCloseTo(15.0, 1);
    });

    it('300mg (triple dose / energy drink) at 5h half-life requires ~17.9h cutoff', () => {
      const hours = computeCutoffHours(300, 5);
      expect(hours).toBeCloseTo(17.9, 0);
    });

    it('higher dose always requires a longer cutoff', () => {
      expect(computeCutoffHours(200, 5)).toBeGreaterThan(computeCutoffHours(100, 5));
      expect(computeCutoffHours(300, 5)).toBeGreaterThan(computeCutoffHours(200, 5));
    });

    it('longer half-life always requires a longer cutoff for same dose', () => {
      expect(computeCutoffHours(100, 7)).toBeGreaterThan(computeCutoffHours(100, 5));
    });
  });

  describe('dose-aware computeCaffeineCutoff', () => {
    const normalProfile: UserProfile = { ...DEFAULT_PROFILE, caffeineHalfLife: 5 };

    it('with 100mg dose, cutoff is ~10.0h before first sleep (vs legacy ~8.35h)', () => {
      const day = makeNightShiftDay('2026-03-15');
      const blocks = getSleepAndNapBlocks(day, normalProfile);
      const cutoff = computeCaffeineCutoff(day, normalProfile, blocks, 100);

      expect(cutoff).not.toBeNull();

      const earliestSleep = blocks
        .filter((b) => b.type === 'main-sleep' || b.type === 'nap')
        .sort((a, b) => a.start.getTime() - b.start.getTime())[0];

      const hoursBefore = differenceInMinutes(earliestSleep.start, cutoff!.start) / 60;
      expect(hoursBefore).toBeCloseTo(10.0, 0);
    });

    it('with 200mg dose, cutoff is ~15.0h before first sleep', () => {
      const day = makeNightShiftDay('2026-03-15');
      const blocks = getSleepAndNapBlocks(day, normalProfile);
      const cutoff = computeCaffeineCutoff(day, normalProfile, blocks, 200);

      expect(cutoff).not.toBeNull();

      const earliestSleep = blocks
        .filter((b) => b.type === 'main-sleep' || b.type === 'nap')
        .sort((a, b) => a.start.getTime() - b.start.getTime())[0];

      const hoursBefore = differenceInMinutes(earliestSleep.start, cutoff!.start) / 60;
      expect(hoursBefore).toBeCloseTo(15.0, 0);
    });

    it('dose-aware cutoff is earlier in the day than legacy cutoff (more conservative)', () => {
      const day = makeNightShiftDay('2026-03-15');
      const blocks = getSleepAndNapBlocks(day, normalProfile);
      const legacyCutoff = computeCaffeineCutoff(day, normalProfile, blocks);
      const doseCutoff = computeCaffeineCutoff(day, normalProfile, blocks, 100);

      expect(legacyCutoff).not.toBeNull();
      expect(doseCutoff).not.toBeNull();
      // Dose-aware (10h) should be earlier than legacy (8.35h)
      expect(doseCutoff!.start.getTime()).toBeLessThan(legacyCutoff!.start.getTime());
    });

    it('no dose parameter uses legacy formula (backward compatible)', () => {
      const day = makeNightShiftDay('2026-03-15');
      const blocks = getSleepAndNapBlocks(day, normalProfile);
      const cutoff = computeCaffeineCutoff(day, normalProfile, blocks);

      expect(cutoff).not.toBeNull();

      const earliestSleep = blocks
        .filter((b) => b.type === 'main-sleep' || b.type === 'nap')
        .sort((a, b) => a.start.getTime() - b.start.getTime())[0];

      const hoursBefore = differenceInMinutes(earliestSleep.start, cutoff!.start) / 60;
      // Legacy: 5h * 1.67 = 8.35h
      expect(hoursBefore).toBeCloseTo(8.35, 0);
    });

    it('dose-aware description mentions dose and 25mg threshold', () => {
      const day = makeDayShiftDay('2026-03-15');
      const blocks = getSleepAndNapBlocks(day, normalProfile);
      const cutoff = computeCaffeineCutoff(day, normalProfile, blocks, 150);

      expect(cutoff).not.toBeNull();
      expect(cutoff!.description).toContain('150mg');
      expect(cutoff!.description).toContain('25mg');
    });
  });

  describe('caffeine window', () => {
    it('generates a caffeine window for work days', () => {
      const day = makeDayShiftDay('2026-03-15');
      const blocks = getSleepAndNapBlocks(day, DEFAULT_PROFILE);
      const window = computeCaffeineWindow(day, DEFAULT_PROFILE, blocks);

      expect(window).not.toBeNull();
      expect(window!.label).toBe('Caffeine Window');
    });

    it('does not generate a caffeine window for off days', () => {
      const day: ClassifiedDay = {
        date: new Date('2026-03-15'),
        dayType: 'off',
        shift: null,
        personalEvents: [],
      };
      const blocks = computeSleepBlocks(day, DEFAULT_PROFILE);
      const window = computeCaffeineWindow(day, DEFAULT_PROFILE, blocks);

      expect(window).toBeNull();
    });

    it('caffeine window starts after wake time', () => {
      const day = makeDayShiftDay('2026-03-15');
      const blocks = getSleepAndNapBlocks(day, DEFAULT_PROFILE);
      const window = computeCaffeineWindow(day, DEFAULT_PROFILE, blocks);

      expect(window).not.toBeNull();

      const mainSleep = blocks.find((b) => b.type === 'main-sleep');
      expect(mainSleep).toBeDefined();
      // Window should start 30 min after wake
      expect(window!.start.getTime()).toBeGreaterThanOrEqual(mainSleep!.end.getTime());
    });
  });
});
