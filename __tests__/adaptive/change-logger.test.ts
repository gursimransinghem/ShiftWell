/**
 * Tests for the Adaptive Change Logger.
 *
 * Verifies computeDelta correctly detects bedtime shifts, wake shifts,
 * nap diffs, banking triggers, noise filtering, and sort order.
 */

import { computeDelta } from '../../src/lib/adaptive/change-logger';
import type { SleepPlan, PlanBlock } from '../../src/lib/circadian/types';
import type { AdaptiveContext } from '../../src/lib/adaptive/types';
import { addDays, startOfDay } from 'date-fns';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TODAY = startOfDay(new Date());

/** Format a local YYYY-MM-DD key (avoids UTC rollover) */
function localDateKey(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Build a minimal SleepPlan with a single main-sleep block */
function makePlan(sleepStart: Date, sleepEnd: Date): SleepPlan {
  const dateStr = localDateKey(sleepStart);
  return {
    blocks: [
      {
        id: `${dateStr}-main-sleep`,
        type: 'main-sleep',
        start: sleepStart,
        end: sleepEnd,
        label: 'Sleep',
        description: '',
        priority: 1,
      },
    ],
    startDate: sleepStart,
    endDate: sleepEnd,
    classifiedDays: [],
    stats: {
      avgSleepHours: 7.5,
      nightShiftCount: 0,
      hardTransitions: 0,
      circadianDebtScore: 0,
    },
  };
}

/** Build a plan with both a main-sleep and a nap block on the same date */
function makePlanWithNap(
  sleepStart: Date,
  sleepEnd: Date,
  napStart: Date,
  napEnd: Date,
): SleepPlan {
  const plan = makePlan(sleepStart, sleepEnd);
  const dateStr = localDateKey(napStart);
  const napBlock: PlanBlock = {
    id: `${dateStr}-nap`,
    type: 'nap',
    start: napStart,
    end: napEnd,
    label: 'Recovery Nap',
    description: '',
    priority: 2,
  };
  return { ...plan, blocks: [...plan.blocks, napBlock] };
}

/** Minimal AdaptiveContext with a circadian protocol active */
function makeContextWithProtocol(targetDate: Date): AdaptiveContext {
  return {
    circadian: {
      protocol: {
        transitionType: 'day-to-night',
        daysUntilTransition: 2,
        dailyTargets: [
          {
            date: targetDate,
            bedtimeAdjustMinutes: 90,
            lightGuidance: 'Dim lights after 9 PM.',
          },
        ],
      },
      phaseOffsetMinutes: 0,
      maintenanceMode: false,
    },
    debt: {
      rollingHours: 0,
      bankHours: 0,
      severity: 'none',
    },
    schedule: {
      transitionType: 'day-to-night',
      daysUntilTransition: 2,
      calendarConflicts: [],
      patternAlerts: [],
      bankingWindowOpen: false,
    },
    recovery: {
      score: null,
      zone: null,
      baselineMature: false,
    },
    feedbackResult: null,
    meta: {
      learningPhase: true,
      daysTracked: 5,
      lastUpdated: TODAY,
    },
  };
}

/** AdaptiveContext with debt severity and no protocol */
function makeContextWithDebt(rollingHours: number): AdaptiveContext {
  const severity =
    rollingHours < 0.5
      ? ('none' as const)
      : rollingHours < 2
        ? ('mild' as const)
        : rollingHours < 5
          ? ('moderate' as const)
          : ('severe' as const);

  return {
    circadian: {
      protocol: null,
      phaseOffsetMinutes: 0,
      maintenanceMode: true,
    },
    debt: {
      rollingHours,
      bankHours: 0,
      severity,
    },
    schedule: {
      transitionType: null,
      daysUntilTransition: 999,
      calendarConflicts: [],
      patternAlerts: [],
      bankingWindowOpen: false,
    },
    recovery: {
      score: null,
      zone: null,
      baselineMature: false,
    },
    feedbackResult: null,
    meta: {
      learningPhase: true,
      daysTracked: 5,
      lastUpdated: TODAY,
    },
  };
}

/** AdaptiveContext with banking window open */
function makeContextWithBanking(extraMins: number): AdaptiveContext {
  return {
    circadian: {
      protocol: null,
      phaseOffsetMinutes: 0,
      maintenanceMode: true,
    },
    debt: {
      rollingHours: 3,
      bankHours: 0,
      severity: 'moderate',
    },
    schedule: {
      transitionType: null,
      daysUntilTransition: 999,
      calendarConflicts: [],
      patternAlerts: [],
      bankingWindowOpen: true,
    },
    recovery: {
      score: null,
      zone: null,
      baselineMature: false,
    },
    feedbackResult: null,
    meta: {
      learningPhase: true,
      daysTracked: 5,
      lastUpdated: TODAY,
    },
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

// Use 08:00 as "bedtime" in all tests (realistic for post-night-shift sleepers)
// and 16:00 as "wake time". This avoids midnight crossings when adding minutes.

describe('computeDelta', () => {
  describe('identical plans', () => {
    it('returns empty array when plans are identical', () => {
      const sleepStart = new Date(TODAY);
      sleepStart.setHours(8, 0, 0, 0);
      const sleepEnd = new Date(TODAY);
      sleepEnd.setHours(16, 0, 0, 0);

      const plan = makePlan(sleepStart, sleepEnd);
      const ctx = makeContextWithDebt(0);

      const changes = computeDelta(plan, plan, ctx);
      expect(changes).toHaveLength(0);
    });
  });

  describe('bedtime shift', () => {
    it('detects 90-min bedtime shift with circadian factor', () => {
      // 08:00 → 09:30, same calendar day — no midnight crossing
      const oldBedtime = new Date(TODAY);
      oldBedtime.setHours(8, 0, 0, 0);
      const oldWake = new Date(TODAY);
      oldWake.setHours(16, 0, 0, 0);

      const newBedtime = new Date(oldBedtime.getTime() + 90 * 60_000); // 09:30
      const newWake = new Date(oldWake.getTime() + 90 * 60_000);       // 17:30

      const oldPlan = makePlan(oldBedtime, oldWake);
      const newPlan = makePlan(newBedtime, newWake);

      // Protocol active for TODAY (same date as the sleep blocks)
      const ctx = makeContextWithProtocol(TODAY);

      const changes = computeDelta(oldPlan, newPlan, ctx);

      expect(changes.length).toBeGreaterThan(0);

      const bedtimeChange = changes.find((c) => c.type === 'bedtime-shifted');
      expect(bedtimeChange).toBeDefined();
      expect(bedtimeChange?.magnitudeMinutes).toBe(90);
      expect(bedtimeChange?.factor).toBe('circadian');
      expect(bedtimeChange?.humanReadable).toBe('Bedtime shifted 90 min later');
    });

    it('generates correct reason string for circadian factor', () => {
      const oldBedtime = new Date(TODAY);
      oldBedtime.setHours(8, 0, 0, 0);
      const oldWake = new Date(TODAY);
      oldWake.setHours(16, 0, 0, 0);

      // Only shift bedtime — wake stays the same (valid: shorter sleep window)
      const newBedtime = new Date(oldBedtime.getTime() + 90 * 60_000);
      const newWake = new Date(oldWake.getTime());

      const oldPlan = makePlan(oldBedtime, oldWake);
      const newPlan = makePlan(newBedtime, newWake);

      const ctx = makeContextWithProtocol(TODAY);
      const changes = computeDelta(oldPlan, newPlan, ctx);

      const bedtimeChange = changes.find((c) => c.type === 'bedtime-shifted');
      expect(bedtimeChange?.reason).toMatch(/day to night/i);
      expect(bedtimeChange?.reason).toMatch(/in 2 days/i);
    });
  });

  describe('noise filtering', () => {
    it('filters out shifts smaller than 15 minutes', () => {
      const oldBedtime = new Date(TODAY);
      oldBedtime.setHours(8, 0, 0, 0);
      const oldWake = new Date(TODAY);
      oldWake.setHours(16, 0, 0, 0);

      // 10-min shift — below threshold
      const newBedtime = new Date(oldBedtime.getTime() + 10 * 60_000);
      const newWake = new Date(oldWake.getTime() + 10 * 60_000);

      const oldPlan = makePlan(oldBedtime, oldWake);
      const newPlan = makePlan(newBedtime, newWake);

      const ctx = makeContextWithDebt(0);
      const changes = computeDelta(oldPlan, newPlan, ctx);

      expect(changes).toHaveLength(0);
    });

    it('includes a shift of exactly 16 minutes (above threshold)', () => {
      const oldBedtime = new Date(TODAY);
      oldBedtime.setHours(8, 0, 0, 0);
      const oldWake = new Date(TODAY);
      oldWake.setHours(16, 0, 0, 0);

      const newBedtime = new Date(oldBedtime.getTime() + 16 * 60_000);
      const newWake = new Date(oldWake.getTime());

      const oldPlan = makePlan(oldBedtime, oldWake);
      const newPlan = makePlan(newBedtime, newWake);

      const ctx = makeContextWithDebt(0);
      const changes = computeDelta(oldPlan, newPlan, ctx);

      const bedtimeChange = changes.find((c) => c.type === 'bedtime-shifted');
      expect(bedtimeChange).toBeDefined();
      expect(bedtimeChange?.magnitudeMinutes).toBe(16);
    });
  });

  describe('nap detection', () => {
    it('detects nap-added when new plan has nap not in old plan', () => {
      const sleepStart = new Date(TODAY);
      sleepStart.setHours(8, 0, 0, 0);
      const sleepEnd = new Date(TODAY);
      sleepEnd.setHours(16, 0, 0, 0);

      // Nap on the NEXT day so it has a distinct date key from the main-sleep block
      const napDay = addDays(TODAY, 1);
      const napStart = new Date(napDay);
      napStart.setHours(13, 0, 0, 0);
      const napEnd = new Date(napStart.getTime() + 90 * 60_000);

      const oldPlan = makePlan(sleepStart, sleepEnd);
      const newPlan = makePlanWithNap(sleepStart, sleepEnd, napStart, napEnd);

      const ctx = makeContextWithDebt(3);
      const changes = computeDelta(oldPlan, newPlan, ctx);

      const napChange = changes.find((c) => c.type === 'nap-added');
      expect(napChange).toBeDefined();
      expect(napChange?.magnitudeMinutes).toBe(90);
      expect(napChange?.humanReadable).toMatch(/Recovery nap added at/i);
    });

    it('detects nap-removed when old plan has nap not in new plan', () => {
      const sleepStart = new Date(TODAY);
      sleepStart.setHours(8, 0, 0, 0);
      const sleepEnd = new Date(TODAY);
      sleepEnd.setHours(16, 0, 0, 0);

      const napDay = addDays(TODAY, 1);
      const napStart = new Date(napDay);
      napStart.setHours(13, 0, 0, 0);
      const napEnd = new Date(napStart.getTime() + 90 * 60_000);

      const oldPlan = makePlanWithNap(sleepStart, sleepEnd, napStart, napEnd);
      const newPlan = makePlan(sleepStart, sleepEnd);

      const ctx = makeContextWithDebt(0);
      const changes = computeDelta(oldPlan, newPlan, ctx);

      const napChange = changes.find((c) => c.type === 'nap-removed');
      expect(napChange).toBeDefined();
      expect(napChange?.humanReadable).toBe('Nap removed — sleep window extended');
    });
  });

  describe('sort order', () => {
    it('sorts changes by magnitudeMinutes descending', () => {
      // Use two separate days so we can have two independent main-sleep blocks
      // each with different shift magnitudes. Day 1: 90-min bedtime shift. Day 2: 30-min wake shift.
      const day1SleepStart = new Date(TODAY);
      day1SleepStart.setHours(8, 0, 0, 0);
      const day1SleepEnd = new Date(TODAY);
      day1SleepEnd.setHours(16, 0, 0, 0);

      const day2SleepStart = addDays(TODAY, 1);
      day2SleepStart.setHours(8, 0, 0, 0);
      const day2SleepEnd = addDays(TODAY, 1);
      day2SleepEnd.setHours(16, 0, 0, 0);

      // Old plan: both days at standard times
      const oldPlan: SleepPlan = {
        blocks: [
          {
            id: 'day1-main',
            type: 'main-sleep',
            start: day1SleepStart,
            end: day1SleepEnd,
            label: 'Sleep',
            description: '',
            priority: 1,
          },
          {
            id: 'day2-main',
            type: 'main-sleep',
            start: day2SleepStart,
            end: day2SleepEnd,
            label: 'Sleep',
            description: '',
            priority: 1,
          },
        ],
        startDate: day1SleepStart,
        endDate: day2SleepEnd,
        classifiedDays: [],
        stats: { avgSleepHours: 8, nightShiftCount: 0, hardTransitions: 0, circadianDebtScore: 0 },
      };

      // New plan: day1 bedtime 90 min later, day2 wake 30 min later
      const newPlan: SleepPlan = {
        blocks: [
          {
            id: 'day1-main',
            type: 'main-sleep',
            start: new Date(day1SleepStart.getTime() + 90 * 60_000),
            end: day1SleepEnd,
            label: 'Sleep',
            description: '',
            priority: 1,
          },
          {
            id: 'day2-main',
            type: 'main-sleep',
            start: day2SleepStart,
            end: new Date(day2SleepEnd.getTime() + 30 * 60_000),
            label: 'Sleep',
            description: '',
            priority: 1,
          },
        ],
        startDate: day1SleepStart,
        endDate: day2SleepEnd,
        classifiedDays: [],
        stats: { avgSleepHours: 8, nightShiftCount: 0, hardTransitions: 0, circadianDebtScore: 0 },
      };

      const ctx = makeContextWithDebt(2);
      const changes = computeDelta(oldPlan, newPlan, ctx);

      expect(changes.length).toBeGreaterThanOrEqual(2);

      // Verify descending order
      for (let i = 1; i < changes.length; i++) {
        expect(changes[i - 1].magnitudeMinutes).toBeGreaterThanOrEqual(
          changes[i].magnitudeMinutes,
        );
      }

      // Largest is the 90-min bedtime shift
      expect(changes[0].magnitudeMinutes).toBe(90);
      expect(changes[0].type).toBe('bedtime-shifted');
    });
  });

  describe('factor assignment', () => {
    it('assigns debt factor when no protocol active and debt exists', () => {
      const oldBedtime = new Date(TODAY);
      oldBedtime.setHours(8, 0, 0, 0);
      const oldWake = new Date(TODAY);
      oldWake.setHours(16, 0, 0, 0);

      const newBedtime = new Date(oldBedtime.getTime() + 60 * 60_000);
      const newWake = new Date(oldWake.getTime());

      const oldPlan = makePlan(oldBedtime, oldWake);
      const newPlan = makePlan(newBedtime, newWake);

      // Debt context, no protocol
      const ctx = makeContextWithDebt(3);
      const changes = computeDelta(oldPlan, newPlan, ctx);

      const bedtimeChange = changes.find((c) => c.type === 'bedtime-shifted');
      expect(bedtimeChange?.factor).toBe('debt');
      expect(bedtimeChange?.reason).toMatch(/sleep deficit/i);
    });

    it('assigns schedule factor when no protocol, no debt, and recovery is green/null', () => {
      const oldBedtime = new Date(TODAY);
      oldBedtime.setHours(8, 0, 0, 0);
      const oldWake = new Date(TODAY);
      oldWake.setHours(16, 0, 0, 0);

      const newBedtime = new Date(oldBedtime.getTime() + 60 * 60_000);
      const newWake = new Date(oldWake.getTime());

      const oldPlan = makePlan(oldBedtime, oldWake);
      const newPlan = makePlan(newBedtime, newWake);

      // No debt, no protocol, no recovery score
      const ctx = makeContextWithDebt(0);
      const changes = computeDelta(oldPlan, newPlan, ctx);

      const bedtimeChange = changes.find((c) => c.type === 'bedtime-shifted');
      expect(bedtimeChange?.factor).toBe('schedule');
    });
  });

  describe('banking-triggered', () => {
    it('emits banking-triggered when window is open and new plan has longer windows', () => {
      const oldBedtime = new Date(TODAY);
      oldBedtime.setHours(8, 0, 0, 0);
      const oldWake = new Date(TODAY);
      oldWake.setHours(16, 0, 0, 0); // 8h window

      // New plan extends wake by 45 min — longer total window triggers banking
      const newBedtime = new Date(oldBedtime);
      const newWake = new Date(oldWake.getTime() + 45 * 60_000);

      const oldPlan = makePlan(oldBedtime, oldWake);
      const newPlan = makePlan(newBedtime, newWake);

      const ctx = makeContextWithBanking(45);
      const changes = computeDelta(oldPlan, newPlan, ctx);

      const bankingChange = changes.find((c) => c.type === 'banking-triggered');
      expect(bankingChange).toBeDefined();
      expect(bankingChange?.magnitudeMinutes).toBe(45);
      expect(bankingChange?.humanReadable).toMatch(/Banking protocol active/i);
    });
  });
});
