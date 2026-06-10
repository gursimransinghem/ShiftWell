# ShiftWell Analytics Instrumentation Plan

## 1. Tool Selection

### Comparison Matrix

| Criteria | PostHog | Mixpanel | Amplitude |
|---|---|---|---|
| **Expo/RN SDK** | First-party `posthog-react-native` with Expo tutorial. Auto-captures screens when wrapped in `PostHogProvider` under `NavigationContainer`. | `mixpanel-react-native` npm package. Manual screen tracking required. | `@amplitude/react-native`. Note: Expo Go not supported — requires dev builds only. |
| **Free Tier** | 1M events/mo, 5K session replays, 1M feature flag requests | 20M events/mo (as of Feb 2026 event-based pricing switch), 12-month retention | 10M events/mo, 50K MTUs, 1K session replays |
| **HIPAA / BAA** | BAA available on Teams plan with Boost/Scale add-on (~$450/mo+). Single BAA covers analytics, replays, flags, experiments. | BAA only on Enterprise plan (custom pricing, typically $25K+/yr). | BAA only on Enterprise plan (custom pricing, typically $50K+/yr). |
| **Self-Hosting** | Open source (MIT). Self-host option exists but only cost-effective at 100M+ events/mo. | No self-host option. | No self-host option. |
| **Event Model** | Event-based. Autocapture + manual events. | Event-based (switched from MTU Feb 2026). | MTU + event hybrid. |
| **Extras Included** | Session replay, feature flags, A/B testing, surveys, error tracking — all in one. | Session replay and feature flags added late 2025. Core analytics strongest. | Session replay, feature flags, A/B testing, cohorts. |
| **Data Residency** | US and EU cloud options. | US and EU. | US and EU. |

### Recommendation: PostHog

PostHog is the right choice for ShiftWell's beta and beyond. Here's why:

**1. Best Expo/RN integration.** PostHog has a dedicated Expo tutorial, auto-screen-capture that works with `@react-navigation`, and peer dependencies that are all Expo-compatible (`expo-file-system`, `expo-application`, `expo-device`, `expo-localization`). Install is one command.

**2. Most accessible HIPAA path.** PostHog's BAA is available on their Teams plan with a platform add-on — roughly $450/mo at scale. Mixpanel and Amplitude both gate BAAs behind Enterprise contracts starting at $25K–$50K/yr. For a bootstrapped beta, PostHog is the only realistic HIPAA-ready option. During the free-tier beta phase (before handling PHI), we can start without a BAA and upgrade when needed.

**3. All-in-one platform.** Feature flags, A/B testing, session replay, and surveys ship with PostHog. This means one SDK, one vendor, one BAA. For ShiftWell's beta, session replay is especially valuable — watching real users stumble through onboarding is worth more than any funnel chart.

**4. Free tier is sufficient for beta.** 1M events/mo covers 50 beta users comfortably. At ~20 events/session and 2 sessions/day, 50 users generate ~60K events/mo — 6% of the free cap. Even at 500 users, we'd stay under the limit.

**5. Open source escape hatch.** If costs become unreasonable at scale or regulatory requirements tighten, self-hosting is an option (though not recommended at our scale).

**What PostHog is weaker at:** Mixpanel has a marginally more polished query builder for ad-hoc analytics. Amplitude has stronger built-in behavioral cohorts. Neither advantage matters at 50 users.

### Phase Plan

| Phase | Timeline | PostHog Plan | BAA Status | Est. Cost |
|---|---|---|---|---|
| Beta (50 users) | Months 1–3 | Free tier | Not needed (no PHI in events) | $0 |
| Early growth (500 users) | Months 4–6 | Free tier | Not needed | $0 |
| Scale (5K+ users) | Months 7–12 | Teams + platform add-on | Execute BAA | ~$450/mo |

---

## 2. Core Events to Track

Events are prioritized into three tiers based on what matters most for beta success.

### Tier 1 — Must Have for Beta Launch

These events answer: "Is the product working? Are people getting value?"

#### Onboarding Funnel

