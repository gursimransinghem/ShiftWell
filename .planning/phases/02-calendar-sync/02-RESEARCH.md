# Phase 2: Calendar Sync - Research

**Researched:** 2026-04-02
**Domain:** Native calendar access (expo-calendar), Google OAuth (react-native-google-signin), background task scheduling (expo-background-task), Google Calendar REST API
**Confidence:** HIGH (core calendar API), MEDIUM (Google OAuth flow details), HIGH (background task behavior)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Calendar connection offered as optional step at end of onboarding ("Skip for now" available). Also accessible from Settings anytime.
- **D-02:** Connection flow shows provider cards (Apple Calendar + Google Calendar) with provider logos. One tap → native permission prompt (Apple) or OAuth (Google).
- **D-03:** After connecting, auto-scan ALL calendars. Show calendar list with toggles so user can exclude specific calendars. Default: all on.
- **D-04:** In Settings, connected providers show as cards with status ("Connected — 3 calendars") and green dot. Tap to manage calendar toggles or disconnect.
- **D-05:** After initial scan, present a review screen: "These look like your shifts — confirm or adjust." List of detected shifts with checkmarks. User can uncheck false positives and check missed events.
- **D-06:** After initial setup, ongoing shift detection is fully automatic — no notification or review needed for new shifts.
- **D-07:** User can optionally tag one calendar as "Work Schedule" — all events from that calendar treated as shifts (skip heuristics). But the algorithm still reads ALL connected calendars for conflict avoidance and sleep planning context.
- **D-08:** Existing `shift-detector.ts` heuristics (keyword + duration) are the foundation. Extend as needed for live calendar events vs. ICS imports.
- **D-09:** Auto-create a dedicated "ShiftWell" calendar in the user's calendar app. All plan events write there by default.
- **D-10:** Two-tier writing: ShiftWell calendar gets full plan; native calendar gets sleep blocks + naps only.
- **D-11:** Default: both calendars active. User can disable native calendar writing in Settings.
- **D-12:** User can change target calendar for sleep blocks in Settings.
- **D-13:** Sleep block event format: Title "Sleep — 11:00 PM" or "Nap — 2:30 PM". ShiftWell brand color. Description includes wind-down time, caffeine cutoff, etc.
- **D-14:** Background polling every 15-30 min when backgrounded. Also sync on app open.
- **D-15:** Change notification preference user-configurable: silent / badge / push. Default is Claude's discretion.
- **D-16:** Shift deletion → recalculate optimal sleep plan for free time (Circadian Reset), not just delete sleep blocks.

### Claude's Discretion

- Confidence indicator approach on shift review screen (pre-checked = high confidence, unchecked = low)
- Event correction interaction pattern (simple and premium-feeling)
- Default change notification setting
- Background polling interval (15-30 min range)
- OAuth flow implementation details for Google Calendar
- ShiftWell calendar color choice

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CAL-01 | User can connect Apple Calendar (read access to shifts + personal events) | expo-calendar requestCalendarPermissionsAsync + getCalendarsAsync; iOS 17 permission model |
| CAL-02 | User can connect Google Calendar (read access to shifts + personal events) | react-native-google-signin with calendar.readonly scope + Google Calendar REST API |
| CAL-03 | App auto-detects shift events from connected calendars | Extend existing shift-detector.ts; add keyword confidence scoring; "Work Schedule" calendar bypass |
| CAL-04 | App writes sleep blocks back to user's calendar as real events | expo-calendar createCalendarAsync + createEventAsync; two-tier strategy |
| CAL-05 | Sleep blocks auto-update when calendar changes (dynamic rescheduling) | expo-background-task polling + Google syncToken delta sync; D-16 Circadian Reset |
| CAL-06 | User can configure which calendars to read and write to | Calendar toggle state in new calendar-store; Settings UI |
</phase_requirements>

---

## Summary

Phase 2 builds on the existing `shift-detector.ts`, `ics-generator.ts`, and `sync-engine.ts` infrastructure to connect real calendars natively. The split is clean: Apple Calendar uses `expo-calendar` (native, no OAuth), while Google Calendar requires the `@react-native-google-signin/google-signin` native module plus direct calls to the Google Calendar REST API.

Background polling uses `expo-background-task` (the modern replacement for the deprecated `expo-background-fetch`) with `expo-task-manager`. On iOS, background tasks fire roughly every 15-30 minutes when the app is alive but backgrounded — which aligns perfectly with D-14. Tasks are killed if the user swipes away the app, so the on-app-open sync (AppState listener) is equally important.

