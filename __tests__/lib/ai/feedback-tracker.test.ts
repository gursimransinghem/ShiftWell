/**
 * TDD tests for feedback-tracker.ts (25-01 RED phase)
 *
 * Tests:
 * 1. recordBriefFeedback stores a BriefFeedback record
 * 2. recordBriefFeedback with same briefId updates rating (upsert)
 * 3. getBriefFeedbackSummary returns { totalFeedbacks, positiveRate, negativeRate }
 * 4. positiveRate is 0.75 when 3 positive and 1 negative feedback exist
 * 5. getFeedbackForBrief(briefId) returns feedback or null
 */

import { useAIStore } from '@/src/store/ai-store';
import {
  recordBriefFeedback,
  getBriefFeedbackSummary,
  getFeedbackForBrief,
} from '@/src/lib/ai/feedback-tracker';

// Reset Zustand store between tests
beforeEach(() => {
  useAIStore.setState({ briefs: [], feedbacks: [], isGenerating: false, lastError: null });
});

describe('recordBriefFeedback', () => {
  it('stores a BriefFeedback record with rating=positive', () => {
    recordBriefFeedback('brief-001', 'positive');
    const feedback = getFeedbackForBrief('brief-001');
    expect(feedback).not.toBeNull();
    expect(feedback!.briefId).toBe('brief-001');
    expect(feedback!.rating).toBe('positive');
    expect(feedback!.recordedAtISO).toBeTruthy();
  });

  it('upserts — same briefId updates rating instead of duplicating', () => {
    recordBriefFeedback('brief-002', 'positive');
    recordBriefFeedback('brief-002', 'negative');
    const { feedbacks } = useAIStore.getState();
    const forBrief = feedbacks.filter((f) => f.briefId === 'brief-002');
    expect(forBrief).toHaveLength(1);
    expect(forBrief[0].rating).toBe('negative');
  });
});

describe('getBriefFeedbackSummary', () => {
  it('returns { totalFeedbacks, positiveRate, negativeRate } with empty store', () => {
    const summary = getBriefFeedbackSummary();
    expect(summary).toEqual({ totalFeedbacks: 0, positiveRate: 0, negativeRate: 0 });
  });

  it('returns positiveRate of 0.75 when 3 positive and 1 negative exist', () => {
    recordBriefFeedback('b1', 'positive');
    recordBriefFeedback('b2', 'positive');
    recordBriefFeedback('b3', 'positive');
    recordBriefFeedback('b4', 'negative');
    const summary = getBriefFeedbackSummary();
    expect(summary.totalFeedbacks).toBe(4);
    expect(summary.positiveRate).toBeCloseTo(0.75);
    expect(summary.negativeRate).toBeCloseTo(0.25);
  });
});

describe('getFeedbackForBrief', () => {
  it('returns null when no feedback exists for briefId', () => {
    const feedback = getFeedbackForBrief('nonexistent-id');
    expect(feedback).toBeNull();
  });

  it('returns the feedback when it exists', () => {
    recordBriefFeedback('brief-xyz', 'positive');
    const feedback = getFeedbackForBrief('brief-xyz');
    expect(feedback).not.toBeNull();
    expect(feedback!.briefId).toBe('brief-xyz');
  });
});
