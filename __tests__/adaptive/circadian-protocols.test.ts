/**
 * Tests for circadian-protocols: detectTransition + buildProtocol.
 *
 * All dates are constructed deterministically relative to a fixed "today"
 * so tests are stable regardless of when they run.
 */

import { addDays } from 'date-fns';
import { detectTransition, buildProtocol } from '../../src/lib/adaptive/circadian-protocols';
import type { ShiftEvent } from '../../src/lib/circadian/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TODAY = new Date('2026-04-10T08:00:00.000Z');

function makeShift(
  daysFromToday: number,
  type: ShiftEvent['shiftType'],
  id: string,
): ShiftEvent {
  const start = addDays(TODAY, daysFromToday);

  let startHour: number;
  switch (type) {
    case 'day':
      startHour = 7;
      break;
    case 'evening':
      startHour = 15;
      break;
    case 'night':
      startHour = 19;
      break;
    case 'extended':
      startHour = 7;
      break;
  }

  const s = new Date(start);
  s.setUTCHours(startHour, 0, 0, 0);

  const durationHours = type === 'extended' ? 24 : 12;
  const e = new Date(s.getTime() + durationHours * 60 * 60 * 1000);

  return { id, title: `Shift ${id}`, start: s, end: e, shiftType: type };
}

// ─── detectTransition ─────────────────────────────────────────────────────────

describe('detectTransition', () => {
  it('returns none with daysUntil=999 when there are no shifts', () => {
    const result = detectTransition([], TODAY);
    expect(result.type).toBe('none');
    expect(result.daysUntil).toBe(999);
  });

  it('detects day-to-night transition when a day shift is followed by a night shift', () => {
    const shifts: ShiftEvent[] = [
      makeShift(0, 'day', 'd1'),
      makeShift(4, 'night', 'n1'),
    ];
    const result = detectTransition(shifts, TODAY);
    expect(result.type).toBe('day-to-night');
    expect(result.daysUntil).toBe(4);
  });

  it('detects night-to-day transition when a night shift is followed by a day shift', () => {
    const shifts: ShiftEvent[] = [
      makeShift(1, 'night', 'n1'),
      makeShift(5, 'day', 'd1'),
    ];
    const result = detectTransition(shifts, TODAY);
    expect(result.type).toBe('night-to-day');
    // differenceInDays uses actual elapsed time (not calendar days), so the
    // day shift at UTC 07:00 on day+5, relative to TODAY at UTC 08:00, yields 4.
    expect(result.daysUntil).toBe(4);
  });

  it('detects isolated-night for a single night shift with no other night shifts nearby', () => {
    const shifts: ShiftEvent[] = [
      makeShift(0, 'day', 'd1'),
      makeShift(3, 'night', 'n1'), // isolated
      makeShift(7, 'day', 'd2'),
    ];
    const result = detectTransition(shifts, TODAY);
    expect(result.type).toBe('isolated-night');
    expect(result.daysUntil).toBe(3);
  });

  it('does NOT classify as isolated-night when two night shifts are within 5 days of each other', () => {
    const shifts: ShiftEvent[] = [
      makeShift(2, 'night', 'n1'),
      makeShift(5, 'night', 'n2'),
    ];
    const result = detectTransition(shifts, TODAY);
    // Two consecutive nights — should NOT be isolated
    expect(result.type).not.toBe('isolated-night');
  });

  it('detects evening-to-night boundary', () => {
    const shifts: ShiftEvent[] = [
      makeShift(0, 'evening', 'e1'),
      makeShift(3, 'night', 'n1'),
    ];
    const result = detectTransition(shifts, TODAY);
    expect(result.type).toBe('evening-to-night');
  });
});

// ─── buildProtocol ────────────────────────────────────────────────────────────

describe('buildProtocol', () => {
  it("returns empty dailyTargets for type='none'", () => {
    const protocol = buildProtocol({ type: 'none', daysUntil: 999 }, TODAY, 'intermediate');
    expect(protocol.transitionType).toBe('none');
    expect(protocol.dailyTargets).toHaveLength(0);
  });

  it("builds 3 daily targets for 'day-to-night' with daysUntil=3, first has bedtimeAdjustMinutes=90", () => {
    const protocol = buildProtocol({ type: 'day-to-night', daysUntil: 3 }, TODAY, 'intermediate');
    expect(protocol.dailyTargets).toHaveLength(3);
    expect(protocol.dailyTargets[0].bedtimeAdjustMinutes).toBe(90);
    expect(protocol.dailyTargets[1].bedtimeAdjustMinutes).toBe(180);
    expect(protocol.dailyTargets[2].bedtimeAdjustMinutes).toBe(270);
  });

  it("builds no active targets for 'day-to-night' with daysUntil=7 (outside 3-day window)", () => {
    const protocol = buildProtocol({ type: 'day-to-night', daysUntil: 7 }, TODAY, 'intermediate');
    expect(protocol.dailyTargets).toHaveLength(0);
  });

  it("builds 1 target for 'isolated-night' with bedtimeAdjustMinutes=0 and napGuidance present", () => {
    const protocol = buildProtocol({ type: 'isolated-night', daysUntil: 2 }, TODAY, 'intermediate');
    expect(protocol.dailyTargets).toHaveLength(1);
    expect(protocol.dailyTargets[0].bedtimeAdjustMinutes).toBe(0);
    expect(protocol.dailyTargets[0].napGuidance).toBeTruthy();
  });

  it("'night-to-day' builds 3 targets with negative bedtime adjustments", () => {
    const protocol = buildProtocol({ type: 'night-to-day', daysUntil: 0 }, TODAY, 'intermediate');
    expect(protocol.dailyTargets).toHaveLength(3);
    expect(protocol.dailyTargets[0].bedtimeAdjustMinutes).toBe(-120);
    expect(protocol.dailyTargets[1].bedtimeAdjustMinutes).toBe(-240);
    expect(protocol.dailyTargets[2].bedtimeAdjustMinutes).toBe(-360);
  });

  it("'evening-to-night' builds 2 targets", () => {
    const protocol = buildProtocol({ type: 'evening-to-night', daysUntil: 3 }, TODAY, 'intermediate');
    expect(protocol.dailyTargets).toHaveLength(2);
    expect(protocol.dailyTargets[0].bedtimeAdjustMinutes).toBe(90);
    expect(protocol.dailyTargets[1].bedtimeAdjustMinutes).toBe(180);
    expect(protocol.dailyTargets[1].napGuidance).toBeTruthy();
  });

  it("'day-to-evening' builds 1 target with bedtimeAdjustMinutes=60", () => {
    const protocol = buildProtocol({ type: 'day-to-evening', daysUntil: 2 }, TODAY, 'intermediate');
    expect(protocol.dailyTargets).toHaveLength(1);
    expect(protocol.dailyTargets[0].bedtimeAdjustMinutes).toBe(60);
  });

  it('protocol carries correct transitionType and daysUntilTransition', () => {
    const protocol = buildProtocol({ type: 'day-to-night', daysUntil: 3 }, TODAY, 'late');
    expect(protocol.transitionType).toBe('day-to-night');
    expect(protocol.daysUntilTransition).toBe(3);
  });
});
