/**
 * Hook for computing recovery score metrics.
 *
 * Bridges HealthKit actual sleep data with the circadian plan to
 * produce adherence scores, comparisons, and weekly trends for
 * the Recovery Score dashboard on the Today tab.
 */

import { useState, useEffect, useCallback } from 'react';
import { subDays, startOfDay, isSameDay } from 'date-fns';
import { usePlanStore } from '@/src/store/plan-store';
import {
  getLastNightSleep,
  getSleepHistory,
  isAvailable,
} from '@/src/lib/healthkit/healthkit-service';
import { comparePlannedVsActual } from '@/src/lib/healthkit/sleep-comparison';
import type { SleepComparison } from '@/src/lib/healthkit/sleep-comparison';
import { calculateWeeklyAccuracy } from '@/src/lib/healthkit/accuracy-score';
import type { PlanAccuracy } from '@/src/lib/healthkit/accuracy-score';
import { useScoreStore } from '@/src/store/score-store';

export interface RecoveryScoreData {
  isLoading: boolean;
  isAvailable: boolean;
  lastNight: SleepComparison | null;
  weeklyAccuracy: PlanAccuracy | null;
  /** Daily adherence scores for the past 7 days (for the bar chart) */
  dailyScores: { day: string; score: number | null }[];
  /** Non-HealthKit adherence score (0-100 or null) for v1.0 display */
  adherenceScore: number | null;
  /** 7-day daily scores from score-store for WeeklyTrendChart fallback */
  adherenceDailyScores: { day: string; score: number | null }[];
  refresh: () => void;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function useRecoveryScore(): RecoveryScoreData {
  const [isLoading, setIsLoading] = useState(true);
  const [available, setAvailable] = useState(false);
  const [lastNight, setLastNight] = useState<SleepComparison | null>(null);
  const [weeklyAccuracy, setWeeklyAccuracy] = useState<PlanAccuracy | null>(null);
  const [dailyScores, setDailyScores] = useState<{ day: string; score: number | null }[]>([]);
  const [adherenceScore, setAdherenceScore] = useState<number | null>(null);
  const [adherenceDailyScores, setAdherenceDailyScores] = useState<{ day: string; score: number | null }[]>([]);

  const plan = usePlanStore((s) => s.plan);

  /**
   * Find the most recent main-sleep block ending before now
   * (i.e. "last night's" planned sleep).
   */
  const findLastNightSleepBlock = useCallback(() => {
    if (!plan) return null;

    const now = new Date();
    const mainSleepBlocks = plan.blocks
      .filter((b) => b.type === 'main-sleep' && b.end <= now)
      .sort((a, b) => b.end.getTime() - a.end.getTime());

    return mainSleepBlocks[0] ?? null;
  }, [plan]);

  /**
   * Find the planned main-sleep block for a specific date.
   * Matches if the block's start date falls on the given date.
   */
  const findPlannedBlockForDate = useCallback(
    (date: Date) => {
      if (!plan) return null;

      return (
        plan.blocks.find(
          (b) => b.type === 'main-sleep' && isSameDay(b.start, date),
        ) ?? null
      );
    },
    [plan],
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      const hkAvailable = await isAvailable();
      setAvailable(hkAvailable);

      // Non-HealthKit adherence path (v1.0 primary path — per SCORE-01)
      // Use .getState() (Zustand imperative accessor) — safe inside useCallback
      const scoreStore = useScoreStore.getState();
      setAdherenceScore(scoreStore.todayScore());
      setAdherenceDailyScores(scoreStore.weeklyScores());

      if (!hkAvailable || !plan) {
        setIsLoading(false);
        return;
      }

      // --- Last night comparison ---
      const lastNightBlock = findLastNightSleepBlock();
      if (lastNightBlock) {
        const yesterday = subDays(new Date(), 1);
        const actualSleep = await getLastNightSleep(yesterday);
        const comparison = comparePlannedVsActual(
          { start: lastNightBlock.start, end: lastNightBlock.end },
          actualSleep,
        );
        setLastNight(comparison);
      } else {
        setLastNight(null);
      }

      // --- 7-day history for weekly accuracy + daily scores ---
      const today = startOfDay(new Date());
      const weekAgo = subDays(today, 7);
      const history = await getSleepHistory(weekAgo, subDays(today, 1));

      // Build per-day comparisons
      const comparisons: SleepComparison[] = [];
      const scores: { day: string; score: number | null }[] = [];

      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i + 1);
        const dayLabel = DAY_LABELS[date.getDay()];
        const plannedBlock = findPlannedBlockForDate(date);
        const actualRecord = history.find((r) => isSameDay(r.date, date)) ?? null;

        if (plannedBlock) {
          const comparison = comparePlannedVsActual(
            { start: plannedBlock.start, end: plannedBlock.end },
            actualRecord,
          );
          comparisons.push(comparison);
          scores.push({
            day: dayLabel,
            score: comparison.actual ? comparison.adherenceScore : null,
          });
        } else {
          scores.push({ day: dayLabel, score: null });
        }
      }

      setDailyScores(scores);

      if (comparisons.length > 0) {
        const accuracy = calculateWeeklyAccuracy(comparisons);
        setWeeklyAccuracy(accuracy);
      } else {
        setWeeklyAccuracy(null);
      }
    } catch (error) {
      console.error('[useRecoveryScore] Failed to fetch recovery data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [plan, findLastNightSleepBlock, findPlannedBlockForDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    isLoading,
    isAvailable: available,
    lastNight,
    weeklyAccuracy,
    dailyScores,
    adherenceScore,
    adherenceDailyScores,
    refresh: fetchData,
  };
}
