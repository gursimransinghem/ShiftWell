/**
 * Autopilot Mode — Phase 34 (30-Day Autopilot)
 *
 * After 30 days of continuous use, users can opt in to autopilot mode,
 * where small high-confidence plan changes are applied automatically
 * without manual approval via InsightCard.
 *
 * Auto-apply criteria:
 *   - magnitude < 45 min shift
 *   - confidence > 0.6 (from feedback engine)
 *
 * Changes that don't meet criteria still go through the normal InsightCard flow.
 */

import type { AdaptiveChange } from './types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AutopilotState {
  eligible: boolean;          // true when 30+ days tracked
  enabled: boolean;           // user opted in
  activeSince: string | null; // ISO date when enabled
  autonomousChanges: number;  // cumulative count of changes made without user review
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ELIGIBILITY_THRESHOLD_DAYS = 30;
const AUTO_APPLY_MAX_MAGNITUDE = 45;   // minutes
const AUTO_APPLY_MIN_CONFIDENCE = 0.6;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Determine whether a user has enough tracked days to unlock autopilot.
 *
 * @param daysTracked - From adaptiveContext.meta.daysTracked
 */
export function checkAutopilotEligibility(daysTracked: number): boolean {
  return daysTracked >= ELIGIBILITY_THRESHOLD_DAYS;
}

/**
 * Decide whether a given change should be applied automatically (silently)
 * without surfacing an InsightCard for manual approval.
 *
 * Returns false when autopilot is not eligible or not enabled.
 *
 * @param change          - The AdaptiveChange to evaluate
 * @param autopilotState  - Current autopilot state from the store
 * @param confidence      - Confidence score from the feedback engine (0–1).
 *                          Defaults to 0 (conservative) when not provided.
 */
export function shouldAutoApply(
  change: AdaptiveChange,
  autopilotState: AutopilotState,
  confidence = 0,
): boolean {
  if (!autopilotState.eligible) return false;
  if (!autopilotState.enabled) return false;
  if (change.magnitudeMinutes >= AUTO_APPLY_MAX_MAGNITUDE) return false;
  if (confidence <= AUTO_APPLY_MIN_CONFIDENCE) return false;
  return true;
}
