# ShiftWell — Phase 2 Technical Architecture

> **Created:** 2026-03-14
> **Status:** Planning — ready for implementation
> **Prerequisite:** Phase 1 MVP complete (83 tests passing, all features built, TestFlight-ready)
> **Goal:** Add cloud backend, user accounts, HealthKit integration, premium features, and push notifications

---

## 1. Architecture Overview

### Current State (Phase 1 — Local Only)

```
┌─────────────────────────────────────────────────┐
│                   ShiftWell App                  │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Zustand   │  │ Circadian│  │  ICS Parser/ │  │
│  │ Stores    │  │ Algorithm│  │  Generator   │  │
│  │ (3 stores)│  │ (7 mods) │  │  (3 modules) │  │
│  └────┬──────┘  └──────────┘  └──────────────┘  │
│       │                                          │
│  ┌────▼──────┐                                   │
│  │AsyncStorage│  ← All data lives here           │
│  └───────────┘                                   │
└─────────────────────────────────────────────────┘
```

- Expo SDK 55, React Native, TypeScript
- Zustand stores persisted to AsyncStorage (user-store, shifts-store, plan-store)
- Deterministic circadian algorithm — pure functions, no API calls
- No user accounts, no backend, no analytics
- All data on device only

### Target State (Phase 2 — Cloud + Premium)

```
┌──────────────────────────────────────────────────────────────┐
│                        ShiftWell App                         │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌───────┐  ┌──────────────┐   │
│  │ Zustand   │  │ Circadian│  │Health │  │ RevenueCat   │   │
│  │ Stores    │  │ Algorithm│  │Kit    │  │ SDK          │   │
│  │ (updated) │  │ (same)   │  │Bridge │  │              │   │
│  └────┬──────┘  └──────────┘  └───┬───┘  └──────┬───────┘   │
│       │                           │              │           │
│  ┌────▼──────┐              ┌─────▼──────────────▼────────┐  │
│  │AsyncStorage│              │     Supabase Client SDK     │  │
│  │(offline   │◄────sync────►│  Auth │ DB │ Realtime       │  │
│  │ cache)    │              └─────────────┬───────────────┘  │
│  └───────────┘                            │                  │
└───────────────────────────────────────────┼──────────────────┘
                                            │
                              ┌─────────────▼──────────────┐
                              │         Supabase           │
                              │  ┌─────┐ ┌──────┐ ┌─────┐ │
                              │  │Auth │ │Postgr│ │Edge │ │
                              │  │     │ │  SQL │ │Funcs│ │
                              │  └─────┘ └──────┘ └─────┘ │
                              └────────────────────────────┘
```

**What changes:**
- Supabase backend (auth, PostgreSQL database, Edge Functions)
- HealthKit integration for actual sleep data
- RevenueCat for premium subscriptions
- Local push notifications for plan reminders
- PostHog or Amplitude for analytics

**What stays the same:**
- Circadian algorithm (pure functions, runs locally, no changes needed)
- ICS parser/generator
- All existing UI components
- Dark-mode-first design system
- Offline plan generation (the algorithm never needs the network)

---

## 2. Supabase Backend

### Why Supabase (Not Firebase, Not Custom)

| Factor | Supabase | Firebase | Custom (Express/Fastify) |
|--------|----------|----------|--------------------------|
| Database | PostgreSQL (relational, RLS) | Firestore (NoSQL, document) | Your choice |
| Auth | Built-in (email, Apple, Google) | Built-in | Passport.js / custom |
| Free tier | 50K MAU, 500MB DB, 5GB storage | Generous but complex billing | $5+/mo server |
| DevOps needed | Zero — managed service | Zero | Significant |
| React Native SDK | `@supabase/supabase-js` | `@react-native-firebase` | Custom |
| Row-Level Security | Native PostgreSQL RLS | Security Rules (different DSL) | Middleware |
| SQL queries | Full PostgreSQL | Limited (no joins) | Full |
| Real-time | Built-in (WebSocket) | Built-in | Socket.io / custom |
| Edge Functions | Deno-based, free tier included | Cloud Functions ($) | Lambda / custom |
| Dashboard | Full DB explorer, SQL editor | Console | pgAdmin / custom |

**Decision:** Supabase wins for a solo founder because:
1. PostgreSQL is the right model for relational data (users → shifts → plans → health data)
2. Row-Level Security means security is in the database, not the app code
3. The founder can manage everything via the Supabase dashboard — no CLI, no DevOps
4. Free tier covers the first 50K monthly active users
5. Edge Functions handle any server-side logic without a separate server

### Database Schema

