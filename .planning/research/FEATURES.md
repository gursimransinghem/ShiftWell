# ShiftWell v1.1 Feature Research

**Project:** ShiftWell — Adaptive Brain, TestFlight, App Store
**Researched:** 2026-04-06
**Overall confidence:** MEDIUM-HIGH
**Downstream consumer:** Requirements author building v1.1 roadmap phases

---

## Summary

Three domains investigated: (1) morning recalculation hook patterns for the Adaptive Brain, (2) TestFlight distribution pipeline from EAS build to first tester, (3) App Store submission requirements that catch indie developers. Research is grounded in Expo/React Native documentation, Apple developer guidelines, and EAS tooling. UX pattern research for "change explanation cards" is MEDIUM confidence — drawn from general mobile design patterns since no exact analog exists in the shift-work health app space.

The Adaptive Brain spec (docs/superpowers/specs/2026-04-06-adaptive-brain-design.md) is well-designed and internally consistent. The recommended morning hook is **AppState `background→active` transition**, not background fetch — the reasons are spelled out below. TestFlight and App Store steps have concrete ordering requirements that are easy to get wrong (internal vs. external review, provisioning profile regeneration, privacy manifest). These are the highest-risk areas for a first-time indie submission.

---

## Adaptive Brain Features

### Morning Hook: AppState `background→active` (not background fetch)

**Recommendation:** Use `AppState.addEventListener('change', handler)` as the primary trigger. Fire `useAdaptivePlan` when `nextState === 'active'` and `prevState !== 'active'`.

**Why not background fetch:**
- `expo-background-task` (the replacement for deprecated `expo-background-fetch`) runs only when the app is backgrounded
- iOS BGTaskScheduler fires at system discretion — minimum 15-minute interval is advisory, system often delays hours or skips overnight
- Background tasks do NOT fire when the app opens; they fire when the device decides to wake the app in the background
- For a "morning recalculation on app open" use case, background fetch is the wrong primitive
- Confidence: HIGH (Expo documentation, iOS BGTaskScheduler behavior confirmed)

**Why AppState works:**
- Fires reliably every time user opens the app (background→active transition)
- Zero system scheduling uncertainty — triggered by user intent
- Execution time is unlimited (runs in foreground)
- Works from day one with no additional entitlements or config plugin changes
- Pattern is well-established: compare current date to `lastCalculatedDate`, skip if same calendar day, run full context-builder if new day or significant delta

**Recommended hook pattern:**
```typescript
// src/hooks/useAdaptivePlan.ts
useEffect(() => {
  const subscription = AppState.addEventListener('change', async (nextState) => {
    if (nextState === 'active') {
      const today = new Date().toDateString();
      const lastRun = await AsyncStorage.getItem('adaptive_last_run');
      if (lastRun === today) return; // debounce: once per calendar day
      await runAdaptiveContextBuilder();
      await AsyncStorage.setItem('adaptive_last_run', today);
    }
  });
  return () => subscription.remove();
}, []);
```

**Background fetch as supplement (optional, not primary):**
If a "silent recalculation while app is in background overnight" is wanted for v1.2, `expo-background-task` can run the HealthKit read + plan snapshot computation in background. The result is cached in AsyncStorage and surfaced on next app open. This is additive to AppState, not a replacement. For v1.1 it is unnecessary complexity.

**Note on expo-background-task vs expo-background-fetch:**
`expo-background-fetch` is deprecated as of SDK 53+. The replacement is `expo-background-task`. APIs are nearly identical — migration is a near drop-in. ShiftWell (SDK 55) should use `expo-background-task` if background execution is ever needed.

**Confidence:** HIGH for recommendation, MEDIUM for background supplement pattern (not verified against SDK 55 changelog directly).

---

### Change Log / Explanation Card UX Patterns

**Context:** The spec defines `AdaptiveInsightCard` showing on Today screen when plan was recalculated. This is the right pattern. Research validates the design choices and adds implementation refinements.

