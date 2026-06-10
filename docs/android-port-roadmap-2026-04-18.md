# ShiftWell Android Port Roadmap

## Executive Summary

ShiftWell is built on Expo/React Native — roughly 90% of the codebase (algorithm, UI, state management, navigation) runs on Android unchanged. The remaining 10% is iOS-specific: HealthKit integration, Apple Sign-In, APNs push, and Live Activities. This document maps every iOS dependency to its Android equivalent, estimates effort per phase, and flags risks.

Android doubles the addressable market. 47% of US shift workers use Android, and EMS/police/transportation workers skew heavily toward Android vs. the iPhone-dominant nursing population.

---

## 1. Current iOS-Specific Dependencies

### 1.1 HealthKit → Google Health Connect

**Current state:** `@kingstinct/react-native-healthkit` v13.3.1 is deeply integrated across 6 files in `src/lib/healthkit/`:

| File | Function | Android Impact |
|------|----------|----------------|
| `healthkit-service.ts` (363 lines) | Auth, sleep queries, write planned sleep, sleeping HR | Full rewrite to Health Connect SDK |
| `biometric-reader.ts` (354 lines) | HRV (SDNN), resting HR, wrist temp, steps, sleep apnea | Partial — wrist temp and sleep apnea have no Health Connect equivalent |
| `hrv-reader.ts` (240 lines) | Historical HRV aggregation | Rewrite — Health Connect uses `HeartRateVariabilityRmssd` not SDNN |
| `sleep-comparison.ts` (200+ lines) | Planned vs actual sleep comparison | Minimal change — consumes normalized data |
| `accuracy-score.ts` (300+ lines) | Weekly/monthly accuracy scoring | No change — platform-agnostic logic |
| `index.ts` | Barrel export | Add platform routing |

**Key data field differences:**

| Data Type | HealthKit | Health Connect | Gap |
|-----------|-----------|----------------|-----|
| Sleep sessions | `HKCategoryTypeIdentifierSleepAnalysis` | `SleepSessionRecord` | Comparable — both support sleep stages |
| Heart rate | `HKQuantityTypeIdentifierHeartRate` | `HeartRateRecord` | Comparable |
| HRV | SDNN (`HKQuantityTypeIdentifierHeartRateVariabilitySDNN`) | RMSSD (`HeartRateVariabilityRmssdRecord`) | Different metric — conversion needed or dual-metric support |
| Resting HR | `HKQuantityTypeIdentifierRestingHeartRate` | `RestingHeartRateRecord` | Comparable |
| Wrist temperature | `HKQuantityTypeIdentifierAppleWalkingSteadiness` (Series 8+) | Not available | Feature gap — degrade gracefully |
| Sleep apnea events | iOS 18+ screening | Not available | Feature gap — degrade gracefully |
| Steps | `HKQuantityTypeIdentifierStepCount` | `StepsRecord` | Comparable |

**Background delivery:** HealthKit supports `enableBackgroundDelivery()` which pushes data to the app when new samples arrive. Health Connect has no equivalent — the app must poll via foreground or WorkManager-scheduled reads.

**Effort:** ~40 hours (largest single work item)

### 1.2 Apple Sign-In → Google Sign-In

**Current state:** `expo-apple-authentication` v55.0.8 in `src/lib/supabase/auth.ts` provides `signInWithApple()` → Supabase Apple provider.

**Android equivalent:** `@react-native-google-signin/google-signin` or Expo's `expo-auth-session` with Google provider. Supabase already supports Google OAuth.

**Pattern:** Platform-gate the sign-in button — show Apple on iOS, Google on Android, email/password on both.

**Effort:** ~4 hours

### 1.3 Push Notifications: APNs → FCM

**Current state:** `expo-notifications` v55.0.12 handles local scheduling (sleep reminders, caffeine cutoffs, wake reminders). Remote push is configured for APNs in `app.json` via `UIBackgroundModes: ["remote-notification"]`.

**Android equivalent:** `expo-notifications` is cross-platform for local notifications — works on Android with zero changes. Remote push requires:
- Firebase project creation
- `google-services.json` in project root
- FCM server key configured in Expo push service
- Android-specific: notification channels (required since Android 8.0)

**Effort:** ~6 hours (Firebase setup + channel definitions)

### 1.4 Secure Storage: Keychain → Android Keystore

**Current state:** `expo-secure-store` v55.0.8 used in `auth-store.ts` and `storage-adapter.ts` for session tokens and Google access tokens.

**Android equivalent:** `expo-secure-store` already handles this transparently — uses Android's `EncryptedSharedPreferences` (backed by Android Keystore) on Android. No code changes needed.

