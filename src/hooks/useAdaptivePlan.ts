/**
 * useAdaptivePlan — Adaptive Brain hook
 *
 * Fires once on mount (app open). Reads 14 nights of HealthKit sleep history,
 * assembles AdaptiveContext, and triggers plan regeneration if meaningful
 * changes are detected (> 15 min delta, handled in plan-store).
 *
 * Call this once at the root of app/(tabs)/index.tsx.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { subDays, format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSleepHistory, getSleepHistoryForRange, isAvailable } from '../lib/healthkit/healthkit-service';
import { comparePlannedVsActual } from '../lib/healthkit/sleep-comparison';
import { buildAdaptiveContext } from '../lib/adaptive/context-builder';
import { computeDelta } from '../lib/adaptive/change-logger';
import { computeFeedbackAdjustment } from '../lib/feedback/feedback-engine';
import { useFeedbackStore } from '../store/feedback-store';
import { usePlanStore } from '../store/plan-store';
import { useShiftsStore } from '../store/shifts-store';
import { useUserStore } from '../store/user-store';
import { BETA_MODE } from '../lib/premium/feature-gate';
import { checkAutopilotEligibility, shouldAutoApply } from '../lib/adaptive/autopilot';
import { logAutonomousChange } from '../lib/adaptive/transparency-log';
import type { AdaptiveContext, AdaptiveChange } from '../lib/adaptive/types';
import type { SleepPlan } from '../lib/circadian/types';
import type { UserProfile, ShiftEvent, PersonalEvent } from '../lib/circadian/types';
import type { FeedbackAdjustment } from '../lib/feedback/feedback-engine';
import type { AutopilotState } from '../lib/adaptive/autopilot';

// Key used to persist the last successful run date
const ADAPTIVE_LAST_RUN_KEY = 'adaptive-last-run';

export interface AdaptivePlanData {
  context: AdaptiveContext | null;
  changes: AdaptiveChange[];
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Extracted async logic — testable without React hooks
// ---------------------------------------------------------------------------

export interface AdaptiveBrainDeps {
  shifts: ShiftEvent[];
  personalEvents: PersonalEvent[];
  profile: UserProfile;
  currentPlan: SleepPlan | null;
  planSnapshot: SleepPlan | null;
  setAdaptiveContext: (context: AdaptiveContext, changes: AdaptiveChange[]) => void;
  /** Discrepancy history for the feedback engine (last 7 nights) */
  feedbackHistory: import('../lib/feedback/types').SleepDiscrepancy[];
  /** Stores the computed feedback adjustment (or null) in the plan-store */
  setFeedbackAdjustment: (adjustment: FeedbackAdjustment | null) => void;
  /** Persist 30-night planned-vs-actual history (Phase 14 — feeds Phase 15 engine) */
  setDiscrepancyHistory: (history: import('../lib/healthkit/sleep-comparison').SleepComparison[]) => void;
  /** Current autopilot state for auto-apply gating (Phase 34) */
  autopilotState?: AutopilotState;
  /** Append an autonomous change to the transparency log (Phase 34) */
  addTransparencyEntry?: (entry: import('../lib/adaptive/transparency-log').TransparencyEntry) => void;
  /** Phase 15: current discrepancy history from plan-store (feeds feedback engine) */
  discrepancyHistory?: import('../lib/healthkit/sleep-comparison').SleepComparison[];
  /** Phase 15: last persisted feedback offset from plan-store */
  feedbackOffset?: { bedtimeMinutes: number; wakeMinutes: number };
  /** Phase 15: persist the feedback offset after the engine runs */
  setFeedbackOffset?: (offset: { bedtimeMinutes: number; wakeMinutes: number }) => void;
}

/**
 * Core adaptive brain logic, extracted for direct unit testing.
 * Contains the daily debounce gate via AsyncStorage.
 */