```sql
-- ============================================================
-- USERS TABLE
-- Extended profile beyond Supabase auth.users
-- Maps directly to the existing UserProfile TypeScript type
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  -- Fields matching current UserProfile type in types.ts
  chronotype TEXT CHECK (chronotype IN ('early', 'intermediate', 'late')) DEFAULT 'intermediate',
  sleep_hours_preferred NUMERIC(3,1) DEFAULT 7.5,
  caffeine_sensitivity TEXT CHECK (caffeine_sensitivity IN ('low', 'medium', 'high')) DEFAULT 'medium',
  caffeine_half_life NUMERIC(3,1) DEFAULT 5.0,
  nap_preference BOOLEAN DEFAULT true,
  household_size INTEGER DEFAULT 1,
  has_young_children BOOLEAN DEFAULT false,
  has_pets BOOLEAN DEFAULT false,
  commute_minutes INTEGER DEFAULT 30,
  -- Metadata
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SHIFTS TABLE
-- Maps to ShiftEvent in types.ts
-- ============================================================
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Shift',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  shift_type TEXT CHECK (shift_type IN ('day', 'evening', 'night', 'extended')) NOT NULL,
  source TEXT CHECK (source IN ('manual', 'ics_import')) DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Prevent exact duplicates
  UNIQUE (user_id, start_time, end_time)
);

CREATE INDEX idx_shifts_user_date ON shifts (user_id, start_time);

-- ============================================================
-- PERSONAL EVENTS TABLE
-- Maps to PersonalEvent in types.ts
-- ============================================================
CREATE TABLE personal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_personal_events_user_date ON personal_events (user_id, start_time);

-- ============================================================
-- SLEEP PLANS TABLE
-- Stores generated plans as JSONB (the full PlanBlock[] array)
-- ============================================================
CREATE TABLE sleep_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_start_date DATE NOT NULL,
  plan_end_date DATE NOT NULL,
  -- The full generated plan — PlanBlock[], ClassifiedDay[], PlanStats
  plan_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Keep only the latest plan per date range
  UNIQUE (user_id, plan_start_date, plan_end_date)
);

CREATE INDEX idx_sleep_plans_user_date ON sleep_plans (user_id, plan_start_date);

-- ============================================================
-- HEALTH DATA TABLE
-- Actual sleep data from HealthKit or manual entry
-- ============================================================
CREATE TABLE health_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  actual_sleep_start TIMESTAMPTZ,
  actual_sleep_end TIMESTAMPTZ,
  actual_sleep_minutes INTEGER,
  sleep_quality_score INTEGER CHECK (sleep_quality_score BETWEEN 1 AND 10),
  in_bed_start TIMESTAMPTZ,
  in_bed_end TIMESTAMPTZ,
  heart_rate_avg_sleeping NUMERIC(4,1),
  source TEXT CHECK (source IN ('healthkit', 'manual')) DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date, source)
);

CREATE INDEX idx_health_data_user_date ON health_data (user_id, date);

-- ============================================================
-- SUBSCRIPTIONS TABLE
-- Tracks premium status (RevenueCat is source of truth,
-- this is a local cache for RLS policies)
-- ============================================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT CHECK (plan IN ('free', 'premium')) DEFAULT 'free',
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revenue_cat_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Row-Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS: can only read/update their own row
-- ============================================================
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- SHIFTS: full CRUD on own shifts only
-- ============================================================
CREATE POLICY "Users can view own shifts"
  ON shifts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shifts"
  ON shifts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shifts"
  ON shifts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shifts"
  ON shifts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- PERSONAL EVENTS: full CRUD on own events only
-- ============================================================
CREATE POLICY "Users can view own personal events"
  ON personal_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personal events"
  ON personal_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal events"
  ON personal_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own personal events"
  ON personal_events FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- SLEEP PLANS: read/write own plans
-- ============================================================
CREATE POLICY "Users can view own sleep plans"
  ON sleep_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep plans"
  ON sleep_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sleep plans"
  ON sleep_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- HEALTH DATA: read/write own health data
-- ============================================================
CREATE POLICY "Users can view own health data"
  ON health_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health data"
  ON health_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health data"
  ON health_data FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- SUBSCRIPTIONS: read own, only Edge Functions can write
-- (RevenueCat webhook → Edge Function → update subscription)
-- ============================================================
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Insert/update handled by Edge Function with service_role key
-- No direct user write access to subscriptions table
```

### Migration Strategy (AsyncStorage → Supabase)

The migration must be seamless. Users should never lose data or be forced to re-onboard.

**Approach: Local-first with cloud backup**

```
┌──────────────────────────────────────────────────────┐
│                   Data Flow                          │
│                                                      │
│  App Start                                           │
│    │                                                 │
│    ├─ Load from AsyncStorage (instant, always works) │
│    │                                                 │
│    ├─ Is user logged in?                             │
│    │   ├─ NO → app works exactly as Phase 1          │
│    │   │                                             │
│    │   └─ YES → background sync with Supabase        │
│    │         ├─ Push local changes → cloud           │
│    │         └─ Pull cloud changes → local           │
│    │                                                 │
│    └─ Continue (app never blocks on network)         │
└──────────────────────────────────────────────────────┘
```

**Step-by-step migration when user creates an account:**

1. User taps "Create Account" (or signs in with Apple)
2. Supabase auth creates the user
3. App reads existing AsyncStorage data:
   - `nightshift-user` → `users` table row
   - `nightshift-shifts` → `shifts` table rows
   - `nightshift-plan` → `sleep_plans` table rows
4. Upsert all local data to Supabase with the new `user_id`
5. Update Zustand stores to include `user_id` field
6. From this point forward, writes go to both AsyncStorage (cache) and Supabase (source of truth)

**Offline support:**

The algorithm runs locally and never needs the network. This is critical because shift workers are often in hospitals, underground, or areas with poor signal.

- Plan generation: always local (the circadian algorithm is pure TypeScript)
- Shift entry: writes to AsyncStorage immediately, queues Supabase write
- Sync queue: a simple array in AsyncStorage of pending operations
- On reconnect: flush the sync queue to Supabase
- Conflict resolution: last-write-wins with timestamp comparison (adequate for single-user data)

**New file to create:** `src/lib/sync/sync-engine.ts`

```typescript
// Conceptual API for the sync engine
interface SyncEngine {
  // Queue a write operation for when we're online
  queueWrite(table: string, operation: 'upsert' | 'delete', data: any): void;

  // Flush all queued operations to Supabase
  flushQueue(): Promise<void>;

  // Full sync: push local, pull remote, resolve conflicts
  fullSync(): Promise<void>;

  // Check if there are pending operations
  hasPendingWrites(): boolean;
}
```

**Updated Zustand store pattern** (example for shifts-store):

```typescript
// Phase 2: shifts-store.ts changes
// 1. Add user_id to all operations
// 2. Write to both AsyncStorage (via persist) and Supabase (via sync)
// 3. The persist middleware handles offline cache automatically
// 4. Add a syncShifts() action that pulls from Supabase

addShift: async (shift) => {
  // Local write (instant, works offline)
  set((state) => ({
    shifts: [...state.shifts, { ...shift, id: generateId() }],
  }));

  // Cloud write (async, queued if offline)
  if (authStore.getState().userId) {
    syncEngine.queueWrite('shifts', 'upsert', shift);
  }
},
```