The biggest architectural decision is state management for calendar metadata (which calendars are connected, which are toggled on, the ShiftWell calendar ID, last-sync cursors, Google tokens). This state does not exist yet and needs a new `calendar-store.ts` in Zustand + AsyncStorage, following the existing pattern.

**Primary recommendation:** Install `expo-calendar`, `expo-background-task`, `expo-task-manager`, and `@react-native-google-signin/google-signin`. Build a `CalendarService` abstraction layer that normalizes Apple and Google events into the existing `ShiftEvent | PersonalEvent` type union before they reach the shift detector.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-calendar | ~55.0.10 | Read/write native calendar on iOS | Official Expo module; wraps EventKit; required for Apple Calendar access |
| expo-background-task | ~55.0.10 | Background polling every 15-30 min | Modern replacement for deprecated expo-background-fetch; uses BGTaskScheduler on iOS |
| expo-task-manager | ~55.0.10 | Task registration/lifecycle for background-task | Required peer dependency for expo-background-task |
| @react-native-google-signin/google-signin | latest | Google OAuth + access token acquisition | Recommended by Expo docs; provides native Sign-In button + token retrieval; cannot run in Expo Go |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-auth-session | ~55.0.10 | Alternative to google-signin for OAuth | Only if google-signin causes EAS build issues; more setup complexity for Calendar scopes |
| date-fns | ^4.1.0 (already installed) | Date range math for getEventsAsync | Already in project; use for building startDate/endDate windows |

### Not Needed
The existing `ical.js` (already installed) is only used for ICS file parsing — it is NOT used for native calendar sync. The native path goes through `expo-calendar` for Apple and the REST API for Google.

**Installation (net new):**
```bash
npx expo install expo-calendar expo-background-task expo-task-manager
npm install @react-native-google-signin/google-signin
```

**Version verification (confirmed 2026-04-02):**
- `expo-calendar`: 55.0.10
- `expo-background-task`: 55.0.10
- `expo-task-manager`: 55.0.10

---

## Architecture Patterns

### Recommended Project Structure
```
src/lib/calendar/
├── calendar-service.ts        # NEW: unified CalendarService (Apple + Google)
├── google-calendar-api.ts     # NEW: Google REST API client (events list, create, delete)
├── calendar-store.ts          # NEW: Zustand store (connected state, toggles, tokens, cursor)
├── background-sync.ts         # NEW: TaskManager task definition (must be top-level module)
├── shift-detector.ts          # EXISTING: extend isLikelyShift() with confidence score
├── ics-parser.ts              # EXISTING: unchanged
└── ics-generator.ts           # EXISTING: unchanged

app/(onboarding)/
└── calendar.tsx               # NEW: optional onboarding step (after healthkit.tsx)

app/(tabs)/
└── settings.tsx               # EXISTING: add CalendarSection component

src/components/calendar/
├── CalendarProviderCard.tsx   # NEW: Apple/Google connection card with status dot
├── CalendarToggleList.tsx     # NEW: per-calendar toggle list after connection
└── ShiftReviewList.tsx        # NEW: initial shift review screen
```

### Pattern 1: CalendarService Abstraction Layer

**What:** A single `CalendarService` class that normalizes Apple (expo-calendar) and Google (REST API) events into the existing `ShiftEvent | PersonalEvent` union types before they reach `shift-detector.ts`.

**When to use:** All event reads go through this layer. The shift detector never knows if data came from Apple or Google.

