/**
 * ShiftWell Feature Entitlements
 *
 * Defines which features are available on the free tier vs premium,
 * and provides helpers for gating UI and paywall copy.
 */

export type Feature =
  // Free tier features (always available)
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
  | 'cloud_backup'
  // Premium features (Phase 18+)
  | 'adaptive_brain'        // Adaptive Brain: debt card, insight card, circadian protocols
  | 'ai_coaching'           // Future Phase 20
  | 'pattern_recognition'   // Future Phase 23
  | 'predictive_scheduling'; // Future Phase 22

/**
 * Phase 18: Premium gating activated for Adaptive Brain and future AI features.
 * Free tier retains full core value: sleep windows, calendar sync, notifications.
 *
 * Features NOT in this list are premium-only (gated by isFeatureAvailable).
 * Original V1 comment: all features were free during beta — now monetizing.
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
  // adaptive_brain, ai_coaching, pattern_recognition, predictive_scheduling are NOT listed here
  // — they are premium-only, gated in isFeatureAvailable
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
  // Premium features
  adaptive_brain: 'Your plan adapts automatically to your sleep debt and circadian phase',
  ai_coaching: 'Personalized weekly coaching insights powered by AI',
  pattern_recognition: 'Detect long-term sleep patterns and receive proactive adjustments',
  predictive_scheduling: 'Predict optimal shift scheduling weeks in advance',
};

/**
 * Check whether a feature is available for the given subscription status.
 *
 * Access is granted when any of the following are true:
 *  1. The feature is in FREE_FEATURES (always free)
 *  2. The user is grandfathered (installed before PAYWALL_LAUNCH_DATE)
 *  3. The user is in an active trial
 *  4. The user has an active premium subscription
 *
 * @param feature - The feature to check
 * @param status  - Subscription and grandfathering status
 * @returns Whether the feature is available
 */
export function isFeatureAvailable(
  feature: Feature,
  status: { isPremium: boolean; isInTrial?: boolean; isGrandfathered?: boolean },
): boolean {
  if (FREE_FEATURES.includes(feature)) return true;
  if (status.isGrandfathered) return true;
  if (status.isInTrial) return true;
  return status.isPremium;
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
