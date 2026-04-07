/**
 * Tests: src/lib/growth/ab-testing.ts
 * Coverage: deterministic assignment, variant distribution across users,
 * 2 vs 3 variant modes, AsyncStorage persistence, exposure logging.
 */

import {
  getVariant,
  getOrAssignVariant,
  logExposure,
  getExposureLog,
  clearExposureLog,
  type Variant,
} from '../../src/lib/growth/ab-testing';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Deterministic assignment
// ---------------------------------------------------------------------------

describe('getVariant — determinism', () => {
  test('same inputs always return same variant', () => {
    const v1 = getVariant('onboarding-v2', 'user-abc');
    const v2 = getVariant('onboarding-v2', 'user-abc');
    expect(v1).toBe(v2);
  });

  test('different users can get different variants', () => {
    const variants = new Set<Variant>();
    for (let i = 0; i < 100; i++) {
      variants.add(getVariant('exp-1', `user-${i}`));
    }
    // With 100 users we should see both A and B
    expect(variants.size).toBeGreaterThan(1);
  });

  test('different experiments produce independent assignments', () => {
    const v1 = getVariant('exp-1', 'user-x');
    const v2 = getVariant('exp-2', 'user-x');
    // Not necessarily different, but the function should not throw
    expect(['A', 'B']).toContain(v1);
    expect(['A', 'B']).toContain(v2);
  });
});

// ---------------------------------------------------------------------------
// Variant count
// ---------------------------------------------------------------------------

describe('getVariant — variant count', () => {
  test('only returns A or B in 2-variant mode', () => {
    const results = new Set<Variant>();
    for (let i = 0; i < 200; i++) {
      results.add(getVariant('exp', `u${i}`, 2));
    }
    expect([...results].every((v) => v === 'A' || v === 'B')).toBe(true);
    expect(results.has('C')).toBe(false);
  });

  test('can return A, B, or C in 3-variant mode', () => {
    const results = new Set<Variant>();
    for (let i = 0; i < 300; i++) {
      results.add(getVariant('exp3', `u${i}`, 3));
    }
    // With 300 users we expect all 3 variants to appear
    expect(results.has('A')).toBe(true);
    expect(results.has('B')).toBe(true);
    expect(results.has('C')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Distribution (rough check)
// ---------------------------------------------------------------------------

describe('getVariant — distribution', () => {
  test('A/B split is roughly 50/50 across 1000 users', () => {
    const counts: Record<string, number> = { A: 0, B: 0 };
    for (let i = 0; i < 1000; i++) {
      const v = getVariant('dist-test', `user-${i}`);
      counts[v] = (counts[v] ?? 0) + 1;
    }
    // Expect each bucket to be between 30% and 70% (generous tolerance)
    expect(counts['A'] / 1000).toBeGreaterThan(0.3);
    expect(counts['A'] / 1000).toBeLessThan(0.7);
  });
});

// ---------------------------------------------------------------------------
// getOrAssignVariant — persistence
// ---------------------------------------------------------------------------

describe('getOrAssignVariant', () => {
  test('returns stored variant on repeat call (never re-hashes)', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('B');

    const v = await getOrAssignVariant('exp-persist', 'user-1');
    expect(v).toBe('B');
    // Should NOT write since a value was already stored
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  test('computes and persists variant when nothing stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const v = await getOrAssignVariant('exp-new', 'user-2');
    expect(['A', 'B']).toContain(v);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      expect.stringContaining('exp-new:user-2'),
      v,
    );
  });
});

// ---------------------------------------------------------------------------
// Exposure logging
// ---------------------------------------------------------------------------

describe('logExposure', () => {
  test('appends event to existing log', async () => {
    const existing = JSON.stringify([
      { experimentId: 'old-exp', variant: 'A', userId: 'u0', timestamp: '2026-01-01T00:00:00.000Z' },
    ]);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(existing);

    await logExposure('new-exp', 'B', 'u1');

    const written = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1] as string;
    const events = JSON.parse(written) as Array<{ experimentId: string }>;
    expect(events).toHaveLength(2);
    expect(events[1].experimentId).toBe('new-exp');
  });

  test('starts a new array when log is empty', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    await logExposure('exp-1', 'A', 'u1');

    const written = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1] as string;
    const events = JSON.parse(written) as unknown[];
    expect(events).toHaveLength(1);
  });
});

describe('getExposureLog', () => {
  test('returns parsed events', async () => {
    const data = [{ experimentId: 'e', variant: 'A', userId: 'u', timestamp: 't' }];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(data));
    const events = await getExposureLog();
    expect(events).toHaveLength(1);
    expect(events[0].experimentId).toBe('e');
  });

  test('returns empty array when nothing stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const events = await getExposureLog();
    expect(events).toEqual([]);
  });
});

describe('clearExposureLog', () => {
  test('calls removeItem on the exposure log key', async () => {
    await clearExposureLog();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('shiftwell:ab:exposures');
  });
});