```typescript
// src/lib/calendar/calendar-service.ts
import * as ExpoCalendar from 'expo-calendar';
import type { ShiftEvent, PersonalEvent } from '../circadian/types';
import { separateShiftsFromPersonal } from './shift-detector';
import { fetchGoogleEvents } from './google-calendar-api';

export interface RawCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  calendarId: string;
  source: 'apple' | 'google';
}

/**
 * Fetch all events from enabled Apple Calendar calendars for a date range.
 */
export async function fetchAppleEvents(
  calendarIds: string[],
  startDate: Date,
  endDate: Date,
): Promise<RawCalendarEvent[]> {
  const events = await ExpoCalendar.getEventsAsync(calendarIds, startDate, endDate);
  return events.map((e) => ({
    id: e.id,
    title: e.title ?? 'Untitled',
    start: new Date(e.startDate),
    end: new Date(e.endDate),
    calendarId: e.calendarId,
    source: 'apple' as const,
  }));
}

/**
 * Unified fetch: Apple + Google events merged and deduplicated.
 */
export async function fetchAllEvents(
  appleCalendarIds: string[],
  googleCalendarIds: string[],
  accessToken: string | null,
  startDate: Date,
  endDate: Date,
): Promise<RawCalendarEvent[]> {
  const [apple, google] = await Promise.allSettled([
    appleCalendarIds.length > 0 ? fetchAppleEvents(appleCalendarIds, startDate, endDate) : Promise.resolve([]),
    googleCalendarIds.length > 0 && accessToken ? fetchGoogleEvents(googleCalendarIds, accessToken, startDate, endDate) : Promise.resolve([]),
  ]);

  const appleEvents = apple.status === 'fulfilled' ? apple.value : [];
  const googleEvents = google.status === 'fulfilled' ? google.value : [];
  return [...appleEvents, ...googleEvents];
}
```

### Pattern 2: iOS Calendar Permission (iOS 17+ model)

**What:** iOS 17 split the old `NSCalendarsUsageDescription` into full-access and write-only. expo-calendar SDK 55 supports both. ShiftWell needs full access (read shifts + write sleep blocks).

**app.json entry (add to `ios.infoPlist`):**
```json
{
  "NSCalendarsFullAccessUsageDescription": "ShiftWell reads your calendar to detect work shifts and writes sleep blocks back as events.",
  "NSCalendarsWriteOnlyAccessUsageDescription": "ShiftWell adds sleep plan events to your calendar."
}
```

**Permission request:**
```typescript
// Source: https://docs.expo.dev/versions/v55.0.0/sdk/calendar/
import * as ExpoCalendar from 'expo-calendar';

async function requestCalendarAccess(): Promise<boolean> {
  const { status } = await ExpoCalendar.requestCalendarPermissionsAsync();
  return status === 'granted';
}
```

### Pattern 3: Creating the ShiftWell Calendar (iOS)

iOS requires using the default calendar source as the `sourceId` for new calendars. Android requires `{ isLocalAccount: true }`. Because iOS is the only target for v1.0, use the iOS path.

```typescript
// Source: expo-calendar docs + expo/expo GitHub examples
import * as ExpoCalendar from 'expo-calendar';

export async function getOrCreateShiftWellCalendar(): Promise<string> {
  // Check if already exists
  const calendars = await ExpoCalendar.getCalendarsAsync(ExpoCalendar.EntityTypes.EVENT);
  const existing = calendars.find((c) => c.title === 'ShiftWell');
  if (existing) return existing.id;

  // Get default source (required on iOS)
  const defaultCal = await ExpoCalendar.getDefaultCalendarAsync();
  const newCalId = await ExpoCalendar.createCalendarAsync({
    title: 'ShiftWell',
    color: '#6B5CE7',            // Purple — brand color from ics-generator.ts
    entityType: ExpoCalendar.EntityTypes.EVENT,
    sourceId: defaultCal.source.id,
    source: defaultCal.source,
    name: 'ShiftWell',
    ownerAccount: 'personal',
    accessLevel: ExpoCalendar.CalendarAccessLevel.OWNER,
  });
  return newCalId;
}
```

### Pattern 4: Writing Sleep Block Events

Two-tier strategy (D-10): write full plan to ShiftWell calendar, sleep+nap only to native calendar.

```typescript
import * as ExpoCalendar from 'expo-calendar';
import type { PlanBlock } from '../circadian/types';

export async function writeSleepBlock(
  block: PlanBlock,
  calendarId: string,
): Promise<string> {
  return await ExpoCalendar.createEventAsync(calendarId, {
    title: block.type === 'nap' ? `Nap — ${formatTime(block.start)}` : `Sleep — ${formatTime(block.start)}`,
    startDate: block.start,
    endDate: block.end,
    notes: block.description,
    alarms: block.priority === 1 ? [{ relativeOffset: -15 }] : [],
  });
}
```

### Pattern 5: Google Calendar via REST API

After sign-in with `@react-native-google-signin/google-signin`, call the REST API directly using the access token. Do NOT use the Google API client library — it adds unnecessary bundle weight.

