/**
 * generateSleepPlan / computeStats integration tests — B2 (correctness bugs) + B6.
 *
 * Covers:
 *   SC-B2.3 — a plan whose sleep totals 6.5h reports avgSleepHours 6.5, not 6.0
 *             (minute-precision sum — the old differenceInHours() floored 6.5 → 6).
 *   SC-B2.4 — the sleep-debt penalty inside circadianDebtScore is driven by
 *             profile.sleepNeed, NOT a hardcoded 7.5.
 *   B6      — a work-night day's main-sleep block is ≥ sleepNeed*60 minus any placed
 *             pre-shift nap (the plan never bakes in a nightly deficit).
 *
 * computeStats is internal (spec B2) — it is verified through generateSleepPlan output.
 *
 * Spec: circadian-algorithm-upgrade-spec-2026-05-24-v1.md, Part 2 B2 + B6, Part 6.6 (AF-19).
 */

import { generateSleepPlan } from '../../src/lib/circadian';
import type { ShiftEvent, PersonalEvent, UserProfile } from '../../src/lib/circadian/types';
import { DEFAULT_PROFILE } from '../../src/lib/circadian/types';
import { differenceInMinutes } from 'date-fns';

// ── Helpers ──────────────────────────────────────────────────────────

function profileWith(overrides: Partial<UserProfile>): UserProfile {
  return { ...DEFAULT_PROFILE, ...overrides };
}

function nightShift(id: string, dateStr: string): ShiftEvent {
  return {
    id,
    title: 'Night Shift',
    start: new Date(`${dateStr}T19:00:00`),
    end: new Date(`${dateStr}T19:00:00`),
    shiftType: 'night',
  };
}

// ── SC-B2.3 — avgSleepHours is minute-precise ────────────────────────

describe('SC-B2.3: avgSleepHours reports half-hour precision', () => {
  it('a single off-day plan with a 6.5h sleep need reports avgSleepHours 6.5, not 6.0', () => {
    // An off day, sleepNeed 6.5h: computeOffDaySleep + the non-destructive cycle
    // alignment (B9) deliver an exact 390-min (6.5h) main-sleep block, no naps.
    const profile = profileWith({ chronotype: 'intermediate', sleepNeed: 6.5 });
    const plan = generateSleepPlan(
      new Date('2026-04-14T00:00:00'),
      new Date('2026-04-14T00:00:00'),
      [],
      [],
      profile,
    );

    // One classified day, one main-sleep block of exactly 6.5h.
    expect(plan.classifiedDays).toHaveLength(1);
    const mainSleep = plan.blocks.filter((b) => b.type === 'main-sleep');
    expect(mainSleep).toHaveLength(1);
    expect(differenceInMinutes(mainSleep[0].end, mainSleep[0].start)).toBe(390);

    // The 6.5h block must NOT be floored to 6.0 (the old differenceInHours bug).
    expect(plan.stats.avgSleepHours).toBeCloseTo(6.5, 5);
    expect(plan.stats.avgSleepHours).not.toBe(6.0);
  });
});

// ── SC-B2.4 — debt penalty is driven by profile.sleepNeed ────────────

describe('SC-B2.4: the sleep-debt penalty uses profile.sleepNeed', () => {
  // A personal event positioned across the off-day sleep window forces avoidConflicts
  // into its "event takes up most of the window" branch — a fixed 5h block regardless
  // of sleepNeed. That fixes avgSleepHours at 5h so only sleepNeed varies between the
  // two plans, isolating the debt penalty.
  const START = new Date('2026-04-14T00:00:00');
  const END = new Date('2026-04-14T00:00:00');
  const conflictingEvent: PersonalEvent = {
    id: 'evt',
    title: 'All-evening commitment',
    start: new Date('2026-04-14T23:30:00'),
    end: new Date('2026-04-15T05:30:00'),
  };

  function planForNeed(sleepNeed: number) {
    return generateSleepPlan(
      START, END, [], [conflictingEvent],
      profileWith({ chronotype: 'intermediate', sleepNeed }),
    );
  }

  it('both plans land on the same ~5h actual sleep (the schedule is held constant)', () => {
    const planA = planForNeed(7.5);
    const planB = planForNeed(9);
    // The forced-conflict block fixes avg sleep regardless of the sleep need.
    expect(planA.stats.avgSleepHours).toBeCloseTo(planB.stats.avgSleepHours, 5);
    expect(planA.stats.avgSleepHours).toBeLessThan(6); // genuinely below either need
  });

  it('a larger sleepNeed produces a larger circadianDebtScore for the same actual sleep', () => {
    const planNeed75 = planForNeed(7.5);
    const planNeed9 = planForNeed(9);

    // Same actual sleep, larger need → larger deficit → larger debt penalty.
    expect(planNeed9.stats.circadianDebtScore)
      .toBeGreaterThan(planNeed75.stats.circadianDebtScore);

    // The penalty is (sleepNeed − avgSleep) * 10. With avg ≈ 5h the scores are
    // ≈ 25 (need 7.5) and ≈ 40 (need 9): a ~15-point gap. A hardcoded 7.5 would
    // make the two scores identical — this gap proves profile.sleepNeed is the driver.
    expect(planNeed9.stats.circadianDebtScore - planNeed75.stats.circadianDebtScore)
      .toBeGreaterThanOrEqual(10);
  });
});

// ── B6 — a work-night main-sleep block is never below the need ────────

describe('B6: a work-night main-sleep block is sized to the full sleep need', () => {
  it('main-sleep + placed pre-shift nap ≥ sleepNeed*60 (no baked-in deficit)', () => {
    const profile = profileWith({
      chronotype: 'intermediate',
      sleepNeed: 7.5,
      napPreference: true,
    });
    const plan = generateSleepPlan(
      new Date('2026-04-14T00:00:00'),
      new Date('2026-04-14T00:00:00'),
      [nightShift('n1', '2026-04-14')],
      [],
      profile,
    );

    const dayKey = '2026-04-14';
    const mainSleep = plan.blocks.find(
      (b) => b.type === 'main-sleep' && b.id.startsWith(dayKey),
    );
    expect(mainSleep).toBeDefined();
    const mainMinutes = differenceInMinutes(mainSleep!.end, mainSleep!.start);

    const preShiftNap = plan.blocks.find((b) => b.id.endsWith('-pre-shift-nap'));
    const napMinutes = preShiftNap
      ? differenceInMinutes(preShiftNap.end, preShiftNap.start)
      : 0;

    const needMinutes = profile.sleepNeed * 60; // 450

    // The main block is sized to (need − placed nap); main + nap recovers the full need.
    expect(mainMinutes).toBeGreaterThanOrEqual(needMinutes - napMinutes);
    expect(mainMinutes + napMinutes).toBeGreaterThanOrEqual(needMinutes);
  });

  it('with napPreference off, the work-night main block is the FULL sleep need', () => {
    const profile = profileWith({
      chronotype: 'intermediate',
      sleepNeed: 7.5,
      napPreference: false,
    });
    const plan = generateSleepPlan(
      new Date('2026-04-14T00:00:00'),
      new Date('2026-04-14T00:00:00'),
      [nightShift('n1', '2026-04-14')],
      [],
      profile,
    );

    const mainSleep = plan.blocks.find(
      (b) => b.type === 'main-sleep' && b.id.startsWith('2026-04-14'),
    );
    expect(mainSleep).toBeDefined();
    // No nap placed → the main block carries the full 450-min sleep need.
    expect(differenceInMinutes(mainSleep!.end, mainSleep!.start))
      .toBeGreaterThanOrEqual(profile.sleepNeed * 60);
  });
});
