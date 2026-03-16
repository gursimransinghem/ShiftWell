import { create } from 'zustand';
import { addDays } from 'date-fns';
import type { SleepPlan } from '../lib/circadian/types';
import { generateSleepPlan } from '../lib/circadian';
import { schedulePlanNotifications } from '../lib/notifications/notification-service';
import { useShiftsStore } from './shifts-store';
import { useUserStore } from './user-store';

export interface PlanState {
  plan: SleepPlan | null;
  dateRange: { start: Date; end: Date };
  isGenerating: boolean;
  error: string | null;
  lastGeneratedAt: Date | null;
  regeneratePlan: () => void;
  clearError: () => void;
  setDateRange: (start: Date, end: Date) => void;
}

function getDefaultDateRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: now,
    end: addDays(now, 14),
  };
}

export const usePlanStore = create<PlanState>()((set, get) => ({
  plan: null,
  dateRange: getDefaultDateRange(),
  isGenerating: false,
  error: null,
  lastGeneratedAt: null,

  clearError: () => set({ error: null }),

  regeneratePlan: () => {
    const { dateRange } = get();
    const { shifts, personalEvents } = useShiftsStore.getState();
    const { profile } = useUserStore.getState();

    set({ isGenerating: true, error: null });

    try {
      const plan = generateSleepPlan(
        dateRange.start,
        dateRange.end,
        shifts,
        personalEvents,
        profile,
      );
      set({ plan, isGenerating: false, lastGeneratedAt: new Date(), error: null });

      // Schedule push notifications for the next 24h of plan blocks
      schedulePlanNotifications(plan.blocks).catch(() => {
        // Notifications may not be permitted yet — fail silently
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to generate sleep plan';
      set({ isGenerating: false, error: message });
    }
  },

  setDateRange: (start, end) => {
    set({ dateRange: { start, end } });
    // Regenerate plan with new date range
    get().regeneratePlan();
  },
}));

/**
 * Subscribe to shifts and user profile changes.
 * When either store updates, automatically regenerate the plan.
 *
 * Zustand v5 subscribe takes (state, prevState) — we compare references
 * to avoid unnecessary regenerations.
 */
useShiftsStore.subscribe((state, prevState) => {
  if (
    state.shifts !== prevState.shifts ||
    state.personalEvents !== prevState.personalEvents
  ) {
    usePlanStore.getState().regeneratePlan();
  }
});

useUserStore.subscribe((state, prevState) => {
  if (state.profile !== prevState.profile) {
    usePlanStore.getState().regeneratePlan();
  }
});