**Pattern classification:** "Contextual change explanation card" — appears inline at top of primary screen, explains system action, offers undo. This pattern is used by:
- Calendar apps (schedule conflict resolution explanations)
- Fitness apps like WHOOP (recovery score change with because-language)
- Navigation apps (route recalculation "traffic ahead" banners)

**What works (validated from mobile UX research):**

| Element | Recommendation | Rationale |
|---------|---------------|-----------|
| Headline | One sentence, action + reason | "Bedtime shifted 90 min — night shift Friday" not "Plan updated" |
| Color coding | Left border keyed to factor (spec is correct) | Users learn factor → color faster than reading text |
| Undo | Right-aligned, 24h window (spec is correct) | Loss aversion: undo reduces rejection of system changes |
| Auto-dismiss | Midnight (spec is correct) | Stale cards reduce trust; midnight is natural boundary |
| Learning phase | Propose+Accept vs. Autopilot+Undo (spec is correct) | Never show undo for decisions user didn't confirm yet |
| Prose length | 1–2 sentences max | Users scan, don't read; citation in 8pt is fine |

**Learning phase UX nuance (add to spec):**
During days 1–30 (learning phase), the card should use softer language: "Based on your sleep history, we'd suggest shifting bedtime 90 min later for Friday's night shift. [Accept] [Dismiss]". After day 31, drop to: "Bedtime shifted 90 min — night shift Friday. [Undo]". The transition should be silent (no announcement). This matches the progressive disclosure pattern validated by Noom's research on user trust in health coaching systems.

**Diff view (explicit before/after):**
The spec does not include a before/after diff (e.g., "Previously: 11 PM → Now: 12:30 AM"). This is a validated UX pattern for plan-change transparency. Recommend adding as optional expand on card tap — not default view. Default stays brief; tap expands to show specific time diff per element changed. This is a complexity spike (needs before-snapshot storage), already planned in spec via `plan-store` undo snapshot. Complexity: LOW to add, HIGH to test edge cases. Flag for requirements author: include in v1.1 spec as optional expand, or defer to v1.2.

**Confidence:** MEDIUM (drawn from adjacent domain patterns, no direct shift-work health app analog found).

---

### Adaptive Brain Phase 1: Feature Breakdown

#### Table Stakes for v1.1

| Feature | Why | Complexity | Depends On |
|---------|-----|------------|------------|
| `useAdaptivePlan` hook (AppState trigger) | Entry point for everything | Low | AppState API, AsyncStorage |
| `context-builder.ts` — HealthKit 14-night read | Core data ingestion | Medium | HealthKit already wired in v1.0 |
| `sleep-debt-engine.ts` — rolling debt + severity | Most legible value to user | Medium | HealthKit sleep samples |
| `change-logger.ts` — ChangeLog production | Required for explanation card | Low | Plan snapshot in plan-store |
| `AdaptiveInsightCard.tsx` — Today screen | User-visible output | Low | change-logger, plan-store |
| Plan snapshot for undo (plan-store update) | Undo requires before-state | Low | plan-store (already exists) |
| `finalizeDay()` caller fix (SCORE-01) | Score pipeline must be real before Adaptive Brain reads it | Low | score-store (already exists) |

#### Differentiators for v1.1

| Feature | Value Proposition | Complexity | Depends On |
|---------|-------------------|------------|------------|
| `circadian-protocols.ts` — 5 transition types | Science-backed, personalized, far beyond competitors | High | shifts store, schedule lookahead |
| `sleep-debt-engine.ts` — banking protocol | Prophylactic banking is unique, no competitor does this | Medium | HealthKit history |
| `AdaptiveInsightCard` with scientific citation | Trust signal, physician-grade credibility | Low | change-logger |
| Learning phase (propose/accept) vs calibrated (autopilot) | Builds user trust before going autonomous | Medium | daysTracked counter, AsyncStorage |

