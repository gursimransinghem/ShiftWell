# Domain Pitfalls — ShiftWell v1.1 TestFlight Launch & Adaptive Brain

**Domain:** Expo SDK 55 / React Native / HealthKit / ActivityKit / iOS App Store
**Researched:** 2026-04-06
**Scope:** Milestone 2 — pitfalls specific to adding Adaptive Brain, Live Activities, TestFlight distribution, App Store submission, and monetization migration to an existing v1.0 codebase.
**Downstream consumer:** Requirements and plan authors. Phase-indexed prevention strategies.

---

## Summary

Four primary risk clusters threaten the Milestone 2 timeline:

**Cluster 1 — App Store rejection.** HealthKit apps receive heightened scrutiny (5-10 day review vs. 1-2 day norm). The most common new-app killers are: missing or incomplete privacy manifest (ITMS-91061), HealthKit entitlement declared but `NSHealthShareUsageDescription` absent or vague, screenshots sized for the wrong device (6.7" is now wrong — 6.9" required), and metadata/paywall inconsistency when RevenueCat is wired but gating is disabled.

**Cluster 2 — Adaptive Brain morning recalculation.** HealthKit's HKObserverQuery delivers sleep data with timing unpredictability: the write lands in HealthKit minutes to hours after the user physically wakes. Multiple simultaneous observers can fire duplicate callbacks. Missing the `completionHandler` call in error paths silently breaks future delivery. Battery drain triggers are invisible until App Store review or TestFlight tester reports.

**Cluster 3 — TestFlight first submission.** The LLC → D-U-N-S → Apple Developer → App Store Connect chain has a 5-7 week irreducible minimum already documented in PROJECT.md. The hidden delay is the first external build's Beta App Review (24-48 hours on top of upload). Internal testers (up to 100) bypass this review entirely — use them first to find bugs before triggering external review.

**Cluster 4 — Revenue migration ("all features free" → gating).** Grandfathering is not optional; it is expected. The Notability incident (2021) remains the canonical case: removing access to features users had free triggers App Store rating bombing and Apple guideline scrutiny. The safe path is explicit placement-based gating registered at first install, never retroactively removing access for users who onboarded before gating was turned on.

---

## App Store Rejection Risks

### Critical: Privacy Manifest (ITMS-91061)

**What goes wrong:** EAS build completes successfully. Apple rejects with email listing SDK names that lack PrivacyInfo.xcprivacy files. Expo SDK packages include their own manifests, but Apple's static CocoaPods parser does not always merge them correctly. Third-party libraries (RevenueCat, Supabase, any analytics SDK) may have outdated or missing manifests.

**Why it happens:** Apple enforced privacy manifest requirements starting February 12, 2025 for all new app submissions and updates that add a new SDK. Any SDK in the dependency tree that uses a "required reason API" (UserDefaults, file timestamps, etc.) must declare it.

**Consequences:** Binary rejection. Cannot submit. Each round-trip to Apple review takes 5-10 days for a HealthKit app.

**Prevention:**
- Run `npx expo config --type introspect` to see all native modules included in the build.
- Check each SDK in the Expo community discussions tracker (github.com/expo/expo/issues/27796) for manifest status.
- Add app-level `PrivacyInfo.xcprivacy` declarations in `app.json` under `ios.privacyManifests` for any SDK that doesn't ship its own.
- Before submitting, use Apple's privacy report in Xcode Organizer (or EAS build logs with `EXPO_DEBUG=1`) to verify all required reasons are declared.

**Detection:** Apple sends email with ITMS-91061 and lists specific SDK paths. Catches this before App Store Connect formally rejects.

**Phase:** TestFlight prep phase. Must be resolved before first external build upload.

---

### Critical: HealthKit Entitlement + Usage Description Gap

**What goes wrong:** App declares HealthKit capability in `app.json` but the Info.plist strings are vague ("app uses health data") or the HealthKit background delivery entitlement (`com.apple.developer.healthkit.background-delivery`) is missing while the app uses `enableBackgroundDelivery`. Apple rejects under Guideline 5.1.1 (Data Collection and Storage) or returns a binary rejection for missing entitlement.

