/**
 * Pattern Store — Phase 23
 *
 * Zustand persist store for detected behavioral/sleep patterns.
 * Patterns are detected from discrepancy history, shift history, and debt data.
 *
 * Persists to AsyncStorage as 'pattern-store'.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { detectPatterns, type DetectedPattern } from '../lib/patterns/pattern-detector';
import type { SleepDiscrepancy } from '../lib/feedback/types';
import type { ShiftEvent } from '../lib/circadian/types';

// ---------------------------------------------------------------------------
// State type
// ---------------------------------------------------------------------------

export interface PatternState {
  /** All currently detected patterns */
  patterns: DetectedPattern[];
  /** Dismissal keys: `{type}:{detectedAt-date}` */
  dismissedPatterns: string[];

  /**
   * Run pattern detection and update the store.
   *
   * @param discrepancyHistory  Feedback pipeline discrepancy records
   * @param shiftHistory        All historical shifts
   * @param debtHistory         Daily debt records
   */
  detectAndUpdate: (
    discrepancyHistory: SleepDiscrepancy[],
    shiftHistory: ShiftEvent[],
    debtHistory: { dateISO: string; hours: number }[],
  ) => void;

  /**
   * Dismiss a pattern by its dismissal key.
   * Key format: `{type}:{detectedAt.slice(0,10)}`
   */
  dismissPattern: (key: string) => void;

  /** Clear all dismissed patterns (e.g., at start of new month). */
  clearDismissed: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePatternStore = create<PatternState>()(
  persist(
    (set) => ({
      patterns: [],
      dismissedPatterns: [],

      detectAndUpdate: (discrepancyHistory, shiftHistory, debtHistory) => {
        const detected = detectPatterns(discrepancyHistory, shiftHistory, debtHistory);
        set({ patterns: detected });
      },

      dismissPattern: (key) => {
        set((state) => ({
          dismissedPatterns: state.dismissedPatterns.includes(key)
            ? state.dismissedPatterns
            : [...state.dismissedPatterns, key],
        }));
      },

      clearDismissed: () => set({ dismissedPatterns: [] }),
    }),
    {
      name: 'pattern-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        dismissedPatterns: s.dismissedPatterns,
      }),
    },
  ),
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Compute the dismissal key for a pattern.
 * Components use this to check dismissal and to call dismissPattern().
 */
export function patternDismissalKey(pattern: DetectedPattern): string {
  return `${pattern.type}:${pattern.detectedAt.slice(0, 10)}`;
}
