/**
 * Unified transition-planner tests — B4 (the consecutive-night gate, the highest-value
 * fix; structurally dissolves the G3 contradiction).
 *
 * Covers:
 *   SC-B4.1  — selectMode + detectNightBlocks: a short (≤3-night) block → Hold.
 *   SC-B4.4  — THE FLAGSHIP G3 REGRESSION: an isolated/short night yields a zero
 *              clock-shift from BOTH buildProtocol AND generatePreAdaptation.
 *   SC-B4.5  — no per-day delta outside [-60,+120] across block lengths 1-10 × 3
 *              chronotypes.
 *   SC-B4.9  — night/off/night/night → one block, consecutiveNights 3 → Hold.
 *   SC-B4.10 — night ×5, a 2-day gap, then night ×2 → two blocks (5 → Adapt, 2 → Hold).
 *
 * Spec: circadian-algorithm-upgrade-spec-2026-05-24-v1.md, Part 2 B4 + Part 6.1/6.7.
 */

import {
  SHIFT_RATE_CAPS,
  ADAPT_THRESHOLD_NIGHTS,
  COMPROMISE_DLMO_HOUR,
  selectMode,
  clampDailyShift,
  detectNightBlocks,
  consecutiveNightsForDate,
} from '../../src/lib/circadian/transition-planner';
import { buildProtocol } from '../../src/lib/adaptive/circadian-protocols';
import { generatePreAdaptation } from '../../src/lib/predictive/pre-adaptation';
import type { TransitionStressPoint } from '../../src/lib/predictive/stress-scorer';
import type { ShiftEvent } from '../../src/lib/circadian/types';

// ── Helpers ──────────────────────────────────────────────────────────

const TODAY = new Date('2026-04-10T08:00:00');

/** A night shift starting at 19:00 on TODAY + dayOffset. */
function nightShift(id: string, dayOffset: number): ShiftEvent {
  const start = new Date(TODAY);
  start.setDate(start.getDate() + dayOffset);
  start.setHours(19, 0, 0, 0);
  const end = new Date(start);
  end.setHours(end.getHours() + 12);
  return { id, title: `Night ${id}`, start, end, shiftType: 'night' };
}

/** Per-day deltas — differences between consecutive cumulative bedtimeAdjustMinutes. */
function perDayDeltas(targets: { bedtimeAdjustMinutes: number }[]): number[] {
  const deltas: number[] = [];
  for (let i = 0; i < targets.length; i++) {
    const prev = i === 0 ? 0 : targets[i - 1].bedtimeAdjustMinutes;
    deltas.push(targets[i].bedtimeAdjustMinutes - prev);
  }
  return deltas;
}

// ── Constants sanity ─────────────────────────────────────────────────

describe('transition-planner: exported constants', () => {
  it('SHIFT_RATE_CAPS encodes the 120 delay / 60 advance ceilings', () => {
    expect(SHIFT_RATE_CAPS.MAX_DELAY_PER_DAY).toBe(120);
    expect(SHIFT_RATE_CAPS.MAX_ADVANCE_PER_DAY).toBe(60);
  });

  it('ADAPT_THRESHOLD_NIGHTS is 4 and COMPROMISE_DLMO_HOUR is 03:00', () => {
    expect(ADAPT_THRESHOLD_NIGHTS).toBe(4);
    expect(COMPROMISE_DLMO_HOUR).toBe(3.0);
  });
});

// ── SC-B4.1 — selectMode + detectNightBlocks ─────────────────────────

