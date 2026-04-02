/**
 * Shared onboarding constants.
 * Single source of truth for step count — import on every onboarding screen.
 */

/** Total number of onboarding screens (welcome through healthkit) */
export const ONBOARDING_TOTAL_STEPS = 8;

/** Step indices for each onboarding screen */
export const ONBOARDING_STEPS = {
  welcome: 1,
  chronotype: 2,
  household: 3,
  preferences: 4,
  amRoutine: 5,
  pmRoutine: 6,
  addresses: 7,
  healthkit: 8,
} as const;
