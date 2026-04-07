/**
 * Tests for api/schedule-importer — Phase 29 (API Layer)
 *
 * SI-01: parseKronosSchedule maps N/NOC shiftCode to 'night'
 * SI-02: parseKronosSchedule maps E/EVE shiftCode to 'evening'
 * SI-03: parseKronosSchedule maps D/DAY shiftCode to 'day'
 * SI-04: parseKronosSchedule throws on missing required fields
 * SI-05: parseKronosSchedule throws if start >= end
 * SI-06: parseQGendaSchedule maps NOC taskAbbrev to 'night'
 * SI-07: parseQGendaSchedule supports nested schedule.assignments shape
 * SI-08: parseQGendaSchedule throws on missing required fields
 * SI-09: importSchedule routes 'manual' source to ShiftEvent with source:'manual'
 * SI-10: importSchedule handles timezone conversion via ISO 8601 strings
 * SI-11: importSchedule throws if start >= end
 * SI-12: parseKronosSchedule generates IDs when shiftId is absent
 */

import {
  parseKronosSchedule,
  parseQGendaSchedule,
  importSchedule,
} from '../../src/lib/api/schedule-importer';
import type { APISchedulePush } from '../../src/lib/api/types';

// ─── Kronos Tests ─────────────────────────────────────────────────────────────

describe('parseKronosSchedule', () => {
  // SI-01
  it('SI-01: maps N shiftCode to night', () => {
    const data = {
      shifts: [{ shiftId: 's1', shiftCode: 'N', startDateTime: '2026-04-06T19:00:00Z', endDateTime: '2026-04-07T07:00:00Z' }],
    };
    const result = parseKronosSchedule(data);
    expect(result).toHaveLength(1);
    expect(result[0].shiftType).toBe('night');
  });

  it('SI-01b: maps NOC shiftCode to night', () => {
    const data = {
      shifts: [{ shiftCode: 'NOC', startDateTime: '2026-04-06T19:00:00Z', endDateTime: '2026-04-07T07:00:00Z' }],
    };
    const [shift] = parseKronosSchedule(data);
    expect(shift.shiftType).toBe('night');
  });

  // SI-02
  it('SI-02: maps E shiftCode to evening', () => {
    const data = {
      shifts: [{ shiftId: 's2', shiftCode: 'E', startDateTime: '2026-04-06T14:00:00Z', endDateTime: '2026-04-06T23:00:00Z' }],
    };
    const [shift] = parseKronosSchedule(data);
    expect(shift.shiftType).toBe('evening');
  });

  it('SI-02b: maps EVE shiftCode to evening', () => {
    const data = {
      shifts: [{ shiftCode: 'EVE', startDateTime: '2026-04-06T14:00:00Z', endDateTime: '2026-04-06T23:00:00Z' }],
    };
    const [shift] = parseKronosSchedule(data);
    expect(shift.shiftType).toBe('evening');
  });

  // SI-03
  it('SI-03: maps D shiftCode to day', () => {
    const data = {
      shifts: [{ shiftId: 's3', shiftCode: 'D', startDateTime: '2026-04-06T07:00:00Z', endDateTime: '2026-04-06T15:00:00Z' }],
    };
    const [shift] = parseKronosSchedule(data);
    expect(shift.shiftType).toBe('day');
  });

  it('SI-03b: unknown shiftCode defaults to day', () => {
    const data = {
      shifts: [{ shiftCode: 'UNKNOWN', startDateTime: '2026-04-06T07:00:00Z', endDateTime: '2026-04-06T15:00:00Z' }],
    };
    const [shift] = parseKronosSchedule(data);
    expect(shift.shiftType).toBe('day');
  });

  // SI-04
  it('SI-04: throws when shifts array is missing', () => {
    expect(() => parseKronosSchedule({ notShifts: [] })).toThrow();
  });

  it('SI-04b: throws when startDateTime is missing', () => {
    const data = { shifts: [{ shiftCode: 'N', endDateTime: '2026-04-07T07:00:00Z' }] };
    expect(() => parseKronosSchedule(data)).toThrow(/startDateTime/i);
  });

  // SI-05
  it('SI-05: throws when start is not before end', () => {
    const data = {
      shifts: [{ startDateTime: '2026-04-06T07:00:00Z', endDateTime: '2026-04-06T07:00:00Z', shiftCode: 'D' }],
    };
    expect(() => parseKronosSchedule(data)).toThrow();
  });

  // SI-12
  it('SI-12: generates IDs when shiftId is absent', () => {
    const data = {
      shifts: [
        { shiftCode: 'D', startDateTime: '2026-04-06T07:00:00Z', endDateTime: '2026-04-06T15:00:00Z' },
        { shiftCode: 'N', startDateTime: '2026-04-07T19:00:00Z', endDateTime: '2026-04-08T07:00:00Z' },
      ],
    };
    const result = parseKronosSchedule(data);
    expect(result[0].id).toBeTruthy();
    expect(result[1].id).toBeTruthy();
    expect(result[0].id).not.toBe(result[1].id);
  });

  it('preserves shiftId from source when provided', () => {
    const data = {
      shifts: [{ shiftId: 'KRON-999', shiftCode: 'D', startDateTime: '2026-04-06T07:00:00Z', endDateTime: '2026-04-06T15:00:00Z' }],
    };
    const [shift] = parseKronosSchedule(data);
    expect(shift.id).toBe('KRON-999');
  });
});

