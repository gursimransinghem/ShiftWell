/**
 * Grandfathering logic for ShiftWell premium features.
 *
 * Users who installed before PAYWALL_LAUNCH_DATE retain free access
 * to all premium features. This builds loyalty and prevents churn
 * from early TestFlight adopters who experienced the app before gating.
 *
 * PREM-04: Grandfathering logic for pre-paywall users.
 */

/**
 * The date on which premium feature gating was activated.
 * Users with installedAt ON OR BEFORE this date are grandfathered.
 *
 * Set to actual TestFlight launch date when known.
 * PLACEHOLDER: Set to a future date so current users are all grandfathered.
 * Update this constant when the paywall goes live in production.
 */
export const PAYWALL_LAUNCH_DATE = new Date('2026-06-01T00:00:00.000Z');

/**
 * Returns true if the user installed on or before the paywall launch date.
 *
 * Safety rules:
 *  - Null/undefined installedAt → grandfathered (unknown install date = legacy user)
 *  - Invalid date string → grandfathered (parse error = treat as legacy user)
 *  - Exact match on PAYWALL_LAUNCH_DATE → grandfathered (same day = grandfathered)
 *
 * @param installedAt - ISO string from AsyncStorage (written at onboarding complete, Phase 10 TF-05)
 */
export function isGrandfathered(installedAt: string | null | undefined): boolean {
  if (!installedAt) return true; // Safety: unknown install date → grandfathered
  const installDate = new Date(installedAt);
  if (isNaN(installDate.getTime())) return true; // Invalid date → grandfathered
  return installDate <= PAYWALL_LAUNCH_DATE;
}