| Event Name | Trigger | Key Properties |
|---|---|---|
| `onboarding_started` | User lands on `welcome` screen | `source` (organic, referral, ad) |
| `onboarding_step_viewed` | Each onboarding screen loads | `step_name` (welcome, chronotype, calendar, healthkit, preferences, household, addresses, am_routine, pm_routine), `step_index`, `time_on_previous_step_sec` |
| `onboarding_step_completed` | User advances past a step | `step_name`, `step_index`, `selections` (object), `duration_sec` |
| `onboarding_abandoned` | User closes app or navigates back to auth during onboarding | `last_step_name`, `last_step_index`, `total_time_sec` |
| `onboarding_completed` | User finishes final onboarding screen | `total_duration_sec`, `steps_completed`, `chronotype`, `schedule_type` |

#### Sleep Logging

| Event Name | Trigger | Key Properties |
|---|---|---|
| `sleep_log_created` | User saves a sleep entry | `entry_method` (manual, healthkit_auto, healthkit_edited), `sleep_duration_min`, `quality_rating`, `shift_type` |
| `sleep_log_edited` | User modifies existing entry | `fields_changed` (array), `time_since_creation_hr` |
| `sleep_log_deleted` | User removes an entry | `age_of_entry_hr` |

#### Algorithm Engagement

| Event Name | Trigger | Key Properties |
|---|---|---|
| `plan_generated` | Circadian plan created/refreshed | `shift_type`, `plan_duration_days`, `block_count`, `includes_nap`, `includes_light_rx` |
| `plan_viewed` | User opens the circadian tab | `plan_age_hr`, `blocks_remaining` |
| `recommendation_accepted` | User taps "Add to Calendar" or marks a block done | `block_type` (sleep, nap, light, meal, caffeine_cutoff), `adherence_pct` |
| `recommendation_dismissed` | User swipes away or ignores a block | `block_type`, `reason` (if prompted) |

#### Shift Schedule

| Event Name | Trigger | Key Properties |
|---|---|---|
| `shift_added` | User creates a shift | `entry_method` (manual, calendar_import, ical_sync), `shift_type` (day, evening, night, 24hr), `shift_duration_hr` |
| `schedule_imported` | User imports from calendar | `source` (google, apple, ical_url), `shifts_imported_count`, `date_range_days` |
| `schedule_pattern_detected` | App identifies a rotation pattern | `pattern_type` (fixed_night, rotating_2wk, 24_48, custom), `confidence_score` |

### Tier 2 — Important for Retention Analysis

These events answer: "Are people coming back? What features drive retention?"

#### Session & Retention

| Event Name | Trigger | Key Properties |
|---|---|---|
| `app_opened` | App enters foreground | `session_gap_hr` (time since last session), `notification_driven` (bool), `day_of_week` |
| `tab_viewed` | User switches to a main tab | `tab_name` (home, schedule, circadian, brief, outcomes, profile, settings) |
| `feature_used` | User engages with a specific feature | `feature_name`, `is_premium` (bool), `duration_sec` |

#### Premium & Paywall

| Event Name | Trigger | Key Properties |
|---|---|---|
| `paywall_viewed` | Paywall screen loads | `trigger` (feature_gate, settings_tap, trial_prompt), `source_screen` |
| `trial_started` | User begins 7-day premium trial | `trigger_source` |
| `subscription_purchased` | Purchase confirmed | `plan` (annual), `price`, `trial_converted` (bool) |
| `subscription_cancelled` | User cancels | `days_subscribed`, `reason` (if captured) |
| `premium_feature_gated` | User hits a premium wall | `feature_name`, `user_action` (viewed_paywall, dismissed) |

### Tier 3 — Nice to Have Post-Beta

#### AI Coach

| Event Name | Trigger | Key Properties |
|---|---|---|
| `coach_query_sent` | User sends a message to AI coach | `topic_category` (sleep, energy, schedule, nutrition, general), `query_length_chars` |
| `coach_response_rated` | User rates a response | `rating` (helpful, not_helpful), `topic_category` |
| `coach_session_duration` | Coach view closed | `messages_sent`, `duration_sec` |

#### Weekly Brief

| Event Name | Trigger | Key Properties |
|---|---|---|
| `brief_generated` | Weekly brief is created | `week_number`, `metrics_included` (array) |
| `brief_viewed` | User opens the brief tab | `brief_age_hr`, `scroll_depth_pct` |
| `brief_action_taken` | User taps a CTA in the brief | `action_type` |

#### Outcomes & Scoring

| Event Name | Trigger | Key Properties |
|---|---|---|
| `score_viewed` | User checks their circadian score | `score_value`, `trend` (improving, declining, stable) |
| `outcomes_viewed` | User opens outcomes tab | `time_range_selected` |