**Why it happens:** Expo's EAS build syncs entitlements to the Apple Developer Portal automatically, but only for capabilities explicitly declared. HealthKit has two separate entitlements — basic access and background delivery — and they must both be registered.

**Consequences:** Review rejection. Background wake-up for morning recalculation loop silently fails in production even if dev builds work.

**Prevention:**
- In `app.json`: declare both `com.apple.developer.healthkit` and `com.apple.developer.healthkit.background-delivery` under `ios.entitlements`.
- `NSHealthShareUsageDescription`: write a specific, user-facing sentence referencing sleep data and circadian plan adjustment (not a generic string).
- `NSHealthUpdateUsageDescription`: include only if writing to HealthKit — omit if read-only (ShiftWell is read-only for v1.1).
- Add HealthKit to the App Store Connect "Health & Fitness" primary category. Apple scrutinizes HealthKit apps in this category longer (5-10 day review is normal; budget accordingly).
- Apple requires that the app description in App Store Connect explicitly mention HealthKit/health data use.

**Detection:** Binary rejection email citing missing entitlement, or guideline 5.1.1 rejection citing vague privacy description.

**Phase:** TestFlight prep (entitlements) + App Store prep (listing copy).

---

### High: Screenshot Size Mismatch

**What goes wrong:** Screenshots produced for 6.7-inch (iPhone 14 Pro Max, 1284 x 2778) get rejected because Apple now requires 6.9-inch (iPhone 16 Pro Max, 1290 x 2796) as the mandatory primary size. The pixel dimensions are close enough to look identical but Apple's validator rejects the wrong size.

**Why it happens:** Apple updated screenshot requirements in late 2024 for the iPhone 16 generation. Many existing tutorials and Figma templates have not been updated. The 5.5-inch (iPhone 8 Plus) is no longer required.

**Consequences:** Cannot submit until screenshots are regenerated at the correct resolution.

**Prevention:**
- Required sizes for ShiftWell (iOS only, no iPad): 6.9-inch (1290 x 2796 pixels) mandatory. No other size required for submission.
- Produce screenshots in the simulator on an iPhone 16 Pro Max target (or use a template at exact 1290 x 2796).
- Export as flattened PNG, 24-bit, no alpha channel, no transparency.
- First three screenshots are what appear in search — make them the value proposition, not the onboarding flow.

**Phase:** App Store prep phase.

---

### High: Paywall + RevenueCat Inconsistency at Review

**What goes wrong:** RevenueCat is wired (SDK initialized), `entitlements.ts` intentionally bypasses gating, and the paywall UI exists — but App Store reviewers see a paywall screen with no way to complete a purchase (or see a purchase succeed but no features unlock). Rejection under Guideline 3.1.1 or 3.1.2.

**Why it happens:** Apple reviewers test the subscription flow end to end in sandbox mode. If the paywall appears but a purchase action fails, errors, or unlocks nothing, they reject. If the paywall never appears (because gating is disabled), they may flag that subscription metadata claims premium features that are freely accessible.

**Consequences:** Review rejection requiring binary resubmission and another 5-10 day wait.

**Prevention options (pick one):**
1. **Clean approach:** Remove RevenueCat SDK from the v1.1 binary entirely until gating is intended. Keep the `entitlements.ts` bypass but do not initialize RevenueCat. No paywall shown = no reviewer confusion.
2. **Paywall approach:** Leave RevenueCat initialized, ensure the sandbox purchase flow works end to end, ensure features correctly gate on entitlement. Requires completing the RevenueCat integration before submission.
3. **Documented approach (current):** Keep the paywall visible but add an App Review note in App Store Connect explaining that premium features are free during launch period. This has worked for other developers but adds uncertainty.

**Recommendation:** Option 1 (remove SDK initialization) is lowest risk for v1.1 TestFlight. Option 2 is required for v1.2 public launch with gating.

**Phase:** TestFlight prep. Decision must be made before first EAS production build.

---

### Moderate: Missing Demo Account / Test Instructions

**What goes wrong:** App requires onboarding (calendar permissions, HealthKit permissions, shift entry). Reviewers cannot complete onboarding or the app crashes after permissions are denied in sandbox. Rejection under Guideline 2.1 (App Completeness).

