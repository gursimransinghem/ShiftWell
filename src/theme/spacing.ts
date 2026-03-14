/**
 * NightShift spacing & layout tokens.
 *
 * Based on a 4-pt grid. Every value is a multiple of 4 so elements
 * align consistently across the app.
 */

// ---------------------------------------------------------------------------
// Spacing scale
// ---------------------------------------------------------------------------

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;

// ---------------------------------------------------------------------------
// Border radius
// ---------------------------------------------------------------------------

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

// ---------------------------------------------------------------------------
// Touch targets
// ---------------------------------------------------------------------------

/** Minimum tappable area per Apple & Material guidelines */
export const MIN_TOUCH_TARGET = 44;

// ---------------------------------------------------------------------------
// Convenience collection
// ---------------------------------------------------------------------------

export const LAYOUT = {
  spacing: SPACING,
  radius: RADIUS,
  minTouchTarget: MIN_TOUCH_TARGET,
} as const;
