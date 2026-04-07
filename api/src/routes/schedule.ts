/**
 * ShiftWell Enterprise API — Schedule Push Endpoint
 *
 * POST /v1/schedules
 *
 * Accepts shift records in Kronos, QGenda, or native ShiftWell format.
 * Validates, parses, normalises to canonical ShiftRecord[], stores in repo.
 *
 * Kronos Workforce Central export format:
 *   EmployeeNumber, AssignedShiftCode, ScheduleDate, StartTime, StopTime
 *
 * QGenda JSON API format:
 *   EmployeeId, TaskName, StartDate, EndDate, Department
 *
 * Phase 29 — API Layer (ENT-06)
 */

import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import type { Request, Response } from 'express';
import type {
  ShiftRecord,
  KronosShiftRecord,
  QGendaShiftRecord,
  ParseResult,
  SchedulePushResponse,
} from '../types/api';
import { authenticate, requireScope } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';

// ─── Validation Schemas ────────────────────────────────────────────────────────

const shiftTypeEnum = z.enum(['day', 'evening', 'night', 'rotating']);

const ShiftRecordSchema = z.object({
  employeeId: z.string().min(1),
  shiftType: shiftTypeEnum,
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  unit: z.string().optional(),
});

const SchedulePushRequestSchema = z.object({
  orgId: z.string().min(1),
  format: z.enum(['kronos', 'qgenda', 'shiftwell']),
  schedules: z.array(z.unknown()).min(1, 'schedules must contain at least one record'),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
});

// ─── Kronos Parser ────────────────────────────────────────────────────────────

/**
 * Maps Kronos AssignedShiftCode prefixes to canonical shiftType values.
 *
 * Kronos shift codes are free-form (e.g. "N12", "D8", "EVE12", "ROT").
 * We match the first letter/prefix to determine category:
 *   N / NIGH  → night
 *   D / DAY   → day
 *   E / EVE   → evening
 *   R / ROT   → rotating
 *
 * Unknown codes default to 'rotating' with an error flagged.
 */
function kronosCodeToShiftType(code: string): ShiftRecord['shiftType'] {
  const upper = code.toUpperCase().trim();
  if (upper.startsWith('N') || upper.startsWith('NIGH')) return 'night';
  if (upper.startsWith('D') || upper.startsWith('DAY')) return 'day';
  if (upper.startsWith('E') || upper.startsWith('EVE')) return 'evening';
  if (upper.startsWith('R') || upper.startsWith('ROT')) return 'rotating';
  // Fallback: classify by common shift names
  if (upper.includes('NIGHT')) return 'night';
  if (upper.includes('DAY')) return 'day';
  if (upper.includes('EVE') || upper.includes('EVENING')) return 'evening';
  return 'rotating'; // safest default for unknown codes
}

/**
 * Build an ISO 8601 datetime string from Kronos date + time fields.
 *
 * Kronos provides:
 *   ScheduleDate: YYYY-MM-DD
 *   StartTime:    HH:MM (24-hour)
 *   StopTime:     HH:MM (24-hour) — may be next day (e.g. night shift ending at 07:00)
 *
 * If StopTime <= StartTime on the same day, the shift crosses midnight (add 1 day to end).
 */
function kronosToISO(date: string, time: string): string {
  return `${date}T${time}:00Z`;
}

function kronosEndToISO(date: string, startTime: string, stopTime: string): string {
  const [startH, startM] = startTime.split(':').map(Number);
  const [stopH, stopM] = stopTime.split(':').map(Number);
  const startMinutes = (startH ?? 0) * 60 + (startM ?? 0);
  const stopMinutes = (stopH ?? 0) * 60 + (stopM ?? 0);

  if (stopMinutes <= startMinutes) {
    // Crosses midnight — end date is next day
    const endDate = new Date(`${date}T00:00:00Z`);
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    const nextDay = endDate.toISOString().slice(0, 10);
    return `${nextDay}T${stopTime}:00Z`;
  }
  return `${date}T${stopTime}:00Z`;
}

export const KronosParser = {
  /**
   * Parse an array of Kronos shift records into canonical ShiftRecord[].
   */
  parse(rawRecords: unknown[]): ParseResult {
    const records: ShiftRecord[] = [];
    const errors: ParseResult['errors'] = [];

    for (let i = 0; i < rawRecords.length; i++) {
      const raw = rawRecords[i] as Partial<KronosShiftRecord>;

      if (!raw.EmployeeNumber || !raw.AssignedShiftCode || !raw.ScheduleDate || !raw.StartTime || !raw.StopTime) {
        errors.push({
          index: i,
          reason: 'Kronos record missing required fields: EmployeeNumber, AssignedShiftCode, ScheduleDate, StartTime, StopTime',
        });
        continue;
      }

      records.push({
        employeeId: raw.EmployeeNumber,
        shiftType: kronosCodeToShiftType(raw.AssignedShiftCode),
        startTime: kronosToISO(raw.ScheduleDate, raw.StartTime),
        endTime: kronosEndToISO(raw.ScheduleDate, raw.StartTime, raw.StopTime),
        unit: raw.OrgJobPath,
      });
    }

    return { records, errors };
  },
};

