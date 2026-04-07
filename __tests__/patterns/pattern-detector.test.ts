import { detectPatterns } from '../../src/lib/patterns/pattern-detector';
import type { SleepDiscrepancy } from '../../src/lib/feedback/types';
import type { ShiftEvent } from '../../src/lib/circadian/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeShift(
  id: string,
  startStr: string,
  endStr: string,
  shiftType: ShiftEvent['shiftType'] = 'night',
): ShiftEvent {
  return { id, title: `Shift ${id}`, start: new Date(startStr), end: new Date(endStr), shiftType };
}

function makeDiscrepancy(
  dateISO: string,
  startDeltaMin: number,
  actualDurationHours = 7,
  plannedDurationHours = 7.5,
): SleepDiscrepancy {
  const plannedStart = new Date(`${dateISO}T23:00:00`);
  const actualStart = new Date(plannedStart.getTime() + startDeltaMin * 60 * 1000);
  return {
    dateISO,
    planned: { start: plannedStart.toISOString(), end: new Date(plannedStart.getTime() + plannedDurationHours * 3600 * 1000).toISOString(), durationHours: plannedDurationHours },
    actual: { start: actualStart.toISOString(), end: new Date(actualStart.getTime() + actualDurationHours * 3600 * 1000).toISOString(), durationHours: actualDurationHours },
    delta: { startMinutes: startDeltaMin, endMinutes: startDeltaMin, durationMinutes: (actualDurationHours - plannedDurationHours) * 60 },
    source: 'healthkit',
    watchWorn: true,
  };
}

function makeDebt(dateISO: string, hours: number): { dateISO: string; hours: number } {
  return { dateISO, hours };
}