describe('SC-B4.1: a short night block selects Hold mode', () => {
  it('selectMode returns hold below the threshold and adapt at/above it', () => {
    expect(selectMode(1)).toBe('hold');
    expect(selectMode(2)).toBe('hold');
    expect(selectMode(3)).toBe('hold');
    expect(selectMode(4)).toBe('adapt');
    expect(selectMode(5)).toBe('adapt');
    expect(selectMode(10)).toBe('adapt');
  });

  it('a 2-night block detects as one block of 2 → selectMode → hold', () => {
    const shifts = [nightShift('n1', 4), nightShift('n2', 5)];
    const blocks = detectNightBlocks(shifts);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].consecutiveNights).toBe(2);
    expect(selectMode(blocks[0].consecutiveNights)).toBe('hold');
  });

  it('clampDailyShift clamps to [-60, +120]', () => {
    expect(clampDailyShift(200)).toBe(120);
    expect(clampDailyShift(120)).toBe(120);
    expect(clampDailyShift(90)).toBe(90);
    expect(clampDailyShift(0)).toBe(0);
    expect(clampDailyShift(-90)).toBe(-60);
    expect(clampDailyShift(-60)).toBe(-60);
    expect(clampDailyShift(-30)).toBe(-30);
  });
});

// ── SC-B4.4 — THE FLAGSHIP G3 REGRESSION ─────────────────────────────

describe('SC-B4.4: G3 regression — an isolated night yields zero clock-shift everywhere', () => {
  it('buildProtocol produces a zero cumulative bedtime shift for an isolated night', () => {
    const protocol = buildProtocol(
      { type: 'isolated-night', daysUntil: 3, consecutiveNights: 1 }, TODAY, 'intermediate');
    expect(protocol.dailyTargets.length).toBeGreaterThan(0);
    for (const target of protocol.dailyTargets) {
      expect(target.bedtimeAdjustMinutes).toBe(0);
    }
  });

  it('generatePreAdaptation produces a zero clock-shift for an isolated night', () => {
    const stressPoint: TransitionStressPoint = {
      date: new Date('2026-04-17T19:00:00'),
      transitionType: 'isolated-night',
      severity: 'high',
      score: 65,
      factors: [],
      daysUntil: 0,
      consecutiveNights: 1,
    };
    const plan = generatePreAdaptation(stressPoint, new Date('2026-04-10T23:00:00'), TODAY);
    expect(plan).not.toBeNull();
    expect(plan!.dailyActions.length).toBeGreaterThan(0);
    for (const action of plan!.dailyActions) {
      expect(action.bedtimeShift).toBe(0);
    }
  });

  it('BOTH transition modules agree on zero shift for a short (≤3-night) day-to-night block', () => {
    // buildProtocol path.
    const protocol = buildProtocol(
      { type: 'day-to-night', daysUntil: 3, consecutiveNights: 3 }, TODAY, 'intermediate');
    const protocolCumulative = protocol.dailyTargets.reduce(
      (max, t) => Math.max(max, Math.abs(t.bedtimeAdjustMinutes)), 0);

    // generatePreAdaptation path.
    const stressPoint: TransitionStressPoint = {
      date: new Date('2026-04-17T19:00:00'),
      transitionType: 'day-to-night',
      severity: 'high',
      score: 65,
      factors: [],
      daysUntil: 0,
      consecutiveNights: 3,
    };
    const plan = generatePreAdaptation(stressPoint, new Date('2026-04-10T23:00:00'), TODAY);
    const preAdaptCumulative = (plan?.dailyActions ?? []).reduce(
      (sum, a) => sum + Math.abs(a.bedtimeShift), 0);

    // Both code paths agree: the short block produces no clock movement at all.
    expect(protocolCumulative).toBe(0);
    expect(preAdaptCumulative).toBe(0);
  });
});

// ── SC-B4.5 — no per-day delta outside [-60,+120] ────────────────────

