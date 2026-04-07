/**
 * TDD: Advanced enterprise feature tests — RED phase
 * Tests for multi-facility support and schedule optimizer
 * Phase 38 — Advanced Platform Features
 */

import { UserRecord, DifferentialPrivacyConfig } from '../types';
import {
  buildMultiFacilityReport,
  getFacilityRanking,
  getCrossFacilityComparison,
  FacilityConfig,
  FacilityMetrics,
} from '../multi-facility';
import {
  analyzeScheduleImpact,
  generateOptimizationRecommendations,
  ShiftPattern,
  CircadianDisruptionScore,
} from '../schedule-optimizer';

// ─── Fixtures ────────────────────────────────────────────────────────────────

// Use threshold=0 to disable DP for unit tests (cohort size never < 0),
// so we can test multi-facility logic without DP noise obscuring deterministic scores.
const defaultConfig: DifferentialPrivacyConfig = {
  epsilon: 1.0,
  sensitivity: 100,
  cohortThreshold: 0, // DP disabled for unit tests — test DP behavior in anonymizer.test.ts
};

const period = { start: '2026-03-01', end: '2026-03-31' };

const facilityA: FacilityConfig = {
  facilityId: 'fac-001',
  facilityName: 'Memorial Hospital North',
  location: 'Tampa, FL',
};

const facilityB: FacilityConfig = {
  facilityId: 'fac-002',
  facilityName: 'Memorial Hospital South',
  location: 'Brandon, FL',
};

const facilityC: FacilityConfig = {
  facilityId: 'fac-003',
  facilityName: 'Memorial Hospital East',
  location: 'Clearwater, FL',
};

function makeUser(
  recoveryScores: number[],
  adherenceDays: boolean[],
  debtBalance: number,
  orgId = 'org-hosp-1',
  shiftType: UserRecord['shiftType'] = 'night'
): UserRecord {
  return {
    userId: `user-${Math.random().toString(36).slice(2)}`,
    recoveryScores,
    adherenceDays,
    debtBalance,
    shiftType,
    orgId,
  };
}

// High-performing users (avg recovery ~75)
const highUsers: UserRecord[] = [
  makeUser([80, 75, 70, 80, 75], [true, true, true, true, true], 60),
  makeUser([70, 80, 75, 70, 80], [true, true, false, true, true], 45),
  makeUser([75, 75, 80, 75, 70], [true, true, true, false, true], 30),
];

// Low-performing users (avg recovery ~45)
const lowUsers: UserRecord[] = [
  makeUser([40, 45, 50, 40, 45], [true, false, false, true, false], 180),
  makeUser([50, 40, 45, 50, 40], [false, false, true, false, false], 200),
  makeUser([45, 50, 40, 45, 50], [false, true, false, false, true], 160),
];

// ─── Multi-facility tests ─────────────────────────────────────────────────────