// Generate a date range of ISO strings
function dateRange(startISO: string, days: number): string[] {
  const result: string[] = [];
  const start = new Date(startISO);
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('detectPatterns — consecutive-night-impact', () => {
  it('detects when 3+ consecutive nights are followed by debt spike', () => {
    const shifts = [
      makeShift('n1', '2026-04-01T19:00:00', '2026-04-02T07:00:00', 'night'),
      makeShift('n2', '2026-04-02T19:00:00', '2026-04-03T07:00:00', 'night'),
      makeShift('n3', '2026-04-03T19:00:00', '2026-04-04T07:00:00', 'night'),
    ];
    const debtHistory = [
      makeDebt('2026-04-04', 3.5), // spike after nights
    ];
    const patterns = detectPatterns([], shifts, debtHistory);
    const p = patterns.find((x) => x.type === 'consecutive-night-impact');
    expect(p).toBeDefined();
    expect(p!.severity).toBe('warning');
    expect(p!.metadata.nightCount).toBe(3);
  });

  it('detects critical severity when 5+ consecutive nights', () => {
    const shifts = [
      makeShift('n1', '2026-04-01T19:00:00', '2026-04-02T07:00:00', 'night'),
      makeShift('n2', '2026-04-02T19:00:00', '2026-04-03T07:00:00', 'night'),
      makeShift('n3', '2026-04-03T19:00:00', '2026-04-04T07:00:00', 'night'),
      makeShift('n4', '2026-04-04T19:00:00', '2026-04-05T07:00:00', 'night'),
      makeShift('n5', '2026-04-05T19:00:00', '2026-04-06T07:00:00', 'night'),
    ];
    const debtHistory = [makeDebt('2026-04-06', 4.5)];
    const patterns = detectPatterns([], shifts, debtHistory);
    const p = patterns.find((x) => x.type === 'consecutive-night-impact');
    expect(p!.severity).toBe('critical');
    expect(p!.metadata.nightCount).toBe(5);
  });

  it('does not detect when < 3 consecutive nights', () => {
    const shifts = [
      makeShift('n1', '2026-04-01T19:00:00', '2026-04-02T07:00:00', 'night'),
      makeShift('n2', '2026-04-02T19:00:00', '2026-04-03T07:00:00', 'night'),
    ];
    const debtHistory = [makeDebt('2026-04-03', 3.5)];
    const patterns = detectPatterns([], shifts, debtHistory);
    const p = patterns.find((x) => x.type === 'consecutive-night-impact');
    expect(p).toBeUndefined();
  });

  it('does not detect when post-run debt is low (< 2h)', () => {
    const shifts = [
      makeShift('n1', '2026-04-01T19:00:00', '2026-04-02T07:00:00', 'night'),
      makeShift('n2', '2026-04-02T19:00:00', '2026-04-03T07:00:00', 'night'),
      makeShift('n3', '2026-04-03T19:00:00', '2026-04-04T07:00:00', 'night'),
    ];
    const debtHistory = [makeDebt('2026-04-04', 1.0)];
    const patterns = detectPatterns([], shifts, debtHistory);
    const p = patterns.find((x) => x.type === 'consecutive-night-impact');
    expect(p).toBeUndefined();
  });
});

describe('detectPatterns — debt trend (rising/improving)', () => {
  it('detects debt-trend-rising when second-week avg is higher by > 0.5h', () => {
    const dates = dateRange('2026-03-24', 14);
    const debtHistory = [
      ...dates.slice(0, 7).map((d) => makeDebt(d, 1.0)),
      ...dates.slice(7).map((d) => makeDebt(d, 2.5)), // worsening by 1.5h
    ];
    const patterns = detectPatterns([], [], debtHistory);
    const p = patterns.find((x) => x.type === 'debt-trend-rising');
    expect(p).toBeDefined();
    expect(p!.message).toContain('worsening');
    expect(p!.metadata.direction).toBe('rising');
  });

  it('detects debt-trend-improving when second-week avg is lower', () => {
    const dates = dateRange('2026-03-24', 14);
    const debtHistory = [
      ...dates.slice(0, 7).map((d) => makeDebt(d, 3.0)),
      ...dates.slice(7).map((d) => makeDebt(d, 1.5)), // improving
    ];
    const patterns = detectPatterns([], [], debtHistory);
    const p = patterns.find((x) => x.type === 'debt-trend-improving');
    expect(p).toBeDefined();
    expect(p!.severity).toBe('info');
    expect(p!.message).toContain('improving');
    expect(p!.metadata.direction).toBe('improving');
  });

  it('does not trigger trend when variation < 0.5h per week', () => {
    const dates = dateRange('2026-03-24', 14);
    // Stable low debt — delta < 0.5h and avg < 3h
    const debtHistory = dates.map((d) => makeDebt(d, 1.0));
    const patterns = detectPatterns([], [], debtHistory);
    const rising = patterns.find((x) => x.type === 'debt-trend-rising');
    const improving = patterns.find((x) => x.type === 'debt-trend-improving');
    expect(rising).toBeUndefined();
    expect(improving).toBeUndefined();
  });

  it('reports stable high debt as warning via recovery-debt-trend', () => {
    const dates = dateRange('2026-03-24', 14);
    const debtHistory = dates.map((d) => makeDebt(d, 3.5));
    const patterns = detectPatterns([], [], debtHistory);
    const p = patterns.find((x) => x.type === 'recovery-debt-trend');
    expect(p).toBeDefined();
    expect(p!.severity).toBe('warning');
    expect(p!.message).toContain('debt');
  });

  it('returns nothing when fewer than 14 debt records', () => {
    const debtHistory = [makeDebt('2026-04-01', 2.0)];
    const patterns = detectPatterns([], [], debtHistory);
    const p = patterns.find((x) => x.type === 'recovery-debt-trend');
    expect(p).toBeUndefined();
  });
});

describe('detectPatterns — weekend-compensation', () => {
  it('detects when off-day sleep is 90+ min more than work-day sleep', () => {
    // Work days with 6h sleep, off days with 7.5h sleep (diff = 1.5h = 90 min exactly)
    const shifts = [
      makeShift('d1', '2026-04-07T07:00:00', '2026-04-07T15:00:00', 'day'),
      makeShift('d2', '2026-04-08T07:00:00', '2026-04-08T15:00:00', 'day'),
      makeShift('d3', '2026-04-09T07:00:00', '2026-04-09T15:00:00', 'day'),
      makeShift('d4', '2026-04-12T07:00:00', '2026-04-12T15:00:00', 'day'),
      makeShift('d5', '2026-04-13T07:00:00', '2026-04-13T15:00:00', 'day'),
    ];
    const discrepancyHistory = [
      makeDiscrepancy('2026-04-07', 0, 6),
      makeDiscrepancy('2026-04-08', 0, 6),
      makeDiscrepancy('2026-04-09', 0, 6),
      makeDiscrepancy('2026-04-10', 0, 7.5), // off day
      makeDiscrepancy('2026-04-11', 0, 7.5), // off day
      makeDiscrepancy('2026-04-12', 0, 6),
      makeDiscrepancy('2026-04-13', 0, 6),
    ];
    const patterns = detectPatterns(discrepancyHistory, shifts, []);
    const p = patterns.find((x) => x.type === 'weekend-compensation');
    expect(p).toBeDefined();
    expect(p!.severity).toBe('warning');
    expect(p!.metadata.excessMinutes).toBeGreaterThanOrEqual(90);
  });

  it('detects critical severity when off-day excess >= 120 min', () => {
    const shifts = [
      makeShift('d1', '2026-04-07T07:00:00', '2026-04-07T15:00:00', 'day'),
      makeShift('d2', '2026-04-08T07:00:00', '2026-04-08T15:00:00', 'day'),
      makeShift('d3', '2026-04-09T07:00:00', '2026-04-09T15:00:00', 'day'),
      makeShift('d4', '2026-04-12T07:00:00', '2026-04-12T15:00:00', 'day'),
      makeShift('d5', '2026-04-13T07:00:00', '2026-04-13T15:00:00', 'day'),
    ];
    // Off days: 9h sleep, work days: 6h sleep — diff = 3h = 180 min → critical
    const discrepancyHistory = [
      makeDiscrepancy('2026-04-07', 0, 6),
      makeDiscrepancy('2026-04-08', 0, 6),
      makeDiscrepancy('2026-04-09', 0, 6),
      makeDiscrepancy('2026-04-10', 0, 9), // off day
      makeDiscrepancy('2026-04-11', 0, 9), // off day
      makeDiscrepancy('2026-04-12', 0, 6),
      makeDiscrepancy('2026-04-13', 0, 6),
    ];
    const patterns = detectPatterns(discrepancyHistory, shifts, []);
    const p = patterns.find((x) => x.type === 'weekend-compensation');
    expect(p).toBeDefined();
    expect(p!.severity).toBe('critical');
  });

  it('does not detect when off-day sleep difference is < 90 min', () => {
    const shifts = [
      makeShift('d1', '2026-04-07T07:00:00', '2026-04-07T15:00:00', 'day'),
      makeShift('d2', '2026-04-08T07:00:00', '2026-04-08T15:00:00', 'day'),
      makeShift('d3', '2026-04-09T07:00:00', '2026-04-09T15:00:00', 'day'),
      makeShift('d4', '2026-04-12T07:00:00', '2026-04-12T15:00:00', 'day'),
      makeShift('d5', '2026-04-13T07:00:00', '2026-04-13T15:00:00', 'day'),
    ];
    // Work days: 7h sleep. Off days: 8h sleep. Diff = 1h = 60 min < 90 min → no pattern
    const discrepancyHistory = [
      makeDiscrepancy('2026-04-07', 0, 7),
      makeDiscrepancy('2026-04-08', 0, 7),
      makeDiscrepancy('2026-04-09', 0, 7),
      makeDiscrepancy('2026-04-10', 0, 8), // off day
      makeDiscrepancy('2026-04-11', 0, 8), // off day
      makeDiscrepancy('2026-04-12', 0, 7),
      makeDiscrepancy('2026-04-13', 0, 7),
    ];
    const patterns = detectPatterns(discrepancyHistory, shifts, []);
    const p = patterns.find((x) => x.type === 'weekend-compensation');
    expect(p).toBeUndefined();
  });
});

describe('detectPatterns — chronic-late-sleep', () => {
  it('detects when avg start delta > 30 min for 2+ weeks', () => {
    const dates = dateRange('2026-03-24', 14);
    const discrepancyHistory = dates.map((d) => makeDiscrepancy(d, 45)); // 45 min late
    const patterns = detectPatterns(discrepancyHistory, [], []);
    const p = patterns.find((x) => x.type === 'chronic-late-sleep');
    expect(p).toBeDefined();
    expect(p!.severity).toBe('warning');
  });

  it('detects critical severity when avg delta > 60 min', () => {
    const dates = dateRange('2026-03-24', 14);
    const discrepancyHistory = dates.map((d) => makeDiscrepancy(d, 75));
    const patterns = detectPatterns(discrepancyHistory, [], []);
    const p = patterns.find((x) => x.type === 'chronic-late-sleep');
    expect(p!.severity).toBe('critical');
  });

  it('does not detect when avg delta <= 30 min', () => {
    const dates = dateRange('2026-03-24', 14);
    const discrepancyHistory = dates.map((d) => makeDiscrepancy(d, 20));
    const patterns = detectPatterns(discrepancyHistory, [], []);
    const p = patterns.find((x) => x.type === 'chronic-late-sleep');
    expect(p).toBeUndefined();
  });

  it('does not detect with fewer than 14 records', () => {
    const discrepancyHistory = [makeDiscrepancy('2026-04-01', 45)];
    const patterns = detectPatterns(discrepancyHistory, [], []);
    const p = patterns.find((x) => x.type === 'chronic-late-sleep');
    expect(p).toBeUndefined();
  });
});

describe('detectPatterns — improving-adherence', () => {
  it('detects improving trend when discrepancy decreases over 2 weeks', () => {
    const firstWeek = dateRange('2026-03-24', 7).map((d) => makeDiscrepancy(d, 60)); // 60 min delta
    const secondWeek = dateRange('2026-03-31', 7).map((d) => makeDiscrepancy(d, 15)); // 15 min delta
    const discrepancyHistory = [...firstWeek, ...secondWeek];
    const patterns = detectPatterns(discrepancyHistory, [], []);
    const p = patterns.find((x) => x.type === 'improving-adherence');
    expect(p).toBeDefined();
    expect(p!.severity).toBe('info');
  });

  it('does not detect when improvement is < 10 min', () => {
    const firstWeek = dateRange('2026-03-24', 7).map((d) => makeDiscrepancy(d, 30));
    const secondWeek = dateRange('2026-03-31', 7).map((d) => makeDiscrepancy(d, 25));
    const discrepancyHistory = [...firstWeek, ...secondWeek];
    const patterns = detectPatterns(discrepancyHistory, [], []);
    const p = patterns.find((x) => x.type === 'improving-adherence');
    expect(p).toBeUndefined();
  });
});

describe('detectPatterns — combined and data requirements', () => {
  it('returns empty array when no data', () => {
    const patterns = detectPatterns([], [], []);
    expect(patterns).toEqual([]);
  });

  it('returns empty array with insufficient data (< 14 days discrepancy + no shifts)', () => {
    const discrepancyHistory = [makeDiscrepancy('2026-04-01', 50)];
    const patterns = detectPatterns(discrepancyHistory, [], []);
    expect(patterns).toHaveLength(0);
  });

  it('can return multiple patterns simultaneously', () => {
    // Setup data that triggers both worsening debt trend and chronic late sleep
    const dates = dateRange('2026-03-24', 14);
    const discrepancyHistory = dates.map((d) => makeDiscrepancy(d, 45));
    const debtHistory = [
      ...dates.slice(0, 7).map((d) => makeDebt(d, 1.0)),
      ...dates.slice(7).map((d) => makeDebt(d, 2.5)),
    ];
    const patterns = detectPatterns(discrepancyHistory, [], debtHistory);
    expect(patterns.length).toBeGreaterThanOrEqual(2);
  });

  it('each pattern has required fields including id, windowStartISO, windowEndISO, metadata', () => {
    const dates = dateRange('2026-03-24', 14);
    const discrepancyHistory = dates.map((d) => makeDiscrepancy(d, 50));
    const patterns = detectPatterns(discrepancyHistory, [], []);
    for (const p of patterns) {
      expect(typeof p.id).toBe('string');
      expect(p.id.length).toBeGreaterThan(0);
      expect(typeof p.type).toBe('string');
      expect(['info', 'warning', 'critical']).toContain(p.severity);
      expect(typeof p.message).toBe('string');
      expect(typeof p.evidence).toBe('string');
      expect(typeof p.recommendation).toBe('string');
      expect(typeof p.detectedAt).toBe('string');
      expect(typeof p.windowStartISO).toBe('string');
      expect(typeof p.windowEndISO).toBe('string');
      expect(typeof p.metadata).toBe('object');
    }
  });

  it('returns results sorted by severity (critical first)', () => {
    // 5+ consecutive nights (critical) + chronic late sleep (warning) + improving-adherence (info)
    const shifts = [
      makeShift('n1', '2026-04-01T19:00:00', '2026-04-02T07:00:00', 'night'),
      makeShift('n2', '2026-04-02T19:00:00', '2026-04-03T07:00:00', 'night'),
      makeShift('n3', '2026-04-03T19:00:00', '2026-04-04T07:00:00', 'night'),
      makeShift('n4', '2026-04-04T19:00:00', '2026-04-05T07:00:00', 'night'),
      makeShift('n5', '2026-04-05T19:00:00', '2026-04-06T07:00:00', 'night'),
    ];
    const debtHistory = [makeDebt('2026-04-06', 5.0)];
    const dates = dateRange('2026-03-24', 14);
    const discrepancyHistory = dates.map((d) => makeDiscrepancy(d, 45));
    const patterns = detectPatterns(discrepancyHistory, shifts, debtHistory);
    if (patterns.length >= 2) {
      const severityOrder = ['critical', 'warning', 'info'];
      for (let i = 1; i < patterns.length; i++) {
        const prevOrder = severityOrder.indexOf(patterns[i - 1].severity);
        const currOrder = severityOrder.indexOf(patterns[i].severity);
        expect(prevOrder).toBeLessThanOrEqual(currOrder);
      }
    }
  });
});
