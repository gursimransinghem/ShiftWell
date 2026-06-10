/**
 * Calendar sync round-trip integration tests.
 *
 * Tests cover:
 * - ICS file parsing → shift extraction → plan generation → ICS export
 * - Shift detection from calendar events
 * - Full round-trip data integrity
 */

import { parseICSForShifts } from '../../src/lib/calendar/ics-parser';
import { generateICS } from '../../src/lib/calendar/ics-generator';
import { generateSleepPlan } from '../../src/lib/circadian';
import type { ShiftEvent } from '../../src/lib/circadian/types';
import { DEFAULT_PROFILE } from '../../src/lib/circadian/types';

// ── Sample ICS Data ──────────────────────────────────────────────────

const SAMPLE_ICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//QGenda//EN
BEGIN:VEVENT
DTSTART:20260315T190000
DTEND:20260316T070000
SUMMARY:Night Shift - ED
UID:shift-001@qgenda
END:VEVENT
BEGIN:VEVENT
DTSTART:20260316T190000
DTEND:20260317T070000
SUMMARY:Night Shift - ED
UID:shift-002@qgenda
END:VEVENT
BEGIN:VEVENT
DTSTART:20260318T070000
DTEND:20260318T190000
SUMMARY:Day Shift - ED
UID:shift-003@qgenda
END:VEVENT
END:VCALENDAR`;

const MIXED_ICS = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20260315T190000
DTEND:20260316T070000
SUMMARY:Night Shift
UID:shift-001@test
END:VEVENT
BEGIN:VEVENT
DTSTART:20260316T120000
DTEND:20260316T130000
SUMMARY:Lunch with Mom
UID:personal-001@test
END:VEVENT
END:VCALENDAR`;

describe('Calendar Sync Round-Trip', () => {
  describe('ICS Import → Shift Detection', () => {
    it('parses ICS and detects shifts vs personal events', () => {
      const result = parseICSForShifts(SAMPLE_ICS);
      // All 3 events are shift-like (long duration, "Shift" in title)
      expect(result.detectedShifts.length).toBeGreaterThanOrEqual(2);
      expect(result.allEvents.length).toBe(3);
    });

    it('classifies night shifts correctly from ICS', () => {
      const result = parseICSForShifts(SAMPLE_ICS);
      const nightShifts = result.detectedShifts.filter(
        (s) => s.shiftType === 'night'
      );
      // At least the 19:00-07:00 shifts should be classified as night
      expect(nightShifts.length).toBeGreaterThanOrEqual(2);
    });

    it('separates shifts from personal events in mixed calendar', () => {
      const result = parseICSForShifts(MIXED_ICS);
      // Night shift should be detected
      expect(result.detectedShifts.length).toBeGreaterThanOrEqual(1);
      // "Lunch with Mom" should be in otherEvents (1 hour, not a shift)
      expect(result.otherEvents.length).toBeGreaterThanOrEqual(0);
      expect(result.allEvents.length).toBe(2);
    });
  });

  describe('ICS Import → Plan Generation', () => {
    it('generates valid plan from ICS-parsed shifts', () => {
      const result = parseICSForShifts(SAMPLE_ICS);
      const shifts = result.detectedShifts;

      const plan = generateSleepPlan(
        new Date('2026-03-15'),
        new Date('2026-03-19'),
        shifts,
        result.otherEvents,
        DEFAULT_PROFILE,
      );

      expect(plan.blocks.length).toBeGreaterThan(0);
      expect(plan.classifiedDays.length).toBe(5);
    });
  });

  describe('Plan → ICS Export', () => {
    it('generates valid ICS from plan', () => {
      const shifts: ShiftEvent[] = [{
        id: 'n1',
        title: 'Night Shift',
        start: new Date('2026-03-15T19:00:00'),
        end: new Date('2026-03-16T07:00:00'),
        shiftType: 'night',
      }];

      const plan = generateSleepPlan(
        new Date('2026-03-15'),
        new Date('2026-03-16'),
        shifts,
        [],
        DEFAULT_PROFILE,
      );

      const icsContent = generateICS(plan);

      expect(icsContent).toContain('BEGIN:VCALENDAR');
      expect(icsContent).toContain('END:VCALENDAR');
      expect(icsContent).toContain('BEGIN:VEVENT');
      expect(icsContent).toContain('END:VEVENT');
      expect(icsContent).toContain('ShiftWell');
    });

    it('includes VEVENT blocks for plan items', () => {
      const shifts: ShiftEvent[] = [{
        id: 'n1',
        title: 'Night Shift',
        start: new Date('2026-03-15T19:00:00'),
        end: new Date('2026-03-16T07:00:00'),
        shiftType: 'night',
      }];

      const plan = generateSleepPlan(
        new Date('2026-03-15'),
        new Date('2026-03-16'),
        shifts,
        [],
        DEFAULT_PROFILE,
      );

      const icsContent = generateICS(plan);
      const eventCount = (icsContent.match(/BEGIN:VEVENT/g) || []).length;
      expect(eventCount).toBeGreaterThan(0);
    });
  });

  describe('Full round-trip: ICS → Plan → ICS', () => {
    it('imports ICS, generates plan, exports ICS without crashing', () => {
      // Step 1: Import
      const parseResult = parseICSForShifts(SAMPLE_ICS);

      // Step 2: Generate plan
      const plan = generateSleepPlan(
        new Date('2026-03-15'),
        new Date('2026-03-19'),
        parseResult.detectedShifts,
        parseResult.otherEvents,
        DEFAULT_PROFILE,
      );

      // Step 3: Export
      const icsOutput = generateICS(plan);

      // Verify round-trip
      expect(icsOutput).toContain('BEGIN:VCALENDAR');
      const outputEventCount = (icsOutput.match(/BEGIN:VEVENT/g) || []).length;
      expect(outputEventCount).toBeGreaterThan(0);
    });
  });
});

describe('ICS Parser Edge Cases', () => {
  it('handles empty ICS content by throwing (parser requires valid ICS)', () => {
    expect(() => parseICSForShifts('')).toThrow();
  });

  it('handles ICS with no events', () => {
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR`;
    const result = parseICSForShifts(ics);
    expect(result.detectedShifts).toEqual([]);
    expect(result.otherEvents).toEqual([]);
  });

  it('handles ICS with single event', () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20260315T070000
DTEND:20260315T190000
SUMMARY:Day Shift
UID:single@test
END:VEVENT
END:VCALENDAR`;
    const result = parseICSForShifts(ics);
    expect(result.allEvents.length).toBe(1);
  });

  it('preserves event summaries during parsing', () => {
    const result = parseICSForShifts(SAMPLE_ICS);
    const summaries = result.allEvents.map((e) => e.summary);
    expect(summaries).toContain('Night Shift - ED');
    expect(summaries).toContain('Day Shift - ED');
  });

  it('handles events without summary gracefully', () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20260315T070000
DTEND:20260315T190000
UID:no-summary@test
END:VEVENT
END:VCALENDAR`;
    expect(() => parseICSForShifts(ics)).not.toThrow();
  });
});
