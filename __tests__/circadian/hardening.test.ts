/**
 * Hardening regression tests — A/B stress-test pass, 2026-05-23.
 *
 * Each test pins a defect surfaced by the stress-test attacker swarm.
 * Written test-first: every test here fails against the pre-hardening
 * checkpoint commit and passes after the corresponding fix.
 *
 * Coverage:
 *  - Bug 1: resolveOverlaps ignored meal/light/caffeine (orphans + overlaps)
 *  - Bug 2: recovery / day-1 meal anchoring silently dropped windows
 *  - Input validation: invalid dates, reversed ranges, malformed shifts
 *  - computeStats: differenceInHours truncation under-counted sleep
 *  - classifyDays: overnight shift double-counted a recovery day
 */

import { generateSleepPlan } from '../../src/lib/circadian';
import { generateMealWindows } from '../../src/lib/circadian/meals';
import { computeSleepBlocks } from '../../src/lib/circadian/sleep-windows';
import { classifyDays, classifyShiftType } from '../../src/lib/circadian/classify-shifts';
import type {
  ShiftEvent,
  ClassifiedDay,
  UserProfile,
  PlanBlock,
  SleepPlan,
} from '../../src/lib/circadian/types';
import { DEFAULT_PROFILE } from '../../src/lib/circadian/types';

function makeShift(id: string, startISO: string, endISO: string): ShiftEvent {
  const start = new Date(startISO);
  const end = new Date(endISO);
  return { id, title: `Shift ${id}`, start, end, shiftType: classifyShiftType(start, end) };
}

/** Two blocks overlap if they share any open time interval. */
function overlaps(a: PlanBlock, b: PlanBlock): boolean {
  return a.start.getTime() < b.end.getTime() && b.start.getTime() < a.end.getTime();
}

/** All overlapping pairs among blocks of a given type (catches caffeine
 *  point-cutoffs nested inside caffeine windows too — both share the type). */
function sameTypeOverlaps(blocks: PlanBlock[], type: string): string[] {
  const group = blocks.filter((b) => b.type === type);
  const pairs: string[] = [];
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      if (overlaps(group[i], group[j])) pairs.push(`${group[i].id} ∩ ${group[j].id}`);
    }
  }
  return pairs;
}

/** Derived blocks whose day has no surviving main-sleep block. */
function orphanedBlocks(plan: SleepPlan): PlanBlock[] {
  const sleepDays = new Set(
    plan.blocks.filter((b) => b.type === 'main-sleep').map((b) => b.id.slice(0, 10)),
  );
  const derived = ['meal-window', 'caffeine-cutoff', 'light-seek', 'light-avoid', 'wind-down'];
  return plan.blocks.filter(
    (b) => derived.includes(b.type) && !sleepDays.has(b.id.slice(0, 10)),
  );
}

const LATE: UserProfile = { ...DEFAULT_PROFILE, chronotype: 'late' };
const EARLY: UserProfile = { ...DEFAULT_PROFILE, chronotype: 'early' };

/** Night stretch that bleeds outside the planning range (Agent 1's proven
 *  Bug-1 reproduction): drives adjacent per-day planners into the
 *  overlap / orphan conditions resolveOverlaps fails to clean up. */
function nightRotationPlan(profile: UserProfile = LATE): SleepPlan {
  const shifts = [
    makeShift('n0', '2026-03-14T19:00:00', '2026-03-15T07:00:00'),
    makeShift('n1', '2026-03-15T19:00:00', '2026-03-16T07:00:00'),
  ];
  return generateSleepPlan(new Date('2026-03-15'), new Date('2026-03-18'), shifts, [], profile);
}

describe('Hardening — Bug 1: resolveOverlaps covers meal / light / caffeine', () => {
  it('produces no overlapping meal-window blocks across adjacent days', () => {
    expect(sameTypeOverlaps(nightRotationPlan().blocks, 'meal-window')).toEqual([]);
  });

  it('produces no overlapping light-seek or light-avoid blocks', () => {
    const plan = nightRotationPlan();
    expect(sameTypeOverlaps(plan.blocks, 'light-seek')).toEqual([]);
    expect(sameTypeOverlaps(plan.blocks, 'light-avoid')).toEqual([]);
  });

  it('produces no overlapping caffeine blocks (windows or cutoffs)', () => {
    expect(sameTypeOverlaps(nightRotationPlan().blocks, 'caffeine-cutoff')).toEqual([]);
  });

  it('leaves no meal/light/caffeine block orphaned by a dropped main-sleep', () => {
    for (const profile of [DEFAULT_PROFILE, LATE, EARLY]) {
      expect(orphanedBlocks(nightRotationPlan(profile))).toEqual([]);
    }
  });
});

