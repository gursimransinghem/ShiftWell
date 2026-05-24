import { generatePreAdaptation } from '../../src/lib/predictive/pre-adaptation';
import type { TransitionStressPoint } from '../../src/lib/predictive/stress-scorer';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// B4 (spec Part 6.1): TransitionStressPoint now has a required `consecutiveNights`
// field. It defaults to 4 here so night-bound fixtures resolve to Adapt mode (a real
// delay ramp) — matching what the pre-existing tests expected. Tests exercising the
// Hold path pass an explicit value ≤3.
function makeStressPoint(
  dateStr: string,
  severity: TransitionStressPoint['severity'],
  transitionType: TransitionStressPoint['transitionType'] = 'day-to-night',
  consecutiveNights = 4,
): TransitionStressPoint {
  return {
    date: new Date(dateStr),
    transitionType,
    severity,
    score: severity === 'low' ? 10 : severity === 'medium' ? 40 : severity === 'high' ? 65 : 85,
    factors: [],
    daysUntil: 0,
    consecutiveNights,
  };
}

const today = new Date('2026-04-10T00:00:00');
const currentBedtime = new Date('2026-04-10T23:00:00'); // 11 PM baseline

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('generatePreAdaptation — severity routing', () => {
  it('returns null for low severity', () => {
    const sp = makeStressPoint('2026-04-17T19:00:00', 'low');
    const plan = generatePreAdaptation(sp, currentBedtime, today);
    expect(plan).toBeNull();
  });

  it('generates a plan for medium severity starting 3 days before', () => {
    const sp = makeStressPoint('2026-04-15T19:00:00', 'medium'); // 5 days from today
    const plan = generatePreAdaptation(sp, currentBedtime, today);
    expect(plan).not.toBeNull();
    // 3 days before April 15 = April 12
    expect(plan!.startDate.toISOString().slice(0, 10)).toBe('2026-04-12');
  });

  it('generates a plan for high severity starting 5 days before', () => {
    const sp = makeStressPoint('2026-04-17T19:00:00', 'high'); // 7 days from today
    const plan = generatePreAdaptation(sp, currentBedtime, today);
    expect(plan).not.toBeNull();
    // 5 days before April 17 = April 12
    expect(plan!.startDate.toISOString().slice(0, 10)).toBe('2026-04-12');
  });

  it('generates a plan for critical severity starting 5 days before', () => {
    const sp = makeStressPoint('2026-04-17T19:00:00', 'critical'); // 7 days from today
    const plan = generatePreAdaptation(sp, currentBedtime, today);
    expect(plan).not.toBeNull();
    expect(plan!.startDate.toISOString().slice(0, 10)).toBe('2026-04-12');
  });
});

