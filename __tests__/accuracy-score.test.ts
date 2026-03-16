/**
 * Tests for plan accuracy scoring and sleep comparison modules.
 *
 * Verifies that:
 * - comparePlannedVsActual correctly scores adherence for various scenarios
 * - calculateAccuracy produces weighted timing/duration scores
 * - calculateWeeklyAccuracy aggregates, calculates trends and streaks
 * - generateInsight returns appropriate messages by score range
 */

import { comparePlannedVsActual } from '../src/lib/healthkit/sleep-comparison';
import type { SleepComparison } from '../src/lib/healthkit/sleep-comparison';
import {
  calculateAccuracy,
  calculateWeeklyAccuracy,
  generateInsight,
} from '../src/lib/healthkit/accuracy-score';
import type { PlanAccuracy } from '../src/lib/healthkit/accuracy-score';
import type { SleepRecord } from '../src/lib/healthkit/healthkit-service';

// ── Helpers ──────────────────────────────────────────────────────────

/** Create a planned sleep window */
function makePlanned(startISO: string, endISO: string) {
  return { start: new Date(startISO), end: new Date(endISO) };
}

/** Create a SleepRecord with the fields comparePlannedVsActual needs */
function makeActual(
  asleepStartISO: string,
  asleepEndISO: string,
  totalSleepMinutes: number,
): SleepRecord {
  return {
    date: new Date(asleepStartISO),
    inBedStart: new Date(asleepStartISO),
    inBedEnd: new Date(asleepEndISO),
    asleepStart: new Date(asleepStartISO),
    asleepEnd: new Date(asleepEndISO),
    totalSleepMinutes,
    deepSleepMinutes: 0,
    remSleepMinutes: 0,
    coreSleepMinutes: 0,
    sleepEfficiency: 90,
    source: 'Apple Watch',
  };
}

/**
 * Build a SleepComparison from planned/actual times for use with
 * calculateAccuracy and calculateWeeklyAccuracy.
 */
function makeComparison(
  plannedStart: string,
  plannedEnd: string,
  actualStart: string | null,
  actualEnd: string | null,
  totalSleepMinutes?: number,
): SleepComparison {
  const planned = makePlanned(plannedStart, plannedEnd);
  const actual =
    actualStart && actualEnd
      ? makeActual(actualStart, actualEnd, totalSleepMinutes ?? diffMinutes(actualStart, actualEnd))
      : null;
  return comparePlannedVsActual(planned, actual);
}

function diffMinutes(startISO: string, endISO: string): number {
  return (new Date(endISO).getTime() - new Date(startISO).getTime()) / 60000;
}

// ── comparePlannedVsActual ───────────────────────────────────────────

describe('comparePlannedVsActual', () => {
  it('scores ~100 when actual matches planned exactly', () => {
    const planned = makePlanned('2026-03-10T22:00:00', '2026-03-11T06:00:00');
    const actual = makeActual('2026-03-10T22:00:00', '2026-03-11T06:00:00', 480);
    const result = comparePlannedVsActual(planned, actual);

    expect(result.adherenceScore).toBeGreaterThanOrEqual(95);
    expect(result.bedtimeDeviationMinutes).toBe(0);
    expect(result.wakeDeviationMinutes).toBe(0);
    expect(result.durationDeviationMinutes).toBe(0);
  });

  it('returns score 0 and watch insight when actual is null', () => {
    const planned = makePlanned('2026-03-10T22:00:00', '2026-03-11T06:00:00');
    const result = comparePlannedVsActual(planned, null);

    expect(result.adherenceScore).toBe(0);
    expect(result.actual).toBeNull();
    expect(result.insight.toLowerCase()).toContain('watch');
  });

  it('gives moderate score for 30-minute late bedtime', () => {
    const planned = makePlanned('2026-03-10T22:00:00', '2026-03-11T06:00:00');
    // 30 min late bedtime, 30 min late wake, same duration
    const actual = makeActual('2026-03-10T22:30:00', '2026-03-11T06:30:00', 480);
    const result = comparePlannedVsActual(planned, actual);

    expect(result.bedtimeDeviationMinutes).toBe(30);
    expect(result.adherenceScore).toBeGreaterThan(50);
    expect(result.adherenceScore).toBeLessThan(95);
  });

  it('gives low score when 60+ min late and 60+ min short', () => {
    const planned = makePlanned('2026-03-10T22:00:00', '2026-03-11T06:00:00');
    // 75 min late bedtime, 60 min early wake, much shorter duration
    const actual = makeActual('2026-03-10T23:15:00', '2026-03-11T05:00:00', 345);
    const result = comparePlannedVsActual(planned, actual);

    expect(result.bedtimeDeviationMinutes).toBe(75);
    expect(result.wakeDeviationMinutes).toBe(-60);
    expect(result.adherenceScore).toBeLessThan(50);
  });

  it('scores well for early bedtime (within tolerance)', () => {
    const planned = makePlanned('2026-03-10T22:00:00', '2026-03-11T06:00:00');
    // 10 min early — within the 15-min tolerance
    const actual = makeActual('2026-03-10T21:50:00', '2026-03-11T05:50:00', 480);
    const result = comparePlannedVsActual(planned, actual);

    expect(result.bedtimeDeviationMinutes).toBe(-10);
    expect(result.adherenceScore).toBeGreaterThanOrEqual(95);
  });
});