**Prevention:**
- Include detailed test instructions in the App Review Information field in App Store Connect. Describe every required permission, what to grant, and what the expected state looks like after onboarding.
- If the app has no login, state that explicitly ("No account required. App is fully functional after onboarding.").
- Provide a sandbox tester account if Supabase auth is required for any review path.

**Phase:** App Store prep.

---

### Moderate: Age Rating Miscalculation

**What goes wrong:** Age rating questionnaire is answered incorrectly (treating "medical/treatment information" as equivalent to "provides medical advice"). Apps with HealthKit integration are not automatically rated 17+ but answering the health question wrong can trigger that rating, which blocks under-17 users.

**Prevention:**
- ShiftWell is a sleep scheduling tool, not a diagnostic or treatment app. Answer the health/medicine category as "Infrequent/Mild" or "None."
- Include a clear health disclaimer in the app and privacy policy: "ShiftWell provides sleep scheduling suggestions, not medical advice. Consult a physician for medical concerns."
- The existing `HEALTH_DISCLAIMERS.md` content covers this — reference it in the App Store description.

**Phase:** App Store prep.

---

## Adaptive Brain Risks

### Critical: Sleep Data Write Latency from Apple Watch / Health App

**What goes wrong:** The morning recalculation loop fires based on an HKObserverQuery callback that wakes the app. The callback arrives, but the sleep session data in HealthKit is incomplete — Apple Watch writes sleep stages with a delay of 5-30 minutes after waking. The algorithm runs on partial data, generates a plan from last night's nap only, and the user sees a wrong recalculation.

**Why it happens:** HealthKit sleep data latency is a documented platform behavior. The Health app may not finalize sleep analysis until the device syncs. Background delivery wakes the app before the data is complete.

**Consequences:** Incorrect morning plan displayed to user. Trust in the Adaptive Brain feature broken before users understand what it is.

**Prevention:**
- After receiving HKObserverQuery callback, wait a fixed buffer (minimum 10 minutes) before running the recalculation. Use a scheduled timer, not an immediate execution.
- Before running the algorithm, validate that the sleep session has an `endDate` within the last 2 hours AND a duration > 3 hours (to filter out nap artifacts or test data). If not, defer by 15 minutes and retry up to 3 times.
- Log what data was available at trigger time vs. at execution time to build a baseline understanding before v1.1 ships to real users.

**Phase:** Adaptive Brain implementation phase.

---

### Critical: Duplicate Observer Callbacks

**What goes wrong:** HKObserverQuery fires multiple times for the same sleep session when: (a) the user syncs their Apple Watch after waking, (b) a third-party sleep app writes additional data to HealthKit, or (c) the app re-registers the observer query on app launch without deduplication. The recalculation loop runs 2-4 times in one morning, potentially overwriting a correct plan with a later (still-incomplete) dataset.

**Why it happens:** HealthKit does not deduplicate observer callbacks. Multiple sources (Watch, iPhone, third-party apps) writing sleep data each trigger a separate callback. The observer query registration is cumulative if not properly torn down.

**Consequences:** Plan overwrites itself. Battery drain from multiple re-executions. If `finalizeDay()` is called multiple times, the score store may corrupt the day's entry.

**Prevention:**
- Implement a session-level idempotency key: hash `(userId, date, planVersion)` and skip execution if the same key was processed within the last 60 minutes.
- Use a semaphore or async serial queue to ensure only one recalculation runs at a time — subsequent triggers enqueue and are dropped if already running (not queued).
- Register the HKObserverQuery once at app startup, store the query reference, and tear it down properly on `applicationWillTerminate`. Do not re-register on every `AppState.change`.
- Test with Apple Health's "Add Data" button to simulate multiple rapid writes and verify idempotency.

**Phase:** Adaptive Brain implementation phase.

---

### High: Missing completionHandler Call Breaks Future Background Delivery

**What goes wrong:** In the HKObserverQuery update handler, the developer wraps the recalculation in an async function and returns from the handler synchronously — but the `completionHandler()` block is never called in error paths (network timeout, algorithm exception, empty data). iOS interprets this as "the app is still processing" and throttles or stops future background deliveries to this app.

