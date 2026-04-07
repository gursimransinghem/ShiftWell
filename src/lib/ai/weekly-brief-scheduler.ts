/**
 * Weekly Brief Scheduler Hook
 *
 * Checks Monday morning conditions and triggers brief generation.
 * Conditions: Monday + 8 AM+ + not yet generated this week + user has enabled briefs
 *
 * Use in app root or Today screen via: useWeeklyBriefScheduler()
 */

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { format, startOfWeek, isMonday } from 'date-fns';
import { useAIStore } from '../../store/ai-store';
import { useUserStore } from '../../store/user-store';
import { usePlanStore } from '../../store/plan-store';
import { useShiftsStore } from '../../store/shifts-store';
import { generateWeeklyBrief } from './weekly-brief-generator';
import type { BriefContext } from './types';

const MIN_HOUR_TO_GENERATE = 8; // 8 AM local time
const ATTEMPT_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour between attempts

function getMondayWeekStartISO(): string {
  const now = new Date();
  const monday = startOfWeek(now, { weekStartsOn: 1 }); // ISO week: starts Monday
  return format(monday, 'yyyy-MM-dd');
}

function buildBriefContext(
  weekStartISO: string,
  plan: ReturnType<typeof usePlanStore.getState>['plan'],
  shifts: ReturnType<typeof useShiftsStore.getState>['shifts'],
): BriefContext {
  // Get upcoming 7 days of shifts
  const now = new Date();
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    return format(date, 'yyyy-MM-dd');
  });

  const upcomingShifts: BriefContext['upcomingShifts'] = next7Days.map((dateISO) => {
    const matchingShift = shifts.find((s) => {
      const shiftDateISO = format(new Date(s.start), 'yyyy-MM-dd');
      return shiftDateISO === dateISO;
    });

    if (!matchingShift) {
      return { dateISO, type: 'off' as const };
    }

    const shiftType = matchingShift.shiftType;
    if (shiftType === 'night') return { dateISO, type: 'night' as const };
    if (shiftType === 'evening') return { dateISO, type: 'evening' as const };
    return { dateISO, type: 'day' as const };
  });

  // Count hard transitions (consecutive shifts with large type changes)
  let hardTransitionDays = 0;
  for (let i = 1; i < upcomingShifts.length; i++) {
    const prev = upcomingShifts[i - 1].type;
    const curr = upcomingShifts[i].type;
    const isHard =
      (prev === 'night' && curr === 'day') ||
      (prev === 'day' && curr === 'night') ||
      (prev === 'night' && curr === 'evening') ||
      (prev === 'evening' && curr === 'night');
    if (isHard) hardTransitionDays++;
  }

  // Pull sleep debt approximation from plan if available.
  // circadianDebtScore (0-100) is converted to approximate hours (max ~14h at score 100).
  const sleepDebtHours = plan?.stats
    ? Math.round((plan.stats.circadianDebtScore / 100) * 14 * 10) / 10
    : 0;

  return {
    userId: 'local', // No PII sent to API
    weekStartISO,
    adherencePercent: 0, // Populated by score store when integrated in Phase 15+
    sleepDebtHours,
    avgDiscrepancyMinutes: 0, // Populated from feedback store when Phase 15 data is available
    upcomingShifts,
    hardTransitionDays,
  };
}

export function useWeeklyBriefScheduler(): void {
  const lastAttemptRef = useRef<number>(0);
  const { getLastBriefForWeek, setLatestBrief, setGenerating, setError } =
    useAIStore.getState();
  const { weeklyBriefEnabled } = useUserStore.getState();

  async function maybeTriggerBrief(): Promise<void> {
    const now = new Date();

    // Guard: only run on Monday
    if (!isMonday(now)) return;

    // Guard: only run at 8 AM or later
    if (now.getHours() < MIN_HOUR_TO_GENERATE) return;

    // Guard: user must have enabled briefs
    const { weeklyBriefEnabled: enabled } = useUserStore.getState();
    if (!enabled) return;

    // Guard: check cooldown (do not attempt more than once per hour)
    const nowMs = Date.now();
    if (nowMs - lastAttemptRef.current < ATTEMPT_COOLDOWN_MS) return;

    // Guard: check if brief already generated for this week
    const weekStartISO = getMondayWeekStartISO();
    const existingBrief = getLastBriefForWeek(weekStartISO);
    if (existingBrief) return;

    // All conditions met — generate brief
    lastAttemptRef.current = nowMs;

    const { plan } = usePlanStore.getState();
    const { shifts } = useShiftsStore.getState();
    const ctx = buildBriefContext(weekStartISO, plan, shifts);

    setGenerating(true);
    setError(null);

    try {
      const result = await generateWeeklyBrief(ctx);

      if (result.success && result.brief) {
        setLatestBrief(result.brief);
      } else {
        const errorMsg =
          result.error ??
          (result.guardrailFailure
            ? `Content guardrail triggered: ${result.guardrailFailure}`
            : 'Brief generation failed');
        setError(errorMsg);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    // Run on mount
    void maybeTriggerBrief();

    // Run on app foreground (AppState change to active)
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          void maybeTriggerBrief();
        }
      },
    );

    return () => {
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
