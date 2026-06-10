# ShiftWell Error Monitoring & Crash Reporting Spec

**Sprint:** Phase 1, Sprint 2 (see `docs/sprint-plan-phase1-2026-04-18.md`)
**Owner:** Dr. Gursimran Singh, DO
**Status:** Implementation-ready

---

## 1. Tool Selection: Sentry Confirmed

### Why Sentry remains best-in-class for Expo/RN (April 2026)

Sentry is the correct choice. No credible alternative matches its Expo integration depth.

**Key advantages over alternatives (Bugsnag, Datadog RUM, Firebase Crashlytics):**

- **First-party Expo plugin** — `@sentry/react-native/expo` is maintained by the Sentry team with direct Expo collaboration. Source maps upload automatically during EAS Build with zero config beyond an auth token.
- **React Native crash symbolication** — native iOS/Android crashes are symbolicated automatically via the Expo plugin. No manual dSYM or Proguard upload needed.
- **Expo Router integration** — built-in `reactNavigationIntegration` tracks route changes as performance spans and generates navigation breadcrumbs.
- **Session Replay (mobile)** — `mobileReplayIntegration()` captures visual session replays on error, which is invaluable for reproducing bugs from beta testers who can't articulate what happened.
- **Performance monitoring** — screen load times, API call latency, and app start metrics out of the box.

**Note:** The `sentry-expo` package was deprecated in January 2024 with Expo SDK 50. Use `@sentry/react-native` exclusively.

### Free tier math for 50 beta users

Sentry's Developer (free) plan includes:

| Resource | Monthly Quota | Estimated Usage (50 users) | Sufficient? |
|----------|--------------|---------------------------|-------------|
| Errors | 5,000 | ~200-500 (assuming 4-10 errors/user/month during beta) | Yes |
| Performance spans | 5M | ~50K-100K | Yes |
| Session replays | 50 | 50 (on-error only) | Tight but OK |
| Logs | 5GB | <100MB | Yes |
| Users | 1 | 1 (you) | Yes |
| Cron monitors | 1 | 0-1 | Yes |

**Verdict:** Free tier is sufficient for beta. At 50 users with aggressive error rates, you'll use ~10% of the error quota. The 50 session replay limit is the tightest constraint — configure replays for errors only (not random sessions) to stay within it.

**Upgrade trigger:** If you exceed 200 DAU or need team access, upgrade to Team plan ($26/month). Not needed until well after beta.

---

## 2. Setup Guide

### 2.1 Install the SDK

```bash
npx expo install @sentry/react-native
```

Or use the wizard for automatic setup (installs package, patches configs, stores credentials):

```bash
npx @sentry/wizard@latest -i reactNative
```

### 2.2 Create Sentry project

1. Go to https://sentry.io → Create Project → React Native
2. Note your **DSN**, **org slug**, and **project slug**
3. Generate an auth token at https://sentry.io/settings/auth-tokens/

### 2.3 Configure app.json

Add the Expo plugin. This handles native SDK linking and source map uploads during EAS Build:

```json
{
  "expo": {
    "plugins": [
      [
        "@sentry/react-native/expo",
        {
          "url": "https://sentry.io/",
          "project": "shiftwell",
          "organization": "your-org-slug"
        }
      ]
    ]
  }
}
```

### 2.4 Set auth token as EAS secret

**Never commit auth tokens to source control.**

```bash
# For EAS Build (remote builds)
eas secret:create --name SENTRY_AUTH_TOKEN --value your-token-here --scope project

# For local development
echo "SENTRY_AUTH_TOKEN=your-token-here" >> .env
```

Add to `.gitignore` if not already:
```
.env
.env.sentry-build-plugin
```

### 2.5 Configure Metro

Update `metro.config.js` to use Sentry's wrapper (enables source map generation):

```javascript
// metro.config.js
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

module.exports = config;
```

### 2.6 Initialize Sentry

