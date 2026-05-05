/**
 * Shared onboarding constants.
 * Single source of truth for step count — import on every onboarding screen.
 */

/** Total number of onboarding screens (v2 flow) */
export const ONBOARDING_TOTAL_STEPS = 6;

/** Step indices for each onboarding screen */
export const ONBOARDING_STEPS = {
  welcome: 1,
  chronotype: 2,
  sleepAndNaps: 3,
  household: 4,
  shifts: 5,
  planReady: 6,
} as const;