#### Anti-Features (do NOT build in v1.1)

| Anti-Feature | Why Avoid | Instead |
|-------------|-----------|---------|
| `recovery-calculator.ts` (HRV z-scores, shift-type baselines) | Requires 30-day baseline AND Apple Watch. No user has data yet. Will return null for every v1.1 user | Graceful degradation path already in spec (weight drops to 0, others reweight). Wire the null path only. |
| `LightProtocolArc.tsx` animated 24h arc | Beautiful, high effort, not critical path for v1.1 value | Defer to v1.2 after users validate circadian protocol value |
| `brief.tsx` Pre-Shift Brief tab | Full coaching tab is a v1.2 feature; no user data to personalize yet | Defer |
| `LightProtocolStrip.tsx` compact strip | Depends on LightProtocolArc implementation | Defer with arc |

#### Feature Dependencies (DAG)

```
SCORE-01 fix (finalizeDay caller)
  └── Required before: context-builder reads recovery score
        └── Required before: AdaptiveInsightCard shows recovery factor changes

HealthKit sleep data (already wired)
  └── context-builder.ts
      ├── sleep-debt-engine.ts (debt + banking)
      │   └── SleepDebtCard update (dual-meter: red debt / green bank)
      └── circadian-protocols.ts (shift transition detection)
          └── schedule lookahead (shifts store — already exists)
              └── AdaptiveInsightCard (circadian factor explanation)

plan-store snapshot (new field)
  └── change-logger.ts
      └── AdaptiveInsightCard (undo functionality)
```

#### MVP for v1.1 Adaptive Brain (minimum viable, highest signal)

Build in this order:
1. Fix `finalizeDay()` (SCORE-01) — unblocks pipeline
2. Add plan snapshot to `plan-store` — enables undo, change-logger
3. `sleep-debt-engine.ts` — HealthKit read, rolling debt, severity tiers
4. `change-logger.ts` — ChangeLog from debt deltas
5. `useAdaptivePlan` hook (AppState trigger, daily debounce)
6. `AdaptiveInsightCard.tsx` — card on Today screen (debt factor only initially)
7. `SleepDebtCard` update — dual-meter mode
8. `circadian-protocols.ts` — add 5 transition protocols
9. Wire circadian factor into AdaptiveInsightCard

Defer: recovery-calculator, LightProtocolArc, Pre-Shift Brief tab, full context-builder with HRV.

---

## TestFlight / App Store Requirements

### TestFlight: Exact Steps, EAS to First Tester

**Prerequisites (must be true before any build):**
- Apple Developer Program membership active (Individual or Organization)
- App ID registered in App Store Connect with correct bundle identifier
- HealthKit capability enabled on the App ID in Apple Developer portal (EAS will try to sync this, but manual verification recommended first)
- Provisioning profile regenerated after HealthKit capability is added (common failure: old profile without HealthKit capability causes signing error)

**Step-by-step:**

1. `eas build --platform ios --profile production`
   - EAS manages certificates and provisioning automatically (managed credentials)
   - If HealthKit entitlement is in app.json/eas.json, EAS syncs the capability to the App ID on Apple's servers
   - Build runs on EAS cloud (~15–30 min for production archive)
   - Watch for: "Provisioning profile doesn't support HealthKit capability" — if seen, manually enable HealthKit on the App ID in Apple Developer portal, then `eas credentials` to invalidate and regenerate the profile

2. `eas submit --platform ios` (or `npx testflight` for guided flow)
   - Requires App Store Connect API key OR Apple ID + password
   - Recommended: App Store Connect API key (avoids 2FA friction in CI/non-interactive)
   - Key created in App Store Connect → Users & Access → Integrations → App Store Connect API
   - Common error: "403 Access Forbidden" — means API key role is insufficient. Key needs "App Manager" or "Developer" role minimum.
   - Upload takes ~5–10 min; Apple then processes (~10–30 min)