Create `src/lib/sentry.ts` — a dedicated module so initialization is importable and testable:

```typescript
// src/lib/sentry.ts
import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";

const SENTRY_DSN = Constants.expoConfig?.extra?.sentryDsn
  ?? "https://your-dsn@sentry.io/project-id";

export function initSentry() {
  Sentry.init({
    dsn: SENTRY_DSN,
    enabled: !__DEV__, // Disable in development to avoid noise
    environment: __DEV__ ? "development" : "production",
    release: Constants.expoConfig?.version ?? "unknown",
    dist: Constants.expoConfig?.runtimeVersion?.toString() ?? "unknown",

    // Error tracking
    sendDefaultPii: false, // IMPORTANT: disabled for health app privacy
    attachStacktrace: true,

    // Performance monitoring — sample 100% during beta, reduce later
    tracesSampleRate: 1.0,
    enableNativeFramesTracking: true,

    // Session replays — only on errors to stay within free tier
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0, // No random session replays (preserves quota)
    integrations: [Sentry.mobileReplayIntegration()],

    // Scrub sensitive data before sending
    beforeSend(event) {
      return scrubEvent(event);
    },

    beforeBreadcrumb(breadcrumb) {
      // Drop breadcrumbs that might contain PII
      if (breadcrumb.category === "console") {
        return null; // Console logs might contain user data
      }
      return breadcrumb;
    },
  });
}

function scrubEvent(event: Sentry.Event): Sentry.Event | null {
  // Remove any user-identifying information
  if (event.user) {
    delete event.user.email;
    delete event.user.username;
    delete event.user.ip_address;
    // Keep only anonymous ID for session correlation
    event.user = { id: event.user.id };
  }

  // Scrub request data that might contain tokens
  if (event.request?.headers) {
    delete event.request.headers["Authorization"];
    delete event.request.headers["Cookie"];
  }

  return event;
}

export { Sentry };
```

### 2.7 Wire into root layout

Update `app/_layout.tsx`:

```typescript
// app/_layout.tsx
import * as Sentry from "@sentry/react-native";
import { useNavigationContainerRef, Slot } from "expo-router";
import { useEffect } from "react";
import { initSentry } from "@/lib/sentry";

// Initialize before component renders
const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

initSentry();
// Add navigation integration after init
Sentry.addIntegration(navigationIntegration);

function RootLayout() {
  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref?.current) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  return <Slot />;
}

export default Sentry.wrap(RootLayout);
```

### 2.8 Verify the setup

After building a dev client (`npx expo run:ios` or EAS Build), add a temporary test button:

```typescript
import { Sentry } from "@/lib/sentry";

// Temporary — remove after confirming errors appear in Sentry dashboard
<Button
  title="Test Sentry"
  onPress={() => {
    Sentry.captureException(new Error("ShiftWell test error — safe to ignore"));
  }}
/>
```

### 2.9 Source maps for EAS Update (OTA)

EAS Build uploads source maps automatically. But OTA updates via `eas update` do **not**. Add this to your update script:

```bash
# In your CI or as a local script
eas update --branch production && npx sentry-expo-upload-sourcemaps dist
```

---

## 3. Error Boundary Component

A production-quality error boundary that catches React render crashes, shows a user-friendly fallback, and reports rich context to Sentry.