```typescript
// src/lib/calendar/google-calendar-api.ts
const GCAL_BASE = 'https://www.googleapis.com/calendar/v3';

export async function fetchGoogleEvents(
  calendarIds: string[],
  accessToken: string,
  startDate: Date,
  endDate: Date,
): Promise<RawCalendarEvent[]> {
  const allEvents: RawCalendarEvent[] = [];

  for (const calendarId of calendarIds) {
    const params = new URLSearchParams({
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: 'true',         // Expand recurring into instances
      maxResults: '250',
    });

    const res = await fetch(`${GCAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) continue; // Graceful degradation per calendar
    const data = await res.json();

    for (const item of data.items ?? []) {
      if (item.status === 'cancelled') continue;
      const start = new Date(item.start?.dateTime ?? item.start?.date);
      const end = new Date(item.end?.dateTime ?? item.end?.date);
      allEvents.push({
        id: item.id,
        title: item.summary ?? 'Untitled',
        start,
        end,
        calendarId,
        source: 'google',
      });
    }
  }

  return allEvents;
}

/** Delta sync using syncToken — only fetches changed events since last poll */
export async function fetchGoogleEventsDelta(
  calendarId: string,
  accessToken: string,
  syncToken: string,
): Promise<{ events: RawCalendarEvent[]; nextSyncToken: string | null }> {
  const res = await fetch(
    `${GCAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events?syncToken=${syncToken}&singleEvents=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  // syncToken expired (410 Gone) — do a full sync
  if (res.status === 410) return { events: [], nextSyncToken: null };

  const data = await res.json();
  const events = (data.items ?? [])
    .filter((i: { status?: string }) => i.status !== 'cancelled')
    .map((item: { id: string; summary?: string; start?: { dateTime?: string; date?: string }; end?: { dateTime?: string; date?: string } }) => ({
      id: item.id,
      title: item.summary ?? 'Untitled',
      start: new Date(item.start?.dateTime ?? item.start?.date ?? ''),
      end: new Date(item.end?.dateTime ?? item.end?.date ?? ''),
      calendarId,
      source: 'google' as const,
    }));

  return { events, nextSyncToken: data.nextSyncToken ?? null };
}
```

### Pattern 6: Background Task Registration

Must be defined at the module top level (not inside a component). Register in the root `_layout.tsx` effect.

```typescript
// src/lib/calendar/background-sync.ts
// Source: https://docs.expo.dev/versions/v55.0.0/sdk/background-task/
import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';
import { BackgroundTaskResult } from 'expo-background-task';

export const CALENDAR_SYNC_TASK = 'SHIFTWELL_CALENDAR_SYNC';

TaskManager.defineTask(CALENDAR_SYNC_TASK, async () => {
  try {
    // Import lazily inside task to avoid circular deps
    const { runCalendarSync } = await import('./calendar-service');
    await runCalendarSync();
    return BackgroundTaskResult.Success;
  } catch {
    return BackgroundTaskResult.Failed;
  }
});

export async function registerCalendarBackgroundSync(): Promise<void> {
  await BackgroundTask.registerTaskAsync(CALENDAR_SYNC_TASK, {
    minimumInterval: 20, // minutes — middle of 15-30 range (D-14, D-Claude)
  });
}
```

**app.json addition required:**
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["processing"],
        "BGTaskSchedulerPermittedIdentifiers": [
          "com.expo.modules.backgroundtask.processing"
        ]
      }
    }
  }
}
```

### Pattern 7: Google OAuth Configuration

```typescript
// GoogleSignin.configure() — call once at app startup (root _layout.tsx)
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  scopes: [
    'https://www.googleapis.com/auth/calendar.readonly',   // Read shifts + personal events
    'https://www.googleapis.com/auth/calendar.events',     // Write sleep blocks
  ],
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

