/**
 * Circadian decision telemetry — injectable, no-op by default.
 *
 * The circadian algorithm is deterministic, local, offline and LLM-free (gap-analysis
 * audit M11 — a property this module must NOT regress). To make the new circadian
 * decisions observable ("silent telemetry hook on anything new") without breaking that
 * property, telemetry goes through an injectable sink:
 *
 *   - Default sink is `null` → `emit()` is a pure no-op. Tests and offline use stay
 *     deterministic and side-effect-free.
 *   - At app start, `PostHogBridge` injects a sink that forwards to `trackEvent()`.
 *
 * HARD RULES (A/B audit AF-9):
 *   - Event props are plain JSON primitives only — no Date objects.
 *   - Nothing in this module calls Date.now() / new Date(). Timestamps, if ever needed,
 *     are supplied by the caller. This keeps every caller verifiably clock-free.
 *   - emit() never throws into the planning pipeline.
 */

/** Telemetry event names for new circadian decisions. Mirror keys in analytics/events.ts. */
export type CircadianTelemetryEvent =
  | 'circadian_phase_estimated'
  | 'circadian_protocol_selected'
  | 'circadian_caffeine_nap_suggested'
  | 'circadian_dropped_nap_warning';

/** Strictly primitive props — no Date, no nested objects (AF-9 purity guard). */
export type TelemetryProps = Record<string, string | number | boolean | null>;

export type TelemetrySink = (event: CircadianTelemetryEvent, props: TelemetryProps) => void;

let _sink: TelemetrySink | null = null;

/** Inject the telemetry sink (called once by PostHogBridge at app start). */
export function setCircadianTelemetrySink(sink: TelemetrySink | null): void {
  _sink = sink;
}

/** True when a real sink is wired — exposed for tests. */
export function hasCircadianTelemetrySink(): boolean {
  return _sink !== null;
}

export const circadianTelemetry = {
  /** Emit a circadian decision event. No-op (and never throws) when no sink is set. */
  emit(event: CircadianTelemetryEvent, props: TelemetryProps): void {
    if (_sink === null) return;
    try {
      _sink(event, props);
    } catch {
      // Telemetry must never break the planning pipeline.
    }
  },
};

/**
 * A single inspectable decision step attached to the generated plan.
 * Primitives only — must be byte-stable across runs (AF-9). No Date objects.
 */
export interface DecisionTraceEntry {
  /** Short machine-readable step id, e.g. "transition.mode". */
  step: string;
  /** Human-readable detail. */
  detail: string;
  /** Optional numeric value (minutes, hours, count). */
  value?: number;
}
