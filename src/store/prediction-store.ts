/**
 * Prediction Store — Phase 22
 *
 * Persists TransitionPrediction results from the 14-day SCSI scanner.
 * Refreshes at most once every 6 hours (debounced rescan).
 *
 * Pattern follows score-store.ts: create + persist + createJSONStorage + AsyncStorage.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scanUpcomingTransitions } from '@/src/lib/circadian/prediction-engine';
import type { TransitionPrediction, PredictionInput } from '@/src/lib/circadian/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PredictionState {
  predictions: TransitionPrediction[];
  lastScannedISO: string | null;
  isScanning: boolean;

  /** Returns the highest severity prediction with daysUntilTransition > 0 */
  mostCriticalTransition: () => TransitionPrediction | null;

  /**
   * Refresh predictions by running the SCSI scanner.
   * Debounced: only rescans if lastScannedISO is null or > 6 hours ago.
   */
  refreshPredictions: (input: PredictionInput) => void;

  /** Clear all predictions (used on sign-out or schedule reset) */
  clearPredictions: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RESCAN_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

const SEVERITY_ORDER: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePredictionStore = create<PredictionState>()(
  persist(
    (set, get) => ({
      predictions: [],
      lastScannedISO: null,
      isScanning: false,

      mostCriticalTransition: () => {
        const { predictions } = get();
        const upcoming = predictions.filter((p) => p.daysUntilTransition >= 0);
        if (upcoming.length === 0) return null;

        return upcoming.reduce((best, curr) => {
          const bestOrder = SEVERITY_ORDER[best.severity] ?? 0;
          const currOrder = SEVERITY_ORDER[curr.severity] ?? 0;
          if (currOrder > bestOrder) return curr;
          if (currOrder === bestOrder && curr.daysUntilTransition < best.daysUntilTransition) {
            return curr;
          }
          return best;
        }, upcoming[0]);
      },

      refreshPredictions: (input: PredictionInput) => {
        const { lastScannedISO, isScanning } = get();

        if (isScanning) return;

        // Check debounce: skip if scanned within 6h
        if (lastScannedISO !== null) {
          const lastScanTime = new Date(lastScannedISO).getTime();
          const now = Date.now();
          if (now - lastScanTime < RESCAN_INTERVAL_MS) return;
        }

        set({ isScanning: true });

        try {
          const predictions = scanUpcomingTransitions(input);
          set({
            predictions,
            lastScannedISO: new Date().toISOString(),
            isScanning: false,
          });
        } catch (err) {
          // Scan failed — keep existing predictions, reset scanning flag
          set({ isScanning: false });
          console.warn('[PredictionStore] Scan failed:', err);
        }
      },

      clearPredictions: () => {
        set({ predictions: [], lastScannedISO: null, isScanning: false });
      },
    }),
    {
      name: 'prediction-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        predictions: state.predictions,
        lastScannedISO: state.lastScannedISO,
      }),
    },
  ),
);
