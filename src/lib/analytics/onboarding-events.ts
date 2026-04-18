/**
 * Typed analytics helpers for the onboarding funnel.
 * Each call goes through the PostHog pipeline via trackEvent().
 *
 * Target metrics:
 *   - Onboarding completion ≥ 80%
 *   - Time-to-first-plan ≤ 90 seconds
 *   - Per-screen drop-off ≤ 8%
 */

import { trackEvent } from './events';

export type OnboardingScreen =
  | 'welcome'
  | 'chronotype'
  | 'sleep-and-naps'
  | 'household'
  | 'shifts'
  | 'plan-ready';

export type ShiftImportMethod = 'calendar' | 'manual' | 'demo';
export type NotificationPermissionResponse = 'granted' | 'denied' | 'deferred';

export function trackOnboardingScreenViewed(
  screen: OnboardingScreen,
  startedAt: number,
): void {
  trackEvent('onboarding_screen_viewed', {
    screen,
    session_elapsed_ms: Date.now() - startedAt,
  });
}

export function trackOnboardingScreenCompleted(
  screen: OnboardingScreen,
  timeOnScreenMs: number,
): void {
  trackEvent('onboarding_screen_completed', {
    screen,
    time_on_screen_ms: timeOnScreenMs,
  });
}

export function trackOnboardingScreenSkipped(screen: OnboardingScreen): void {
  trackEvent('onboarding_screen_skipped', { screen });
}

export function trackOnboardingCompleted(totalMs: number): void {
  trackEvent('onboarding_completed', {
    total_time_ms: totalMs,
    met_90s_target: totalMs <= 90_000,
  });
}

export function trackOnboardingSkipped(): void {
  trackEvent('onboarding_skipped', {});
}

export function trackShiftImportMethod(method: ShiftImportMethod): void {
  trackEvent('shift_import_method', { method });
}

export function trackNotificationPermissionResponse(
  response: NotificationPermissionResponse,
): void {
  trackEvent('notification_permission_response', { response });
}
