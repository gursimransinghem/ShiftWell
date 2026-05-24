/**
 * Tests for chronotype-personalized circadian protocol targets.
 *
 * Early chronotypes fight phase delays (night shift transitions) harder
 * and advance more easily. Late chronotypes shift in the delay direction
 * more easily but resist advances.
 *
 * Scientific basis:
 * - Eastman & Burgess (2009) — phase delay vs advance asymmetry
 * - Crowley et al. (2003) — chronotype modulates circadian shift rate
 * - Modifier: ±15% (early/late vs intermediate), rounded to 15 min
 */

import { buildProtocol } from '../../src/lib/adaptive/circadian-protocols';

const TODAY = new Date('2026-04-10T08:00:00.000Z');

// B4 (spec Part 6.1 ledger): buildProtocol takes a TransitionDetection with
// `consecutiveNights`. Night-bound fixtures use ≥4 so Adapt mode produces a ramp
// (where the old tests expected a ramp). Exact-minute assertions are replaced with
// the chronotype ORDERING principle, which survives the new physiological clamps:
//   - delay magnitude:  late ≤ intermediate ≤ early
//   - advance magnitude: early ≤ intermediate ≤ late

// ─── day-to-night (phase delay) ───────────────────────────────────────────────

describe('buildProtocol — chronotype modifier on day-to-night (delay direction)', () => {
  // ≥4 nights → Adapt mode → a real delay ramp is produced.
  const transition = { type: 'day-to-night' as const, daysUntil: 3, consecutiveNights: 5 };

  it('every chronotype produces a monotonic delay ramp within the [-60,+120] band', () => {
    for (const ct of ['early', 'intermediate', 'late'] as const) {
      const protocol = buildProtocol(transition, TODAY, ct);
      expect(protocol.dailyTargets).toHaveLength(3);
      for (let i = 0; i < 3; i++) {
        const prev = i === 0 ? 0 : protocol.dailyTargets[i - 1].bedtimeAdjustMinutes;
        const delta = protocol.dailyTargets[i].bedtimeAdjustMinutes - prev;
        // Each per-day delta is a positive delay within the 120 min/day ceiling.
        expect(delta).toBeGreaterThan(0);
        expect(delta).toBeLessThanOrEqual(120);
      }
    }
  });

  // Ordering principle (replaces the exact ±15% assertions): delay magnitude
  // late ≤ intermediate ≤ early — early types fight delays hardest.
  it('delay magnitude orders late ≤ intermediate ≤ early', () => {
    const early = buildProtocol(transition, TODAY, 'early');
    const intermediate = buildProtocol(transition, TODAY, 'intermediate');
    const late = buildProtocol(transition, TODAY, 'late');
    for (let i = 0; i < 3; i++) {
      expect(late.dailyTargets[i].bedtimeAdjustMinutes)
        .toBeLessThanOrEqual(intermediate.dailyTargets[i].bedtimeAdjustMinutes);
      expect(intermediate.dailyTargets[i].bedtimeAdjustMinutes)
        .toBeLessThanOrEqual(early.dailyTargets[i].bedtimeAdjustMinutes);
    }
  });

  it('early chronotype delay is strictly greater than late chronotype delay', () => {
    const early = buildProtocol(transition, TODAY, 'early');
    const late = buildProtocol(transition, TODAY, 'late');
    for (let i = 0; i < 3; i++) {
      expect(early.dailyTargets[i].bedtimeAdjustMinutes)
        .toBeGreaterThan(late.dailyTargets[i].bedtimeAdjustMinutes);
    }
  });
});

// ─── night-to-day (phase advance) ─────────────────────────────────────────────

