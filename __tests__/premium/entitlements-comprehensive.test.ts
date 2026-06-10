/**
 * Comprehensive entitlements and feature gating tests.
 *
 * Tests cover:
 * - All free features accessible without subscription
 * - Premium features locked without subscription
 * - Grandfathering logic
 * - Trial access
 * - Feature descriptions
 * - Locked features list
 */

import {
  isFeatureAvailable,
  getLockedFeatures,
  getFeatureDescription,
} from '../../src/lib/premium/entitlements';
import type { Feature } from '../../src/lib/premium/entitlements';

describe('Feature Entitlements', () => {
  const FREE_FEATURES: Feature[] = [
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

  const PREMIUM_FEATURES: Feature[] = [
    'adaptive_brain',
    'ai_coaching',
    'pattern_recognition',
    'predictive_scheduling',
  ];

  describe('Free tier access', () => {
    it.each(FREE_FEATURES)(
      'grants free access to %s without any subscription',
      (feature) => {
        expect(
          isFeatureAvailable(feature, { isPremium: false })
        ).toBe(true);
      }
    );

    it.each(FREE_FEATURES)(
      'grants free access to %s even with explicit false flags',
      (feature) => {
        expect(
          isFeatureAvailable(feature, {
            isPremium: false,
            isInTrial: false,
            isGrandfathered: false,
          })
        ).toBe(true);
      }
    );
  });

  describe('Premium features - locked without subscription', () => {
    it.each(PREMIUM_FEATURES)(
      'locks %s without any subscription',
      (feature) => {
        expect(
          isFeatureAvailable(feature, { isPremium: false })
        ).toBe(false);
      }
    );

    it.each(PREMIUM_FEATURES)(
      'locks %s with all flags false',
      (feature) => {
        expect(
          isFeatureAvailable(feature, {
            isPremium: false,
            isInTrial: false,
            isGrandfathered: false,
          })
        ).toBe(false);
      }
    );
  });

  describe('Premium subscription access', () => {
    it.each(PREMIUM_FEATURES)(
      'unlocks %s with active subscription',
      (feature) => {
        expect(
          isFeatureAvailable(feature, { isPremium: true })
        ).toBe(true);
      }
    );

    it.each(FREE_FEATURES)(
      'still grants %s with active subscription',
      (feature) => {
        expect(
          isFeatureAvailable(feature, { isPremium: true })
        ).toBe(true);
      }
    );
  });

  describe('Trial access', () => {
    it.each(PREMIUM_FEATURES)(
      'unlocks %s during trial',
      (feature) => {
        expect(
          isFeatureAvailable(feature, {
            isPremium: false,
            isInTrial: true,
          })
        ).toBe(true);
      }
    );

    it.each(FREE_FEATURES)(
      'still grants %s during trial',
      (feature) => {
        expect(
          isFeatureAvailable(feature, {
            isPremium: false,
            isInTrial: true,
          })
        ).toBe(true);
      }
    );
  });

  describe('Grandfathering', () => {
    it.each(PREMIUM_FEATURES)(
      'unlocks %s for grandfathered users',
      (feature) => {
        expect(
          isFeatureAvailable(feature, {
            isPremium: false,
            isGrandfathered: true,
          })
        ).toBe(true);
      }
    );

    it('grants all features to grandfathered non-premium user', () => {
      const allFeatures = [...FREE_FEATURES, ...PREMIUM_FEATURES];
      allFeatures.forEach((feature) => {
        expect(
          isFeatureAvailable(feature, {
            isPremium: false,
            isGrandfathered: true,
          })
        ).toBe(true);
      });
    });
  });

  describe('getLockedFeatures', () => {
    it('returns only premium features', () => {
      const locked = getLockedFeatures();
      expect(locked.length).toBe(PREMIUM_FEATURES.length);
      PREMIUM_FEATURES.forEach((f) => {
        expect(locked).toContain(f);
      });
    });

    it('does not include any free features', () => {
      const locked = getLockedFeatures();
      FREE_FEATURES.forEach((f) => {
        expect(locked).not.toContain(f);
      });
    });
  });

  describe('getFeatureDescription', () => {
    const ALL_FEATURES: Feature[] = [...FREE_FEATURES, ...PREMIUM_FEATURES];

    it.each(ALL_FEATURES)(
      'returns a non-empty description for %s',
      (feature) => {
        const desc = getFeatureDescription(feature);
        expect(typeof desc).toBe('string');
        expect(desc.length).toBeGreaterThan(0);
      }
    );

    it('returns different descriptions for different features', () => {
      const desc1 = getFeatureDescription('adaptive_brain');
      const desc2 = getFeatureDescription('ai_coaching');
      expect(desc1).not.toBe(desc2);
    });
  });

  describe('Priority: grandfathered > trial > premium', () => {
    it('grandfathered takes priority over isPremium=false', () => {
      expect(
        isFeatureAvailable('adaptive_brain', {
          isPremium: false,
          isGrandfathered: true,
          isInTrial: false,
        })
      ).toBe(true);
    });

    it('trial takes priority over isPremium=false', () => {
      expect(
        isFeatureAvailable('adaptive_brain', {
          isPremium: false,
          isGrandfathered: false,
          isInTrial: true,
        })
      ).toBe(true);
    });
  });
});