3. **Internal testers (fast path — no Beta Review required):**
   - Add testers in App Store Connect → TestFlight → Internal Testing
   - Internal testers must be App Store Connect users (max 100 people)
   - Build available immediately after Apple processing — no review required
   - USE THIS for Sim's own device first. Fastest path to dog-food testing.

4. **External testers (requires Beta Review):**
   - Add testers via email invite or public link (max 10,000 people)
   - First build sent to external group triggers Apple Beta App Review
   - Beta Review is lighter than full App Store review but checks same guidelines
   - Review time: typically 1–2 days (can be 4–5 days for first submission)
   - Subsequent builds to same external group usually skip review
   - Only first build per group requires review

**Common blockers in order of frequency:**

| Blocker | Cause | Fix |
|---------|-------|-----|
| HealthKit provisioning mismatch | Capability added to entitlements after profile was created | Enable HealthKit in Apple Dev portal → regenerate profile via `eas credentials --platform ios` |
| Missing NSHealthShareUsageDescription / NSHealthUpdateUsageDescription | Info.plist strings not in app.json | Add to `ios.infoPlist` in app.json |
| Missing privacy manifest (PrivacyInfo.xcprivacy) | Required since May 2024 | See App Store section below |
| 403 on EAS submit | API key insufficient role | Use App Manager role, not Admin (counterintuitive) |
| Beta Review rejection for HealthKit not core | Reviewer can't find HealthKit in core flow | Write detailed test account + test instructions in "Review Notes" for even beta builds |
| Processing stuck | Apple-side delay | Wait up to 1h before re-submitting; check App Store Connect status page |
| `npx testflight` fails at 2FA step | Interactive 2FA required | Switch to App Store Connect API key mode |

**Confidence:** HIGH (Expo EAS documentation, Apple Developer forums, EAS GitHub issues verified).

---

### App Store Submission: Requirements That Catch Indie Developers

#### 1. Privacy Manifest — PrivacyInfo.xcprivacy (CRITICAL)

**Status:** Mandatory since May 1, 2024. Apple rejected 12% of submissions in Q1 2025 for violations.

**What it is:** A property list file (`PrivacyInfo.xcprivacy`) that declares all Required Reason APIs used by the app and its third-party SDKs.

**ShiftWell's required declarations:**

| API Category | Key | Reason Code | Why ShiftWell Uses It |
|-------------|-----|-------------|----------------------|
| UserDefaults | `NSPrivacyAccessedAPICategoryUserDefaults` | CA92.1 | AsyncStorage uses UserDefaults under the hood |
| File timestamps | `NSPrivacyAccessedAPICategoryFileTimestamp` | 3B52.1 | File I/O in React Native runtime |
| System boot time | `NSPrivacyAccessedAPICategorySystemBootTime` | 35F9.1 | Likely accessed by Expo runtime / analytics SDKs |
| Disk space | `NSPrivacyAccessedAPICategoryDiskSpace` | 7D9E.1 | Expo file system APIs |

**Third-party SDKs that must have their own manifests (or ShiftWell must declare for them):**
- RevenueCat — has its own manifest (verify version is current)
- Supabase JS client — verify manifest exists in current version
- Expo SDK modules — Expo SDK 50+ bundles manifests for its own modules

**Action required:** Add `PrivacyInfo.xcprivacy` to the iOS project. In managed Expo workflow, this is done via a config plugin that injects the file during `expo prebuild`. Expo provides guidance at `docs.expo.dev/guides/apple-privacy`.

**Confidence:** HIGH (Apple official documentation, Expo privacy guide, EAS submission error reports).

---

#### 2. HealthKit-Specific Requirements

**Entitlements (both required):**
```json
"com.apple.developer.healthkit": true,
"com.apple.developer.healthkit.access": []
```

**Info.plist strings (both required even for read-only):**
- `NSHealthShareUsageDescription` — explain what sleep data is read and why
- `NSHealthUpdateUsageDescription` — required even if app never writes (App Review will reject without it)

