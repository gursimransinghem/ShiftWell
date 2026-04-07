/**
 * AI Feedback System — Phase 25 (Intelligence Polish)
 *
 * Simple thumbs up/down feedback on AI recommendations.
 * Stored in AsyncStorage as a JSON array, capped at 100 entries.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIFeedback {
  briefDateISO: string;
  recommendationId: string;
  rating: 'up' | 'down';
  timestamp: string;
}

export interface FeedbackRate {
  positive: number;
  negative: number;
  total: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'shiftwell:ai-feedback';
const MAX_ENTRIES = 100;

// ─── Private helpers ──────────────────────────────────────────────────────────

async function loadAll(): Promise<AIFeedback[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AIFeedback[];
  } catch {
    return [];
  }
}

async function saveAll(entries: AIFeedback[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Record a thumbs up/down rating for an AI recommendation.
 * If an entry for the same recommendationId already exists, it is replaced.
 * List is capped at MAX_ENTRIES (oldest removed first when over limit).
 */
export async function recordFeedback(feedback: AIFeedback): Promise<void> {
  const existing = await loadAll();

  // Replace if same recommendationId already rated
  const filtered = existing.filter((f) => f.recommendationId !== feedback.recommendationId);
  filtered.push(feedback);

  // Cap at MAX_ENTRIES
  const capped = filtered.slice(-MAX_ENTRIES);
  await saveAll(capped);
}

/**
 * Retrieve all stored feedback entries (oldest first).
 */
export async function getFeedbackHistory(): Promise<AIFeedback[]> {
  return loadAll();
}

/**
 * Compute the positive/negative/total breakdown from stored feedback.
 */
export async function getFeedbackRate(): Promise<FeedbackRate> {
  const all = await loadAll();
  const positive = all.filter((f) => f.rating === 'up').length;
  const negative = all.filter((f) => f.rating === 'down').length;
  return { positive, negative, total: all.length };
}
