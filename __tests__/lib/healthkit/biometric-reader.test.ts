/**
 * TDD: biometric-reader — Phase 14 Biometric Readers + Device-Tier Detection
 *
 * Tests for:
 * - fetchOvernightHRV: mean SDNN from samples, null on no data
 * - fetchRestingHeartRate: latest daily value, null when absent
 * - fetchSleepingWristTemperature: returns null on unsupported device
 * - fetchDailyStepCount: sums step samples for the day
 * - detectDeviceTier: correct tier based on available data types
 */

import {
  fetchOvernightHRV,
  fetchRestingHeartRate,
  fetchSleepingWristTemperature,
  fetchDailyStepCount,
  detectDeviceTier,
} from '../../../src/lib/healthkit/biometric-reader';

// ---------------------------------------------------------------------------
// HealthKit mock
// ---------------------------------------------------------------------------

// Use the global auto-mock via moduleNameMapper, then spy on specific methods
const mockModule = require('@kingstinct/react-native-healthkit');
const HealthKit = mockModule.default;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SLEEP_START = new Date('2026-04-10T23:00:00.000Z');
const SLEEP_END = new Date('2026-04-11T07:00:00.000Z');
const TODAY = new Date('2026-04-10T12:00:00.000Z');

function makeQuantitySample(quantity: number, deviceName?: string) {
  return {
    quantity,
    startDate: SLEEP_START.toISOString(),
    endDate: SLEEP_END.toISOString(),
    ...(deviceName ? { sourceRevision: { source: { name: deviceName } } } : {}),
  };
}

// ---------------------------------------------------------------------------
// fetchOvernightHRV
// ---------------------------------------------------------------------------

describe('fetchOvernightHRV', () => {
  let queryQuantitySpy: jest.SpyInstance;

  beforeEach(() => {
    queryQuantitySpy = jest
      .spyOn(HealthKit, 'queryQuantitySamples')
      .mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns mean SDNN from multiple samples', async () => {
    queryQuantitySpy.mockResolvedValue([
      makeQuantitySample(40.0),
      makeQuantitySample(60.0),
    ]);

    const result = await fetchOvernightHRV(SLEEP_START, SLEEP_END);
    expect(result).toBe(50.0); // (40 + 60) / 2
  });

  it('returns null when no HRV data in window', async () => {
    queryQuantitySpy.mockResolvedValue([]);
    const result = await fetchOvernightHRV(SLEEP_START, SLEEP_END);
    expect(result).toBeNull();
  });

  it('returns null when HealthKit query throws', async () => {
    queryQuantitySpy.mockRejectedValue(new Error('HealthKit unavailable'));
    const result = await fetchOvernightHRV(SLEEP_START, SLEEP_END);
    expect(result).toBeNull();
  });

  it('rounds result to one decimal place', async () => {
    queryQuantitySpy.mockResolvedValue([
      makeQuantitySample(33.33),
      makeQuantitySample(33.34),
    ]);
    const result = await fetchOvernightHRV(SLEEP_START, SLEEP_END);
    // (33.33 + 33.34) / 2 = 33.335 → rounded to 1 decimal = 33.3
    expect(result).toBe(33.3);
  });

  it('calls queryQuantitySamples with correct window', async () => {
    queryQuantitySpy.mockResolvedValue([]);
    await fetchOvernightHRV(SLEEP_START, SLEEP_END);

    expect(queryQuantitySpy).toHaveBeenCalledWith(
      expect.stringContaining('HeartRateVariabilitySDNN'),
      expect.objectContaining({ from: SLEEP_START, to: SLEEP_END }),
    );
  });
});

// ---------------------------------------------------------------------------
// fetchRestingHeartRate
// ---------------------------------------------------------------------------