describe('buildProtocol — chronotype modifier on night-to-day (advance direction)', () => {
  const transition = { type: 'night-to-day' as const, daysUntil: 0, consecutiveNights: 0 };

  it('every chronotype produces a monotonic advance ramp within the [-60,+120] band', () => {
    for (const ct of ['early', 'intermediate', 'late'] as const) {
      const protocol = buildProtocol(transition, TODAY, ct);
      expect(protocol.dailyTargets).toHaveLength(3);
      for (let i = 0; i < 3; i++) {
        const prev = i === 0 ? 0 : protocol.dailyTargets[i - 1].bedtimeAdjustMinutes;
        const delta = protocol.dailyTargets[i].bedtimeAdjustMinutes - prev;
        // Each per-day delta is a negative advance within the 60 min/day advance cap.
        expect(delta).toBeLessThan(0);
        expect(delta).toBeGreaterThanOrEqual(-60);
      }
    }
  });

  // Ordering principle (replaces the exact ±15% assertions): advance MAGNITUDE
  // early ≤ intermediate ≤ late — early types advance most easily. The 60 min/day
  // advance cap can collapse the late vs intermediate gap, so this is non-strict.
  it('advance magnitude orders early ≤ intermediate ≤ late', () => {
    const early = buildProtocol(transition, TODAY, 'early');
    const intermediate = buildProtocol(transition, TODAY, 'intermediate');
    const late = buildProtocol(transition, TODAY, 'late');
    for (let i = 0; i < 3; i++) {
      // Magnitude = absolute value; advances are negative.
      const earlyMag = Math.abs(early.dailyTargets[i].bedtimeAdjustMinutes);
      const interMag = Math.abs(intermediate.dailyTargets[i].bedtimeAdjustMinutes);
      const lateMag = Math.abs(late.dailyTargets[i].bedtimeAdjustMinutes);
      expect(earlyMag).toBeLessThanOrEqual(interMag);
      expect(interMag).toBeLessThanOrEqual(lateMag);
    }
  });

  it('early chronotype advances with a strictly smaller magnitude than intermediate', () => {
    const early = buildProtocol(transition, TODAY, 'early');
    const intermediate = buildProtocol(transition, TODAY, 'intermediate');
    for (let i = 0; i < 3; i++) {
      // "advances more easily" → numerically greater (less negative).
      expect(early.dailyTargets[i].bedtimeAdjustMinutes)
        .toBeGreaterThan(intermediate.dailyTargets[i].bedtimeAdjustMinutes);
    }
  });
});

// ─── Light guidance text ──────────────────────────────────────────────────────

describe('buildProtocol — chronotype-specific light guidance', () => {
  // Chronotype light notes only appear in Adapt mode (≥4 nights); a Hold protocol
  // ships the fixed short-block guidance, so these fixtures use consecutiveNights:5.
  it('early chronotype day-to-night protocol includes night shift warning in guidance', () => {
    const protocol = buildProtocol(
      { type: 'day-to-night', daysUntil: 3, consecutiveNights: 5 }, TODAY, 'early');
    for (const target of protocol.dailyTargets) {
      expect(target.lightGuidance).toContain('early chronotype makes night shifts harder');
    }
  });

  it('late chronotype day-to-night protocol includes natural advantage note in guidance', () => {
    const protocol = buildProtocol(
      { type: 'day-to-night', daysUntil: 3, consecutiveNights: 5 }, TODAY, 'late');
    for (const target of protocol.dailyTargets) {
      expect(target.lightGuidance).toContain('natural advantage for night shifts');
    }
  });

  it('intermediate chronotype day-to-night protocol has no chronotype note', () => {
    const protocol = buildProtocol(
      { type: 'day-to-night', daysUntil: 3, consecutiveNights: 5 }, TODAY, 'intermediate');
    for (const target of protocol.dailyTargets) {
      expect(target.lightGuidance).not.toContain('chronotype');
    }
  });
});

// ─── isolated-night — no shift (0 adjustment stays 0 regardless of chronotype) ──

describe('buildProtocol — isolated-night is unaffected by chronotype', () => {
  it('bedtimeAdjustMinutes is always 0 for isolated-night regardless of chronotype', () => {
    for (const ct of ['early', 'intermediate', 'late'] as const) {
      const protocol = buildProtocol(
        { type: 'isolated-night', daysUntil: 2, consecutiveNights: 1 }, TODAY, ct);
      expect(protocol.dailyTargets[0].bedtimeAdjustMinutes).toBe(0);
    }
  });
});

// ─── adjustments are multiples of 15 min ─────────────────────────────────────

describe('buildProtocol — all adjustments are rounded to nearest 15 min', () => {
  // Night-bound fixtures use consecutiveNights:5 (Adapt) so a ramp exists to check;
  // a Hold protocol's single 0 target is trivially a multiple of 15.
  const transitions = [
    { type: 'day-to-night' as const, daysUntil: 3, consecutiveNights: 5 },
    { type: 'night-to-day' as const, daysUntil: 0, consecutiveNights: 0 },
    { type: 'evening-to-night' as const, daysUntil: 3, consecutiveNights: 5 },
    { type: 'day-to-evening' as const, daysUntil: 2, consecutiveNights: 0 },
  ];

  for (const ct of ['early', 'intermediate', 'late'] as const) {
    for (const transition of transitions) {
      it(`${ct} / ${transition.type}: all bedtimeAdjustMinutes are multiples of 15`, () => {
        const protocol = buildProtocol(transition, TODAY, ct);
        for (const target of protocol.dailyTargets) {
          // Use Math.abs to handle -0 === 0 comparison correctly
          expect(Math.abs(target.bedtimeAdjustMinutes % 15)).toBe(0);
        }
      });
    }
  }
});
