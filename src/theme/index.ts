/**
 * ShiftWell design tokens — single entry-point.
 *
 * Usage:
 *   import { COLORS, BLOCK_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/src/theme';
 */

export {
  COLORS,
  BACKGROUND,
  TEXT,
  BORDER,
  ACCENT,
  BLOCK_COLORS,
  SEMANTIC,
} from './colors';
export type { Colors } from './colors';

/** Path B purple accent — use for interactive elements, active states, progress rings */
export const PURPLE = '#7B61FF';
/** Purple ambient glow — shadow/overlay tint */
export const PURPLE_GLOW = 'rgba(123,97,255,0.35)';
/** Path B gradient: purple → gold */
export const ACCENT_GRADIENT = ['#7B61FF', '#C8A84B'] as const;

export {
  TYPOGRAPHY,
  FONT_SIZE,
  FONT_WEIGHT,
  heading1,
  heading2,
  heading3,
  body,
  bodySmall,
  caption,
  label,
  heroNumber,
  screenHeading,
  countdownValue,
  cardTitle,
  meta,
  sectionLabel,
  timestamp,
  captionSmall,
} from './typography';

export {
  LAYOUT,
  SPACING,
  RADIUS,
  MIN_TOUCH_TARGET,
  V6_LAYOUT,
  V6_RADIUS,
} from './spacing';
