/**
 * Tests for the offline-first sync engine.
 *
 * Verifies that:
 * - queueWrite persists entries to AsyncStorage
 * - flushQueue processes entries and handles success/failure/retries
 * - hasPendingWrites correctly reports queue state
 * - getSyncStatus returns accurate pending count and last synced time
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  queueWrite,
  flushQueue,
  hasPendingWrites,
  getSyncStatus,
} from '../src/lib/sync/sync-engine';
import type { QueuedWrite } from '../src/lib/sync/sync-engine';

// ── Mocks ────────────────────────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('../src/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      upsert: jest.fn(),
      delete: jest.fn(() => ({ eq: jest.fn() })),
      select: jest.fn(() => ({ eq: jest.fn() })),
    })),
  },
}));

const mockedGetItem = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const mockedSetItem = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;

// Import the mocked supabase so we can configure per-test behavior
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { supabase } = require('../src/lib/supabase/client');

// ── Helpers ──────────────────────────────────────────────────────────

const SYNC_QUEUE_KEY = 'shiftwell-sync-queue';
const LAST_SYNCED_KEY = 'shiftwell-last-synced-at';

/** Set up AsyncStorage mock to return a given queue */
function mockQueue(queue: QueuedWrite[]) {
  mockedGetItem.mockImplementation(async (key: string) => {
    if (key === SYNC_QUEUE_KEY) return JSON.stringify(queue);
    if (key === LAST_SYNCED_KEY) return null;
    return null;
  });
}

/** Capture what was written to AsyncStorage for the queue key */
function getWrittenQueue(): QueuedWrite[] {
  const calls = mockedSetItem.mock.calls.filter(([key]) => key === SYNC_QUEUE_KEY);
  if (calls.length === 0) return [];
  const lastCall = calls[calls.length - 1];
  return JSON.parse(lastCall[1]);
}

/** Configure supabase.from to return success for upsert */
function mockSupabaseSuccess() {
  supabase.from.mockReturnValue({
    upsert: jest.fn().mockResolvedValue({ error: null }),
    delete: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    }),
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: [], error: null }),
    }),
  });
}

/** Configure supabase.from to return error for upsert */
function mockSupabaseError(message = 'network error') {
  supabase.from.mockReturnValue({
    upsert: jest.fn().mockResolvedValue({ error: new Error(message) }),
    delete: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: new Error(message) }),
    }),
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: null, error: new Error(message) }),
    }),
  });
}

function makeEntry(overrides?: Partial<QueuedWrite>): QueuedWrite {
  return {
    id: `test-${Date.now()}-${Math.random()}`,
    table: 'shifts',
    operation: 'upsert',
    data: { id: 'shift-1', title: 'Night Shift' },
    timestamp: new Date().toISOString(),
    retries: 0,
    ...overrides,
  };
}

// ── Setup / Teardown ─────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  // Default: empty queue, no last synced
  mockedGetItem.mockResolvedValue(null);
  mockedSetItem.mockResolvedValue(undefined);
  mockSupabaseSuccess();
});

// ── queueWrite ───────────────────────────────────────────────────────

describe('queueWrite', () => {
  it('adds an entry to the queue in AsyncStorage', async () => {
    // Start with empty queue
    mockedGetItem.mockResolvedValue(null);

    await queueWrite('shifts', 'upsert', { id: 'shift-1', title: 'Night Shift' });

    // Should have written to AsyncStorage
    expect(mockedSetItem).toHaveBeenCalledWith(
      SYNC_QUEUE_KEY,
      expect.any(String),
    );

    const written = getWrittenQueue();
    expect(written).toHaveLength(1);
    expect(written[0].table).toBe('shifts');
    expect(written[0].operation).toBe('upsert');
    expect(written[0].data).toEqual({ id: 'shift-1', title: 'Night Shift' });
    expect(written[0].retries).toBe(0);
  });

  it('appends to an existing queue', async () => {
    const existing = [makeEntry({ id: 'existing-1' })];
    mockQueue(existing);

    await queueWrite('personal_events', 'upsert', { id: 'event-1', name: 'Gym' });

    const written = getWrittenQueue();
    expect(written).toHaveLength(2);
    expect(written[0].id).toBe('existing-1');
    expect(written[1].table).toBe('personal_events');
  });
});

