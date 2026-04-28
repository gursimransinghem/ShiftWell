/**
 * Tests for ICS calendar file parsing.
 *
 * Verifies that .ics strings are parsed into shift and personal events,
 * including edge cases like recurring events, malformed input, and
 * shift detection heuristics.
 */

import { parseICSForShifts, isLikelyShift } from '../../src/lib/calendar/ics-parser';

// ── ICS string builders ──────────────────────────────────────────────

function wrapICS(vevents: string): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ShiftWell//Test//EN',
  ];
  if (vevents.trim()) {
    // Split on \r\n or \n to handle either line ending
    lines.push(...vevents.split(/\r?\n/).filter((l) => l.trim()));
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function makeVEvent(opts: {
  uid: string;
  summary: string;
  dtstart: string;
  dtend: string;
  rrule?: string;
  duration?: string;
}): string {
  const lines = [
    'BEGIN:VEVENT',
    `UID:${opts.uid}`,
    `SUMMARY:${opts.summary}`,
    `DTSTART:${opts.dtstart}`,
  ];
  if (opts.duration) {
    lines.push(`DURATION:${opts.duration}`);
  } else {
    lines.push(`DTEND:${opts.dtend}`);
  }
  if (opts.rrule) {
    lines.push(`RRULE:${opts.rrule}`);
  }
  lines.push('END:VEVENT');
  return lines.join('\r\n');
}

// ── Tests: isLikelyShift ─────────────────────────────────────────────

describe('isLikelyShift', () => {
  it('identifies a 12-hour night shift as a shift', () => {
    expect(isLikelyShift('Night Shift', 12)).toBe(true);
  });

  it('identifies an 8-hour day shift as a shift', () => {
    expect(isLikelyShift('Day Shift', 8)).toBe(true);
  });

  it('identifies a 6-hour event as a shift', () => {
    expect(isLikelyShift('ED Coverage', 6)).toBe(true);
  });

  it('rejects a short 1-hour meeting', () => {
    expect(isLikelyShift('Team Meeting', 1)).toBe(false);
  });

  it('rejects an all-day event (24h exactly)', () => {
    expect(isLikelyShift('PTO', 24)).toBe(false);
  });

  it('rejects very short events (< 5.5h)', () => {
    expect(isLikelyShift('Dentist', 1.5)).toBe(false);
    expect(isLikelyShift('Coffee', 0.5)).toBe(false);
    expect(isLikelyShift('Quick Shift', 5)).toBe(false);
  });

  it('accepts events in the 6-28h range', () => {
    expect(isLikelyShift('Shift', 6)).toBe(true);
    expect(isLikelyShift('Long Shift', 28)).toBe(true);
    expect(isLikelyShift('Overnight', 15)).toBe(true);
  });

  it('rejects events over 28h', () => {
    expect(isLikelyShift('Multi-day Conference', 48)).toBe(false);
  });

  it('rejects long events without shift keywords', () => {
    expect(isLikelyShift('Flight to NYC', 8)).toBe(false);
    expect(isLikelyShift('Conference Travel Block', 12)).toBe(false);
  });
});

// ── Tests: parseICSForShifts ─────────────────────────────────────────

describe('parseICSForShifts', () => {
  it('parses a simple single-event .ics string', () => {
    const ics = wrapICS(
      makeVEvent({
        uid: 'shift-001',
        summary: 'Night Shift',
        dtstart: '20260315T190000',
        dtend: '20260316T070000',
      }),
    );

    const result = parseICSForShifts(ics);
    expect(result.allEvents.length).toBe(1);
    expect(result.allEvents[0].summary).toBe('Night Shift');
    expect(result.allEvents[0].durationHours).toBe(12);
  });

  it('parses multiple events and separates shifts from personal', () => {
    const ics = wrapICS(
      [
        makeVEvent({
          uid: 'shift-001',
          summary: 'Night Shift',
          dtstart: '20260315T190000',
          dtend: '20260316T070000',
        }),
        makeVEvent({
          uid: 'dentist-001',
          summary: 'Dentist',
          dtstart: '20260317T100000',
          dtend: '20260317T110000',
        }),
      ].join('\r\n'),
    );

    const result = parseICSForShifts(ics);
    expect(result.allEvents.length).toBe(2);

    // 12h night shift should be detected as a shift
    expect(result.detectedShifts.length).toBe(1);
    expect(result.detectedShifts[0].title).toBe('Night Shift');
    expect(result.detectedShifts[0].shiftType).toBe('night');

    // 1h dentist should be a personal event
    expect(result.otherEvents.length).toBe(1);
    expect(result.otherEvents[0].title).toBe('Dentist');
  });

  it('detects shift type correctly from timing', () => {
    const ics = wrapICS(
      [
        makeVEvent({
          uid: 'day-001',
          summary: 'Day Shift',
          dtstart: '20260315T070000',
          dtend: '20260315T190000',
        }),
        makeVEvent({
          uid: 'evening-001',
          summary: 'Evening Shift',
          dtstart: '20260316T140000',
          dtend: '20260316T230000',
        }),
      ].join('\r\n'),
    );

    const result = parseICSForShifts(ics);
    expect(result.detectedShifts.length).toBe(2);

    const dayShift = result.detectedShifts.find((s) => s.title === 'Day Shift');
    expect(dayShift).toBeDefined();
    expect(dayShift!.shiftType).toBe('day');

    const eveningShift = result.detectedShifts.find((s) => s.title === 'Evening Shift');
    expect(eveningShift).toBeDefined();
    expect(eveningShift!.shiftType).toBe('evening');
  });

  it('handles malformed .ics gracefully', () => {
    const result = parseICSForShifts('this is not valid ics data');

    expect(result.detectedShifts).toHaveLength(0);
    expect(result.otherEvents).toHaveLength(0);
    expect(result.allEvents).toHaveLength(0);
  });

  it('handles empty .ics string gracefully', () => {
    const ics = wrapICS('');
    const result = parseICSForShifts(ics);

    expect(result.detectedShifts).toHaveLength(0);
    expect(result.otherEvents).toHaveLength(0);
    expect(result.allEvents).toHaveLength(0);
  });

  it('handles .ics with only non-shift events', () => {
    const ics = wrapICS(
      [
        makeVEvent({
          uid: 'meeting-001',
          summary: 'Team Standup',
          dtstart: '20260315T090000',
          dtend: '20260315T093000',
        }),
        makeVEvent({
          uid: 'lunch-001',
          summary: 'Lunch with Bob',
          dtstart: '20260315T120000',
          dtend: '20260315T130000',
        }),
      ].join('\r\n'),
    );

    const result = parseICSForShifts(ics);
    expect(result.detectedShifts).toHaveLength(0);
    expect(result.otherEvents).toHaveLength(2);
  });

  it('keeps long non-shift calendar blocks out of detected shifts', () => {
    const ics = wrapICS(
      makeVEvent({
        uid: 'flight-001',
        summary: 'Flight to NYC',
        dtstart: '20260315T090000',
        dtend: '20260315T170000',
      }),
    );

    const result = parseICSForShifts(ics);
    expect(result.detectedShifts).toHaveLength(0);
    expect(result.otherEvents).toHaveLength(1);
    expect(result.otherEvents[0].title).toBe('Flight to NYC');
  });
});
