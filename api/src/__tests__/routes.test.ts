/**
 * ShiftWell Enterprise API — Route Tests
 *
 * Tests for:
 *   POST /v1/schedules  — Kronos + QGenda schedule ingestion
 *   GET  /v1/outcomes   — Anonymized cohort metrics (JSON + CSV)
 *
 * Auth middleware is mocked to inject req.orgId = 'test-org' + test scopes.
 * UserRepository is mocked to return synthetic user records.
 *
 * Phase 29 — API Layer (ENT-06)
 */

import request from 'supertest';
import { SignJWT } from 'jose';
import { buildApp } from '../app';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TEST_SECRET = new TextEncoder().encode('test-secret-minimum-32-chars-long!!');

async function makeToken(orgId: string, scope: string): Promise<string> {
  return new SignJWT({ orgId, scope })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject('test-client-01')
    .setExpirationTime('1h')
    .sign(TEST_SECRET);
}

// ─── POST /v1/schedules — ShiftWell native format ─────────────────────────────

describe('POST /v1/schedules', () => {
  let app: ReturnType<typeof buildApp>['app'];

  beforeAll(async () => {
    const built = buildApp();
    app = built.app;
  });

  it('returns 201 with accepted count for valid shiftwell payload', async () => {
    const token = await makeToken('test-org', 'schedule:write');
    const res = await request(app)
      .post('/v1/schedules')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orgId: 'test-org',
        format: 'shiftwell',
        schedules: [
          {
            employeeId: 'EMP-001',
            shiftType: 'night',
            startTime: '2025-01-15T19:00:00Z',
            endTime: '2025-01-16T07:00:00Z',
          },
          {
            employeeId: 'EMP-002',
            shiftType: 'day',
            startTime: '2025-01-15T07:00:00Z',
            endTime: '2025-01-15T19:00:00Z',
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.accepted).toBe(2);
    expect(res.body.rejected).toBe(0);
    expect(res.body.requestId).toBeDefined();
  });

  it('returns 201 with accepted count for valid Kronos payload', async () => {
    const token = await makeToken('test-org', 'schedule:write');
    const res = await request(app)
      .post('/v1/schedules')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orgId: 'test-org',
        format: 'kronos',
        schedules: [
          {
            EmployeeNumber: 'EMP-00042',
            AssignedShiftCode: 'N12',
            ScheduleDate: '2025-01-15',
            StartTime: '19:00',
            StopTime: '07:00',
          },
          {
            EmployeeNumber: 'EMP-00043',
            AssignedShiftCode: 'D8',
            ScheduleDate: '2025-01-15',
            StartTime: '07:00',
            StopTime: '15:00',
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.accepted).toBe(2);
    expect(res.body.rejected).toBe(0);
  });

  it('returns 201 with accepted count for valid QGenda payload', async () => {
    const token = await makeToken('test-org', 'schedule:write');
    const res = await request(app)
      .post('/v1/schedules')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orgId: 'test-org',
        format: 'qgenda',
        schedules: [
          {
            EmployeeId: 'EMP-00042',
            TaskName: 'Night Coverage',
            StartDate: '2025-01-15T19:00:00',
            EndDate: '2025-01-16T07:00:00',
          },
          {
            EmployeeId: 'EMP-00043',
            TaskName: 'Day Attending',
            StartDate: '2025-01-15T07:00:00',
            EndDate: '2025-01-15T19:00:00',
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.accepted).toBe(2);
    expect(res.body.rejected).toBe(0);
  });

  it('returns 400 when required fields are missing', async () => {
    const token = await makeToken('test-org', 'schedule:write');
    const res = await request(app)
      .post('/v1/schedules')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orgId: 'test-org',
        // missing format and schedules
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when schedules array is empty', async () => {
    const token = await makeToken('test-org', 'schedule:write');
    const res = await request(app)
      .post('/v1/schedules')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orgId: 'test-org',
        format: 'shiftwell',
        schedules: [],
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 401 when no Authorization header', async () => {
    const res = await request(app)
      .post('/v1/schedules')
      .send({
        orgId: 'test-org',
        format: 'shiftwell',
        schedules: [{ employeeId: 'EMP-001', shiftType: 'night', startTime: '2025-01-15T19:00:00Z', endTime: '2025-01-16T07:00:00Z' }],
      });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('MISSING_TOKEN');
  });

  it('returns 403 when token lacks schedule:write scope', async () => {
    const token = await makeToken('test-org', 'outcomes:read');
    const res = await request(app)
      .post('/v1/schedules')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orgId: 'test-org',
        format: 'shiftwell',
        schedules: [{ employeeId: 'EMP-001', shiftType: 'night', startTime: '2025-01-15T19:00:00Z', endTime: '2025-01-16T07:00:00Z' }],
      });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('INSUFFICIENT_SCOPE');
  });
});

// ─── Kronos Parser ─────────────────────────────────────────────────────────────

describe('Kronos parser', () => {
  it('maps AssignedShiftCode to shiftType correctly', async () => {
    const { KronosParser } = await import('../routes/schedule');
    const result = KronosParser.parse([
      { EmployeeNumber: 'EMP-001', AssignedShiftCode: 'N12', ScheduleDate: '2025-01-15', StartTime: '19:00', StopTime: '07:00' },
      { EmployeeNumber: 'EMP-002', AssignedShiftCode: 'D8',  ScheduleDate: '2025-01-15', StartTime: '07:00', StopTime: '15:00' },
      { EmployeeNumber: 'EMP-003', AssignedShiftCode: 'EVE', ScheduleDate: '2025-01-15', StartTime: '15:00', StopTime: '23:00' },
      { EmployeeNumber: 'EMP-004', AssignedShiftCode: 'ROT', ScheduleDate: '2025-01-15', StartTime: '07:00', StopTime: '19:00' },
    ]);

    expect(result.errors).toHaveLength(0);
    expect(result.records[0].shiftType).toBe('night');
    expect(result.records[1].shiftType).toBe('day');
    expect(result.records[2].shiftType).toBe('evening');
    expect(result.records[3].shiftType).toBe('rotating');
  });

  it('combines ScheduleDate + StartTime/StopTime into ISO startTime/endTime', async () => {
    const { KronosParser } = await import('../routes/schedule');
    const result = KronosParser.parse([
      { EmployeeNumber: 'EMP-001', AssignedShiftCode: 'N12', ScheduleDate: '2025-01-15', StartTime: '19:00', StopTime: '07:00' },
    ]);

    expect(result.records[0].startTime).toBe('2025-01-15T19:00:00Z');
    // Night shift crosses midnight — end date should be next day
    expect(result.records[0].endTime).toBe('2025-01-16T07:00:00Z');
    expect(result.records[0].employeeId).toBe('EMP-001');
  });
});

// ─── QGenda Parser ─────────────────────────────────────────────────────────────

describe('QGenda parser', () => {
  it('maps TaskName to shiftType correctly', async () => {
    const { QGendaParser } = await import('../routes/schedule');
    const result = QGendaParser.parse([
      { EmployeeId: 'EMP-001', TaskName: 'Night Coverage',  StartDate: '2025-01-15T19:00:00', EndDate: '2025-01-16T07:00:00' },
      { EmployeeId: 'EMP-002', TaskName: 'Day Attending',   StartDate: '2025-01-15T07:00:00', EndDate: '2025-01-15T19:00:00' },
      { EmployeeId: 'EMP-003', TaskName: 'Evening Float',   StartDate: '2025-01-15T15:00:00', EndDate: '2025-01-15T23:00:00' },
    ]);

    expect(result.errors).toHaveLength(0);
    expect(result.records[0].shiftType).toBe('night');
    expect(result.records[1].shiftType).toBe('day');
    expect(result.records[2].shiftType).toBe('evening');
  });

  it('preserves ISO start/end dates from QGenda format', async () => {
    const { QGendaParser } = await import('../routes/schedule');
    const result = QGendaParser.parse([
      { EmployeeId: 'EMP-001', TaskName: 'Night Coverage', StartDate: '2025-01-15T19:00:00', EndDate: '2025-01-16T07:00:00' },
    ]);

    expect(result.records[0].employeeId).toBe('EMP-001');
    expect(result.records[0].startTime).toContain('2025-01-15');
    expect(result.records[0].endTime).toContain('2025-01-16');
  });
});

// ─── GET /v1/outcomes ─────────────────────────────────────────────────────────

describe('GET /v1/outcomes', () => {
  let app: ReturnType<typeof buildApp>['app'];

  beforeAll(async () => {
    const built = buildApp();
    app = built.app;
  });

  it('returns 200 with CohortMetrics JSON for valid request', async () => {
    const token = await makeToken('test-org', 'outcomes:read');
    const res = await request(app)
      .get('/v1/outcomes')
      .set('Authorization', `Bearer ${token}`)
      .query({ start: '2025-01-01', end: '2025-01-31' });

    expect(res.status).toBe(200);
    expect(res.body.metadata).toBeDefined();
    expect(res.body.metadata.orgId).toBe('test-org');
    expect(res.body.metadata.dpApplied).toBeDefined();
    expect(res.body.metrics).toBeDefined();
    expect(typeof res.body.metrics.avgRecoveryScore).toBe('number');
    expect(typeof res.body.metrics.adherenceRate).toBe('number');
    expect(res.body.metrics.periodStart).toBe('2025-01-01');
    expect(res.body.metrics.periodEnd).toBe('2025-01-31');
  });

  it('returns 200 with text/csv when format=csv', async () => {
    const token = await makeToken('test-org', 'outcomes:read');
    const res = await request(app)
      .get('/v1/outcomes')
      .set('Authorization', `Bearer ${token}`)
      .query({ start: '2025-01-01', end: '2025-01-31', format: 'csv' });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    // CSV must have header row
    const lines = res.text.split('\n');
    expect(lines[0]).toContain('orgId');
    expect(lines[0]).toContain('avgRecoveryScore');
  });

  it('returns 400 when start param is missing', async () => {
    const token = await makeToken('test-org', 'outcomes:read');
    const res = await request(app)
      .get('/v1/outcomes')
      .set('Authorization', `Bearer ${token}`)
      .query({ end: '2025-01-31' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when end param is missing', async () => {
    const token = await makeToken('test-org', 'outcomes:read');
    const res = await request(app)
      .get('/v1/outcomes')
      .set('Authorization', `Bearer ${token}`)
      .query({ start: '2025-01-01' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 401 when no Authorization header', async () => {
    const res = await request(app)
      .get('/v1/outcomes')
      .query({ start: '2025-01-01', end: '2025-01-31' });

    expect(res.status).toBe(401);
  });

  it('returns 403 when token lacks outcomes:read scope', async () => {
    const token = await makeToken('test-org', 'schedule:write');
    const res = await request(app)
      .get('/v1/outcomes')
      .set('Authorization', `Bearer ${token}`)
      .query({ start: '2025-01-01', end: '2025-01-31' });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('INSUFFICIENT_SCOPE');
  });
});