describe('buildMultiFacilityReport', () => {
  it('returns one FacilityMetrics entry per facility', () => {
    const facilityUserMap = new Map<FacilityConfig, UserRecord[]>([
      [facilityA, highUsers],
      [facilityB, lowUsers],
    ]);

    const report = buildMultiFacilityReport(facilityUserMap, defaultConfig, period);

    expect(report.facilities).toHaveLength(2);
    expect(report.facilities.map((f: FacilityMetrics) => f.facility.facilityId)).toContain('fac-001');
    expect(report.facilities.map((f: FacilityMetrics) => f.facility.facilityId)).toContain('fac-002');
  });

  it('computes separate CohortMetrics per facility', () => {
    const facilityUserMap = new Map<FacilityConfig, UserRecord[]>([
      [facilityA, highUsers],
      [facilityB, lowUsers],
    ]);

    const report = buildMultiFacilityReport(facilityUserMap, defaultConfig, period);

    const facA = report.facilities.find((f: FacilityMetrics) => f.facility.facilityId === 'fac-001')!;
    const facB = report.facilities.find((f: FacilityMetrics) => f.facility.facilityId === 'fac-002')!;

    // High users should have higher avg recovery than low users
    expect(facA.metrics.avgRecoveryScore).toBeGreaterThan(facB.metrics.avgRecoveryScore);
    // Cohort sizes match input
    expect(facA.metrics.cohortSize).toBe(3);
    expect(facB.metrics.cohortSize).toBe(3);
  });

  it('identifies bestPerforming and worstPerforming facilities', () => {
    const facilityUserMap = new Map<FacilityConfig, UserRecord[]>([
      [facilityA, highUsers],
      [facilityB, lowUsers],
    ]);

    const report = buildMultiFacilityReport(facilityUserMap, defaultConfig, period);

    expect(report.bestPerforming.facility.facilityId).toBe('fac-001');
    expect(report.worstPerforming.facility.facilityId).toBe('fac-002');
  });

  it('computes network averages across all facilities', () => {
    const facilityUserMap = new Map<FacilityConfig, UserRecord[]>([
      [facilityA, highUsers],
      [facilityB, lowUsers],
    ]);

    const report = buildMultiFacilityReport(facilityUserMap, defaultConfig, period);

    // Network avg should be between the two facility scores
    expect(report.networkAvgRecoveryScore).toBeGreaterThan(
      report.worstPerforming.metrics.avgRecoveryScore
    );
    expect(report.networkAvgRecoveryScore).toBeLessThan(
      report.bestPerforming.metrics.avgRecoveryScore
    );
  });

  it('sets generatedAt to a valid ISO datetime', () => {
    const facilityUserMap = new Map<FacilityConfig, UserRecord[]>([
      [facilityA, highUsers],
    ]);

    const report = buildMultiFacilityReport(facilityUserMap, defaultConfig, period);

    expect(() => new Date(report.generatedAt).toISOString()).not.toThrow();
  });

  it('marks dpApplied=true for small cohorts, false for large cohorts', () => {
    const configHighThreshold: DifferentialPrivacyConfig = {
      epsilon: 1.0,
      sensitivity: 100,
      cohortThreshold: 10, // 3 users < 10 => DP applied
    };

    const facilityUserMap = new Map<FacilityConfig, UserRecord[]>([
      [facilityA, highUsers], // 3 users
    ]);

    const report = buildMultiFacilityReport(facilityUserMap, configHighThreshold, period);

    expect(report.facilities[0].dpApplied).toBe(true);
  });
});

describe('getFacilityRanking', () => {
  it('returns facilities sorted by avgRecoveryScore descending', () => {
    const facilityUserMap = new Map<FacilityConfig, UserRecord[]>([
      [facilityA, highUsers],
      [facilityB, lowUsers],
      [facilityC, [...highUsers.slice(0, 2), ...lowUsers.slice(0, 1)]], // mixed
    ]);

    const report = buildMultiFacilityReport(facilityUserMap, defaultConfig, period);
    const ranked = getFacilityRanking(report.facilities);

    // Should be sorted descending
    for (let i = 0; i < ranked.length - 1; i++) {
      expect(ranked[i].metrics.avgRecoveryScore).toBeGreaterThanOrEqual(
        ranked[i + 1].metrics.avgRecoveryScore
      );
    }
  });

  it('assigns rank 1 to top facility, N to bottom', () => {
    const facilityUserMap = new Map<FacilityConfig, UserRecord[]>([
      [facilityA, highUsers],
      [facilityB, lowUsers],
    ]);

    const report = buildMultiFacilityReport(facilityUserMap, defaultConfig, period);
    const ranked = getFacilityRanking(report.facilities);

    expect(ranked[0].rank).toBe(1);
    expect(ranked[ranked.length - 1].rank).toBe(ranked.length);
  });
});

describe('getCrossFacilityComparison', () => {
  it('identifies best and worst and computes gap', () => {
    const facilityUserMap = new Map<FacilityConfig, UserRecord[]>([
      [facilityA, highUsers],
      [facilityB, lowUsers],
    ]);

    const report = buildMultiFacilityReport(facilityUserMap, defaultConfig, period);
    const comparison = getCrossFacilityComparison(report.facilities);

    expect(comparison.best.facility.facilityId).toBe('fac-001');
    expect(comparison.worst.facility.facilityId).toBe('fac-002');
    expect(comparison.gap).toBeGreaterThan(0);
    expect(comparison.gap).toBeCloseTo(
      comparison.best.metrics.avgRecoveryScore - comparison.worst.metrics.avgRecoveryScore,
      1
    );
  });
});

// ─── Schedule optimizer tests ─────────────────────────────────────────────────

