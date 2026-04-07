/**
 * Tests for hrv-reader: getOvernightHRV and getHRVBaseline.
 *
 * HealthKit is mocked via __mocks__/healthkit.js (jest moduleNameMapper).
 * We spy on the HealthKit default object's methods to control return values.
 */

import { getOvernightHRV, getHRVBaseline } from '../../src/lib/healthkit/hrv-reader';

// ── HealthKit mock ────────────────────────────────────────────────────────────

// The mock module is auto-applied via jest moduleNameMapper.
// Import the mock's default object so we can spy on its methods.
const mockModule = require('@kingstinct/react-native-healthkit');
const HealthKit = mockModule.default;

// ── Helpers ───────────────────────────────────────────────────────────────────

// Use noon local time to avoid timezone boundary issues with date formatting
const NIGHT = new Date('2026-04-10T12:00:00.000');  // noon local time

function makeHRVSample(rmssd: number, deviceName?: string) {
  return {
    quantity: rmssd,
    startDate: new Date('2026-04-10T02:00:00.000Z').toISOString(),
    endDate: new Date('2026-04-10T02:05:00.000Z').toISOString(),
    ...(deviceName ? { sourceRevision: { source: { name: deviceName } } } : {}),
  };
}

// ── getOvernightHRV ───────────────────────────────────────────────────────────

describe('getOvernightHRV', () => {
  let queryQuantitySpy: jest.SpyInstance;
  let queryStatsSpy: jest.SpyInstance;

  beforeEach(() => {
    queryQuantitySpy = jest
      .spyOn(HealthKit, 'queryQuantitySamples')
      .mockResolvedValue([]);
    queryStatsSpy = jest
      .spyOn(HealthKit, 'queryStatisticsForQuantity')
      .mockResolvedValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns null when HealthKit returns no HRV samples', async () => {
    queryQuantitySpy.mockResolvedValue([]);
    const result = await getOvernightHRV(NIGHT);
    expect(result).toBeNull();
  });

  it('returns null when HealthKit throws', async () => {
    queryQuantitySpy.mockRejectedValue(new Error('HealthKit unavailable'));
    const result = await getOvernightHRV(NIGHT);
    expect(result).toBeNull();
  });

  it('returns a reading with correct rmssd when samples are available', async () => {
    queryQuantitySpy.mockResolvedValue([
      makeHRVSample(45.0, 'Apple Watch Series 9'),
      makeHRVSample(55.0, 'Apple Watch Series 9'),
    ]);
    queryStatsSpy.mockResolvedValue({ averageQuantity: { quantity: 58 } });

    const result = await getOvernightHRV(NIGHT);
    expect(result).not.toBeNull();
    expect(result!.rmssd).toBe(50.0); // (45 + 55) / 2
    expect(result!.heartRate).toBe(58);
    expect(result!.source).toBe('Apple Watch Series 9');
    expect(result!.dateISO).toBe('2026-04-10');
  });

  it('rounds rmssd to one decimal place', async () => {
    queryQuantitySpy.mockResolvedValue([
      makeHRVSample(33.33, 'Apple Watch'),
      makeHRVSample(33.34, 'Apple Watch'),
    ]);
    queryStatsSpy.mockResolvedValue({ averageQuantity: { quantity: 60 } });

    const result = await getOvernightHRV(NIGHT);
    expect(result).not.toBeNull();
    // (33.33 + 33.34) / 2 = 33.335 → rounds to 33.3
    expect(result!.rmssd).toBe(33.3);
  });

  it('uses fallback heart rate of 60 when HR stats unavailable', async () => {
    queryQuantitySpy.mockResolvedValue([makeHRVSample(40.0, 'Apple Watch')]);
    queryStatsSpy.mockResolvedValue(null);

    const result = await getOvernightHRV(NIGHT);
    expect(result).not.toBeNull();
    expect(result!.heartRate).toBe(60);
  });

  it('uses source from first sample with a name', async () => {
    queryQuantitySpy.mockResolvedValue([
      makeHRVSample(42.0, 'Apple Watch Ultra 2'),
    ]);
    queryStatsSpy.mockResolvedValue({ averageQuantity: { quantity: 55 } });

    const result = await getOvernightHRV(NIGHT);
    expect(result!.source).toBe('Apple Watch Ultra 2');
  });

  it('falls back to "Apple Watch" when sample has no source name', async () => {
    queryQuantitySpy.mockResolvedValue([makeHRVSample(40.0)]);
    queryStatsSpy.mockResolvedValue({ averageQuantity: { quantity: 62 } });

    const result = await getOvernightHRV(NIGHT);
    expect(result!.source).toBe('Apple Watch');
  });

  it('filters window correctly — queries from 10 PM to 8 AM next day', async () => {
    queryQuantitySpy.mockResolvedValue([]);

    await getOvernightHRV(NIGHT);

    expect(queryQuantitySpy).toHaveBeenCalledTimes(1);
    const callArgs = queryQuantitySpy.mock.calls[0];
    const opts = callArgs[1];
    const fromHour = (opts.from as Date).getHours();
    const toHour = (opts.to as Date).getHours();
    expect(fromHour).toBe(22); // 10 PM
    expect(toHour).toBe(8);   // 8 AM
  });
});

// ── getHRVBaseline ────────────────────────────────────────────────────────────

describe('getHRVBaseline', () => {
  let queryQuantitySpy: jest.SpyInstance;
  let queryStatsSpy: jest.SpyInstance;

  beforeEach(() => {
    queryQuantitySpy = jest
      .spyOn(HealthKit, 'queryQuantitySamples')
      .mockResolvedValue([]);
    queryStatsSpy = jest
      .spyOn(HealthKit, 'queryStatisticsForQuantity')
      .mockResolvedValue({ averageQuantity: { quantity: 60 } });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns null when no readings found across all nights', async () => {
    queryQuantitySpy.mockResolvedValue([]);
    const result = await getHRVBaseline(14);
    expect(result).toBeNull();
  });

  it('computes mean and std from available readings', async () => {
    // Return data for first 3 nights, empty for the rest
    let callCount = 0;
    queryQuantitySpy.mockImplementation(() => {
      callCount++;
      if (callCount <= 3) {
        const rmssd = [40, 60, 50][callCount - 1];
        return Promise.resolve([makeHRVSample(rmssd, 'Apple Watch')]);
      }
      return Promise.resolve([]);
    });

    const result = await getHRVBaseline(14);
    expect(result).not.toBeNull();
    expect(result!.readings).toBe(3);
    expect(result!.meanRMSSD).toBe(50.0); // (40+60+50)/3
    // variance = ((40-50)^2 + (60-50)^2 + (50-50)^2) / 3 = 200/3 ≈ 66.67
    // std ≈ 8.165 → rounds to 8.2
    expect(result!.stdRMSSD).toBeCloseTo(8.2, 0);
  });

  it('counts only nights with data in the readings field', async () => {
    let callCount = 0;
    queryQuantitySpy.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve([makeHRVSample(45.0, 'Apple Watch')]);
      }
      return Promise.resolve([]);
    });

    const result = await getHRVBaseline(7);
    expect(result!.readings).toBe(1);
  });
});