**Why it happens:** This is a known silent failure mode. The app continues to work in the foreground (observer fires when app is active), masking the problem. The failure only manifests in background-only scenarios.

**Consequences:** Background recalculation silently stops working after the first error. Users never know — the plan just stops updating in the morning. No crash, no error log visible to user.

**Prevention:**
- Structure the update handler as: `do { ... completionHandler() } catch { log(error); completionHandler() }`. The handler must be called in every exit path.
- Write a unit test that mocks the handler and asserts `completionHandler` is called exactly once regardless of recalculation success or failure.
- This is the same class of integration pipe failure as `startTrial()` and `score-store.finalizeDay()` — invisible to unit tests, only caught by integration or end-to-end tests.

**Phase:** Adaptive Brain implementation phase.

---

### High: BGTaskScheduler Registration Window

**What goes wrong:** `BGTaskScheduler.register()` must be called before `applicationDidFinishLaunching` returns. In an Expo/React Native app this means the native AppDelegate must register the task — not JavaScript. A background task registered in JS-land (e.g., in a `useEffect` or after the JS bundle loads) will never fire in background.

**Why it happens:** React Native's JS bundle loads asynchronously after `applicationDidFinishLaunching`. The OS background task registration window has already closed.

**Consequences:** `react-native-background-fetch` or any BGTaskScheduler-based scheduling silently fails. App works in foreground (dev/TestFlight), never wakes in true background (real user scenario).

**Prevention:**
- Use `react-native-background-fetch` which handles AppDelegate registration in its native layer via expo-plugin or pod install.
- Verify the task identifier appears in `Info.plist` under `BGTaskSchedulerPermittedIdentifiers` — if it's absent, background wake will never be granted by iOS.
- Test background execution only on a physical device (simulator does not honor background wake timing).

**Phase:** Adaptive Brain implementation phase.

---

### Moderate: Battery Drain From Polling vs. Push

**What goes wrong:** Developer implements a polling loop — query HealthKit every 15 minutes while app is backgrounded — instead of using HKObserverQuery + enableBackgroundDelivery. iOS throttles and eventually terminates polling loops. Battery drain reports appear in TestFlight feedback within the first week.

**Prevention:**
- Use `HKObserverQuery` + `enableBackgroundDelivery(for:frequency:)` exclusively. The OS calls the app when data changes — no polling needed.
- Set `frequency` to `.hourly` not `.immediate` for sleep data. Immediate delivery for sleep samples is unnecessary and generates excess wakeups.
- The background task should complete in under 30 seconds. If the recalculation takes longer, it will be terminated by iOS. Profile the algorithm runtime with `src/lib/circadian/` on a real device.

**Phase:** Adaptive Brain implementation phase.

---

### Moderate: Score Store finalizeDay() Called from Background Context

**What goes wrong:** The morning recalculation triggers `score-store.finalizeDay()` from a background HealthKit callback. Zustand store updates and AsyncStorage writes from a non-main thread can cause subtle data races — the store mutates while the UI is mid-render on the main thread.

**This is an extension of the known SCORE-01/02/03 bug.** The fix (adding a production caller) must also ensure the caller runs on the main thread, not the HealthKit callback queue.

**Prevention:**
- Dispatch `finalizeDay()` to the main queue: `DispatchQueue.main.async { ... }` in native, or ensure the React Native bridge call happens through the correct threading model.
- In JavaScript: wrap score writes in `InteractionManager.runAfterInteractions()` to defer until after animations complete.
- Write an integration test that calls `finalizeDay()` from a simulated background context and verifies store consistency.

**Phase:** SCORE-01/02/03 bug fix phase (immediate, pre-TestFlight).

---

## TestFlight Blockers

### Critical: The LLC → D-U-N-S → Apple Developer → App Store Connect Chain

**What goes wrong:** Each step in this chain has external dependencies and cannot be parallelized. The total elapsed time is 5-7 weeks minimum. Documented in PROJECT.md but the risk is treating this as "someone else's problem" and letting it block a ready codebase.

