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

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Round a value to the nearest 15 min — matches applyChronotypeMod behaviour.
 */
function roundTo15(minutes: number): number {
  return Math.round(minutes / 15) * 15;
}

// ─── day-to-night (phase delay) ───────────────────────────────────────────────

describe('buildProtocol — chronotype modifier on day-to-night (delay direction)', () => {
  const transition = { type: 'day-to-night' as const, daysUntil: 3 };

  it('intermediate chronotype uses unmodified baseline adjustments', () => {
    const protocol = buildProtocol(transition, TODAY, 'intermediate');
    expect(protocol.dailyTargets[0].bedtimeAdjustMinutes).toBe(90);
    expect(protocol.dailyTargets[1].bedtimeAdjustMinutes).toBe(180);
    expect(protocol.dailyTargets[2].bedtimeAdjustMinutes).toBe(270);
  });

  it('early chronotype increases delay adjustments by ~15% (rounded to 15 min)', () => {
    // Early types fight delays harder — modifier +15%
    const protocol = buildProtocol(transition, TODAY, 'early');
    expect(protocol.dailyTargets[0].bedtimeAdjustMinutes).toBe(roundTo15(90 * 1.15));
    expect(protocol.dailyTargets[1].bedtimeAdjustMinutes).toBe(roundTo15(180 * 1.15));
    expect(protocol.dailyTargets[2].bedtimeAdjustMinutes).toBe(roundTo15(270 * 1.15));
  });

  it('late chronotype decreases delay adjustments by ~15% (rounded to 15 min)', () => {
    // Late types shift easily in the delay direction — modifier -15%
    const protocol = buildProtocol(transition, TODAY, 'late');
    expect(protocol.dailyTargets[0].bedtimeAdjustMinutes).toBe(roundTo15(90 * 0.85));
    expect(protocol.dailyTargets[1].bedtimeAdjustMinutes).toBe(roundTo15(180 * 0.85));
    expect(protocol.dailyTargets[2].bedtimeAdjustMinutes).toBe(roundTo15(270 * 0.85));
  });

  it('early chronotype adjustments are greater than intermediate (delays harder)', () => {
    const early = buildProtocol(transition, TODAY, 'early');
    const intermediate = buildProtocol(transition, TODAY, 'intermediate');
    for (let i = 0; i < 3; i++) {
      expect(early.dailyTargets[i].bedtimeAdjustMinutes).toBeGreaterThan(
        intermediate.dailyTargets[i].bedtimeAdjustMinutes,
      );
    }
  });

  it('late chronotype adjustments are less than intermediate (delays easier)', () => {
    const late = buildProtocol(transition, TODAY, 'late');
    const intermediate = buildProtocol(transition, TODAY, 'intermediate');
    for (let i = 0; i < 3; i++) {
      expect(late.dailyTargets[i].bedtimeAdjustMinutes).toBeLessThan(
        intermediate.dailyTargets[i].bedtimeAdjustMinutes,
      );
    }
  });
});

// ─── night-to-day (phase advance) ─────────────────────────────────────────────