describe('Hardening — Bug 2: meal anchoring never silently drops a window', () => {
  function recoveryDay(dateStr: string): ClassifiedDay {
    return { date: new Date(dateStr), dayType: 'recovery', shift: null, personalEvents: [] };
  }

  it('keeps breakfast, lunch AND dinner on a recovery day (two sleep blocks)', () => {
    const day = recoveryDay('2026-03-15');
    const sleepBlocks = computeSleepBlocks(day, DEFAULT_PROFILE);
    const labels = generateMealWindows(day, DEFAULT_PROFILE, sleepBlocks).map((m) => m.label);
    expect(labels).toContain('Breakfast');
    expect(labels).toContain('Lunch');
    expect(labels).toContain('Dinner');
  });

  it('keeps recovery-day meal windows outside the sleep blocks', () => {
    const day = recoveryDay('2026-03-15');
    const sleepBlocks = computeSleepBlocks(day, DEFAULT_PROFILE);
    const meals = generateMealWindows(day, DEFAULT_PROFILE, sleepBlocks);
    const sleeps = sleepBlocks.filter((b) => b.type === 'main-sleep');
    for (const meal of meals) {
      for (const sleep of sleeps) {
        const inside =
          meal.start.getTime() >= sleep.start.getTime() &&
          meal.end.getTime() <= sleep.end.getTime();
        expect(inside).toBe(false);
      }
    }
  });
});

describe('Hardening — input validation', () => {
  it('throws a clear error on an invalid (NaN) date', () => {
    expect(() =>
      generateSleepPlan(new Date('not-a-date'), new Date('2026-03-16'), [], []),
    ).toThrow();
  });

  it('normalizes a reversed date range instead of producing a malformed plan', () => {
    const plan = generateSleepPlan(new Date('2026-03-20'), new Date('2026-03-15'), [], []);
    expect(plan.warnings && plan.warnings.length).toBeTruthy();
    for (let i = 1; i < plan.classifiedDays.length; i++) {
      expect(plan.classifiedDays[i].date.getTime()).toBeGreaterThan(
        plan.classifiedDays[i - 1].date.getTime(),
      );
    }
    for (const b of plan.blocks) {
      expect(b.end.getTime()).toBeGreaterThan(b.start.getTime());
    }
  });

  it('drops a malformed shift (end <= start) and records a warning', () => {
    const good = makeShift('good', '2026-03-15T07:00:00', '2026-03-15T19:00:00');
    const bad: ShiftEvent = {
      id: 'bad',
      title: 'Bad',
      start: new Date('2026-03-16T19:00:00'),
      end: new Date('2026-03-16T11:00:00'),
      shiftType: 'night',
    };
    const plan = generateSleepPlan(
      new Date('2026-03-15'), new Date('2026-03-16'), [good, bad], [], DEFAULT_PROFILE,
    );
    expect(plan.warnings && plan.warnings.length).toBeTruthy();
    for (const b of plan.blocks) {
      expect(b.end.getTime()).toBeGreaterThan(b.start.getTime());
    }
  });
});

describe('Hardening — computeStats counts sleep without truncation', () => {
  it('reports a 7.5h sleep block as 7.5h, not 7h', () => {
    const plan = generateSleepPlan(
      new Date('2026-03-15'), new Date('2026-03-15'), [], [], DEFAULT_PROFILE,
    );
    expect(plan.stats.avgSleepHours).toBeCloseTo(7.5, 1);
  });
});

describe('Hardening — overnight shift no longer double-counts a day', () => {
  const nights = [
    makeShift('n1', '2026-03-15T19:00:00', '2026-03-16T07:00:00'),
    makeShift('n2', '2026-03-16T19:00:00', '2026-03-17T07:00:00'),
    makeShift('n3', '2026-03-17T19:00:00', '2026-03-18T07:00:00'),
  ];

  it('classifies a 3-night stretch as exactly 3 work-night days', () => {
    const days = classifyDays(new Date('2026-03-14'), new Date('2026-03-20'), nights);
    expect(days.filter((d) => d.dayType === 'work-night').length).toBe(3);
  });

  it('counts 3 night shifts as nightShiftCount 3 in stats', () => {
    const plan = generateSleepPlan(
      new Date('2026-03-14'), new Date('2026-03-20'), nights, [], DEFAULT_PROFILE,
    );
    expect(plan.stats.nightShiftCount).toBe(3);
  });
});