// Sign in and get access token
async function connectGoogleCalendar(): Promise<string> {
  await GoogleSignin.hasPlayServices();
  await GoogleSignin.signIn();
  const tokens = await GoogleSignin.getTokens();
  return tokens.accessToken;
}
```

**app.json addition required:**
```json
{
  "expo": {
    "plugins": [
      ["@react-native-google-signin/google-signin", {
        "iosUrlScheme": "com.googleusercontent.apps.YOUR_CLIENT_ID"
      }]
    ]
  }
}
```

**Google Cloud Console setup required (manual, before build):**
1. Create OAuth 2.0 Client ID for iOS (bundle: `com.shiftwell.app`)
2. Download `GoogleService-Info.plist` or copy `iosUrlScheme` from Client ID
3. Enable Google Calendar API in the project

### Pattern 8: Shift Detector Extension — Confidence Scoring

Extend `isLikelyShift()` to return a confidence score (0.0–1.0) instead of boolean. Used for the shift review screen (D-05, Claude's discretion on UI).

```typescript
// Extend src/lib/calendar/shift-detector.ts
export function shiftConfidence(summary: string, durationHours: number): number {
  if (durationHours === 24) return 0;         // All-day = definitely not a shift
  if (durationHours < 5.5) return 0;

  const lowerSummary = summary.toLowerCase();
  const hasKeyword = SHIFT_KEYWORDS.some((kw) => lowerSummary.includes(kw));
  const isShiftLength = durationHours >= 6 && durationHours <= 28;

  if (isShiftLength && hasKeyword) return 0.95;
  if (isShiftLength) return 0.70;             // Long but no keyword — pre-checked, medium confidence
  return 0;
}
```

UI rule (Claude's discretion): confidence >= 0.80 → pre-checked. Confidence 0.50–0.79 → pre-checked with amber indicator dot. Confidence < 0.50 → unchecked. This matches the "premium-feeling, not noisy" bar.

### Pattern 9: Calendar Store (new Zustand store)

```typescript
// src/lib/calendar/calendar-store.ts (or src/store/calendar-store.ts)
interface CalendarState {
  // Apple Calendar
  appleConnected: boolean;
  appleCalendars: { id: string; title: string; color: string; enabled: boolean }[];
  shiftWellCalendarId: string | null;   // The auto-created ShiftWell calendar ID

  // Google Calendar
  googleConnected: boolean;
  googleCalendars: { id: string; summary: string; enabled: boolean }[];
  googleAccessToken: string | null;
  googleTokenExpiry: number | null;     // Unix timestamp

  // "Work Schedule" calendar tags
  workCalendarId: string | null;        // D-07: bypass heuristics for this calendar

  // Sync cursors (for delta sync per Google calendar)
  googleSyncTokens: Record<string, string>;   // calendarId → syncToken
  lastSyncedAt: string | null;

  // Write preferences
  writeToNativeCalendar: boolean;       // D-11: default true
  nativeWriteCalendarId: string | null; // D-12: defaults to shiftWellCalendarId