```typescript
// src/components/ErrorBoundary.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import * as Sentry from "@sentry/react-native";
import { usePathname } from "expo-router";

// ─── Fallback screen shown when a render crash occurs ────────────────────
interface FallbackProps {
  error: Error;
  componentStack: string | null;
  resetError: () => void;
}

function ErrorFallback({ error, resetError }: FallbackProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          The app ran into an unexpected issue. Your data is safe — this error
          has been reported automatically.
        </Text>
        {__DEV__ && (
          <Text style={styles.devError}>{error.message}</Text>
        )}
        <TouchableOpacity style={styles.button} onPress={resetError}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Wrapper that adds ShiftWell-specific context ────────────────────────
interface ShiftWellErrorBoundaryProps {
  children: React.ReactNode;
  /** Which section of the app this boundary wraps (e.g., "schedule", "sleep-plan") */
  section?: string;
}

export function ShiftWellErrorBoundary({
  children,
  section = "unknown",
}: ShiftWellErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, componentStack, resetError }) => (
        <ErrorFallback
          error={error}
          componentStack={componentStack}
          resetError={resetError}
        />
      )}
      beforeCapture={(scope) => {
        scope.setTag("boundary.section", section);
        scope.setTag("error.type", "render_crash");
        scope.setLevel("fatal");
      }}
      onError={(error, componentStack) => {
        // Log for development visibility
        if (__DEV__) {
          console.error(`[ErrorBoundary:${section}]`, error);
          console.error("Component stack:", componentStack);
        }
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A", // Dark mode first
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  devError: {
    fontSize: 12,
    color: "#F87171",
    fontFamily: "monospace",
    backgroundColor: "#1E293B",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: "100%",
  },
  button: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
```

### Usage in layouts

Wrap major sections of the app with section-specific boundaries:

```typescript
// app/(tabs)/schedule/_layout.tsx
import { ShiftWellErrorBoundary } from "@/components/ErrorBoundary";
import { Stack } from "expo-router";

export default function ScheduleLayout() {
  return (
    <ShiftWellErrorBoundary section="schedule">
      <Stack />
    </ShiftWellErrorBoundary>
  );
}
```

---

## 4. Key Integrations

### 4.1 Navigation tracking (Expo Router breadcrumbs)

Already configured in section 2.7. The `reactNavigationIntegration` automatically:

- Records a breadcrumb for each route change (e.g., `/(tabs)/schedule → /(tabs)/sleep-plan`)
- Creates performance spans for navigation transitions
- Measures Time to Initial Display per route (when `enableTimeToInitialDisplay: true`)

The breadcrumb trail shows exactly which screens the user visited before a crash. No additional code needed.

### 4.2 Zustand state snapshots

A middleware that attaches safe store slices to Sentry context on every state change. Only non-PII data is included.

```typescript
// src/lib/sentry-zustand.ts
import * as Sentry from "@sentry/react-native";
import type { StateCreator, StoreMutatorIdentifier } from "zustand";

/**
 * Zustand middleware that syncs safe state slices to Sentry context.
 *
 * Usage:
 *   const useScheduleStore = create<ScheduleState>()(
 *     sentryContext("schedule", safePicker)(
 *       (set) => ({ ... })
 *     )
 *   );
 */
type SentryContextImpl = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  storeName: string,
  /** Function that picks only safe-to-report fields from state */
  safePicker: (state: T) => Record<string, unknown>,
) => (
  initializer: StateCreator<T, Mps, Mcs>,
) => StateCreator<T, Mps, Mcs>;

const sentryContextImpl: SentryContextImpl =
  (storeName, safePicker) => (initializer) => (set, get, store) => {
    const sentrySet: typeof set = (...args) => {
      set(...(args as Parameters<typeof set>));
      // Update Sentry context with safe subset of state
      const safeState = safePicker(get());
      Sentry.setContext(`store:${storeName}`, safeState);
    };

    // Set initial context
    const state = initializer(sentrySet, get, store);
    const safeState = safePicker(state);
    Sentry.setContext(`store:${storeName}`, safeState);

    return state;
  };

export const sentryContext = sentryContextImpl as SentryContextImpl;
```

### Safe picker examples per store

```typescript
// src/stores/scheduleStore.ts
import { sentryContext } from "@/lib/sentry-zustand";

// Only report non-PII fields
const safePicker = (state: ScheduleState) => ({
  shiftType: state.currentShift?.type, // "day" | "night" | "swing"
  shiftCount: state.shifts.length,
  hasActiveSchedule: state.shifts.length > 0,
  adaptationPhase: state.adaptationPhase,
  // NEVER include: shift dates, location, employer name
});

export const useScheduleStore = create<ScheduleState>()(
  sentryContext("schedule", safePicker)(
    (set) => ({
      // ... store implementation
    })
  )
);
```

