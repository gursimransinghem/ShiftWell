/**
 * Schedule Importer — Phase 29 (API Layer)
 *
 * Parses incoming schedule data from hospital scheduling systems into the
 * internal ShiftEvent format. Supports Kronos and QGenda formats —
 * the two most common hospital scheduling systems.
 *
 * Kronos format: shifts in "shifts" array with ISO start/end + shiftCode
 * QGenda format: assignments in "assignments" array with scheduledStart/End + activityCode
 *
 * All timezone handling uses Date.parse() on ISO 8601 strings — no external deps.
 */

import type { ShiftEvent, ShiftType } from '../circadian/types';
import type { APISchedulePush, APIShiftType } from './types';

// ─── Kronos Types ─────────────────────────────────────────────────────────────

/**
 * A single shift from a Kronos export.
 * shiftCode maps to ShiftType: D/DAY → day, E/EVE → evening, N/NOC → night
 */
interface KronosShift {
  shiftId?: string;
  shiftCode?: string;
  startDateTime: string;   // ISO 8601
  endDateTime: string;     // ISO 8601
  department?: string;
  employeeId?: string;
}

interface KronosSchedulePayload {
  shifts?: KronosShift[];
  [key: string]: unknown;
}

// ─── QGenda Types ─────────────────────────────────────────────────────────────

/**
 * A single assignment from a QGenda export.
 * activityCode maps to ShiftType: similar prefix conventions.
 */
interface QGendaAssignment {
  taskAbbrev?: string;
  activityCode?: string;
  scheduledStart: string;  // ISO 8601
  scheduledEnd: string;    // ISO 8601
  staffId?: string;
  locationName?: string;
}

interface QGendaSchedulePayload {
  assignments?: QGendaAssignment[];
  schedule?: { assignments?: QGendaAssignment[] };
  [key: string]: unknown;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Simple counter for generating shift IDs when source provides none */
let _idCounter = 0;

function generateShiftId(prefix: string): string {
  _idCounter += 1;
  return `${prefix}-${Date.now()}-${_idCounter}`;
}

/**
 * Map a shift code string to a ShiftType.
 * Covers common Kronos (D, E, N, DAY, EVE, NOC) and QGenda (D7, N12, PM, etc.) codes.
 */
function mapShiftCode(code: string | undefined): ShiftType {
  if (!code) return 'day';
  const upper = code.toUpperCase();
  if (upper.startsWith('N') || upper.includes('NOC') || upper.includes('NIGHT')) return 'night';
  if (upper.startsWith('E') || upper.includes('EVE') || upper.includes('PM') || upper.includes('EVEN')) return 'evening';
  return 'day';
}

/**
 * Map an APIShiftType to a ShiftType.
 */
function apiShiftTypeToShiftType(type: APIShiftType): ShiftType {
  return type; // identical union values
}

/**
 * Validate that a date string parses to a valid Date.
 * Throws if invalid.
 */
function parseRequiredDate(value: string, field: string): Date {
  if (!value || typeof value !== 'string') {
    throw new Error(`Missing required field: ${field}`);
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date for ${field}: ${value}`);
  }
  return date;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parse a Kronos schedule export into ShiftEvent[].
 *
 * Expected payload shape:
 * ```json
 * { "shifts": [{ "shiftId": "...", "startDateTime": "...", "endDateTime": "...", "shiftCode": "N" }] }
 * ```
 *
 * @param data - Raw Kronos schedule payload (any shape; validated internally)
 * @throws    - If required fields are missing or dates are invalid
 */
export function parseKronosSchedule(data: unknown): ShiftEvent[] {
  const payload = data as KronosSchedulePayload;

  if (!payload || !Array.isArray(payload.shifts)) {
    throw new Error('Kronos payload must have a "shifts" array');
  }

  return payload.shifts.map((shift, index) => {
    const start = parseRequiredDate(shift.startDateTime, `shifts[${index}].startDateTime`);
    const end = parseRequiredDate(shift.endDateTime, `shifts[${index}].endDateTime`);

    if (start >= end) {
      throw new Error(`shifts[${index}]: startDateTime must be before endDateTime`);
    }

    return {
      id: shift.shiftId ?? generateShiftId('kronos'),
      title: shift.shiftCode ? `Kronos ${shift.shiftCode}` : 'Kronos Shift',
      start,
      end,
      shiftType: mapShiftCode(shift.shiftCode),
      source: 'calendar' as const,
    };
  });
}

/**
 * Parse a QGenda schedule export into ShiftEvent[].
 *
 * Expected payload shape:
 * ```json
 * { "assignments": [{ "taskAbbrev": "NOC", "scheduledStart": "...", "scheduledEnd": "..." }] }
 * ```
 * Also supports `{ "schedule": { "assignments": [...] } }` wrapper.
 *
 * @param data - Raw QGenda schedule payload (any shape; validated internally)
 * @throws    - If required fields are missing or dates are invalid
 */
export function parseQGendaSchedule(data: unknown): ShiftEvent[] {
  const payload = data as QGendaSchedulePayload;

  // Support both top-level assignments and nested schedule.assignments
  const assignments: QGendaAssignment[] | undefined =
    Array.isArray(payload?.assignments)
      ? payload.assignments
      : Array.isArray(payload?.schedule?.assignments)
      ? payload.schedule!.assignments
      : undefined;

  if (!assignments) {
    throw new Error('QGenda payload must have an "assignments" array');
  }

  return assignments.map((assignment, index) => {
    const start = parseRequiredDate(assignment.scheduledStart, `assignments[${index}].scheduledStart`);
    const end = parseRequiredDate(assignment.scheduledEnd, `assignments[${index}].scheduledEnd`);

    if (start >= end) {
      throw new Error(`assignments[${index}]: scheduledStart must be before scheduledEnd`);
    }

    const code = assignment.taskAbbrev ?? assignment.activityCode;

    return {
      id: generateShiftId('qgenda'),
      title: code ? `QGenda ${code}` : 'QGenda Shift',
      start,
      end,
      shiftType: mapShiftCode(code),
      source: 'calendar' as const,
    };
  });
}

/**
 * Import a schedule push payload into ShiftEvent[].
 *
 * Routes to the appropriate parser based on the `source` field,
 * or uses the generic APISchedulePush shift array for 'api' and 'manual' sources.
 *
 * @param push - Validated APISchedulePush payload
 */
export function importSchedule(push: APISchedulePush): ShiftEvent[] {
  return push.shifts.map((shift, index) => {
    const start = parseRequiredDate(shift.start, `shifts[${index}].start`);
    const end = parseRequiredDate(shift.end, `shifts[${index}].end`);

    if (start >= end) {
      throw new Error(`shifts[${index}]: start must be before end`);
    }

    return {
      id: generateShiftId(`${push.source}-${push.employeeId}`),
      title: `${push.source.charAt(0).toUpperCase()}${push.source.slice(1)} ${shift.type} shift`,
      start,
      end,
      shiftType: apiShiftTypeToShiftType(shift.type),
      source: (push.source === 'manual' ? 'manual' : 'calendar') as 'calendar' | 'manual',
    };
  });
}