  // Change notifications
  changeNotificationMode: 'silent' | 'badge' | 'push'; // D-15
}
```

### Anti-Patterns to Avoid

- **Do not call expo-calendar from within the background task directly** — expo-calendar may not be available in all background contexts. Confirm permissions are still valid before reading.
- **Do not store Google access tokens in plain AsyncStorage** — use `expo-secure-store` for `googleAccessToken`. Tokens are OAuth credentials.
- **Do not delete sleep block events then recreate on every sync** — this causes calendar flickering and duplicate notifications. Track `eventId → planBlockId` mapping and use `updateEventAsync` for changes.
- **Do not block the shift review screen with a spinner** — the initial scan can take 1-3 seconds on large calendars. Show skeleton rows while loading.
- **Do not use `expo-background-fetch`** — it is deprecated in SDK 55 and will be removed. Use `expo-background-task`.
- **Do not hardcode the ShiftWell calendar ID** — it changes if the user deletes and reconnects. Always read from `calendar-store.ts`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Native calendar access | EventKit wrapper | expo-calendar | EventKit API is complex; timezone handling, recurring event expansion, permission model all abstracted |
| Google OAuth token lifecycle | Custom OAuth PKCE flow | @react-native-google-signin | Token refresh, native sign-in sheet, keychain storage already handled |
| Google Calendar delta sync | Custom change detection | Google Calendar `syncToken` parameter | syncToken returns only changed events; full re-fetch wastes quota and misses deletions |
| Background task scheduling | Custom timer / setInterval | expo-background-task | setInterval is killed on background; BGTaskScheduler is the iOS-approved mechanism |
| Recurring event expansion | Custom rrule parser | `getEventsAsync` with date range + `singleEvents: true` (Google REST) | Apple EventKit expands recurring events natively; Google REST `singleEvents=true` does the same |

**Key insight:** The hardest problems in calendar sync (timezone normalization, recurring event expansion, permission revocation recovery, token refresh) are fully solved by the standard stack. Custom implementations will fail on edge cases that existing libraries have already fixed.

---

## Common Pitfalls

### Pitfall 1: iOS 17 Calendar Permission Split
**What goes wrong:** App requests `NSCalendarsUsageDescription` (deprecated) and gets no permission on iOS 17+ devices, or permission prompt shows outdated copy.
**Why it happens:** iOS 17 replaced the single permission with `NSCalendarsFullAccessUsageDescription` and `NSCalendarsWriteOnlyAccessUsageDescription`. Older permission strings are silently ignored.
**How to avoid:** Add BOTH new keys to `app.json ios.infoPlist` with user-facing copy that mentions both reading shifts AND writing sleep events.
**Warning signs:** Permission dialog doesn't appear, or appears with no description text.

### Pitfall 2: ShiftWell Calendar Source ID
**What goes wrong:** `createCalendarAsync` crashes on iOS because `sourceId` is missing or wrong.
**Why it happens:** iOS requires the source of a new calendar to match the device's default calendar source. Using a hardcoded source ID fails on iCloud Calendar users vs. local calendar users.
**How to avoid:** Always call `getDefaultCalendarAsync()` first, then use `defaultCal.source.id` and `defaultCal.source` as the source parameters.
**Warning signs:** `createCalendarAsync` throws "Invalid calendar source."

### Pitfall 3: Background Task Not Firing on iOS
**What goes wrong:** Background sync never runs; last-synced time stays stale for hours.
**Why it happens:** iOS BGTaskScheduler only fires tasks when the system decides (not on our requested interval). Apps with low usage patterns get less background time.
**How to avoid:** Treat background sync as "best effort." The on-app-open sync is the reliable path — always sync on `AppState` change to `active`. Background is supplemental.
**Warning signs:** Background task status shows `restricted` — check Settings > General > Background App Refresh is on for ShiftWell.

### Pitfall 4: Google syncToken Expiry (410 Gone)
**What goes wrong:** Delta sync returns HTTP 410; app crashes or shows stale data.
**Why it happens:** Google invalidates syncTokens after ~7 days or on full calendar rebuild. This is documented behavior.
**How to avoid:** When a `fetchGoogleEventsDelta` call returns 410, clear the stored `syncToken` for that calendar and fall back to a full re-fetch with `timeMin`/`timeMax`.
**Warning signs:** Google Calendar delta sync returns 410 status unexpectedly.

### Pitfall 5: Calendar Event ID Drift on Sleep Block Updates
**What goes wrong:** Every sync creates duplicate sleep block events in the user's calendar.
**Why it happens:** Plan regeneration creates new `PlanBlock` IDs; if the event-to-block mapping isn't persisted, the old calendar event is orphaned and a new one is created.
**How to avoid:** Persist a `calendarEventId` on each written block (stored in `calendar-store.ts` or `shifts-store.ts`). On plan update, call `updateEventAsync` if `calendarEventId` exists, `createEventAsync` if it doesn't.
**Warning signs:** User reports duplicate "Sleep" events accumulating in calendar.

### Pitfall 6: @react-native-google-signin Incompatible with Expo Go
**What goes wrong:** App crashes on startup in Expo Go during development.
**Why it happens:** The library requires native modules not available in the Expo Go sandbox.
**How to avoid:** Use a development build (`npx expo run:ios`) for all testing of Google Calendar features. Document this in CLAUDE.md under development requirements.
**Warning signs:** "Native module not found" error at runtime in Expo Go.

### Pitfall 7: Shift Detector False Positives on Doctor's Appointments
**What goes wrong:** 6-hour medical appointment incorrectly detected as a shift; adds it to the sleep plan.
**Why it happens:** Duration heuristic alone (5.5–28h) is too broad. "Appointment" events that are long (e.g., a trip, a multi-session procedure) slip through.
**How to avoid:** Keep keyword scoring. Add a negative keyword list: `['appointment', 'flight', 'travel', 'vacation', 'trip', 'conference', 'meeting']` that penalizes confidence score. If confidence drops below threshold even with shift length, don't auto-detect. User review screen (D-05) is the final safety net.
**Warning signs:** Non-work events appearing in the shift review list.

---

## Code Examples

### Get All Calendars After Permission Grant (Apple)
```typescript
// Source: https://docs.expo.dev/versions/v55.0.0/sdk/calendar/
import * as ExpoCalendar from 'expo-calendar';

const calendars = await ExpoCalendar.getCalendarsAsync(ExpoCalendar.EntityTypes.EVENT);
// Returns: { id, title, color, source: { name, type } }[]
// Filter: calendars.filter(c => c.allowsModifications) for writable calendars
```

### Get Events in Date Window (Apple)
```typescript
import * as ExpoCalendar from 'expo-calendar';
import { addDays } from 'date-fns';

