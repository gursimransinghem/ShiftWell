/**
 * Inline legal strings surfaced in the Privacy / Health modals from the paywall
 * footer. These are short summaries — the authoritative versions live in
 * docs/launch/PRIVACY_POLICY.md and docs/launch/HEALTH_DISCLAIMERS.md and will
 * be served from the marketing site once published.
 *
 * Source of truth: once the marketing site is live, wire the footer links to
 * Linking.openURL() on the hosted copies and keep this file only as an offline
 * fallback.
 */

export const PRIVACY_SUMMARY = `ShiftWell keeps your data on your device.

We do not collect your name, email, sleep times, shift schedule, calendar contents, or HealthKit readings on any ShiftWell server. The only data that leaves your device is anonymous crash and diagnostic telemetry (Sentry) and anonymous product-usage events (PostHog) used to improve the TestFlight build.

If you sign in with Apple or Google, the identity provider issues us a stable user ID — not your name, not your email unless you grant it. Account deletion is one tap from Settings and removes the ID and any server-side state.

HealthKit data stays in HealthKit. ShiftWell reads sleep and heart-rate-variability records you explicitly authorize, computes a local recovery score, and never writes health data back to Apple Health.

Full policy: see docs/launch/PRIVACY_POLICY.md or the marketing site once published.`;

export const HEALTH_DISCLAIMER = `ShiftWell provides general wellness information based on published circadian-rhythm and sleep-medicine research.

It is not a medical device. It does not diagnose, treat, cure, or prevent any condition. Its recommendations — sleep windows, nap timing, caffeine cutoffs, light exposure protocols — are decision-support for healthy adults, not prescriptions.

If you have a diagnosed sleep disorder (insomnia, sleep apnea, Shift Work Sleep Disorder, narcolepsy, restless leg syndrome), a mood disorder, cardiovascular disease, or any condition your clinician is monitoring, consult your healthcare provider before making changes to sleep, caffeine, or shift-timing routines suggested by this app.

Do not operate vehicles or heavy machinery if you are drowsy, regardless of what the app says. Individual results vary.

ShiftWell was built by Dr. Gursimran Singh, an emergency medicine physician, informed by his own practice. The app does not establish a physician-patient relationship, and no individualized medical advice is offered.`;

export const TERMS_SUMMARY = `ShiftWell is a general wellness app that provides schedule-based sleep planning and circadian education.

By using ShiftWell, you agree that recommendations are informational only and are not medical advice, diagnosis, or treatment. You remain responsible for deciding whether a recommendation is safe for your circumstances, work duties, medications, health conditions, and local requirements.

Subscriptions, if purchased, are managed by Apple through your App Store account. Apple shows the final price and renewal terms before purchase, and cancellation is handled in iOS subscription settings.

Use ShiftWell only where it is safe to do so. Do not use the app while driving, operating equipment, or caring for patients.`;

export const SUPPORT_EMAIL = 'shiftwell.app@gmail.com';