describe('fetchRestingHeartRate', () => {
  let queryQuantitySpy: jest.SpyInstance;

  beforeEach(() => {
    queryQuantitySpy = jest
      .spyOn(HealthKit, 'queryQuantitySamples')
      .mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the latest resting HR value for the day', async () => {
    queryQuantitySpy.mockResolvedValue([
      makeQuantitySample(58),
      makeQuantitySample(62), // latest
    ]);

    const result = await fetchRestingHeartRate(TODAY);
    expect(result).toBe(62); // last sample in the array
  });

  it('returns null when no resting HR data for the day', async () => {
    queryQuantitySpy.mockResolvedValue([]);
    const result = await fetchRestingHeartRate(TODAY);
    expect(result).toBeNull();
  });

  it('returns null when HealthKit query throws', async () => {
    queryQuantitySpy.mockRejectedValue(new Error('HealthKit unavailable'));
    const result = await fetchRestingHeartRate(TODAY);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// fetchSleepingWristTemperature
// ---------------------------------------------------------------------------

describe('fetchSleepingWristTemperature', () => {
  let queryQuantitySpy: jest.SpyInstance;

  beforeEach(() => {
    queryQuantitySpy = jest
      .spyOn(HealthKit, 'queryQuantitySamples')
      .mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns null when device does not support the identifier (query throws)', async () => {
    // Simulate older iOS/device where this HK identifier doesn't exist
    queryQuantitySpy.mockRejectedValue(new Error('Invalid HK identifier'));
    const result = await fetchSleepingWristTemperature(SLEEP_START, SLEEP_END);
    expect(result).toBeNull();
  });

  it('returns null when no temperature samples in window', async () => {
    queryQuantitySpy.mockResolvedValue([]);
    const result = await fetchSleepingWristTemperature(SLEEP_START, SLEEP_END);
    expect(result).toBeNull();
  });

  it('returns mean delta Celsius when samples are available', async () => {
    queryQuantitySpy.mockResolvedValue([
      makeQuantitySample(0.3),
      makeQuantitySample(0.5),
    ]);

    const result = await fetchSleepingWristTemperature(SLEEP_START, SLEEP_END);
    expect(result).toBe(0.4); // (0.3 + 0.5) / 2
  });
});

// ---------------------------------------------------------------------------
// fetchDailyStepCount
// ---------------------------------------------------------------------------

describe('fetchDailyStepCount', () => {
  let queryStatsSpy: jest.SpyInstance;
  let queryQuantitySpy: jest.SpyInstance;

  beforeEach(() => {
    queryStatsSpy = jest
      .spyOn(HealthKit, 'queryStatisticsForQuantity')
      .mockResolvedValue(null);
    queryQuantitySpy = jest
      .spyOn(HealthKit, 'queryQuantitySamples')
      .mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns 0 when no step data available', async () => {
    queryStatsSpy.mockResolvedValue(null);
    queryQuantitySpy.mockResolvedValue([]);

    const result = await fetchDailyStepCount(TODAY);
    expect(result).toBe(0);
  });

  it('returns 0 when HealthKit throws', async () => {
    queryStatsSpy.mockRejectedValue(new Error('HealthKit unavailable'));
    const result = await fetchDailyStepCount(TODAY);
    expect(result).toBe(0);
  });

  it('sums step samples when statistics not available', async () => {
    queryStatsSpy.mockResolvedValue(null);
    queryQuantitySpy.mockResolvedValue([
      makeQuantitySample(3000),
      makeQuantitySample(4500),
    ]);

    const result = await fetchDailyStepCount(TODAY);
    expect(result).toBe(7500);
  });

  it('returns statistics quantity when available', async () => {
    queryStatsSpy.mockResolvedValue({ averageQuantity: { quantity: 8200 } });

    const result = await fetchDailyStepCount(TODAY);
    expect(result).toBe(8200);
  });
});

// ---------------------------------------------------------------------------
// detectDeviceTier
// ---------------------------------------------------------------------------

describe('detectDeviceTier', () => {
  let queryQuantitySpy: jest.SpyInstance;

  beforeEach(() => {
    queryQuantitySpy = jest
      .spyOn(HealthKit, 'queryQuantitySamples')
      .mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns iphone-only when no HRV data available', async () => {
    queryQuantitySpy.mockResolvedValue([]); // no HRV
    const result = await detectDeviceTier();
    expect(result).toBe('iphone-only');
  });

  it('returns watch-basic when HRV present but no wrist temperature', async () => {
    let callCount = 0;
    queryQuantitySpy.mockImplementation(() => {
      callCount++;
      // First call = HRV (has data), second call = temperature (no data)
      return Promise.resolve(callCount === 1 ? [makeQuantitySample(45)] : []);
    });

    const result = await detectDeviceTier();
    expect(result).toBe('watch-basic');
  });

  it('returns watch-advanced when both HRV and wrist temperature present', async () => {
    // Both HRV and temperature calls return data
    queryQuantitySpy.mockResolvedValue([makeQuantitySample(45)]);

    const result = await detectDeviceTier();
    expect(result).toBe('watch-advanced');
  });

  it('returns watch-basic when temperature identifier throws (older device)', async () => {
    let callCount = 0;
    queryQuantitySpy.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve([makeQuantitySample(45)]); // HRV: has data
      }
      throw new Error('HK identifier not available on this device'); // temperature: unsupported
    });

    const result = await detectDeviceTier();
    expect(result).toBe('watch-basic');
  });

  it('returns iphone-only when HealthKit throws entirely', async () => {
    queryQuantitySpy.mockRejectedValue(new Error('HealthKit unavailable'));
    const result = await detectDeviceTier();
    expect(result).toBe('iphone-only');
  });
});
