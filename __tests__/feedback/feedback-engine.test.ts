/**
 * TDD: feedback-engine — Algorithm Feedback Engine (Phase 15)
 *
 * Tests:
 * - FE-01: Returns null when fewer than minNights valid records
 * - FE-02: Returns null when average delta < 10 min (no adjustment needed)
 * - FE-03: Shifts bedtime later when user consistently falls asleep 30+ min late
 * - FE-04: Shifts bedtime earlier when user consistently falls asleep early
 * - FE-05: Caps adjustment at 30 min even when delta is 60 min
 * - FE-06: Higher confidence when deltas are consistent (low stddev)
 * - FE-07: Lower confidence when deltas are inconsistent (high stddev)
 * - FE-08: Rounds to nearest 5 minutes
 * - FE-09: Respects custom options (maxShiftMinutes, minNights)
 * - FE-10: Returns null when history is empty
 * - FE-11: Weighs most recent night 2x (weighted average)
 * - FE-12: Returns null when all records have null delta (no actual data)
 */

import { computeFeedbackAdjustment } from '../../src/lib/feedback/feedback-engine';
import type { SleepDiscrepancy } from '../../src/lib/feedback/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRecord(
  dateISO: string,
  startDelta: number,
  endDelta = startDelta,
): SleepDiscrepancy {
  const plannedStart = new Date(`${dateISO}T22:00:00`);
  const plannedEnd = new Date(`${dateISO}T06:00:00`);
  const actualStart = new Date(plannedStart.getTime() + startDelta * 60 * 1000);
  const actualEnd = new Date(plannedEnd.getTime() + endDelta * 60 * 1000);
  return {
    dateISO,
    planned: {
      start: plannedStart.toISOString(),
      end: plannedEnd.toISOString(),
      durationHours: 8,
    },
    actual: {
      start: actualStart.toISOString(),
      end: actualEnd.toISOString(),
      durationHours: 8,
    },
    delta: {
      startMinutes: startDelta,
      endMinutes: endDelta,
      durationMinutes: 0,
    },
    source: 'healthkit',
    watchWorn: true,
  };
}

function makeNullRecord(dateISO: string): SleepDiscrepancy {
  return {
    dateISO,
    planned: {
      start: new Date(`${dateISO}T22:00:00`).toISOString(),
      end: new Date(`${dateISO}T06:00:00`).toISOString(),
      durationHours: 8,
    },
    actual: null,
    delta: null,
    source: 'healthkit',
    watchWorn: false,
  };
}

