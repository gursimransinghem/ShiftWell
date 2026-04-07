/**
 * Zustand AI store — persists weekly brief history and generation state.
 *
 * Mirrors score-store.ts persist pattern (createJSONStorage/AsyncStorage).
 * Caps brief history at 12 entries (~3 months of Monday briefs).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WeeklyBrief } from '../lib/ai/types';

const MAX_BRIEFS = 12;

// ---------------------------------------------------------------------------
// Store types
// ---------------------------------------------------------------------------

export interface AIStore {
  /** History of generated briefs, newest first, capped at MAX_BRIEFS */
  briefs: WeeklyBrief[];
  /** True while a brief generation is in progress */
  isGenerating: boolean;
  /** Last error message from a failed generation attempt */
  lastError: string | null;

  // Actions
  setLatestBrief: (brief: WeeklyBrief) => void;
  setGenerating: (v: boolean) => void;
  setError: (msg: string | null) => void;
  /**
   * Return the brief for the given ISO week start if it was generated this week.
   * Returns null if no brief exists for that week.
   */
  getLastBriefForWeek: (weekStartISO: string) => WeeklyBrief | null;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAIStore = create<AIStore>()(
  persist(
    (set, get) => ({
      briefs: [],
      isGenerating: false,
      lastError: null,

      setLatestBrief: (brief) =>
        set((s) => {
          // Prepend newest brief; cap at MAX_BRIEFS
          const updated = [brief, ...s.briefs].slice(0, MAX_BRIEFS);
          return {
            briefs: updated,
            lastError: null,
          };
        }),

      setGenerating: (v) => set({ isGenerating: v }),

      setError: (msg) => set({ lastError: msg }),

      getLastBriefForWeek: (weekStartISO) => {
        const found = get().briefs.find((b) => b.weekStartISO === weekStartISO);
        return found ?? null;
      },
    }),
    {
      name: 'ai-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist briefs — runtime state (isGenerating, lastError) is ephemeral
      partialize: (s) => ({
        briefs: s.briefs,
      }),
    },
  ),
);
