// Mock for sync-engine — used in Jest tests to avoid requiring Supabase env vars
export const queueWrite = jest.fn().mockResolvedValue(undefined);
export const flushSyncQueue = jest.fn().mockResolvedValue(undefined);
export const processSyncQueue = jest.fn().mockResolvedValue(undefined);