**Effort:** 0 hours

### 1.5 TestFlight → Google Play Internal Testing

| Aspect | TestFlight | Google Play Internal Testing |
|--------|-----------|------------------------------|
| Tester limit | 10,000 | 100 (internal), 200,000 (closed testing) |
| Build availability | ~15 min after processing | Minutes after upload |
| Enrollment | Email invite → TestFlight app | Opt-in via Play Store link |
| Cost | Included with Apple Developer ($99/yr) | Google Play Developer ($25 one-time) |
| Build format | .ipa | .aab (app bundle) |
| EAS command | `eas build --platform ios` | `eas build --platform android` |

**Effort:** ~2 hours (Google Play Console setup, initial upload)

### 1.6 Live Activities (ActivityKit) → No Direct Equivalent

**Current state:** `src/lib/adherence/live-activity-service.ts` is a stub — requires Xcode + Swift extension, not yet implemented.

**Android equivalent:** Persistent ongoing notifications with custom layouts (`Notification.Builder.setOngoing(true)` + `DecoratedCustomViewStyle`). Less visually prominent than Live Activities but functionally equivalent for showing "time until next sleep window."

**Effort:** ~8 hours (but can defer since iOS version is also stubbed)

### 1.7 Background Sync

**Current state:** `expo-background-task` + `expo-task-manager` in `background-sync.ts` polls calendar every 20 minutes.

**Android equivalent:** Expo's background task APIs use Android WorkManager under the hood. The existing code should work, but Android's battery optimization (Doze mode, app standby buckets) is more aggressive than iOS. Needs testing across OEM skins (Samsung, Xiaomi, OnePlus all add proprietary battery restrictions).

**Effort:** ~6 hours (testing + OEM-specific workarounds documentation)

### 1.8 Platform-Specific UI Code Already in Place

The codebase already handles three Android-specific patterns:
- `TipCard.tsx` and `ScienceInsightCard.tsx`: Enable `LayoutAnimation` on Android
- `typography.ts`: `Platform.select()` routes San Francisco (iOS) → Roboto (Android)
- `sign-in.tsx`: `KeyboardAvoidingView` behavior `padding` (iOS) → `height` (Android)

**Effort:** 0 hours — already handled

---

## 2. Google Play Store Requirements

### 2.1 Store Listing Differences from App Store

| Field | App Store | Google Play |
|-------|-----------|-------------|
| App name | 30 chars | 30 chars |
| Subtitle | 30 chars | N/A |
| Short description | N/A | 80 chars |
| Full description | 4,000 chars | 4,000 chars |
| Keywords field | 100 chars (hidden) | N/A (extracted from description) |
| Screenshots min | 3 per device class | 2 (recommended 8) |
| Screenshot dimensions | Device-specific (6.7", 6.5", etc.) | 320–3,840px per side; 16:9 or 9:16 aspect ratio |
| Feature graphic | N/A | 1024×500px (required, shown atop listing) |
| App icon | 1024×1024 (App Store Connect) | 512×512 PNG |
| Promotional video | App Preview (optional) | YouTube link (optional) |

**Action items:**
- Write 80-char short description (existing Phase 37 plan has one ready)
- Design 1024×500 feature graphic (dark theme, shift schedule + recovery score visual)
- Re-export app icon at 512×512
- Create adaptive icon with foreground + background layers (`adaptive-icon.png` + `#0F0F1A` background)
- Generate 6–8 Android screenshots (can reuse iOS designs with adjusted frame/dimensions)

### 2.2 Content Rating Questionnaire

Google uses the IARC (International Age Rating Coalition) system. For ShiftWell:
- Category: Health & Fitness
- Violence: None
- Sexual content: None
- User-generated content: None
- In-app purchases: Yes (subscription)
- Ads: None
- Expected rating: **Everyone** (equivalent to App Store 4+)

Process: Fill questionnaire in Google Play Console → auto-generates rating. Takes ~5 minutes.

### 2.3 Data Safety Section

Google's Data Safety form is the Android equivalent of Apple's privacy nutrition labels. Required fields:

| Data Category | Collected? | Shared? | Purpose |
|---------------|-----------|---------|---------|
| App activity (usage analytics) | Yes | No | App functionality, analytics |
| App info & performance (crash logs) | Yes | Yes (Sentry/crash reporting) | Stability |
| Device identifiers | Yes | No | Analytics |
| Health data (sleep, HR) | Processed on-device only | No | Core functionality |
| Account info (email) | Yes | No | Authentication |
| Financial (purchase history) | Yes | Yes (RevenueCat) | Subscription management |

