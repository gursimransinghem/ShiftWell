import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { usePostHog } from 'posthog-react-native';
import Constants from 'expo-constants';

// ---------------------------------------------------------------------------
// useScreenTracking — auto-fires screen_viewed on mount
// ---------------------------------------------------------------------------

/**
 * Call at the top of any screen component to record that the screen was opened.
 * Uses the PostHog context directly so the event goes through the same pipeline
 * as autocaptured screen views, with opt-out respected automatically.
 */
export function useScreenTracking(screenName: string): void {
  const posthog = usePostHog();

  useEffect(() => {
    posthog?.capture('screen_viewed', {
      screen_name: screenName,
      app_version: Constants.expoConfig?.version ?? 'unknown',
      platform: Platform.OS,
    });
    // screenName is expected to be a static string — re-firing on change is correct
  }, [posthog, screenName]);
}

// ---------------------------------------------------------------------------
// useTrackEvent — context-aware event tracker for components
// ---------------------------------------------------------------------------

/**
 * Returns a stable trackEvent function bound to the current PostHog context.
 * Prefer this inside React components; use trackEvent() from events.ts
 * inside Zustand stores or non-React utilities.
 */
export function useTrackEvent(): (
  name: string,
  properties?: Record<string, unknown>
) => void {
  const posthog = usePostHog();

  return useCallback(
    (name: string, properties?: Record<string, unknown>) => {
      posthog?.capture(name, {
        app_version: Constants.expoConfig?.version ?? 'unknown',
        platform: Platform.OS,
        ...properties,
      });
    },
    [posthog]
  );
}
