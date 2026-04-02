/**
 * Zustand score store — persists daily adherence events and computes nightly scores.
 *
 * Mirrors notification-store.ts pattern (create/persist/createJSONStorage/AsyncStorage).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, subDays } from 'date-fns';
import {
  computeAdherenceScore,
  AdherenceEvent,
} from '@/src/lib/adherence/adherence-calculator';

export type { AdherenceEvent };
export type { AdherenceEventType } from '@/src/lib/adherence/adherence-calculator';

export interface DailyScore {
  /** 'YYYY-MM-DD' */
  dateISO: string;
  /** null = no sleep block planned (no-shift day); 0-100 = scored night */
  score: number | null;
}

export interface ScoreStore {
  pendingEvents: AdherenceEvent[];
  dailyHistory: DailyScore[];
  lastFinalizedDateISO: string | null;

  /** Append an adherence event; deduplicates by type+dateISO */
  recordEvent: (event: AdherenceEvent) => void;

  /**
   * Compute and persist the score for the given date.
   * Second call for the same date is a no-op (idempotent guard).
   */
  finalizeDay: (dateISO: string, hasSleepBlock: boolean) => void;

  /** Last 7 days as {day, score} ordered oldest→newest */
  weeklyScores: () => { day: string; score: number | null }[];

  /** Today's score from dailyHistory, or null if not yet finalized */
  todayScore: () => number | null;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const useScoreStore = create<ScoreStore>()(
  persist(
    (set, get) => ({
      pendingEvents: [],
      dailyHistory: [],
      lastFinalizedDateISO: null,

      recordEvent: (event) =>
        set((s) => {
          const already = s.pendingEvents.some(
            (e) => e.type === event.type && e.dateISO === event.dateISO,
          );
          if (already) return s;
          return { pendingEvents: [...s.pendingEvents, event] };
        }),

      finalizeDay: (dateISO, hasSleepBlock) => {
        const s = get();
        if (s.lastFinalizedDateISO === dateISO) return; // idempotent guard
        const score = computeAdherenceScore(s.pendingEvents, hasSleepBlock, dateISO);
        const entry: DailyScore = { dateISO, score };
        const updated = [...s.dailyHistory, entry].slice(-30);
        set({ dailyHistory: updated, lastFinalizedDateISO: dateISO });
      },

      weeklyScores: () => {
        const history = get().dailyHistory;
        const today = new Date();
        return Array.from({ length: 7 }, (_, i) => {
          const d = subDays(today, 6 - i);
          const iso = format(d, 'yyyy-MM-dd');
          const found = history.find((h) => h.dateISO === iso);
          return {
            day: DAY_LABELS[d.getDay()],
            score: found?.score ?? null,
          };
        });
      },

      todayScore: () => {
        const iso = format(new Date(), 'yyyy-MM-dd');
        const found = get().dailyHistory.find((h) => h.dateISO === iso);
        return found?.score ?? null;
      },
    }),
    {
      name: 'score-history',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        dailyHistory: s.dailyHistory,
        pendingEvents: s.pendingEvents,
        lastFinalizedDateISO: s.lastFinalizedDateISO,
      }),
    },
  ),
);
