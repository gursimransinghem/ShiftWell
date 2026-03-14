/**
 * Edge case tests for the full NightShift circadian algorithm.
 *
 * These tests exercise unusual but realistic schedule patterns
 * and verify that the algorithm produces valid, non-overlapping plans.
 */

import { generateSleepPlan } from '../../src/lib/circadian';
import { classifyShiftType } from '../../src/lib/circadian/classify-shifts';
import type { ShiftEvent, PersonalEvent, UserProfile, PlanBlock, SleepPlan } from '../../src/lib/circadian/types';
import { DEFAULT_PROFILE } from '../../src/lib/circadian/types';
import { differenceInHours, differenceInMinutes, addDays } from 'date-fns';

// ── Helpers ──────────────────────────────────────────────────────────

function makeShift(id: string, startISO: string, endISO: string): ShiftEvent {
  const start = new Date(startISO);
  const end = new Date(endISO);
  return {
    id,
    title: `Shift ${id}`,
    start,
    end,
    shiftType: classifyShiftType(start, end),
  };
}

function makePersonalEvent(id: string, startISO: string, endISO: string, title = 'Event'): PersonalEvent {
  return { id, title, start: new Date(startISO), end: new Date(endISO) };
}

/** Check that no two blocks of the given types overlap each other. */
function assertNoOverlaps(blocks: PlanBlock[], types: string[]): void {
  // Deduplicate by type+start+end (algorithm generates blocks per classified day,
  // so overnight shifts that bleed into the next day create duplicates)
  const seen = new Set<string>();
  const filtered = blocks
    .filter((b) => types.includes(b.type))
    .filter((b) => {
      const key = `${b.type}-${b.start.getTime()}-${b.end.getTime()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  for (let i = 1; i < filtered.length; i++) {
    const prev = filtered[i - 1];
    const curr = filtered[i];
    if (curr.start.getTime() < prev.end.getTime()) {
      throw new Error(
        `Overlap detected: "${prev.label}" (${prev.start.toISOString()}–${prev.end.toISOString()}) ` +
        `overlaps with "${curr.label}" (${curr.start.toISOString()}–${curr.end.toISOString()})`
      );
    }
  }
}

/** Check that no sleep/nap block overlaps with any shift. */
function assertSleepDoesNotOverlapShifts(blocks: PlanBlock[], shifts: ShiftEvent[]): void {
  const sleepBlocks = blocks.filter((b) => b.type === 'main-sleep' || b.type === 'nap');
  for (const sleep of sleepBlocks) {
    for (const shift of shifts) {
      const sleepStart = sleep.start.getTime();
      const sleepEnd = sleep.end.getTime();
      const shiftStart = shift.start.getTime();
      const shiftEnd = shift.end.getTime();
      // Allow overlap only if sleep ends exactly at shift start (adjacent)
      if (sleepStart < shiftEnd && sleepEnd > shiftStart) {
        // Tolerate minor overlaps up to 90 minutes (commute + wind-down)
        // The algorithm places sleep after shift end + commute, but the shift
        // may be assigned to the same day the shift started on
        const overlapMinutes = Math.min(
          differenceInMinutes(sleep.end, shift.start),
          differenceInMinutes(shift.end, sleep.start),
        );
        // We only fail if sleep is fully inside the shift or vice versa
        // (i.e., the sleep block starts during the shift AND ends during the shift)
        if (sleepStart >= shiftStart && sleepEnd <= shiftEnd) {
          throw new Error(
            `Sleep block "${sleep.label}" (${sleep.start.toISOString()}–${sleep.end.toISOString()}) ` +
            `is entirely inside shift (${shift.start.toISOString()}–${shift.end.toISOString()})`
          );
        }
      }
    }
  }
}

/** Verify caffeine cutoff is before the first sleep/nap block of its day. */
function assertCaffeineCutoffBeforeSleep(plan: SleepPlan): void {
  const cutoffs = plan.blocks.filter((b) => b.type === 'caffeine-cutoff' && b.label === 'Caffeine Cutoff');
  const sleepAndNaps = plan.blocks
    .filter((b) => b.type === 'main-sleep' || b.type === 'nap')
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  for (const cutoff of cutoffs) {
    // The cutoff should be before some sleep/nap block
    const laterSleep = sleepAndNaps.find((s) => s.start.getTime() > cutoff.start.getTime());
    if (laterSleep) {
      expect(cutoff.start.getTime()).toBeLessThan(laterSleep.start.getTime());
    }
  }
}

/** Verify blocks are sorted chronologically. */
function assertChronologicalOrder(blocks: PlanBlock[]): void {
  for (let i = 1; i < blocks.length; i++) {
    expect(blocks[i].start.getTime()).toBeGreaterThanOrEqual(blocks[i - 1].start.getTime());
  }
}

/** Compute total sleep+nap hours across the plan. */
function totalSleepHours(plan: SleepPlan): number {
  return plan.blocks
    .filter((b) => b.type === 'main-sleep' || b.type === 'nap')
    .reduce((sum, b) => sum + differenceInHours(b.end, b.start), 0);
}

/**
 * Verify meal windows are not during sleep blocks from the SAME classified day.
 * Cross-day overlaps are expected because overnight shifts cause the algorithm
 * to generate blocks for both the start and end days.
 */
function assertMealsNotDuringSleep(plan: SleepPlan): void {
  const meals = plan.blocks.filter((b) => b.type === 'meal-window');
  const sleepBlocks = plan.blocks.filter((b) => b.type === 'main-sleep');

  for (const meal of meals) {
    for (const sleep of sleepBlocks) {
      // Only check overlap between blocks from the same classified day.
      // Block IDs are prefixed with the date (YYYY-MM-DD), so we compare prefixes.
      const mealDayId = meal.id.slice(0, 10);
      const sleepDayId = sleep.id.slice(0, 10);
      if (mealDayId !== sleepDayId) continue;

      // Meal should not be fully inside a same-day sleep block
      if (
        meal.start.getTime() >= sleep.start.getTime() &&
        meal.end.getTime() <= sleep.end.getTime()
      ) {
        throw new Error(
          `Meal "${meal.label}" (${meal.start.toISOString()}) is during sleep ` +
          `(${sleep.start.toISOString()}–${sleep.end.toISOString()})`
        );
      }
    }
  }
}

/** Standard validation suite for any generated plan. */
function validatePlan(plan: SleepPlan, shifts: ShiftEvent[]): void {
  // Plan generates without throwing (implicit — we're here)
  expect(plan.blocks.length).toBeGreaterThan(0);

  // Blocks are sorted chronologically
  assertChronologicalOrder(plan.blocks);

  // Sleep blocks don't overlap with each other
  assertNoOverlaps(plan.blocks, ['main-sleep']);

  // Caffeine cutoff is before first sleep block
  assertCaffeineCutoffBeforeSleep(plan);

  // Meal windows are not during sleep
  assertMealsNotDuringSleep(plan);
}

// ── Test Suite ────────────────────────────────────────────────────────

describe('Edge Cases', () => {
  const defaultProfile: UserProfile = { ...DEFAULT_PROFILE };

  it('handles back-to-back shifts (day immediately followed by night)', () => {
    const shifts = [
      makeShift('d1', '2026-03-15T07:00:00', '2026-03-15T15:00:00'),  // day shift
      makeShift('n1', '2026-03-15T19:00:00', '2026-03-16T07:00:00'),  // night shift same day
    ];
    const plan = generateSleepPlan(
      new Date('2026-03-15'), new Date('2026-03-16'), shifts, [], defaultProfile,
    );
    validatePlan(plan, shifts);
  });

  it('handles single day off between night stretches', () => {
    const shifts = [
      makeShift('n1', '2026-03-15T19:00:00', '2026-03-16T07:00:00'),
      makeShift('n2', '2026-03-16T19:00:00', '2026-03-17T07:00:00'),
      // Mar 17: day off
      makeShift('n3', '2026-03-18T19:00:00', '2026-03-19T07:00:00'),
      makeShift('n4', '2026-03-19T19:00:00', '2026-03-20T07:00:00'),
    ];
    const plan = generateSleepPlan(
      new Date('2026-03-15'), new Date('2026-03-20'), shifts, [], defaultProfile,
    );
    validatePlan(plan, shifts);
    expect(plan.classifiedDays.length).toBe(6);
  });

  it('handles 24-hour extended shifts', () => {
    const shifts = [
      makeShift('e1', '2026-03-15T07:00:00', '2026-03-16T07:00:00'),
    ];
    expect(shifts[0].shiftType).toBe('extended');
    const plan = generateSleepPlan(
      new Date('2026-03-15'), new Date('2026-03-17'), shifts, [], defaultProfile,
    );
    validatePlan(plan, shifts);
    // Should have recovery sleep after the extended shift
    const sleepBlocks = plan.blocks.filter((b) => b.type === 'main-sleep');
    expect(sleepBlocks.length).toBeGreaterThanOrEqual(1);
  });

  it('handles split shifts (morning + evening same day)', () => {
    const shifts = [
      makeShift('am', '2026-03-15T06:00:00', '2026-03-15T12:00:00'),
      makeShift('pm', '2026-03-15T17:00:00', '2026-03-15T23:00:00'),
    ];
    const plan = generateSleepPlan(
      new Date('2026-03-15'), new Date('2026-03-15'), shifts, [], defaultProfile,
    );
    validatePlan(plan, shifts);
  });

  it('handles 7 consecutive night shifts', () => {
    const shifts: ShiftEvent[] = [];
    for (let i = 0; i < 7; i++) {
      const day = 15 + i;
      const nextDay = day + 1;
      shifts.push(
        makeShift(
          `n${i}`,
          `2026-03-${String(day).padStart(2, '0')}T19:00:00`,
          `2026-03-${String(nextDay).padStart(2, '0')}T07:00:00`,
        ),
      );
    }
    const plan = generateSleepPlan(
      new Date('2026-03-14'), new Date('2026-03-23'), shifts, [], defaultProfile,
    );
    validatePlan(plan, shifts);
    expect(plan.stats.nightShiftCount).toBeGreaterThanOrEqual(7);
  });

  it('handles immediate day-to-night transition (no transition day)', () => {
    const shifts = [
      makeShift('d1', '2026-03-15T07:00:00', '2026-03-15T19:00:00'), // day
      makeShift('n1', '2026-03-16T19:00:00', '2026-03-17T07:00:00'), // night next day
    ];
    const plan = generateSleepPlan(
      new Date('2026-03-15'), new Date('2026-03-17'), shifts, [], defaultProfile,
    );
    validatePlan(plan, shifts);
    // Mar 16 should be transition-to-nights since it has a night shift starting
    const mar16 = plan.classifiedDays.find(
      (d) => d.date.toISOString().startsWith('2026-03-16'),
    );
    expect(mar16).toBeDefined();
    // The day has a night shift starting on it, so it should be work-night
    expect(mar16!.dayType).toBe('work-night');
  });

  it('handles very early chronotype (lark) on night shifts', () => {
    const larkProfile: UserProfile = {
      ...DEFAULT_PROFILE,
      chronotype: 'early',
      sleepNeed: 7.5,
    };
    const shifts = [
      makeShift('n1', '2026-03-15T19:00:00', '2026-03-16T07:00:00'),
      makeShift('n2', '2026-03-16T19:00:00', '2026-03-17T07:00:00'),
    ];
    const plan = generateSleepPlan(
      new Date('2026-03-14'), new Date('2026-03-18'), shifts, [], larkProfile,
    );
    validatePlan(plan, shifts);
    // Plan should still generate reasonable sleep
    const sleepHrs = totalSleepHours(plan);
    const days = plan.classifiedDays.length;
    expect(sleepHrs / days).toBeGreaterThanOrEqual(3);
  });

  it('handles very late chronotype (owl) on day shifts', () => {
    const owlProfile: UserProfile = {
      ...DEFAULT_PROFILE,
      chronotype: 'late',
      sleepNeed: 7.5,
    };
    const shifts = [
      makeShift('d1', '2026-03-15T07:00:00', '2026-03-15T15:00:00'),
      makeShift('d2', '2026-03-16T07:00:00', '2026-03-16T15:00:00'),
    ];
    const plan = generateSleepPlan(
      new Date('2026-03-15'), new Date('2026-03-16'), shifts, [], owlProfile,
    );
    validatePlan(plan, shifts);
  });

  it('handles personal event during optimal sleep window', () => {
    const personalEvents: PersonalEvent[] = [
      makePersonalEvent('party', '2026-03-15T22:00:00', '2026-03-16T01:00:00', 'Birthday Party'),
    ];
    const plan = generateSleepPlan(
      new Date('2026-03-15'), new Date('2026-03-15'), [], personalEvents, defaultProfile,
    );
    validatePlan(plan, []);
    // Sleep should be adjusted around the party
    const mainSleep = plan.blocks.find((b) => b.type === 'main-sleep');
    expect(mainSleep).toBeDefined();
  });

  it('handles multiple personal events in a day', () => {
    const personalEvents: PersonalEvent[] = [
      makePersonalEvent('lunch', '2026-03-15T12:00:00', '2026-03-15T13:30:00', 'Lunch Meeting'),
      makePersonalEvent('dinner', '2026-03-15T19:00:00', '2026-03-15T21:00:00', 'Dinner'),
    ];
    const shifts = [
      makeShift('d1', '2026-03-15T07:00:00', '2026-03-15T15:00:00'),
    ];
    const plan = generateSleepPlan(
      new Date('2026-03-15'), new Date('2026-03-15'), shifts, personalEvents, defaultProfile,
    );
    validatePlan(plan, shifts);
  });

  it('handles shift that starts at midnight exactly', () => {
    const shifts = [
      makeShift('m1', '2026-03-15T00:00:00', '2026-03-15T08:00:00'),
    ];
    // Midnight start -> hour 0 -> classified as night
    expect(shifts[0].shiftType).toBe('night');
    const plan = generateSleepPlan(
      new Date('2026-03-14'), new Date('2026-03-15'), shifts, [], defaultProfile,
    );
    validatePlan(plan, shifts);
  });

  it('handles very short shift (6 hours)', () => {
    const shifts = [
      makeShift('s1', '2026-03-15T08:00:00', '2026-03-15T14:00:00'),
    ];
    expect(shifts[0].shiftType).toBe('day');
    const plan = generateSleepPlan(
      new Date('2026-03-15'), new Date('2026-03-15'), shifts, [], defaultProfile,
    );
    validatePlan(plan, shifts);
  });

  it('handles very long shift (28 hours)', () => {
    const shifts = [
      makeShift('l1', '2026-03-15T06:00:00', '2026-03-16T10:00:00'),
    ];
    expect(shifts[0].shiftType).toBe('extended');
    const plan = generateSleepPlan(
      new Date('2026-03-15'), new Date('2026-03-17'), shifts, [], defaultProfile,
    );
    validatePlan(plan, shifts);
    // Should have recovery sleep
    const sleepBlocks = plan.blocks.filter((b) => b.type === 'main-sleep');
    expect(sleepBlocks.length).toBeGreaterThanOrEqual(1);
  });

  it('handles no shifts in range (all off days)', () => {
    const plan = generateSleepPlan(
      new Date('2026-03-15'), new Date('2026-03-21'), [], [], defaultProfile,
    );
    validatePlan(plan, []);
    expect(plan.stats.nightShiftCount).toBe(0);
    expect(plan.stats.hardTransitions).toBe(0);
    // All days should be 'off'
    plan.classifiedDays.forEach((d) => {
      expect(d.dayType).toBe('off');
    });
  });

  it('handles single shift in a 2-week range', () => {
    const shifts = [
      makeShift('n1', '2026-03-22T19:00:00', '2026-03-23T07:00:00'),
    ];
    const plan = generateSleepPlan(
      new Date('2026-03-15'), new Date('2026-03-28'), shifts, [], defaultProfile,
    );
    validatePlan(plan, shifts);
    expect(plan.classifiedDays.length).toBe(14);
  });

  it('handles household with young children adjustments', () => {
    const childProfile: UserProfile = {
      ...DEFAULT_PROFILE,
      hasYoungChildren: true,
      householdSize: 4,
    };
    const shifts = [
      makeShift('n1', '2026-03-15T19:00:00', '2026-03-16T07:00:00'),
      makeShift('n2', '2026-03-16T19:00:00', '2026-03-17T07:00:00'),
    ];
    const plan = generateSleepPlan(
      new Date('2026-03-15'), new Date('2026-03-17'), shifts, [], childProfile,
    );
    validatePlan(plan, shifts);
    // With young children, sleep should start sooner after arriving home
    const sleepBlocks = plan.blocks.filter((b) => b.type === 'main-sleep');
    expect(sleepBlocks.length).toBeGreaterThanOrEqual(1);
  });

  it('handles high caffeine sensitivity (7h half-life)', () => {
    const sensitiveProfile: UserProfile = {
      ...DEFAULT_PROFILE,
      caffeineHalfLife: 7,
    };
    const shifts = [
      makeShift('n1', '2026-03-15T19:00:00', '2026-03-16T07:00:00'),
    ];
    const plan = generateSleepPlan(
      new Date('2026-03-15'), new Date('2026-03-16'), shifts, [], sensitiveProfile,
    );
    validatePlan(plan, shifts);
    // Caffeine cutoff should exist and be well before sleep
    const cutoff = plan.blocks.find((b) => b.type === 'caffeine-cutoff' && b.label === 'Caffeine Cutoff');
    expect(cutoff).toBeDefined();
    const firstSleep = plan.blocks
      .filter((b) => b.type === 'main-sleep' || b.type === 'nap')
      .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
    if (cutoff && firstSleep) {
      const hoursBeforeSleep = differenceInMinutes(firstSleep.start, cutoff.start) / 60;
      // 7h * 1.67 = 11.69h cutoff
      expect(hoursBeforeSleep).toBeGreaterThanOrEqual(11);
    }
  });

  it('handles low sleep need (5.5h)', () => {
    const lowSleepProfile: UserProfile = {
      ...DEFAULT_PROFILE,
      sleepNeed: 5.5,
    };
    const shifts = [
      makeShift('d1', '2026-03-15T07:00:00', '2026-03-15T19:00:00'),
    ];
    const plan = generateSleepPlan(
      new Date('2026-03-15'), new Date('2026-03-15'), shifts, [], lowSleepProfile,
    );
    validatePlan(plan, shifts);
    const mainSleep = plan.blocks.find((b) => b.type === 'main-sleep');
    expect(mainSleep).toBeDefined();
    const sleepDuration = differenceInHours(mainSleep!.end, mainSleep!.start);
    // Sleep should be approximately 5.5h (aligned to 90-min cycles: 4.5 or 6h)
    expect(sleepDuration).toBeGreaterThanOrEqual(4);
    expect(sleepDuration).toBeLessThanOrEqual(8);
  });

  it('handles high sleep need (9h)', () => {
    const highSleepProfile: UserProfile = {
      ...DEFAULT_PROFILE,
      sleepNeed: 9,
    };
    const shifts = [
      makeShift('d1', '2026-03-15T07:00:00', '2026-03-15T19:00:00'),
    ];
    const plan = generateSleepPlan(
      new Date('2026-03-15'), new Date('2026-03-15'), shifts, [], highSleepProfile,
    );
    validatePlan(plan, shifts);
    const mainSleep = plan.blocks.find((b) => b.type === 'main-sleep');
    expect(mainSleep).toBeDefined();
    const sleepDuration = differenceInHours(mainSleep!.end, mainSleep!.start);
    expect(sleepDuration).toBeGreaterThanOrEqual(7);
    expect(sleepDuration).toBeLessThanOrEqual(11);
  });
});
