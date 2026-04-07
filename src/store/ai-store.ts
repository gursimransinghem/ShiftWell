import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WeeklyBrief } from '../lib/ai/types';

const MAX_BRIEFS = 12; // 3 months of weekly briefs

export interface AIStoreState {
  briefs: WeeklyBrief[];
  isGenerating: boolean;
  lastError: string | null;

  setLatestBrief: (brief: WeeklyBrief) => void;
  setGenerating: (v: boolean) => void;
  setError: (msg: string | null) => void;
  getLastBriefForWeek: (weekStartISO: string) => WeeklyBrief | null;
}

export const useAIStore = create<AIStoreState>()(
  persist(
    (set, get) => ({
      briefs: [],
      isGenerating: false,
      lastError: null,

      setLatestBrief: (brief: WeeklyBrief) =>
        set((state) => {
          // Replace existing brief for this week if present, otherwise prepend
          const filtered = state.briefs.filter(
            (b) => b.weekStartISO !== brief.weekStartISO,
          );
          const updated = [brief, ...filtered];
          // Trim to max entries (most recent first)
          return { briefs: updated.slice(0, MAX_BRIEFS) };
        }),

      setGenerating: (v: boolean) => set({ isGenerating: v }),

      setError: (msg: string | null) => set({ lastError: msg }),

      getLastBriefForWeek: (weekStartISO: string): WeeklyBrief | null => {
        const { briefs } = get();
        return briefs.find((b) => b.weekStartISO === weekStartISO) ?? null;
      },
    }),
    {
      name: 'ai-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ briefs: state.briefs }),
    },
  ),
);
