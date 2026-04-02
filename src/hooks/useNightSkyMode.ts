import { useMemo } from 'react';
import { differenceInMinutes, isAfter, addDays, startOfDay } from 'date-fns';
import { usePlanStore } from '@/src/store/plan-store';
import { useNotificationStore } from '@/src/store/notification-store';
import { useUserStore } from '@/src/store/user-store';

// ---------------------------------------------------------------------------
// Return shape
// ---------------------------------------------------------------------------

export interface NightSkyModeData {
  /** Whether the wind-down window is currently active (approaching or during sleep) */
  isActive: boolean;
  /** Minutes until next main sleep block starts (Infinity if none found) */
  minutesUntilSleep: number;
  /** 0.0 to 1.0 — drives the RechargeArc fill; degrades when past bedtime */
  fillFraction: number;
  /** Start of the next main-sleep block (alarm time) */
  alarmTime: Date | null;
  /** End of the next main-sleep block (latest wake time) */
  latestWakeTime: Date | null;
  /** Labels of first 3 blocks that start after the sleep window ends */
  tomorrowSchedule: string[];
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Detects whether Night Sky Mode should be active based on the next
 * main-sleep block in the current plan.
 *
 * Design rules:
 * - Only activates for main-sleep blocks with priority === 1 (Pitfall 4: no naps)
 * - Only considers blocks whose start hour is in [18:00, 12:00) to exclude nap windows
 * - Reads plan from usePlanStore — does NOT add its own setInterval
 * - fillFraction degrades past bedtime using a 50% penalty factor (NSM-03)
 */
export function useNightSkyMode(): NightSkyModeData {
  const plan = usePlanStore((s) => s.plan);
  const windDownLeadMinutes = useNotificationStore((s) => s.windDownLeadMinutes);
  const profile = useUserStore((s) => s.profile);

  return useMemo(() => {
    const now = new Date();

    const fallback: NightSkyModeData = {
      isActive: false,
      minutesUntilSleep: Infinity,
      fillFraction: 0,
      alarmTime: null,
      latestWakeTime: null,
      tomorrowSchedule: [],
    };

    if (!plan?.blocks) return fallback;

    // Find the next eligible main-sleep block:
    // - type === 'main-sleep'
    // - priority === 1 (critical, primary sleep — not a nap dressed as main-sleep)
    // - Hour is in the "overnight" window: >= 18:00 or < 12:00 (avoids midday nap false-positives)
    const nextSleep = plan.blocks
      .filter((b) => {
        if (b.type !== 'main-sleep' || b.priority !== 1) return false;
        const startHour = b.start.getHours();
        return startHour >= 18 || startHour < 12;
      })
      .filter((b) => isAfter(b.end, now)) // still has time remaining
      .sort((a, b) => a.start.getTime() - b.start.getTime())[0];

    if (!nextSleep) return fallback;

    const minutesUntilSleep = differenceInMinutes(nextSleep.start, now);
    const plannedSleepMinutes = differenceInMinutes(nextSleep.end, nextSleep.start);

    // Active during wind-down window AND during the sleep block itself
    const isActive =
      minutesUntilSleep <= windDownLeadMinutes &&
      minutesUntilSleep >= -plannedSleepMinutes;

    if (!isActive) {
      return {
        ...fallback,
        minutesUntilSleep,
        alarmTime: nextSleep.start,
        latestWakeTime: nextSleep.end,
      };
    }

    // fillFraction: base value from planned sleep vs. sleepNeed
    const sleepNeedMinutes = (profile.sleepNeed ?? 7.5) * 60;
    let fillFraction = clamp(plannedSleepMinutes / sleepNeedMinutes, 0, 1);

    // Degrade if user is past bedtime (the longer they delay, the lower the arc)
    if (minutesUntilSleep < 0) {
      const minutesPastBedtime = Math.abs(minutesUntilSleep);
      const penalty = (minutesPastBedtime / plannedSleepMinutes) * 0.5;
      fillFraction = clamp(fillFraction - penalty, 0, 1);
    }

    // tomorrowSchedule: blocks after nextSleep.end and before end of that calendar day
    const dayAfterSleepEnd = addDays(startOfDay(nextSleep.end), 1);
    const tomorrowSchedule = plan.blocks
      .filter(
        (b) =>
          isAfter(b.start, nextSleep.end) &&
          b.start < dayAfterSleepEnd,
      )
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 3)
      .map((b) => b.label);

    return {
      isActive,
      minutesUntilSleep,
      fillFraction,
      alarmTime: nextSleep.start,
      latestWakeTime: nextSleep.end,
      tomorrowSchedule,
    };
  }, [plan, windDownLeadMinutes, profile]);
}
