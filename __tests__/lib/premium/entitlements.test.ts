/**
 * Tests: src/lib/premium/entitlements.ts
 *
 * Covers:
 *  - adaptive_brain is NOT in FREE_FEATURES (premium-only)
 *  - basic_sleep_plan IS in FREE_FEATURES
 *  - isFeatureAvailable with isGrandfathered override
 *  - Premium, trial, and free access paths
 */

import {
  isFeatureAvailable,
  getLockedFeatures,
  type Feature,
} from '../../../src/lib/premium/entitlements';

// ---------------------------------------------------------------------------
// Feature classification
// ---------------------------------------------------------------------------

describe('FREE_FEATURES classification', () => {
  test("'adaptive_brain' is NOT in FREE_FEATURES (premium-only)", () => {
    const locked = getLockedFeatures();
    expect(locked).toContain('adaptive_brain');
  });

  test("'basic_sleep_plan' IS available to free users", () => {
    expect(isFeatureAvailable('basic_sleep_plan', { isPremium: false })).toBe(true);
  });

  test("'today_screen' IS available to free users", () => {
    expect(isFeatureAvailable('today_screen', { isPremium: false })).toBe(true);
  });

  test("'nap_placement' IS available to free users", () => {
    expect(isFeatureAvailable('nap_placement', { isPremium: false })).toBe(true);
  });

  test("'light_protocols' IS available to free users", () => {
    expect(isFeatureAvailable('light_protocols', { isPremium: false })).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isFeatureAvailable — adaptive_brain (premium gate)
// ---------------------------------------------------------------------------

describe("isFeatureAvailable('adaptive_brain', ...)", () => {
  test('returns false for free user who is not grandfathered and not in trial', () => {
    expect(
      isFeatureAvailable('adaptive_brain', { isPremium: false, isGrandfathered: false }),
    ).toBe(false);
  });

  test('returns true for grandfathered free user', () => {
    expect(
      isFeatureAvailable('adaptive_brain', { isPremium: false, isGrandfathered: true }),
    ).toBe(true);
  });

  test('returns true for premium user (not grandfathered)', () => {
    expect(
      isFeatureAvailable('adaptive_brain', { isPremium: true, isGrandfathered: false }),
    ).toBe(true);
  });

  test('returns true for trial user (not grandfathered)', () => {
    expect(
      isFeatureAvailable('adaptive_brain', { isPremium: false, isInTrial: true, isGrandfathered: false }),
    ).toBe(true);
  });

  test('returns false when neither premium, trial, nor grandfathered', () => {
    expect(
      isFeatureAvailable('adaptive_brain', { isPremium: false, isInTrial: false, isGrandfathered: false }),
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isFeatureAvailable — backward compat (boolean overload not tested; object form)
// ---------------------------------------------------------------------------

describe('isFeatureAvailable — free features always available', () => {
  const freeFeatures: Feature[] = [
    'manual_shift_entry',
    'basic_sleep_plan',
    'today_screen',
    'onboarding',
    'ics_import',
    'ics_export',
    'healthkit',
    'accuracy_tracking',
    'advanced_tips',
    'push_notifications',
    'nap_placement',
    'meal_timing',
    'light_protocols',
    'cloud_backup',
  ];

  freeFeatures.forEach((feature) => {
    test(`'${feature}' is always available (free tier)`, () => {
      expect(isFeatureAvailable(feature, { isPremium: false, isGrandfathered: false })).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// getLockedFeatures — premium features list
// ---------------------------------------------------------------------------

describe('getLockedFeatures', () => {
  test('includes all Phase 18+ premium features', () => {
    const locked = getLockedFeatures();
    expect(locked).toContain('adaptive_brain');
    expect(locked).toContain('ai_coaching');
    expect(locked).toContain('pattern_recognition');
    expect(locked).toContain('predictive_scheduling');
  });

  test('does not include core free features', () => {
    const locked = getLockedFeatures();
    expect(locked).not.toContain('basic_sleep_plan');
    expect(locked).not.toContain('today_screen');
    expect(locked).not.toContain('nap_placement');
  });
});
