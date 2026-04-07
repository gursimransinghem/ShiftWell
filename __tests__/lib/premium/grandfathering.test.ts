/**
 * Tests: src/lib/premium/grandfathering.ts
 *
 * Covers boundary date logic for isGrandfathered:
 *  - Before paywall date → grandfathered
 *  - After paywall date → not grandfathered
 *  - Null installedAt → grandfathered (safety net for unknown installs)
 *  - Same day as paywall date → grandfathered (boundary: same day = grandfathered)
 */

import {
  isGrandfathered,
  PAYWALL_LAUNCH_DATE,
} from '../../../src/lib/premium/grandfathering';

// ---------------------------------------------------------------------------
// PAYWALL_LAUNCH_DATE sanity check
// ---------------------------------------------------------------------------

test('PAYWALL_LAUNCH_DATE is a valid future date', () => {
  const now = new Date('2026-04-07').getTime();
  expect(PAYWALL_LAUNCH_DATE.getTime()).toBeGreaterThan(now);
});

// ---------------------------------------------------------------------------
// isGrandfathered — boundary logic
// ---------------------------------------------------------------------------

describe('isGrandfathered', () => {
  const paywallMs = PAYWALL_LAUNCH_DATE.getTime();

  test('returns true when installedAt is before PAYWALL_LAUNCH_DATE', () => {
    // Install one year before paywall
    const earlyInstall = new Date(paywallMs - 365 * 24 * 60 * 60 * 1000).toISOString();
    expect(isGrandfathered(earlyInstall)).toBe(true);
  });

  test('returns false when installedAt is after PAYWALL_LAUNCH_DATE', () => {
    // Install one day after paywall
    const lateInstall = new Date(paywallMs + 24 * 60 * 60 * 1000).toISOString();
    expect(isGrandfathered(lateInstall)).toBe(false);
  });

  test('returns true when installedAt is null (safety net: unknown = grandfathered)', () => {
    expect(isGrandfathered(null)).toBe(true);
  });

  test('returns true when installedAt is undefined (safety net)', () => {
    expect(isGrandfathered(undefined)).toBe(true);
  });

  test('returns true when installedAt equals PAYWALL_LAUNCH_DATE exactly (boundary: same day = grandfathered)', () => {
    const exactDate = PAYWALL_LAUNCH_DATE.toISOString();
    expect(isGrandfathered(exactDate)).toBe(true);
  });

  test('returns true for invalid date string (safety net: parse error = grandfathered)', () => {
    expect(isGrandfathered('not-a-date')).toBe(true);
  });
});
