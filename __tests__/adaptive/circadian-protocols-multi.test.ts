/**
 * Tests for detectAllTransitions() — multi-transition detection.
 *
 * Verifies that the function detects all shift-type boundaries in the
 * 14-day window, unlike detectTransition() which stops at the first.
 *
 * Test scenarios:
 * - Empty/stable schedules → empty array
 * - Single transition → array with one entry (matches detectTransition)
 * - Double transition (night→day→night) → array with two entries
 * - Isolated night → included in results
 * - Mixed schedule with 3+ transitions → all detected, sorted by daysUntil
 */

import { addDays } from 'date-fns';
import { detectTransition, detectAllTransitions } from '../../src/lib/adaptive/circadian-protocols';
import type { ShiftEvent } from '../../src/lib/circadian/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TODAY = new Date('2026-04-10T08:00:00.000Z');

function makeShift(
  daysFromToday: number,
  type: ShiftEvent['shiftType'],
  id: string,
): ShiftEvent {
  const start = addDays(TODAY, daysFromToday);
  const s = new Date(start);

  let startHour: number;
  switch (type) {
    case 'day':     startHour = 7;  break;
    case 'evening': startHour = 15; break;
    case 'night':   startHour = 19; break;
    case 'extended': startHour = 7; break;
  }
  s.setUTCHours(startHour, 0, 0, 0);

  const durationHours = type === 'extended' ? 24 : 12;
  const e = new Date(s.getTime() + durationHours * 60 * 60 * 1000);
  return { id, title: `Shift ${id}`, start: s, end: e, shiftType: type };
}

// ─── Empty / stable schedules ─────────────────────────────────────────────────

describe('detectAllTransitions — empty and stable', () => {
  it('returns empty array when there are no shifts', () => {
    expect(detectAllTransitions([], TODAY)).toEqual([]);
  });

  it('returns empty array when all shifts are the same type', () => {
    const shifts = [
      makeShift(0, 'night', 'n1'),
      makeShift(1, 'night', 'n2'),
      makeShift(2, 'night', 'n3'),
    ];
    expect(detectAllTransitions(shifts, TODAY)).toEqual([]);
  });
});

// ─── Single transition — parity with detectTransition ─────────────────────────

describe('detectAllTransitions — single transition parity', () => {
  it('returns one transition for a simple day-to-night boundary', () => {
    const shifts = [
      makeShift(0, 'day', 'd1'),
      makeShift(4, 'night', 'n1'),
    ];
    const all = detectAllTransitions(shifts, TODAY);
    const first = detectTransition(shifts, TODAY);
    expect(all).toHaveLength(1);
    expect(all[0].type).toBe(first.type);
    expect(all[0].daysUntil).toBe(first.daysUntil);
  });

  it('returns one transition for a night-to-day boundary', () => {
    const shifts = [
      makeShift(1, 'night', 'n1'),
      makeShift(5, 'day', 'd1'),
    ];
    const all = detectAllTransitions(shifts, TODAY);
    expect(all).toHaveLength(1);
    expect(all[0].type).toBe('night-to-day');
  });

  it('returns one entry for an isolated night', () => {
    const shifts = [
      makeShift(0, 'day', 'd1'),
      makeShift(3, 'night', 'n1'),
      makeShift(7, 'day', 'd2'),
    ];
    const all = detectAllTransitions(shifts, TODAY);
    expect(all).toHaveLength(1);
    expect(all[0].type).toBe('isolated-night');
    expect(all[0].daysUntil).toBe(3);
  });
});

// ─── Double transition ────────────────────────────────────────────────────────

describe('detectAllTransitions — double transition (night→day→night)', () => {
  it('detects both transitions when night→day→night occurs in the same week', () => {
    const shifts = [
      makeShift(0, 'night', 'n1'),
      makeShift(4, 'day', 'd1'),
      makeShift(9, 'night', 'n2'),
    ];
    const all = detectAllTransitions(shifts, TODAY);
    expect(all.length).toBeGreaterThanOrEqual(2);

    const types = all.map((t) => t.type);
    expect(types).toContain('night-to-day');
    expect(types).toContain('day-to-night');
  });

  it('results are sorted ascending by daysUntil', () => {
    const shifts = [
      makeShift(0, 'night', 'n1'),
      makeShift(4, 'day', 'd1'),
      makeShift(9, 'night', 'n2'),
    ];
    const all = detectAllTransitions(shifts, TODAY);
    for (let i = 1; i < all.length; i++) {
      expect(all[i].daysUntil).toBeGreaterThanOrEqual(all[i - 1].daysUntil);
    }
  });

  it('first transition type matches what detectTransition() would return', () => {
    const shifts = [
      makeShift(0, 'night', 'n1'),
      makeShift(4, 'day', 'd1'),
      makeShift(9, 'night', 'n2'),
    ];
    const all = detectAllTransitions(shifts, TODAY);
    const first = detectTransition(shifts, TODAY);
    expect(all[0].type).toBe(first.type);
  });
});

// ─── Triple transition ────────────────────────────────────────────────────────

describe('detectAllTransitions — three transitions in 14 days', () => {
  it('detects all three boundaries in day→nights→day→evening pattern', () => {
    // Use a 2-night block to avoid isolated-night classification
    const shifts = [
      makeShift(0, 'day', 'd1'),
      makeShift(2, 'night', 'n1'),  // night block (2 consecutive nights)
      makeShift(3, 'night', 'n2'),
      makeShift(7, 'day', 'd2'),
      makeShift(11, 'evening', 'e1'),
    ];
    const all = detectAllTransitions(shifts, TODAY);
    const types = all.map((t) => t.type);

    // Should contain day-to-night, night-to-day, day-to-evening
    expect(types).toContain('day-to-night');
    expect(types).toContain('night-to-day');
    expect(types).toContain('day-to-evening');
  });

  it('sorted results have daysUntil in ascending order', () => {
    const shifts = [
      makeShift(0, 'day', 'd1'),
      makeShift(2, 'night', 'n1'),
      makeShift(3, 'night', 'n2'),
      makeShift(7, 'day', 'd2'),
      makeShift(11, 'evening', 'e1'),
    ];
    const all = detectAllTransitions(shifts, TODAY);
    for (let i = 1; i < all.length; i++) {
      expect(all[i].daysUntil).toBeGreaterThanOrEqual(all[i - 1].daysUntil);
    }
  });
});

// ─── Mixed shift types ────────────────────────────────────────────────────────

describe('detectAllTransitions — evening-to-night transition', () => {
  it('detects evening-to-night boundary', () => {
    const shifts = [
      makeShift(0, 'evening', 'e1'),
      makeShift(3, 'night', 'n1'),
    ];
    const all = detectAllTransitions(shifts, TODAY);
    expect(all).toHaveLength(1);
    expect(all[0].type).toBe('evening-to-night');
  });
});

// ─── Backward compatibility: detectTransition() unchanged ─────────────────────

describe('detectTransition — still returns only first transition (backward compat)', () => {
  it('returns only one transition even when multiple exist', () => {
    const shifts = [
      makeShift(0, 'night', 'n1'),
      makeShift(4, 'day', 'd1'),
      makeShift(9, 'night', 'n2'),
    ];
    const first = detectTransition(shifts, TODAY);
    // detectTransition returns a single object, not an array
    expect(typeof first).toBe('object');
    expect(Array.isArray(first)).toBe(false);
    expect(first).toHaveProperty('type');
    expect(first).toHaveProperty('daysUntil');
  });
});