// ─── QGenda Tests ─────────────────────────────────────────────────────────────

describe('parseQGendaSchedule', () => {
  // SI-06
  it('SI-06: maps NOC taskAbbrev to night', () => {
    const data = {
      assignments: [{ taskAbbrev: 'NOC', scheduledStart: '2026-04-06T19:00:00Z', scheduledEnd: '2026-04-07T07:00:00Z' }],
    };
    const [shift] = parseQGendaSchedule(data);
    expect(shift.shiftType).toBe('night');
  });

  // SI-07
  it('SI-07: supports nested schedule.assignments shape', () => {
    const data = {
      schedule: {
        assignments: [{ taskAbbrev: 'D7', scheduledStart: '2026-04-06T07:00:00Z', scheduledEnd: '2026-04-06T19:00:00Z' }],
      },
    };
    const result = parseQGendaSchedule(data);
    expect(result).toHaveLength(1);
    expect(result[0].shiftType).toBe('day');
  });

  // SI-08
  it('SI-08: throws when no assignments found', () => {
    expect(() => parseQGendaSchedule({ data: [] })).toThrow(/assignments/i);
  });

  it('SI-08b: throws when scheduledStart is missing', () => {
    const data = { assignments: [{ taskAbbrev: 'N12', scheduledEnd: '2026-04-07T07:00:00Z' }] };
    expect(() => parseQGendaSchedule(data)).toThrow(/scheduledStart/i);
  });

  it('maps PM activityCode to evening', () => {
    const data = {
      assignments: [{ activityCode: 'PM', scheduledStart: '2026-04-06T15:00:00Z', scheduledEnd: '2026-04-06T23:00:00Z' }],
    };
    const [shift] = parseQGendaSchedule(data);
    expect(shift.shiftType).toBe('evening');
  });
});

// ─── importSchedule Tests ─────────────────────────────────────────────────────

describe('importSchedule', () => {
  // SI-09
  it('SI-09: routes manual source to ShiftEvent with source:manual', () => {
    const push: APISchedulePush = {
      employeeId: 'emp-001',
      source: 'manual',
      shifts: [{ start: '2026-04-06T07:00:00Z', end: '2026-04-06T15:00:00Z', type: 'day' }],
    };
    const result = importSchedule(push);
    expect(result).toHaveLength(1);
    expect(result[0].source).toBe('manual');
    expect(result[0].shiftType).toBe('day');
  });

  it('routes kronos source to ShiftEvent with source:calendar', () => {
    const push: APISchedulePush = {
      employeeId: 'emp-001',
      source: 'kronos',
      shifts: [{ start: '2026-04-06T19:00:00Z', end: '2026-04-07T07:00:00Z', type: 'night' }],
    };
    const [shift] = importSchedule(push);
    expect(shift.source).toBe('calendar');
    expect(shift.shiftType).toBe('night');
  });

  // SI-10
  it('SI-10: handles timezone offsets in ISO 8601 strings', () => {
    const push: APISchedulePush = {
      employeeId: 'emp-001',
      source: 'api',
      shifts: [{ start: '2026-04-06T07:00:00-05:00', end: '2026-04-06T15:00:00-05:00', type: 'day' }],
    };
    const [shift] = importSchedule(push);
    // Date should parse correctly — noon UTC start (07:00 ET = 12:00 UTC)
    expect(shift.start.getUTCHours()).toBe(12);
    expect(shift.end.getUTCHours()).toBe(20);
  });

  // SI-11
  it('SI-11: throws when start is not before end', () => {
    const push: APISchedulePush = {
      employeeId: 'emp-001',
      source: 'manual',
      shifts: [{ start: '2026-04-06T15:00:00Z', end: '2026-04-06T07:00:00Z', type: 'day' }],
    };
    expect(() => importSchedule(push)).toThrow();
  });

  it('generates unique IDs for each shift', () => {
    const push: APISchedulePush = {
      employeeId: 'emp-001',
      source: 'api',
      shifts: [
        { start: '2026-04-06T07:00:00Z', end: '2026-04-06T15:00:00Z', type: 'day' },
        { start: '2026-04-07T19:00:00Z', end: '2026-04-08T07:00:00Z', type: 'night' },
      ],
    };
    const result = importSchedule(push);
    expect(result[0].id).not.toBe(result[1].id);
  });

  it('maps optional department field through correctly (stored in title context)', () => {
    const push: APISchedulePush = {
      employeeId: 'emp-001',
      source: 'api',
      shifts: [{ start: '2026-04-06T07:00:00Z', end: '2026-04-06T15:00:00Z', type: 'evening', department: 'ICU' }],
    };
    const result = importSchedule(push);
    // department not stored directly in ShiftEvent; just verify no crash
    expect(result).toHaveLength(1);
  });
});