---

## 3. Authentication

### Auth Providers

| Provider | Required? | Why |
|----------|-----------|-----|
| Apple Sign-In | **Yes** | Apple requires it if you offer any third-party login. One-tap on iOS. |
| Email + Password | Yes | Fallback for users who prefer it. Also needed for potential Android users. |
| Google Sign-In | Optional (Phase 2B) | Nice-to-have. Lower priority since target audience is iOS-first. |

### Implementation Plan

**Package:** `@supabase/supabase-js` (includes auth client)

**Secure token storage:** `expo-secure-store` (not AsyncStorage — tokens are sensitive)

```
nightshift/
└── src/
    └── lib/
        └── supabase/
            ├── client.ts          # Supabase client init with SecureStore adapter
            ├── auth.ts            # signIn, signUp, signOut, onAuthStateChange
            └── storage-adapter.ts # SecureStore adapter for Supabase session
```

**`src/lib/supabase/client.ts`:**

```typescript
import { createClient } from '@supabase/supabase-js';
import { SecureStoreAdapter } from './storage-adapter';
import type { Database } from './database.types'; // Generated from Supabase CLI

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: new SecureStoreAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Not needed in React Native
  },
});
```

**`src/lib/supabase/storage-adapter.ts`:**

```typescript
import * as SecureStore from 'expo-secure-store';

export class SecureStoreAdapter {
  async getItem(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  }

  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }
}
```

### Auth Flow

```
App Launch
    │
    ▼
Check SecureStore for session token
    │
    ├── Token found → validate with Supabase
    │   ├── Valid → load user data, go to main app
    │   └── Expired → refresh token
    │       ├── Refreshed → go to main app
    │       └── Failed → show sign-in screen
    │
    └── No token → check AsyncStorage for onboarding state
        ├── Onboarding complete (Phase 1 user) → show main app
        │   (app works without account, account is optional)
        │
        └── Onboarding not done → show onboarding flow
            └── After onboarding → soft prompt to create account
                ├── "Create Account" → Apple Sign-In / email
                │   └── Migrate local data to Supabase
                └── "Maybe Later" → continue without account
                    (premium features will require account)
```

**Key principle:** Account creation is never required for free features. The app works fully offline, same as Phase 1. Accounts unlock cloud backup and are required for premium.

### Apple Sign-In Setup

1. Enable "Sign in with Apple" capability in Apple Developer portal
2. Add `expo-apple-authentication` to the project
3. Configure in `app.json`:

```json
{
  "expo": {
    "ios": {
      "usesAppleSignIn": true
    }
  }
}
```

4. In Supabase dashboard: Settings → Auth → Providers → Enable Apple
5. Provide the Service ID, Key ID, and team ID from Apple Developer portal

### New Zustand Store: `auth-store.ts`

```typescript
interface AuthState {
  userId: string | null;
  email: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}
```

---

## 4. HealthKit Integration

### What to Read from HealthKit

| Data Type | HealthKit Identifier | Why |
|-----------|---------------------|-----|
| Sleep Analysis | `HKCategoryTypeIdentifierSleepAnalysis` | Compare planned vs. actual sleep times |
| In-Bed Time | `HKCategoryValueSleepAnalysis.inBed` | Track time in bed vs. actual sleep |
| Asleep Core | `HKCategoryValueSleepAnalysis.asleepCore` | iOS 16+ detailed sleep staging |
| Asleep Deep | `HKCategoryValueSleepAnalysis.asleepDeep` | Sleep quality signal |
| Asleep REM | `HKCategoryValueSleepAnalysis.asleepREM` | Sleep quality signal |
| Heart Rate (sleeping) | `HKQuantityTypeIdentifierHeartRate` | Resting HR during sleep → sleep quality proxy |

### What to Write to HealthKit

| Data Type | Why |
|-----------|-----|
| Sleep Schedule | Write planned bedtime/wake time so iOS Sleep Focus can auto-activate |

### Library Choice

**`@kingstinct/react-native-healthkit`** (already identified in IMPLEMENTATION_PLAN.md)

Why this over alternatives:
- Production-ready, actively maintained
- TypeScript-first with full type definitions
- Expo config plugin (no manual Xcode setup)
- Uses Nitro Modules (modern, fast bridge)
- Supports iOS 16+ sleep staging data
- Background delivery support

### Implementation

**New files:**

```
src/lib/healthkit/
├── healthkit-service.ts    # Permission requests, read/write operations
├── sleep-comparison.ts     # Compare planned vs. actual sleep
└── accuracy-score.ts       # Calculate plan adherence score
```

**`src/lib/healthkit/healthkit-service.ts` (conceptual):**

```typescript
import HealthKit, {
  HKCategoryTypeIdentifier,
  HKAuthorizationRequestStatus,
} from '@kingstinct/react-native-healthkit';

export class HealthKitService {
  // Request permissions — called during onboarding (optional step)
  async requestAuthorization(): Promise<boolean> {
    const status = await HealthKit.requestAuthorization(
      // Read permissions
      [HKCategoryTypeIdentifier.sleepAnalysis],
      // Write permissions
      [HKCategoryTypeIdentifier.sleepAnalysis],
    );
    return status === HKAuthorizationRequestStatus.unnecessary
      || status === HKAuthorizationRequestStatus.shouldRequest;
  }

  // Read last night's sleep data
  async getLastNightSleep(date: Date): Promise<SleepRecord | null> {
    const samples = await HealthKit.queryCategorySamples(
      HKCategoryTypeIdentifier.sleepAnalysis,
      {
        from: startOfDay(subDays(date, 1)),
        to: endOfDay(date),
      },
    );
    // Aggregate samples into a single SleepRecord
    return this.aggregateSleepSamples(samples);
  }

  // Write planned sleep schedule
  async writePlannedSleep(bedtime: Date, wakeTime: Date): Promise<void> {
    // Write to HealthKit so iOS Sleep Focus activates
    await HealthKit.saveCategorySample(
      HKCategoryTypeIdentifier.sleepAnalysis,
      /* value */ 0, // inBed
      { start: bedtime, end: wakeTime },
    );
  }
}
```

