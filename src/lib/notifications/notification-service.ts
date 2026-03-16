/**
 * ShiftWell Push Notification Service
 *
 * Manages local push notifications for sleep plan reminders using expo-notifications.
 * Schedules wind-down alerts, caffeine cutoffs, and wake reminders based on the
 * circadian algorithm's PlanBlock output.
 */

import * as Notifications from 'expo-notifications';
import type { PlanBlock, SleepBlockType } from '../../lib/circadian/types';

/** Notification channel for Android grouping */
const CHANNEL_ID = 'shiftwell-reminders';

/** Lead time before bedtime for wind-down reminder (ms) */
const WIND_DOWN_LEAD_MS = 30 * 60 * 1000;

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
 * Schedule a wind-down reminder 30 minutes before the given bedtime.
 *
 * @param bedtime - The target bedtime
 * @param label - Human-readable label for context (e.g., "Main Sleep")
 * @returns The scheduled notification identifier, or null if the time has passed
 */
export async function scheduleSleepReminder(
  bedtime: Date,
  label: string,
): Promise<string | null> {
  const triggerTime = new Date(bedtime.getTime() - WIND_DOWN_LEAD_MS);

  if (triggerTime.getTime() <= Date.now()) {
    return null;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to Wind Down',
      body: `Time to start winding down — bedtime in 30 minutes`,
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
      title: 'Caffeine Cutoff',
      body: 'Last chance for caffeine — cutoff time reached',
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
      title: 'Time to Wake Up',
      body: 'Rise and shine — your planned wake time is now',
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
 * Given an array of plan blocks, schedule all relevant notifications
 * for the next 24 hours. Cancels existing notifications first to
 * avoid duplicates.
 *
 * Schedules:
 * - Sleep reminders (30 min before main-sleep and nap blocks)
 * - Caffeine cutoff alerts
 * - Wake reminders
 * - Wind-down reminders
 *
 * @param planBlocks - The plan blocks from the circadian algorithm
 * @returns Array of scheduled notification identifiers
 */
export async function schedulePlanNotifications(
  planBlocks: PlanBlock[],
): Promise<string[]> {
  await cancelAllNotifications();

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
        id = await scheduleCaffeineCutoff(block.start);
        break;

      case 'wake':
        id = await scheduleWakeReminder(block.start);
        break;

      case 'wind-down':
        id = await scheduleWindDownNotification(block.start, block.label);
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
 * Used for explicit wind-down blocks (as opposed to the 30-min lead
 * on sleep blocks).
 */
async function scheduleWindDownNotification(
  startTime: Date,
  label: string,
): Promise<string | null> {
  if (startTime.getTime() <= Date.now()) {
    return null;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Wind-Down Time',
      body: `Start your wind-down routine — ${label}`,
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
