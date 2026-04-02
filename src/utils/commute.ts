import * as Location from 'expo-location';

const DEFAULT_COMMUTE_MINUTES = 30;
const URBAN_SPEED_KMH = 30;

/**
 * Calculate great-circle distance between two coordinates.
 * Uses the Haversine formula.
 */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Estimate commute duration in minutes from two address strings.
 * Uses expo-location geocoding + Haversine distance at 30 km/h urban average.
 * Returns DEFAULT_COMMUTE_MINUTES (30) if geocoding fails or returns empty results.
 */
export async function estimateCommuteDuration(
  workAddress: string,
  homeAddress: string,
): Promise<number> {
  try {
    const [work, home] = await Promise.all([
      Location.geocodeAsync(workAddress),
      Location.geocodeAsync(homeAddress),
    ]);
    if (!work.length || !home.length) return DEFAULT_COMMUTE_MINUTES;

    const distanceKm = haversineKm(
      work[0].latitude,
      work[0].longitude,
      home[0].latitude,
      home[0].longitude,
    );
    return Math.max(1, Math.round((distanceKm / URBAN_SPEED_KMH) * 60));
  } catch {
    return DEFAULT_COMMUTE_MINUTES;
  }
}