Privacy policy must be a live, publicly accessible URL (not a PDF). `shiftwell.app/privacy` must be deployed before submission.

### 2.4 Target API Level Requirements

As of August 2025, Google Play requires:
- **New apps: targetSdkVersion 35 (Android 15)**
- Existing app updates: targetSdkVersion 34 (Android 14)
- Non-compliant apps become undiscoverable on newer Android versions

Expo SDK 55 targets API 34 by default. Verify Expo SDK version supports API 35 targeting before submission, or request a deadline extension (available through November 2025).

### 2.5 Required Screenshots & Assets

Minimum asset set for Google Play:
- **Phone screenshots:** 2 minimum, 8 recommended — 1080×1920px (9:16) or 1920×1080 (16:9)
- **7-inch tablet:** Optional but recommended — 1200×1920px
- **10-inch tablet:** Optional — 1600×2560px
- **Feature graphic:** 1024×500px (mandatory — shown at top of store listing)
- **App icon:** 512×512px PNG, 32-bit with alpha

---

## 3. Health Data Integration

### 3.1 Google Health Connect API

Health Connect is Google's unified health data platform, replacing the deprecated Google Fit API (full deprecation by end of 2026). It ships as a system app on Android 14+ and is available via Play Store on Android 9+.

**Integration approach:**
- Library: `react-native-health-connect` (community library wrapping the Health Connect SDK)
- Create `src/lib/healthkit/android-health.ts` as a platform adapter with the same interface as the iOS HealthKit service
- Platform routing via `src/lib/healthkit/index.ts`:
  ```typescript
  import { Platform } from 'react-native';
  export const healthService = Platform.OS === 'ios'
    ? require('./healthkit-service')
    : require('./android-health');
  ```

**Available data types relevant to ShiftWell:**
- `SleepSessionRecord` — sleep sessions with stage classification (awake, light, deep, REM)
- `HeartRateRecord` — continuous heart rate samples
- `HeartRateVariabilityRmssdRecord` — HRV (RMSSD, not SDNN like HealthKit)
- `RestingHeartRateRecord` — daily resting heart rate
- `StepsRecord` — step count
- `ExerciseSessionRecord` — workout sessions

**Not available (iOS-only features):**
- Wrist temperature (Apple Watch Series 8+ exclusive)
- Sleep apnea screening (iOS 18+ exclusive)
- Background delivery (must poll instead)
- Sleep Focus mode integration (Apple ecosystem only)

**Permission model:**
- Health Connect requires explicit per-data-type permission grants
- Permissions requested at runtime (not in manifest for data types)
- App must declare `androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE` intent filter
- User can revoke individual permissions anytime

### 3.2 Samsung Health SDK

Samsung Health provides additional data for Galaxy Watch users beyond Health Connect:
- Body composition, blood oxygen (SpO2), stress level
- More granular sleep staging data from Galaxy Watch sensors

**Recommendation:** Defer Samsung Health SDK integration to Phase 2. Health Connect covers the core data types. Samsung Health adds value for Galaxy Watch owners but increases maintenance burden (separate SDK, Samsung developer account, additional testing matrix).

### 3.3 Fitbit Web API (Google Health API)

Google rebranded the Fitbit API as the "Google Health API" in 2025-2026. It provides:
- Daily HRV summary, heart rate zones, resting HR
- Sleep summary with stages
- Activity and step data

**Integration path:** OAuth 2.0 web API — can integrate server-side or client-side. Useful for users who wear Fitbit devices but don't have Health Connect data flowing (older Android versions).

**Recommendation:** Defer to Phase 2. Health Connect should capture Fitbit data automatically on Android 14+ since Fitbit syncs to Health Connect.

### 3.4 HRV Metric Difference: SDNN vs RMSSD

This is the most technically nuanced difference between platforms:
- **HealthKit provides SDNN** (Standard Deviation of NN intervals) — measures overall variability
- **Health Connect provides RMSSD** (Root Mean Square of Successive Differences) — measures parasympathetic activity

These are correlated but not interchangeable. Options:
1. **Normalize both to percentile ranks** — compare user's current reading to their own baseline, making the absolute metric irrelevant. This is the recommended approach since ShiftWell's recovery score is already relative.
2. **Display the raw metric with platform-appropriate labels** — show "HRV (SDNN)" on iOS, "HRV (RMSSD)" on Android.
3. **Estimate SDNN from RMSSD** — possible but introduces error; not recommended for a health app.

**Recommendation:** Option 1 (percentile normalization). The recovery algorithm already uses relative scoring, so this requires minimal changes to `accuracy-score.ts`.

---

## 4. Platform-Specific UI Adjustments