// ── calculateAccuracy ────────────────────────────────────────────────

describe('calculateAccuracy', () => {
  it('returns high overall score for a perfect comparison', () => {
    const comparison = makeComparison(
      '2026-03-10T22:00:00',
      '2026-03-11T06:00:00',
      '2026-03-10T22:00:00',
      '2026-03-11T06:00:00',
      480,
    );
    const planned = makePlanned('2026-03-10T22:00:00', '2026-03-11T06:00:00');
    const result = calculateAccuracy(planned, comparison);

    expect(result.overallScore).toBeGreaterThanOrEqual(95);
    expect(result.timingAccuracy).toBeGreaterThanOrEqual(95);
    expect(result.durationAccuracy).toBeGreaterThanOrEqual(95);
  });

  it('returns 0 score when there is no actual data', () => {
    const comparison = makeComparison(
      '2026-03-10T22:00:00',
      '2026-03-11T06:00:00',
      null,
      null,
    );
    const planned = makePlanned('2026-03-10T22:00:00', '2026-03-11T06:00:00');
    const result = calculateAccuracy(planned, comparison);

    expect(result.overallScore).toBe(0);
    expect(result.timingAccuracy).toBe(0);
    expect(result.durationAccuracy).toBe(0);
  });

  it('timing accuracy > duration accuracy when timing is good but duration is poor', () => {
    // On-time bedtime and wake, but slept far less than the window
    const comparison = makeComparison(
      '2026-03-10T22:00:00',
      '2026-03-11T06:00:00',
      '2026-03-10T22:05:00', // 5 min late (within tolerance)
      '2026-03-11T06:05:00', // 5 min late (within tolerance)
      360, // only 6 hours vs 8 planned → -120 min duration deviation
    );
    const planned = makePlanned('2026-03-10T22:00:00', '2026-03-11T06:00:00');
    const result = calculateAccuracy(planned, comparison);

    expect(result.timingAccuracy).toBeGreaterThan(result.durationAccuracy);
  });
});

// ── calculateWeeklyAccuracy ──────────────────────────────────────────

