import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDays, differenceInHours } from 'date-fns';
import type { SleepPlan } from '../lib/circadian/types';
import { generateSleepPlan } from '../lib/circadian';
import { schedulePlanNotifications } from '../lib/notifications/notification-service';
import { writeChangedBlocks } from '../lib/calendar/plan-write-service';
import { useCalendarStore } from '../lib/calendar/calendar-store';
import { useShiftsStore } from './shifts-store';
import { useUserStore } from './user-store';
import type { AdaptiveContext, AdaptiveChange } from '../lib/adaptive/types';
import type { SleepComparison } from '../lib/healthkit/sleep-comparison';
import type { FeedbackAdjustment } from '../lib/feedback/feedback-engine';
import type { AutopilotState } from '../lib/adaptive/autopilot';
import type { TransparencyEntry } from '../lib/adaptive/transparency-log';

export interface PlanState {
  plan: SleepPlan | null;
  dateRange: { start: Date; end: Date };
  isGenerating: boolean;
  error: string | null;
  lastGeneratedAt: Date | null;
  /** Set when Circadian Reset (recalculationNeeded) triggered regeneration */
  lastResetAt: Date | null;

  // ── Adaptive Brain ────────────────────────────────────────────────────────
  /** The adaptive context assembled from HealthKit this session */
  adaptiveContext: AdaptiveContext | null;
  /** Snapshot of the plan before the last adaptive regeneration (for undo) */
  planSnapshot: SleepPlan | null;
  /** Timestamp of the last adaptive regeneration (24h undo window) */
  snapshotTimestamp: Date | null;
  /** Changes produced by the last adaptive regeneration */
  pendingChanges: AdaptiveChange[];
  /** Days until the next shift transition (exposed for FloatingTabBar conditional) */
  daysUntilTransition: number;
  /** Persisted log of past plan changes, capped at 30 entries (D-07) */
  changeLog: AdaptiveChange[];
  /** Feedback engine adjustment applied during the last adaptive run (null = none) */
  feedbackAdjustment: FeedbackAdjustment | null;

  // ── Autopilot (Phase 34) ──────────────────────────────────────────────────
  /** Autopilot opt-in state and eligibility */
  autopilot: AutopilotState;
  /** Transparency log of all autonomous changes, capped at 90 entries */
  transparencyLog: TransparencyEntry[];

  // ── Discrepancy History (Phase 14) ────────────────────────────────────────
  /** Last 30 nights of planned-vs-actual sleep comparisons (feedback engine input) */
  discrepancyHistory: SleepComparison[];
  /** Replace the full discrepancy history (sliced to 30) */
  setDiscrepancyHistory: (history: SleepComparison[]) => void;
  /** Append a single comparison to the history (auto-trims to 30) */
  appendDiscrepancy: (comparison: SleepComparison) => void;

  // ── Feedback Offset (Phase 15) ────────────────────────────────────────────
  /**
   * Cumulative EMA-computed offset applied to the sleep window.
   * Persisted across sessions so the plan stays calibrated on restart.
   */
  feedbackOffset: { bedtimeMinutes: number; wakeMinutes: number };
  /** Update the feedback offset (called by useAdaptivePlan after each run) */
  setFeedbackOffset: (offset: { bedtimeMinutes: number; wakeMinutes: number }) => void;

  regeneratePlan: (opts?: { isCircadianReset?: boolean }) => Promise<void>;
  clearError: () => void;
  setDateRange: (start: Date, end: Date) => void;
  /** Called by useAdaptivePlan hook after HealthKit context is assembled */
  setAdaptiveContext: (context: AdaptiveContext, changes: AdaptiveChange[]) => void;
  /** Store the feedback engine adjustment from the current adaptive run */
  setFeedbackAdjustment: (adjustment: FeedbackAdjustment | null) => void;
  /** Restore the pre-adaptive plan snapshot. Only works within 24h. */
  undoPlan: () => void;
  /** Dismiss pending changes without undoing (user accepted the new plan) */
  dismissChanges: () => void;
  /** Toggle autopilot enabled/disabled */
  setAutopilotEnabled: (enabled: boolean) => void;
  /** Append a transparency entry (auto-caps at 90) */
  addTransparencyEntry: (entry: TransparencyEntry) => void;
}

function getDefaultDateRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: now,
    end: addDays(now, 14),
  };
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plan: null,
      dateRange: getDefaultDateRange(),
      isGenerating: false,
      error: null,
      lastGeneratedAt: null,
      lastResetAt: null,

      // Adaptive Brain initial state
      adaptiveContext: null,
      planSnapshot: null,
      snapshotTimestamp: null,
      pendingChanges: [],
      daysUntilTransition: 999,
      changeLog: [],
      feedbackAdjustment: null,

      // Autopilot initial state (Phase 34)
      autopilot: {
        eligible: false,
        enabled: false,
        activeSince: null,
        autonomousChanges: 0,
      },
      transparencyLog: [],

      // Discrepancy history initial state (Phase 14)
      discrepancyHistory: [],

      // Feedback offset initial state (Phase 15)
      feedbackOffset: { bedtimeMinutes: 0, wakeMinutes: 0 },

      clearError: () => set({ error: null }),

      setDiscrepancyHistory: (history) =>
        set({ discrepancyHistory: history.slice(-30) }),

      appendDiscrepancy: (comparison) =>
        set((state) => ({
          discrepancyHistory: [...state.discrepancyHistory, comparison].slice(-30),
        })),

      setFeedbackOffset: (offset) => set({ feedbackOffset: offset }),

      regeneratePlan: async (opts) => {
        const { dateRange, adaptiveContext, plan: existingPlan } = get();
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
            adaptiveContext ?? undefined,
          );

          const oldPlan = get().plan;
          const calStore = useCalendarStore.getState();

          // Save snapshot of previous plan before overwriting (for undo)
          const snapshotUpdate = existingPlan
            ? { planSnapshot: existingPlan, snapshotTimestamp: new Date() }
            : {};

          set({
            plan,
            isGenerating: false,
            lastGeneratedAt: new Date(),
            lastResetAt: opts?.isCircadianReset ? new Date() : get().lastResetAt,
            error: null,
            ...snapshotUpdate,
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

      setAdaptiveContext: (context, changes) => {
        const daysUntil = context.schedule.daysUntilTransition ?? 999;
        set({
          adaptiveContext: context,
          pendingChanges: changes,
          daysUntilTransition: daysUntil,
        });
        // Regenerate with the new context
        get().regeneratePlan();
      },

      undoPlan: () => {
        const { planSnapshot, snapshotTimestamp } = get();
        if (!planSnapshot || !snapshotTimestamp) return;

        // 24-hour undo window
        const hoursElapsed = differenceInHours(new Date(), snapshotTimestamp);
        if (hoursElapsed > 24) return;

        set({
          plan: planSnapshot,
          planSnapshot: null,
          snapshotTimestamp: null,
          pendingChanges: [],
          adaptiveContext: null,
        });
      },

      dismissChanges: () => {
        const { pendingChanges, changeLog } = get();
        if (pendingChanges.length === 0) {
          set({ pendingChanges: [] });
          return;
        }
        const timestamp = new Date().toISOString();
        const stamped = pendingChanges.map((c) => ({ ...c, timestamp }));
        const updated = [...changeLog, ...stamped].slice(-30);
        set({ pendingChanges: [], changeLog: updated });
      },

      setFeedbackAdjustment: (adjustment) => {
        set({ feedbackAdjustment: adjustment });
      },

      setAutopilotEnabled: (enabled) => {
        const { autopilot } = get();
        set({
          autopilot: {
            ...autopilot,
            enabled,
            activeSince: enabled ? new Date().toISOString() : autopilot.activeSince,
          },
        });
      },

      addTransparencyEntry: (entry) => {
        const { transparencyLog, autopilot } = get();
        const updated = [...transparencyLog, entry].slice(-90);
        set({
          transparencyLog: updated,
          autopilot: {
            ...autopilot,
            autonomousChanges: autopilot.autonomousChanges + 1,
          },
        });
      },

      setDateRange: (start, end) => {
        set({ dateRange: { start, end } });
        // Regenerate plan with new date range
        get().regeneratePlan();
      },
    }),
    {
      name: 'adaptive-plan-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        changeLog: s.changeLog,
        daysUntilTransition: s.daysUntilTransition,
        snapshotTimestamp: s.snapshotTimestamp,
        feedbackAdjustment: s.feedbackAdjustment,
        autopilot: s.autopilot,
        transparencyLog: s.transparencyLog,
        discrepancyHistory: s.discrepancyHistory,
      }),
    },
  ),
);

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
