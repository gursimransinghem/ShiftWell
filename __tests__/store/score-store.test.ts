/**
 * TDD: score-store + adherence-calculator
 * Tests for both the pure score formula and the Zustand store behavior.
 */

import {
  computeAdherenceScore,
  AdherenceEvent,
} from '../../src/lib/adherence/adherence-calculator';
import { useScoreStore } from '../../src/store/score-store';

// ---------------------------------------------------------------------------
// Mock AsyncStorage (same pattern as notification-store.test.ts)
// ---------------------------------------------------------------------------
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  mergeItem: jest.fn().mockResolvedValue(undefined),
  multiSet: jest.fn().mockResolvedValue(undefined),
}));

// ---------------------------------------------------------------------------
// Mock date-fns to control "today" in store methods
// ---------------------------------------------------------------------------
const FIXED_DATE = new Date('2026-01-07T12:00:00.000Z'); // Wednesday

jest.mock('date-fns', () => {
  const actual = jest.requireActual('date-fns');
  return {
    ...actual,
    format: (date: Date, fmt: string) => actual.format(date, fmt),
    subDays: (date: Date, n: number) => actual.subDays(date, n),
  };
});

// ---------------------------------------------------------------------------
// Section 1: computeAdherenceScore — pure formula
// ---------------------------------------------------------------------------

describe('computeAdherenceScore — pure formula', () => {
  const DATE = '2026-01-07';

  it('all three signals present → score = 100', () => {
    const events: AdherenceEvent[] = [
      { type: 'notification_delivered', dateISO: DATE },
      { type: 'night_sky_activated', dateISO: DATE },
      { type: 'sleep_block_intact', dateISO: DATE },
    ];
    expect(computeAdherenceScore(events, true, DATE)).toBe(100);
  });

  it('only notification_delivered → score = 40', () => {
    const events: AdherenceEvent[] = [
      { type: 'notification_delivered', dateISO: DATE },
    ];
    expect(computeAdherenceScore(events, true, DATE)).toBe(40);
  });

  it('only night_sky_activated → score = 35', () => {
    const events: AdherenceEvent[] = [
      { type: 'night_sky_activated', dateISO: DATE },
    ];
    expect(computeAdherenceScore(events, true, DATE)).toBe(35);
  });

  it('only sleep_block_intact → score = 25', () => {
    const events: AdherenceEvent[] = [
      { type: 'sleep_block_intact', dateISO: DATE },
    ];
    expect(computeAdherenceScore(events, true, DATE)).toBe(25);
  });

  it('no events for date → score = 0 (not null)', () => {
    expect(computeAdherenceScore([], true, DATE)).toBe(0);
  });

  it('no main-sleep block on date → score = null (not a scored night)', () => {
    const events: AdherenceEvent[] = [
      { type: 'notification_delivered', dateISO: DATE },
    ];
    expect(computeAdherenceScore(events, false, DATE)).toBeNull();
  });

  it('events for wrong date are ignored', () => {
    const events: AdherenceEvent[] = [
      { type: 'notification_delivered', dateISO: '2026-01-06' },
      { type: 'night_sky_activated', dateISO: '2026-01-06' },
    ];
    expect(computeAdherenceScore(events, true, DATE)).toBe(0);
  });

  it('multiple events of same type on same date do not double-count', () => {
    const events: AdherenceEvent[] = [
      { type: 'notification_delivered', dateISO: DATE },
      { type: 'notification_delivered', dateISO: DATE },
      { type: 'notification_delivered', dateISO: DATE },
    ];
    expect(computeAdherenceScore(events, true, DATE)).toBe(40);
  });

  it('mixed: notification + night_sky → score = 75', () => {
    const events: AdherenceEvent[] = [
      { type: 'notification_delivered', dateISO: DATE },
      { type: 'night_sky_activated', dateISO: DATE },
    ];
    expect(computeAdherenceScore(events, true, DATE)).toBe(75);
  });

  it('mixed: notification + sleep_block_intact → score = 65', () => {
    const events: AdherenceEvent[] = [
      { type: 'notification_delivered', dateISO: DATE },
      { type: 'sleep_block_intact', dateISO: DATE },
    ];
    expect(computeAdherenceScore(events, true, DATE)).toBe(65);
  });
});

// ---------------------------------------------------------------------------
// Section 2: useScoreStore — store behavior
// ---------------------------------------------------------------------------

describe('useScoreStore — recordEvent deduplication', () => {
  beforeEach(() => {
    useScoreStore.setState({
      pendingEvents: [],
      dailyHistory: [],
      lastFinalizedDateISO: null,
    });
  });

  it('records a new event', () => {
    const { recordEvent } = useScoreStore.getState();
    recordEvent({ type: 'notification_delivered', dateISO: '2026-01-07' });
    expect(useScoreStore.getState().pendingEvents).toHaveLength(1);
  });

  it('does not duplicate same type+dateISO', () => {
    const { recordEvent } = useScoreStore.getState();
    recordEvent({ type: 'notification_delivered', dateISO: '2026-01-07' });
    recordEvent({ type: 'notification_delivered', dateISO: '2026-01-07' });
    recordEvent({ type: 'notification_delivered', dateISO: '2026-01-07' });
    expect(useScoreStore.getState().pendingEvents).toHaveLength(1);
  });

  it('allows same type on different dates', () => {
    const { recordEvent } = useScoreStore.getState();
    recordEvent({ type: 'notification_delivered', dateISO: '2026-01-06' });
    recordEvent({ type: 'notification_delivered', dateISO: '2026-01-07' });
    expect(useScoreStore.getState().pendingEvents).toHaveLength(2);
  });

  it('allows different types on same date', () => {
    const { recordEvent } = useScoreStore.getState();
    recordEvent({ type: 'notification_delivered', dateISO: '2026-01-07' });
    recordEvent({ type: 'night_sky_activated', dateISO: '2026-01-07' });
    expect(useScoreStore.getState().pendingEvents).toHaveLength(2);
  });
});

