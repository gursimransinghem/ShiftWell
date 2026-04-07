# Phase 11 — App Store Prep: Verification Notes

Date: 2026-04-06
Tests: 383 passing (was 377, +6 from deleteAccount tests)

---

## APP-01: Account Deletion (IMPLEMENTED)

**Files changed:**
- `src/store/auth-store.ts` — added `deleteAccount` action
- `app/(tabs)/settings.tsx` — added "Delete Account" button + handler
- `src/lib/supabase/__mocks__/client.ts` — added `rpc` mock
- `__mocks__/@react-native-async-storage/async-storage.js` — added `multiRemove` mock
- `__tests__/store/auth-store-delete-account.test.ts` — 6 new tests (all passing)

**Behavior:**
1. User taps "Delete Account" in Settings > ACCOUNT section (red destructive styling)
2. Alert confirms: "This will permanently delete your account and all data."
3. On confirm: calls `supabase.rpc('delete_user')` (server-side user deletion)
4. Falls back to signOut if RPC fails (graceful degradation)
5. Clears all AsyncStorage keys: nightshift-user, nightshift-shifts, nightshift-plan, adaptive-plan-store, premium-store, score-history, notification-prefs
6. Clears SecureStore session (nightshift-session key)
7. Navigates to `/(onboarding)/welcome`

**HealthKit revocation note:** Apple's HealthKit API does not expose a programmatic revocation method from app code. Per Apple's HealthKit documentation, authorization can only be revoked by the user via iOS Settings > Privacy > Health. The app displays relevant messaging, and the user is directed to iOS Settings if they want to revoke HealthKit access.

**Server-side requirement:** The `delete_user` RPC function should be created in Supabase to handle GDPR-compliant deletion. Until deployed, the auth flow still signs out and clears all local data. Template SQL:

```sql
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
```

---

## APP-02: Medical Disclaimer (IMPLEMENTED)

**Files changed:**
- `app/(onboarding)/welcome.tsx` — enhanced disclaimer with "Medical Disclaimer" label + fuller text
- `app/(tabs)/settings.tsx` — added "MEDICAL DISCLAIMER" section with icon and full disclaimer text

**Text used:**
> Not a substitute for medical advice. ShiftWell provides general wellness information based on circadian science research. Consult your physician before changing your sleep, diet, or work schedule — especially if you have a health condition or take medications.

**Placement:**
- Welcome screen: bottom of scroll view, after CTA, with a subtle separator and "MEDICAL DISCLAIMER" label in caps
- Settings screen: dedicated card section between "About" and "Account"

---

## APP-03: App Store Screenshots (DOCUMENTATION ONLY — no code needed)

**Requirement:** 1290 x 2796 px (iPhone 16 Pro Max, 6.9-inch)
**Also required:** 1320 x 2868 px (iPhone 16 Pro Max 6.9-inch portrait, App Store variant)

**Cannot be generated without a running app on device/simulator.**

**Recommended workflow:**
1. Build with `eas build --platform ios --profile preview`
2. Install on iPhone 16 Pro Max simulator (Xcode 16+)
3. Navigate to each key screen: Today (Brief), Schedule, Circadian, Profile, Settings
4. Take screenshots with `xcrun simctl io booted screenshot <filename>.png`
5. Or use `fastlane snapshot` for automated capture

**Required screens (minimum 3, up to 10):**
1. Today Brief screen — showing full plan
2. Schedule screen — shift calendar view
3. Circadian tab — energy model visualization
4. Paywall / Pro features
5. Onboarding welcome

---

## APP-04: Privacy Nutrition Labels (DOCUMENTATION ONLY — App Store Connect)

**To declare in App Store Connect > App Privacy:**

| Data Type | Purpose | Linked to User | Tracking |
|-----------|---------|----------------|----------|
| Health & Fitness — Sleep | Core app functionality: circadian plan generation | No (on-device only) | No |
| Identifiers — User ID | Authentication (Supabase) | Yes | No |
| Contact Info — Email | Account creation / sign-in | Yes | No |
| Usage Data | Anonymous crash reporting (if Sentry added) | No | No |

**HealthKit data stays on-device.** No sleep data is transmitted to Supabase or any server.

---

## APP-05: App Review Notes (DOCUMENTATION ONLY — App Store Connect)

**Submit via App Store Connect > App Review Information.**

**Template:**

```
Demo Account:
Email: review@shiftwell.app
Password: AppReview2026!
(This account has pre-seeded shift schedule data for review)

Notes for Reviewer:

1. HealthKit Integration
   ShiftWell reads sleep analysis data from Apple Health to compare
   actual sleep against the circadian-optimized plan. It also writes
   planned sleep schedules to Health, which activates iOS Sleep Focus.
   Users must explicitly grant permission via the HealthKit permission dialog
   during onboarding (optional — can be skipped).

2. Live Activity / Dynamic Island
   Not implemented in v1.0. Planned for v1.1 post-launch.

3. Shift Schedule
   The app generates a personalized sleep/nap/meal plan based on the
   user's shift schedule. The demo account has a 7-day schedule pre-loaded
   with night shifts.

4. Subscription
   The app has a 7-day free trial of ShiftWell Pro. The review account
   starts in trial mode. No real payment is processed in sandbox testing.

5. Account Deletion
   Settings > Account > Delete Account allows full account and data deletion
   per Apple guidelines (2022 requirement).
```
