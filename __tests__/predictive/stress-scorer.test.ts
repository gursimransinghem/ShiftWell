import { scoreTransitionStress, type TransitionStressPoint } from '../../src/lib/predictive/stress-scorer';
import type { ShiftEvent } from '../../src/lib/circadian/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeShift(
  id: string,
  startStr: string,
  endStr: string,
  shiftType: ShiftEvent['shiftType'],
): ShiftEvent {
  return { id, title: `Shift ${id}`, start: new Date(startStr), end: new Date(endStr), shiftType };
}

const today = new Date('2026-04-10T00:00:00');

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('scoreTransitionStress — base scores', () => {
  // Use shifts with > 48h gap between end of prev and start of next to isolate base score

  it('scores a day-to-night transition with base score 60', () => {
    // Gap: April 11 ends 15:00, April 14 starts 19:00 = 76h — no <48h modifier
    const shifts: ShiftEvent[] = [
      makeShift('1', '2026-04-11T07:00:00', '2026-04-11T15:00:00', 'day'),
      makeShift('2', '2026-04-14T19:00:00', '2026-04-15T07:00:00', 'night'),
    ];
    const points = scoreTransitionStress(shifts, 0, 0, 0, today);
    expect(points.length).toBe(1);
    expect(points[0].transitionType).toBe('day-to-night');
    expect(points[0].score).toBe(60);
  });

  it('scores a night-to-day transition with base score 40', () => {
    // Precede night with a day to make it non-isolated; gap between night end and day start = 72h
    const shifts: ShiftEvent[] = [
      makeShift('0', '2026-04-10T07:00:00', '2026-04-10T15:00:00', 'day'),  // anchor before night
      makeShift('1', '2026-04-11T19:00:00', '2026-04-12T07:00:00', 'night'),
      makeShift('2', '2026-04-14T07:00:00', '2026-04-14T15:00:00', 'day'),
    ];
    const points = scoreTransitionStress(shifts, 0, 0, 0, today);
    const p = points.find((x) => x.transitionType === 'night-to-day');
    expect(p).toBeDefined();
    // Base 40, no modifiers: April 12 07:00 → April 14 07:00 = 48h exactly, NOT < 48h
    expect(p!.score).toBe(40);
  });

  it('scores an evening-to-night transition with base score 50', () => {
    // Gap: April 11 ends 23:00, April 14 starts 19:00 = 68h — no <48h modifier
    const shifts: ShiftEvent[] = [
      makeShift('1', '2026-04-11T14:00:00', '2026-04-11T23:00:00', 'evening'),
      makeShift('2', '2026-04-14T19:00:00', '2026-04-15T07:00:00', 'night'),
    ];
    const points = scoreTransitionStress(shifts, 0, 0, 0, today);
    expect(points.length).toBe(1);
    expect(points[0].transitionType).toBe('evening-to-night');
    expect(points[0].score).toBe(50);
  });

  it('scores a day-to-evening transition with base score 20', () => {
    // Gap: April 11 ends 15:00, April 14 starts 14:00 = 71h — no <48h modifier
    const shifts: ShiftEvent[] = [
      makeShift('1', '2026-04-11T07:00:00', '2026-04-11T15:00:00', 'day'),
      makeShift('2', '2026-04-14T14:00:00', '2026-04-14T23:00:00', 'evening'),
    ];
    const points = scoreTransitionStress(shifts, 0, 0, 0, today);
    expect(points.length).toBe(1);
    expect(points[0].transitionType).toBe('day-to-evening');
    expect(points[0].score).toBe(20);
  });

  it('scores an isolated night shift with base score 30', () => {
    // First shift is a night — no preceding shift so it's isolated
    const shifts: ShiftEvent[] = [
      makeShift('1', '2026-04-12T19:00:00', '2026-04-13T07:00:00', 'night'),
    ];
    const points = scoreTransitionStress(shifts, 0, 0, 0, today);
    expect(points.length).toBe(1);
    expect(points[0].transitionType).toBe('isolated-night');
    expect(points[0].score).toBe(30);
  });
});

describe('scoreTransitionStress — modifiers', () => {
  it('adds 20 points for sleep debt > 3h', () => {
    const shifts: ShiftEvent[] = [
      makeShift('1', '2026-04-12T19:00:00', '2026-04-13T07:00:00', 'night'),
    ];
    const points = scoreTransitionStress(shifts, 4, 0, 0, today);
    // Base: 30 (isolated night) + 20 (debt > 3h) = 50
    expect(points[0].score).toBe(50);
    expect(points[0].factors.some((f) => f.includes('debt'))).toBe(true);
  });

  it('does not add debt modifier when debt <= 3h', () => {
    const shifts: ShiftEvent[] = [
      makeShift('1', '2026-04-12T19:00:00', '2026-04-13T07:00:00', 'night'),
    ];
    const points = scoreTransitionStress(shifts, 2, 0, 0, today);
    expect(points[0].score).toBe(30);
  });

  it('adds 15 points for > 3 consecutive nights', () => {
    const shifts: ShiftEvent[] = [
      makeShift('1', '2026-04-12T19:00:00', '2026-04-13T07:00:00', 'night'),
    ];
    // Pass consecutiveNights=4 explicitly
    const points = scoreTransitionStress(shifts, 0, 0, 4, today);
    // Base: 30 + 15 (consec nights) = 45
    expect(points[0].score).toBe(45);
    expect(points[0].factors.some((f) => f.includes('consecutive'))).toBe(true);
  });

  it('reduces score by 10 per recovery day (capped at 3 days)', () => {
    const shifts: ShiftEvent[] = [
      makeShift('1', '2026-04-12T19:00:00', '2026-04-13T07:00:00', 'night'),
    ];
    const points = scoreTransitionStress(shifts, 0, 2, 0, today);
    // Base: 30 - 20 (2 recovery days) = 10
    expect(points[0].score).toBe(10);
    expect(points[0].factors.some((f) => f.includes('recovery'))).toBe(true);
  });

  it('caps score at 100', () => {
    const shifts: ShiftEvent[] = [
      makeShift('1', '2026-04-11T07:00:00', '2026-04-11T15:00:00', 'day'),
      makeShift('2', '2026-04-11T20:00:00', '2026-04-12T08:00:00', 'night'), // < 48h between
    ];
    // day-to-night (60) + debt (20) + consec (15) + <48h (10) = 105 → clamped to 100
    const points = scoreTransitionStress(shifts, 5, 0, 4, today);
    expect(points[0].score).toBeLessThanOrEqual(100);
    expect(points[0].score).toBeGreaterThanOrEqual(0);
  });

  it('adds 10 points when < 48h between shifts', () => {
    const shifts: ShiftEvent[] = [
      makeShift('1', '2026-04-11T07:00:00', '2026-04-11T15:00:00', 'day'),
      makeShift('2', '2026-04-12T08:00:00', '2026-04-12T20:00:00', 'night'), // 17h between
    ];
    const points = scoreTransitionStress(shifts, 0, 0, 0, today);
    // day-to-night (60) + <48h (10) = 70
    expect(points[0].score).toBe(70);
    expect(points[0].factors.some((f) => f.includes('between shifts'))).toBe(true);
  });
});

