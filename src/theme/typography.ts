/**
 * ShiftWell typography scale.
 *
 * Uses system fonts (San Francisco on iOS, Roboto on Android) so there is
 * nothing to preload. Import the pre-built text styles or compose your own
 * from the primitives.
 */
import { Platform, TextStyle } from 'react-native';

// ---------------------------------------------------------------------------
// Font family
// ---------------------------------------------------------------------------

const SYSTEM_FONT = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

// ---------------------------------------------------------------------------
// Size scale
// ---------------------------------------------------------------------------

export const FONT_SIZE = {
  '2xs': 8,
  '3xs': 9,
  xxs: 10,
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

// ---------------------------------------------------------------------------
// Weight scale
// ---------------------------------------------------------------------------

export const FONT_WEIGHT = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// ---------------------------------------------------------------------------
// Line-height helpers (roughly 1.4x font size, rounded to whole pixels)
// ---------------------------------------------------------------------------

const lh = (size: number): number => Math.round(size * 1.4);

// ---------------------------------------------------------------------------
// Pre-built text styles
// ---------------------------------------------------------------------------

export const heading1: TextStyle = {
  fontFamily: SYSTEM_FONT,
  fontSize: FONT_SIZE['4xl'],
  fontWeight: FONT_WEIGHT.bold,
  lineHeight: lh(FONT_SIZE['4xl']),
};

export const heading2: TextStyle = {
  fontFamily: SYSTEM_FONT,
  fontSize: FONT_SIZE['3xl'],
  fontWeight: FONT_WEIGHT.bold,
  lineHeight: lh(FONT_SIZE['3xl']),
};

export const heading3: TextStyle = {
  fontFamily: SYSTEM_FONT,
  fontSize: FONT_SIZE['2xl'],
  fontWeight: FONT_WEIGHT.semibold,
  lineHeight: lh(FONT_SIZE['2xl']),
};

export const body: TextStyle = {
  fontFamily: SYSTEM_FONT,
  fontSize: FONT_SIZE.base,
  fontWeight: FONT_WEIGHT.regular,
  lineHeight: lh(FONT_SIZE.base),
};

export const bodySmall: TextStyle = {
  fontFamily: SYSTEM_FONT,
  fontSize: FONT_SIZE.sm,
  fontWeight: FONT_WEIGHT.regular,
  lineHeight: lh(FONT_SIZE.sm),
};

export const caption: TextStyle = {
  fontFamily: SYSTEM_FONT,
  fontSize: FONT_SIZE.xs,
  fontWeight: FONT_WEIGHT.regular,
  lineHeight: lh(FONT_SIZE.xs),
};

export const label: TextStyle = {
  fontFamily: SYSTEM_FONT,
  fontSize: FONT_SIZE.sm,
  fontWeight: FONT_WEIGHT.medium,
  lineHeight: lh(FONT_SIZE.sm),
  letterSpacing: 0.3,
};

// ---------------------------------------------------------------------------
// V6 text styles
// ---------------------------------------------------------------------------

export const heroNumber: TextStyle = {
  fontSize: 36,
  fontWeight: '700',
};

export const screenHeading: TextStyle = {
  fontSize: 28,
  fontWeight: '700',
  letterSpacing: -0.5,
};

export const countdownValue: TextStyle = {
  fontSize: 22,
  fontWeight: '700',
  letterSpacing: -0.5,
};

export const cardTitle: TextStyle = {
  fontSize: 14,
  fontWeight: '600',
};

export const meta: TextStyle = {
  fontSize: 11,
  fontWeight: '500',
};

export const sectionLabel: TextStyle = {
  fontSize: 10,
  fontWeight: '600',
  letterSpacing: 1,
  textTransform: 'uppercase' as const,
};

export const timestamp: TextStyle = {
  fontSize: 9,
  fontWeight: '500',
  letterSpacing: -0.3,
};

export const captionSmall: TextStyle = {
  fontSize: 8,
  fontWeight: '500',
};

// ---------------------------------------------------------------------------
// Convenience collection
// ---------------------------------------------------------------------------

export const TYPOGRAPHY = {
  fontSize: FONT_SIZE,
  fontWeight: FONT_WEIGHT,
  heading1,
  heading2,
  heading3,
  body,
  bodySmall,
  caption,
  label,
} as const;
