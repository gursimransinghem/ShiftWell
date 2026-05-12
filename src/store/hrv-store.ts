/**
 * HRV Store — persists overnight HRV readings and baseline statistics.
 *
 * Mirrors the score-store.ts pattern (create/persist/createJSONStorage/AsyncStorage).
 * History is capped at 30 readings to bound storage usage.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from '@/src/lib/persist-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HRVReading } from '../lib/healthkit/hrv-reader';
import type { HRVRecoveryModifier } from '../lib/adaptive/hrv-recovery-modifier';

// ─── State shape ──────────────────────────────────────────────────────────────

export interface HRVState {
  /** Most recent overnight HRV reading, or null if never recorded */
  latestReading: HRVReading | null;
  /** Rolling 14-night baseline statistics, or null if insufficient history */
  baseline: { meanRMSSD: number; stdRMSSD: number; readings: number } | null;
  /** HRV modifier computed from the latest reading vs. baseline */
  lastModifier: HRVRecoveryModifier | null;
  /** Last 30 overnight HRV readings, oldest first */
  history: HRVReading[];

  /** Record a new overnight HRV reading (appends to history, caps at 30) */
  recordReading: (reading: HRVReading) => void;
  /** Store an updated baseline after fetching from HealthKit */
  setBaseline: (
    baseline: { meanRMSSD: number; stdRMSSD: number; readings: number } | null,
  ) => void;
  /** Store the modifier computed from the latest reading */
  setLastModifier: (modifier: HRVRecoveryModifier | null) => void;
  /** Clear all HRV data (e.g., on sign-out) */
  reset: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useHRVStore = create<HRVState>()(
  persist(
    (set) => ({
      latestReading: null,
      baseline: null,
      lastModifier: null,
      history: [],

      recordReading: (reading) =>
        set((s) => {
          const updated = [...s.history, reading].slice(-30);
          return {
            latestReading: reading,
            history: updated,
          };
        }),

      setBaseline: (baseline) => set({ baseline }),

      setLastModifier: (modifier) => set({ lastModifier: modifier }),

      reset: () =>
        set({
          latestReading: null,
          baseline: null,
          lastModifier: null,
          history: [],
        }),
    }),
    {
      name: 'hrv-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        latestReading: s.latestReading,
        baseline: s.baseline,
        lastModifier: s.lastModifier,
        history: s.history,
      }),
    },
  ),
);