**Realistic timeline:**
- LLC formation: 2 weeks (state filing)
- D-U-N-S number request: 5 weeks processing (Dun & Bradstreet; Apple expedite request can reduce to ~5 business days if the LLC is already in D&B's database)
- Apple Developer Program enrollment: 24-48 hours after D-U-N-S confirmed
- App Store Connect app record creation + agreement signing: same day
- First external TestFlight build review: 24-48 hours after upload

**Prevention:**
- File LLC immediately. Do not wait for trademark clearance.
- Submit D-U-N-S request the same week as LLC formation. The form at developer.apple.com/enroll/duns-lookup/ can submit directly to Apple's D&B liaison which is faster than going through D&B directly.
- Use Internal Testers (Sim's own device, up to 100 App Store Connect users) from day one — no Beta App Review required for internal testing.
- Code and TestFlight build work can proceed in parallel with enrollment. EAS builds can be produced and side-loaded via Xcode before enrollment completes.

**Phase:** External to the codebase, but the plan must account for a 6-week gate before external users can access TestFlight.

---

### High: First External Build Requires Beta App Review

**What goes wrong:** Developer assumes TestFlight works like Ad Hoc distribution — upload the build and testers get it immediately. External testers cannot access the build until Beta App Review completes (24-48 hours, sometimes longer for HealthKit apps).

**Important distinction:**
- Internal testers (App Store Connect users on your team): immediate access, no review.
- External testers (anyone with a link): requires Beta App Review for the first build. Subsequent builds of the same app typically auto-approve if no new permissions are added.

**Prevention:**
- Do all early bug testing with Internal Testers to avoid the review gate.
- When switching to External Testers, submit the build before it's needed (48-hour buffer).
- Adding new entitlements (e.g., ActivityKit, HealthKit background delivery) to an existing build resets the review requirement for that build.

**Phase:** TestFlight prep phase.

---

### High: EAS Provisioning Profile Mismatch on New Entitlements

**What goes wrong:** v1.0 was built without `com.apple.developer.healthkit.background-delivery` and without ActivityKit entitlements. Adding these entitlements for v1.1 requires the provisioning profile to be regenerated on Apple's servers. If EAS builds use cached credentials or the entitlement is declared locally but not synced to the Apple Developer Portal, the build succeeds but the entitlement is silently stripped.

**Why it happens:** EAS capability sync (`EXPO_NO_CAPABILITY_SYNC=0` default) is automatic, but there is a race condition if entitlements are changed mid-build-queue. Additionally, ActivityKit requires a separate App Extension target with its own provisioning profile.

**Consequences:** Background delivery silently fails. Live Activities do not function. The error is not visible until runtime on a device — not at build time.

**Prevention:**
- After editing `app.json` entitlements, run `eas build --platform ios --clear-cache` for the first build with new entitlements.
- Run `EXPO_DEBUG=1 eas build` and verify the "Syncing capabilities" step succeeds for every new entitlement.
- The ActivityKit widget extension requires a second App ID and provisioning profile — this must be created in Apple Developer before the EAS build.
- Check `npx expo config --type prebuild` to verify `ios.entitlements` contains all expected keys before triggering the cloud build.

**Phase:** TestFlight prep phase (entitlements audit) + ActivityKit phase (extension provisioning).

---

### Moderate: App Icon and Launch Screen Not Generated Correctly in EAS

**What goes wrong:** `app.json` references an icon path, but EAS cloud build uses a different working directory. The build succeeds but the archive contains the Expo placeholder icon. First TestFlight install shows the Expo rocket — immediately unprofessional for real testers.

**Prevention:**
- Provide icon at `./assets/icon.png` (1024x1024, no alpha channel, no rounded corners — Apple applies rounding).
- Provide `./assets/splash.png` for launch screen.
- Run `eas build --local --platform ios` once (requires Xcode) to verify icon inclusion before submitting to EAS cloud.
- Alternatively, run `npx expo export` and inspect the output for icon presence.

**Phase:** TestFlight prep phase.

---

### Moderate: App Store Connect Banking + Tax Forms Required Before Any Paid App

**What goes wrong:** The App Store Connect record is created, the app is submitted, but it cannot go live on the App Store because banking information and tax interviews are incomplete. This is separate from the Apple Developer enrollment.

**Prevention:**
- Complete Agreements, Tax, and Banking in App Store Connect immediately after enrollment — do not wait until the app is ready to submit.
- Tax interview and banking setup can take 1-2 weeks for approval.
- For TestFlight-only distribution, banking is not required. This only blocks public App Store listing.

**Phase:** Legal/admin phase, parallel to development.

---

## Revenue and Monetization Risks

### Critical: Grandfathering Expectation When Gating Is Enabled (v1.2)

**What goes wrong:** Users who downloaded ShiftWell during the "all features free" launch period (v1.0-v1.1) are present when v1.2 enables gating. Features they have used freely for weeks or months are now behind a paywall. Even with a trial, users who consider themselves "existing customers" feel cheated. App Store rating drops. Some users leave 1-star reviews explicitly stating "it was free before."

**The Notability precedent (2021):** Developer switched to subscription, grandfathered "for one year," then ended grandfathering. Public backlash forced a reversal within days. Apple's App Store guidelines (3.1.2) require that existing subscribers maintain access to subscription content if a subscription is discontinued.

**Why this matters specifically for ShiftWell:** The "all features free" decision is documented in `entitlements.ts`. The rationale is sound (retention data needed, RevenueCat not fully integrated). The risk is that users who onboard during the free period form expectations that become load-bearing.

**Prevention:**
- At v1.0/v1.1 launch: add in-app messaging (one-time, dismissible) stating "You're getting early access to all ShiftWell features. When premium launches in a future version, you'll receive a special rate."
- In the App Store description: do not claim the app is "free" without qualification. Use "free to download" + "subscription coming soon."
- At v1.2 launch: grandfather all existing users for at least 90 days (full free access). Offer a discounted annual rate to existing users.
- In `entitlements.ts`, the bypass flag should be tied to `userCreatedAt` date, not just a global toggle — so existing users can be grandfathered by creation timestamp.

**Phase:** v1.0 launch (messaging) + v1.2 implementation (grandfathering logic).

---

### High: entitlements.ts Bypass Is a Global Toggle — No Per-User State

**What goes wrong:** The current `entitlements.ts` bypasses all gating with a flag. When v1.2 enables gating, the toggle flips for all users simultaneously. There is no mechanism to identify which users onboarded before the cutoff date.

**Consequences:** No grandfathering is technically possible without a schema migration. Either all users get gated (bad) or all users stay free (no revenue).

**Prevention:**
- At v1.1 launch: record `installedAt` (ISO timestamp) and `firstOnboardedAt` in AsyncStorage on first onboarding completion. This costs one line of code now and enables precise grandfathering logic later.
- Store this in Supabase user record if auth is used — provides a server-side authoritative record.
- The bypass flag in `entitlements.ts` should read: `isGrandfathered(installedAt) || isActiveSubscriber(entitlement)`.

**Phase:** Bug fix phase (add timestamp recording) — one line, high leverage.

---

### High: RevenueCat SDK Initialized Without Active Products Causes StoreKit Errors

**What goes wrong:** RevenueCat SDK is initialized in the app but no products are configured in App Store Connect, or sandbox products exist but the bundle ID doesn't match. StoreKit throws errors at initialization. In production, this causes subtle bugs: premium check returns undefined instead of false, and `entitlements.ts` bypass may not catch the undefined case.

**Prevention:**
- Either fully initialize RevenueCat with working sandbox products, or do not initialize the SDK at all for v1.1.
- If keeping the SDK: configure all three SKUs ($6.99/mo, $49.99/yr, $149.99 lifetime) in App Store Connect sandbox before any TestFlight build.
- Add a guard in `entitlements.ts`: treat `undefined`, `null`, and `error` states identically to "no entitlement" — never as "premium."

**Phase:** TestFlight prep phase.

---

### Moderate: App Store Review Rejects When Subscription Described in Metadata But Not Functional

**What goes wrong:** The App Store description mentions "$6.99/month premium subscription" but the subscription purchase flow is non-functional (sandbox products missing, StoreKit error, or gating disabled so purchase never unlocks anything different). Reviewer flags as misleading metadata.

**Prevention:**
- If gating is disabled for v1.1 launch: remove subscription pricing from the App Store description entirely. Use "Free to download. Subscription coming soon."
- If gating is enabled: the purchase flow must work end-to-end in sandbox before submission. Apple reviewers will test it.

**Phase:** App Store prep phase.

---

## Integration-Specific Pitfalls (Not Caught by Unit Tests)

These are the same class of failure as `startTrial()` and `score-store.finalizeDay()` — pipes that are structurally correct but disconnected from the production execution path.

| Integration Point | Specific Failure | Prevention |
|---|---|---|
| HKObserverQuery completionHandler | Not called on error path — silently kills future background delivery | Verify in every code path; write an integration test |
| BGTaskScheduler registration | Called after JS bundle loads — never fires in background | Native registration only, verify BGTaskSchedulerPermittedIdentifiers in Info.plist |
| score-store.finalizeDay() | Called from background HealthKit thread — Zustand race condition | Dispatch to main queue; integration test from background context |
| RevenueCat SDK init | StoreKit error if products absent — entitlement check returns undefined | Guard all entitlement reads against undefined/null/error |
| ActivityKit extension signing | Extension target requires separate provisioning profile — silently strips if not created | Create App ID for extension before EAS build |
| installedAt timestamp | Never written at v1.1 launch — grandfathering impossible at v1.2 | One-line write to AsyncStorage at onboarding completion |
| HealthKit background entitlement | Missing from EAS entitlements → background delivery silently fails | Verify in Apple Developer Portal after EAS capability sync |

---

## Phase-Specific Warnings

| Phase | Likely Pitfall | Mitigation |
|---|---|---|
| Bug fix (PREM-01, SCORE-01/02/03) | finalizeDay() race condition when called from background | Main-queue dispatch; integration test |
| Bug fix (PREM-01, SCORE-01/02/03) | installedAt timestamp never recorded | Add at onboarding completion before v1.1 ships |
| Adaptive Brain implementation | Duplicate HKObserver callbacks | Idempotency key + semaphore pattern |
| Adaptive Brain implementation | Sleep data latency — wrong data at trigger time | 10-minute buffer + data validation gate |
| Adaptive Brain implementation | completionHandler not called in error paths | Structural guarantee; integration test |
| TestFlight prep | Privacy manifest gaps (ITMS-91061) | Audit all SDK dependencies before first EAS production build |
| TestFlight prep | HealthKit background entitlement missing | Declare both entitlements; verify EAS capability sync |
| TestFlight prep | RevenueCat initialized without products | Choose: fully initialize with working products, or don't initialize |
| TestFlight prep | New entitlements need profile regeneration | `eas build --clear-cache` on first build with new entitlements |
| App Store prep | Screenshot wrong size (6.7" vs 6.9") | 1290 x 2796 mandatory; no 5.5" required |
| App Store prep | Age rating miscalculated | Sleep scheduler = mild/none health category |
| App Store prep | Subscription metadata inconsistency | Match description to actual reviewer experience |
| Revenue migration (v1.2) | No grandfathering data available | Record installedAt now (v1.1) |
| Revenue migration (v1.2) | User backlash on previously-free features | In-app messaging + 90-day grandfather window |

---

## Prevention Checklist

### Before First EAS Production Build
- [ ] Run `npx expo config --type prebuild` — verify all entitlements present in `ios.entitlements`
- [ ] Verify `com.apple.developer.healthkit` AND `com.apple.developer.healthkit.background-delivery` declared
- [ ] Audit all dependencies for PrivacyInfo.xcprivacy — cross-reference expo/expo#27796
- [ ] Add app-level `PrivacyInfo.xcprivacy` declarations for any SDK without its own manifest
- [ ] Decide on RevenueCat SDK: fully integrated with products, or removed from v1.1 binary
- [ ] `app.json` icon at `./assets/icon.png` (1024x1024, no alpha, no rounded corners)
- [ ] Run `eas build --platform ios --clear-cache` for first build with new entitlements

### Before First External TestFlight Build
- [ ] Internal testers have validated core flows on physical device
- [ ] HealthKit permissions granted and sleep data successfully read in non-simulator environment
- [ ] Morning recalculation tested on physical device with simulated sleep data write
- [ ] ActivityKit extension has separate App ID and provisioning profile in Apple Developer Portal
- [ ] Beta App Review test instructions written in App Store Connect (permissions to grant, expected flows)

### Before App Store Submission
- [ ] Screenshots at 6.9-inch (1290 x 2796), flattened PNG, no alpha channel
- [ ] App Store description does not claim "free" without qualification if subscription is wired
- [ ] `NSHealthShareUsageDescription` is specific (references sleep data and circadian plan)
- [ ] Age rating questionnaire answered: health category = "None" or "Infrequent/Mild"
- [ ] Health disclaimer present in app and privacy policy (not medical advice)
- [ ] Banking + tax forms complete in App Store Connect (independent of code readiness)
- [ ] App Review Information field populated with test instructions

### Before v1.2 Gating Launch
- [ ] `installedAt` timestamp was written at v1.1 onboarding (verify in AsyncStorage)
- [ ] Grandfathering logic reads `installedAt` before date cutoff
- [ ] In-app messaging communicated "subscription coming" to v1.0/v1.1 users
- [ ] 90-day grandfather window active for all pre-cutoff users
- [ ] RevenueCat end-to-end purchase flow tested in sandbox before App Store submission

---

## Sources

- [Expo Privacy Manifests Guide](https://docs.expo.dev/guides/apple-privacy/) — Expo official documentation on PrivacyInfo.xcprivacy requirements (HIGH confidence)
- [Privacy manifest tracking issue expo/expo#27796](https://github.com/expo/expo/issues/27796) — Live tracking of SDK manifest status (HIGH confidence, community-maintained)
- [Apple: Adding a Privacy Manifest](https://developer.apple.com/documentation/bundleresources/adding-a-privacy-manifest-to-your-app-or-third-party-sdk) — Official Apple documentation (HIGH confidence)
- [Apple: NSHealthShareUsageDescription](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSHealthShareUsageDescription) — Official (HIGH confidence)
- [Apple: com.apple.developer.healthkit.background-delivery](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.healthkit.background-delivery) — Official entitlement documentation (HIGH confidence)
- [Apple: HKObserverQuery](https://developer.apple.com/documentation/healthkit/hkobserverquery) — Official (HIGH confidence)
- [Apple Developer Forums: HKObserverQuery duplicate callbacks](https://developer.apple.com/forums/thread/707869) — Community-confirmed duplicate callback behavior (MEDIUM confidence)
- [Apple Developer Forums: HKObserverQuery stops delivering updates](https://developer.apple.com/forums/thread/801627) — Completionhandler failure pattern (MEDIUM confidence)
- [Expo EAS iOS Capabilities](https://docs.expo.dev/build-reference/ios-capabilities/) — Official EAS entitlement sync documentation (HIGH confidence)
- [Expo: provisioning-profile-missing-capabilities](https://github.com/expo/fyi/blob/main/provisioning-profile-missing-capabilities.md) — Official Expo troubleshooting guide (HIGH confidence)
- [Apple: TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/) — Internal vs external tester review requirements (HIGH confidence)
- [Apple: D-U-N-S Number help](https://developer.apple.com/help/account/membership/D-U-N-S/) — Official Apple documentation on enrollment (HIGH confidence)
- [App Store Screenshot Specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/) — Official 6.9-inch requirement (HIGH confidence)
- [RevenueCat: App Store Rejections](https://www.revenuecat.com/docs/test-and-launch/app-store-rejections) — Paywall review pitfalls (MEDIUM confidence)
- [RevenueCat: Ultimate Guide to App Store Rejections](https://www.revenuecat.com/blog/growth/the-ultimate-guide-to-app-store-rejections/) — Comprehensive rejection patterns (MEDIUM confidence)
- [9to5Mac: Notability subscription backlash](https://9to5mac.com/2021/11/03/notability-subscription-broke-app-store-rules/) — Canonical grandfathering case study (HIGH confidence — documented public event)
- [React Native Background Task Processing 2026](https://www.techblast.uk/article/react-native-background-task-processing-methods-2026) — BGTaskScheduler registration window (MEDIUM confidence)
- [Challenges with HKObserverQuery and Background App Refresh](https://medium.com/@shemona/challenges-with-hkobserverquery-and-background-app-refresh-for-healthkit-data-handling-8f84a4617499) — Sleep data latency and duplicate callbacks (MEDIUM confidence)
