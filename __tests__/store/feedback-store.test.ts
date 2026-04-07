/**
 * TDD: feedback-store
 *
 * Tests:
 * - FB-01: addDiscrepancy stores a record
 * - FB-02: addDiscrepancy deduplicates by dateISO (latest wins)
 * - FB-03: history is capped at 30 records
 * - FB-04: records are sorted oldest first
 * - FB-05: getRecentHistory returns the last N records
 * - FB-06: clearHistory empties records and updates lastUpdated
 * - FB-07: persist shape — only records and lastUpdated persisted
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SleepDiscrepancy } from '../../src/lib/feedback/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  mergeItem: jest.fn().mockResolvedValue(undefined),
  multiSet: jest.fn().mockResolvedValue(undefined),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRecord(dateISO: string, deltaStart = 0): SleepDiscrepancy {
  return {
    dateISO,
    planned: {
      start: new Date(`${dateISO}T22:00:00`).toISOString(),
      end: new Date(`${dateISO}T06:00:00`).toISOString(),
      durationHours: 8,
    },
    actual: {
      start: new Date(`${dateISO}T22:${String(deltaStart).padStart(2, '0')}:00`).toISOString(),
      end: new Date(`${dateISO}T06:${String(deltaStart).padStart(2, '0')}:00`).toISOString(),
      durationHours: 8,
    },
    delta: {
      startMinutes: deltaStart,
      endMinutes: deltaStart,
      durationMinutes: 0,
    },
    source: 'healthkit',
    watchWorn: true,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('feedback-store', () => {
  // Import the store fresh for each describe block
  let useFeedbackStore: typeof import('../../src/store/feedback-store').useFeedbackStore;

  beforeEach(() => {
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    useFeedbackStore = require('../../src/store/feedback-store').useFeedbackStore;
    useFeedbackStore.setState({ records: [], lastUpdated: null });
  });

  it('FB-01: addDiscrepancy stores a record', () => {
    const record = makeRecord('2026-04-05');
    useFeedbackStore.getState().addDiscrepancy(record);

    const { records } = useFeedbackStore.getState();
    expect(records).toHaveLength(1);
    expect(records[0].dateISO).toBe('2026-04-05');
  });

  it('FB-02: addDiscrepancy deduplicates by dateISO — latest wins', () => {
    const original = makeRecord('2026-04-05', 0);
    const updated = makeRecord('2026-04-05', 15);

    useFeedbackStore.getState().addDiscrepancy(original);
    useFeedbackStore.getState().addDiscrepancy(updated);

    const { records } = useFeedbackStore.getState();
    expect(records).toHaveLength(1);
    expect(records[0].delta!.startMinutes).toBe(15);
  });

  it('FB-03: history is capped at 30 records', () => {
    // Add 35 records with distinct dates
    for (let i = 0; i < 35; i++) {
      const month = String(Math.floor(i / 28) + 1).padStart(2, '0');
      const day = String((i % 28) + 1).padStart(2, '0');
      useFeedbackStore.getState().addDiscrepancy(makeRecord(`2026-${month}-${day}`));
    }

    const { records } = useFeedbackStore.getState();
    expect(records.length).toBeLessThanOrEqual(30);
  });

  it('FB-04: records are sorted oldest first', () => {
    useFeedbackStore.getState().addDiscrepancy(makeRecord('2026-04-07'));
    useFeedbackStore.getState().addDiscrepancy(makeRecord('2026-04-05'));
    useFeedbackStore.getState().addDiscrepancy(makeRecord('2026-04-06'));

    const { records } = useFeedbackStore.getState();
    expect(records[0].dateISO).toBe('2026-04-05');
    expect(records[1].dateISO).toBe('2026-04-06');
    expect(records[2].dateISO).toBe('2026-04-07');
  });

  it('FB-05: getRecentHistory returns the last N records', () => {
    for (let i = 1; i <= 10; i++) {
      useFeedbackStore.getState().addDiscrepancy(makeRecord(`2026-04-${String(i).padStart(2, '0')}`));
    }

    const recent = useFeedbackStore.getState().getRecentHistory(3);
    expect(recent).toHaveLength(3);
    // Should be the 3 most recent (last in sorted array)
    expect(recent[recent.length - 1].dateISO).toBe('2026-04-10');
  });

  it('FB-06: clearHistory empties records', () => {
    useFeedbackStore.getState().addDiscrepancy(makeRecord('2026-04-05'));
    useFeedbackStore.getState().clearHistory();

    const { records, lastUpdated } = useFeedbackStore.getState();
    expect(records).toHaveLength(0);
    expect(lastUpdated).not.toBeNull();
  });

  it('FB-07: lastUpdated is set after addDiscrepancy', () => {
    expect(useFeedbackStore.getState().lastUpdated).toBeNull();
    useFeedbackStore.getState().addDiscrepancy(makeRecord('2026-04-05'));
    expect(useFeedbackStore.getState().lastUpdated).not.toBeNull();
  });
});