describe('SC-B4.5: per-day deltas stay within [-60,+120] across block lengths', () => {
  it('buildProtocol never emits a delta > 120 or < -60 for block lengths 1-10 × 3 chronotypes', () => {
    const chronotypes = ['early', 'intermediate', 'late'] as const;
    const nightBoundTypes = ['day-to-night', 'evening-to-night'] as const;

    for (const ct of chronotypes) {
      for (let blockLen = 1; blockLen <= 10; blockLen++) {
        for (const type of nightBoundTypes) {
          const protocol = buildProtocol(
            { type, daysUntil: 3, consecutiveNights: blockLen }, TODAY, ct);
          for (const delta of perDayDeltas(protocol.dailyTargets)) {
            expect(delta).toBeLessThanOrEqual(120);
            expect(delta).toBeGreaterThanOrEqual(-60);
          }
        }
        // The advance direction (night-to-day) — not gated by block length.
        const advance = buildProtocol(
          { type: 'night-to-day', daysUntil: 0, consecutiveNights: 0 }, TODAY, ct);
        for (const delta of perDayDeltas(advance.dailyTargets)) {
          expect(delta).toBeLessThanOrEqual(120);
          expect(delta).toBeGreaterThanOrEqual(-60);
        }
      }
    }
  });

  it('a long-block Adapt ramp is monotonic (no whiplash) for every chronotype', () => {
    for (const ct of ['early', 'intermediate', 'late'] as const) {
      const protocol = buildProtocol(
        { type: 'day-to-night', daysUntil: 3, consecutiveNights: 6 }, TODAY, ct);
      for (let i = 1; i < protocol.dailyTargets.length; i++) {
        expect(protocol.dailyTargets[i].bedtimeAdjustMinutes)
          .toBeGreaterThan(protocol.dailyTargets[i - 1].bedtimeAdjustMinutes);
      }
    }
  });
});

// ── SC-B4.9 — night/off/night/night → one block of 3 → Hold ──────────

describe('SC-B4.9: a day off splits a night block — scattered nights stay in Hold (HF-3)', () => {
  it('night/off/night/night detects as two blocks (1 + 2), both Hold', () => {
    // Nights on day 0, day 2, day 3 (day 1 is off).
    const shifts = [nightShift('n1', 0), nightShift('n2', 2), nightShift('n3', 3)];
    const blocks = detectNightBlocks(shifts);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].consecutiveNights).toBe(1);
    expect(blocks[1].consecutiveNights).toBe(2);
    expect(selectMode(blocks[0].consecutiveNights)).toBe('hold');
    expect(selectMode(blocks[1].consecutiveNights)).toBe('hold');
  });

  it('3-on / 1-off / 3-on does NOT escalate into a 6-night Adapt block', () => {
    // The exact rotation-whiplash escalation HF-3 fixed: a one-day gap must not fuse
    // two short Hold runs into a single long Adapt block.
    const shifts = [
      nightShift('a1', 0), nightShift('a2', 1), nightShift('a3', 2),
      nightShift('b1', 4), nightShift('b2', 5), nightShift('b3', 6),
    ];
    const blocks = detectNightBlocks(shifts);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].consecutiveNights).toBe(3);
    expect(blocks[1].consecutiveNights).toBe(3);
    expect(selectMode(blocks[0].consecutiveNights)).toBe('hold');
    expect(selectMode(blocks[1].consecutiveNights)).toBe('hold');
  });

  it('consecutiveNightsForDate reports the true consecutive run for a date in a block', () => {
    const shifts = [nightShift('n1', 0), nightShift('n2', 2), nightShift('n3', 3)];
    const insideDate = new Date(TODAY);
    insideDate.setDate(insideDate.getDate() + 2);
    expect(consecutiveNightsForDate(shifts, insideDate)).toBe(2);
  });
});

// ── SC-B4.10 — night ×5, 2-day gap, night ×2 → two blocks ────────────

describe('SC-B4.10: a 2-day gap splits a 5-night run from a following 2-night run', () => {
  it('detects two blocks: 5 nights (Adapt) and 2 nights (Hold)', () => {
    // Nights days 0-4 (×5), gap days 5-6 off, nights days 7-8 (×2).
    const shifts = [
      nightShift('a1', 0), nightShift('a2', 1), nightShift('a3', 2),
      nightShift('a4', 3), nightShift('a5', 4),
      nightShift('b1', 7), nightShift('b2', 8),
    ];
    const blocks = detectNightBlocks(shifts);
    expect(blocks).toHaveLength(2);

    const first = blocks[0];
    const second = blocks[1];
    expect(first.consecutiveNights).toBe(5);
    expect(second.consecutiveNights).toBe(2);
    expect(selectMode(first.consecutiveNights)).toBe('adapt');
    expect(selectMode(second.consecutiveNights)).toBe('hold');
  });
});
