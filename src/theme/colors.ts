/**
 * ShiftWell dark-mode-first color palette.
 *
 * Designed for a sleep-optimization app used in low-light environments.
 * Every surface starts dark; accents are muted and easy on the eyes.
 */

// ---------------------------------------------------------------------------
// Base palette
// ---------------------------------------------------------------------------

export const BACKGROUND = {
  /** App-level background — very dark navy */
  primary: '#0A0E1A',
  /** Cards, sheets, modals */
  surface: '#141929',
  /** Elevated surfaces (e.g. floating action buttons) */
  elevated: '#1C2137',
} as const;

export const TEXT = {
  primary: '#FFFFFF',
  secondary: '#9CA3AF',
  tertiary: '#6B7280',
  /** For text rendered on accent-colored backgrounds */
  onAccent: '#FFFFFF',
  inverse: '#0A0E1A',
} as const;

export const BORDER = {
  default: '#1F2937',
  subtle: '#171D2E',
  strong: '#374151',
} as const;

// ---------------------------------------------------------------------------
// Accent / brand
// ---------------------------------------------------------------------------

export const ACCENT = {
  primary: '#4A90D9',
  primaryMuted: '#3468A3',
} as const;

// ---------------------------------------------------------------------------
// Block colors — used on the calendar / timeline
// ---------------------------------------------------------------------------

export const BLOCK_COLORS = {
  sleep: '#7B61FF',
  nap: '#B794F6',
  shiftDay: '#4A90D9',
  shiftNight: '#FF9F43',
  shiftEvening: '#FBBF24',
  meal: '#34D399',
  caffeineCutoff: '#FF6B6B',
  lightProtocol: '#FCD34D',
  windDown: '#818CF8',
} as const;

// ---------------------------------------------------------------------------
// Semantic / feedback
// ---------------------------------------------------------------------------

export const SEMANTIC = {
  success: '#34D399',
  successMuted: '#064E3B',
  warning: '#FBBF24',
  warningMuted: '#78350F',
  error: '#FF6B6B',
  errorMuted: '#7F1D1D',
  info: '#4A90D9',
  infoMuted: '#1E3A5F',
} as const;

// ---------------------------------------------------------------------------
// Unified COLORS object
// ---------------------------------------------------------------------------

export const COLORS = {
  background: BACKGROUND,
  text: TEXT,
  border: BORDER,
  accent: ACCENT,
  block: BLOCK_COLORS,
  semantic: SEMANTIC,
} as const;

export type Colors = typeof COLORS;
