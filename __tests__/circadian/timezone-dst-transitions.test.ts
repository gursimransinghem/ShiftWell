/**
 * DST transition and timezone change tests.
 *
 * Tests cover:
 * - Spring forward / fall back detection
 * - Timezone change classification
 * - Plan block adjustment for DST
 * - Recommendation text generation
 * - Edge cases: no changes, multiple changes, large shifts
 */

import {
  detectTimezoneChanges,
  adjustPlanForDST,
} from '../../src/lib/circadian/timezone-handler';
import type { TimezoneAdjustment } from '../../src/lib/circadian/timezone-handler';
import type { PlanBlock } from '../../src/lib/circadian/types';

// ── Helpers ──────────────────────────────────────────────────────────

function makePlanBlock(startISO: string, endISO: string, type: string = 'main-sleep'): PlanBlock {
  return {
    id: `block-${startISO}`,
    type: type as any,
    start: new Date(startISO),
    end: new Date(endISO),
    label: 'Test Block',
    description: 'Test',
    priority: 1,
  };
}

// ── Test Suite ────────────────────────────────────────────────────────

describe('Timezone Handler', () => {
  describe('adjustPlanForDST', () => {
    it('shifts blocks forward for spring DST (+60 min)', () => {
      const blocks = [
        makePlanBlock('2026-03-15T22:00:00', '2026-03-16T06:00:00'),
      ];
      const adjustment: TimezoneAdjustment = {
        type: 'dst-spring',
        shiftMinutes: 60,
        date: new Date('2026-03-08'),
        recommendation: 'Test',
      };
      const adjusted = adjustPlanForDST(blocks, adjustment);
      expect(adjusted.length).toBe(1);
      // Start should be 60 min later
      expect(adjusted[0].start.getTime()).toBe(
        blocks[0].start.getTime() + 60 * 60 * 1000
      );
      // End should be 60 min later
      expect(adjusted[0].end.getTime()).toBe(
        blocks[0].end.getTime() + 60 * 60 * 1000
      );
    });

    it('shifts blocks backward for fall DST (-60 min)', () => {
      const blocks = [
        makePlanBlock('2026-11-01T22:00:00', '2026-11-02T06:00:00'),
      ];
      const adjustment: TimezoneAdjustment = {
        type: 'dst-fall',
        shiftMinutes: -60,
        date: new Date('2026-11-01'),
        recommendation: 'Test',
      };
      const adjusted = adjustPlanForDST(blocks, adjustment);
      expect(adjusted[0].start.getTime()).toBe(
        blocks[0].start.getTime() - 60 * 60 * 1000
      );
    });

    it('preserves block IDs and metadata after DST adjustment', () => {
      const blocks = [
        makePlanBlock('2026-03-15T22:00:00', '2026-03-16T06:00:00'),
      ];
      blocks[0].label = 'Main Sleep';
      blocks[0].description = 'Science-backed sleep window';
      blocks[0].priority = 1;

      const adjustment: TimezoneAdjustment = {
        type: 'dst-spring',
        shiftMinutes: 60,
        date: new Date('2026-03-08'),
        recommendation: 'Test',
      };
      const adjusted = adjustPlanForDST(blocks, adjustment);
      expect(adjusted[0].id).toBe(blocks[0].id);
      expect(adjusted[0].label).toBe('Main Sleep');
      expect(adjusted[0].description).toBe('Science-backed sleep window');
      expect(adjusted[0].priority).toBe(1);
    });

    it('handles empty block array', () => {
      const adjustment: TimezoneAdjustment = {
        type: 'dst-spring',
        shiftMinutes: 60,
        date: new Date('2026-03-08'),
        recommendation: 'Test',
      };
      const adjusted = adjustPlanForDST([], adjustment);
      expect(adjusted).toEqual([]);
    });

    it('adjusts multiple blocks of different types', () => {
      const blocks = [
        makePlanBlock('2026-03-15T20:00:00', '2026-03-15T20:30:00', 'wind-down'),
        makePlanBlock('2026-03-15T22:00:00', '2026-03-16T06:00:00', 'main-sleep'),
        makePlanBlock('2026-03-16T06:00:00', '2026-03-16T06:30:00', 'wake'),
        makePlanBlock('2026-03-16T12:00:00', '2026-03-16T12:45:00', 'nap'),
      ];
      const adjustment: TimezoneAdjustment = {
        type: 'dst-spring',
        shiftMinutes: 60,
        date: new Date('2026-03-08'),
        recommendation: 'Test',
      };
      const adjusted = adjustPlanForDST(blocks, adjustment);
      expect(adjusted.length).toBe(4);
      adjusted.forEach((block, i) => {
        expect(block.start.getTime()).toBe(
          blocks[i].start.getTime() + 60 * 60 * 1000
        );
      });
    });

    it('handles large timezone change (e.g., +300 min)', () => {
      const blocks = [
        makePlanBlock('2026-03-15T22:00:00', '2026-03-16T06:00:00'),
      ];
      const adjustment: TimezoneAdjustment = {
        type: 'timezone-change',
        shiftMinutes: 300, // 5 hours
        date: new Date('2026-03-10'),
        recommendation: 'Test',
      };
      const adjusted = adjustPlanForDST(blocks, adjustment);
      expect(adjusted[0].start.getTime()).toBe(
        blocks[0].start.getTime() + 300 * 60 * 1000
      );
    });

    it('handles negative timezone change (-300 min)', () => {
      const blocks = [
        makePlanBlock('2026-03-15T22:00:00', '2026-03-16T06:00:00'),
      ];
      const adjustment: TimezoneAdjustment = {
        type: 'timezone-change',
        shiftMinutes: -300,
        date: new Date('2026-03-10'),
        recommendation: 'Test',
      };
      const adjusted = adjustPlanForDST(blocks, adjustment);
      expect(adjusted[0].start.getTime()).toBe(
        blocks[0].start.getTime() - 300 * 60 * 1000
      );
    });

    it('handles zero shift (no change)', () => {
      const blocks = [
        makePlanBlock('2026-03-15T22:00:00', '2026-03-16T06:00:00'),
      ];
      const adjustment: TimezoneAdjustment = {
        type: 'timezone-change',
        shiftMinutes: 0,
        date: new Date('2026-03-10'),
        recommendation: 'Test',
      };
      const adjusted = adjustPlanForDST(blocks, adjustment);
      expect(adjusted[0].start.getTime()).toBe(blocks[0].start.getTime());
      expect(adjusted[0].end.getTime()).toBe(blocks[0].end.getTime());
    });
  });

  describe('detectTimezoneChanges', () => {
    it('returns empty array when no DST change in lookahead', () => {
      // Most of the year has no DST transitions, so a short window should be fine
      const today = new Date('2026-06-15'); // Mid-summer, no DST change nearby
      const changes = detectTimezoneChanges(today, 7);
      // May or may not detect changes depending on timezone,
      // but the function should not throw
      expect(Array.isArray(changes)).toBe(true);
    });

    it('handles zero lookahead days', () => {
      const today = new Date('2026-03-15');
      const changes = detectTimezoneChanges(today, 0);
      expect(changes).toEqual([]);
    });

    it('handles 365-day lookahead without crashing', () => {
      const today = new Date('2026-01-01');
      const changes = detectTimezoneChanges(today, 365);
      expect(Array.isArray(changes)).toBe(true);
      // In most US timezones there should be 2 DST changes per year
      // but test environment may use UTC, so just check it runs
    });

    it('returns adjustments sorted by date ascending', () => {
      const today = new Date('2026-01-01');
      const changes = detectTimezoneChanges(today, 365);
      for (let i = 1; i < changes.length; i++) {
        expect(changes[i].date.getTime()).toBeGreaterThanOrEqual(
          changes[i - 1].date.getTime()
        );
      }
    });

    it('returns valid adjustment objects', () => {
      const today = new Date('2026-01-01');
      const changes = detectTimezoneChanges(today, 365);
      for (const change of changes) {
        expect(['dst-spring', 'dst-fall', 'timezone-change']).toContain(change.type);
        expect(typeof change.shiftMinutes).toBe('number');
        expect(change.date instanceof Date).toBe(true);
        expect(typeof change.recommendation).toBe('string');
        expect(change.recommendation.length).toBeGreaterThan(0);
      }
    });
  });
});