export async function runAdaptiveBrain(deps: AdaptiveBrainDeps): Promise<void> {
  const {
    shifts,
    personalEvents,
    profile,
    currentPlan,
    planSnapshot,
    setAdaptiveContext,
    feedbackHistory,
    setFeedbackAdjustment,
    setDiscrepancyHistory,
    autopilotState,
    addTransparencyEntry,
    discrepancyHistory,
    feedbackOffset,
    setFeedbackOffset,
  } = deps;

  // ── Daily debounce gate ──────────────────────────────────────────────────
  const today = new Date();
  const todayISO = format(today, 'yyyy-MM-dd');
  const lastRun = await AsyncStorage.getItem(ADAPTIVE_LAST_RUN_KEY);
  if (lastRun === todayISO) return;
  // ────────────────────────────────────────────────────────────────────────

  try {
    // Fetch 14-night HealthKit history (gracefully returns [] if unavailable)
    let history: Awaited<ReturnType<typeof getSleepHistory>> = [];
    const healthkitAvailable = await isAvailable();
    if (healthkitAvailable) {
      history = await getSleepHistory(subDays(today, 14), today);
    }

    // Assemble the 4-factor adaptive context (Phase 15: includes feedback engine)
    const context = buildAdaptiveContext({
      shifts,
      personalEvents,
      profile,
      history,
      today,
      discrepancyHistory: discrepancyHistory ?? [],
      previousOffset: feedbackOffset,
      // hrvContext: undefined — HRV baseline not yet wired from store (Phase 15)
      // When Phase 15 HRV store fields are added, pass them here.
    });

    // ── Feedback Engine (Phase 15) ───────────────────────────────────────────
    // Only apply feedback during maintenance mode (no active circadian transition).
    // Disabled during transitions so feedback doesn't fight the protocol.
    let feedbackAdj: FeedbackAdjustment | null = null;
    if (context.circadian?.maintenanceMode) {
      feedbackAdj = computeFeedbackAdjustment(feedbackHistory);
    }
    setFeedbackAdjustment(feedbackAdj);
    // ────────────────────────────────────────────────────────────────────────

    // Compute what will change vs current plan (for the InsightCard)
    // The actual plan regeneration happens inside setAdaptiveContext
    // Use planSnapshot as the "old" plan to show real before/after differences (BUG-05 fix)
    const changes = currentPlan
      ? computeDelta(planSnapshot ?? currentPlan, currentPlan, context)
      : [];

    // If feedback adjustment applied, add an AdaptiveChange entry for the InsightCard
    if (feedbackAdj) {
      const feedbackChanges: AdaptiveChange[] = [];
      if (feedbackAdj.bedtimeShiftMinutes !== 0) {
        feedbackChanges.push({
          type: 'bedtime-shifted',
          factor: 'feedback',
          magnitudeMinutes: Math.abs(feedbackAdj.bedtimeShiftMinutes),
          humanReadable: feedbackAdj.reason,
          reason: feedbackAdj.reason,
        });
      }
      if (feedbackAdj.wakeShiftMinutes !== 0 && feedbackAdj.wakeShiftMinutes !== feedbackAdj.bedtimeShiftMinutes) {
        const wakeDir = feedbackAdj.wakeShiftMinutes > 0 ? 'later' : 'earlier';
        const wakeMins = Math.abs(feedbackAdj.wakeShiftMinutes);
        feedbackChanges.push({
          type: 'wake-shifted',
          factor: 'feedback',
          magnitudeMinutes: wakeMins,
          humanReadable: `Wake time adjusted ${wakeMins} min ${wakeDir} based on your sleep patterns`,
          reason: feedbackAdj.reason,
        });
      }
      changes.push(...feedbackChanges);
    }

    // ── Autopilot (Phase 34) ──────────────────────────────────────────────────
    // Update eligibility based on current daysTracked, then check whether each
    // change can be auto-applied. Changes that qualify are logged and silently
    // applied (no InsightCard). The rest surface as pendingChanges as usual.
    //
    // Confidence proxy: use feedback engine confidence (0.5 if no adj, adj
    // confidence when available). This avoids coupling autopilot to feedback.
    const confidence = feedbackAdj?.confidence ?? 0.5;

    if (autopilotState && addTransparencyEntry) {
      const eligibleState = {
        ...autopilotState,
        eligible: checkAutopilotEligibility(context.meta.daysTracked),
      };

      const autoApplied: AdaptiveChange[] = [];
      const manualReview: AdaptiveChange[] = [];

      for (const change of changes) {
        if (shouldAutoApply(change, eligibleState, confidence)) {
          const entry = logAutonomousChange(
            change,
            `Autopilot: ${change.humanReadable} (confidence ${Math.round(confidence * 100)}%)`,
          );
          addTransparencyEntry(entry);
          autoApplied.push(change);
        } else {
          manualReview.push(change);
        }
      }

      // Only surface non-auto-applied changes to the InsightCard
      setAdaptiveContext(context, manualReview);
    } else {
      setAdaptiveContext(context, changes);
    }
    // ─────────────────────────────────────────────────────────────────────────

    // ── Phase 15: Persist feedback offset ────────────────────────────────────
    // If the feedback engine produced an active result, persist the new offset.
    // Frozen when feedbackActive=false (protocol, insufficient data, data gap).
    if (context.feedbackResult?.feedbackActive && setFeedbackOffset) {
      setFeedbackOffset({
        bedtimeMinutes: context.feedbackResult.adjustedBedtimeOffsetMinutes,
        wakeMinutes: context.feedbackResult.adjustedWakeOffsetMinutes,
      });
    }
    // ─────────────────────────────────────────────────────────────────────────

    // ── Discrepancy history for feedback engine (HK-01, HK-02, HK-03) ─────────
    // Fetch 30-night history to populate the plan-store discrepancyHistory.
    // This is read by the Phase 15 feedback engine to compute EMA adjustments.
    // Uses asleepStart (not inBedStart) per Phase 13 research spec.
    const thirtyNightHistory = await getSleepHistoryForRange(30);
    const planForComparison = currentPlan;

    if (planForComparison && thirtyNightHistory.length > 0) {
      const comparisons = thirtyNightHistory.map(record => {
        // Find the planned main-sleep block whose date matches the record's night
        const nightDate = record.asleepStart ?? record.date;
        const nightDateISO = format(nightDate, 'yyyy-MM-dd');

        const mainSleepBlock = planForComparison.blocks.find(b =>
          b.type === 'main-sleep' &&
          format(new Date(b.start), 'yyyy-MM-dd') === nightDateISO
        );

        if (!mainSleepBlock) {
          // No planned window for this date — use sentinel comparison with null actual
          return comparePlannedVsActual(
            { start: nightDate, end: nightDate },
            null,
          );
        }

        return comparePlannedVsActual(
          { start: new Date(mainSleepBlock.start), end: new Date(mainSleepBlock.end) },
          record,
        );
      });

      setDiscrepancyHistory(comparisons);
    } else {
      // HK unavailable or no data — set empty so feedback engine pauses
      setDiscrepancyHistory([]);
    }
    // ─────────────────────────────────────────────────────────────────────────

    // ── Persist run date AFTER success so failures retry next foreground ──
    await AsyncStorage.setItem(ADAPTIVE_LAST_RUN_KEY, todayISO);
  } catch (err) {
    // Adaptive brain is enhancement only — never crash the app
    console.warn('[runAdaptiveBrain] Failed to assemble context:', err);
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAdaptivePlan(): AdaptivePlanData {
  const [isLoading, setIsLoading] = useState(false);

  const {
    setAdaptiveContext,
    setFeedbackAdjustment,
    setDiscrepancyHistory,
    setFeedbackOffset,
    plan: currentPlan,
    pendingChanges,
    planSnapshot,
    autopilot: autopilotState,
    addTransparencyEntry,
    discrepancyHistory,
    feedbackOffset,
  } = usePlanStore();
  const { shifts, personalEvents } = useShiftsStore();
  const { profile } = useUserStore();
  const adaptiveContext = usePlanStore((s) => s.adaptiveContext);
  const feedbackRecords = useFeedbackStore((s) => s.records);
  const feedbackHistory = useMemo(
    () => feedbackRecords.slice(-7),
    [feedbackRecords],
  );
  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Feature gate: adaptive-brain is premium-only. BETA_MODE=true → always runs.
      // When BETA_MODE is disabled, this becomes a real isPremium check via useFeatureGate.
      if (!BETA_MODE) return;

      setIsLoading(true);
      try {
        await runAdaptiveBrain({
          shifts,
          personalEvents,
          profile,
          currentPlan,
          planSnapshot,
          setAdaptiveContext,
          feedbackHistory,
          setFeedbackAdjustment,
          setDiscrepancyHistory,
          autopilotState,
          addTransparencyEntry,
          discrepancyHistory,
          feedbackOffset,
          setFeedbackOffset,
        });
      } catch (err) {
        // Adaptive brain is enhancement only — never crash the app
        console.warn('[useAdaptivePlan] Failed to assemble context:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();

    // Re-run on background → active transition (debounce gate prevents duplicates)
    const lastState = { current: AppState.currentState };
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (lastState.current !== 'active' && next === 'active' && !cancelled) {
        run();
      }
      lastState.current = next;
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run on mount + foreground transitions (BRAIN-01)

  return {
    context: adaptiveContext,
    changes: pendingChanges,
    isLoading,
  };
}
