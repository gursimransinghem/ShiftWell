/**
 * Tests for autopilot — Phase 34 (30-Day Autopilot)
 *
 * AP-01: eligible when daysTracked >= 30
 * AP-02: not eligible when daysTracked < 30
 * AP-03: shouldAutoApply returns false when not eligible
 * AP-04: shouldAutoApply returns false when eligible but not enabled
 * AP-05: shouldAutoApply returns false when magnitude >= 45 min
 * AP-06: shouldAutoApply returns false when confidence <= 0.6
 * AP-07: shouldAutoApply returns true when all criteria met
 * AP-08: shouldAutoApply uses conservative default (0) for missing confidence
 * AP-09: exact boundary: magnitude 44 min → auto-apply; 45 min → manual
 * AP-10: exact boundary: confidence 0.61 → auto-apply; 0.6 → manual
 */

import { checkAutopilotEligibility, shouldAutoApply } from '../../src/lib/adaptive/autopilot';
import type { AutopilotState } from '../../src/lib/adaptive/autopilot';
import type { AdaptiveChange } from '../../src/lib/adaptive/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeState(eligible: boolean, enabled: boolean, autonomousChanges = 0): AutopilotState {
  return {
    eligible,
    enabled,
    activeSince: enabled ? '2026-03-01' : null,
    autonomousChanges,
  };
}

function makeChange(magnitudeMinutes: number): AdaptiveChange {
  return {
    type: 'bedtime-shifted',
    factor: 'circadian',
    magnitudeMinutes,
    humanReadable: `Bedtime shifted ${magnitudeMinutes} min later`,
    reason: 'Night shift transition',
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('checkAutopilotEligibility', () => {
  it('AP-01: eligible when daysTracked >= 30', () => {
    expect(checkAutopilotEligibility(30)).toBe(true);
    expect(checkAutopilotEligibility(60)).toBe(true);
    expect(checkAutopilotEligibility(365)).toBe(true);
  });

  it('AP-02: not eligible when daysTracked < 30', () => {
    expect(checkAutopilotEligibility(0)).toBe(false);
    expect(checkAutopilotEligibility(1)).toBe(false);
    expect(checkAutopilotEligibility(29)).toBe(false);
  });
});

describe('shouldAutoApply', () => {
  it('AP-03: returns false when not eligible', () => {
    const state = makeState(false, true);
    expect(shouldAutoApply(makeChange(30), state, 0.8)).toBe(false);
  });

  it('AP-04: returns false when eligible but not enabled', () => {
    const state = makeState(true, false);
    expect(shouldAutoApply(makeChange(30), state, 0.8)).toBe(false);
  });

  it('AP-05: returns false when magnitude >= 45 min', () => {
    const state = makeState(true, true);
    expect(shouldAutoApply(makeChange(45), state, 0.8)).toBe(false);
    expect(shouldAutoApply(makeChange(60), state, 0.8)).toBe(false);
    expect(shouldAutoApply(makeChange(90), state, 0.8)).toBe(false);
  });

  it('AP-06: returns false when confidence <= 0.6', () => {
    const state = makeState(true, true);
    expect(shouldAutoApply(makeChange(30), state, 0.6)).toBe(false);
    expect(shouldAutoApply(makeChange(30), state, 0.5)).toBe(false);
    expect(shouldAutoApply(makeChange(30), state, 0)).toBe(false);
  });

  it('AP-07: returns true when all criteria met', () => {
    const state = makeState(true, true);
    expect(shouldAutoApply(makeChange(30), state, 0.8)).toBe(true);
    expect(shouldAutoApply(makeChange(1), state, 0.7)).toBe(true);
    expect(shouldAutoApply(makeChange(44), state, 0.65)).toBe(true);
  });

  it('AP-08: defaults confidence to 0 (conservative) when not provided', () => {
    const state = makeState(true, true);
    // Default confidence = 0 which is <= 0.6 → should NOT auto-apply
    expect(shouldAutoApply(makeChange(30), state)).toBe(false);
  });

  it('AP-09: magnitude boundary: 44 → auto-apply, 45 → manual', () => {
    const state = makeState(true, true);
    expect(shouldAutoApply(makeChange(44), state, 0.8)).toBe(true);
    expect(shouldAutoApply(makeChange(45), state, 0.8)).toBe(false);
  });

  it('AP-10: confidence boundary: 0.61 → auto-apply, 0.60 → manual', () => {
    const state = makeState(true, true);
    expect(shouldAutoApply(makeChange(30), state, 0.61)).toBe(true);
    expect(shouldAutoApply(makeChange(30), state, 0.60)).toBe(false);
  });
});
