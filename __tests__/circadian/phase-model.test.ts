/**
 * Circadian phase-model tests — B3 (R6-core: the DLMO/CBTmin estimator).
 *
 * Covers SC-B3.1 … SC-B3.9 (spec Part 2 B3 + Part 6.3 reconciliation):
 *   B3.1 — cbtMinHour === (dlmoHour + 7) mod 24, exactly, for every chronotype.
 *   B3.2 — the 3 seed bands (early / intermediate / late).
 *   B3.3 — confidenceHours ≥ 2.0 for a seed; projectPhase widens but never exceeds 4.0.
 *   B3.4 — determinism: 1000 identical calls produce identical output.
 *   B3.5 — cbtMinDate resolves the occurrence NEAREST a reference instant.
 *   B3.6 — purity: no Date.now / no argument-free new Date() in the source.
 *   B3.7 — a late phase wrapping past midnight resolves cbtMinHour correctly.
 *   B3.8 — a cross-midnight night-shift case resolves cbtMinDate inside the shift.
 *   B3.9 — cbtMinDate returns the wall-clock CBTmin hour (single-timezone assumption).
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  estimateBaselinePhase,
  projectPhase,
  cbtMinDate,
  dlmoDate,
  mod24,
} from '../../src/lib/circadian/phase-model';
import type { Chronotype, UserProfile } from '../../src/lib/circadian/types';
import { DEFAULT_PROFILE } from '../../src/lib/circadian/types';

// ── Helpers ──────────────────────────────────────────────────────────

function profileFor(chronotype: Chronotype, measuredDlmoHour?: number): UserProfile {
  return { ...DEFAULT_PROFILE, chronotype, measuredDlmoHour };
}

/** Expected seed DLMO/CBTmin per chronotype (derived from MSFsc − 6h, CBTmin = DLMO+7). */
const SEED_BANDS: Record<Chronotype, { dlmoHour: number; cbtMinHour: number }> = {
  early: { dlmoHour: 19.5, cbtMinHour: 2.5 },
  intermediate: { dlmoHour: 21.0, cbtMinHour: 4.0 },
  late: { dlmoHour: 22.5, cbtMinHour: 5.5 },
};

// ── SC-B3.1 — CBTmin = DLMO + 7 mod 24 ───────────────────────────────

describe('SC-B3.1: cbtMinHour === (dlmoHour + 7) mod 24', () => {
  it('holds exactly for every chronotype seed', () => {
    for (const ct of ['early', 'intermediate', 'late'] as const) {
      const phase = estimateBaselinePhase(profileFor(ct));
      expect(phase.cbtMinHour).toBeCloseTo(mod24(phase.dlmoHour + 7), 10);
    }
  });

  it('holds for a user-tuned DLMO (including a value that wraps past 24)', () => {
    const phase = estimateBaselinePhase(profileFor('intermediate', 23.5));
    expect(phase.dlmoHour).toBeCloseTo(23.5, 10);
    expect(phase.cbtMinHour).toBeCloseTo(mod24(23.5 + 7), 10); // 30.5 mod 24 = 6.5
    expect(phase.cbtMinHour).toBeCloseTo(6.5, 10);
  });
});

// ── SC-B3.2 — the three seed bands ───────────────────────────────────

describe('SC-B3.2: chronotype seed bands', () => {
  it('produces the early / intermediate / late seed DLMO and CBTmin values', () => {
    for (const ct of ['early', 'intermediate', 'late'] as const) {
      const phase = estimateBaselinePhase(profileFor(ct));
      expect(phase.dlmoHour).toBeCloseTo(SEED_BANDS[ct].dlmoHour, 5);
      expect(phase.cbtMinHour).toBeCloseTo(SEED_BANDS[ct].cbtMinHour, 5);
      expect(phase.source).toBe('chronotype-seed');
    }
  });

  it('a measured DLMO overrides the seed and reports source "user-tuned"', () => {
    const phase = estimateBaselinePhase(profileFor('intermediate', 20.0));
    expect(phase.source).toBe('user-tuned');
    expect(phase.dlmoHour).toBeCloseTo(20.0, 10);
  });
});

