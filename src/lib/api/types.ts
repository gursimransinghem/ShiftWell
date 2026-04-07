/**
 * API Layer Types — Phase 29 (API Layer)
 *
 * Defines the request/response shapes for the ShiftWell Enterprise API.
 * These types describe the external contract for schedule ingestion and
 * outcome data export.
 *
 * Server implementation is out of scope for client-side infrastructure.
 * All enterprise features pass through in BETA_MODE.
 */

import type { AnonymizedRecord } from '../enterprise/anonymizer';

// ─── Schedule Push ─────────────────────────────────────────────────────────────

/** Shift type values accepted by the API */
export type APIShiftType = 'day' | 'evening' | 'night';

/** Source system that originated the schedule data */
export type APIScheduleSource = 'kronos' | 'qgenda' | 'api' | 'manual';

/** A single shift within a schedule push payload */
export interface APIShift {
  /** ISO 8601 datetime (e.g., "2026-04-06T07:00:00-05:00") */
  start: string;
  /** ISO 8601 datetime */
  end: string;
  type: APIShiftType;
  /** Optional department or unit code */
  department?: string;
}

/**
 * Request body for POST /api/v1/schedules.
 * Pushes one or more shifts for a single employee.
 */
export interface APISchedulePush {
  /** Employee identifier in the source system (no PII beyond the ID) */
  employeeId: string;
  shifts: APIShift[];
  source: APIScheduleSource;
}

// ─── Outcome Response ──────────────────────────────────────────────────────────

/**
 * Period range returned with outcome data.
 * Both dates are ISO 8601 date strings (yyyy-MM-dd).
 */
export interface APIOutcomePeriod {
  start: string;
  end: string;
}

/** Period-over-period trend deltas */
export interface APIOutcomeTrends {
  /** Percentage point change in adherence vs previous period */
  adherenceChange: number;
  /** Change in average debt hours vs previous period */
  debtChange: number;
  /** Percentage point change in recovery score vs previous period */
  recoveryChange: number;
}

/**
 * Response body for GET /api/v1/outcomes and GET /api/v1/outcomes/:cohortId.
 * Wraps anonymized cohort metrics with trend analysis.
 */
export interface APIOutcomeResponse {
  cohortId: string;
  period: APIOutcomePeriod;
  metrics: AnonymizedRecord['metrics'];
  trends: APIOutcomeTrends;
}

// ─── Client Config ─────────────────────────────────────────────────────────────

/** Rate limiting configuration per API client */
export interface APIRateLimit {
  requestsPerMinute: number;
}

/**
 * Configuration for an API client credential set.
 * Stored server-side; provided here for SDK/client configuration.
 */
export interface APIClientConfig {
  clientId: string;
  clientSecret: string;
  /** OAuth2 scopes granted to this client (e.g., ["schedules:write", "outcomes:read"]) */
  scopes: string[];
  rateLimit: APIRateLimit;
}

// ─── Validation Helpers ────────────────────────────────────────────────────────

/**
 * Validate an APISchedulePush payload.
 * Returns an array of validation error messages (empty = valid).
 */
export function validateSchedulePush(push: APISchedulePush): string[] {
  const errors: string[] = [];

  if (!push.employeeId || push.employeeId.trim() === '') {
    errors.push('employeeId is required');
  }

  if (!Array.isArray(push.shifts) || push.shifts.length === 0) {
    errors.push('shifts must be a non-empty array');
  } else {
    for (let i = 0; i < push.shifts.length; i++) {
      const shift = push.shifts[i];
      if (!shift.start) errors.push(`shifts[${i}].start is required`);
      if (!shift.end) errors.push(`shifts[${i}].end is required`);
      if (!['day', 'evening', 'night'].includes(shift.type)) {
        errors.push(`shifts[${i}].type must be day | evening | night`);
      }
      if (shift.start && shift.end && new Date(shift.start) >= new Date(shift.end)) {
        errors.push(`shifts[${i}].start must be before shifts[${i}].end`);
      }
    }
  }

  if (!['kronos', 'qgenda', 'api', 'manual'].includes(push.source)) {
    errors.push('source must be kronos | qgenda | api | manual');
  }

  return errors;
}

/**
 * Validate an APIClientConfig.
 * Returns an array of validation error messages (empty = valid).
 */
export function validateClientConfig(config: APIClientConfig): string[] {
  const errors: string[] = [];

  if (!config.clientId || config.clientId.trim() === '') {
    errors.push('clientId is required');
  }
  if (!config.clientSecret || config.clientSecret.trim() === '') {
    errors.push('clientSecret is required');
  }
  if (!Array.isArray(config.scopes) || config.scopes.length === 0) {
    errors.push('scopes must be a non-empty array');
  }
  if (!config.rateLimit || typeof config.rateLimit.requestsPerMinute !== 'number') {
    errors.push('rateLimit.requestsPerMinute must be a number');
  } else if (config.rateLimit.requestsPerMinute <= 0) {
    errors.push('rateLimit.requestsPerMinute must be positive');
  }

  return errors;
}