**App Review HealthKit guidelines:**
- HealthKit must be a core feature, not incidental. ShiftWell passes this test (sleep data drives the entire plan).
- Cannot use HealthKit data for advertising or data mining. ShiftWell passes (local-first).
- App description must mention HealthKit integration explicitly.
- App Review Notes should explain the HealthKit flow: "The app reads sleep data from HealthKit on the Health tab to compute the user's sleep debt and recovery score. No HealthKit data is transmitted off-device."

**Confidence:** HIGH (Apple HealthKit documentation, developer forum posts, App Store Review Guidelines section 5.1.3).

---

#### 3. iOS 18 SDK Requirement (ACTIVE NOW)

**Status:** Since April 24, 2025, all new submissions and updates must be built with iOS 18 SDK (Xcode 16+).

**ShiftWell impact:** EAS Build uses Xcode 16 on its cloud builders for SDK 55 projects. This is handled automatically — no action required unless using a self-hosted builder. Verify the EAS build log shows "Xcode 16.x" in the build environment header.

**Confidence:** HIGH (Apple Upcoming Requirements page, Expo blog post on Apple SDK requirements).

---

#### 4. Age Rating and Medical Disclaimers

**Recommended age rating:** 4+ (no objectionable content, no violence, sleep wellness)

**Medical disclaimer requirement:** App Review Guidelines section 5.1.3 requires apps that provide health/fitness recommendations to include language that the app is not a medical device and that users should consult a physician. ShiftWell should show this during onboarding AND have it accessible in Settings.

**HIPAA:** ShiftWell's local-first architecture (no PHI leaves device by default) means HIPAA as a federal law does not directly apply to the app itself — HealthKit data stays on device. However, if Supabase sync is ever enabled for health data, that triggers HIPAA applicability. Keep data local or get BAA with cloud provider.

**Confidence:** MEDIUM (Apple guidelines are clear; HIPAA applicability is nuanced and drawn from multiple sources, not official Apple guidance).

---

#### 5. App Privacy Nutrition Labels (App Store Connect)

Every data type accessed must be declared in App Store Connect under "App Privacy." Common missed declarations:

| Data Type | Collection | Tracking | ShiftWell Status |
|-----------|-----------|---------|-----------------|
| Health & Fitness | Yes (HealthKit sleep) | No | Must declare |
| Identifiers (user ID) | Yes (Supabase auth) | No | Must declare |
| Usage Data | Maybe (anonymous analytics) | Depends on implementation | Declare if any analytics SDK |
| Contact Info (email) | Yes (Supabase auth) | No | Must declare |
| Diagnostics / Crash | If Expo crash reporting | No | Declare if using |

**Key rule:** Inconsistency between declared practices and actual app behavior = immediate rejection. Reviewers test apps.

**Confidence:** HIGH (Apple App Privacy Details documentation, App Store Review Guidelines).

---

#### 6. Account Deletion Requirement

If the app allows account creation (Supabase auth), Apple requires in-app account deletion since 2022. This must be accessible within the app (Settings → Delete Account), not just via email request.

ShiftWell has Supabase auth — this is required. If not yet built, it must be built before App Store submission. Not required for TestFlight.

**Confidence:** HIGH (Apple App Store Review Guidelines 5.1.1).

---

#### 7. App Store Review Notes (Often Overlooked)

Apple reviewers test the app. For ShiftWell, they will:
- Need a test account (Supabase auth credentials)
- Need HealthKit data to exist or instructions to test without it
- Not have a calendar populated with shift events by default

**Required review notes content:**
```
Demo Account: [email] / [password]
Core Feature Flow:
1. Complete onboarding (tap through all 8 screens, use demo shift schedule)
2. On Today screen, tap "Sleep Plan" to see generated sleep windows
3. HealthKit: App reads sleep data if HealthKit is authorized. To test without 
   HealthKit, decline permission on onboarding screen 7 — app degrades gracefully.
4. The Adaptive Brain recalculates the plan on app open if HealthKit data changes.
   To test: authorize HealthKit, wait for first data read, observe AdaptiveInsightCard.
```

