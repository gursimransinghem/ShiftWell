/**
 * ShiftWell A/B Testing Framework
 *
 * Deterministic client-side variant assignment based on a hash of
 * experimentId + userId. Supports 2–3 variants per experiment.
 * Assignments are persisted in AsyncStorage and exposure events
 * are stored locally for batch upload.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export type Variant = 'A' | 'B' | 'C';

export interface ExperimentConfig {
  id: string;
  /** Number of variants: 2 → A/B, 3 → A/B/C. Default: 2 */
  variants?: 2 | 3;
}

export interface ExposureEvent {
  experimentId: string;
  variant: Variant;
  userId: string;
  timestamp: string;
}

const ASSIGNMENT_PREFIX = 'shiftwell:ab:assignment:';
const EXPOSURE_LOG_KEY = 'shiftwell:ab:exposures';
const MAX_EXPOSURE_LOG = 500;

// ---------------------------------------------------------------------------
// Deterministic hash
// ---------------------------------------------------------------------------

/**
 * Simple djb2-style hash of a string → unsigned 32-bit integer.
 * Deterministic: same input always produces same output.
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return hash >>> 0; // Coerce to unsigned 32-bit
}

// ---------------------------------------------------------------------------
// Core variant assignment
// ---------------------------------------------------------------------------

/**
 * Return a deterministic variant for the given experiment and user.
 * Variant count defaults to 2 (A/B only).
 *
 * @param experimentId - Unique experiment identifier
 * @param userId       - User identifier
 * @param variantCount - 2 for A/B, 3 for A/B/C
 * @returns 'A', 'B', or 'C'
 */
export function getVariant(
  experimentId: string,
  userId: string,
  variantCount: 2 | 3 = 2,
): Variant {
  const seed = `${experimentId}:${userId}`;
  const hash = hashString(seed);
  const variants: Variant[] = variantCount === 3 ? ['A', 'B', 'C'] : ['A', 'B'];
  return variants[hash % variantCount];
}

// ---------------------------------------------------------------------------
// Persistent assignment (AsyncStorage)
// ---------------------------------------------------------------------------

/**
 * Retrieve a previously stored assignment, or compute and persist a new one.
 * Once assigned, the variant never changes for the same user/experiment pair.
 *
 * @param experimentId - Unique experiment identifier
 * @param userId       - User identifier
 * @param variantCount - 2 for A/B, 3 for A/B/C
 * @returns Resolved variant
 */
export async function getOrAssignVariant(
  experimentId: string,
  userId: string,
  variantCount: 2 | 3 = 2,
): Promise<Variant> {
  const key = `${ASSIGNMENT_PREFIX}${experimentId}:${userId}`;
  const stored = await AsyncStorage.getItem(key);

  if (stored === 'A' || stored === 'B' || stored === 'C') {
    return stored;
  }

  const variant = getVariant(experimentId, userId, variantCount);
  await AsyncStorage.setItem(key, variant);
  return variant;
}

// ---------------------------------------------------------------------------
// Exposure event logging
// ---------------------------------------------------------------------------

/**
 * Log a variant exposure event to AsyncStorage for batch upload later.
 *
 * @param experimentId - Experiment that was exposed
 * @param variant      - Variant the user saw
 * @param userId       - User identifier
 */
export async function logExposure(
  experimentId: string,
  variant: Variant,
  userId: string,
): Promise<void> {
  const event: ExposureEvent = {
    experimentId,
    variant,
    userId,
    timestamp: new Date().toISOString(),
  };

  const raw = await AsyncStorage.getItem(EXPOSURE_LOG_KEY);
  let log: ExposureEvent[] = raw ? (JSON.parse(raw) as ExposureEvent[]) : [];
  log.push(event);
  if (log.length > MAX_EXPOSURE_LOG) {
    log = log.slice(-MAX_EXPOSURE_LOG);
  }
  await AsyncStorage.setItem(EXPOSURE_LOG_KEY, JSON.stringify(log));
}

/**
 * Retrieve all locally stored exposure events (for batch upload).
 *
 * @returns Array of exposure events
 */
export async function getExposureLog(): Promise<ExposureEvent[]> {
  const raw = await AsyncStorage.getItem(EXPOSURE_LOG_KEY);
  return raw ? (JSON.parse(raw) as ExposureEvent[]) : [];
}

/**
 * Clear the exposure log after a successful batch upload.
 */
export async function clearExposureLog(): Promise<void> {
  await AsyncStorage.removeItem(EXPOSURE_LOG_KEY);
}
