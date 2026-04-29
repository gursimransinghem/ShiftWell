/**
 * shift-detector.test.ts
 *
 * Tests for shiftConfidence() scoring and separateShiftsFromPersonalWithConfidence().
 */

import {
  shiftConfidence,
  separateShiftsFromPersonalWithConfidence,
} from '../shift-detector';

describe('shiftConfidence — keyword + duration scoring', () => {
  test('Test 1: "ER Night" 12h returns >= 0.90 (keyword + shift length)', () => {
    expect(shiftConfidence('ER Night', 12)).toBeGreaterThanOrEqual(0.90);
  });

  test('Test 2: "Meeting" 1h returns 0 (too short)', () => {
    expect(shiftConfidence('Meeting', 1)).toBe(0);
  });

  test('Test 3: "Vacation" 24h returns 0 (all-day event)', () => {
    expect(shiftConfidence('Vacation', 24)).toBe(0);
  });

  test('Test 4: "Coverage" 8h returns >= 0.90 (keyword match)', () => {
    expect(shiftConfidence('Coverage', 8)).toBeGreaterThanOrEqual(0.90);
  });

  test('Test 5: social events are rejected even when they are shift-length', () => {
    const score = shiftConfidence('Birthday Party', 7);
    expect(score).toBe(0);
  });

  test('Test 6: "Doctor Appointment" 6h returns 0 (negative keyword penalizes)', () => {
    expect(shiftConfidence('Doctor Appointment', 6)).toBe(0);
  });
});

describe('shiftConfidence — isWorkCalendar override', () => {
  test('isWorkCalendar=true boosts only plausible shift-length events', () => {
    expect(shiftConfidence('Random', 8, { isWorkCalendar: true })).toBe(0.79);
    expect(shiftConfidence('Birthday Party', 2, { isWorkCalendar: true })).toBe(0);
    expect(shiftConfidence('Vacation', 24, { isWorkCalendar: true })).toBe(0);
  });
});

describe('separateShiftsFromPersonalWithConfidence', () => {
  const baseEvents = [
    {
      id: 'evt-1',
      title: 'ER Night Shift',
      start: new Date('2026-04-01T19:00:00'),
      end: new Date('2026-04-02T07:00:00'), // 12h
    },
    {
      id: 'evt-2',
      title: 'Doctor Appointment',
      start: new Date('2026-04-02T10:00:00'),
      end: new Date('2026-04-02T10:30:00'), // 0.5h
    },
  ];

  test('Test 7: returns events with confidence field in confidenceMap', () => {
    const result = separateShiftsFromPersonalWithConfidence(baseEvents);
    expect(result.confidenceMap).toBeDefined();
    expect(typeof result.confidenceMap['evt-1']).toBe('number');
  });

  test('Test 8: workCalendarId preserves keyword confidence without forcing all events to 1.0', () => {
    const result = separateShiftsFromPersonalWithConfidence(baseEvents, {
      workCalendarId: 'work-cal',
      eventCalendarIds: { 'evt-1': 'work-cal', 'evt-2': 'other-cal' },
    });
    expect(result.confidenceMap['evt-1']).toBe(0.95);
    expect(result.confidenceMap['evt-2']).toBe(0);
  });

  test('work-calendar non-shift events stay personal below auto-add threshold', () => {
    const result = separateShiftsFromPersonalWithConfidence(
      [
        {
          id: 'evt-party',
          title: 'Birthday Party',
          start: new Date('2026-04-01T18:00:00'),
          end: new Date('2026-04-02T01:00:00'),
        },
      ],
      {
        workCalendarId: 'work-cal',
        eventCalendarIds: { 'evt-party': 'work-cal' },
      },
    );

    expect(result.confidenceMap['evt-party']).toBe(0);
    expect(result.shifts).toHaveLength(0);
    expect(result.personal).toHaveLength(1);
  });
});