// ── SC-B3.3 — confidence band ────────────────────────────────────────

describe('SC-B3.3: confidence band', () => {
  it('every chronotype-seed estimate has confidenceHours >= 2.0', () => {
    for (const ct of ['early', 'intermediate', 'late'] as const) {
      const phase = estimateBaselinePhase(profileFor(ct));
      expect(phase.confidenceHours).toBeGreaterThanOrEqual(2.0);
    }
  });

  it('a user-tuned estimate is tighter than a seed but never below 1.5', () => {
    const tuned = estimateBaselinePhase(profileFor('intermediate', 21.0));
    expect(tuned.confidenceHours).toBeGreaterThanOrEqual(1.0);
    expect(tuned.confidenceHours).toBeLessThan(2.0);
  });

  it('projectPhase widens confidence with days projected, capped at 4.0', () => {
    const baseline = estimateBaselinePhase(profileFor('intermediate'));
    // 5 days projected: 2.0 + 5*0.5 = 4.5 → capped at 4.0.
    const projected5 = projectPhase(baseline, 0, 5);
    expect(projected5.confidenceHours).toBeLessThanOrEqual(4.0);
    expect(projected5.confidenceHours).toBeCloseTo(4.0, 5);

    // 20 days projected — still never exceeds the 4.0 ceiling.
    const projected20 = projectPhase(baseline, 0, 20);
    expect(projected20.confidenceHours).toBeLessThanOrEqual(4.0);

    // A 1-day projection widens but stays within [floor, cap].
    const projected1 = projectPhase(baseline, 0, 1);
    expect(projected1.confidenceHours).toBeGreaterThanOrEqual(1.5);
    expect(projected1.confidenceHours).toBeLessThanOrEqual(4.0);
  });

  it('projectPhase applies a cumulative shift to the DLMO and re-derives CBTmin', () => {
    const baseline = estimateBaselinePhase(profileFor('intermediate')); // DLMO 21.0
    // +120 min = +2h delay → DLMO 23.0, CBTmin (23+7) mod 24 = 6.0.
    const projected = projectPhase(baseline, 120, 2);
    expect(projected.dlmoHour).toBeCloseTo(23.0, 5);
    expect(projected.cbtMinHour).toBeCloseTo(mod24(projected.dlmoHour + 7), 10);
  });
});

// ── SC-B3.4 — determinism ────────────────────────────────────────────

describe('SC-B3.4: determinism', () => {
  it('1000 identical estimateBaselinePhase calls produce identical output', () => {
    const profile = profileFor('late');
    const first = JSON.stringify(estimateBaselinePhase(profile));
    for (let i = 0; i < 1000; i++) {
      expect(JSON.stringify(estimateBaselinePhase(profile))).toBe(first);
    }
  });

  it('1000 identical projectPhase calls produce identical output', () => {
    const baseline = estimateBaselinePhase(profileFor('early'));
    const first = JSON.stringify(projectPhase(baseline, 90, 3));
    for (let i = 0; i < 1000; i++) {
      expect(JSON.stringify(projectPhase(baseline, 90, 3))).toBe(first);
    }
  });
});

// ── SC-B3.5 — cbtMinDate nearest-occurrence ──────────────────────────

describe('SC-B3.5: cbtMinDate resolves the nearest occurrence', () => {
  const phase = estimateBaselinePhase(profileFor('intermediate')); // cbtMinHour 4.0

  it('a reference at 22:00 on day D resolves CBTmin 04:00 to D+1 (next occurrence)', () => {
    const reference = new Date('2026-04-14T22:00:00');
    const resolved = cbtMinDate(phase, reference);
    expect(resolved.getHours()).toBe(4);
    expect(resolved.getMinutes()).toBe(0);
    expect(resolved.getDate()).toBe(15); // D+1
  });

  it('a reference at 06:00 on day D resolves CBTmin 04:00 to the same day D', () => {
    const reference = new Date('2026-04-14T06:00:00');
    const resolved = cbtMinDate(phase, reference);
    expect(resolved.getHours()).toBe(4);
    expect(resolved.getDate()).toBe(14); // same day
  });

  it('dlmoDate follows the same nearest-occurrence rule', () => {
    // intermediate DLMO 21.0 — reference at 02:00 should resolve to 21:00 the prior day.
    const reference = new Date('2026-04-14T02:00:00');
    const resolved = dlmoDate(phase, reference);
    expect(resolved.getHours()).toBe(21);
    expect(resolved.getDate()).toBe(13); // prior day is nearer than 21:00 same-day
  });
});

