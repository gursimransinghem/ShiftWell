import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPostHogInstance } from './events';

const OPT_OUT_KEY = 'analytics_opt_out';

/**
 * Disable all analytics tracking.
 * Persists the preference to AsyncStorage so it survives app restarts.
 * The PostHog SDK's optOut() ensures zero network calls are made.
 */
export async function disableAnalytics(): Promise<void> {
  await AsyncStorage.setItem(OPT_OUT_KEY, 'true');
  getPostHogInstance()?.optOut();
}

/**
 * Re-enable analytics tracking after a previous opt-out.
 * Clears the opt-out flag and resumes PostHog capturing.
 */
export async function enableAnalytics(): Promise<void> {
  await AsyncStorage.setItem(OPT_OUT_KEY, 'false');
  getPostHogInstance()?.optIn();
}

/**
 * Returns true if analytics are currently enabled (default).
 * Reads from AsyncStorage — use this to initialize a settings toggle.
 */
export async function getAnalyticsEnabled(): Promise<boolean> {
  const val = await AsyncStorage.getItem(OPT_OUT_KEY);
  return val !== 'true';
}

/**
 * Called by PostHogBridge on provider mount.
 * Re-applies any stored opt-out preference so the setting persists across cold starts.
 */
export async function applyStoredOptOutPreference(): Promise<void> {
  const enabled = await getAnalyticsEnabled();
  if (!enabled) {
    getPostHogInstance()?.optOut();
  }
}