const startDate = new Date();
const endDate = addDays(startDate, 28);
const enabledCalendarIds = ['cal-id-1', 'cal-id-2'];

const events = await ExpoCalendar.getEventsAsync(enabledCalendarIds, startDate, endDate);
// Returns: { id, title, startDate, endDate, calendarId, allDay }[]
// Note: allDay events have startDate at midnight; filter out if allDay === true
```

### List Google Calendars
```typescript
const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
  headers: { Authorization: `Bearer ${accessToken}` },
});
const { items } = await res.json();
// items: { id, summary, backgroundColor, selected, accessRole }[]
```

### Check and Refresh Google Token
```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

async function getValidToken(): Promise<string> {
  // getTokens() auto-refreshes if expired
  const { accessToken } = await GoogleSignin.getTokens();
  return accessToken;
}
```

### AppState Listener for On-Open Sync
```typescript
// In root _layout.tsx
import { AppState, type AppStateStatus } from 'react-native';

useEffect(() => {
  let lastState: AppStateStatus = AppState.currentState;
  const sub = AppState.addEventListener('change', (next) => {
    if (lastState !== 'active' && next === 'active') {
      runCalendarSync().catch(() => {}); // Best-effort
    }
    lastState = next;
  });
  return () => sub.remove();
}, []);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| expo-background-fetch | expo-background-task | SDK 53 (May 2025) | Background fetch is deprecated; background-task uses BGTaskScheduler (iOS) and WorkManager (Android) — more reliable |
| NSCalendarsUsageDescription | NSCalendarsFullAccessUsageDescription | iOS 17 (Sep 2023) | Old key deprecated; must use new key for iOS 17+ or permission silently fails |
| expo-auth-session for Google | @react-native-google-signin | 2023 onwards | Expo docs now recommend provider-supplied libraries; google-signin handles token refresh and native UX |

**Deprecated/outdated:**
- `expo-background-fetch`: Deprecated SDK 55, will be removed. Do not use.
- `NSCalendarsUsageDescription`: Deprecated iOS 17. Do not add to infoPlist.

---

## Open Questions

1. **Google token persistence security**
   - What we know: Access tokens must not go into plain AsyncStorage.
   - What's unclear: `expo-secure-store` has a 2KB value limit per key. A full token response (access + refresh + ID token) may approach this limit.
   - Recommendation: Store only the access token in expo-secure-store; store token expiry in AsyncStorage. Call `GoogleSignin.getTokens()` (which auto-refreshes) rather than manually managing refresh tokens.

2. **Google Calendar API quota**
   - What we know: Google Calendar API has a default quota of 1,000,000 queries/day per project, but per-user rate limits apply.
   - What's unclear: Exact per-user limits for the events.list endpoint.
   - Recommendation: Use syncToken delta sync (not full re-fetch) on background polls to minimize API calls. A 20-min background poll interval on 1,000 users = ~72,000 API calls/day — well within free tier.

3. **"Work Schedule" calendar tag persistence (D-07)**
   - What we know: User can tag one calendar as "Work Schedule" to bypass heuristics.
   - What's unclear: Should this be a per-provider setting (Google calendar ID vs. Apple calendar ID can coexist) or a single global slot?
   - Recommendation: Store as `workCalendarId: string | null` in `CalendarState`. A single slot is sufficient — physicians use one scheduling system (QGenda/Amion).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| expo-calendar | CAL-01, CAL-04, CAL-05, CAL-06 | Not installed | 55.0.10 on npm | None — must install |
| expo-background-task | CAL-05 (background polling) | Not installed | 55.0.10 on npm | App-open sync only (acceptable) |
| expo-task-manager | CAL-05 | Not installed | 55.0.10 on npm | None (peer dep for background-task) |
| @react-native-google-signin/google-signin | CAL-02 | Not installed | Latest | expo-auth-session (more setup) |
| Google Calendar API | CAL-02, CAL-05 | REST API (no install) | v3 | None |
| Expo Go | Development | Available | SDK 55 | Development build required for Google Sign-In testing |
| Physical iOS device | Background task testing | Sim has device | — | Simulators cannot run BackgroundTask |

**Missing dependencies with no fallback:**
- `expo-calendar`: Required for CAL-01, CAL-04. Must install before any plan tasks can execute.
- `@react-native-google-signin/google-signin`: Required for CAL-02. Needs Google Cloud Console setup (create OAuth Client ID for bundle `com.shiftwell.app`) before first build.

