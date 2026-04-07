/**
 * useWeeklyBrief — triggers weekly brief generation on Mondays.
 *
 * Debounced via AsyncStorage key 'brief-last-generated' so we only call
 * the Claude API once per week even if the app is opened multiple times.
 * Lightweight: runs date check only, never blocks UI.
 */

import { useEffect } from 'react';
import { getDay, format, parseISO, isBefore, startOfDay } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBriefStore } from '@/src/store/brief-store';
import { useScoreStore } from '@/src/store/score-store';
import { usePlanStore } from '@/src/store/plan-store';
import { usePremiumStore } from '@/src/store/premium-store';
import type { BriefRequest } from '@/src/lib/ai/claude-client';

const LAST_GENERATED_KEY = 'brief-last-generated';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return Monday date string for the week that contains `date`. */
function getMondayISO(date: Date): string {
  const d = new Date(date);
  const day = getDay(d); // 0=Sun, 1=Mon…
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  return format(d, 'yyyy-MM-dd');
}

function isMonday(date: Date): boolean {
  return getDay(date) === 1;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useWeeklyBrief(): void {
  const enabled = useBriefStore((s) => s.enabled);
  const generateBrief = useBriefStore((s) => s.generateBrief);
  const dailyHistory = useScoreStore((s) => s.dailyHistory);
  const adaptiveContext = usePlanStore((s) => s.adaptiveContext);
  const { isPremium } = usePremiumStore();

  useEffect(() => {
    if (!enabled) return;
    if (!isMonday(new Date())) return;

    const thisMonday = getMondayISO(new Date());

    AsyncStorage.getItem(LAST_GENERATED_KEY).then((stored) => {
      if (stored === thisMonday) return; // already generated this week

      // Assemble request from available store data
      const last7 = dailyHistory.slice(-7);

      const sleepHistory = last7.map((d) => ({
        dateISO: d.dateISO,
        planned: 7.5, // default sleep need; precise value not critical for brief
        actual: d.score !== null ? Math.max(0, 7.5 * (d.score / 100)) : 7.5,
        score: d.score ?? 0,
      }));

      const debtCurrent = adaptiveContext?.debt.rollingHours ?? 0;
      // Approximate week-ago debt from score average (rough proxy)
      const prevWeekAvg =
        last7.length > 0
          ? last7.reduce((sum, d) => sum + (d.score ?? 0), 0) / last7.length
          : 50;
      const debtWeekAgo = Math.max(0, 10 * (1 - prevWeekAvg / 100));

      const upcomingTransitions: { type: string; daysUntil: number }[] = [];
      if (
        adaptiveContext?.schedule.transitionType &&
        adaptiveContext.schedule.transitionType !== 'none' &&
        adaptiveContext.schedule.daysUntilTransition > 0
      ) {
        upcomingTransitions.push({
          type: adaptiveContext.schedule.transitionType,
          daysUntil: adaptiveContext.schedule.daysUntilTransition,
        });
      }

      // Compute streak: consecutive days from today backward where score > 0
      let streakDays = 0;
      const sorted = [...dailyHistory].sort((a, b) =>
        b.dateISO.localeCompare(a.dateISO),
      );
      for (const entry of sorted) {
        const entryDate = parseISO(entry.dateISO);
        if (isBefore(startOfDay(new Date()), startOfDay(entryDate))) continue;
        if ((entry.score ?? 0) > 0) {
          streakDays++;
        } else {
          break;
        }
      }

      const request: BriefRequest = {
        sleepHistory,
        debtTrend: { current: debtCurrent, weekAgo: debtWeekAgo },
        upcomingTransitions,
        streakDays,
      };

      generateBrief(request, isPremium).then(() => {
        AsyncStorage.setItem(LAST_GENERATED_KEY, thisMonday);
      });
    });
  }, [enabled, generateBrief, dailyHistory, adaptiveContext, isPremium]);
}
