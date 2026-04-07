/**
 * usePredictiveSchedule — Phase 22
 *
 * Runs the predictive scheduling engine once per day (debounced via AsyncStorage).
 * Feature-gated behind 'predictive-scheduling'.
 *
 * - Reads shifts from shifts-store
 * - Reads sleep debt from adaptive context in plan-store
 * - Calls scoreTransitionStress + generatePreAdaptation
 * - Stores results back into plan-store via setStressPoints / setPreAdaptation
 *
 * Call once at app root (same level as useAdaptivePlan).
 */

import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BETA_MODE, isFeatureAvailable } from '../lib/premium/feature-gate';
import { useShiftsStore } from '../store/shifts-store';
import { usePlanStore } from '../store/plan-store';
import { usePremiumStore } from '../store/premium-store';
import { scoreTransitionStress } from '../lib/predictive/stress-scorer';
import { generatePreAdaptation } from '../lib/predictive/pre-adaptation';
import type { TransitionStressPoint } from '../lib/predictive/stress-scorer';
import type { PreAdaptationPlan } from '../lib/predictive/pre-adaptation';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PREDICTIVE_LAST_RUN_KEY = 'predictive-last-run';

// ---------------------------------------------------------------------------
// Results type
// ---------------------------------------------------------------------------

export interface PredictiveScheduleData {
  stressPoints: TransitionStressPoint[];
  preAdaptation: PreAdaptationPlan | null;
  isReady: boolean;
}

// ---------------------------------------------------------------------------
// Async runner (separated from hook for testability)
// ---------------------------------------------------------------------------

export async function runPredictiveEngine(deps: {
  shifts: ReturnType<typeof useShiftsStore.getState>['shifts'];
  debtHours: number;
  today?: Date;
}): Promise<{ stressPoints: TransitionStressPoint[]; preAdaptation: PreAdaptationPlan | null }> {
  const { shifts, debtHours, today = new Date() } = deps;

  if (shifts.length === 0) {
    return { stressPoints: [], preAdaptation: null };
  }

  // Simple estimates from shifts — no recovery calendar access needed
  const upcomingNights = shifts
    .filter((s) => s.start >= today && s.shiftType === 'night')
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  // Count current consecutive nights by looking at recent past
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const recentNights = shifts
    .filter((s) => s.shiftType === 'night' && s.start >= yesterday && s.start <= today)
    .length;

  // Estimate recovery days: off days between now and first upcoming shift
  const firstUpcomingShift = shifts
    .filter((s) => s.start >= today)
    .sort((a, b) => a.start.getTime() - b.start.getTime())[0];

  let recoveryDays = 0;
  if (firstUpcomingShift) {
    const daysUntilShift = Math.floor(
      (firstUpcomingShift.start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    recoveryDays = Math.max(0, daysUntilShift - 1);
  }

  const stressPoints = scoreTransitionStress(
    shifts,
    debtHours,
    recoveryDays,
    recentNights,
    today,
  );

  // Find the highest-priority stress point (highest severity)
  const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  const topStressPoint = stressPoints.sort(
    (a, b) => (severityOrder[b.severity] ?? 0) - (severityOrder[a.severity] ?? 0),
  )[0] ?? null;

  const preAdaptation = topStressPoint
    ? generatePreAdaptation(topStressPoint, new Date(), today)
    : null;

  return { stressPoints, preAdaptation };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Runs the predictive scheduling engine once per calendar day.
 * Results are held in local component state and can be passed directly to
 * CircadianForecastCard.
 *
 * @returns { stressPoints, preAdaptation, isReady }
 */
export function usePredictiveSchedule(): PredictiveScheduleData {
  const shifts = useShiftsStore((s) => s.shifts);
  const adaptiveContext = usePlanStore((s) => s.adaptiveContext);
  const { isPremium, isInTrial } = usePremiumStore();

  // Store results in plan-store by extending it — for now hold locally
  // (plan-store doesn't yet have stressPoints/preAdaptation; we return from hook)
  const [result, setResult] = useState<{
    stressPoints: TransitionStressPoint[];
    preAdaptation: PreAdaptationPlan | null;
  }>({ stressPoints: [], preAdaptation: null });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Feature gate check
    const available = isFeatureAvailable('predictive-scheduling', isPremium || isInTrial, false);
    if (!available) {
      setIsReady(true);
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        // Daily debounce — only run once per calendar day
        const lastRun = await AsyncStorage.getItem(PREDICTIVE_LAST_RUN_KEY);
        const todayISO = new Date().toISOString().slice(0, 10);
        if (lastRun === todayISO) {
          // Already ran today — skip but mark ready
          setIsReady(true);
          return;
        }

        const debtHours = adaptiveContext?.debt.rollingHours ?? 0;

        const engineResult = await runPredictiveEngine({
          shifts,
          debtHours: Math.max(0, debtHours),
        });

        if (cancelled) return;

        await AsyncStorage.setItem(PREDICTIVE_LAST_RUN_KEY, todayISO);
        setResult(engineResult);
        setIsReady(true);
      } catch {
        // Non-blocking — predictive engine failure doesn't affect core plan
        setIsReady(true);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [shifts, adaptiveContext, isPremium, isInTrial]);

  return {
    stressPoints: result.stressPoints,
    preAdaptation: result.preAdaptation,
    isReady,
  };
}