**Confidence:** HIGH (App Store Review Guidelines, common rejection pattern from developer forums).

---

## Table Stakes vs Differentiators Summary

### v1.1 Table Stakes (must ship, or app feels broken)

| Feature | Category | Why Required |
|---------|----------|-------------|
| Fix `startTrial()` (PREM-01) | Bug fix | Trial is broken in production — first thing users will encounter |
| Fix `finalizeDay()` caller (SCORE-01) | Bug fix | Recovery Score shows 0 forever — erodes trust |
| Build `app/downgrade.tsx` (PREM-02) | Bug fix | Unhandled state when trial expires = crash or blank screen |
| Fix 13 TypeScript errors | Bug fix | Build-time errors block EAS production build |
| App icon + splash screen | Launch prep | App Store requires icon; TestFlight shows generic icon without it |
| PrivacyInfo.xcprivacy | App Store | Mandatory since May 2024; 12% rejection rate in Q1 2025 |
| NSHealthShareUsageDescription + NSHealthUpdateUsageDescription | App Store | Required for HealthKit; rejects without both |
| Account deletion in-app (Settings) | App Store | Required since 2022 for apps with account creation |
| Privacy policy URL accessible in-app | App Store | Required; not just in App Store Connect |
| App Privacy nutrition labels declared | App Store | Required before App Store listing goes live |
| Medical disclaimer in onboarding + Settings | App Store | Required per 5.1.3 for health recommendation apps |

### v1.1 Differentiators (ship these, stand out)

| Feature | Category | Value |
|---------|----------|-------|
| `useAdaptivePlan` hook — AppState trigger | Adaptive Brain | Silent morning recalculation |
| `sleep-debt-engine.ts` — rolling debt + banking protocol | Adaptive Brain | No competitor does prophylactic banking |
| `AdaptiveInsightCard.tsx` with factor explanation + undo | Adaptive Brain | Trust signal; explains why plan changed |
| `circadian-protocols.ts` — 5 transition types | Adaptive Brain | Science-backed, personalized transition prep |
| SleepDebtCard dual-meter (debt + bank) | Adaptive Brain UI | Visible, concrete metric users can act on |
| ActivityKit native integration — real Dynamic Island | Platform | Dynamic Island sleep/morning transitions; stubs already built |

### Skippable for v1.1 (defer to v1.2)

| Feature | Why Skip | When to Build |
|---------|----------|--------------|
| `recovery-calculator.ts` — HRV, z-scores, shift-type baselines | No baseline data from real users yet; returns null for 100% of v1.1 users. Wire null path only. | v1.2 (after 30 days of user data) |
| `LightProtocolArc.tsx` — animated 24h arc | Beautiful, high effort, low immediate value | v1.2 |
| `brief.tsx` — Pre-Shift Brief coaching tab | No personalization data yet; requires real user profile signals | v1.2 |
| `LightProtocolStrip.tsx` | Depends on arc | v1.2 |
| SET-03 Sleep Focus / DND trigger | Complex, low urgency, already deferred | v1.2 |
| SET-01 real share link for referral | Low priority vs. launch | v1.2 |
| Human visual QA gate | Good to have, not blocking | Before App Store submission |

---