### 4.1 Material Design 3 vs iOS HIG

ShiftWell's dark-mode-first design translates well to Android's Material You dynamic theming. Key differences to address:

| Pattern | iOS (Current) | Android (Material 3) |
|---------|---------------|---------------------|
| Navigation | Tab bar at bottom | Bottom navigation bar (similar) or Navigation Rail for tablets |
| Back navigation | Swipe from left edge | System back button/gesture — handled by React Navigation automatically |
| Action sheets | `ActionSheetIOS` | Bottom sheets (`@gorhom/bottom-sheet` — already cross-platform) |
| Haptics | `expo-haptics` (Taptic Engine) | `expo-haptics` (vibration motor — less precise but functional) |
| Status bar | Light content on dark bg | Same — `expo-status-bar` handles both |
| Safe areas | Notch/Dynamic Island | Camera cutouts/navigation bar — `react-native-safe-area-context` handles both |

**Material You dynamic theming:** Android 12+ can extract colors from the user's wallpaper. ShiftWell's dark theme should remain fixed (clinical/professional aesthetic), but consider allowing Material You accent colors for non-critical UI elements as a future enhancement.

**Effort:** ~8 hours (mostly testing, minor component adjustments)

### 4.2 Navigation Patterns

React Navigation handles platform differences automatically:
- Back button: Android hardware/gesture back is handled by the navigation stack
- Tab bar: Renders platform-appropriate style by default
- Modals: Full-screen on Android vs card-style on iOS — may want to standardize

One consideration: Android's predictive back gesture (Android 14+) requires `react-native-screens` to be configured correctly. Expo SDK 55 should handle this, but needs testing.

### 4.3 Notification Channels (Android Requirement)

Android 8.0+ requires apps to assign every notification to a channel. Users can independently control each channel's behavior (sound, vibration, importance).

**Recommended channels for ShiftWell:**

| Channel ID | Name | Importance | Description |
|------------|------|-----------|-------------|
| `sleep-reminders` | Sleep Reminders | High | "Time to start winding down" alerts |
| `wake-alarms` | Wake Alarms | Max | Morning alarm notifications |
| `caffeine-cutoff` | Caffeine Cutoff | Default | Caffeine timing reminders |
| `weekly-brief` | Weekly Brief | Default | Monday morning coaching summary |
| `system` | System Updates | Low | Background sync status, app updates |

Implementation: Define channels in `notification-service.ts` using `Notifications.setNotificationChannelAsync()` on app launch (Android only).

**Effort:** ~3 hours

### 4.4 Widget Support (Glance API)

Android widgets via Jetpack Glance use Compose-based layouts. For ShiftWell, a home screen widget showing:
- Current recovery score
- Next sleep window countdown
- Next shift time

**Implementation:** Requires a native Android module (Kotlin) since Expo doesn't support Glance out of the box. Options:
1. **Expo config plugin** — write a custom Expo plugin that generates the native widget code
2. **EAS Build with native module** — add `android/` directory with widget implementation
3. **Defer** — ship Android v1 without widgets, add in Phase 2

**Recommendation:** Defer to Phase 2. Widgets are a retention feature, not a launch blocker. Estimated effort when implemented: ~20 hours (Kotlin widget + data bridge).

---

## 5. Timeline & Effort Estimate

### Phase 1: Build Parity (Weeks 1–3)

Get the existing app running on Android with feature parity minus health data.

| Task | Status | Effort (hrs) |
|------|--------|-------------|
| Android build config (`app.json`, `eas.json`) | Ready (Phase 37 plan exists) | 2 |
| Firebase project + `google-services.json` | Not started | 3 |
| Google Sign-In (replace Apple Sign-In on Android) | Not started | 4 |
| Notification channels setup | Not started | 3 |
| Android emulator testing (navigation, UI, safe areas) | Not started | 8 |
| Fix any Android-specific rendering bugs | Not started | 8 |
| Background sync testing (WorkManager/Doze mode) | Not started | 6 |
| Adaptive icon creation | Not started | 2 |
| **Phase 1 Total** | | **36 hours** |

**What already works on Android (no effort):**
- Core circadian algorithm (`src/lib/circadian/`)
- All UI screens and navigation
- Calendar sync (`expo-calendar`)
- Secure storage (`expo-secure-store`)
- Local notifications (`expo-notifications`)
- RevenueCat subscriptions (`react-native-purchases`)
- Supabase auth (email/password)
- Typography and theming (platform-gated already)

### Phase 2: Android-Specific Features (Weeks 4–7)

