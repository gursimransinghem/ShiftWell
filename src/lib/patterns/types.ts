/**
 * Pattern Recognition Engine — shared types (Phase 23)
 *
 * These types are shared between pattern-detector.ts, alert-generator.ts,
 * and the pattern store. Importing from this file avoids circular dependencies.
 */

// ---------------------------------------------------------------------------
// Pattern taxonomy
// ---------------------------------------------------------------------------

export type PatternType =
  | 'consecutive-night-impact'
  | 'debt-trend-rising'
  | 'debt-trend-improving'
  | 'weekend-compensation'
  | 'chronic-late-sleep'
  | 'improving-adherence'
  | 'recovery-debt-trend';

export type PatternSeverity = 'info' | 'warning' | 'critical';

// ---------------------------------------------------------------------------
// DetectedPattern — output of pattern-detector.ts
// ---------------------------------------------------------------------------

export interface DetectedPattern {
  /** Unique identifier (UUID v4) for this detection instance */
  id: string;
  type: PatternType;
  severity: PatternSeverity;
  /** When this pattern was detected */
  detectedAt: string;
  /** ISO date string — start of the analysis window */
  windowStartISO: string;
  /** ISO date string — end of the analysis window */
  windowEndISO: string;
  /** Natural language description of the pattern */
  message: string;
  /** Data that supports the pattern detection */
  evidence: string;
  /** Actionable suggestion */
  recommendation: string;
  /** Pattern-specific numeric/string metadata */
  metadata: Record<string, number | string>;
}

// ---------------------------------------------------------------------------
// PatternAlert — output of alert-generator.ts
// ---------------------------------------------------------------------------

export interface PatternAlert {
  patternId: string;
  type: PatternType;
  severity: PatternSeverity;
  /** Natural language alert text (coach voice) */
  text: string;
  /** One actionable recommendation */
  recommendation: string;
  generatedAtISO: string;
  passedGuardrails: boolean;
  dismissed: boolean;
}
