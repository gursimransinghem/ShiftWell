/**
 * useAdaptivePlan — Adaptive Brain hook
 *
 * Fires once on mount (app open). Reads 14 nights of HealthKit sleep history,
 * assembles AdaptiveContext, and triggers plan regeneration if meaningful
 * changes are detected (> 15 min delta, handled in plan-store).
 *
 * Call this once at the root of app/(tabs)/index.tsx.
 */

import { useEffect, useState } from 'react';
import { subDays, format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSleepHistory, isAvailable } from '../lib/healthkit/healthkit-service';
import { buildAdaptiveContext } from '../lib/adaptive/context-builder';
import { computeDelta } from '../lib/adaptive/change-logger';
import { usePlanStore } from '../store/plan-store';
import { useShiftsStore } from '../store/shifts-store';
import { useUserStore } from '../store/user-store';
import type { AdaptiveContext, AdaptiveChange } from '../lib/adaptive/types';
import type { SleepPlan } from '../lib/circadian/types';
import type { UserProfile, ShiftEvent, PersonalEvent } from '../lib/circadian/types';

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
}

/**
 * Core adaptive brain logic, extracted for direct unit testing.
 * Contains the daily debounce gate via AsyncStorage.
 */
export async function runAdaptiveBrain(deps: AdaptiveBrainDeps): Promise<void> {
  const { shifts, personalEvents, profile, currentPlan, planSnapshot, setAdaptiveContext } = deps;

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

    // Assemble the 4-factor adaptive context
    const context = buildAdaptiveContext({
      shifts,
      personalEvents,
      profile,
      history,
      today,
    });

    // Compute what will change vs current plan (for the InsightCard)
    // The actual plan regeneration happens inside setAdaptiveContext
    // Use planSnapshot as the "old" plan to show real before/after differences (BUG-05 fix)
    const changes = currentPlan
      ? computeDelta(planSnapshot ?? currentPlan, currentPlan, context)
      : [];

    setAdaptiveContext(context, changes);

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

  const { setAdaptiveContext, plan: currentPlan, pendingChanges, planSnapshot } = usePlanStore();
  const { shifts, personalEvents } = useShiftsStore();
  const { profile } = useUserStore();
  const adaptiveContext = usePlanStore((s) => s.adaptiveContext);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      try {
        await runAdaptiveBrain({
          shifts,
          personalEvents,
          profile,
          currentPlan,
          planSnapshot,
          setAdaptiveContext,
        });
      } catch (err) {
        // Adaptive brain is enhancement only — never crash the app
        console.warn('[useAdaptivePlan] Failed to assemble context:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return {
    context: adaptiveContext,
    changes: pendingChanges,
    isLoading,
  };
}
