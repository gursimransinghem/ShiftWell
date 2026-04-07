/**
 * ShiftWell Feature Gate — Phase 18 (RevenueCat Hard Gating)
 *
 * Defines the PremiumFeature type and provides isFeatureAvailable() for
 * Phase 18 v1.2 features (adaptive-brain, ai-coaching, pattern-alerts, etc.).
 *
 * Grandfathering: users who installed before PAYWALL_DATE get all features free.
 *
 * Beta behaviour: BETA_MODE = true → all features available to everyone.
 * Set BETA_MODE = false and update PAYWALL_DATE when gating goes live.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/**
 * All features introduced in Phase 18 start paywalled here.
 * Set to a future date until ready to enforce.
 *
 * ISO-8601 date string. Users who installed BEFORE this date are grandfathered.
 */
export const PAYWALL_DATE = '2026-12-01T00:00:00.000Z';

/**
 * Beta mode: when true, all features are available regardless of subscription.
 * Flip to false to enforce the paywall.
 */
export const BETA_MODE = true;

/** AsyncStorage key for install timestamp (written by Phase 10 onboarding) */
const INSTALLED_AT_KEY = 'shiftwell:installed-at';

// ---------------------------------------------------------------------------
// Feature type
// ---------------------------------------------------------------------------

export type PremiumFeature =
  | 'adaptive-brain'
  | 'ai-coaching'
  | 'pattern-alerts'
  | 'predictive-scheduling'
  | 'sleep-feedback';

/** Features available on the free tier (Phase 18 additions) */
const FREE_FEATURES: PremiumFeature[] = [
  // None of the Phase 18 features are free — they're all premium.
  // Free tier: basic sleep windows, calendar sync, notifications (handled
  // by the existing entitlements.ts system).
];

// ---------------------------------------------------------------------------
// Grandfathering
// ---------------------------------------------------------------------------

/**
 * Read the install date from AsyncStorage.
 * Returns null if never written (should not happen in production).
 */
export async function getInstalledAt(): Promise<Date | null> {
  const raw = await AsyncStorage.getItem(INSTALLED_AT_KEY);
  return raw ? new Date(raw) : null;
}

/**
 * Determine whether the current user is grandfathered.
 * A user is grandfathered if their install date precedes PAYWALL_DATE.
 *
 * @param installedAt - Override for testing; reads AsyncStorage if omitted
 */
export async function computeIsGrandfathered(
  installedAt?: Date | null,
): Promise<boolean> {
  const date = installedAt !== undefined ? installedAt : await getInstalledAt();
  if (!date) return false;
  return date.getTime() < new Date(PAYWALL_DATE).getTime();
}

// ---------------------------------------------------------------------------
// Core gate
// ---------------------------------------------------------------------------

/**
 * Check whether a Phase 18 premium feature is available to the current user.
 *
 * Availability rules (evaluated in order):
 *  1. BETA_MODE = true → always available
 *  2. Feature is in FREE_FEATURES → available
 *  3. User is grandfathered → available
 *  4. User has active premium subscription → available
 *  5. Otherwise → not available
 *
 * This is the synchronous version — relies on isPremium from the store and
 * an already-resolved grandfathered flag. For the async version that reads
 * AsyncStorage, use isFeatureAvailableAsync().
 *
 * @param feature       - The feature to check
 * @param isPremium     - Whether the user has an active premium subscription
 * @param isGrandfathered - Whether the user installed before PAYWALL_DATE
 */
export function isFeatureAvailable(
  feature: PremiumFeature,
  isPremium: boolean,
  isGrandfathered: boolean,
): boolean {
  if (BETA_MODE) return true;
  if (FREE_FEATURES.includes(feature)) return true;
  if (isGrandfathered) return true;
  return isPremium;
}

/**
 * Async version: resolves grandfathered status from AsyncStorage,
 * then evaluates availability.
 *
 * @param feature   - The feature to check
 * @param isPremium - Whether the user has an active premium subscription
 */
export async function isFeatureAvailableAsync(
  feature: PremiumFeature,
  isPremium: boolean,
): Promise<boolean> {
  const isGrandfathered = await computeIsGrandfathered();
  return isFeatureAvailable(feature, isPremium, isGrandfathered);
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

/**
 * React hook providing feature gate status and a showPaywall callback.
 *
 * Note: grandfathered check is async; during the first render `available` may
 * briefly reflect only the beta/premium state. For Phase 18 this is acceptable
 * since BETA_MODE = true and everything is available.
 *
 * @param feature - The feature to gate
 */
export function useFeatureGate(feature: PremiumFeature): {
  available: boolean;
  showPaywall: () => void;
} {
  // Lazy require to avoid pulling the store (and RevenueCat) into modules that
  // only import the pure isFeatureAvailable/BETA_MODE constants.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { usePremiumStore } = require('../../store/premium-store') as {
    usePremiumStore: () => { isPremium: boolean; isInTrial: boolean };
  };
  const { isPremium, isInTrial } = usePremiumStore();

  // Synchronous availability (no grandfathering lookup — requires async)
  // In beta mode this is always true, so the async gap is irrelevant.
  const available = isFeatureAvailable(feature, isPremium || isInTrial, false);

  const showPaywall = () => {
    // Paywall presentation is handled by the navigation layer.
    // Components call this when the user taps a gated feature.
    // Implementation: navigate to paywall screen (Phase 18 wiring).
    console.warn('[ShiftWell] Paywall not yet wired — feature:', feature);
  };

  return { available, showPaywall };
}
