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

    // B8 (spec Part 6.2 ledger): the unbounded `halfLife * 1.67` legacy path is retired.
    // computeCaffeineCutoff now assumes a default 100mg dose and bounds the cutoff to
    // [6,9]h. Was: cutoff ~8.35h. Now: cutoff is exactly the 6h floor (100mg, 5h half-life).
    it('computes cutoff at the 6h floor before first sleep (100mg default, 5h half-life)', () => {
      const day = makeNightShiftDay('2026-03-15');
      const blocks = getSleepAndNapBlocks(day, normalProfile);
      const cutoff = computeCaffeineCutoff(day, normalProfile, blocks);

      expect(cutoff).not.toBeNull();
      expect(cutoff!.type).toBe('caffeine-cutoff');
      expect(cutoff!.label).toBe('Caffeine Cutoff');

      // Find the earliest sleep/nap block
      // HF-4: the cutoff anchors to the main sleep being protected, not the earliest
      // block (on a work-night day the earliest block is the pre-shift nap).
      const mainSleep = blocks.find((b) => b.type === 'main-sleep')!;

      const minutesBefore = differenceInMinutes(mainSleep.start, cutoff!.start);
      const hoursBefore = minutesBefore / 60;

      // SC-B8.2: moderate dose + normal metabolizer sits at / near the 6h floor.
      expect(hoursBefore).toBeCloseTo(6.0, 1);
      expect(hoursBefore).toBeGreaterThanOrEqual(6);
      expect(hoursBefore).toBeLessThanOrEqual(9);
    });
  });

  describe('high sensitivity (7h half-life)', () => {
    const highProfile: UserProfile = { ...DEFAULT_PROFILE, caffeineHalfLife: 7 };

    // B8: a slow metabolizer pushes the cutoff above the 6h floor but the hard 9h cap
    // holds. Was: cutoff ~11.69h (legacy 7h*1.67 — non-actionable). Now: bounded [6,9].
    it('computes a cutoff in the bounded [6,9]h band, above the 6h floor (7h half-life)', () => {
      const day = makeNightShiftDay('2026-03-15');
      const blocks = getSleepAndNapBlocks(day, highProfile);
      const cutoff = computeCaffeineCutoff(day, highProfile, blocks);

      expect(cutoff).not.toBeNull();

      // HF-4: the cutoff anchors to the main sleep being protected, not the earliest
      // block (on a work-night day the earliest block is the pre-shift nap).
      const mainSleep = blocks.find((b) => b.type === 'main-sleep')!;

      const minutesBefore = differenceInMinutes(mainSleep.start, cutoff!.start);
      const hoursBefore = minutesBefore / 60;

      // SC-B8.1: bounded [6,9]; slow metabolizer modifier lifts it above the 6h floor.
      expect(hoursBefore).toBeGreaterThan(6);
      expect(hoursBefore).toBeLessThanOrEqual(9);
    });
  });

  describe('low sensitivity (3h half-life)', () => {
    const lowProfile: UserProfile = { ...DEFAULT_PROFILE, caffeineHalfLife: 3 };

    // B8: a fast metabolizer can never drop the cutoff below the 6h NIOSH floor.
    // Was: cutoff ~5.01h (legacy 3h*1.67 — below the actionable floor). Now: floored at 6h.
    it('computes a cutoff floored at 6h before first sleep (fast 3h metabolizer)', () => {
      const day = makeDayShiftDay('2026-03-15');
      const blocks = getSleepAndNapBlocks(day, lowProfile);
      const cutoff = computeCaffeineCutoff(day, lowProfile, blocks);

      expect(cutoff).not.toBeNull();

      // HF-4: the cutoff anchors to the main sleep being protected, not the earliest
      // block (on a work-night day the earliest block is the pre-shift nap).
      const mainSleep = blocks.find((b) => b.type === 'main-sleep')!;

      const minutesBefore = differenceInMinutes(mainSleep.start, cutoff!.start);
      const hoursBefore = minutesBefore / 60;

      // SC-B8.1: the [6,9] band — a fast metabolizer is held at the 6h floor.
      expect(hoursBefore).toBeCloseTo(6.0, 1);
      expect(hoursBefore).toBeGreaterThanOrEqual(6);
    });
  });

  describe('cutoff relative to sleep/nap', () => {
    it('cutoff is before the main sleep it protects', () => {
      const profile: UserProfile = { ...DEFAULT_PROFILE, caffeineHalfLife: 5, napPreference: true };
      const day = makeNightShiftDay('2026-03-15');
      const blocks = getSleepAndNapBlocks(day, profile);
      const cutoff = computeCaffeineCutoff(day, profile, blocks);

      expect(cutoff).not.toBeNull();

      // HF-4: the cutoff anchors to the main sleep being protected — on a work-night
      // day the post-shift sleep, NOT the earliest (pre-shift nap) block.
      const mainSleep = blocks.find((b) => b.type === 'main-sleep')!;
      expect(cutoff!.start.getTime()).toBeLessThan(mainSleep.start.getTime());
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
    // B8 (spec Part 6.2 ledger): the unbounded `halfLife * log2(dose/25)` formula is
    // replaced. computeCutoffHours now returns a value bounded to [6,9]h — 6h default
    // (NIOSH), scaling toward a 9h hard cap for high doses + slow metabolizers.
    //   100mg @ 5h → 6.0h (floor)   200mg @ 5h → 6.0h (no dose modifier below 200mg)
    //   300mg @ 5h → 7.5h           400mg @ 12h → 9.0h (cap)

    // SC-B8.2 — moderate dose, normal metabolizer → at/near the 6h floor.
    it('100mg at 5h half-life returns a cutoff in [6,7] (at the 6h floor)', () => {
      const hours = computeCutoffHours(100, 5);
      expect(hours).toBeGreaterThanOrEqual(6);
      expect(hours).toBeLessThanOrEqual(7);
      expect(hours).toBeCloseTo(6.0, 1);
    });

    // SC-B8.1 — every cutoff is bounded [6,9].
    it('200mg (double dose) at 5h half-life returns a bounded cutoff in [6,9]', () => {
      const hours = computeCutoffHours(200, 5);
      expect(hours).toBeGreaterThanOrEqual(6);
      expect(hours).toBeLessThanOrEqual(9);
    });

    it('300mg (triple dose / energy drink) at 5h half-life returns a bounded cutoff in [6,9]', () => {
      const hours = computeCutoffHours(300, 5);
      expect(hours).toBeGreaterThanOrEqual(6);
      expect(hours).toBeLessThanOrEqual(9);
    });

    // SC-B8.3 — high dose + slow metabolizer saturates at the 9h hard cap.
    it('400mg at 12h half-life returns 9.0h (the hard cap)', () => {
      expect(computeCutoffHours(400, 12)).toBeCloseTo(9.0, 5);
    });

    // SC-B8.1 — bounded across every dose × half-life pair from the spec.
    it('every dose × half-life pair returns a value in [6,9]', () => {
      for (const dose of [50, 100, 200, 300, 400, 600]) {
        for (const halfLife of [3, 5, 8, 12]) {
          const hours = computeCutoffHours(dose, halfLife);
          expect(hours).toBeGreaterThanOrEqual(6);
          expect(hours).toBeLessThanOrEqual(9);
        }
      }
    });

    // SC-B8.4 — monotonic is now NON-STRICT (the cutoff saturates at the 9h cap, and
    // the dose modifier is flat below 200mg). Asserts `>=`, not `>`.
    it('higher dose never requires a shorter cutoff (non-strict monotonic in dose)', () => {
      expect(computeCutoffHours(200, 5)).toBeGreaterThanOrEqual(computeCutoffHours(100, 5));
      expect(computeCutoffHours(300, 5)).toBeGreaterThanOrEqual(computeCutoffHours(200, 5));
      expect(computeCutoffHours(600, 5)).toBeGreaterThanOrEqual(computeCutoffHours(400, 5));
    });

    // SC-B8.4 — non-strict monotonic in half-life as well.
    it('longer half-life never requires a shorter cutoff (non-strict monotonic in half-life)', () => {
      expect(computeCutoffHours(100, 7)).toBeGreaterThanOrEqual(computeCutoffHours(100, 5));
      expect(computeCutoffHours(100, 12)).toBeGreaterThanOrEqual(computeCutoffHours(100, 7));
    });
  });

  describe('dose-aware computeCaffeineCutoff', () => {
    const normalProfile: UserProfile = { ...DEFAULT_PROFILE, caffeineHalfLife: 5 };

    // B8 (spec Part 6.2 ledger): computeCaffeineCutoff now produces a bounded [6,9]h
    // cutoff for any dose. Was: 100mg → ~10h, 200mg → ~15h (non-actionable legacy).
    it('with 100mg dose, cutoff is bounded [6,9]h before first sleep (SC-B8.1)', () => {
      const day = makeNightShiftDay('2026-03-15');
      const blocks = getSleepAndNapBlocks(day, normalProfile);
      const cutoff = computeCaffeineCutoff(day, normalProfile, blocks, 100);

      expect(cutoff).not.toBeNull();

      // HF-4: the cutoff anchors to the main sleep being protected, not the earliest
      // block (on a work-night day the earliest block is the pre-shift nap).
      const mainSleep = blocks.find((b) => b.type === 'main-sleep')!;

      const hoursBefore = differenceInMinutes(mainSleep.start, cutoff!.start) / 60;
      expect(hoursBefore).toBeGreaterThanOrEqual(6);
      expect(hoursBefore).toBeLessThanOrEqual(9);
    });

    it('with 200mg dose, cutoff is bounded [6,9]h before first sleep (SC-B8.1)', () => {
      const day = makeNightShiftDay('2026-03-15');
      const blocks = getSleepAndNapBlocks(day, normalProfile);
      const cutoff = computeCaffeineCutoff(day, normalProfile, blocks, 200);

      expect(cutoff).not.toBeNull();

      // HF-4: the cutoff anchors to the main sleep being protected, not the earliest
      // block (on a work-night day the earliest block is the pre-shift nap).
      const mainSleep = blocks.find((b) => b.type === 'main-sleep')!;

      const hoursBefore = differenceInMinutes(mainSleep.start, cutoff!.start) / 60;
      expect(hoursBefore).toBeGreaterThanOrEqual(6);
      expect(hoursBefore).toBeLessThanOrEqual(9);
    });

    // B8: a higher dose never produces an *earlier* cutoff than a lower dose
    // (non-strict — both can sit at the 6h floor below 200mg).
    it('a higher dose never produces a cutoff later in the day than a lower dose', () => {
      const day = makeNightShiftDay('2026-03-15');
      const blocks = getSleepAndNapBlocks(day, normalProfile);
      const lowDose = computeCaffeineCutoff(day, normalProfile, blocks, 100);
      const highDose = computeCaffeineCutoff(day, normalProfile, blocks, 400);

      expect(lowDose).not.toBeNull();
      expect(highDose).not.toBeNull();
      // Higher dose → earlier-or-equal cutoff (start time is earlier-or-equal).
      expect(highDose!.start.getTime()).toBeLessThanOrEqual(lowDose!.start.getTime());
    });

    // B8: the no-dose path no longer uses the legacy 1.67x formula — it assumes a
    // default 100mg dose and produces the same bounded [6,9]h cutoff.
    it('no dose parameter assumes the default dose and stays bounded [6,9]h', () => {
      const day = makeNightShiftDay('2026-03-15');
      const blocks = getSleepAndNapBlocks(day, normalProfile);
      const cutoff = computeCaffeineCutoff(day, normalProfile, blocks);

      expect(cutoff).not.toBeNull();

      // HF-4: the cutoff anchors to the main sleep being protected, not the earliest
      // block (on a work-night day the earliest block is the pre-shift nap).
      const mainSleep = blocks.find((b) => b.type === 'main-sleep')!;

      const hoursBefore = differenceInMinutes(mainSleep.start, cutoff!.start) / 60;
      expect(hoursBefore).toBeGreaterThanOrEqual(6);
      expect(hoursBefore).toBeLessThanOrEqual(9);
    });

    // B8 / SC-B8.5: the shipping description names the dose and never claims a cutoff
    // above the 9h hard cap (the 25mg threshold language was retired from the string).
    it('dose-aware description mentions the dose and never states a cutoff over 9h', () => {
      const day = makeDayShiftDay('2026-03-15');
      const blocks = getSleepAndNapBlocks(day, normalProfile);
      const cutoff = computeCaffeineCutoff(day, normalProfile, blocks, 150);

      expect(cutoff).not.toBeNull();
      expect(cutoff!.description).toContain('150mg');
      // SC-B8.5 — the description must reference the 9h hard cap, never a larger value.
      expect(cutoff!.description).toContain('9h hard cap');
      expect(cutoff!.description).not.toMatch(/\b(1[0-9]|[2-9][0-9])h\b/);
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
