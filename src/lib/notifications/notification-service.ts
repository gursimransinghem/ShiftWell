/**
 * ShiftWell Push Notification Service
 *
 * Manages local push notifications for sleep plan reminders using expo-notifications.
 * Schedules wind-down alerts, caffeine cutoffs, wake reminders, and morning briefs
 * based on the circadian algorithm's PlanBlock output.
 *
 * Notification copy follows D-06, D-07, D-08, NOTIF-04 — warm, emoji-rich tone.
 * Preference gates (enabled flags + lead times) are read from notification-store.
 */

import * as Notifications from 'expo-notifications';
import { useNotificationStore } from '@/src/store/notification-store';
import type { PlanBlock } from '../../lib/circadian/types';

/** Notification channel for Android grouping */
const CHANNEL_ID = 'shiftwell-reminders';

/** Default lead time before bedtime for wind-down reminder (ms) — overridden by store */
const DEFAULT_WIND_DOWN_LEAD_MS = 45 * 60 * 1000;

/**
 * Request notification permissions from the user.
 *
 * @returns Whether permissions were granted
 */
export async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();

  if (existing === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule a wind-down reminder before the given bedtime.
 * Lead time is read from notification-store (default 45 min).
 *
 * @param bedtime - The target bedtime
 * @param label - Human-readable label for context (e.g., "Main Sleep")
 * @returns The scheduled notification identifier, or null if the time has passed
 */
export async function scheduleSleepReminder(
  bedtime: Date,
  label: string,
): Promise<string | null> {
  const prefs = useNotificationStore.getState();
  const leadMs = (prefs.windDownLeadMinutes ?? 45) * 60 * 1000;
  const triggerTime = new Date(bedtime.getTime() - leadMs);

  if (triggerTime.getTime() <= Date.now()) {
    return null;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌙 Wind-down time',
      body: `Your sleep window opens in ${prefs.windDownLeadMinutes ?? 45} minutes — time to start unwinding`,
      data: { type: 'sleep-reminder', label },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerTime,
    },
  });

  return id;
}

/**
 * Schedule a notification at the caffeine cutoff time.
 *
 * @param cutoffTime - The time after which caffeine should be avoided
 * @returns The scheduled notification identifier, or null if the time has passed
 */
export async function scheduleCaffeineCutoff(
  cutoffTime: Date,
): Promise<string | null> {
  if (cutoffTime.getTime() <= Date.now()) {
    return null;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '☕ Last call for caffeine',
      body: 'Caffeine cutoff in 30 minutes — switch to water or herbal tea',
      data: { type: 'caffeine-cutoff' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: cutoffTime,
    },
  });

  return id;
}

/**
 * Schedule a wake-up notification at the specified time.
 *
 * @param wakeTime - The target wake time
 * @returns The scheduled notification identifier, or null if the time has passed
 */
export async function scheduleWakeReminder(
  wakeTime: Date,
): Promise<string | null> {
  if (wakeTime.getTime() <= Date.now()) {
    return null;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Time to rise',
      body: 'Your sleep window has ended — morning routine starts now',
      data: { type: 'wake-reminder' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: wakeTime,
    },
  });

  return id;
}

/**
 * Schedule a morning brief notification at the wake time.
 * Includes the label of the first block after waking so the user
 * knows what comes next in their circadian plan.
 *
 * @param wakeTime - The wake time to fire the notification
 * @param firstBlockLabel - Label of the first activity block after waking
 * @returns The scheduled notification identifier, or null if wakeTime is in the past
 */
export async function scheduleMorningBrief(
  wakeTime: Date,
  firstBlockLabel: string,
): Promise<string | null> {
  if (wakeTime.getTime() <= Date.now()) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: '☀️ Good morning!',
      body: `First up: ${firstBlockLabel}`,
      data: { type: 'morning-brief' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: wakeTime,
    },
  });
}

/**
 * Given an array of plan blocks, schedule all relevant notifications
 * for the next 24 hours. Cancels existing notifications first to
 * avoid duplicates.
 *
 * Reads user preferences from notification-store:
 * - windDownEnabled / windDownLeadMinutes
 * - caffeineCutoffEnabled
 * - morningBriefEnabled
 *
 * Schedules:
 * - Wind-down reminders (wind-down blocks, gated by windDownEnabled)
 * - Sleep reminders (main-sleep / nap blocks)
 * - Caffeine cutoff alerts (gated by caffeineCutoffEnabled)
 * - Wake reminders
 * - Morning brief (wake blocks, gated by morningBriefEnabled)
 *
 * @param planBlocks - The plan blocks from the circadian algorithm
 * @returns Array of scheduled notification identifiers
 */
export async function schedulePlanNotifications(
  planBlocks: PlanBlock[],
): Promise<string[]> {
  await cancelAllNotifications();

  const prefs = useNotificationStore.getState();
  const now = Date.now();
  const twentyFourHoursFromNow = now + 24 * 60 * 60 * 1000;
  const scheduledIds: string[] = [];

  const upcomingBlocks = planBlocks.filter(
    (block) =>
      block.start.getTime() > now &&
      block.start.getTime() <= twentyFourHoursFromNow,
  );

  for (const block of upcomingBlocks) {
    let id: string | null = null;

    switch (block.type) {
      case 'main-sleep':
      case 'nap':
        id = await scheduleSleepReminder(block.start, block.label);
        break;

      case 'caffeine-cutoff':
        if (prefs.caffeineCutoffEnabled) {
          id = await scheduleCaffeineCutoff(block.start);
        }
        break;

      case 'wake':
        id = await scheduleWakeReminder(block.start);
        if (prefs.morningBriefEnabled) {
          // Find the earliest block starting after this wake block's start time
          const nextBlock = planBlocks
            .filter((b) => b.start.getTime() > block.start.getTime())
            .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
          const firstBlockLabel = nextBlock?.label ?? 'your schedule';
          const briefId = await scheduleMorningBrief(block.start, firstBlockLabel);
          if (briefId) scheduledIds.push(briefId);
        }
        break;

      case 'wind-down':
        if (prefs.windDownEnabled) {
          id = await scheduleWindDownNotification(
            block.start,
            block.label,
            prefs.windDownLeadMinutes ?? 45,
          );
        }
        break;

      default:
        // meal-window, light-seek, light-avoid — no notifications by default
        break;
    }

    if (id) {
      scheduledIds.push(id);
    }
  }

  return scheduledIds;
}

/**
 * Cancel all currently scheduled notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * List all currently scheduled notifications.
 *
 * @returns Array of scheduled notification requests
 */
export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  return Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Schedule a wind-down notification at the exact block start time.
 * Used for explicit wind-down blocks. Copy references the lead minutes
 * from the notification-store so users see contextual countdown info.
 */
async function scheduleWindDownNotification(
  startTime: Date,
  label: string,
  windDownLeadMinutes: number,
): Promise<string | null> {
  if (startTime.getTime() <= Date.now()) {
    return null;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌙 Wind-down time',
      body: `Start winding down — bedtime in ${windDownLeadMinutes} minutes`,
      data: { type: 'wind-down', label },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: startTime,
    },
  });

  return id;
}
