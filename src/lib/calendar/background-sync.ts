/**
 * Background sync task definition and registration.
 *
 * Defines the SHIFTWELL_CALENDAR_SYNC background task using expo-task-manager.
 * TaskManager.defineTask runs at module scope — import this file as a side-effect
 * (import '@/src/lib/calendar/background-sync') to register the task.
 *
 * Background polling interval: 20 minutes (middle of D-14 range).
 */

import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';

export const CALENDAR_SYNC_TASK = 'SHIFTWELL_CALENDAR_SYNC';

// Register task at module scope (side-effect import pattern)
TaskManager.defineTask(CALENDAR_SYNC_TASK, async () => {
  try {
    const { runCalendarSync } = await import('./calendar-service');
    await runCalendarSync();
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

/**
 * Register the calendar background sync task.
 * Safe to call multiple times — checks isTaskRegisteredAsync first.
 */
export async function registerCalendarBackgroundSync(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(CALENDAR_SYNC_TASK);
  if (!isRegistered) {
    await BackgroundTask.registerTaskAsync(CALENDAR_SYNC_TASK, {
      minimumInterval: 20 * 60, // 20 minutes in seconds
    });
  }
}

/**
 * Unregister the calendar background sync task.
 * Called when user disconnects both calendar providers.
 */
export async function unregisterCalendarBackgroundSync(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(CALENDAR_SYNC_TASK);
  if (isRegistered) {
    await BackgroundTask.unregisterTaskAsync(CALENDAR_SYNC_TASK);
  }
}