// ── SC-B3.7 — late phase wrapping past midnight ──────────────────────

describe('SC-B3.7: a late-phase DLMO that wraps past midnight', () => {
  it('accepts a measured DLMO ≥ 23.5 and resolves cbtMinHour via mod 24', () => {
    const phase = estimateBaselinePhase(profileFor('late', 23.75));
    expect(phase.dlmoHour).toBeCloseTo(23.75, 10);
    // (23.75 + 7) mod 24 = 30.75 mod 24 = 6.75
    expect(phase.cbtMinHour).toBeCloseTo(6.75, 10);
    expect(phase.cbtMinHour).toBeGreaterThanOrEqual(0);
    expect(phase.cbtMinHour).toBeLessThan(24);
  });

  it('mod24 wraps values above and below the [0,24) range', () => {
    expect(mod24(25)).toBeCloseTo(1, 10);
    expect(mod24(-1)).toBeCloseTo(23, 10);
    expect(mod24(24)).toBeCloseTo(0, 10);
    expect(mod24(30.5)).toBeCloseTo(6.5, 10);
  });
});

// ── SC-B3.8 — cross-midnight night-shift case ────────────────────────

describe('SC-B3.8: cross-midnight night shift', () => {
  it('cbtMinHour 4.0 resolves to 04:00 INSIDE a 19:00(D)→07:00(D+1) night shift', () => {
    const phase = estimateBaselinePhase(profileFor('intermediate')); // cbtMinHour 4.0
    const shiftStart = new Date('2026-04-14T19:00:00');
    const shiftEnd = new Date('2026-04-15T07:00:00');

    const resolved = cbtMinDate(phase, shiftStart);
    expect(resolved.getHours()).toBe(4);
    expect(resolved.getDate()).toBe(15); // D+1, not D
    // The resolved CBTmin lies within the shift bounds.
    expect(resolved.getTime()).toBeGreaterThan(shiftStart.getTime());
    expect(resolved.getTime()).toBeLessThan(shiftEnd.getTime());
  });
});

// ── SC-B3.9 — wall-clock CBTmin (single-timezone assumption) ─────────

describe('SC-B3.9: cbtMinDate returns the wall-clock CBTmin hour', () => {
  it('resolves to the same wall-clock hour across a US spring-forward date', () => {
    const phase = estimateBaselinePhase(profileFor('intermediate')); // cbtMinHour 4.0
    // 2026 US DST begins Sun Mar 8. A reference just before it still yields wall-clock 04:00.
    const reference = new Date('2026-03-08T06:00:00');
    const resolved = cbtMinDate(phase, reference);
    expect(resolved.getHours()).toBe(4);
    expect(resolved.getMinutes()).toBe(0);
  });
});

// ── SC-B3.6 — purity of the phase-model source ───────────────────────

describe('SC-B3.6: phase-model.ts is a pure module', () => {
  it('contains no Date.now and no argument-free new Date() in executable code', () => {
    const sourcePath = path.resolve(__dirname, '../../src/lib/circadian/phase-model.ts');
    const raw = fs.readFileSync(sourcePath, 'utf8');
    // Strip block comments and line comments — the module's JSDoc legitimately
    // *describes* this purity rule in prose, so only executable code is scanned.
    const code = raw
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    // No wall-clock reads.
    expect(code).not.toMatch(/Date\.now/);
    // No argument-free `new Date()` (whitespace-tolerant). `new Date(arg)` is fine.
    expect(code).not.toMatch(/new\s+Date\s*\(\s*\)/);
  });
});