---

## 3. Event Taxonomy

### Naming Convention

All event names follow `object_action` in `snake_case`:

```
{object}_{action}

Examples:
  sleep_log_created      (not: createSleepLog, SleepLogCreated)
  onboarding_completed   (not: Onboarding Completed, onboardingDone)
  plan_generated         (not: generatePlan)
```

Rules:
- Object first, then past-tense verb: `sleep_log_created`, `plan_viewed`, `shift_added`
- All lowercase `snake_case` — no camelCase, no spaces, no hyphens
- Maximum 40 characters
- Use `_viewed` for passive screen loads, `_completed` for user-driven completions, `_created` for new entities

### Property Schema

Every event automatically includes these **super properties** (set once, sent with all events):

```typescript
// Super properties — set on identify, sent automatically
interface SuperProperties {
  app_version: string;          // e.g., "1.0.0"
  platform: 'ios' | 'android';
  os_version: string;           // e.g., "17.4"
  device_model: string;         // e.g., "iPhone 15 Pro" (from expo-device)
  locale: string;               // e.g., "en-US"
  timezone: string;             // e.g., "America/New_York"
  is_premium: boolean;
  account_age_days: number;
  onboarding_complete: boolean;
  schedule_type: string;        // "fixed_night" | "rotating" | "24_48" | "custom" | "none"
  chronotype: string;           // "early_bird" | "night_owl" | "intermediate" | "unset"
}
```

**User properties** (set on the user profile, not per-event):

```typescript
interface UserProperties {
  created_at: string;            // ISO date of signup
  onboarding_completed_at: string | null;
  shift_count: number;
  sleep_logs_count: number;
  plan_generation_count: number;
  last_active_at: string;        // ISO date
  subscription_status: 'free' | 'trial' | 'premium' | 'churned';
  trial_start_date: string | null;
  referral_source: string | null;
}
```

**Event-specific properties** follow these conventions:
- Duration always in `_sec` or `_min` or `_hr` suffix
- Counts always in `_count` suffix
- Booleans prefixed with `is_` or `has_` (e.g., `is_premium`, `has_notification`)
- Timestamps in ISO 8601 format
- Enums as `snake_case` strings (not numbers)
- No arrays of objects — flatten or use JSON strings

### Property Do-Not-Track List

Never include in any event property:
- Name, email, phone, address (PII)
- Exact birth date (use age range if needed)
- IP address (PostHog can be configured to discard)
- Exact sleep/wake times (use duration and shift-relative offsets)
- Health conditions or diagnoses
- Free-text that might contain PII (sanitize coach queries)

---

## 4. Implementation Guide

### 4.1 Install Dependencies

```bash
npx expo install posthog-react-native expo-file-system expo-application expo-device expo-localization
```

### 4.2 Analytics Provider

Create `src/lib/analytics/posthog-provider.tsx`:

```tsx
import React from 'react';
import { PostHogProvider as PHProvider } from 'posthog-react-native';

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? '';
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

interface Props {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: Props) {
  // Respect user's opt-out preference
  // This is checked in the Zustand user store
  return (
    <PHProvider
      apiKey={POSTHOG_API_KEY}
      options={{
        host: POSTHOG_HOST,
        // Disable autocapture of touches — we use explicit events
        autocapture: false,
        // Enable automatic screen tracking with Expo Router
        captureNativeAppLifecycleEvents: true,
        // Disable capturing IP for privacy
        captureMode: 'form',
      }}
      autocapture={{
        captureScreens: true,  // auto-track screen views
        captureTouches: false, // too noisy, use explicit events
      }}
    >
      {children}
    </PHProvider>
  );
}
```

### 4.3 Wire Into Root Layout

In `app/_layout.tsx`, wrap the existing providers:

```tsx
import { AnalyticsProvider } from '@/lib/analytics/posthog-provider';

export default function RootLayout() {
  return (
    <AnalyticsProvider>
      {/* ...existing NavigationContainer / ThemeProvider / etc. */}
    </AnalyticsProvider>
  );
}
```

### 4.4 Analytics Helper Module

Create `src/lib/analytics/track.ts` — a thin wrapper so the rest of the app never imports PostHog directly:

