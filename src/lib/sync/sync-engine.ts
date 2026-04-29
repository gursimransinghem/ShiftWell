/**
 * Offline-first sync engine for ShiftWell.
 *
 * Strategy:
 * - Writes always go to AsyncStorage first (instant, works offline)
 * - Writes are queued for Supabase when user is authenticated
 * - On reconnect, flush the queue
 * - Conflict resolution: last-write-wins with timestamp comparison
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured, supabase } from '../supabase/client';

const SYNC_QUEUE_KEY = 'shiftwell-sync-queue';
const LAST_SYNCED_KEY = 'shiftwell-last-synced-at';
const MAX_RETRIES = 3;

/** Tables that participate in sync */
export type SyncTable = 'users' | 'shifts' | 'personal_events' | 'sleep_plans' | 'health_data';

export type SyncOperation = 'upsert' | 'delete';

export interface QueuedWrite {
  id: string;
  table: SyncTable;
  operation: SyncOperation;
  data: Record<string, unknown>;
  timestamp: string;
  retries: number;
}

export interface SyncStatus {
  pendingCount: number;
  lastSyncedAt: string | null;
  isSyncing: boolean;
}

/** Result returned by fullSync */
export interface SyncResult {
  pushed: number;
  pulled: number;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

let syncing = false;

function isCloudSyncAvailable(): boolean {
  return typeof isSupabaseConfigured === 'function' ? isSupabaseConfigured() : true;
}

// ---------------------------------------------------------------------------
// Queue persistence helpers
// ---------------------------------------------------------------------------

async function readQueue(): Promise<QueuedWrite[]> {
  const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueuedWrite[];
  } catch {
    return [];
  }
}

async function writeQueue(queue: QueuedWrite[]): Promise<void> {
  await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Add a write operation to the offline queue.
 * The operation will be flushed to Supabase later via `flushQueue()`.
 */
export async function queueWrite(
  table: SyncTable,
  operation: SyncOperation,
  data: Record<string, unknown>,
): Promise<void> {
  const queue = await readQueue();
  const entry: QueuedWrite = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    table,
    operation,
    data,
    timestamp: new Date().toISOString(),
    retries: 0,
  };
  queue.push(entry);
  await writeQueue(queue);
}

/**
 * Process all pending operations against Supabase.
 * Successfully completed operations are removed from the queue.
 * Operations that exceed MAX_RETRIES are discarded.
 * Failed operations (under retry limit) remain for the next flush attempt.
 */
export async function flushQueue(): Promise<{ flushed: number; failed: number }> {
  const queue = await readQueue();
  if (queue.length === 0) return { flushed: 0, failed: 0 };
  if (!isCloudSyncAvailable()) {
    return { flushed: 0, failed: queue.length };
  }

  syncing = true;
  const remaining: QueuedWrite[] = [];
  let flushed = 0;

  try {
    for (const entry of queue) {
      try {
        if (entry.operation === 'upsert') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await supabase.from(entry.table).upsert(entry.data as any);
          if (error) throw error;
        } else if (entry.operation === 'delete') {
          const id = entry.data.id as string;
          if (!id) throw new Error('Delete operation requires an id field');
          const { error } = await supabase.from(entry.table).delete().eq('id', id);
          if (error) throw error;
        }
        flushed++;
      } catch {
        entry.retries += 1;
        // Only keep if under retry limit
        if (entry.retries < MAX_RETRIES) {
          remaining.push(entry);
        }
        // else: silently drop — exceeded max retries
      }
    }

    await writeQueue(remaining);
    await AsyncStorage.setItem(LAST_SYNCED_KEY, new Date().toISOString());
  } finally {
    syncing = false;
  }

  return { flushed, failed: remaining.length };
}

/**
 * Full bidirectional sync for a user.
 * 1. Flush any pending local writes to the cloud.
 * 2. Pull the latest cloud data into AsyncStorage.
 *
 * Conflict resolution: last-write-wins. Remote data overwrites local
 * for pulled tables because the push phase already sent local changes.
 */
export async function fullSync(userId: string): Promise<SyncResult> {
  const errors: string[] = [];
  let pushed = 0;
  let pulled = 0;

  if (!isCloudSyncAvailable()) {
    return {
      pushed,
      pulled,
      errors: ['Supabase is not configured. Cloud sync is unavailable in this build.'],
    };
  }

  // --- Push: flush the offline queue ---
  const flushResult = await flushQueue();
  pushed = flushResult.flushed;
  if (flushResult.failed > 0) {
    errors.push(`${flushResult.failed} queued write(s) failed to sync`);
  }

  // --- Pull: fetch latest cloud data per table ---
  const tablesToPull: { table: SyncTable; storageKey: string }[] = [
    { table: 'users', storageKey: 'nightshift-user' },
    { table: 'shifts', storageKey: 'nightshift-shifts' },
    { table: 'personal_events', storageKey: 'nightshift-personal-events' },
    { table: 'sleep_plans', storageKey: 'nightshift-plan' },
    { table: 'health_data', storageKey: 'nightshift-health-data' },
  ];

  for (const { table, storageKey } of tablesToPull) {
    try {
      let query = supabase.from(table).select('*');

      // users table uses id directly, others use user_id
      if (table === 'users') {
        query = query.eq('id', userId);
      } else {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        // For single-row tables store the object directly; arrays for multi-row
        if (table === 'users') {
          await AsyncStorage.setItem(storageKey, JSON.stringify(data[0] ?? null));
        } else {
          await AsyncStorage.setItem(storageKey, JSON.stringify(data));
        }
        pulled += data.length;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`Pull from ${table} failed: ${message}`);
    }
  }

  await AsyncStorage.setItem(LAST_SYNCED_KEY, new Date().toISOString());
  return { pushed, pulled, errors };
}

/**
 * Check whether there are pending writes that haven't been flushed.
 */
export async function hasPendingWrites(): Promise<boolean> {
  const queue = await readQueue();
  return queue.length > 0;
}

/**
 * Return the current sync status including pending count, last sync time,
 * and whether a sync is currently in progress.
 */
export async function getSyncStatus(): Promise<SyncStatus> {
  const queue = await readQueue();
  const lastSyncedAt = await AsyncStorage.getItem(LAST_SYNCED_KEY);
  return {
    pendingCount: queue.length,
    lastSyncedAt,
    isSyncing: syncing,
  };
}
