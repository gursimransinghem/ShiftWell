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

/**
 * B4 (spec Part 6.1 test-invalidation ledger): buildProtocol now takes a
 * TransitionDetection carrying `consecutiveNights`, and the exact-minute assertions
 * (90/180/270, -120/-240/-360) are invalidated. The replacements lock the new
 * principle-based behaviour:
 *   - mode-gated: a short night block (≤3) → Hold → every target is 0;
 *   - a long night block (≥4) → Adapt → a monotonic, capped ramp;
 *   - every per-day delta is within the physiological band [-60, +120].
 */
describe('buildProtocol', () => {
  /** Per-day deltas — differences between consecutive cumulative bedtimeAdjustMinutes. */
  function perDayDeltas(targets: { bedtimeAdjustMinutes: number }[]): number[] {
    const deltas: number[] = [];
    for (let i = 0; i < targets.length; i++) {
      const prev = i === 0 ? 0 : targets[i - 1].bedtimeAdjustMinutes;
      deltas.push(targets[i].bedtimeAdjustMinutes - prev);
    }
    return deltas;
  }

  it("returns empty dailyTargets for type='none'", () => {
    const protocol = buildProtocol(
      { type: 'none', daysUntil: 999, consecutiveNights: 0 }, TODAY, 'intermediate');
    expect(protocol.transitionType).toBe('none');
    expect(protocol.dailyTargets).toHaveLength(0);
  });

  // Was: exact 90/180/270. Now (Adapt mode, ≥4 nights): monotonically increasing delay,
  // every per-day delta within (0, +120].
  it("builds a monotonic, capped delay ramp for an Adapt-mode 'day-to-night' block", () => {
    const protocol = buildProtocol(
      { type: 'day-to-night', daysUntil: 3, consecutiveNights: 5 }, TODAY, 'intermediate');
    expect(protocol.dailyTargets).toHaveLength(3);
    // Cumulative bedtime adjustment strictly increases (a delay ramp).
    for (let i = 1; i < protocol.dailyTargets.length; i++) {
      expect(protocol.dailyTargets[i].bedtimeAdjustMinutes)
        .toBeGreaterThan(protocol.dailyTargets[i - 1].bedtimeAdjustMinutes);
    }
    // Every per-day delta is a positive delay within the 120 min/day ceiling.
    for (const delta of perDayDeltas(protocol.dailyTargets)) {
      expect(delta).toBeGreaterThan(0);
      expect(delta).toBeLessThanOrEqual(120);
    }
  });

  // SC-B4.1 — a short (≤3-night) day-to-night block is Hold: every target is 0.
  it("builds a zero-shift Hold protocol for a short (≤3-night) 'day-to-night' block", () => {
    const protocol = buildProtocol(
      { type: 'day-to-night', daysUntil: 3, consecutiveNights: 2 }, TODAY, 'intermediate');
    expect(protocol.dailyTargets.length).toBeGreaterThan(0);
    for (const target of protocol.dailyTargets) {
      expect(target.bedtimeAdjustMinutes).toBe(0);
    }
  });

  it("builds no active targets for 'day-to-night' with daysUntil=7 (outside 3-day window)", () => {
    const protocol = buildProtocol(
      { type: 'day-to-night', daysUntil: 7, consecutiveNights: 5 }, TODAY, 'intermediate');
    expect(protocol.dailyTargets).toHaveLength(0);
  });

  it("builds 1 target for 'isolated-night' with bedtimeAdjustMinutes=0 and napGuidance present", () => {
    const protocol = buildProtocol(
      { type: 'isolated-night', daysUntil: 2, consecutiveNights: 1 }, TODAY, 'intermediate');
    expect(protocol.dailyTargets).toHaveLength(1);
    expect(protocol.dailyTargets[0].bedtimeAdjustMinutes).toBe(0);
    expect(protocol.dailyTargets[0].napGuidance).toBeTruthy();
  });

  // Was: exact -120/-240/-360. Now: an advance ramp (negative, monotonically
  // decreasing) with every per-day delta within [-60, 0) — the 60 min/day advance cap.
  it("'night-to-day' builds a monotonic advance ramp capped at 60 min/day", () => {
    const protocol = buildProtocol(
      { type: 'night-to-day', daysUntil: 0, consecutiveNights: 0 }, TODAY, 'intermediate');
    expect(protocol.dailyTargets).toHaveLength(3);
    // Cumulative adjustment is negative and strictly decreasing (an advance ramp).
    for (const target of protocol.dailyTargets) {
      expect(target.bedtimeAdjustMinutes).toBeLessThan(0);
    }
    for (let i = 1; i < protocol.dailyTargets.length; i++) {
      expect(protocol.dailyTargets[i].bedtimeAdjustMinutes)
        .toBeLessThan(protocol.dailyTargets[i - 1].bedtimeAdjustMinutes);
    }
    // Every per-day delta is a negative advance within the 60 min/day advance ceiling.
    for (const delta of perDayDeltas(protocol.dailyTargets)) {
      expect(delta).toBeLessThan(0);
      expect(delta).toBeGreaterThanOrEqual(-60);
    }
  });

  // Was: exact 90/180. Now (Adapt mode, ≥4 nights): a monotonic capped delay ramp.
  it("'evening-to-night' builds a 2-day capped delay ramp for an Adapt-mode block", () => {
    const protocol = buildProtocol(
      { type: 'evening-to-night', daysUntil: 3, consecutiveNights: 5 }, TODAY, 'intermediate');
    expect(protocol.dailyTargets).toHaveLength(2);
    expect(protocol.dailyTargets[1].bedtimeAdjustMinutes)
      .toBeGreaterThan(protocol.dailyTargets[0].bedtimeAdjustMinutes);
    for (const delta of perDayDeltas(protocol.dailyTargets)) {
      expect(delta).toBeGreaterThan(0);
      expect(delta).toBeLessThanOrEqual(120);
    }
    expect(protocol.dailyTargets[1].napGuidance).toBeTruthy();
  });

  // SC-B4.1 — a short evening-to-night block is also Hold (zero shift).
  it("'evening-to-night' is a zero-shift Hold protocol for a short (≤3-night) block", () => {
    const protocol = buildProtocol(
      { type: 'evening-to-night', daysUntil: 3, consecutiveNights: 2 }, TODAY, 'intermediate');
    expect(protocol.dailyTargets.length).toBeGreaterThan(0);
    for (const target of protocol.dailyTargets) {
      expect(target.bedtimeAdjustMinutes).toBe(0);
    }
  });

  // day-to-evening is not night-bound — always Adapt; per-day delta within [-60, +120].
  it("'day-to-evening' builds 1 target with a delay within the [-60,+120] band", () => {
    const protocol = buildProtocol(
      { type: 'day-to-evening', daysUntil: 2, consecutiveNights: 0 }, TODAY, 'intermediate');
    expect(protocol.dailyTargets).toHaveLength(1);
    const delta = protocol.dailyTargets[0].bedtimeAdjustMinutes;
    expect(delta).toBeGreaterThan(0);
    expect(delta).toBeLessThanOrEqual(120);
  });

  it('protocol carries correct transitionType and daysUntilTransition', () => {
    const protocol = buildProtocol(
      { type: 'day-to-night', daysUntil: 3, consecutiveNights: 5 }, TODAY, 'late');
    expect(protocol.transitionType).toBe('day-to-night');
    expect(protocol.daysUntilTransition).toBe(3);
  });
});