```typescript
import { usePostHog } from 'posthog-react-native';

// For use inside React components
export { usePostHog } from 'posthog-react-native';

// For use outside React (e.g., in Zustand stores, utils)
let posthogInstance: ReturnType<typeof usePostHog> | null = null;

export function setPostHogInstance(instance: ReturnType<typeof usePostHog>) {
  posthogInstance = instance;
}

/**
 * Track an event from anywhere in the app.
 * Inside React components, prefer usePostHog().capture() directly.
 * This is for Zustand stores, utils, and background tasks.
 */
export function track(event: string, properties?: Record<string, unknown>) {
  if (!posthogInstance) {
    if (__DEV__) console.warn(`[analytics] PostHog not initialized, dropping: ${event}`);
    return;
  }
  posthogInstance.capture(event, properties);
}

/**
 * Identify a user and set user properties.
 * Call after login or signup. Uses anonymous ID, NOT email or name.
 */
export function identify(
  anonymousUserId: string,
  properties?: Record<string, unknown>
) {
  posthogInstance?.identify(anonymousUserId, properties);
}

/**
 * Reset identity on logout.
 */
export function resetIdentity() {
  posthogInstance?.reset();
}

/**
 * Set super properties that persist across all events.
 */
export function setSuperProperties(properties: Record<string, unknown>) {
  posthogInstance?.register(properties);
}
```

### 4.5 Initialize PostHog Instance Reference

Create a small component mounted inside `AnalyticsProvider` that bridges the hook to the imperative API:

```tsx
// src/lib/analytics/PostHogBridge.tsx
import { useEffect } from 'react';
import { usePostHog } from 'posthog-react-native';
import { setPostHogInstance } from './track';

export function PostHogBridge() {
  const posthog = usePostHog();

  useEffect(() => {
    setPostHogInstance(posthog);
  }, [posthog]);

  return null;
}
```

Add `<PostHogBridge />` inside `AnalyticsProvider`, right after `<PHProvider>`.

### 4.6 Example: Onboarding Step Tracking

In `app/(onboarding)/_layout.tsx` or each individual step screen:

```tsx
import { usePostHog } from '@/lib/analytics/track';
import { useRef, useEffect } from 'react';

const ONBOARDING_STEPS = [
  'welcome', 'chronotype', 'calendar', 'healthkit',
  'preferences', 'household', 'addresses', 'am_routine', 'pm_routine',
] as const;

export default function ChronotypeScreen() {
  const posthog = usePostHog();
  const enteredAt = useRef(Date.now());

  useEffect(() => {
    posthog?.capture('onboarding_step_viewed', {
      step_name: 'chronotype',
      step_index: 1,
    });
    enteredAt.current = Date.now();
  }, []);

  const handleNext = (selectedType: string) => {
    const durationSec = Math.round((Date.now() - enteredAt.current) / 1000);
    posthog?.capture('onboarding_step_completed', {
      step_name: 'chronotype',
      step_index: 1,
      duration_sec: durationSec,
      selections: { chronotype: selectedType },
    });
    router.push('/(onboarding)/calendar');
  };

  // ... render
}
```

### 4.7 Example: Sleep Log Created (from Zustand Store)

In `src/store/plan-store.ts` (or wherever sleep logs are saved):

```typescript
import { track } from '@/lib/analytics/track';

// Inside the Zustand store action:
addSleepLog: (log: SleepLog) => {
  set((state) => ({
    sleepLogs: [...state.sleepLogs, log],
  }));

  track('sleep_log_created', {
    entry_method: log.source, // 'manual' | 'healthkit_auto' | 'healthkit_edited'
    sleep_duration_min: log.durationMinutes,
    quality_rating: log.quality,
    shift_type: log.associatedShiftType,
  });
},
```

### 4.8 Example: Paywall Interaction

In `app/paywall.tsx`:

```tsx
import { usePostHog } from '@/lib/analytics/track';
import { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';

export default function PaywallScreen() {
  const posthog = usePostHog();
  const { trigger, source } = useLocalSearchParams<{
    trigger: string;
    source: string;
  }>();

  useEffect(() => {
    posthog?.capture('paywall_viewed', {
      trigger: trigger ?? 'unknown',
      source_screen: source ?? 'unknown',
    });
  }, []);

  const handlePurchase = async () => {
    // ... RevenueCat or StoreKit purchase flow
    posthog?.capture('subscription_purchased', {
      plan: 'annual',
      price: 29.99,
      trial_converted: wasOnTrial,
    });
  };

  // ... render
}
```

