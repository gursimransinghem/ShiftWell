/**
 * Live Activity service — stub implementation.
 *
 * API surface matches expo-widgets LiveActivityFactory pattern so that
 * when EAS Build + Xcode are available, this file is the only change needed.
 *
 * Current implementation: fires local notifications as fallback.
 * Real ActivityKit implementation: slot in under the LIVE_ACTIVITIES_AVAILABLE guard.
 *
 * Blocked by: Xcode not installed (2026-04-02). EAS Build required for Swift extension.
 * See RESEARCH.md Pitfall 7 for context.
 */

import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Real ActivityKit only available in EAS development/production builds
// NOT in Expo Go (appOwnership === 'expo') — Pitfall 4
const LIVE_ACTIVITIES_AVAILABLE =
  Constants.appOwnership !== 'expo' &&
  typeof (global as any).__LIVE_ACTIVITY_NATIVE_MODULE__ !== 'undefined';

export interface LiveActivityState {
  phase: 'wind-down' | 'sleep' | 'morning';
  countdownMinutes?: number;   // for wind-down and morning countdown
  score?: number;              // morning phase only
  label: string;               // e.g. "Wind-down in 45 min"
  // Scheduling anchors — used to pre-schedule transitions (D-04)
  bedtimeISO?: string;         // ISO string of main-sleep block start
  wakeTimeISO?: string;        // ISO string of main-sleep block end
}

// Notification IDs for cleanup
const LIVE_ACTIVITY_NOTIF_ID = 'live-activity-wind-down';

/**
 * Start the sleep cycle Live Activity.
 * Schedules all three state transitions up front (D-04):
 *   1. Wind-down notification fires immediately
 *   2. Sleep transition fires at bedtimeISO
 *   3. Morning transition fires at wakeTimeISO
 */
export async function startSleepActivity(state: LiveActivityState): Promise<void> {
  if (LIVE_ACTIVITIES_AVAILABLE) {
    // Real implementation placeholder — see RESEARCH.md Pattern 3
    // TODO: import ShiftWellLiveActivity from '../../../targets/ShiftWellLiveActivity'
    // activityRef = ShiftWellLiveActivity.start(state)
    return;
  }

  // Stub: schedule persistent notification as fallback
  const now = new Date();

  // Cancel any prior live-activity notifications
  await Notifications.cancelScheduledNotificationAsync(LIVE_ACTIVITY_NOTIF_ID).catch(() => {});

  // Wind-down notification (fires immediately)
  await Notifications.scheduleNotificationAsync({
    identifier: LIVE_ACTIVITY_NOTIF_ID,
    content: {
      title: 'ShiftWell',
      body: state.label,
      data: { phase: state.phase, liveActivityStub: true },
      categoryIdentifier: 'live-activity',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 },
  });

  // Pre-schedule sleep transition if bedtime is known (D-04)
  if (state.bedtimeISO) {
    const bedtime = new Date(state.bedtimeISO);
    const sleepDelay = Math.max(1, Math.floor((bedtime.getTime() - now.getTime()) / 1000));
    await Notifications.scheduleNotificationAsync({
      identifier: `${LIVE_ACTIVITY_NOTIF_ID}-sleep`,
      content: {
        title: 'ShiftWell',
        body: 'Sleep well \uD83D\uDE34',
        data: { phase: 'sleep', liveActivityStub: true },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: sleepDelay },
    }).catch(() => {});
  }

  // Pre-schedule morning transition if wake time is known (D-04)
  if (state.wakeTimeISO) {
    const wakeTime = new Date(state.wakeTimeISO);
    const morningDelay = Math.max(1, Math.floor((wakeTime.getTime() - now.getTime()) / 1000));
    const score = state.score;
    await Notifications.scheduleNotificationAsync({
      identifier: `${LIVE_ACTIVITY_NOTIF_ID}-morning`,
      content: {
        title: 'ShiftWell',
        body: score !== undefined ? `Recovery: ${score}/100` : 'Morning routine',
        data: { phase: 'morning', liveActivityStub: true },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: morningDelay },
    }).catch(() => {});
  }
}

/**
 * Update the Live Activity to a new state.
 * Stub: fires a new notification replacing the current one.
 */
export async function updateSleepActivity(state: LiveActivityState): Promise<void> {
  if (LIVE_ACTIVITIES_AVAILABLE) {
    // TODO: activityRef?.update(state)
    return;
  }
  // Stub: just schedule a new notification
  await Notifications.scheduleNotificationAsync({
    identifier: `${LIVE_ACTIVITY_NOTIF_ID}-update`,
    content: {
      title: 'ShiftWell',
      body: state.label,
      data: { phase: state.phase, liveActivityStub: true },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 },
  }).catch(() => {});
}

/**
 * End the Live Activity (user woke up or dismissed).
 * Stub: cancels all live-activity notifications.
 */
export async function endSleepActivity(): Promise<void> {
  if (LIVE_ACTIVITIES_AVAILABLE) {
    // TODO: activityRef?.end()
    return;
  }
  await Promise.all([
    Notifications.cancelScheduledNotificationAsync(LIVE_ACTIVITY_NOTIF_ID),
    Notifications.cancelScheduledNotificationAsync(`${LIVE_ACTIVITY_NOTIF_ID}-sleep`),
    Notifications.cancelScheduledNotificationAsync(`${LIVE_ACTIVITY_NOTIF_ID}-morning`),
    Notifications.cancelScheduledNotificationAsync(`${LIVE_ACTIVITY_NOTIF_ID}-update`),
  ]).catch(() => {});
}
