/**
 * Transparency Log — Phase 34 (30-Day Autopilot)
 *
 * Every autonomous change applied by autopilot is logged here with
 * a human-readable explanation. Stored alongside changeLog in plan-store.
 * Cap: 90 entries (oldest removed first).
 *
 * Users can review this log in Settings to understand what autopilot did.
 */

import type { AdaptiveChange } from './types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TransparencyEntry {
  dateISO: string;
  change: AdaptiveChange;
  autoApplied: boolean;
  reason: string;
  undoneAt?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_ENTRIES = 90;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Create a new TransparencyEntry for an autonomously applied change.
 * Caller is responsible for persisting this to the store.
 *
 * @param change  - The AdaptiveChange that was auto-applied
 * @param reason  - Human-readable explanation for why it was applied
 */
export function logAutonomousChange(change: AdaptiveChange, reason: string): TransparencyEntry {
  const dateISO = new Date().toISOString().split('T')[0];
  return {
    dateISO,
    change,
    autoApplied: true,
    reason,
  };
}

/**
 * Trim a transparency log to the max allowed entries.
 * Returns a new array with at most MAX_ENTRIES entries (oldest removed first).
 *
 * @param entries - Current log entries
 */
export function trimTransparencyLog(entries: TransparencyEntry[]): TransparencyEntry[] {
  if (entries.length <= MAX_ENTRIES) return entries;
  return entries.slice(-MAX_ENTRIES);
}
