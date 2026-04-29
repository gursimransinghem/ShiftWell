/**
 * Feedback Store — Phase 14
 *
 * Persists the last 30 nights of sleep discrepancy records.
 * Mirrors the pattern of score-store.ts (create/persist/createJSONStorage/AsyncStorage).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from '@/src/lib/persist-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SleepDiscrepancy } from '../lib/feedback/types';

/** Maximum number of discrepancy records to keep */
const MAX_RECORDS = 30;

export interface FeedbackStore {
  /** Stored discrepancy records, oldest first */
  records: SleepDiscrepancy[];
  /** ISO timestamp of the last update */
  lastUpdated: string | null;

  /**
   * Add a new discrepancy record.
   * Deduplicates by dateISO (latest record wins).
   * Caps history at MAX_RECORDS (30 nights).
   */
  addDiscrepancy: (record: SleepDiscrepancy) => void;

  /**
   * Get the most recent N nights of discrepancy records.
   * Returns records sorted oldest→newest.
   */
  getRecentHistory: (days: number) => SleepDiscrepancy[];

  /** Clear all stored discrepancy records */
  clearHistory: () => void;
}

export const useFeedbackStore = create<FeedbackStore>()(
  persist(
    (set, get) => ({
      records: [],
      lastUpdated: null,

      addDiscrepancy: (record) =>
        set((s) => {
          // Replace existing record for the same date, or append
          const filtered = s.records.filter((r) => r.dateISO !== record.dateISO);
          const updated = [...filtered, record];
          // Sort oldest first, then cap at MAX_RECORDS
          updated.sort((a, b) => a.dateISO.localeCompare(b.dateISO));
          return {
            records: updated.slice(-MAX_RECORDS),
            lastUpdated: new Date().toISOString(),
          };
        }),

      getRecentHistory: (days) => {
        const { records } = get();
        return records.slice(-days);
      },

      clearHistory: () =>
        set({ records: [], lastUpdated: new Date().toISOString() }),
    }),
    {
      name: 'feedback-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        records: s.records,
        lastUpdated: s.lastUpdated,
      }),
    },
  ),
);