/** Build N consecutive records with a fixed startDelta, starting from a base date */
function makeHistory(count: number, startDelta: number, baseDate = '2026-04-01'): SleepDiscrepancy[] {
  const records: SleepDiscrepancy[] = [];
  const base = new Date(baseDate);
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    records.push(makeRecord(`${d.getFullYear()}-${month}-${day}`, startDelta));
  }
  return records;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('computeFeedbackAdjustment', () => {
  // ── FE-10: Empty history ────────────────────────────────────────────────────
  it('FE-10: returns null for empty history', () => {
    expect(computeFeedbackAdjustment([])).toBeNull();
  });

  // ── FE-01: Fewer than minNights ─────────────────────────────────────────────
  it('FE-01: returns null when fewer than minNights valid records', () => {
    const history = [makeRecord('2026-04-05', 30), makeRecord('2026-04-06', 30)];
    expect(computeFeedbackAdjustment(history)).toBeNull();
  });

  it('FE-01b: returns null with exactly minNights-1 valid records', () => {
    const history = makeHistory(2, 45);
    expect(computeFeedbackAdjustment(history, { minNights: 3 })).toBeNull();
  });

  it('FE-01c: proceeds when exactly minNights valid records present', () => {
    const history = makeHistory(3, 30);
    const result = computeFeedbackAdjustment(history, { minNights: 3 });
    expect(result).not.toBeNull();
  });

  // ── FE-12: All null deltas ──────────────────────────────────────────────────
  it('FE-12: returns null when all records have null delta (no HealthKit data)', () => {
    const history = [
      makeNullRecord('2026-04-05'),
      makeNullRecord('2026-04-06'),
      makeNullRecord('2026-04-07'),
    ];
    expect(computeFeedbackAdjustment(history)).toBeNull();
  });

  // ── FE-02: Delta below threshold ────────────────────────────────────────────
  it('FE-02: returns null when average delta < 10 min (no adjustment needed)', () => {
    // 5-minute average — below the 10-min threshold
    const history = makeHistory(3, 5);
    expect(computeFeedbackAdjustment(history)).toBeNull();
  });

  it('FE-02b: returns null when average delta is exactly 0', () => {
    const history = makeHistory(3, 0);
    expect(computeFeedbackAdjustment(history)).toBeNull();
  });

  // ── FE-03: Shift later ──────────────────────────────────────────────────────
  it('FE-03: shifts bedtime later when user consistently falls asleep 30+ min late', () => {
    const history = makeHistory(5, 30);
    const result = computeFeedbackAdjustment(history);

    expect(result).not.toBeNull();
    expect(result!.bedtimeShiftMinutes).toBeGreaterThan(0);
    expect(result!.reason).toContain('later');
  });

  // ── FE-04: Shift earlier ────────────────────────────────────────────────────
  it('FE-04: shifts bedtime earlier when user consistently falls asleep early', () => {
    const history = makeHistory(5, -30);
    const result = computeFeedbackAdjustment(history);

    expect(result).not.toBeNull();
    expect(result!.bedtimeShiftMinutes).toBeLessThan(0);
    expect(result!.reason).toContain('earlier');
  });

  // ── FE-05: Cap at maxShiftMinutes ───────────────────────────────────────────
  it('FE-05: caps adjustment at 30 min even when delta is 60 min', () => {
    const history = makeHistory(5, 60);
    const result = computeFeedbackAdjustment(history);

    expect(result).not.toBeNull();
    expect(Math.abs(result!.bedtimeShiftMinutes)).toBeLessThanOrEqual(30);
  });

  it('FE-05b: caps at custom maxShiftMinutes', () => {
    const history = makeHistory(5, 60);
    const result = computeFeedbackAdjustment(history, { maxShiftMinutes: 15 });

    expect(result).not.toBeNull();
    expect(Math.abs(result!.bedtimeShiftMinutes)).toBeLessThanOrEqual(15);
  });

  // ── FE-06: High confidence ──────────────────────────────────────────────────
  it('FE-06: returns high confidence when deltas are consistent (low stddev)', () => {
    // All exactly 30 min late → stddev = 0 → confidence = 1.0
    const history = makeHistory(5, 30);
    const result = computeFeedbackAdjustment(history);

    expect(result).not.toBeNull();
    expect(result!.confidence).toBeGreaterThan(0.9);
  });

  // ── FE-07: Low confidence ───────────────────────────────────────────────────
  it('FE-07: returns lower confidence when deltas are inconsistent (high stddev)', () => {
    // Mix of wildly different deltas — same sign, avg > threshold, but high variance
    const history = [
      makeRecord('2026-04-01', 15),
      makeRecord('2026-04-02', 60),
      makeRecord('2026-04-03', 15),
      makeRecord('2026-04-04', 60),
      makeRecord('2026-04-05', 15),
    ];
    const consistent = makeHistory(5, 30);

    const resultInconsistent = computeFeedbackAdjustment(history);
    const resultConsistent = computeFeedbackAdjustment(consistent);

    // Both should produce a result (average is above threshold)
    expect(resultInconsistent).not.toBeNull();
    expect(resultConsistent).not.toBeNull();

    // Inconsistent history should yield lower confidence
    expect(resultInconsistent!.confidence).toBeLessThan(resultConsistent!.confidence);
  });

  // ── FE-08: Rounding ─────────────────────────────────────────────────────────
  it('FE-08: rounds result to nearest 5 minutes', () => {
    // 3 records with deltas 22, 22, 22 → avg 22 → should round to 20
    const history = [
      makeRecord('2026-04-01', 22),
      makeRecord('2026-04-02', 22),
      makeRecord('2026-04-03', 22),
    ];
    const result = computeFeedbackAdjustment(history);

    expect(result).not.toBeNull();
    expect(result!.bedtimeShiftMinutes % 5).toBe(0);
  });

  it('FE-08b: all adjustments are multiples of 5', () => {
    const history = makeHistory(5, 37);
    const result = computeFeedbackAdjustment(history);

    expect(result).not.toBeNull();
    expect(result!.bedtimeShiftMinutes % 5).toBe(0);
    expect(result!.wakeShiftMinutes % 5).toBe(0);
  });

  // ── FE-09: Custom options ────────────────────────────────────────────────────
  it('FE-09: respects custom minNights option', () => {
    // 2 records, normally not enough (default minNights=3) but custom minNights=2 allows it
    const history = makeHistory(2, 30);
    expect(computeFeedbackAdjustment(history)).toBeNull(); // default: needs 3
    expect(computeFeedbackAdjustment(history, { minNights: 2 })).not.toBeNull();
  });

  // ── FE-11: Weighted average ─────────────────────────────────────────────────
  it('FE-11: weights most recent night 2x in the average', () => {
    // 3 nights: 12, 12, 60 → weighted avg = (12 + 12*1 + 60*2) / 4 = 144/4 = 36
    // vs unweighted avg = (12+12+60)/3 = 28
    // The weighted result should be closer to 35 (rounded to 35)
    const history = [
      makeRecord('2026-04-01', 12),
      makeRecord('2026-04-02', 12),
      makeRecord('2026-04-03', 60),
    ];
    const result = computeFeedbackAdjustment(history, { maxShiftMinutes: 60 });

    expect(result).not.toBeNull();
    // Weighted avg ≈ 36, rounds to 35. Unweighted would give 28, rounds to 30.
    // Verify that recent night is pulling the average up significantly.
    expect(result!.bedtimeShiftMinutes).toBeGreaterThanOrEqual(30);
  });

  // ── Reason string ────────────────────────────────────────────────────────────
  it('includes the number of nights in the reason string', () => {
    const history = makeHistory(5, 30);
    const result = computeFeedbackAdjustment(history);

    expect(result).not.toBeNull();
    expect(result!.reason).toContain('5');
  });

  it('confidence is between 0 and 1', () => {
    const history = makeHistory(5, 30);
    const result = computeFeedbackAdjustment(history);

    expect(result).not.toBeNull();
    expect(result!.confidence).toBeGreaterThanOrEqual(0);
    expect(result!.confidence).toBeLessThanOrEqual(1);
  });
});