### 4.9 Example: Identifying Users After Auth

In `src/store/auth-store.ts` (post-login/signup):

```typescript
import { identify, setSuperProperties } from '@/lib/analytics/track';

// After successful auth:
onAuthSuccess: (user: SupabaseUser) => {
  // Use Supabase UID — NOT email, NOT name
  identify(user.id, {
    created_at: user.created_at,
    subscription_status: 'free',
  });

  setSuperProperties({
    app_version: Application.nativeApplicationVersion,
    platform: Platform.OS,
    is_premium: false,
    onboarding_complete: false,
  });
},
```

---

## 5. Privacy-First Approach

### 5.1 Core Principles

ShiftWell is a health app. Even if we don't store clinical data in PostHog, users trust us with sensitive behavioral patterns. The bar is higher than a typical consumer app.

**Principle 1: No PII in events, period.** Users are identified by their Supabase UUID. No name, email, phone, birth date, or IP address is sent to PostHog. The `ip_resolve` option is disabled in PostHog settings.

**Principle 2: No raw health data.** We track *engagement* with health features (did they log sleep? did they view a plan?), not health data itself (what were their sleep stages? what was their HRV?). Durations are bucketed, not exact (e.g., `sleep_duration_min` is acceptable as a behavioral metric, but we never send sleep stage data, HRV readings, or health conditions).

**Principle 3: Opt-out is easy and respected.** Users can disable analytics from Settings with a single toggle. When disabled, the PostHog SDK is fully deactivated — not just suppressed — meaning zero network calls.

### 5.2 Opt-Out Implementation

Add to `src/store/user-store.ts`:

```typescript
interface UserState {
  analyticsEnabled: boolean;
  setAnalyticsEnabled: (enabled: boolean) => void;
}

// In the store:
setAnalyticsEnabled: (enabled: boolean) => {
  set({ analyticsEnabled: enabled });

  if (!enabled) {
    // PostHog SDK method to disable all capturing
    posthog?.optOut();
  } else {
    posthog?.optIn();
  }
},
```

Wire the toggle in `app/(tabs)/settings.tsx`:

```tsx
<SettingsRow
  label="Share Usage Analytics"
  description="Anonymous data helps us improve ShiftWell. No personal or health data is ever shared."
  value={analyticsEnabled}
  onToggle={(val) => setAnalyticsEnabled(val)}
/>
```

### 5.3 Anonymization Checklist

Run through this before every release that adds new events:

- [ ] No event name or property contains or could leak PII
- [ ] Free-text fields (coach queries) are truncated to 200 chars and stripped of emails/phone patterns via regex before sending
- [ ] Durations use relative values (minutes, hours), not absolute timestamps
- [ ] Location data is never sent (no GPS, no address, no hospital name)
- [ ] All test events from dev/staging are filtered using PostHog environment properties
- [ ] `ip_resolve` is disabled in PostHog project settings

### 5.4 HIPAA Alignment Timeline

| Phase | Status | Action |
|---|---|---|
| **Beta (now)** | No PHI in analytics | Ship with free tier. Events contain only behavioral engagement data (taps, screen views, durations). No BAA needed because no PHI is transmitted. |
| **Post-beta** | Still no PHI | If we add features that might generate PHI-adjacent data (e.g., health scores derived from HealthKit), audit all events before launch. |
| **Scale (5K+ users)** | Upgrade to BAA | Execute PostHog BAA ($450/mo Teams + platform add-on). Even if our events remain PHI-free, the BAA is a safety net for edge cases and user trust. |

**Key distinction:** Our analytics strategy is *intentionally* designed so that no event constitutes PHI. The sleep duration and shift type data we track are behavioral engagement metrics, not clinical records. This means a BAA is a nice-to-have for legal protection, not a day-one requirement.

### 5.5 Data Retention

Configure in PostHog project settings:
- Event data: 12 months (re-evaluate at scale)
- Session replay: 30 days
- Automatically delete user data on account deletion (GDPR/CCPA compliance)

---

## 6. Dashboard Specs

### Dashboard 1: Onboarding Funnel (Beta Priority #1)

**Purpose:** Identify where users drop off during onboarding. This is the #1 dashboard to monitor at beta launch.

