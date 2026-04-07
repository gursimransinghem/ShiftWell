/**
 * Tests: src/lib/growth/referral.ts
 * Coverage: URL generation, code parsing, AsyncStorage persistence,
 * referral record building, first-write-wins behaviour.
 */

import {
  buildReferralUrl,
  parseReferralCode,
  storeReferralCode,
  getStoredReferralCode,
  buildReferralRecord,
  REFERRAL_BASE_URL,
} from '../../src/lib/growth/referral';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

// Share is not used in these tests (shareReferralLink has its own RN dep)
jest.mock('react-native', () => ({
  Share: { share: jest.fn().mockResolvedValue({ action: 'sharedAction' }) },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// URL generation
// ---------------------------------------------------------------------------

describe('buildReferralUrl', () => {
  test('returns correct URL for a given userId', () => {
    expect(buildReferralUrl('user-123')).toBe(`${REFERRAL_BASE_URL}/user-123`);
  });

  test('URL starts with https://shiftwell.app/r/', () => {
    const url = buildReferralUrl('abc');
    expect(url.startsWith('https://shiftwell.app/r/')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Code parsing
// ---------------------------------------------------------------------------

describe('parseReferralCode', () => {
  test('extracts code from valid referral URL', () => {
    expect(parseReferralCode('https://shiftwell.app/r/abc123')).toBe('abc123');
  });

  test('returns null for non-referral URL', () => {
    expect(parseReferralCode('https://shiftwell.app/settings')).toBeNull();
  });

  test('returns null for malformed URL', () => {
    expect(parseReferralCode('not-a-url')).toBeNull();
  });

  test('returns null for URL with only /r path', () => {
    expect(parseReferralCode('https://shiftwell.app/r')).toBeNull();
  });

  test('handles referral URL with trailing slash', () => {
    // URL: /r/xyz/ → parts after filter = ['r', 'xyz']
    expect(parseReferralCode('https://shiftwell.app/r/xyz/')).toBe('xyz');
  });
});

// ---------------------------------------------------------------------------
// Storage — storeReferralCode
// ---------------------------------------------------------------------------

describe('storeReferralCode', () => {
  test('writes code when none stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    await storeReferralCode('ref-001');

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'shiftwell:referral-code',
      'ref-001',
    );
  });

  test('does not overwrite when a code already exists (first-write-wins)', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('existing-code');

    await storeReferralCode('new-code');

    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Storage — getStoredReferralCode
// ---------------------------------------------------------------------------

describe('getStoredReferralCode', () => {
  test('returns stored code', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('saved-code');
    const code = await getStoredReferralCode();
    expect(code).toBe('saved-code');
  });

  test('returns null when nothing stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const code = await getStoredReferralCode();
    expect(code).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Referral record builder
// ---------------------------------------------------------------------------

describe('buildReferralRecord', () => {
  test('builds record with correct fields', () => {
    const before = new Date().toISOString();
    const record = buildReferralRecord('referrer-1', 'referred-2');
    const after = new Date().toISOString();

    expect(record.referrerId).toBe('referrer-1');
    expect(record.referredUserId).toBe('referred-2');
    expect(record.createdAt >= before).toBe(true);
    expect(record.createdAt <= after).toBe(true);
  });
});