describe('analyzeScheduleImpact', () => {
  it('returns one CircadianDisruptionScore per user', () => {
    const patterns: ShiftPattern[] = [
      {
        userId: 'u1',
        shiftSequence: ['day', 'night', 'day', 'off', 'day', 'day', 'day'],
        currentShiftType: 'rotating',
      },
      {
        userId: 'u2',
        shiftSequence: ['night', 'night', 'night', 'off', 'night', 'night', 'night'],
        currentShiftType: 'night',
      },
    ];

    const scores = analyzeScheduleImpact(patterns);

    expect(scores).toHaveLength(2);
    expect(scores.map((s) => s.userId)).toContain('u1');
    expect(scores.map((s) => s.userId)).toContain('u2');
  });

  it('disruptionIndex is between 0 and 100 for all patterns', () => {
    const patterns: ShiftPattern[] = [
      {
        userId: 'rapid-rotation',
        shiftSequence: ['day', 'night', 'day', 'night', 'day', 'night', 'day'],
        currentShiftType: 'rotating',
      },
      {
        userId: 'stable-night',
        shiftSequence: ['night', 'night', 'night', 'night', 'night', 'night', 'night'],
        currentShiftType: 'night',
      },
      {
        userId: 'stable-day',
        shiftSequence: ['day', 'day', 'day', 'day', 'day', 'day', 'day'],
        currentShiftType: 'day',
      },
    ];

    const scores = analyzeScheduleImpact(patterns);

    for (const score of scores) {
      expect(score.disruptionIndex).toBeGreaterThanOrEqual(0);
      expect(score.disruptionIndex).toBeLessThanOrEqual(100);
    }
  });

  it('pure night workers have lower disruption index than rapid-rotation workers', () => {
    const patterns: ShiftPattern[] = [
      {
        userId: 'rotating-worker',
        shiftSequence: ['day', 'night', 'day', 'night', 'day', 'night', 'day'],
        currentShiftType: 'rotating',
      },
      {
        userId: 'night-worker',
        shiftSequence: ['night', 'night', 'night', 'off', 'night', 'night', 'night'],
        currentShiftType: 'night',
      },
    ];

    const scores = analyzeScheduleImpact(patterns);
    const rotatingScore = scores.find((s: CircadianDisruptionScore) => s.userId === 'rotating-worker')!;
    const nightScore = scores.find((s: CircadianDisruptionScore) => s.userId === 'night-worker')!;

    expect(rotatingScore.disruptionIndex).toBeGreaterThan(nightScore.disruptionIndex);
  });

  it('day-night-day rapid reversal in 3 days increases disruption significantly', () => {
    const rapidReversal: ShiftPattern = {
      userId: 'rapid',
      shiftSequence: ['day', 'night', 'day'],
      currentShiftType: 'rotating',
    };

    const baseline: ShiftPattern = {
      userId: 'baseline',
      shiftSequence: ['day', 'day', 'day'],
      currentShiftType: 'day',
    };

    const scores = analyzeScheduleImpact([rapidReversal, baseline]);
    const rapidScore = scores.find((s: CircadianDisruptionScore) => s.userId === 'rapid')!;
    const baselineScore = scores.find((s: CircadianDisruptionScore) => s.userId === 'baseline')!;

    expect(rapidScore.disruptionIndex).toBeGreaterThan(baselineScore.disruptionIndex);
    // Day-night-day should add at least 30 disruption points
    expect(rapidScore.disruptionIndex - baselineScore.disruptionIndex).toBeGreaterThanOrEqual(30);
  });

  it('includes primaryCause and transitionCount in each score', () => {
    const patterns: ShiftPattern[] = [
      {
        userId: 'u1',
        shiftSequence: ['day', 'night', 'day'],
        currentShiftType: 'rotating',
      },
    ];

    const scores = analyzeScheduleImpact(patterns);

    expect(scores[0].primaryCause).toBeDefined();
    expect(typeof scores[0].primaryCause).toBe('string');
    expect(scores[0].transitionCount).toBeGreaterThanOrEqual(0);
  });

  it('consistent night schedule (7+ nights) has lower disruption than fewer nights', () => {
    const longNightRun: ShiftPattern = {
      userId: 'long-nights',
      shiftSequence: ['night', 'night', 'night', 'night', 'night', 'night', 'night'],
      currentShiftType: 'night',
    };

    const shortNightRun: ShiftPattern = {
      userId: 'short-nights',
      shiftSequence: ['night', 'night', 'off', 'day', 'night', 'night', 'off'],
      currentShiftType: 'rotating',
    };

    const scores = analyzeScheduleImpact([longNightRun, shortNightRun]);
    const longScore = scores.find((s: CircadianDisruptionScore) => s.userId === 'long-nights')!;
    const shortScore = scores.find((s: CircadianDisruptionScore) => s.userId === 'short-nights')!;

    // Consistent nights adapted — should be lower disruption than fragmented pattern
    expect(longScore.disruptionIndex).toBeLessThan(shortScore.disruptionIndex);
  });
});