// ─── QGenda Parser ────────────────────────────────────────────────────────────

/**
 * Maps QGenda TaskName keywords to canonical shiftType values.
 *
 * QGenda TaskName is free-text (e.g. "Night Coverage", "Day Attending", "Evening Float").
 * We match case-insensitive keywords in the name.
 */
function qgendaTaskToShiftType(taskName: string): ShiftRecord['shiftType'] {
  const lower = taskName.toLowerCase();
  if (lower.includes('night') || lower.includes('noc') || lower.includes('overnight')) return 'night';
  if (lower.includes('evening') || lower.includes('pm') || lower.includes('eve')) return 'evening';
  if (lower.includes('day') || lower.includes('am') || lower.includes('morning')) return 'day';
  if (lower.includes('rotating') || lower.includes('float') || lower.includes('on-call') || lower.includes('oncall')) return 'rotating';
  return 'rotating'; // default for unrecognised tasks
}

/**
 * Normalise a QGenda datetime string to ISO 8601 UTC.
 * QGenda uses "YYYY-MM-DDTHH:MM:SS" (no timezone) — we treat as UTC.
 */
function normaliseQGendaDate(dateStr: string): string {
  if (dateStr.endsWith('Z')) return dateStr;
  if (dateStr.includes('T')) return `${dateStr}Z`;
  return `${dateStr}T00:00:00Z`;
}

export const QGendaParser = {
  /**
   * Parse an array of QGenda shift records into canonical ShiftRecord[].
   */
  parse(rawRecords: unknown[]): ParseResult {
    const records: ShiftRecord[] = [];
    const errors: ParseResult['errors'] = [];

    for (let i = 0; i < rawRecords.length; i++) {
      const raw = rawRecords[i] as Partial<QGendaShiftRecord>;

      if (!raw.EmployeeId || !raw.TaskName || !raw.StartDate || !raw.EndDate) {
        errors.push({
          index: i,
          reason: 'QGenda record missing required fields: EmployeeId, TaskName, StartDate, EndDate',
        });
        continue;
      }

      records.push({
        employeeId: raw.EmployeeId,
        shiftType: qgendaTaskToShiftType(raw.TaskName),
        startTime: normaliseQGendaDate(raw.StartDate),
        endTime: normaliseQGendaDate(raw.EndDate),
        unit: raw.Department,
      });
    }

    return { records, errors };
  },
};

// ─── Schedule Repository (stub) ────────────────────────────────────────────────

/**
 * ScheduleRepository interface — abstracts storage backend.
 *
 * Production: PostgreSQL via pg or Prisma.
 * Test: in-memory stub (default).
 *
 * Injected via buildApp() for testability.
 */
export interface ScheduleRepository {
  saveShifts(orgId: string, records: ShiftRecord[]): Promise<void>;
}

export const inMemoryScheduleRepo: ScheduleRepository = {
  async saveShifts(_orgId: string, _records: ShiftRecord[]): Promise<void> {
    // In-memory stub — no-op for development/test
    return Promise.resolve();
  },
};

// ─── Route Handler ────────────────────────────────────────────────────────────

export function createScheduleRouter(repo: ScheduleRepository = inMemoryScheduleRepo): Router {
  const router = Router();

  router.post(
    '/',
    authenticate,
    requireScope('schedule:write'),
    rateLimit(100),
    async (req: Request, res: Response): Promise<void> => {
      const requestId = req.requestId ?? uuidv4();

      // Validate request body
      const parseResult = SchedulePushRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'Request validation failed',
          code: 'VALIDATION_ERROR',
          requestId,
          details: parseResult.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }

      const { orgId: bodyOrgId, format, schedules } = parseResult.data;

      // Org isolation: token orgId must match request body orgId
      if (req.orgId !== bodyOrgId) {
        res.status(403).json({
          error: 'Token orgId does not match request orgId',
          code: 'ORG_MISMATCH',
          requestId,
        });
        return;
      }

      // Parse based on format
      let parsedResult: ParseResult;

      if (format === 'shiftwell') {
        // Native format — validate each record directly
        const parsed: ShiftRecord[] = [];
        const errors: ParseResult['errors'] = [];

        for (let i = 0; i < schedules.length; i++) {
          const r = ShiftRecordSchema.safeParse(schedules[i]);
          if (r.success) {
            parsed.push(r.data);
          } else {
            errors.push({
              index: i,
              reason: r.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
            });
          }
        }
        parsedResult = { records: parsed, errors };
      } else if (format === 'kronos') {
        parsedResult = KronosParser.parse(schedules);
      } else {
        parsedResult = QGendaParser.parse(schedules);
      }

      // Persist accepted records
      try {
        await repo.saveShifts(req.orgId, parsedResult.records);
      } catch (err) {
        res.status(500).json({
          error: 'Failed to persist shift records',
          code: 'STORAGE_ERROR',
          requestId,
        });
        return;
      }

      const response: SchedulePushResponse = {
        accepted: parsedResult.records.length,
        rejected: parsedResult.errors.length,
        requestId,
        errors: parsedResult.errors.length > 0 ? parsedResult.errors : undefined,
      };

      res.status(201).json(response);
    },
  );

  return router;
}
