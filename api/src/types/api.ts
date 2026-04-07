/**
 * ShiftWell Enterprise API — TypeScript Types
 *
 * Mirrors the OpenAPI 3.0 schemas in api/openapi.yaml.
 * These types flow through auth middleware, route handlers, and parsers.
 *
 * Phase 29 — API Layer
 */

// ─── Canonical Types ──────────────────────────────────────────────────────────

/** Canonical shift record after parsing from any source format */
export interface ShiftRecord {
  /** Opaque employee identifier — never name, SSN, or DOB */
  employeeId: string;
  /** Shift category */
  shiftType: 'day' | 'evening' | 'night' | 'rotating';
  /** ISO 8601 shift start */
  startTime: string;
  /** ISO 8601 shift end */
  endTime: string;
  /** Optional: clinical unit (ICU, ED, Med-Surg, PACU) */
  unit?: string;
}

/** Request body for POST /v1/schedules */
export interface SchedulePushRequest {
  /** Organization identifier */
  orgId: string;
  /** Source format — drives which parser is used */
  format: 'kronos' | 'qgenda' | 'shiftwell';
  /** Raw schedule records in the specified format */
  schedules: unknown[];
  /** Optional: period start for context */
  periodStart?: string;
  /** Optional: period end for context */
  periodEnd?: string;
}

/** Response body for POST /v1/schedules */
export interface SchedulePushResponse {
  accepted: number;
  rejected: number;
  requestId: string;
  errors?: Array<{
    index: number;
    reason: string;
  }>;
}

/** Anonymized aggregate cohort metrics */
export interface CohortMetrics {
  orgId: string;
  cohortSize: number;
  avgRecoveryScore: number;
  adherenceRate: number;
  avgDebtBalance: number;
  p25RecoveryScore: number;
  p75RecoveryScore: number;
  lowRecoveryWorkerPct: number;
  periodStart: string;
  periodEnd: string;
}

/** Response body for GET /v1/outcomes */
export interface OutcomesResponse {
  metadata: {
    orgId: string;
    generatedAt: string;
    cohortSize: number;
    dpApplied: boolean;
    periodStart: string;
    periodEnd: string;
  };
  metrics: CohortMetrics;
}

/** OAuth2 token response */
export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  scope: string;
}

/** Standard API error response */
export interface ErrorResponse {
  error: string;
  code: string;
  requestId?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// ─── Source Format Types ───────────────────────────────────────────────────────

/**
 * Kronos Workforce Central export record format.
 *
 * Kronos uses ScheduleDate + StartTime/StopTime (separate fields).
 * AssignedShiftCode is a free-form code (e.g., "N12", "D8", "EVE").
 */
export interface KronosShiftRecord {
  /** Employee identifier in Kronos */
  EmployeeNumber: string;
  /** Kronos shift code (e.g., "N12" = night 12-hour) */
  AssignedShiftCode: string;
  /** Date string: YYYY-MM-DD */
  ScheduleDate: string;
  /** Start time string: HH:MM (24-hour) */
  StartTime: string;
  /** Stop time string: HH:MM (24-hour) */
  StopTime: string;
  /** Optional: organizational unit */
  OrgJobPath?: string;
}

/**
 * QGenda API JSON format for schedule records.
 *
 * QGenda uses combined datetime strings for start/end,
 * and a TaskName (can be the role or shift description).
 */
export interface QGendaShiftRecord {
  /** Employee identifier in QGenda */
  EmployeeId: string;
  /** Task/role name (e.g., "Night Coverage", "Day Attending", "Evening Float") */
  TaskName: string;
  /** Combined datetime: ISO 8601 or "YYYY-MM-DDTHH:MM:SS" */
  StartDate: string;
  /** Combined datetime: ISO 8601 or "YYYY-MM-DDTHH:MM:SS" */
  EndDate: string;
  /** Optional: department or unit */
  Department?: string;
}

// ─── JWT Claims ────────────────────────────────────────────────────────────────

/** Claims embedded in API JWT tokens */
export interface JWTClaims {
  /** Subject = client_id */
  sub: string;
  /** Organization scope this token is authorized for */
  orgId: string;
  /** Space-separated list of granted scopes */
  scope: string;
  /** Expiry (Unix timestamp) */
  exp: number;
  /** Issued-at (Unix timestamp) */
  iat: number;
}

// ─── Express Request Augmentation ─────────────────────────────────────────────

/**
 * Extended Express Request with auth middleware injections.
 * Added by src/middleware/auth.ts after JWT verification.
 */
export interface AuthenticatedRequest {
  orgId: string;
  clientId: string;
  scope: string;
}

// ─── Parser Result ─────────────────────────────────────────────────────────────

/** Result returned by format parsers */
export interface ParseResult {
  records: ShiftRecord[];
  errors: Array<{
    index: number;
    reason: string;
  }>;
}