### Privacy Handling

HealthKit requires explicit user consent and Apple reviews health data usage carefully.

**Required:**
- `NSHealthShareUsageDescription` in `app.json` — explain what we read and why
- `NSHealthUpdateUsageDescription` in `app.json` — explain what we write and why

**Example descriptions (for `app.json`):**

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSHealthShareUsageDescription": "ShiftWell reads your sleep data to compare your actual sleep with your planned schedule and improve future recommendations.",
        "NSHealthUpdateUsageDescription": "ShiftWell writes your planned sleep schedule so iOS Sleep Focus can activate automatically at bedtime."
      }
    }
  }
}
```

**Onboarding UX:**
- HealthKit is optional — always allow skipping
- Show a dedicated screen explaining exactly what data is accessed
- Use plain language: "We read when you fell asleep and woke up. We never read heart rate, activity, or any other health data. Your data stays on your device and in your private cloud account."

### Algorithm Enhancement: Plan Accuracy

When HealthKit data is available, the algorithm gains a feedback loop:

```
Planned sleep: 23:00 – 06:30 (7.5 hours)
Actual sleep:  23:45 – 06:15 (6.5 hours)
                │
                ▼
Plan accuracy: 87% (timing), 87% (duration)
Insight: "You went to bed 45 minutes late. Consider starting wind-down 15 minutes earlier."
```

**`src/lib/healthkit/accuracy-score.ts` (conceptual):**

```typescript
interface PlanAccuracy {
  // How close actual bedtime was to planned (0-100%)
  timingAccuracy: number;
  // How close actual duration was to planned (0-100%)
  durationAccuracy: number;
  // Overall score (weighted average)
  overallScore: number;
  // Human-readable insight
  insight: string;
  // Trend over last 7 days
  weeklyTrend: 'improving' | 'stable' | 'declining';
}

function calculateAccuracy(
  planned: { start: Date; end: Date },
  actual: { start: Date; end: Date },
): PlanAccuracy {
  const bedtimeDeviationMinutes = Math.abs(
    differenceInMinutes(actual.start, planned.start)
  );
  const durationDeviation = Math.abs(
    differenceInMinutes(actual.end, actual.start) -
    differenceInMinutes(planned.end, planned.start)
  );

  // 100% if exact, losing 5% per 15 minutes deviation
  const timingAccuracy = Math.max(0, 100 - (bedtimeDeviationMinutes / 15) * 5);
  const durationAccuracy = Math.max(0, 100 - (durationDeviation / 15) * 5);
  const overallScore = timingAccuracy * 0.6 + durationAccuracy * 0.4;

  return {
    timingAccuracy: Math.round(timingAccuracy),
    durationAccuracy: Math.round(durationAccuracy),
    overallScore: Math.round(overallScore),
    insight: generateInsight(bedtimeDeviationMinutes, durationDeviation),
    weeklyTrend: 'stable', // computed from last 7 entries
  };
}
```

---

## 5. Premium Features (RevenueCat)

### Free vs. Premium Tier

| Feature | Free | Premium ($4.99/mo) |
|---------|------|---------------------|
| Manual shift entry | Yes | Yes |
| Basic sleep plan (sleep windows, caffeine cutoff) | Yes | Yes |
| Today screen with countdowns | Yes | Yes |
| Onboarding with chronotype quiz | Yes | Yes |
| .ics import (shift schedules) | No | Yes |
| .ics export (plan to calendar) | No | Yes |
| HealthKit integration | No | Yes |
| Plan accuracy tracking | No | Yes |
| Advanced sleep tips (full library) | No | Yes |
| Push notification reminders | No | Yes |
| Nap placement in plan | No | Yes |
| Meal timing in plan | No | Yes |
| Light exposure protocols | No | Yes |
| Cloud backup | No | Yes |
| Widgets (Phase 3) | No | Yes |

**Design principle:** Free tier must be genuinely useful. A free user enters shifts manually, gets a basic sleep plan with their main sleep window and caffeine cutoff. That alone is more than any competitor offers for free. Premium unlocks the full circadian toolkit.

### Why RevenueCat (Not Direct StoreKit)

1. **Receipt validation handled server-side** — Apple receipt validation is notoriously complex. RevenueCat does it automatically.
2. **Cross-platform ready** — When Android launches, RevenueCat handles Google Play billing with the same API.
3. **Free until $2,500 MRR** — At $4.99/mo, that's ~500 subscribers before any cost.
4. **Analytics dashboard** — MRR, churn, trial conversion, LTV — all built-in.
5. **Expo SDK available** — `react-native-purchases` with Expo config plugin.
6. **Less code** — RevenueCat's SDK is ~50 lines to integrate vs. hundreds for raw StoreKit.

### RevenueCat Setup Steps

1. **Create RevenueCat account** at revenuecat.com (free)
2. **Create a project** in RevenueCat dashboard
3. **Connect App Store Connect:** provide shared secret, enable server notifications
4. **Create products in App Store Connect:**
   - `shiftwell_premium_monthly` — $4.99/month auto-renewing subscription
   - `shiftwell_premium_annual` — $39.99/year auto-renewing subscription (33% discount)
5. **Create entitlements in RevenueCat:** `premium` entitlement linked to both products
6. **Install SDK:**

```bash
npx expo install react-native-purchases
```

7. **Configure in `app.json`:**

```json
{
  "expo": {
    "plugins": ["react-native-purchases"]
  }
}
```

### RevenueCat Integration Code

**New file: `src/lib/purchases/revenue-cat.ts`**

```typescript
import Purchases, {
  PurchasesOffering,
  CustomerInfo,
} from 'react-native-purchases';