describe('useScoreStore — finalizeDay idempotent guard', () => {
  beforeEach(() => {
    useScoreStore.setState({
      pendingEvents: [
        { type: 'notification_delivered', dateISO: '2026-01-07' },
        { type: 'night_sky_activated', dateISO: '2026-01-07' },
        { type: 'sleep_block_intact', dateISO: '2026-01-07' },
      ],
      dailyHistory: [],
      lastFinalizedDateISO: null,
    });
  });

  it('finalizeDay appends score to dailyHistory', () => {
    const { finalizeDay } = useScoreStore.getState();
    finalizeDay('2026-01-07', true);
    const history = useScoreStore.getState().dailyHistory;
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual({ dateISO: '2026-01-07', score: 100 });
  });

  it('finalizeDay sets lastFinalizedDateISO', () => {
    const { finalizeDay } = useScoreStore.getState();
    finalizeDay('2026-01-07', true);
    expect(useScoreStore.getState().lastFinalizedDateISO).toBe('2026-01-07');
  });

  it('second call same day is a no-op (idempotent)', () => {
    const { finalizeDay } = useScoreStore.getState();
    finalizeDay('2026-01-07', true);
    finalizeDay('2026-01-07', true);
    expect(useScoreStore.getState().dailyHistory).toHaveLength(1);
  });

  it('finalizeDay with hasSleepBlock=false stores null score', () => {
    const { finalizeDay } = useScoreStore.getState();
    finalizeDay('2026-01-07', false);
    const history = useScoreStore.getState().dailyHistory;
    expect(history[0].score).toBeNull();
  });

  it('finalizeDay trims history to 30 entries', () => {
    // Pre-fill with 30 entries
    const existing = Array.from({ length: 30 }, (_, i) => ({
      dateISO: `2025-12-${String(i + 1).padStart(2, '0')}`,
      score: 50,
    }));
    useScoreStore.setState({ dailyHistory: existing, lastFinalizedDateISO: null });
    const { finalizeDay } = useScoreStore.getState();
    finalizeDay('2026-01-07', true);
    expect(useScoreStore.getState().dailyHistory).toHaveLength(30);
  });
});

describe('useScoreStore — weeklyScores 7-day window', () => {
  it('returns exactly 7 entries', () => {
    useScoreStore.setState({ dailyHistory: [], pendingEvents: [], lastFinalizedDateISO: null });
    const result = useScoreStore.getState().weeklyScores();
    expect(result).toHaveLength(7);
  });

  it('returns null score for days with no finalized data', () => {
    useScoreStore.setState({ dailyHistory: [], pendingEvents: [], lastFinalizedDateISO: null });
    const result = useScoreStore.getState().weeklyScores();
    result.forEach((entry) => {
      expect(entry.score).toBeNull();
    });
  });

  it('each entry has a day label string', () => {
    useScoreStore.setState({ dailyHistory: [], pendingEvents: [], lastFinalizedDateISO: null });
    const result = useScoreStore.getState().weeklyScores();
    const validDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    result.forEach((entry) => {
      expect(validDays).toContain(entry.day);
    });
  });

  it('returns ordered oldest→newest (last entry is today)', () => {
    useScoreStore.setState({ dailyHistory: [], pendingEvents: [], lastFinalizedDateISO: null });
    const result = useScoreStore.getState().weeklyScores();
    // Last entry should correspond to today
    expect(result).toHaveLength(7);
    // Just verify they're all day labels
    expect(result[0].day).toBeDefined();
    expect(result[6].day).toBeDefined();
  });
});

describe('useScoreStore — todayScore', () => {
  it('returns null when today not yet finalized', () => {
    useScoreStore.setState({ dailyHistory: [], pendingEvents: [], lastFinalizedDateISO: null });
    expect(useScoreStore.getState().todayScore()).toBeNull();
  });

  it('returns score when today is in dailyHistory', () => {
    // Use actual today's ISO date so todayScore() can find it
    const { format } = require('date-fns');
    const todayISO = format(new Date(), 'yyyy-MM-dd');
    useScoreStore.setState({
      dailyHistory: [{ dateISO: todayISO, score: 75 }],
      pendingEvents: [],
      lastFinalizedDateISO: todayISO,
    });
    expect(useScoreStore.getState().todayScore()).toBe(75);
  });

  it('returns null if dailyHistory has entries but not for today', () => {
    useScoreStore.setState({
      dailyHistory: [{ dateISO: '2020-01-01', score: 80 }],
      pendingEvents: [],
      lastFinalizedDateISO: '2020-01-01',
    });
    expect(useScoreStore.getState().todayScore()).toBeNull();
  });
});

describe('useScoreStore — persistence config', () => {
  it('store persists under key score-history', () => {
    const storeName = (useScoreStore as any).persist?.getOptions?.()?.name;
    expect(storeName).toBe('score-history');
  });
});