```typescript
// src/stores/sleepStore.ts
const safePicker = (state: SleepState) => ({
  hasSleepPlan: !!state.currentPlan,
  planWindowCount: state.currentPlan?.windows.length ?? 0,
  chronotype: state.chronotype,
  // NEVER include: actual sleep times, sleep scores, health data
});
```

### 4.3 API error tracking (Express backend)

Set up Sentry on your Express API server:

```bash
npm install @sentry/node
```

```typescript
// server/instrument.ts — MUST be imported before any other modules
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN_BACKEND,
  environment: process.env.NODE_ENV ?? "development",
  tracesSampleRate: 1.0, // 100% during beta

  beforeSend(event) {
    // Scrub request bodies that might contain health data
    if (event.request?.data) {
      event.request.data = "[REDACTED]";
    }
    // Scrub auth headers
    if (event.request?.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["cookie"];
    }
    return event;
  },
});
```

```typescript
// server/index.ts
import "./instrument"; // Must be first import
import express from "express";
import * as Sentry from "@sentry/node";

const app = express();

// ... your routes ...

// Sentry error handler — MUST be after all routes, before other error handlers
Sentry.setupExpressErrorHandler(app);

// Your custom error handler (after Sentry's)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode ?? 500;
  res.status(statusCode).json({
    error: statusCode >= 500 ? "Internal server error" : err.message,
  });
});
```

### Linking frontend and backend errors (distributed tracing)

Sentry automatically propagates trace headers if you use `fetch` in the React Native app and have `tracesSampleRate` set on both sides. Errors from a single user action (tap → API call → DB query → crash) show up as a single connected trace.

### 4.4 Performance monitoring

Already configured by the `tracesSampleRate: 1.0` setting. What you get out of the box:

| Metric | What it measures | Why it matters |
|--------|-----------------|----------------|
| App Start (Cold/Warm) | Time from tap to first frame | Beta users on older phones will reveal startup issues |
| Screen Load | Time to render each route | Identifies slow screens (e.g., schedule import, plan generation) |
| HTTP Requests | Latency per API endpoint | Spots slow Supabase queries |
| Slow/Frozen Frames | Frames >16ms / >700ms | Detects animation jank in schedule UI |
| Time to Initial Display | Per-route TTID | Expo Router integration measures this automatically |

**Custom performance spans for algorithm-heavy operations:**

```typescript
// src/lib/circadian/planGenerator.ts
import * as Sentry from "@sentry/react-native";

export async function generateSleepPlan(shifts: Shift[]): Promise<SleepPlan> {
  return Sentry.startSpan(
    {
      name: "circadian.generateSleepPlan",
      op: "algorithm",
      attributes: {
        "shifts.count": shifts.length,
        "shifts.type": shifts[0]?.type ?? "unknown",
      },
    },
    async (span) => {
      const plan = await runPlanAlgorithm(shifts);
      span.setAttribute("plan.windows", plan.windows.length);
      return plan;
    }
  );
}
```

---

## 5. Alert Configuration

### 5.1 Sentry alert rules to create

Set these up in Sentry → Alerts → Create Alert Rule:

| Alert | Condition | Action | Priority |
|-------|-----------|--------|----------|
| **New issue** | First occurrence of any error | Email immediately | P1 |
| **Crash spike** | Error count > 10 in 5 minutes | Email + Slack webhook | P0 |
| **Session crash rate** | Crash-free sessions < 95% in 1 hour | Email + Slack webhook | P0 |
| **API 5xx spike** | Backend errors > 5 in 5 minutes | Email + Slack webhook | P0 |
| **Slow screen** | P95 screen load > 3 seconds | Email (daily digest) | P2 |
| **Unhandled rejection** | New unhandled promise rejection | Email immediately | P1 |

