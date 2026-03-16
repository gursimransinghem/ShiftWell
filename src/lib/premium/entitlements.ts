/**
 * ShiftWell Feature Entitlements
 *
 * Defines which features are available on the free tier vs premium,
 * and provides helpers for gating UI and paywall copy.
 */

export type Feature =
  | 'manual_shift_entry'
  | 'basic_sleep_plan'
  | 'today_screen'
  | 'onboarding'
  | 'ics_import'
  | 'ics_export'
  | 'healthkit'
  | 'accuracy_tracking'
  | 'advanced_tips'
  | 'push_notifications'
  | 'nap_placement'
  | 'meal_timing'
  | 'light_protocols'
  | 'cloud_backup';

/**
 * V1 LAUNCH: All features are free.
 * Committee decision (7/7 consensus): launch free, monetize in v1.2+
 * when RevenueCat is properly integrated and retention data exists.
 *
 * To re-enable premium gating, restore original FREE_FEATURES list:
 * ['manual_shift_entry', 'basic_sleep_plan', 'today_screen', 'onboarding']
 */
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

const FEATURE_DESCRIPTIONS: Record<Feature, string> = {
  manual_shift_entry: 'Add shifts manually with start and end times',
  basic_sleep_plan: 'Get a basic sleep schedule based on your shifts',
  today_screen: 'View your plan for today at a glance',
  onboarding: 'Guided setup and chronotype assessment',
  ics_import: 'Import shifts directly from your calendar (.ics)',
  ics_export: 'Export your sleep plan to any calendar app',
  healthkit: 'Sync sleep data with Apple Health for accuracy tracking',
  accuracy_tracking: 'See how well your actual sleep matches the plan',
  advanced_tips: 'Evidence-based tips tailored to your shift pattern',
  push_notifications: 'Timely reminders for bedtime, caffeine cutoff, and wake',
  nap_placement: 'Strategic nap scheduling optimized for your gaps',
  meal_timing: 'Meal timing windows aligned to your circadian rhythm',
  light_protocols: 'Light exposure and avoidance guidance for faster adaptation',
  cloud_backup: 'Back up your data and sync across devices',
};

/**
 * Check whether a feature is available for the given subscription tier.
 *
 * @param feature - The feature to check
 * @param isPremium - Whether the user has an active premium subscription
 * @returns Whether the feature is available
 */
export function isFeatureAvailable(
  feature: Feature,
  isPremium: boolean,
): boolean {
  if (isPremium) {
    return true;
  }

  return FREE_FEATURES.includes(feature);
}

/**
 * Get all features that require a premium subscription.
 *
 * @returns Array of premium-only features
 */
export function getLockedFeatures(): Feature[] {
  const allFeatures = Object.keys(FEATURE_DESCRIPTIONS) as Feature[];
  return allFeatures.filter((feature) => !FREE_FEATURES.includes(feature));
}

/**
 * Get a human-readable description of a feature, suitable for paywall UI.
 *
 * @param feature - The feature to describe
 * @returns Description string
 */
export function getFeatureDescription(feature: Feature): string {
  return FEATURE_DESCRIPTIONS[feature];
}