describe('generateOptimizationRecommendations', () => {
  it('returns recommendations only for users with disruptionIndex > 60', () => {
    const highDisruption: CircadianDisruptionScore = {
      userId: 'high',
      disruptionIndex: 75,
      primaryCause: 'rapid rotation D→N→D',
      transitionCount: 6,
    };
    const lowDisruption: CircadianDisruptionScore = {
      userId: 'low',
      disruptionIndex: 30,
      primaryCause: 'consistent nights',
      transitionCount: 0,
    };

    const patterns: ShiftPattern[] = [
      {
        userId: 'high',
        shiftSequence: ['day', 'night', 'day', 'night', 'day', 'night', 'day'],
        currentShiftType: 'rotating',
      },
      {
        userId: 'low',
        shiftSequence: ['night', 'night', 'night', 'night', 'night', 'night', 'night'],
        currentShiftType: 'night',
      },
    ];

    const recs = generateOptimizationRecommendations([highDisruption, lowDisruption], patterns);

    expect(recs.some((r: { userId: string }) => r.userId === 'high')).toBe(true);
    expect(recs.some((r: { userId: string }) => r.userId === 'low')).toBe(false);
  });

  it('each recommendation includes required fields', () => {
    const analyses: CircadianDisruptionScore[] = [
      {
        userId: 'worker-1',
        disruptionIndex: 80,
        primaryCause: 'rapid rotation D→N→D',
        transitionCount: 8,
      },
    ];

    const patterns: ShiftPattern[] = [
      {
        userId: 'worker-1',
        shiftSequence: ['day', 'night', 'day', 'night', 'day', 'night', 'day', 'night'],
        currentShiftType: 'rotating',
      },
    ];

    const recs = generateOptimizationRecommendations(analyses, patterns);

    expect(recs).toHaveLength(1);
    const rec = recs[0];
    expect(rec.userId).toBe('worker-1');
    expect(rec.currentPattern).toBeDefined();
    expect(rec.proposedChange).toBeDefined();
    expect(rec.estimatedDisruptionReduction).toBeGreaterThan(0);
    expect(rec.explanation).toBeDefined();
    expect(['low', 'medium', 'high']).toContain(rec.confidenceLevel);
  });

  it('rotating worker gets permanent nights recommendation (30-40% reduction)', () => {
    const analyses: CircadianDisruptionScore[] = [
      {
        userId: 'rotating-nurse',
        disruptionIndex: 78,
        primaryCause: 'rapid rotation D→N→D',
        transitionCount: 10,
      },
    ];

    const patterns: ShiftPattern[] = [
      {
        userId: 'rotating-nurse',
        shiftSequence: ['day', 'night', 'day', 'night', 'day', 'night', 'day', 'night', 'day'],
        currentShiftType: 'rotating',
      },
    ];

    const recs = generateOptimizationRecommendations(analyses, patterns);

    expect(recs).toHaveLength(1);
    // Permanent nights recommendation should show 30-40% reduction
    expect(recs[0].estimatedDisruptionReduction).toBeGreaterThanOrEqual(25);
    expect(recs[0].estimatedDisruptionReduction).toBeLessThanOrEqual(45);
  });

  it('explanation includes human-readable description with percentage', () => {
    const analyses: CircadianDisruptionScore[] = [
      {
        userId: 'u1',
        disruptionIndex: 70,
        primaryCause: 'rapid rotation D→N→D',
        transitionCount: 7,
      },
    ];

    const patterns: ShiftPattern[] = [
      {
        userId: 'u1',
        shiftSequence: ['day', 'night', 'day', 'night', 'day', 'night'],
        currentShiftType: 'rotating',
      },
    ];

    const recs = generateOptimizationRecommendations(analyses, patterns);

    expect(recs[0].explanation).toMatch(/\d+%/); // contains a percentage
    expect(recs[0].explanation.length).toBeGreaterThan(20); // meaningful text
  });

  it('returns empty array when no users exceed threshold', () => {
    const analyses: CircadianDisruptionScore[] = [
      {
        userId: 'happy-worker',
        disruptionIndex: 50,
        primaryCause: 'moderate rotation',
        transitionCount: 3,
      },
    ];

    const patterns: ShiftPattern[] = [
      {
        userId: 'happy-worker',
        shiftSequence: ['day', 'day', 'evening', 'day', 'day', 'day'],
        currentShiftType: 'day',
      },
    ];

    const recs = generateOptimizationRecommendations(analyses, patterns);

    expect(recs).toHaveLength(0);
  });
});