describe('buildProtocol — chronotype modifier on night-to-day (advance direction)', () => {
  const transition = { type: 'night-to-day' as const, daysUntil: 0 };

  it('intermediate chronotype uses unmodified baseline adjustments', () => {
    const protocol = buildProtocol(transition, TODAY, 'intermediate');
    expect(protocol.dailyTargets[0].bedtimeAdjustMinutes).toBe(-120);
    expect(protocol.dailyTargets[1].bedtimeAdjustMinutes).toBe(-240);
    expect(protocol.dailyTargets[2].bedtimeAdjustMinutes).toBe(-360);
  });

  it('early chronotype advances more easily (-15% applied to negative values → less negative)', () => {
    // Early types advance more easily — modifier 0.85 applied to advance direction
    const protocol = buildProtocol(transition, TODAY, 'early');
    // -120 * 0.85 = -102 → rounded to nearest 15 = -105
    expect(protocol.dailyTargets[0].bedtimeAdjustMinutes).toBe(roundTo15(-120 * 0.85));
    expect(protocol.dailyTargets[1].bedtimeAdjustMinutes).toBe(roundTo15(-240 * 0.85));
    expect(protocol.dailyTargets[2].bedtimeAdjustMinutes).toBe(roundTo15(-360 * 0.85));
  });

  it('late chronotype advances more slowly (adjustments more negative than intermediate)', () => {
    // Late types resist advances — modifier 1.15 applied to advance direction
    const protocol = buildProtocol(transition, TODAY, 'late');
    expect(protocol.dailyTargets[0].bedtimeAdjustMinutes).toBe(roundTo15(-120 * 1.15));
    expect(protocol.dailyTargets[1].bedtimeAdjustMinutes).toBe(roundTo15(-240 * 1.15));
    expect(protocol.dailyTargets[2].bedtimeAdjustMinutes).toBe(roundTo15(-360 * 1.15));
  });

  it('early chronotype has less-negative adjustments than intermediate (advances easier)', () => {
    const early = buildProtocol(transition, TODAY, 'early');
    const intermediate = buildProtocol(transition, TODAY, 'intermediate');
    for (let i = 0; i < 3; i++) {
      // "less negative" means numerically greater
      expect(early.dailyTargets[i].bedtimeAdjustMinutes).toBeGreaterThan(
        intermediate.dailyTargets[i].bedtimeAdjustMinutes,
      );
    }
  });

  it('late chronotype has more-negative adjustments than intermediate (advances harder)', () => {
    const late = buildProtocol(transition, TODAY, 'late');
    const intermediate = buildProtocol(transition, TODAY, 'intermediate');
    for (let i = 0; i < 3; i++) {
      expect(late.dailyTargets[i].bedtimeAdjustMinutes).toBeLessThan(
        intermediate.dailyTargets[i].bedtimeAdjustMinutes,
      );
    }
  });
});

// ─── Light guidance text ──────────────────────────────────────────────────────

describe('buildProtocol — chronotype-specific light guidance', () => {
  it('early chronotype day-to-night protocol includes night shift warning in guidance', () => {
    const protocol = buildProtocol({ type: 'day-to-night', daysUntil: 3 }, TODAY, 'early');
    for (const target of protocol.dailyTargets) {
      expect(target.lightGuidance).toContain('early chronotype makes night shifts harder');
    }
  });

  it('late chronotype day-to-night protocol includes natural advantage note in guidance', () => {
    const protocol = buildProtocol({ type: 'day-to-night', daysUntil: 3 }, TODAY, 'late');
    for (const target of protocol.dailyTargets) {
      expect(target.lightGuidance).toContain('natural advantage for night shifts');
    }
  });

  it('intermediate chronotype day-to-night protocol has no chronotype note', () => {
    const protocol = buildProtocol({ type: 'day-to-night', daysUntil: 3 }, TODAY, 'intermediate');
    for (const target of protocol.dailyTargets) {
      expect(target.lightGuidance).not.toContain('chronotype');
    }
  });
});

// ─── isolated-night — no shift (0 adjustment stays 0 regardless of chronotype) ──

describe('buildProtocol — isolated-night is unaffected by chronotype', () => {
  it('bedtimeAdjustMinutes is always 0 for isolated-night regardless of chronotype', () => {
    for (const ct of ['early', 'intermediate', 'late'] as const) {
      const protocol = buildProtocol({ type: 'isolated-night', daysUntil: 2 }, TODAY, ct);
      expect(protocol.dailyTargets[0].bedtimeAdjustMinutes).toBe(0);
    }
  });
});

// ─── adjustments are multiples of 15 min ─────────────────────────────────────

describe('buildProtocol — all adjustments are rounded to nearest 15 min', () => {
  const transitions = [
    { type: 'day-to-night' as const, daysUntil: 3 },
    { type: 'night-to-day' as const, daysUntil: 0 },
    { type: 'evening-to-night' as const, daysUntil: 3 },
    { type: 'day-to-evening' as const, daysUntil: 2 },
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
