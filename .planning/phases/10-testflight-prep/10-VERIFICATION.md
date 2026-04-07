# Phase 10: TestFlight Prep — Verification

**Date:** 2026-04-06
**Status:** Complete
**Tests:** 377 passed, 0 failed

---

## TF-01: Privacy Manifest

**File:** `app.json` — `expo.ios.privacyManifests`

Added 4 required NSPrivacyAccessedAPITypes to prevent ITMS-91061 App Store rejection:

| Category | Reason Code |
|----------|-------------|
| NSPrivacyAccessedAPICategoryUserDefaults | CA92.1 |
| NSPrivacyAccessedAPICategoryFileTimestamp | C617.1 |
| NSPrivacyAccessedAPICategoryDiskSpace | E174.1 |
| NSPrivacyAccessedAPICategorySystemBootTime | 35F9.1 |

---

## TF-02: HealthKit Entitlements

**File:** `app.json` — `expo.ios.entitlements`

Added both required entitlements:
- `com.apple.developer.healthkit: true`
- `com.apple.developer.healthkit.background-delivery: true`

Note: `@kingstinct/react-native-healthkit` plugin was already present in `expo.plugins`. HealthKit usage descriptions were already in `infoPlist` and the plugin config. The entitlements object was the only missing piece.

---

## TF-03: App Icon and Splash Screen

**File:** `app.json` (no changes needed)

Findings:
- Icon: `./assets/images/icon.png` — file exists. Needs to be verified as 1024x1024 PNG before App Store submission. The path is correctly configured.
- Splash: `./assets/images/splash-icon.png` with `backgroundColor: "#0A0E1A"` — uses ShiftWell brand color, not default Expo blue. Production-ready config.
- Action required before submission: Replace `icon.png` with a custom 1024x1024 PNG matching the ShiftWell brand (see `docs/launch/APP_ICON_SPEC.md`).

---

## TF-04: EAS Production Build Profile

**File:** `eas.json` — `build.production`

Updated production profile with:
- `distribution: "store"` — routes to App Store / TestFlight
- `autoIncrement: true` — auto-bumps build number on each EAS build
- `ios.bundleIdentifier: "com.shiftwell.app"` — explicit match to `app.json`

The `submit.production.ios` block already exists with placeholder fields for `appleId`, `ascAppId`, and `appleTeamId` — fill these in when Apple Developer account is active.

---

## TF-05: installedAt Timestamp

**File:** `app/(onboarding)/calendar.tsx`

- Added `AsyncStorage` import
- Changed `finishOnboarding()` to `async` and added `await AsyncStorage.setItem('installedAt', new Date().toISOString())` before routing to `/(tabs)`
- This fires on all three exit paths: Skip (connect phase), Skip (calendars phase), and Confirm Shifts (review phase) — all call `finishOnboarding()`
- Supabase write deferred pending auth setup

---

## Test Run

```
Test Suites: 28 passed, 28 total
Tests:       377 passed, 377 total
Time:        8.543 s
```

No regressions introduced.

---

## Remaining Pre-TestFlight Blockers

These are outside Phase 10 scope but noted for launch checklist:

1. **Apple Developer account** — pending LLC formation (~5 weeks for D-U-N-S)
2. **App icon** — needs custom 1024x1024 PNG (see `docs/launch/APP_ICON_SPEC.md`)
3. **EAS credentials** — fill `appleId`, `ascAppId`, `appleTeamId` in `eas.json` submit block
4. **Google Sign-In client ID** — replace `PLACEHOLDER_CLIENT_ID` in `app.json` plugins
5. **First EAS build command:** `eas build --platform ios --profile production`