describe('calculateWeeklyAccuracy', () => {
  it('returns 0 score for empty comparisons array', () => {
    const result = calculateWeeklyAccuracy([]);

    expect(result.overallScore).toBe(0);
    expect(result.timingAccuracy).toBe(0);
    expect(result.streakDays).toBe(0);
    expect(result.weeklyTrend).toBe('stable');
  });

  it('returns averaged score for a mix of good and moderate nights', () => {
    const comparisons = [
      // Good night (on time)
      makeComparison(
        '2026-03-10T22:00:00', '2026-03-11T06:00:00',
        '2026-03-10T22:05:00', '2026-03-11T05:55:00', 470,
      ),
      // Moderate night — 30 min late, 7h sleep
      makeComparison(
        '2026-03-11T22:00:00', '2026-03-12T06:00:00',
        '2026-03-11T22:30:00', '2026-03-12T05:30:00', 420,
      ),
    ];

    const result = calculateWeeklyAccuracy(comparisons);

    // Should be between the extremes (both have non-zero scores)
    expect(result.overallScore).toBeGreaterThan(50);
    expect(result.overallScore).toBeLessThan(100);
  });

  it('counts streak when all nights are >80%', () => {
    const comparisons = Array.from({ length: 5 }, (_, i) => {
      const day = 10 + i;
      const dateStr = `2026-03-${day}`;
      return makeComparison(
        `${dateStr}T22:00:00`, `2026-03-${day + 1}T06:00:00`,
        `${dateStr}T22:00:00`, `2026-03-${day + 1}T06:00:00`,
        480,
      );
    });

    const result = calculateWeeklyAccuracy(comparisons);

    expect(result.streakDays).toBe(5);
  });

  it('detects improving trend (bad first half, good second half)', () => {
    const comparisons: SleepComparison[] = [];
    // First 3 nights: moderately bad (45 min late, 6h sleep vs 8h planned)
    // Scores around 40-60 — bad enough to show a trend but not filtered out
    for (let i = 0; i < 3; i++) {
      const day = 10 + i;
      comparisons.push(
        makeComparison(
          `2026-03-${day}T22:00:00`, `2026-03-${day + 1}T06:00:00`,
          `2026-03-${day}T22:45:00`, `2026-03-${day + 1}T04:45:00`, 360,
        ),
      );
    }
    // Last 4 nights: good (on time)
    for (let i = 3; i < 7; i++) {
      const day = 10 + i;
      comparisons.push(
        makeComparison(
          `2026-03-${day}T22:00:00`, `2026-03-${day + 1}T06:00:00`,
          `2026-03-${day}T22:05:00`, `2026-03-${day + 1}T05:55:00`, 470,
        ),
      );
    }

    const result = calculateWeeklyAccuracy(comparisons);

    expect(result.weeklyTrend).toBe('improving');
  });

  it('detects declining trend (good first half, bad second half)', () => {
    const comparisons: SleepComparison[] = [];
    // First 3 nights: good (on time)
    for (let i = 0; i < 3; i++) {
      const day = 10 + i;
      comparisons.push(
        makeComparison(
          `2026-03-${day}T22:00:00`, `2026-03-${day + 1}T06:00:00`,
          `2026-03-${day}T22:05:00`, `2026-03-${day + 1}T05:55:00`, 470,
        ),
      );
    }
    // Last 4 nights: moderately bad (45 min late, 6h sleep)
    for (let i = 3; i < 7; i++) {
      const day = 10 + i;
      comparisons.push(
        makeComparison(
          `2026-03-${day}T22:00:00`, `2026-03-${day + 1}T06:00:00`,
          `2026-03-${day}T22:45:00`, `2026-03-${day + 1}T04:45:00`, 360,
        ),
      );
    }

    const result = calculateWeeklyAccuracy(comparisons);

    expect(result.weeklyTrend).toBe('declining');
  });
});

// ── generateInsight ──────────────────────────────────────────────────

describe('generateInsight', () => {
  it('returns encouraging message for high score (90+)', () => {
    const accuracy: PlanAccuracy = {
      overallScore: 95,
      timingAccuracy: 95,
      durationAccuracy: 95,
      insight: '',
      weeklyTrend: 'stable',
      streakDays: 2,
    };
    const insight = generateInsight(accuracy);

    expect(insight.toLowerCase()).toMatch(/excellent|outstanding|strong/);
  });

  it('returns supportive (not judgmental) message for low score (<25)', () => {
    const accuracy: PlanAccuracy = {
      overallScore: 15,
      timingAccuracy: 10,
      durationAccuracy: 20,
      insight: '',
      weeklyTrend: 'stable',
      streakDays: 0,
    };
    const insight = generateInsight(accuracy);

    // Should be supportive: mentions "happens" or "fresh start", not shaming
    expect(insight.toLowerCase()).toMatch(/happens|fresh start|tomorrow/);
    // Should NOT contain judgmental language
    expect(insight.toLowerCase()).not.toMatch(/terrible|awful|bad job|failure/);
  });

  it('mentions streak when streakDays >= 5 and score is high', () => {
    const accuracy: PlanAccuracy = {
      overallScore: 95,
      timingAccuracy: 95,
      durationAccuracy: 95,
      insight: '',
      weeklyTrend: 'stable',
      streakDays: 5,
    };
    const insight = generateInsight(accuracy);

    expect(insight).toContain('5-day streak');
  });
});