**Visualization:** Horizontal funnel chart.

**Steps:**
1. `onboarding_started` → 2. `onboarding_step_completed` (chronotype) → 3. `onboarding_step_completed` (calendar) → 4. `onboarding_step_completed` (healthkit) → 5. `onboarding_step_completed` (preferences) → 6. `onboarding_completed`

**Key Metrics:**
- Overall completion rate (target: >70%)
- Per-step drop-off rate
- Median time-to-complete
- Breakdown by `chronotype` and `schedule_type`

**Alerts:** If completion rate drops below 50% over any 7-day window, trigger a PostHog alert.

### Dashboard 2: Retention Curve (Beta Priority #2)

**Purpose:** Are beta users coming back? This is the existential question.

**Visualization:** Retention table (Day 1, Day 3, Day 7, Day 14, Day 30 cohorts).

**Metrics:**
- D1 retention: >60% target
- D7 retention: >40% target
- D30 retention: >25% target
- WAU/MAU ratio (target: >0.4 = good engagement)
- Session frequency distribution (histogram)

**Cohort Breakdowns:**
- By onboarding completion (completed vs abandoned)
- By schedule type (fixed night vs rotating)
- By platform (iOS only for now, prep for Android)

### Dashboard 3: Feature Adoption Heatmap (Beta Priority #3)

**Purpose:** Which features are users actually touching? Are premium features driving trial starts?

**Visualization:** Stacked bar or treemap showing `feature_used` event counts by `feature_name`.

**Metrics:**
- Feature usage frequency ranked
- % of users who've used each feature at least once
- Premium feature gate → paywall → trial conversion rate
- Circadian plan generation rate (% of users with shifts who generated a plan)
- Sleep log frequency (logs/week/user)

### Dashboard 4: Beta Health Monitor

**Purpose:** Single-screen overview for daily check-ins during beta.

**Widgets:**
- DAU (line chart, 30-day window)
- New signups today/this week
- Onboarding completion rate (7-day rolling)
- Avg sessions/user/day
- Top 5 events by volume (table)
- Error/crash rate if PostHog error tracking is enabled
- NPS or satisfaction score if surveys are enabled

### Dashboard 5: Algorithm Effectiveness (Post-Beta)

**Purpose:** Is the circadian algorithm delivering value?

**Metrics:**
- Plan generation rate (% of active users)
- Recommendation acceptance rate (accepted / (accepted + dismissed))
- Schedule adherence score distribution
- Correlation: adherence ↔ retention (does following the plan = staying active?)
- Sleep log quality ratings over time

---

## Appendix A: Environment Variables

Add to `.env`:

```bash
EXPO_PUBLIC_POSTHOG_API_KEY=phc_xxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Add to `.env.example` (committed to repo):

```bash
EXPO_PUBLIC_POSTHOG_API_KEY=your_posthog_project_api_key
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Add to `.gitignore` if not already present:

```
.env
.env.local
```

## Appendix B: PostHog Project Setup Checklist

1. Create a PostHog Cloud account at posthog.com
2. Create a project named "ShiftWell - Production"
3. Create a second project named "ShiftWell - Development" (keeps dev noise out of prod data)
4. In project settings, disable "Record user IP address"
5. Set data retention to 12 months
6. Create a "Beta Users" cohort based on `app_version` containing "beta"
7. Build the 5 dashboards listed above
8. Set up alerts: onboarding completion <50%, D1 retention <40%, DAU drop >30%

## Appendix C: Event Volume Estimates

| Scenario | Users | Events/User/Day | Monthly Events | PostHog Cost |
|---|---|---|---|---|
| Beta launch | 50 | ~40 | ~60,000 | Free |
| Post-beta growth | 500 | ~40 | ~600,000 | Free |
| Approaching limit | 850 | ~40 | ~1,000,000 | Free (at cap) |
| Growth phase | 5,000 | ~40 | ~6,000,000 | ~$250/mo |
| Scale | 25,000 | ~40 | ~30,000,000 | ~$1,200/mo |

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial creation. Researched PostHog, Mixpanel, Amplitude for RN/Expo compatibility, HIPAA readiness, free tier limits. Mapped events to ShiftWell's actual Expo Router file structure (9 onboarding screens, 7 tabs, modals for add-shift/paywall/import). Code snippets use posthog-react-native SDK with Zustand store integration pattern.
