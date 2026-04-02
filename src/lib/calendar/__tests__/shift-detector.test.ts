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

  test('Test 5: "Birthday Party" 7h returns >= 0.50 and < 0.80 (shift length, no keyword)', () => {
    const score = shiftConfidence('Birthday Party', 7);
    expect(score).toBeGreaterThanOrEqual(0.50);
    expect(score).toBeLessThan(0.80);
  });

  test('Test 6: "Doctor Appointment" 6h returns 0 (negative keyword penalizes)', () => {
    expect(shiftConfidence('Doctor Appointment', 6)).toBe(0);
  });
});

describe('shiftConfidence — isWorkCalendar override', () => {
  test('isWorkCalendar=true always returns 1.0 regardless of title/duration', () => {
    expect(shiftConfidence('Birthday Party', 2, { isWorkCalendar: true })).toBe(1.0);
    expect(shiftConfidence('Vacation', 24, { isWorkCalendar: true })).toBe(1.0);
    expect(shiftConfidence('Random', 1, { isWorkCalendar: true })).toBe(1.0);
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

  test('Test 8: events from a workCalendarId get confidence 1.0', () => {
    const result = separateShiftsFromPersonalWithConfidence(baseEvents, {
      workCalendarId: 'work-cal',
      eventCalendarIds: { 'evt-1': 'work-cal', 'evt-2': 'other-cal' },
    });
    expect(result.confidenceMap['evt-1']).toBe(1.0);
    expect(result.confidenceMap['evt-2']).toBe(0);
  });
});