| Task | Effort (hrs) |
|------|-------------|
| Google Health Connect adapter (`android-health.ts`) | 24 |
| HRV normalization (SDNN vs RMSSD handling) | 8 |
| Health Connect permission flow UI | 6 |
| Health Connect data validation + edge cases | 8 |
| Graceful degradation for missing data (wrist temp, apnea) | 4 |
| OEM battery optimization documentation + user guidance | 4 |
| Device testing matrix (Samsung, Pixel, OnePlus emulators) | 10 |
| **Phase 2 Total** | **64 hours** |

### Phase 3: Google Play Launch (Weeks 8–9)

| Task | Effort (hrs) |
|------|-------------|
| Google Play Developer account setup | 1 |
| Store listing (description, screenshots, feature graphic) | 6 |
| Data safety section completion | 2 |
| Content rating questionnaire | 1 |
| Privacy policy URL deployment | 2 |
| Internal testing track upload + tester enrollment | 2 |
| Closed beta testing (2 weeks minimum) | 8 |
| Bug fixes from beta feedback | 12 |
| Production release submission | 2 |
| **Phase 3 Total** | **36 hours** |

### Summary

| Phase | Effort | Calendar Time |
|-------|--------|---------------|
| Phase 1: Build Parity | 36 hours | 3 weeks |
| Phase 2: Android Features | 64 hours | 4 weeks |
| Phase 3: Google Play Launch | 36 hours | 2 weeks |
| **Total** | **136 hours** | **~9 weeks** |

At 10–15 hours/week of dev time alongside shifts, this is a **10–14 week project** from start to Play Store.

### Post-Launch (Phase 4, Optional)

| Feature | Effort (hrs) |
|---------|-------------|
| Home screen widget (Glance API) | 20 |
| Samsung Health SDK integration | 16 |
| Fitbit/Google Health API | 12 |
| Android Auto sleep reminder integration | 8 |
| Wear OS companion app | 40+ |

---

## 6. Risk Assessment

### High Risk

**OEM battery optimization killing background sync.** Samsung, Xiaomi, OnePlus, and Huawei all add proprietary battery management that aggressively kills background processes. ShiftWell's 20-minute calendar polling could be killed silently. Mitigation: document per-OEM battery settings, add in-app guidance ("disable battery optimization for ShiftWell"), test on Samsung and Pixel specifically. Reference [dontkillmyapp.com](https://dontkillmyapp.com) for device-specific instructions.

**Health Connect adoption.** Health Connect requires Android 9+ and the Health Connect app to be installed (it's a system app on Android 14+ but must be downloaded on older versions). Users on Android 8 or below (still ~5% of active devices) get no health data integration. Mitigation: degrade gracefully — ShiftWell's core value is the schedule algorithm, not biometric tracking.

### Medium Risk

**HRV metric inconsistency.** SDNN (iOS) vs RMSSD (Android) means recovery scores won't be directly comparable cross-platform. If a user switches phones, their historical HRV baseline resets. Mitigation: use percentile normalization from day one; store the metric type alongside raw values so future analysis can account for the difference.

**`react-native-health-connect` library maturity.** This is a community-maintained library, not an official Expo or React Native package. Risk of bugs, breaking changes, or abandonment. Mitigation: pin version, vendor the types, write integration tests that mock the native layer. If the library stalls, consider writing a custom Expo config plugin that wraps the Health Connect SDK directly.

**Target API level escalation.** Google increases the required `targetSdkVersion` annually. If development slips past August 2025, API 35 becomes mandatory. Expo SDK updates typically track this, but verify before submission.

### Low Risk

**RevenueCat cross-platform subscriptions.** RevenueCat handles Google Play billing natively — this is well-tested territory. Subscribers can't transfer between iOS and Android (Apple/Google limitation), but RevenueCat's customer center handles this via restore purchases.

**UI rendering differences.** React Native's cross-platform rendering is mature. Shadow rendering, font metrics, and animation timing differ slightly but are cosmetic, not functional. The existing `Platform.select()` and `Platform.OS` guards in the codebase already handle the known differences.

**Google Play review times.** Google Play reviews are typically faster than App Store (hours vs days). First submission may take longer (up to 7 days). Content rating for a health app with no user-generated content should pass without issues.

### Hardest Part

The Health Connect integration is the critical path. It's 47% of the total effort (64 of 136 hours), involves a community library with less documentation than HealthKit, requires handling a different HRV metric, and lacks HealthKit's background delivery convenience. Everything else — auth, notifications, store listing, UI — is well-trodden Expo territory.

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial creation. Based on codebase scan of ShiftWell production repo, existing Phase 37 Android planning doc, and current Google Play/Health Connect requirements research.