const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY!;

export async function initializePurchases(userId?: string): Promise<void> {
  await Purchases.configure({
    apiKey: REVENUECAT_API_KEY,
    appUserID: userId, // Link to Supabase user ID
  });
}

export async function checkPremiumStatus(): Promise<boolean> {
  const customerInfo = await Purchases.getCustomerInfo();
  return customerInfo.entitlements.active['premium'] !== undefined;
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchaseMonthly(): Promise<boolean> {
  const offerings = await Purchases.getOfferings();
  const monthly = offerings.current?.monthly;
  if (!monthly) return false;

  const { customerInfo } = await Purchases.purchasePackage(monthly);
  return customerInfo.entitlements.active['premium'] !== undefined;
}

export async function restorePurchases(): Promise<boolean> {
  const customerInfo = await Purchases.restorePurchases();
  return customerInfo.entitlements.active['premium'] !== undefined;
}
```

### Zustand Store: `subscription-store.ts`

```typescript
interface SubscriptionState {
  isPremium: boolean;
  isLoading: boolean;
  expiresAt: Date | null;

  checkStatus: () => Promise<void>;
  purchase: (plan: 'monthly' | 'annual') => Promise<boolean>;
  restore: () => Promise<boolean>;
}
```

### Paywall UI Component

```
src/components/premium/
├── Paywall.tsx          # Full-screen paywall modal
├── PremiumBadge.tsx     # Small lock icon on gated features
└── UpgradePrompt.tsx    # Inline "Upgrade to unlock" card
```

**Paywall design principles:**
- Show on first attempt to use a premium feature (not randomly)
- List all premium features with checkmarks
- Show both monthly and annual pricing (highlight annual savings)
- Include "Restore Purchases" link
- Soft, not aggressive — the founder is a physician, not a growth hacker

### Feature Gating Pattern

```typescript
// Simple hook for checking premium access
function usePremium(): { isPremium: boolean; showPaywall: () => void } {
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const [paywallVisible, setPaywallVisible] = useState(false);

  return {
    isPremium,
    showPaywall: () => setPaywallVisible(true),
  };
}

// Usage in any screen:
function ImportScreen() {
  const { isPremium, showPaywall } = usePremium();

  const handleImport = () => {
    if (!isPremium) {
      showPaywall();
      return;
    }
    // proceed with import
  };
}
```

---

## 6. Push Notifications

### Notification Types

| Notification | Timing | Type | Priority |
|-------------|--------|------|----------|
| Wind-down reminder | 30 min before planned sleep | Local | Medium |
| Bedtime reminder | At planned sleep onset | Local | High |
| Caffeine cutoff alert | At calculated cutoff time | Local | Medium |
| Nap window opens | 15 min before nap window | Local | Low |
| Light exposure reminder | At scheduled light-seek time | Local | Low |
| Wake-up check-in | 30 min after planned wake | Local | Low |
| Weekly summary | Monday 9:00 AM | Remote (Edge Function) | Low |

### Implementation

**Package:** `expo-notifications` (already part of Expo SDK)

Most notifications are **local** — they're scheduled based on the generated plan, no server needed. This is simpler, more reliable, and works offline.

```bash
npx expo install expo-notifications
```

**`app.json` config:**

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "sounds": ["./assets/sounds/gentle-chime.wav"]
        }
      ]
    ]
  }
}
```

**New file: `src/lib/notifications/notification-service.ts`**

```typescript
import * as Notifications from 'expo-notifications';

export class NotificationService {
  // Request permission (during onboarding, optional)
  async requestPermission(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  // Schedule all notifications for today's plan
  async scheduleForPlan(plan: SleepPlan): Promise<void> {
    // Cancel existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    for (const block of plan.blocks) {
      if (block.type === 'main-sleep') {
        // Wind-down: 30 min before sleep
        await this.schedule({
          title: 'Time to wind down',
          body: 'Your sleep window opens in 30 minutes. Start dimming lights and put away screens.',
          trigger: subMinutes(block.start, 30),
        });

        // Bedtime
        await this.schedule({
          title: 'Bedtime',
          body: 'Your optimal sleep window is now. Goodnight.',
          trigger: block.start,
        });
      }

      if (block.type === 'caffeine-cutoff') {
        await this.schedule({
          title: 'Caffeine cutoff',
          body: 'Last chance for caffeine today. After this, it will affect your sleep.',
          trigger: block.start,
        });
      }

      if (block.type === 'nap') {
        await this.schedule({
          title: 'Nap window opening',
          body: `${block.label} — ${block.description}`,
          trigger: subMinutes(block.start, 15),
        });
      }
    }
  }

  private async schedule(config: {
    title: string;
    body: string;
    trigger: Date;
  }): Promise<void> {
    // Only schedule future notifications
    if (config.trigger <= new Date()) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: config.title,
        body: config.body,
        sound: 'gentle-chime.wav',
      },
      trigger: { date: config.trigger },
    });
  }
}
```

**Auto-scheduling:** When the plan store regenerates (shifts change, new day), automatically reschedule notifications:

```typescript
// In plan-store.ts, after generating a new plan:
const notificationService = new NotificationService();
notificationService.scheduleForPlan(newPlan);
```

### Weekly Summary (Remote Notification via Edge Function)

For the Monday morning weekly summary, use a Supabase Edge Function + `pg_cron`:

1. `pg_cron` triggers Edge Function every Monday at 09:00 UTC
2. Edge Function queries each user's health_data and sleep_plans for the past week
3. Computes summary stats (adherence %, avg sleep, trend)
4. Sends push notification via Expo Push API

This is Phase 2C work — local notifications come first in Phase 2B.

---

## 7. Analytics

### What to Track

**User funnel:**
- Install → open app (implicit)
- Open → complete onboarding
- Onboarding → enter first shift
- First shift → generate first plan
- First plan → export plan
- D1 / D7 / D30 retention

**Feature usage:**
- Plan views per day
- ICS imports (count, success rate)
- ICS exports (count)
- HealthKit connected (yes/no)
- Notification opt-in rate
- Premium conversion funnel (paywall view → purchase)
- Settings changed (which preferences)

**Algorithm quality:**
- Plan accuracy scores (from HealthKit comparison)
- Shift types seen (day/night/evening distribution)
- Average planned sleep hours

### Tool Recommendation: PostHog

| Factor | PostHog | Amplitude |
|--------|---------|-----------|
| Free tier | 1M events/mo (cloud) or unlimited (self-hosted) | 10M events/mo |
| React Native SDK | Yes (`posthog-react-native`) | Yes |
| Feature flags | Included free | Separate product |
| Session replay | Included (mobile support in beta) | Not included |
| Privacy | EU hosting available, can self-host | US only |
| Open source | Yes | No |

**Recommendation:** PostHog cloud (free tier). 1M events/month is plenty for early growth. Switch to self-hosted if privacy becomes a concern.

### Implementation

```bash
npx expo install posthog-react-native
```

**New file: `src/lib/analytics/posthog.ts`**

```typescript
import PostHog from 'posthog-react-native';

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY!;

export const posthog = new PostHog(POSTHOG_API_KEY, {
  host: 'https://app.posthog.com',
  // Don't track until user opts in (respect privacy)
  enable: false,
});

// Call after user consents to analytics
export function enableAnalytics(userId?: string): void {
  posthog.enable();
  if (userId) {
    posthog.identify(userId);
  }
}

// Typed event tracking
export function trackEvent(
  event: 'onboarding_complete' | 'shift_added' | 'plan_generated' |
         'ics_imported' | 'ics_exported' | 'paywall_viewed' |
         'premium_purchased' | 'healthkit_connected' | 'notification_enabled',
  properties?: Record<string, any>,
): void {
  posthog.capture(event, properties);
}
```

**Privacy:** Analytics are opt-in. During onboarding, show a brief "Help improve ShiftWell" toggle. Default: off. This aligns with the founder's physician ethics and App Store guidelines.

---

## 8. Implementation Timeline

### Phase 2A: Foundation (Weeks 7-10)

**Goal:** Supabase project live, auth working, data syncing to cloud.

| Week | Task | Details |
|------|------|---------|
| 7 | Supabase project setup | Create project, run schema SQL, configure RLS, set up environment variables |
| 7 | Supabase client integration | `src/lib/supabase/client.ts`, SecureStore adapter, environment config |
| 8 | Apple Sign-In | `expo-apple-authentication`, Supabase Apple provider, auth flow screens |
| 8 | Email auth | Sign up, sign in, password reset screens |
| 8 | Auth store | `src/store/auth-store.ts`, session management, auto-refresh |
| 9 | Data sync engine | `src/lib/sync/sync-engine.ts`, offline queue, conflict resolution |
| 9 | Migrate stores | Update user-store, shifts-store, plan-store to write to both AsyncStorage + Supabase |
| 10 | Migration flow | One-time AsyncStorage → Supabase migration for existing users |
| 10 | Account settings UI | Profile screen, sign out, delete account |

**Deliverables:**
- User can sign in with Apple or email
- All data syncs to Supabase in background
- App works fully offline (same as Phase 1)
- Existing users can create an account and migrate their data
- New users can onboard with or without an account

**How to verify:**
1. Fresh install → onboard without account → enter shifts → verify plan works offline
2. Create account → verify data appears in Supabase dashboard
3. Kill app, reinstall → sign in → verify all data restored
4. Turn on airplane mode → enter shifts → turn off airplane → verify data syncs

### Phase 2B: HealthKit + Notifications (Weeks 11-14)

**Goal:** App reads actual sleep data and sends plan reminders.

| Week | Task | Details |
|------|------|---------|
| 11 | HealthKit setup | Install `@kingstinct/react-native-healthkit`, configure permissions, add onboarding screen |
| 11 | Sleep data reader | `src/lib/healthkit/healthkit-service.ts`, read sleep analysis samples |
| 12 | Plan accuracy | `src/lib/healthkit/accuracy-score.ts`, compare planned vs. actual, calculate scores |
| 12 | Accuracy UI | Plan accuracy card on Today screen, weekly trend chart |
| 13 | Local notifications | `expo-notifications`, schedule from plan blocks, permission request |
| 13 | Notification settings | Toggle per notification type in Settings |
| 14 | Health data sync | Write sleep data to `health_data` table, background fetch |
| 14 | Testing | Test on physical device with Apple Watch sleep data, edge cases |

**Deliverables:**
- HealthKit reads actual sleep times (with user permission)
- Today screen shows "Plan accuracy: 87%" with insights
- Notifications fire at wind-down, bedtime, caffeine cutoff, and nap times
- Users can configure which notifications they receive

**How to verify:**
1. Grant HealthKit access → sleep with Apple Watch → next day verify actual sleep appears
2. Check plan accuracy score matches manual calculation
3. Set a shift 2 hours from now → verify notifications scheduled at correct times
4. Disable notifications in Settings → verify they stop

### Phase 2C: Premium + Analytics (Weeks 15-18)

**Goal:** Revenue flowing, data-driven iteration.

| Week | Task | Details |
|------|------|---------|
| 15 | RevenueCat setup | Create account, configure products in App Store Connect, install SDK |
| 15 | Premium store | `src/store/subscription-store.ts`, check entitlements, restore purchases |
| 16 | Paywall UI | Full-screen paywall modal, inline upgrade prompts, premium badges |
| 16 | Feature gating | Gate ICS import/export, HealthKit, notifications, naps, meals behind premium |
| 17 | Analytics setup | PostHog integration, event tracking, user identification |
| 17 | Funnel instrumentation | Track onboarding → first plan → export → retention |
| 18 | Testing + polish | Test purchase flow (sandbox), restore, expiration, edge cases |
| 18 | Subscription sync | RevenueCat webhook → Supabase Edge Function → update `subscriptions` table |

**Deliverables:**
- Premium subscription purchasable via App Store
- Free users see paywall when accessing premium features
- Analytics tracking user funnel and feature usage
- RevenueCat dashboard showing MRR, trials, churn

**How to verify:**
1. Free user → tap Import → paywall appears → purchase (sandbox) → import works
2. Restore purchases on fresh install → premium restored
3. Check PostHog dashboard → events appearing with correct properties
4. Cancel subscription → verify premium features re-lock after expiry

### Phase 2D: Polish (Weeks 19-22)

**Goal:** Production-grade quality, ready for growth.

| Week | Task | Details |
|------|------|---------|
| 19 | Widgets | `expo-widget` — Today's next block, sleep countdown, accuracy score |
| 20 | Weekly summary notifications | Supabase Edge Function + `pg_cron` + Expo Push |
| 21 | Onboarding improvements | Based on analytics — optimize drop-off points |
| 21 | Performance optimization | Profile with React DevTools, optimize re-renders, lazy load screens |
| 22 | Final QA | Full regression, TestFlight beta with premium, App Store review submission |

---

## 9. Cost Projection

### Monthly Operating Costs by Growth Stage

| Service | Free Tier Limit | At Launch (0-1K users) | At 5K Users | At 20K Users |
|---------|----------------|----------------------|-------------|--------------|
| **Supabase** | 50K MAU, 500MB DB | $0 | $0 | $25/mo (Pro) |
| **RevenueCat** | Free < $2.5K MRR | $0 | $0 | $0 (still under $2.5K MRR at ~500 subs) |
| **PostHog** | 1M events/mo | $0 | $0 | $0-50/mo |
| **Apple Developer** | N/A | $8.25/mo ($99/yr) | $8.25/mo | $8.25/mo |
| **Expo EAS** | 30 builds/mo | $0 | $0 | $0 |
| **Domain + hosting** | N/A | $1/mo | $1/mo | $1/mo |
| **Total** | — | **~$9/mo** | **~$9/mo** | **~$34-84/mo** |

### Revenue vs. Cost Breakeven

At $4.99/mo premium (Apple takes 30% year 1, 15% after):

| Subscribers | Monthly Revenue (net) | Monthly Cost | Profit |
|-------------|----------------------|--------------|--------|
| 0 | $0 | $9 | -$9 |
| 3 | $10.48 | $9 | +$1.48 |
| 10 | $34.93 | $9 | +$25.93 |
| 100 | $349.30 | $9 | +$340.30 |
| 500 | $1,746.50 | $34 | +$1,712.50 |

**Breakeven at just 3 premium subscribers.** The cost structure is extremely favorable for a solo founder.

---

## 10. Technical Decisions & Trade-offs

### Why Supabase over Firebase

**Decision:** Supabase

- **Data model:** ShiftWell's data is relational (users have shifts, shifts generate plans, plans compare to health data). PostgreSQL handles this naturally with foreign keys and joins. Firestore's document model would require denormalization and complex queries.
- **Row-Level Security:** Supabase RLS is native PostgreSQL — security rules are in the database itself, not in application code. Firebase Security Rules are a separate DSL that's error-prone.
- **Pricing predictability:** Supabase charges by database size and MAU. Firebase charges per read/write/delete operation, which can spike unpredictably (a user refreshing their plan 10 times = 10x the reads).
- **SQL access:** The founder (or Claude Code) can query the database directly with SQL for debugging or analytics. No equivalent in Firestore.
- **Exit strategy:** PostgreSQL is portable. If Supabase disappears, move to any Postgres host. Firestore locks you into Google.

### Why RevenueCat over Direct StoreKit

**Decision:** RevenueCat

- **Receipt validation:** StoreKit receipt validation requires a server, certificate pinning, and handling of edge cases (refunds, family sharing, grace periods). RevenueCat handles all of this.
- **Cross-platform:** When Android launches, RevenueCat uses the same API for Google Play billing.
- **Analytics:** MRR, churn, cohort analysis, and trial conversion are built into the RevenueCat dashboard. Building this manually would take weeks.
- **Code simplicity:** ~50 lines of integration code vs. hundreds for raw StoreKit.
- **Cost:** Free until $2,500 MRR. At that point, the app is profitable enough that the 1% fee is trivial.

### Why Local-First Sync (Not Cloud-First)

**Decision:** Local-first with cloud backup

- **Offline reliability:** Shift workers are often in hospitals with poor cell signal, underground parking structures, or areas with spotty WiFi. The app must work without internet, always.
- **Speed:** Local reads from AsyncStorage are instant (<10ms). Supabase reads require network (~100-500ms). The Today screen must load instantly at 3am when a nurse checks their next sleep window.
- **Algorithm independence:** The circadian algorithm is pure TypeScript math. It never needs the network. This is a feature, not a limitation.
- **Graceful degradation:** If Supabase goes down (it happens), the app keeps working. Users don't notice.
- **Trade-off accepted:** Conflict resolution is simple (last-write-wins). This is fine for single-user data. If two devices edit the same shift, the later edit wins. Acceptable for the use case.

### Why Not Build a Custom Backend

**Decision:** Supabase (managed service)

- **The founder is solo.** Every hour spent on DevOps is an hour not spent on the circadian algorithm, UI, or talking to users.
- **Supabase handles 90% of backend needs** (auth, database, real-time, Edge Functions, storage) with zero infrastructure management.
- **Remaining 10%:** Edge Functions cover anything custom (RevenueCat webhooks, weekly summary generation, push notification triggers).
- **When to reconsider:** If ShiftWell reaches >50K MAU and needs custom business logic that Edge Functions can't handle, evaluate migrating to a dedicated backend. Not before.

---

## 11. New Dependencies (Phase 2)

```json
{
  "Phase 2A — Foundation": {
    "@supabase/supabase-js": "^2.x",
    "expo-secure-store": "~55.x",
    "expo-apple-authentication": "~55.x"
  },
  "Phase 2B — HealthKit + Notifications": {
    "@kingstinct/react-native-healthkit": "^7.x",
    "expo-notifications": "~55.x"
  },
  "Phase 2C — Premium + Analytics": {
    "react-native-purchases": "^8.x",
    "posthog-react-native": "^3.x"
  }
}
```

### Environment Variables (`.env`)

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_REVENUECAT_API_KEY=appl_xxxx
EXPO_PUBLIC_POSTHOG_API_KEY=phc_xxxx
```

**Never commit `.env` to git.** The `.gitignore` already excludes it.

---

## 12. New File Structure (Phase 2 Additions)

```
src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Supabase client initialization
│   │   ├── auth.ts                # Auth helper functions
│   │   ├── storage-adapter.ts     # SecureStore adapter for session tokens
│   │   └── database.types.ts      # Auto-generated from Supabase CLI
│   ├── sync/
│   │   └── sync-engine.ts         # Offline queue, conflict resolution, full sync
│   ├── healthkit/
│   │   ├── healthkit-service.ts   # HealthKit read/write operations
│   │   ├── sleep-comparison.ts    # Planned vs. actual sleep analysis
│   │   └── accuracy-score.ts      # Plan adherence calculation
│   ├── notifications/
│   │   └── notification-service.ts # Schedule/cancel local notifications
│   ├── purchases/
│   │   └── revenue-cat.ts         # RevenueCat initialization and purchase flow
│   └── analytics/
│       └── posthog.ts             # PostHog initialization and typed event tracking
├── store/
│   ├── auth-store.ts              # Auth state: session, sign in/out
│   └── subscription-store.ts      # Premium status: check, purchase, restore
├── components/
│   ├── auth/
│   │   ├── SignInScreen.tsx        # Apple Sign-In + email sign-in
│   │   ├── SignUpScreen.tsx        # Email registration
│   │   └── AccountScreen.tsx       # Profile, sign out, delete account
│   ├── premium/
│   │   ├── Paywall.tsx             # Full-screen paywall modal
│   │   ├── PremiumBadge.tsx        # Lock icon on gated features
│   │   └── UpgradePrompt.tsx       # Inline upgrade card
│   └── healthkit/
│       ├── AccuracyCard.tsx        # Plan accuracy display on Today screen
│       └── HealthKitSetup.tsx      # Permission request during onboarding
└── hooks/
    ├── usePremium.ts              # Premium status + paywall trigger
    └── useHealthKit.ts            # HealthKit data access hook
```

---

## 13. Actionable Checklist for "Build Phase 2A"

When a future Claude Code session is asked to "build Phase 2A," here is the exact sequence of work:

### Pre-work (5 minutes)

- [ ] Read `ACTIVITY_LOG.md` to confirm Phase 1 is complete
- [ ] Run `npx jest` in `nightshift/` to verify 83 tests still pass
- [ ] Confirm the founder has created a Supabase project and can provide URL + anon key

### Step 1: Supabase Client Setup

- [ ] Install dependencies: `@supabase/supabase-js`, `expo-secure-store`
- [ ] Create `src/lib/supabase/storage-adapter.ts` (SecureStore adapter, code above)
- [ ] Create `src/lib/supabase/client.ts` (Supabase client init, code above)
- [ ] Add environment variables to `.env` (and verify `.env` is in `.gitignore`)
- [ ] Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to `app.json` if needed

### Step 2: Database Schema

- [ ] Run the full schema SQL (Section 2) in Supabase SQL Editor
- [ ] Run the RLS policies SQL (Section 2) in Supabase SQL Editor
- [ ] Generate TypeScript types: `npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts`
- [ ] Verify tables and policies in Supabase dashboard

### Step 3: Authentication

- [ ] Install `expo-apple-authentication`
- [ ] Create `src/lib/supabase/auth.ts` with signIn/signUp/signOut/checkSession functions
- [ ] Create `src/store/auth-store.ts` (Zustand store for auth state)
- [ ] Enable Apple provider in Supabase Auth settings
- [ ] Add `"usesAppleSignIn": true` to `app.json` under `ios`
- [ ] Create `src/components/auth/SignInScreen.tsx`
- [ ] Create `src/components/auth/SignUpScreen.tsx`
- [ ] Update root `app/_layout.tsx` to check auth state on launch
- [ ] Update onboarding flow to optionally prompt for account creation

### Step 4: Data Sync Engine

- [ ] Create `src/lib/sync/sync-engine.ts` with offline queue and flush logic
- [ ] Update `src/store/user-store.ts` to write to Supabase when authenticated
- [ ] Update `src/store/shifts-store.ts` to write to Supabase when authenticated
- [ ] Update `src/store/plan-store.ts` to write to Supabase when authenticated
- [ ] Implement one-time migration: read all AsyncStorage → upsert to Supabase on first sign-in
- [ ] Add sync status indicator in Settings (synced / syncing / offline)

### Step 5: Account Management UI

- [ ] Create `src/components/auth/AccountScreen.tsx` (profile, sign out, delete account)
- [ ] Add account section to Settings tab
- [ ] Implement "Delete Account" (delete Supabase user + all their data)
- [ ] Test: sign out → sign in → verify data persists

### Step 6: Verification

- [ ] All 83 existing tests still pass
- [ ] Fresh install → onboard without account → works fully offline
- [ ] Create account with Apple Sign-In → data migrates to Supabase
- [ ] Kill app → reinstall → sign in → all data restored
- [ ] Airplane mode → add shifts → reconnect → data syncs
- [ ] Sign out → sign in on different device → data appears (if testable)

---

> **This document is the source of truth for Phase 2 architecture.** Update it as decisions change during implementation. Keep `PROJECT_CONTEXT.md` and `IMPLEMENTATION_PLAN.md` in sync after Phase 2A is complete.
