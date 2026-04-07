/**
 * ShiftWell Re-engagement Push Notifications
 *
 * Schedules a D1/D3/D7 local notification sequence for inactive users.
 * Uses expo-notifications (already in project).
 *
 * Rule: if the user has been away > 24 h, schedule the sequence on next open.
 * When the user returns (app opens), cancel the pending sequence.
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** AsyncStorage key for the last app-open timestamp */
const LAST_OPEN_KEY = 'shiftwell:last-open';

/** AsyncStorage key for the scheduled notification IDs */
const REENGAGEMENT_IDS_KEY = 'shiftwell:reengagement-ids';

/** Milliseconds in one day */
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Message catalogue
// ---------------------------------------------------------------------------

interface ReengagementMessage {
  title: string;
  body: string;
  /** Days after the last open date to fire */
  delayDays: number;
}

export const REENGAGEMENT_MESSAGES: ReengagementMessage[] = [
  {
    delayDays: 1,
    title: 'ShiftWell',
    body: 'Your sleep plan is waiting',
  },
  {
    delayDays: 3,
    title: 'ShiftWell',
    body: "You've missed 3 nights of optimized sleep",
  },
  {
    delayDays: 7,
    title: 'ShiftWell',
    body: 'Come back — your circadian rhythm needs you',
  },
];

// ---------------------------------------------------------------------------
// Last-open tracking
// ---------------------------------------------------------------------------

/**
 * Record the current timestamp as the most recent app open.
 */
export async function recordAppOpen(): Promise<void> {
  await AsyncStorage.setItem(LAST_OPEN_KEY, new Date().toISOString());
}

/**
 * Read the last stored app-open timestamp.
 *
 * @returns Date object or null if never recorded
 */
export async function getLastAppOpen(): Promise<Date | null> {
  const raw = await AsyncStorage.getItem(LAST_OPEN_KEY);
  return raw ? new Date(raw) : null;
}

/**
 * Return true if the user has been absent for more than 24 hours.
 *
 * @param now - Current time (injectable for tests)
 */
export async function isUserInactive(now: Date = new Date()): Promise<boolean> {
  const last = await getLastAppOpen();
  if (!last) return false; // No record → treat as new install, not inactive
  return now.getTime() - last.getTime() > ONE_DAY_MS;
}

// ---------------------------------------------------------------------------
// Schedule / cancel
// ---------------------------------------------------------------------------

/**
 * Schedule the D1/D3/D7 re-engagement notification sequence.
 * Base time is the current moment; each notification fires N days later.
 *
 * @param baseDate - Reference date (injectable for tests, defaults to now)
 * @returns Array of scheduled notification IDs
 */
export async function scheduleReengagementSequence(
  baseDate: Date = new Date(),
): Promise<string[]> {
  const ids: string[] = [];

  for (const msg of REENGAGEMENT_MESSAGES) {
    const trigger = new Date(baseDate.getTime() + msg.delayDays * ONE_DAY_MS);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body: msg.body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
      },
    });

    ids.push(id);
  }

  await AsyncStorage.setItem(REENGAGEMENT_IDS_KEY, JSON.stringify(ids));
  return ids;
}

/**
 * Cancel all pending re-engagement notifications and clear the stored IDs.
 */
export async function cancelReengagementSequence(): Promise<void> {
  const raw = await AsyncStorage.getItem(REENGAGEMENT_IDS_KEY);
  if (!raw) return;

  const ids: string[] = JSON.parse(raw) as string[];
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
  await AsyncStorage.removeItem(REENGAGEMENT_IDS_KEY);
}

/**
 * Top-level entry point called each time the app opens.
 *
 * Flow:
 *  1. Cancel any pending re-engagement sequence (user is back).
 *  2. Check inactivity.
 *  3. If user was inactive, schedule a fresh sequence.
 *  4. Record this open.
 *
 * @param now - Injectable for tests
 */
export async function handleAppOpen(now: Date = new Date()): Promise<void> {
  // Always cancel existing sequence on open — user returned
  await cancelReengagementSequence();

  const inactive = await isUserInactive(now);
  if (inactive) {
    await scheduleReengagementSequence(now);
  }

  await recordAppOpen();
}

// ---------------------------------------------------------------------------
// Re-export for direct cancel-scheduling use
// ---------------------------------------------------------------------------

/**
 * Get the stored re-engagement notification IDs (for inspection/testing).
 */
export async function getStoredReengagementIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(REENGAGEMENT_IDS_KEY);
  return raw ? (JSON.parse(raw) as string[]) : [];
}
