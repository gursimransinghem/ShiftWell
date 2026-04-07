/**
 * Tests for api/types — Phase 29 (API Layer)
 *
 * AT-01: validateSchedulePush returns no errors for valid payload
 * AT-02: validateSchedulePush errors on missing employeeId
 * AT-03: validateSchedulePush errors on empty shifts array
 * AT-04: validateSchedulePush errors on invalid shift type
 * AT-05: validateSchedulePush errors on invalid source
 * AT-06: validateSchedulePush errors when start >= end
 * AT-07: validateSchedulePush errors on missing shift.start
 * AT-08: validateClientConfig returns no errors for valid config
 * AT-09: validateClientConfig errors on missing clientId
 * AT-10: validateClientConfig errors on empty scopes
 * AT-11: validateClientConfig errors on non-positive requestsPerMinute
 */

import { validateSchedulePush, validateClientConfig } from '../../src/lib/api/types';
import type { APISchedulePush, APIClientConfig } from '../../src/lib/api/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validPush(overrides: Partial<APISchedulePush> = {}): APISchedulePush {
  return {
    employeeId: 'emp-001',
    source: 'kronos',
    shifts: [{ start: '2026-04-06T07:00:00Z', end: '2026-04-06T15:00:00Z', type: 'day' }],
    ...overrides,
  };
}

function validConfig(overrides: Partial<APIClientConfig> = {}): APIClientConfig {
  return {
    clientId: 'client-abc',
    clientSecret: 'secret-xyz',
    scopes: ['schedules:write', 'outcomes:read'],
    rateLimit: { requestsPerMinute: 60 },
    ...overrides,
  };
}

// ─── validateSchedulePush ─────────────────────────────────────────────────────

describe('validateSchedulePush', () => {
  // AT-01
  it('AT-01: returns no errors for a valid payload', () => {
    expect(validateSchedulePush(validPush())).toEqual([]);
  });

  // AT-02
  it('AT-02: errors on missing employeeId', () => {
    const errors = validateSchedulePush(validPush({ employeeId: '' }));
    expect(errors).toContain('employeeId is required');
  });

  it('AT-02b: errors on whitespace-only employeeId', () => {
    const errors = validateSchedulePush(validPush({ employeeId: '   ' }));
    expect(errors).toContain('employeeId is required');
  });

  // AT-03
  it('AT-03: errors on empty shifts array', () => {
    const errors = validateSchedulePush(validPush({ shifts: [] }));
    expect(errors.some((e) => e.includes('shifts'))).toBe(true);
  });

  // AT-04
  it('AT-04: errors on invalid shift type', () => {
    const push = validPush({
      shifts: [{ start: '2026-04-06T07:00:00Z', end: '2026-04-06T15:00:00Z', type: 'graveyard' as any }],
    });
    const errors = validateSchedulePush(push);
    expect(errors.some((e) => e.includes('type'))).toBe(true);
  });

  // AT-05
  it('AT-05: errors on invalid source', () => {
    const errors = validateSchedulePush(validPush({ source: 'oracle' as any }));
    expect(errors.some((e) => e.includes('source'))).toBe(true);
  });

  // AT-06
  it('AT-06: errors when shift start is after end', () => {
    const push = validPush({
      shifts: [{ start: '2026-04-06T15:00:00Z', end: '2026-04-06T07:00:00Z', type: 'day' }],
    });
    const errors = validateSchedulePush(push);
    expect(errors.some((e) => e.includes('before'))).toBe(true);
  });

  it('AT-06b: errors when shift start equals end', () => {
    const push = validPush({
      shifts: [{ start: '2026-04-06T07:00:00Z', end: '2026-04-06T07:00:00Z', type: 'day' }],
    });
    const errors = validateSchedulePush(push);
    expect(errors.some((e) => e.includes('before'))).toBe(true);
  });

  // AT-07
  it('AT-07: errors on missing shift.start', () => {
    const push = validPush({
      shifts: [{ start: '', end: '2026-04-06T15:00:00Z', type: 'day' }],
    });
    const errors = validateSchedulePush(push);
    expect(errors.some((e) => e.includes('start'))).toBe(true);
  });

  it('accepts all valid source values', () => {
    const sources: APISchedulePush['source'][] = ['kronos', 'qgenda', 'api', 'manual'];
    for (const source of sources) {
      expect(validateSchedulePush(validPush({ source }))).toEqual([]);
    }
  });

  it('accepts all valid shift types', () => {
    const types: Array<'day' | 'evening' | 'night'> = ['day', 'evening', 'night'];
    for (const type of types) {
      const push = validPush({ shifts: [{ start: '2026-04-06T07:00:00Z', end: '2026-04-06T15:00:00Z', type }] });
      expect(validateSchedulePush(push)).toEqual([]);
    }
  });
});

// ─── validateClientConfig ─────────────────────────────────────────────────────

describe('validateClientConfig', () => {
  // AT-08
  it('AT-08: returns no errors for a valid config', () => {
    expect(validateClientConfig(validConfig())).toEqual([]);
  });

  // AT-09
  it('AT-09: errors on missing clientId', () => {
    const errors = validateClientConfig(validConfig({ clientId: '' }));
    expect(errors).toContain('clientId is required');
  });

  it('AT-09b: errors on whitespace-only clientSecret', () => {
    const errors = validateClientConfig(validConfig({ clientSecret: '   ' }));
    expect(errors).toContain('clientSecret is required');
  });

  // AT-10
  it('AT-10: errors on empty scopes array', () => {
    const errors = validateClientConfig(validConfig({ scopes: [] }));
    expect(errors.some((e) => e.includes('scopes'))).toBe(true);
  });

  // AT-11
  it('AT-11: errors on zero requestsPerMinute', () => {
    const errors = validateClientConfig(validConfig({ rateLimit: { requestsPerMinute: 0 } }));
    expect(errors.some((e) => e.includes('requestsPerMinute'))).toBe(true);
  });

  it('AT-11b: errors on negative requestsPerMinute', () => {
    const errors = validateClientConfig(validConfig({ rateLimit: { requestsPerMinute: -5 } }));
    expect(errors.some((e) => e.includes('requestsPerMinute'))).toBe(true);
  });

  it('returns multiple errors simultaneously', () => {
    const errors = validateClientConfig({ clientId: '', clientSecret: '', scopes: [], rateLimit: { requestsPerMinute: 0 } });
    expect(errors.length).toBeGreaterThan(1);
  });
});
