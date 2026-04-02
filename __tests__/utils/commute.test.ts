import { haversineKm, estimateCommuteDuration } from '../../src/utils/commute';

// Mock expo-location
jest.mock('expo-location', () => ({
  geocodeAsync: jest.fn(),
}));

import * as Location from 'expo-location';
const mockGeocode = Location.geocodeAsync as jest.MockedFunction<typeof Location.geocodeAsync>;

describe('haversineKm', () => {
  it('returns 0 for identical points', () => {
    expect(haversineKm(0, 0, 0, 0)).toBe(0);
  });

  it('returns ~111 km for 1 degree longitude at equator', () => {
    const result = haversineKm(0, 0, 0, 1);
    expect(result).toBeGreaterThan(110);
    expect(result).toBeLessThan(112);
  });

  it('returns ~5 km for NYC Midtown to Downtown', () => {
    const result = haversineKm(40.7128, -74.0060, 40.7580, -73.9855);
    expect(result).toBeGreaterThan(4);
    expect(result).toBeLessThan(6);
  });
});

describe('estimateCommuteDuration', () => {
  beforeEach(() => {
    mockGeocode.mockReset();
  });

  it('returns 30 (default) when work geocoding fails', async () => {
    mockGeocode.mockResolvedValue([]);
    const result = await estimateCommuteDuration('nowhere', 'also nowhere');
    expect(result).toBe(30);
  });

  it('returns calculated duration for valid geocoded addresses', async () => {
    // ~30km apart => 60 min at 30km/h
    mockGeocode
      .mockResolvedValueOnce([{ latitude: 0, longitude: 0 }])
      .mockResolvedValueOnce([{ latitude: 0, longitude: 0.27 }]);
    const result = await estimateCommuteDuration('work', 'home');
    expect(result).toBeGreaterThan(55);
    expect(result).toBeLessThan(65);
  });

  it('returns a positive integer', async () => {
    mockGeocode
      .mockResolvedValueOnce([{ latitude: 40.71, longitude: -74.00 }])
      .mockResolvedValueOnce([{ latitude: 40.75, longitude: -73.98 }]);
    const result = await estimateCommuteDuration('downtown', 'midtown');
    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBeGreaterThan(0);
  });

  it('returns 30 when home geocoding returns empty array', async () => {
    mockGeocode
      .mockResolvedValueOnce([{ latitude: 40.71, longitude: -74.00 }])
      .mockResolvedValueOnce([]);
    const result = await estimateCommuteDuration('work address', 'home address');
    expect(result).toBe(30);
  });

  it('returns 30 when geocoding throws an error', async () => {
    mockGeocode.mockRejectedValue(new Error('Geocoding failed'));
    const result = await estimateCommuteDuration('bad address', 'also bad');
    expect(result).toBe(30);
  });
});