// ── flushQueue ───────────────────────────────────────────────────────

describe('flushQueue', () => {
  it('processes entries and removes successful ones', async () => {
    const entries = [makeEntry({ id: 'e1' }), makeEntry({ id: 'e2' })];
    mockQueue(entries);
    mockSupabaseSuccess();

    const result = await flushQueue();

    expect(result.flushed).toBe(2);
    expect(result.failed).toBe(0);

    // Queue should be empty after successful flush
    const written = getWrittenQueue();
    expect(written).toHaveLength(0);
  });

  it('returns early with zero counts for empty queue', async () => {
    mockQueue([]);

    const result = await flushQueue();

    expect(result.flushed).toBe(0);
    expect(result.failed).toBe(0);
  });

  it('retries failed entries up to MAX_RETRIES then drops them', async () => {
    // Entry already at 2 retries (one more failure should hit max of 3 and drop)
    const entry = makeEntry({ id: 'fail-entry', retries: 2 });
    mockQueue([entry]);
    mockSupabaseError('server error');

    const result = await flushQueue();

    expect(result.flushed).toBe(0);
    // Entry exceeded MAX_RETRIES (3), so it's dropped — remaining is 0
    expect(result.failed).toBe(0);
    const written = getWrittenQueue();
    expect(written).toHaveLength(0);
  });

  it('keeps entries under retry limit in the queue', async () => {
    // Entry at 0 retries — after failure will be at 1, still under MAX_RETRIES
    const entry = makeEntry({ id: 'retry-entry', retries: 0 });
    mockQueue([entry]);
    mockSupabaseError('timeout');

    const result = await flushQueue();

    expect(result.flushed).toBe(0);
    expect(result.failed).toBe(1);

    const written = getWrittenQueue();
    expect(written).toHaveLength(1);
    expect(written[0].retries).toBe(1);
  });
});

// ── hasPendingWrites ─────────────────────────────────────────────────

describe('hasPendingWrites', () => {
  it('returns true when queue has entries', async () => {
    mockQueue([makeEntry()]);

    const result = await hasPendingWrites();
    expect(result).toBe(true);
  });

  it('returns false when queue is empty', async () => {
    mockQueue([]);

    const result = await hasPendingWrites();
    expect(result).toBe(false);
  });
});

// ── getSyncStatus ────────────────────────────────────────────────────

describe('getSyncStatus', () => {
  it('returns correct pending count', async () => {
    const entries = [makeEntry(), makeEntry(), makeEntry()];
    mockedGetItem.mockImplementation(async (key: string) => {
      if (key === SYNC_QUEUE_KEY) return JSON.stringify(entries);
      if (key === LAST_SYNCED_KEY) return null;
      return null;
    });

    const status = await getSyncStatus();

    expect(status.pendingCount).toBe(3);
    expect(status.isSyncing).toBe(false);
  });

  it('returns last synced time from AsyncStorage', async () => {
    const syncedAt = '2026-03-15T12:00:00.000Z';
    mockedGetItem.mockImplementation(async (key: string) => {
      if (key === SYNC_QUEUE_KEY) return JSON.stringify([]);
      if (key === LAST_SYNCED_KEY) return syncedAt;
      return null;
    });

    const status = await getSyncStatus();

    expect(status.pendingCount).toBe(0);
    expect(status.lastSyncedAt).toBe(syncedAt);
  });

  it('returns null for lastSyncedAt when never synced', async () => {
    mockedGetItem.mockResolvedValue(null);

    const status = await getSyncStatus();

    expect(status.lastSyncedAt).toBeNull();
  });
});