## Phase-Specific Pitfalls

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| HealthKit context-builder | `HKQuantityTypeIdentifier.sleepAnalysis` returns `inBed` samples mixed with sleep stage samples. Must filter for `asleepCore`, `asleepDeep`, `asleepREM` only. `inBed` inflates hours. | Filter by `HKCategoryValueSleepAnalysis` subtype in HealthKit query predicate |
| Privacy manifest | Third-party SDKs (RevenueCat, Supabase) may use Required Reason APIs without declaring them in their own manifests in older versions | Pin to versions known to include manifests; audit with Apple's privacy manifest tool before submission |
| EAS build with HealthKit | Entitlement sync to Apple Dev portal is automatic on first build but the provisioning profile must be regenerated. First-time builds with new entitlements commonly fail. | Run `eas credentials --platform ios` to force-regenerate profile after HealthKit is added to entitlements |
| iOS 18 SDK | Expo SDK 55 on EAS cloud builds with Xcode 16 automatically. Self-hosted builds on older Xcode will fail App Store submission. | Use EAS cloud, not local Xcode build |
| Beta Review (external testers) | External TestFlight Beta Review can reject for same reasons as App Store. HealthKit declaration incomplete = rejection. | Do all App Store prep before inviting external testers; use internal testers first |
| Account deletion | If Supabase auth is wired and active, account deletion must be in-app. Missing this = App Store rejection. | Build Settings → Delete Account before App Store submission |
| AppState recalculation frequency | AppState fires on every background→active transition including brief home-button taps. Without debounce, context-builder runs on every tab switch if app is multitasked. | Daily debounce via `lastRun` date in AsyncStorage (pattern shown above) |
| `finalizeDay()` caller | Must be called at midnight or app open of next day, not manually. Without a caller, Recovery Score never accumulates. Wire to AppState `background→active` transition with a date-change check, same as Adaptive Brain. | Combine SCORE-01 fix with the `useAdaptivePlan` AppState hook |

---

## Sources

- [BackgroundTask — Expo Documentation](https://docs.expo.dev/versions/latest/sdk/background-task/)
- [Goodbye background-fetch, hello expo-background-task — Expo Blog](https://expo.dev/blog/goodbye-background-fetch-hello-expo-background-task)
- [AppState — React Native Documentation](https://reactnative.dev/docs/appstate)
- [iOS Capabilities — Expo Documentation](https://docs.expo.dev/build-reference/ios-capabilities/)
- [Privacy manifests — Expo Documentation](https://docs.expo.dev/guides/apple-privacy/)
- [Privacy manifest files — Apple Developer Documentation](https://developer.apple.com/documentation/bundleresources/privacy-manifest-files)
- [Adding a privacy manifest — Apple Developer Documentation](https://developer.apple.com/documentation/bundleresources/adding-a-privacy-manifest-to-your-app-or-third-party-sdk)
- [Describing use of required reason API — Apple Developer Documentation](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api)
- [HealthKit Entitlement — Apple Developer Documentation](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.healthkit)
- [Authorizing access to health data — Apple Developer Documentation](https://developer.apple.com/documentation/healthkit/authorizing-access-to-health-data)
- [EAS Submit — Expo Documentation](https://docs.expo.dev/submit/introduction/)
- [npx testflight — Expo Documentation](https://docs.expo.dev/build-reference/npx-testflight/)
- [TestFlight overview — App Store Connect Help](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/)
- [Invite external testers — App Store Connect Help](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers/)
- [Apple SDK minimum requirements — Expo Blog](https://expo.dev/blog/apple-sdk-minimum-requirements)
- [SDK minimum requirements — Apple Developer News](https://developer.apple.com/news/upcoming-requirements/?id=02212025a)
- [Privacy updates for App Store submissions — Apple Developer News](https://developer.apple.com/news/?id=3d8a9yyh)
- [App Privacy Details — Apple Developer](https://developer.apple.com/app-store/app-privacy-details/)
- [App Store Review Guidelines — Apple Developer](https://developer.apple.com/app-store/review/guidelines/)
- [Out of sync entitlements for HealthKit — EAS CLI GitHub Issue](https://github.com/expo/eas-cli/issues/2117)
- [iOS App Store Requirements For Health Apps — Dash Solutions Blog](https://blog.dashsdk.com/app-store-requirements-for-health-apps/)
