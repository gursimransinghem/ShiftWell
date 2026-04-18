import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { PostHog } from 'posthog-react-native';

// ---------------------------------------------------------------------------
// Tier 1 event name constants
// ---------------------------------------------------------------------------

export const EVENTS = {
  // Onboarding funnel
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_SKIPPED: 'onboarding_skipped',

  // Sleep logging
  SLEEP_LOG_CREATED: 'sleep_log_created',
  SLEEP_LOG_COMPLETED: 'sleep_log_completed',

  // Algorithm engagement
  RECOMMENDATION_VIEWED: 'recommendation_viewed',
  RECOMMENDATION_ACCEPTED: 'recommendation_accepted',
  RECOMMENDATION_DISMISSED: 'recommendation_dismissed',

  // Shift schedule
  SHIFT_SCHEDULE_ENTERED: 'shift_schedule_entered',
  CALENDAR_SYNC_COMPLETED: 'calendar_sync_completed',

  // AI Coach (Tier 3 but defined here for completeness)
  AI_COACH_QUERY_SENT: 'ai_coach_query_sent',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

// ---------------------------------------------------------------------------
// Singleton — set by PostHogBridge on provider mount
// ---------------------------------------------------------------------------

let _posthog: PostHog | null = null;

export function setPostHogInstance(instance: PostHog | null): void {
  _posthog = instance;
}

export function getPostHogInstance(): PostHog | null {
  return _posthog;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Track an event from anywhere in the app (components, stores, utils).
 * Automatically attaches app_version and platform to every event.
 * Inside React components, prefer useTrackEvent() from hooks.ts instead.
 */
export function trackEvent(
  name: string,
  properties?: Record<string, unknown>
): void {
  if (!_posthog) {
    if (__DEV__) {
      console.warn(`[analytics] PostHog not ready — dropping event: ${name}`);
    }
    return;
  }
  _posthog.capture(name, {
    app_version: Constants.expoConfig?.version ?? 'unknown',
    platform: Platform.OS,
    ...properties,
  });
}

/**
 * Associate the current session with an anonymous user ID and non-PII traits.
 * Use the Supabase UUID as userId — NEVER name, email, phone, or birth date.
 */
export function identifyUser(
  userId: string,
  traits: {
    shift_type?: string;
    account_age_days?: number;
    subscription_tier?: 'free' | 'trial' | 'premium' | 'churned';
  }
): void {
  _posthog?.identify(userId, traits);
}

/**
 * Set super properties that persist across all subsequent events.
 */
export function setSuperProperties(properties: Record<string, unknown>): void {
  _posthog?.register(properties);
}

/**
 * Reset the PostHog identity (call on logout).
 */
export function resetAnalyticsIdentity(): void {
  _posthog?.reset();
}
