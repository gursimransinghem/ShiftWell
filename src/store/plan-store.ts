import { create } from 'zustand';
import { addDays } from 'date-fns';
import type { SleepPlan } from '../lib/circadian/types';
import { generateSleepPlan } from '../lib/circadian';
import { schedulePlanNotifications } from '../lib/notifications/notification-service';
import { writeChangedBlocks } from '../lib/calendar/plan-write-service';
import { useCalendarStore } from '../lib/calendar/calendar-store';
import { useShiftsStore } from './shifts-store';
import { useUserStore } from './user-store';

export interface PlanState {
  plan: SleepPlan | null;
  dateRange: { start: Date; end: Date };
  isGenerating: boolean;
  error: string | null;
  lastGeneratedAt: Date | null;
  /** Set when Circadian Reset (recalculationNeeded) triggered regeneration */
  lastResetAt: Date | null;
  regeneratePlan: (opts?: { isCircadianReset?: boolean }) => Promise<void>;
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
  lastResetAt: null,

  clearError: () => set({ error: null }),

  regeneratePlan: async (opts) => {
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

      const oldPlan = get().plan;
      const calStore = useCalendarStore.getState();

      set({
        plan,
        isGenerating: false,
        lastGeneratedAt: new Date(),
        lastResetAt: opts?.isCircadianReset ? new Date() : get().lastResetAt,
        error: null,
      });

      // Write calendar changes (non-blocking — errors logged, don't fail the plan)
      writeChangedBlocks(oldPlan, plan, calStore).catch((e) => {
        console.warn('[PlanStore] Calendar write-back failed:', e);
      });

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

// ── Debounce helper ────────────────────────────────────────────────────────────

let regenerateTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedRegenerate(opts?: { isCircadianReset?: boolean }, ms = 500): void {
  if (regenerateTimer) clearTimeout(regenerateTimer);
  regenerateTimer = setTimeout(() => {
    usePlanStore.getState().regeneratePlan(opts);
    regenerateTimer = null;
  }, ms);
}

// ── Subscriptions ──────────────────────────────────────────────────────────────

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

/**
 * Subscribe to recalculationNeeded — Phase 3 Circadian Reset (D-16).
 * When shifts are removed via calendar sync, this flag is set.
 * We clear it BEFORE regenerating to prevent loops (Pitfall 2 avoided).
 */
useShiftsStore.subscribe((state, prevState) => {
  if (
    state.recalculationNeeded !== prevState.recalculationNeeded &&
    state.recalculationNeeded.length > 0
  ) {
    // Clear the flag BEFORE regenerating to prevent subscription loop
    useShiftsStore.setState({ recalculationNeeded: [] });
    debouncedRegenerate({ isCircadianReset: true });
  }
});
