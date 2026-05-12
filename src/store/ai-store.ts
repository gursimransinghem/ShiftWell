import { create } from 'zustand';
import { persist, createJSONStorage } from '@/src/lib/persist-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WeeklyBrief, BriefFeedback } from '../lib/ai/types';

const MAX_BRIEFS = 12; // 3 months of weekly briefs

export interface AIStoreState {
  briefs: WeeklyBrief[];
  feedbacks: BriefFeedback[];
  isGenerating: boolean;
  lastError: string | null;

  setLatestBrief: (brief: WeeklyBrief) => void;
  setGenerating: (v: boolean) => void;
  setError: (msg: string | null) => void;
  getLastBriefForWeek: (weekStartISO: string) => WeeklyBrief | null;

  /** Upsert feedback by briefId */
  addFeedback: (feedback: BriefFeedback) => void;
  /** Returns feedback for a brief or null */
  getFeedbackForBrief: (briefId: string) => BriefFeedback | null;
}

export const useAIStore = create<AIStoreState>()(
  persist(
    (set, get) => ({
      briefs: [],
      feedbacks: [],
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

      addFeedback: (feedback: BriefFeedback) =>
        set((state) => {
          // Upsert: replace existing feedback for same briefId
          const filtered = state.feedbacks.filter(
            (f) => f.briefId !== feedback.briefId,
          );
          return { feedbacks: [...filtered, feedback] };
        }),

      getFeedbackForBrief: (briefId: string): BriefFeedback | null => {
        const { feedbacks } = get();
        return feedbacks.find((f) => f.briefId === briefId) ?? null;
      },
    }),
    {
      name: 'ai-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ briefs: state.briefs, feedbacks: state.feedbacks }),
    },
  ),
);