describe('scoreTransitionStress — severity thresholds', () => {
  it('returns low severity for score 0–25', () => {
    // day-to-evening base=20, with 1 recovery day: 20 - 10 = 10 → low
    // Use > 48h gap to avoid the <48h modifier
    const shifts: ShiftEvent[] = [
      makeShift('1', '2026-04-11T07:00:00', '2026-04-11T15:00:00', 'day'),
      makeShift('2', '2026-04-14T14:00:00', '2026-04-14T23:00:00', 'evening'),
    ];
    const points = scoreTransitionStress(shifts, 0, 1, 0, today);
    // Base: 20 - 10 (1 recovery day) = 10 → low
    expect(points[0].score).toBe(10);
    expect(points[0].severity).toBe('low');
  });

  it('returns medium severity for score 26–50', () => {
    const shifts: ShiftEvent[] = [
      makeShift('1', '2026-04-12T19:00:00', '2026-04-13T07:00:00', 'night'),
    ];
    // isolated night base=30, no modifiers → medium (26–50)
    const points = scoreTransitionStress(shifts, 0, 0, 0, today);
    expect(points[0].severity).toBe('medium');
  });

  it('returns high severity for score 51–75', () => {
    const shifts: ShiftEvent[] = [
      makeShift('1', '2026-04-11T07:00:00', '2026-04-11T15:00:00', 'day'),
      makeShift('2', '2026-04-12T19:00:00', '2026-04-13T07:00:00', 'night'),
    ];
    // day-to-night base=60 → high (51–75)
    const points = scoreTransitionStress(shifts, 0, 0, 0, today);
    expect(points[0].severity).toBe('high');
  });

  it('returns critical severity for score 76–100', () => {
    const shifts: ShiftEvent[] = [
      makeShift('1', '2026-04-11T07:00:00', '2026-04-11T15:00:00', 'day'),
      makeShift('2', '2026-04-12T08:00:00', '2026-04-12T20:00:00', 'night'), // <48h apart
    ];
    // day-to-night (60) + debt (20) = 80 → critical
    const points = scoreTransitionStress(shifts, 4, 0, 0, today);
    expect(points[0].severity).toBe('critical');
  });
});

describe('scoreTransitionStress — 14-day scan window', () => {
  it('excludes shifts beyond 14 days', () => {
    const shifts: ShiftEvent[] = [
      makeShift('far', '2026-04-30T19:00:00', '2026-05-01T07:00:00', 'night'),
    ];
    const points = scoreTransitionStress(shifts, 0, 0, 0, today);
    expect(points.length).toBe(0);
  });

  it('includes shifts within the 14-day window', () => {
    // today = 2026-04-10; April 23 = 13 days away, well within window
    const shifts: ShiftEvent[] = [
      makeShift('edge', '2026-04-23T19:00:00', '2026-04-24T07:00:00', 'night'),
    ];
    const points = scoreTransitionStress(shifts, 0, 0, 0, today);
    expect(points.length).toBe(1);
  });

  it('returns multiple stress points for multiple transitions', () => {
    const shifts: ShiftEvent[] = [
      makeShift('1', '2026-04-11T07:00:00', '2026-04-11T15:00:00', 'day'),
      makeShift('2', '2026-04-12T19:00:00', '2026-04-13T07:00:00', 'night'),
      makeShift('3', '2026-04-15T07:00:00', '2026-04-15T15:00:00', 'day'),
    ];
    const points = scoreTransitionStress(shifts, 0, 0, 0, today);
    // day-to-night and night-to-day transitions
    expect(points.length).toBe(2);
  });

  it('returns empty array when no shifts', () => {
    const points = scoreTransitionStress([], 0, 0, 0, today);
    expect(points).toEqual([]);
  });

  it('includes daysUntil for each stress point', () => {
    const shifts: ShiftEvent[] = [
      makeShift('1', '2026-04-13T19:00:00', '2026-04-14T07:00:00', 'night'),
    ];
    const points = scoreTransitionStress(shifts, 0, 0, 0, today);
    expect(points[0].daysUntil).toBe(3);
  });
});
