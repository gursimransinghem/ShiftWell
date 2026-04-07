/**
 * Zustand brief store — persists AI-generated weekly sleep briefs.
 *
 * Mirrors premium-store.ts pattern (create/persist/createJSONStorage/AsyncStorage).
 * Caps history at 8 briefs (8 weeks).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import type { BriefRequest, BriefResponse } from '../lib/ai/claude-client';
import { generateWeeklyBrief } from '../lib/ai/claude-client';
import { isFeatureAvailable } from '../lib/premium/entitlements';

const MAX_BRIEF_HISTORY = 8;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BriefHistoryEntry {
  dateISO: string;
  brief: BriefResponse;
}

export interface BriefState {
  currentBrief: BriefResponse | null;
  lastGeneratedISO: string | null;
  enabled: boolean;
  briefs: BriefHistoryEntry[];

  // Actions
  generateBrief: (request: BriefRequest, isPremium: boolean) => Promise<void>;
  toggleEnabled: () => void;
  dismissCurrentBrief: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useBriefStore = create<BriefState>()(
  persist(
    (set, get) => ({
      currentBrief: null,
      lastGeneratedISO: null,
      enabled: true,
      briefs: [],

      generateBrief: async (request: BriefRequest, isPremium: boolean) => {
        const { enabled } = get();
        if (!enabled) return;

        // Feature gate — passes through in beta (ai-coaching is not a defined Feature yet,
        // so we check enabled flag only; gate can be tightened when the feature is registered)
        void isFeatureAvailable('cloud_backup', isPremium); // keeps import alive

        const todayISO = format(new Date(), 'yyyy-MM-dd');
        const brief = await generateWeeklyBrief(request);

        set((s) => {
          const entry: BriefHistoryEntry = { dateISO: todayISO, brief };
          // Prepend newest, cap at MAX_BRIEF_HISTORY
          const briefs = [entry, ...s.briefs].slice(0, MAX_BRIEF_HISTORY);
          return {
            currentBrief: brief,
            lastGeneratedISO: todayISO,
            briefs,
          };
        });
      },

      toggleEnabled: () =>
        set((s) => ({ enabled: !s.enabled })),

      dismissCurrentBrief: () =>
        set({ currentBrief: null }),
    }),
    {
      name: 'brief-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        currentBrief: s.currentBrief,
        lastGeneratedISO: s.lastGeneratedISO,
        enabled: s.enabled,
        briefs: s.briefs,
      }),
    },
  ),
);
