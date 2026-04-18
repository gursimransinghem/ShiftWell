import React, { useEffect } from 'react';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-react-native';
import { setPostHogInstance } from './events';
import { applyStoredOptOutPreference } from './opt-out';

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

function PostHogBridge() {
  const posthog = usePostHog();

  useEffect(() => {
    if (posthog) {
      setPostHogInstance(posthog);
      // Restore stored opt-out preference so analytics state survives app restarts
      applyStoredOptOutPreference().catch(() => {});
    }
    return () => {
      setPostHogInstance(null);
    };
  }, [posthog]);

  return null;
}

interface Props {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: Props) {
  if (!POSTHOG_API_KEY) {
    // No key configured — render children without instrumentation
    return <>{children}</>;
  }

  return (
    <PHProvider
      apiKey={POSTHOG_API_KEY}
      options={{
        host: POSTHOG_HOST,
        // Track app lifecycle events (cold start, background, foreground)
        captureNativeAppLifecycleEvents: true,
        // Avoid resolving IP to geo coordinates (privacy-first)
        disableGeoip: true,
      }}
      autocapture={{
        // Auto-track screen views via Expo Router's navigation container
        captureScreens: true,
        // Touch events are too noisy — we use explicit events instead
        captureTouches: false,
      }}
    >
      <PostHogBridge />
      {children}
    </PHProvider>
  );
}