describe('generatePreAdaptation — plan content', () => {
  it('produces daily actions for each day until transition', () => {
    const sp = makeStressPoint('2026-04-15T19:00:00', 'medium'); // 5 days from today
    const plan = generatePreAdaptation(sp, currentBedtime, today);
    expect(plan).not.toBeNull();
    // Medium: 3 days before April 15 = April 12; today is April 10
    // effectiveStart = April 12 (in the future)
    // remaining days = April 12 to April 15 = 3 days
    expect(plan!.dailyActions.length).toBe(3);
  });

  it('daily actions include date, bedtimeShift, and lightGuidance', () => {
    const sp = makeStressPoint('2026-04-15T19:00:00', 'medium');
    const plan = generatePreAdaptation(sp, currentBedtime, today);
    const action = plan!.dailyActions[0];
    expect(action.date).toBeInstanceOf(Date);
    expect(typeof action.bedtimeShift).toBe('number');
    expect(typeof action.lightGuidance).toBe('string');
    expect(action.lightGuidance.length).toBeGreaterThan(0);
  });

  it('day-to-night plan for a long (≥4-night) block has positive bedtime shifts (delaying)', () => {
    // ≥4 consecutive nights → Adapt mode → a real progressive delay.
    const sp = makeStressPoint('2026-04-17T19:00:00', 'high', 'day-to-night', 5);
    const plan = generatePreAdaptation(sp, currentBedtime, today);
    expect(plan).not.toBeNull();
    const allPositive = plan!.dailyActions.every((a) => a.bedtimeShift > 0);
    expect(allPositive).toBe(true);
  });

  // B4 / SC-B4.4: a short (≤3-night) night-bound block is HELD — zero clock shift.
  it('day-to-night plan for a short (≤3-night) block holds the clock (zero shifts)', () => {
    const sp = makeStressPoint('2026-04-17T19:00:00', 'high', 'day-to-night', 2);
    const plan = generatePreAdaptation(sp, currentBedtime, today);
    expect(plan).not.toBeNull();
    expect(plan!.dailyActions.length).toBeGreaterThan(0);
    const allZero = plan!.dailyActions.every((a) => a.bedtimeShift === 0);
    expect(allZero).toBe(true);
  });

  it('night-to-day plan has negative bedtime shifts (advancing)', () => {
    const sp = makeStressPoint('2026-04-17T19:00:00', 'high', 'night-to-day');
    const plan = generatePreAdaptation(sp, currentBedtime, today);
    expect(plan).not.toBeNull();
    const allNegative = plan!.dailyActions.every((a) => a.bedtimeShift < 0);
    expect(allNegative).toBe(true);
  });

  it('stressPoint is included in the returned plan', () => {
    const sp = makeStressPoint('2026-04-17T19:00:00', 'high');
    const plan = generatePreAdaptation(sp, currentBedtime, today);
    expect(plan!.stressPoint).toBe(sp);
  });
});

describe('generatePreAdaptation — edge cases', () => {
  it('returns null when transition is too soon (< 1 day remaining)', () => {
    // Transition is tomorrow, medium severity wants 3 days before = yesterday
    // effectiveStart = today, remaining = 1 day → should generate plan
    const sp = makeStressPoint('2026-04-11T19:00:00', 'medium'); // 1 day away
    const plan = generatePreAdaptation(sp, currentBedtime, today);
    // 1 remaining day is still >= 1, so a plan is generated
    expect(plan).not.toBeNull();
    expect(plan!.dailyActions.length).toBe(1);
  });

  it('returns null when transition is today (0 days remaining)', () => {
    const sp = makeStressPoint('2026-04-10T19:00:00', 'medium'); // same day
    const plan = generatePreAdaptation(sp, currentBedtime, today);
    expect(plan).toBeNull();
  });

  it('clamps start date to today when calculated start is in the past', () => {
    // 3 days before April 12 = April 9 (yesterday) → effectiveStart = today (April 10)
    const sp = makeStressPoint('2026-04-12T19:00:00', 'medium');
    const plan = generatePreAdaptation(sp, currentBedtime, today);
    expect(plan).not.toBeNull();
    expect(plan!.startDate.toISOString().slice(0, 10)).toBe('2026-04-10');
  });

  // B4 / SC-B4.4 — THE G3 FIX. This assertion is INVERTED from the old version. The
  // old test ('isolated-night uses delay strategy → positive shifts') asserted the G3
  // bug: an isolated single night was sent down a multi-day progressive delay it could
  // never finish. An isolated night is a 1-night block → selectMode → Hold → zero
  // clock shift. The pre-adaptation path now agrees with circadian-protocols.
  it('isolated-night holds the clock — every bedtime shift is zero (G3 fix)', () => {
    const sp = makeStressPoint('2026-04-17T19:00:00', 'high', 'isolated-night', 1);
    const plan = generatePreAdaptation(sp, currentBedtime, today);
    expect(plan).not.toBeNull();
    expect(plan!.dailyActions.length).toBeGreaterThan(0);
    for (const action of plan!.dailyActions) {
      expect(action.bedtimeShift).toBe(0);
    }
  });
});
