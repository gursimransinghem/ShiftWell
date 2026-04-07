/**
 * ShiftWell Paywall Pricing Experiment
 *
 * Serves two annual price points based on deterministic A/B bucketing.
 * control:    $29.99/yr  ($2.50/mo equivalent)
 * experiment: $24.99/yr  ($2.08/mo equivalent)
 *
 * The RevenueCat purchase call uses the actual package from offerings.
 * This module only affects display pricing for experiment tracking.
 *
 * GRO-04: Paywall pricing experiment.
 */

import { getVariant } from './ab-testing';

export interface PaywallVariant {
  /** Display price string, e.g. '$24.99' */
  annualPrice: string;
  /** Numeric price for RevenueCat / analytics */
  annualPriceNumeric: number;
  /** Per-month equivalent display string */
  monthlyEquivalent: string;
  /** Which experiment arm this user is in */
  variantId: 'control' | 'experiment';
}

const PAYWALL_EXPERIMENT_ID = 'paywall-pricing-v1';

const VARIANTS: Record<'A' | 'B', PaywallVariant> = {
  A: {
    annualPrice: '$29.99',
    annualPriceNumeric: 29.99,
    monthlyEquivalent: '$2.50/mo',
    variantId: 'control',
  },
  B: {
    annualPrice: '$24.99',
    annualPriceNumeric: 24.99,
    monthlyEquivalent: '$2.08/mo',
    variantId: 'experiment',
  },
};

/**
 * Return the paywall pricing variant for the given user.
 * Deterministic — same userId always returns the same variant.
 *
 * @param userId - User identifier for bucketing
 * @returns PaywallVariant with display pricing and variant ID
 */
export function getPaywallVariant(userId: string): PaywallVariant {
  const variant = getVariant(PAYWALL_EXPERIMENT_ID, userId, 2);
  return VARIANTS[variant] ?? VARIANTS.A;
}
