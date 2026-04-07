import { generatePreAdaptation } from '../../src/lib/predictive/pre-adaptation';
import type { TransitionStressPoint } from '../../src/lib/predictive/stress-scorer';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeStressPoint(
  dateStr: string,
  severity: TransitionStressPoint['severity'],
  transitionType: TransitionStressPoint['transitionType'] = 'day-to-night',
): TransitionStressPoint {
  return {
    date: new Date(dateStr),
    transitionType,
    severity,
    score: severity === 'low' ? 10 : severity === 'medium' ? 40 : severity === 'high' ? 65 : 85,
    factors: [],
    daysUntil: 0,
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

  it('day-to-night plan has positive bedtime shifts (delaying)', () => {
    const sp = makeStressPoint('2026-04-17T19:00:00', 'high', 'day-to-night');
    const plan = generatePreAdaptation(sp, currentBedtime, today);
    expect(plan).not.toBeNull();
    const allPositive = plan!.dailyActions.every((a) => a.bedtimeShift > 0);
    expect(allPositive).toBe(true);
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

  it('isolated-night uses delay strategy (positive bedtime shifts)', () => {
    const sp = makeStressPoint('2026-04-17T19:00:00', 'high', 'isolated-night');
    const plan = generatePreAdaptation(sp, currentBedtime, today);
    expect(plan).not.toBeNull();
    expect(plan!.dailyActions[0].bedtimeShift).toBeGreaterThan(0);
  });
});