### 5.2 Slack webhook setup

1. In Slack → Apps → Incoming Webhooks → Add to channel (e.g., `#shiftwell-alerts`)
2. Copy webhook URL
3. In Sentry → Settings → Integrations → Slack → Configure
4. Map alert rules to the Slack channel

For a solo developer, email alerts are sufficient for beta launch. Add Slack if you bring on testers who need visibility.

### 5.3 Recommended Sentry dashboard widgets

Create a custom dashboard with these widgets:

- **Crash-free session rate** (last 7 days, line chart)
- **Top 5 errors** (table, grouped by issue)
- **API latency P50/P95** (line chart, by endpoint)
- **Errors by screen** (bar chart, tagged by `boundary.section`)
- **App start time** (line chart, cold vs warm)

---

## 6. Privacy Considerations

ShiftWell handles health-adjacent data (sleep schedules, shift patterns, circadian preferences). Even though it's not a HIPAA-covered entity (no PHI from the hospital), health data requires extra care.

### What IS safe to send to Sentry

- Anonymous user ID (UUID, not email or name)
- Shift type enum: `"day" | "night" | "swing" | "rotating"`
- Screen name / route path
- App version, OS version, device model
- Error stack traces and component stacks
- Performance metrics (screen load times, API latency)
- Navigation breadcrumbs (route paths only)
- Store shape metadata (counts, booleans, enums — never actual values)

### What must NEVER reach Sentry

- Email address, name, or any account identifiers
- Actual shift dates/times (reveals work schedule)
- Sleep times, sleep scores, or sleep quality data
- Employer name or hospital name
- Calendar data or imported schedule content
- Location data
- Any data that could be combined to identify a specific user's health patterns

### Implementation safeguards (already in code above)

1. `sendDefaultPii: false` — prevents automatic IP, user-agent fingerprinting
2. `beforeSend` hook strips any `user.email`, `user.username`, `user.ip_address`
3. `beforeBreadcrumb` drops console logs (developers often `console.log` user data during debug)
4. Zustand `safePicker` functions whitelist only safe fields per store
5. Express `beforeSend` redacts all request bodies (may contain health data)
6. No raw request/response bodies are attached to frontend errors

### Sentry data retention

On the free plan, Sentry retains event data for 90 days. This is fine for beta. If you need shorter retention for compliance reasons later, the Team plan allows custom retention policies.

---

## 7. Implementation Checklist

Use this as your Sprint 2 task list for the Sentry work:

- [ ] Create Sentry account and project (`shiftwell`, React Native platform)
- [ ] Generate auth token, store as EAS secret
- [ ] `npx expo install @sentry/react-native`
- [ ] Add Expo plugin to `app.json`
- [ ] Update `metro.config.js` with `getSentryExpoConfig`
- [ ] Create `src/lib/sentry.ts` with init + scrubbing
- [ ] Wire into `app/_layout.tsx` with navigation integration
- [ ] Create `src/components/ErrorBoundary.tsx`
- [ ] Wrap tab layouts with `ShiftWellErrorBoundary`
- [ ] Create `src/lib/sentry-zustand.ts` middleware
- [ ] Add `safePicker` to schedule and sleep stores
- [ ] Add custom span to `generateSleepPlan`
- [ ] Set up Express backend Sentry (`server/instrument.ts`)
- [ ] Configure 6 alert rules in Sentry dashboard
- [ ] Build dev client, trigger test error, confirm it appears in Sentry
- [ ] Remove test button
- [ ] Verify source maps: stack traces show original TypeScript, not bundled JS

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial creation. Verified Sentry is still best-in-class for Expo/RN (sentry-expo deprecated, @sentry/react-native is the current package). Free tier (5K errors/month) confirmed sufficient for 50 beta users. Includes full code snippets for error boundary, Zustand middleware, Sentry init, navigation integration, and Express backend setup.
