/**
 * Tests for ai-feedback — Phase 25 (Intelligence Polish)
 *
 * AF-01: recordFeedback stores a new feedback entry
 * AF-02: getFeedbackHistory returns all stored entries
 * AF-03: getFeedbackRate returns correct positive/negative/total counts
 * AF-04: recording same recommendationId replaces previous rating
 * AF-05: list is capped at 100 entries (oldest removed)
 * AF-06: getFeedbackHistory returns empty array when no data stored
 * AF-07: getFeedbackRate returns zeros when empty
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { recordFeedback, getFeedbackHistory, getFeedbackRate } from '../../src/lib/intelligence/ai-feedback';
import type { AIFeedback } from '../../src/lib/intelligence/ai-feedback';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFeedback(id: string, rating: 'up' | 'down' = 'up', date = '2026-04-01'): AIFeedback {
  return {
    briefDateISO: date,
    recommendationId: id,
    rating,
    timestamp: new Date().toISOString(),
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  // Clear AsyncStorage mock between tests
  (AsyncStorage as any).clear();
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ai-feedback', () => {
  // AF-06: empty
  it('AF-06: getFeedbackHistory returns empty array when nothing stored', async () => {
    const history = await getFeedbackHistory();
    expect(history).toEqual([]);
  });

  // AF-07: empty rate
  it('AF-07: getFeedbackRate returns zeros when empty', async () => {
    const rate = await getFeedbackRate();
    expect(rate).toEqual({ positive: 0, negative: 0, total: 0 });
  });

  // AF-01: store entry
  it('AF-01: recordFeedback stores a new feedback entry', async () => {
    await recordFeedback(makeFeedback('rec-1', 'up'));
    const history = await getFeedbackHistory();
    expect(history).toHaveLength(1);
    expect(history[0].recommendationId).toBe('rec-1');
    expect(history[0].rating).toBe('up');
  });

  // AF-02: retrieve all
  it('AF-02: getFeedbackHistory returns all stored entries', async () => {
    await recordFeedback(makeFeedback('rec-1', 'up'));
    await recordFeedback(makeFeedback('rec-2', 'down'));
    await recordFeedback(makeFeedback('rec-3', 'up'));
    const history = await getFeedbackHistory();
    expect(history).toHaveLength(3);
  });

  // AF-03: rate calculation
  it('AF-03: getFeedbackRate returns correct counts', async () => {
    await recordFeedback(makeFeedback('rec-1', 'up'));
    await recordFeedback(makeFeedback('rec-2', 'up'));
    await recordFeedback(makeFeedback('rec-3', 'down'));
    const rate = await getFeedbackRate();
    expect(rate.positive).toBe(2);
    expect(rate.negative).toBe(1);
    expect(rate.total).toBe(3);
  });

  // AF-04: replace on duplicate id
  it('AF-04: recording same recommendationId replaces previous rating', async () => {
    await recordFeedback(makeFeedback('rec-1', 'up'));
    await recordFeedback(makeFeedback('rec-1', 'down')); // flip to down
    const history = await getFeedbackHistory();
    expect(history).toHaveLength(1);
    expect(history[0].rating).toBe('down');
  });

  // AF-05: cap at 100 entries
  it('AF-05: list is capped at 100 entries (oldest removed)', async () => {
    // Record 105 entries with unique IDs
    for (let i = 0; i < 105; i++) {
      await recordFeedback(makeFeedback(`rec-${i}`, 'up'));
    }
    const history = await getFeedbackHistory();
    expect(history).toHaveLength(100);
    // Most recent 100 are kept (rec-5 through rec-104)
    expect(history[history.length - 1].recommendationId).toBe('rec-104');
    expect(history[0].recommendationId).toBe('rec-5');
  });
});
