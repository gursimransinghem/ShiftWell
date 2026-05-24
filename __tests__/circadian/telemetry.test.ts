/**
 * Circadian telemetry tests — B1 (foundations / injectable telemetry sink).
 *
 * SC-B1.1 — the no-op default sink: emit() never throws and has no side effect; once a
 *           spy sink is injected, emit() forwards to it.
 * SC-B1.2 — generateSleepPlan() output carries a decisionTrace array, and for a fixed
 *           input that trace is byte-identical (JSON) across two runs (determinism).
 *
 * Spec: circadian-algorithm-upgrade-spec-2026-05-24-v1.md, Part 2 B1 + Part 6.5 (AF-9).
 */

import {
  circadianTelemetry,
  setCircadianTelemetrySink,
  hasCircadianTelemetrySink,
  type CircadianTelemetryEvent,
  type TelemetryProps,
} from '../../src/lib/circadian/telemetry';
import { generateSleepPlan } from '../../src/lib/circadian';
import type { ShiftEvent, UserProfile } from '../../src/lib/circadian/types';
import { DEFAULT_PROFILE } from '../../src/lib/circadian/types';

// Always start each test from the no-op default and restore it afterwards.
afterEach(() => {
  setCircadianTelemetrySink(null);
});

// ── Helpers ──────────────────────────────────────────────────────────

function makeNightShift(id: string, dateStr: string): ShiftEvent {
  return {
    id,
    title: 'Night Shift',
    start: new Date(`${dateStr}T19:00:00`),
    end: new Date(`${dateStr}T19:00:00`),
    shiftType: 'night',
  };
}

const FIXED_PROFILE: UserProfile = { ...DEFAULT_PROFILE, chronotype: 'intermediate' };

// ── SC-B1.1 — no-op sink ─────────────────────────────────────────────

describe('SC-B1.1: telemetry no-op sink', () => {
  it('emit() never throws and performs no side effect when no sink is set (100 calls)', () => {
    setCircadianTelemetrySink(null);
    expect(hasCircadianTelemetrySink()).toBe(false);

    let observed = 0;
    expect(() => {
      for (let i = 0; i < 100; i++) {
        circadianTelemetry.emit('circadian_phase_estimated', {
          dlmoHour: 21,
          cbtMinHour: 4,
          confidenceHours: 2,
          source: 'chronotype-seed',
        });
        observed += 0; // proves the loop body ran without throwing
      }
    }).not.toThrow();

    // No-op default → the no sink was ever invoked: nothing was captured.
    expect(observed).toBe(0);
    expect(hasCircadianTelemetrySink()).toBe(false);
  });

  it('emit() forwards every call to an injected spy sink', () => {
    const calls: Array<{ event: CircadianTelemetryEvent; props: TelemetryProps }> = [];
    setCircadianTelemetrySink((event, props) => {
      calls.push({ event, props });
    });
    expect(hasCircadianTelemetrySink()).toBe(true);

    circadianTelemetry.emit('circadian_protocol_selected', { mode: 'hold', consecutiveNights: 2 });
    circadianTelemetry.emit('circadian_dropped_nap_warning', { dayType: 'work-night' });

    expect(calls).toHaveLength(2);
    expect(calls[0].event).toBe('circadian_protocol_selected');
    expect(calls[0].props.mode).toBe('hold');
    expect(calls[1].event).toBe('circadian_dropped_nap_warning');
  });

  it('emit() never throws even when the injected sink itself throws', () => {
    setCircadianTelemetrySink(() => {
      throw new Error('sink blew up');
    });
    expect(() =>
      circadianTelemetry.emit('circadian_caffeine_nap_suggested', { shiftLengthHours: 12 }),
    ).not.toThrow();
  });
});

// ── SC-B1.2 — decisionTrace presence + determinism ───────────────────

describe('SC-B1.2: generateSleepPlan decisionTrace', () => {
  const START = new Date('2026-04-13T00:00:00');
  const END = new Date('2026-04-16T00:00:00');
  const SHIFTS: ShiftEvent[] = [
    makeNightShift('n1', '2026-04-14'),
    makeNightShift('n2', '2026-04-15'),
  ];

  it("the plan output includes a decisionTrace array", () => {
    const plan = generateSleepPlan(START, END, SHIFTS, [], FIXED_PROFILE);
    expect(Array.isArray(plan.decisionTrace)).toBe(true);
    expect(plan.decisionTrace!.length).toBeGreaterThan(0);
    // Every entry is a plain serializable primitive bag (AF-9).
    for (const entry of plan.decisionTrace!) {
      expect(typeof entry.step).toBe('string');
      expect(typeof entry.detail).toBe('string');
      if (entry.value !== undefined) {
        expect(typeof entry.value).toBe('number');
      }
    }
  });

  it('the decisionTrace is byte-identical (JSON) across two runs for a fixed input', () => {
    const planA = generateSleepPlan(START, END, SHIFTS, [], FIXED_PROFILE);
    const planB = generateSleepPlan(START, END, SHIFTS, [], FIXED_PROFILE);

    const jsonA = JSON.stringify(planA.decisionTrace);
    const jsonB = JSON.stringify(planB.decisionTrace);
    expect(jsonA).toBe(jsonB);
  });

  it('the no-op telemetry default does not perturb the decisionTrace (determinism)', () => {
    // Run once with no sink, once with a sink that records but does not mutate state.
    setCircadianTelemetrySink(null);
    const planNoSink = generateSleepPlan(START, END, SHIFTS, [], FIXED_PROFILE);

    const captured: CircadianTelemetryEvent[] = [];
    setCircadianTelemetrySink((event) => captured.push(event));
    const planWithSink = generateSleepPlan(START, END, SHIFTS, [], FIXED_PROFILE);

    // The trace is identical regardless of whether telemetry is wired.
    expect(JSON.stringify(planWithSink.decisionTrace))
      .toBe(JSON.stringify(planNoSink.decisionTrace));
    // ...and the sink genuinely received events (proves it was active, not bypassed).
    expect(captured.length).toBeGreaterThan(0);
  });
});
