/**
 * feedback-tracker.ts
 *
 * Records and summarizes weekly brief feedback.
 * Feedback is stored in ai-store (persisted via AsyncStorage).
 *
 * Exports:
 *   recordBriefFeedback(briefId, rating) — upserts feedback for a brief
 *   getBriefFeedbackSummary()            — summary statistics across all feedbacks
 *   getFeedbackForBrief(briefId)         — single feedback lookup or null
 */

import { useAIStore } from '@/src/store/ai-store';
import type { BriefFeedback } from './types';

/**
 * Record or update feedback for a specific brief.
 * Upserts by briefId — calling twice for the same brief updates the rating.
 */
export function recordBriefFeedback(
  briefId: string,
  rating: 'positive' | 'negative',
): void {
  const feedback: BriefFeedback = {
    briefId,
    rating,
    recordedAtISO: new Date().toISOString(),
  };
  useAIStore.getState().addFeedback(feedback);
}

/**
 * Compute summary statistics over all recorded brief feedbacks.
 */
export function getBriefFeedbackSummary(): {
  totalFeedbacks: number;
  positiveRate: number;
  negativeRate: number;
} {
  const { feedbacks } = useAIStore.getState();
  const total = feedbacks.length;
  if (total === 0) {
    return { totalFeedbacks: 0, positiveRate: 0, negativeRate: 0 };
  }
  const positiveCount = feedbacks.filter((f) => f.rating === 'positive').length;
  const negativeCount = total - positiveCount;
  return {
    totalFeedbacks: total,
    positiveRate: positiveCount / total,
    negativeRate: negativeCount / total,
  };
}

/**
 * Look up the feedback for a specific brief by its ID.
 * Returns null if the user has not yet given feedback for this brief.
 */
export function getFeedbackForBrief(briefId: string): BriefFeedback | null {
  return useAIStore.getState().getFeedbackForBrief(briefId);
}
