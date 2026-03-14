/**
 * Expo Router theme colors.
 *
 * Maps ShiftWell's dark-mode-first palette into the shape that
 * Themed.tsx and Expo Router expect. The "light" variant uses the same
 * dark palette because ShiftWell is designed to always feel dark.
 */
import { BACKGROUND, TEXT, ACCENT } from '../src/theme/colors';

const tintColorDark = ACCENT.primary;

export default {
  light: {
    text: TEXT.primary,
    background: BACKGROUND.primary,
    tint: tintColorDark,
    tabIconDefault: TEXT.tertiary,
    tabIconSelected: tintColorDark,
  },
  dark: {
    text: TEXT.primary,
    background: BACKGROUND.primary,
    tint: tintColorDark,
    tabIconDefault: TEXT.tertiary,
    tabIconSelected: tintColorDark,
  },
};