**Missing dependencies with fallback:**
- `expo-background-task`: Background polling can fall back to app-open-only sync if needed. Not a blocker for phase completion.

---

## Validation Architecture

> `workflow.nyquist_validation` is absent from `.planning/config.json` — treated as enabled.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30 + ts-jest 29 |
| Config file | jest.config.js (inferred from `@types/jest ^30.0.0` + `ts-jest ^29.4.6` in package.json) |
| Quick run command | `npx jest --testPathPattern=calendar --passWithNoTests` |
| Full suite command | `npx jest --passWithNoTests` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CAL-01 | `requestCalendarPermissionsAsync` called; Apple calendars listed | unit (mock expo-calendar) | `npx jest --testPathPattern=calendar-service` | ❌ Wave 0 |
| CAL-02 | Google OAuth initiates; calendar list fetched | unit (mock google-signin + fetch) | `npx jest --testPathPattern=google-calendar-api` | ❌ Wave 0 |
| CAL-03 | `shiftConfidence()` returns correct score for keyword/duration combos | unit | `npx jest --testPathPattern=shift-detector` | ❌ Wave 0 |
| CAL-04 | `getOrCreateShiftWellCalendar()` idempotent; `writeSleepBlock()` formats title correctly | unit (mock expo-calendar) | `npx jest --testPathPattern=calendar-service` | ❌ Wave 0 |
| CAL-05 | `fetchGoogleEventsDelta()` handles 410 gracefully; background task registers | unit | `npx jest --testPathPattern=google-calendar-api` | ❌ Wave 0 |
| CAL-06 | CalendarState toggles correctly persist; disabled calendar IDs excluded from fetch | unit (mock zustand) | `npx jest --testPathPattern=calendar-store` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern=calendar --passWithNoTests`
- **Per wave merge:** `npx jest --passWithNoTests`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/calendar/__tests__/shift-detector.test.ts` — CAL-03: confidence scoring with keyword/duration matrix
- [ ] `src/lib/calendar/__tests__/calendar-service.test.ts` — CAL-01, CAL-04: mock expo-calendar module
- [ ] `src/lib/calendar/__tests__/google-calendar-api.test.ts` — CAL-02, CAL-05: mock fetch + 410 handling
- [ ] `src/lib/calendar/__tests__/calendar-store.test.ts` — CAL-06: toggle state persistence
- [ ] Jest mock for `expo-calendar`: `__mocks__/expo-calendar.ts` (standard Expo jest mock pattern)
- [ ] Jest mock for `@react-native-google-signin/google-signin`: `__mocks__/@react-native-google-signin/google-signin.ts`

---

## Sources

### Primary (HIGH confidence)
- `https://docs.expo.dev/versions/v55.0.0/sdk/calendar/` — Full API reference, permission model, iOS 17 permission keys
- `https://docs.expo.dev/versions/v55.0.0/sdk/background-task/` — registerTaskAsync, minimumInterval, BGTaskSchedulerPermittedIdentifiers
- `https://developers.google.com/workspace/calendar/api/v3/reference/events/list` — syncToken, singleEvents, timeMin/timeMax parameters
- `https://developers.google.com/workspace/calendar/api/auth` — OAuth scope URIs (calendar.readonly, calendar.events)
- npm registry — Confirmed versions: expo-calendar 55.0.10, expo-background-task 55.0.10, expo-task-manager 55.0.10

### Secondary (MEDIUM confidence)
- `https://react-native-google-signin.github.io/docs/setting-up/expo` — app.json plugin config, iosUrlScheme
- `https://expo.dev/blog/goodbye-background-fetch-hello-expo-background-task` — Migration from background-fetch to background-task (SDK 53 blog)
- `https://github.com/expo/expo/issues/24343` — iOS 17 calendar permission API change confirmation

### Tertiary (LOW confidence)
- WebSearch: shift detector false positive patterns — single source, unverified; flagged for validation during implementation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all package versions confirmed against npm registry; official Expo docs consulted for API shapes
- Architecture: HIGH for Apple Calendar (expo-calendar docs thorough); MEDIUM for Google OAuth (implementation details require Google Cloud Console setup before full verification)
- Pitfalls: HIGH for iOS 17 permission split (GitHub issue + official docs confirmed); MEDIUM for background task reliability (advisory intervals, system-dependent)

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (stable APIs; Google OAuth scopes rarely change)
