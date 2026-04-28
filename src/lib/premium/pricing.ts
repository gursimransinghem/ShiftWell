/**
 * Pricing source of truth.
 *
 * Every surface (paywall, App Store listing, landing page, CLAUDE.md) reads
 * from this file. Changing these values here cascades everywhere. Do not
 * duplicate these constants elsewhere — import them.
 *
 * Rationale for chosen values:
 *  - $9.99/mo is the consumer-health subscription median (RevenueCat State of
 *    Subscription Apps 2024); below $7.99 signals low value to the self-care
 *    segment, above $12.99 underperforms for middle-income audiences like
 *    nurses, EMTs, factory shift workers.
 *  - $49.99/yr anchors below the Calm/Headspace $69.99 band, giving shift
 *    workers a 58% effective discount vs monthly ($9.99 × 12 = $119.88).
 *  - No lifetime plan: lifetime pricing locks in early-stage LTV, creates
 *    indefinite support burden, and is an established anti-pattern for
 *    subscription startups (Reforge, 2023).
 *  - 30-day trial: one full shift rotation (7-14 days) plus a behavior-change
 *    window. Longer than Calm (7d) but deliberate — the value of this
 *    product only proves out after a user has survived a real schedule
 *    change with the plan in hand. Apple sends the end-of-trial reminder.
 */

export interface PricingPlan {
  key: 'monthly' | 'annual';
  label: string;
  price: string;
  period: string;
  perMonth?: string;
  badge?: string;
  /** Integer cents, for analytics and billing rails. */
  amountCents: number;
}

export const TRIAL_DAYS = 30;

export const PRICING = {
  monthly: {
    key: 'monthly',
    label: 'Monthly',
    price: '$9.99',
    period: '/mo',
    amountCents: 999,
  },
  annual: {
    key: 'annual',
    label: 'Annual',
    price: '$49.99',
    period: '/yr',
    perMonth: '$4.17/mo',
    badge: 'BEST VALUE · SAVE 58%',
    amountCents: 4999,
  },
} satisfies Record<'monthly' | 'annual', PricingPlan>;

export const PLAN_LIST: PricingPlan[] = [PRICING.monthly, PRICING.annual];

/** Default selection when the paywall opens. */
export const DEFAULT_PLAN_KEY: PricingPlan['key'] = 'annual';

/**
 * Date at which paywall enforcement turns on. Users who installed before this
 * date are grandfathered (see feature-gate.computeIsGrandfathered). Keep in
 * sync with docs/launch/LAUNCH_CHECKLIST.md.
 */
export const PAYWALL_LAUNCH_DATE = '2026-06-01T00:00:00Z';
