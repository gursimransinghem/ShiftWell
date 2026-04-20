/**
 * ShiftWell Paywall Pricing Experiment
 *
 * Serves two annual price points based on deterministic A/B bucketing.
 * control:    $49.99/yr  ($4.17/mo equivalent) — matches src/lib/premium/pricing.ts
 * experiment: $39.99/yr  ($3.33/mo equivalent) — 20% price-elasticity test
 *
 * The RevenueCat purchase call uses the actual package from offerings.
 * This module only affects display pricing for experiment tracking.
 *
 * GRO-04: Paywall pricing experiment.
 */

import { getVariant } from './ab-testing';

export interface PaywallVariant {
  /** Display price string, e.g. '$39.99' */
  annualPrice: string;
  /** Numeric price for RevenueCat / analytics */
  annualPriceNumeric: number;
  /** Per-month equivalent display string */
  monthlyEquivalent: string;
  /** Which experiment arm this user is in */
  variantId: 'control' | 'experiment';
}

const PAYWALL_EXPERIMENT_ID = 'paywall-pricing-v1';

const VARIANTS = {
  A: {
    annualPrice: '$49.99',
    annualPriceNumeric: 49.99,
    monthlyEquivalent: '$4.17/mo',
    variantId: 'control',
  },
  B: {
    annualPrice: '$39.99',
    annualPriceNumeric: 39.99,
    monthlyEquivalent: '$3.33/mo',
    variantId: 'experiment',
  },
} as const satisfies Record<'A' | 'B', PaywallVariant>;

/**
 * Return the paywall pricing variant for the given user.
 * Deterministic — same userId always returns the same variant.
 *
 * @param userId - User identifier for bucketing
 * @returns PaywallVariant with display pricing and variant ID
 */
export function getPaywallVariant(userId: string): PaywallVariant {
  const variant = getVariant(PAYWALL_EXPERIMENT_ID, userId, 2) as 'A' | 'B';
  return VARIANTS[variant] ?? VARIANTS.A;
}
