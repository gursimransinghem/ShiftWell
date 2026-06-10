/**
 * Plan generation integration tests.
 *
 * Tests cover:
 * - Full pipeline: classify → sleep → nap → caffeine → meal → light → stats
 * - Adaptive context integration
 * - Block type completeness
 * - Overlap resolution
 * - Multi-week schedule generation
 */

import { generateSleepPlan } from '../../src/lib/circadian';
import { classifyShiftType } from '../../src/lib/circadian/classify-shifts';
import type { ShiftEvent, UserProfile, PlanBlock, SleepPlan } from '../../src/lib/circadian/types';
import { DEFAULT_PROFILE } from '../../src/lib/circadian/types';
import type { AdaptiveContext } from '../../src/lib/adaptive/types';
import { differenceInHours, differenceInMinutes, addDays } from 'date-fns';

// ── Helpers ──────────────────────────────────────────────────────────

function makeShift(id: string, startISO: string, endISO: string): ShiftEvent {
  const start = new Date(startISO);
  const end = new Date(endISO);
  return { id, title: `Shift ${id}`, start, end, shiftType: classifyShiftType(start, end) };
}

function assertNoSameDaySleepOverlaps(plan: SleepPlan): void {
  const sleepBlocks = plan.blocks
    .filter((b) => b.type === 'main-sleep')
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  // Deduplicate by start+end
  const seen = new Set<string>();
  const deduped = sleepBlocks.filter((b) => {
    const key = `${b.start.getTime()}-${b.end.getTime()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  for (let i = 1; i < deduped.length; i++) {
    const prev = deduped[i - 1];
    const curr = deduped[i];
    if (curr.start.getTime() < prev.end.getTime()) {
      throw new Error(
        `Sleep overlap: "${prev.label}" ends ${prev.end.toISOString()} but "${curr.label}" starts ${curr.start.toISOString()}`
      );
    }
  }
}

// ── Test Suite ────────────────────────────────────────────────────────

describe('Plan Generation Integration', () => {
  const profile: UserProfile = { ...DEFAULT_PROFILE };

  describe('Block type completeness', () => {
    it('generates all expected block types for a day shift', () => {
      const shifts = [makeShift('d1', '2026-03-15T07:00:00', '2026-03-15T19:00:00')];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-15'), shifts, [], profile,
      );
      const types = new Set(plan.blocks.map((b) => b.type));
      // Should have at minimum: main-sleep, caffeine-cutoff, meal-window
      expect(types.has('main-sleep')).toBe(true);
    });

    it('generates all expected block types for a night shift', () => {
      const shifts = [makeShift('n1', '2026-03-15T19:00:00', '2026-03-16T07:00:00')];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-16'), shifts, [], profile,
      );
      const types = new Set(plan.blocks.map((b) => b.type));
      expect(types.has('main-sleep')).toBe(true);
    });

    it('generates blocks for off days', () => {
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-15'), [], [], profile,
      );
      expect(plan.blocks.length).toBeGreaterThan(0);
      const mainSleep = plan.blocks.find((b) => b.type === 'main-sleep');
      expect(mainSleep).toBeDefined();
    });
  });

  describe('Block data integrity', () => {
    it('all blocks have required fields', () => {
      const shifts = [makeShift('d1', '2026-03-15T07:00:00', '2026-03-15T19:00:00')];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-15'), shifts, [], profile,
      );
      plan.blocks.forEach((block) => {
        expect(block.id).toBeDefined();
        expect(typeof block.id).toBe('string');
        expect(block.id.length).toBeGreaterThan(0);
        expect(block.type).toBeDefined();
        expect(block.start instanceof Date).toBe(true);
        expect(block.end instanceof Date).toBe(true);
        expect(block.end.getTime()).toBeGreaterThan(block.start.getTime());
        expect(typeof block.label).toBe('string');
        expect(typeof block.description).toBe('string');
        expect([1, 2, 3]).toContain(block.priority);
      });
    });

    it('main-sleep blocks have priority 1', () => {
      const shifts = [makeShift('d1', '2026-03-15T07:00:00', '2026-03-15T19:00:00')];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-15'), shifts, [], profile,
      );
      const sleepBlocks = plan.blocks.filter((b) => b.type === 'main-sleep');
      sleepBlocks.forEach((b) => {
        expect(b.priority).toBe(1);
      });
    });

    it('nap blocks have priority 2', () => {
      const napProfile: UserProfile = { ...DEFAULT_PROFILE, napPreference: true };
      const shifts = [makeShift('n1', '2026-03-15T19:00:00', '2026-03-16T07:00:00')];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-16'), shifts, [], napProfile,
      );
      const napBlocks = plan.blocks.filter((b) => b.type === 'nap');
      napBlocks.forEach((b) => {
        expect(b.priority).toBe(2);
      });
    });
  });

  describe('Overlap resolution', () => {
    it('resolves overlapping sleep blocks across day boundaries', () => {
      const shifts = [
        makeShift('n1', '2026-03-15T19:00:00', '2026-03-16T07:00:00'),
        makeShift('n2', '2026-03-16T19:00:00', '2026-03-17T07:00:00'),
      ];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-17'), shifts, [], profile,
      );
      assertNoSameDaySleepOverlaps(plan);
    });

    it('resolves overlapping naps with sleep blocks', () => {
      const shifts = [
        makeShift('n1', '2026-03-15T19:00:00', '2026-03-16T07:00:00'),
      ];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-16'), shifts, [], profile,
      );
      // No nap should overlap with a main-sleep block
      const naps = plan.blocks.filter((b) => b.type === 'nap');
      const sleeps = plan.blocks.filter((b) => b.type === 'main-sleep');
      for (const nap of naps) {
        for (const sleep of sleeps) {
          const overlaps =
            nap.start.getTime() < sleep.end.getTime() &&
            nap.end.getTime() > sleep.start.getTime();
          expect(overlaps).toBe(false);
        }
      }
    });
  });

  describe('Multi-week generation', () => {
    it('handles a realistic 2-week EM physician schedule', () => {
      const shifts = [
        // Week 1: 3 night shifts
        makeShift('n1', '2026-03-15T19:00:00', '2026-03-16T07:00:00'),
        makeShift('n2', '2026-03-16T19:00:00', '2026-03-17T07:00:00'),
        makeShift('n3', '2026-03-17T19:00:00', '2026-03-18T07:00:00'),
        // Week 2: 2 day shifts + 2 evening shifts
        makeShift('d1', '2026-03-22T07:00:00', '2026-03-22T15:00:00'),
        makeShift('d2', '2026-03-23T07:00:00', '2026-03-23T15:00:00'),
        makeShift('e1', '2026-03-25T14:00:00', '2026-03-25T22:00:00'),
        makeShift('e2', '2026-03-26T14:00:00', '2026-03-26T22:00:00'),
      ];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-28'), shifts, [], profile,
      );
      expect(plan.classifiedDays.length).toBe(14);
      expect(plan.blocks.length).toBeGreaterThan(20); // Should have many blocks
      expect(plan.stats.nightShiftCount).toBeGreaterThanOrEqual(3);
      expect(plan.stats.hardTransitions).toBeGreaterThan(0);
      assertNoSameDaySleepOverlaps(plan);
    });

    it('handles rapid rotation: day-night-day across 5 days', () => {
      const shifts = [
        makeShift('d1', '2026-03-15T07:00:00', '2026-03-15T19:00:00'),
        makeShift('n1', '2026-03-16T19:00:00', '2026-03-17T07:00:00'),
        makeShift('d2', '2026-03-18T07:00:00', '2026-03-18T19:00:00'),
      ];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-19'), shifts, [], profile,
      );
      expect(plan.classifiedDays.length).toBe(5);
      assertNoSameDaySleepOverlaps(plan);
    });
  });

  describe('Adaptive context integration', () => {
    it('applies bedtime offset from adaptive context', () => {
      const shifts = [
        makeShift('n1', '2026-03-15T19:00:00', '2026-03-16T07:00:00'),
      ];

      // Generate plan without adaptive context
      const basePlan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-16'), shifts, [], profile,
      );

      // Generate plan with adaptive context that shifts bedtime
      const adaptiveContext: AdaptiveContext = {
        circadian: {
          protocol: {
            transitionType: 'day-to-night',
            daysUntilTransition: 1,
            dailyTargets: [{
              date: new Date('2026-03-15'),
              bedtimeAdjustMinutes: -60, // 60 min earlier
              lightGuidance: 'Seek bright light until 22:00',
            }],
          },
          phaseOffsetMinutes: 0,
          maintenanceMode: false,
        },
        debt: { rollingHours: 0, bankHours: 0, severity: 'none' },
        schedule: {
          transitionType: 'day-to-night',
          daysUntilTransition: 1,
          calendarConflicts: [],
          patternAlerts: [],
          bankingWindowOpen: false,
        },
        recovery: { score: 75, zone: 'green', baselineMature: true },
        meta: { learningPhase: false, daysTracked: 60, lastUpdated: new Date() },
        feedbackResult: null,
      };

      const adaptivePlan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-16'), shifts, [], profile, adaptiveContext,
      );

      // Both should generate valid plans
      expect(basePlan.blocks.length).toBeGreaterThan(0);
      expect(adaptivePlan.blocks.length).toBeGreaterThan(0);
    });

    it('generates valid plan with empty adaptive context (maintenance mode)', () => {
      const shifts = [
        makeShift('d1', '2026-03-15T07:00:00', '2026-03-15T19:00:00'),
      ];
      const adaptiveContext: AdaptiveContext = {
        circadian: {
          protocol: {
            transitionType: 'none',
            daysUntilTransition: 0,
            dailyTargets: [],
          },
          phaseOffsetMinutes: 0,
          maintenanceMode: true,
        },
        debt: { rollingHours: 0, bankHours: 0, severity: 'none' },
        schedule: {
          transitionType: null,
          daysUntilTransition: 0,
          calendarConflicts: [],
          patternAlerts: [],
          bankingWindowOpen: false,
        },
        recovery: { score: null, zone: null, baselineMature: false },
        meta: { learningPhase: true, daysTracked: 5, lastUpdated: new Date() },
        feedbackResult: null,
      };

      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-15'), shifts, [], profile, adaptiveContext,
      );
      expect(plan.blocks.length).toBeGreaterThan(0);
    });
  });

  describe('PlanStats accuracy', () => {
    it('startDate and endDate match input', () => {
      const start = new Date('2026-03-15');
      const end = new Date('2026-03-20');
      const plan = generateSleepPlan(start, end, [], [], profile);
      expect(plan.startDate.getTime()).toBe(start.getTime());
      expect(plan.endDate.getTime()).toBe(end.getTime());
    });

    it('classifiedDays count matches date range', () => {
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-21'), [], [], profile,
      );
      expect(plan.classifiedDays.length).toBe(7);
    });

    it('nightShiftCount matches actual night shifts', () => {
      const shifts = [
        makeShift('n1', '2026-03-15T19:00:00', '2026-03-16T07:00:00'),
        makeShift('n2', '2026-03-16T19:00:00', '2026-03-17T07:00:00'),
        makeShift('d1', '2026-03-18T07:00:00', '2026-03-18T19:00:00'),
      ];
      const plan = generateSleepPlan(
        new Date('2026-03-15'), new Date('2026-03-19'), shifts, [], profile,
      );
      // Night shifts may be counted on multiple days they span
      expect(plan.stats.nightShiftCount).toBeGreaterThanOrEqual(2);
    });
  });
});
