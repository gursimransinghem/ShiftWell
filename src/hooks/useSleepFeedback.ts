/**
 * useSleepFeedback — Phase 14 Nightly Ingestion Hook
 *
 * Runs once per day (daily debounce gate via AsyncStorage, same pattern
 * as useAdaptivePlan). Reads last night's HealthKit sleep, compares
 * against the planned sleep window, and stores the discrepancy.
 *
 * Call this from app/(tabs)/index.tsx AFTER useAdaptivePlan so the
 * adaptive brain runs first and the plan is current before we compare.
 */

import { useEffect } from 'react';
import { format, subDays } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { readMainSleepForNight } from '../lib/feedback/healthkit-sleep-reader';
import { computeDiscrepancy, getPlannedSleepForDate } from '../lib/feedback/comparator';
import { useFeedbackStore } from '../store/feedback-store';
import { usePlanStore } from '../store/plan-store';
import { BETA_MODE } from '../lib/premium/feature-gate';

/** AsyncStorage key used to debounce daily ingestion */
const FEEDBACK_LAST_RUN_KEY = 'feedback-last-run';

// ---------------------------------------------------------------------------
// Extracted async logic — testable without React hooks
// ---------------------------------------------------------------------------

export interface SleepFeedbackDeps {
  plan: { blocks: Array<{ type: string; start: Date; end: Date }> } | null;
  addDiscrepancy: (record: import('../lib/feedback/types').SleepDiscrepancy) => void;
}

/**
 * Core feedback ingestion logic, extracted for direct unit testing.
 * Contains the daily debounce gate via AsyncStorage.
 */
export async function runSleepFeedback(deps: SleepFeedbackDeps): Promise<void> {
  const { plan, addDiscrepancy } = deps;

  // ── Daily debounce gate ──────────────────────────────────────────────────
  const today = new Date();
  const todayISO = format(today, 'yyyy-MM-dd');
  const lastRun = await AsyncStorage.getItem(FEEDBACK_LAST_RUN_KEY);
  if (lastRun === todayISO) return;
  // ────────────────────────────────────────────────────────────────────────

  try {
    // We compare against last night (sleep that ended this morning)
    const lastNight = subDays(today, 1);
    const lastNightISO = format(lastNight, 'yyyy-MM-dd');

    // Get the planned sleep window for last night
    const plannedWindow = plan
      ? getPlannedSleepForDate(lastNightISO, plan.blocks)
      : null;

    // No planned sleep for last night — nothing to compare
    if (!plannedWindow) {
      await AsyncStorage.setItem(FEEDBACK_LAST_RUN_KEY, todayISO);
      return;
    }

    // Read actual HealthKit sleep for last night (gracefully returns null)
    const actualWindow = await readMainSleepForNight(lastNight);

    // Compute and store the discrepancy
    const discrepancy = computeDiscrepancy(lastNightISO, plannedWindow, actualWindow);
    addDiscrepancy(discrepancy);

    // Persist run date AFTER success so failures retry next foreground
    await AsyncStorage.setItem(FEEDBACK_LAST_RUN_KEY, todayISO);
  } catch (err) {
    // Feedback ingestion is enhancement only — never crash the app
    console.warn('[runSleepFeedback] Failed to ingest sleep feedback:', err);
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSleepFeedback(): void {
  const plan = usePlanStore((s) => s.plan);
  const addDiscrepancy = useFeedbackStore((s) => s.addDiscrepancy);
  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Feature gate: sleep-feedback is premium-only. BETA_MODE=true → always runs.
      // When BETA_MODE is disabled, this becomes a real isPremium check via useFeatureGate.
      if (!BETA_MODE) return;
      if (cancelled) return;
      await runSleepFeedback({ plan, addDiscrepancy });
    }

    run();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run on mount only — debounce gate prevents duplicate runs
}
