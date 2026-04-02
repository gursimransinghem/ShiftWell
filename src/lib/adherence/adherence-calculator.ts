/**
 * Pure adherence score formula for Recovery Score (non-HealthKit path).
 *
 * Three weighted signals:
 *   notification_delivered  → 40 pts  (user received the sleep reminder)
 *   night_sky_activated     → 35 pts  (user engaged the dim-down UI)
 *   sleep_block_intact      → 25 pts  (sleep block was not deleted/moved)
 *
 * No side effects. No React/RN imports.
 */

export type AdherenceEventType =
  | 'notification_delivered'
  | 'night_sky_activated'
  | 'sleep_block_intact';

export interface AdherenceEvent {
  type: AdherenceEventType;
  /** 'YYYY-MM-DD' — stored as string per persist rules (no Date objects) */
  dateISO: string;
}

/**
 * Compute adherence score for a given date.
 *
 * @param events        All recorded adherence events (may span multiple dates)
 * @param hasSleepBlockOnDate  Whether the user had a main-sleep block planned for this date
 * @param dateISO       The date to score, in 'YYYY-MM-DD' format
 * @returns             0-100 integer score, or null if no sleep block was planned (no-shift day)
 */
export function computeAdherenceScore(
  events: AdherenceEvent[],
  hasSleepBlockOnDate: boolean,
  dateISO: string,
): number | null {
  // No main-sleep block planned → null (not a scored night, distinct from a zero)
  if (!hasSleepBlockOnDate) return null;

  const dayEvents = events.filter((e) => e.dateISO === dateISO);

  // Deduplicate by type — multiple events of the same type do not double-count
  const types = new Set(dayEvents.map((e) => e.type));

  let score = 0;
  if (types.has('notification_delivered')) score += 40;
  if (types.has('night_sky_activated')) score += 35;
  if (types.has('sleep_block_intact')) score += 25;
  return score;
}
