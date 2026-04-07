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
import { subDays } from 'date-fns';
import { getSleepHistory, isAvailable } from '../lib/healthkit/healthkit-service';
import { buildAdaptiveContext } from '../lib/adaptive/context-builder';
import { computeDelta } from '../lib/adaptive/change-logger';
import { usePlanStore } from '../store/plan-store';
import { useShiftsStore } from '../store/shifts-store';
import { useUserStore } from '../store/user-store';
import type { AdaptiveContext, AdaptiveChange } from '../lib/adaptive/types';

export interface AdaptivePlanData {
  context: AdaptiveContext | null;
  changes: AdaptiveChange[];
  isLoading: boolean;
}

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
        const today = new Date();

        // Fetch 14-night HealthKit history (gracefully returns [] if unavailable)
        let history: Awaited<ReturnType<typeof getSleepHistory>> = [];
        const healthkitAvailable = await isAvailable();
        if (healthkitAvailable) {
          history = await getSleepHistory(subDays(today, 14), today);
        }

        if (cancelled) return;

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
