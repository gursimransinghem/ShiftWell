# ShiftWell Expert Committee Review

**Date:** March 16, 2026
**App Version:** 1.0.0 (pre-launch)
**Build:** Expo/React Native, iOS-first
**Developer:** Dr. Gursimran Singh, Emergency Medicine Physician

---

## Committee Members

| # | Name | Role | Domain |
|---|------|------|--------|
| 1 | Dr. Sarah Chen | Sleep Medicine, Stanford | Clinical accuracy, safety |
| 2 | Marcus Rivera | Head of Product, Calm | PMF, UX, retention, monetization |
| 3 | Priya Patel | Sr. iOS Engineer, Apple Health | Technical architecture, App Store |
| 4 | James O'Brien | NP, 15yr ICU night shift | Real-world usability |
| 5 | Dr. Lisa Wang | Behavioral Economist, HBS | Pricing, adoption, retention |
| 6 | Carlos Mendez | Creative Director, ex-Headspace | Visual design, brand identity |
| 7 | Rachel Kim | Healthcare Startup Attorney | Regulatory, HIPAA, FDA, privacy |

---

## Issue-by-Issue Evaluation

### Issue 1: Paywall screen is a static mockup — empty TODO handlers, doesn't connect to premium store

| Priority | Votes |
|----------|-------|
| **CRITICAL** | 5 (Rivera, Patel, Wang, Kim, O'Brien) |
| HIGH | 2 (Chen, Mendez) |

**Winner: CRITICAL**

**Committee reasoning:** The paywall screen shows prices ($4.99/mo, $39.99/yr), a "Start Free Trial" button, and "Restore Purchases" — all of which do absolutely nothing. Tapping "Start Free Trial" silently fails. This is a dead-end UX that will generate 1-star reviews on day one (Rivera). Worse, it creates deceptive trade practice exposure: you're presenting purchasing UI that cannot complete a transaction (Kim). Apple will reject this in review if they tap the buttons (Patel).

**Recommendation:** Either (a) fully integrate RevenueCat so the paywall works end-to-end, or (b) remove the paywall screen entirely for v1 and launch as free. There is no middle ground — a non-functional paywall cannot ship.

---

### Issue 2: App Store listing says "100% FREE" but app gates features behind premium

| Priority | Votes |
|----------|-------|
| **CRITICAL** | 5 (Kim, Rivera, Wang, Patel, Chen) |
| HIGH | 2 (O'Brien, Mendez) |

**Winner: CRITICAL**

**Committee reasoning:** This is a direct App Store Review Guideline violation (§3.1.1 — "If your app includes in-app purchases, make sure your app description clearly explains what users will get"). Combined with Issue #1's non-functional paywall, this creates a situation where the listing says free, the UI promises premium, and the purchase flow is broken. That's three contradictions. Apple Review will flag this (Patel). FTC could also view this as deceptive advertising (Kim).

**Recommendation:** Decide the business model *now* and make listing, UI, and store behavior 100% consistent. If freemium, say "Free with In-App Purchases" and make the paywall functional. If free, strip all premium gates.

---

### Issue 3: Onboarding progress bar says "1 of 4" but there are 5 steps

| Priority | Votes |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 1 (Mendez) |
| **MEDIUM** | 5 (Rivera, O'Brien, Patel, Wang, Chen) |
| LOW | 1 (Kim) |

**Winner: MEDIUM**

**Committee reasoning:** Confirmed in code: `welcome`, `chronotype`, and `household` all say `totalSteps={4}`, while `preferences` and `healthkit` say `totalSteps={5}`. Users will see the bar jump from "3 of 4" to "4 of 5" mid-flow, which feels buggy and erodes trust at the most critical moment — first impression (Mendez). It won't block launch, but it's an embarrassing 5-minute fix (Rivera).

**Recommendation:** Change all five screens to `totalSteps={5}`. Trivial fix, do it immediately.

---

### Issue 4: Household screen collects pet data but silently discards it

| Priority | Votes |
|----------|-------|
| CRITICAL | 0 |
| **HIGH** | 4 (Chen, O'Brien, Kim, Wang) |
| MEDIUM | 3 (Rivera, Patel, Mendez) |

**Winner: HIGH**

**Committee reasoning:** The `handleContinue` function calls `setProfile({ householdSize, hasYoungChildren })` but never passes `hasPets`. The user explicitly toggles "Do you have pets that may wake you?" and that input vanishes. This is both a trust violation (Kim — collecting data you discard is a consent issue) and a clinical miss (Chen — pets waking shift workers mid-sleep is a real problem that should influence sleep window buffers). O'Brien: "My dog wakes me at 6am regardless. If I told the app that and it ignored it, I'd uninstall."

**Recommendation:** Either (a) add `hasPets` to the profile type and use it in plan generation (add 15-30min buffer), or (b) remove the pet toggle entirely. Don't ask what you won't use.

---

### Issue 5: No haptic feedback anywhere

| Priority | Votes |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 0 |
| **MEDIUM** | 3 (Mendez, Rivera, O'Brien) |
| LOW | 4 (Patel, Chen, Wang, Kim) |

**Winner: LOW**

**Committee reasoning:** Haptics are a polish signal, not a functional requirement. Missing haptics won't cause App Store rejection or user churn. However, for a sleep app used by exhausted people, tactile confirmation on shift saves and plan generation would meaningfully improve the "I know this registered" confidence (Mendez).

**Recommendation:** Add `expo-haptics` for key actions (shift saved, plan generated, toggle flips) in a polish pass post-launch. Don't let this delay v1.

---

### Issue 6: No skeleton/shimmer loading states

| Priority | Votes |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 0 |
| **MEDIUM** | 3 (Mendez, Rivera, O'Brien) |
| LOW | 4 (Patel, Chen, Wang, Kim) |

**Winner: LOW**

**Committee reasoning:** Plan generation in `plan-store.ts` is synchronous (`generateSleepPlan` is a pure function, not async). The `isGenerating` state exists but flips so fast it's unlikely users see it. There's no network-dependent data loading on the main screens since everything is local. Shimmer states would be cosmetic (Patel).

**Recommendation:** Not needed for v1 given local-first architecture. Add if cloud sync is introduced later.

---

### Issue 7: Schedule screen has no empty state

| Priority | Votes |
|----------|-------|
| CRITICAL | 0 |
| **HIGH** | 4 (Rivera, O'Brien, Mendez, Wang) |
| MEDIUM | 3 (Patel, Chen, Kim) |

**Winner: HIGH**

**Committee reasoning:** A new user opens the Schedule tab and sees… nothing. No calendar events, no guidance, no prompt to add their first shift. This is a critical activation failure point (Rivera). The #1 reason users abandon apps is not understanding what to do next (Wang). The FAB (+) button is present but a blank calendar with just a "+" is not sufficient onboarding to the core feature.

**Recommendation:** Add an empty state illustration with clear copy: "Add your first shift to get started" with a prominent CTA. This directly impacts Day 1 retention and should be done before launch.

---

### Issue 8: Plan generation errors are completely silent

| Priority | Votes |
|----------|-------|
| **CRITICAL** | 4 (Chen, O'Brien, Patel, Kim) |
| HIGH | 3 (Rivera, Wang, Mendez) |

**Winner: CRITICAL**

**Committee reasoning:** In `plan-store.ts`, the `catch` block on `regeneratePlan` sets `isGenerating: false` and… nothing else. No error state. No user notification. No logging. If plan generation fails, the user just sees their old plan (or no plan) with zero indication that anything went wrong. For a health app, silently failing to generate safety-relevant sleep recommendations is dangerous (Chen). A nurse working tonight who sees yesterday's outdated plan could make sleep decisions based on stale data (O'Brien).

**Recommendation:** Add an `error` state to `PlanState`. Display a clear error banner on the Today screen when generation fails. Include a "Retry" button. Log the error for diagnostics. This is pre-launch mandatory.

---

### Issue 9: No analytics SDK for tracking KPIs

| Priority | Votes |
|----------|-------|
| CRITICAL | 0 |
| **HIGH** | 4 (Rivera, Wang, Mendez, Patel) |
| MEDIUM | 2 (O'Brien, Chen) |
| LOW | 1 (Kim) |

**Winner: HIGH**

**Committee reasoning:** You cannot improve what you cannot measure (Rivera). Without analytics, you won't know: day-1/7/30 retention, onboarding completion rate, which features drive engagement, or where users drop off. Wang: "Every health app I've studied that shipped without analytics spent months flying blind and burning marketing spend." However, this must be balanced against the privacy-first positioning (Kim — analytics must be anonymized and disclosed in the privacy policy).

**Recommendation:** Integrate a privacy-respecting SDK (PostHog, TelemetryDeck, or Aptabase — all have on-device anonymization). Track onboarding funnel, core loop engagement (plan views, shifts added), and retention. Update the privacy policy before adding. Can ship v1 without if needed, but add within the first 2 weeks.

---

### Issue 10: Bundle ID still says com.nightshift.app instead of ShiftWell

| Priority | Votes |
|----------|-------|
| **CRITICAL** | 5 (Patel, Kim, Rivera, Mendez, Wang) |
| HIGH | 2 (Chen, O'Brien) |

**Winner: CRITICAL**

**Committee reasoning:** Confirmed in `app.json`: both `ios.bundleIdentifier` and `android.package` are `com.nightshift.app`. The bundle ID is *permanent* on the App Store — once you publish with this ID, you're stuck with it forever, or you must create a new app listing and lose all reviews/rankings (Patel). A brand mismatch between "ShiftWell" and "nightshift" also creates trademark confusion and looks unprofessional (Kim, Mendez).

**Recommendation:** Change to `com.shiftwell.app` (or `com.drgursimran.shiftwell`) in `app.json` immediately, before any build is submitted. Also update `eas.json` submit config. This is a 30-second fix with permanent consequences if missed.

---

### Issue 11: Missing health disclaimer in onboarding flow

| Priority | Votes |
|----------|-------|
| **CRITICAL** | 6 (Chen, Kim, O'Brien, Rivera, Wang, Patel) |
| HIGH | 1 (Mendez) |

**Winner: CRITICAL**

**Committee reasoning:** The `HEALTH_DISCLAIMERS.md` file contains excellent disclaimers written for onboarding, settings, and App Store — but *none of them are actually implemented in the app*. The onboarding flow (5 screens) never shows the disclaimer. The settings screen doesn't include the "About ShiftWell" copy. For a health-adjacent app that generates sleep schedules, failing to disclaim before users act on those recommendations creates real liability (Kim). Chen: "If a user follows a plan that's inappropriate for their undiagnosed sleep apnea and has a drowsy-driving incident, the absence of a disclaimer is exhibit A." Apple Review also expects health disclaimers to be visible (Patel).

**Recommendation:** Add the onboarding disclaimer as a visible element on the `welcome` screen (or a dedicated pre-onboarding screen). Add the settings disclaimer to the Settings screen. This is non-negotiable before any public release.

---

### Issue 12: Accessibility is very sparse — missing labels, no VoiceOver support

| Priority | Votes |
|----------|-------|
| **HIGH** | 5 (O'Brien, Patel, Kim, Mendez, Rivera) |
| MEDIUM | 2 (Chen, Wang) |

**Winner: HIGH**

**Committee reasoning:** The codebase has almost zero `accessibilityLabel`/`accessibilityRole` props across all screens (confirmed: `rg` found essentially none in `/src/components/` or `/app/`). The household screen has labels on the counter buttons — that's about it. The FAB on schedule says "Add shift" — good. But every other interactive element is unlabeled. This affects ~7% of iOS users who use VoiceOver or other assistive features (Patel). It's also an ADA compliance concern for an app marketed to healthcare workers, many of whom work in hospitals with ADA mandates (Kim).

**Recommendation:** Systematic pass: add `accessibilityLabel` to all buttons, inputs, toggles, and navigation elements. Add `accessibilityRole` where React Native doesn't infer it. Test with VoiceOver. Doesn't need to be perfect for v1, but key flows (onboarding, add shift, view plan) must be navigable.

---

### Issue 13: Premium store has 5 empty catch blocks

| Priority | Votes |
|----------|-------|
| CRITICAL | 1 (Patel) |
| **HIGH** | 5 (Chen, Rivera, O'Brien, Kim, Wang) |
| MEDIUM | 1 (Mendez) |

**Winner: HIGH**

**Committee reasoning:** All 5 catch blocks in `premium-store.ts` silently swallow errors. `initializePremium`, `refreshStatus`, `purchase`, `restore`, and `loadOfferings` all fail silently. If RevenueCat is misconfigured, the user taps "Start Free Trial," nothing happens, and there's no error state, no toast, no feedback. Combined with Issue #1 (non-functional paywall), this creates a double layer of silent failure (Patel). Even the comment says "RevenueCat not configured yet — stay on free" — meaning the developer knows it's incomplete.

**Recommendation:** If paywall ships: add error states, user-facing error messages, and logging to every catch block. If paywall doesn't ship in v1: moot, but still clean up the catch blocks before the code goes to production.

---

### Issue 14: Supabase client initializes with empty strings if env vars missing

| Priority | Votes |
|----------|-------|
| **HIGH** | 5 (Patel, Kim, Chen, Rivera, O'Brien) |
| MEDIUM | 2 (Wang, Mendez) |

**Winner: HIGH**

**Committee reasoning:** `supabase/client.ts` uses `process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''` — which means if env vars aren't set, it creates a Supabase client pointing at an empty URL. This will cause silent failures or cryptic network errors downstream. Auth, sync, and any cloud feature will break in a way that's extremely hard to diagnose (Patel). For a production build, this is a ticking time bomb.

**Recommendation:** Add a startup validation: if env vars are empty, either throw a clear error (in dev) or gracefully disable cloud features with a user-visible indicator (in production). Never silently create clients with empty credentials.

---

### Issue 15: `useTodayPlan` hook has a stale closure bug — minute timer doesn't update memoized value

| Priority | Votes |
|----------|-------|
| **CRITICAL** | 4 (Patel, Chen, O'Brien, Rivera) |
| HIGH | 3 (Wang, Mendez, Kim) |

**Winner: CRITICAL**

**Committee reasoning:** The hook runs `setInterval` every 60 seconds to force re-render via `setTick(t => t+1)`, but the `useMemo` depends only on `[plan, shifts]`. The tick state isn't in the dependency array. This means `activeBlock`, `nextBlock`, and `countdowns` — all of which compare against `new Date()` — will only update when `plan` or `shifts` change, *not* every minute as intended. A nurse checking "what's my next sleep block?" at 2am will see stale data that could be hours old (O'Brien). This is a functional correctness bug in the app's core display.

**Recommendation:** Add `tick` (or a `_tick` rename to suppress linting) to the `useMemo` dependency array:
```js
const tick = useTick(60_000); // extract to a small hook
return useMemo(() => { ... }, [plan, shifts, tick]);
```
This is a 1-line fix for a bug that undermines the core feature.

---

### Issue 16: No ESLint/Prettier configuration

| Priority | Votes |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 1 (Patel) |
| **MEDIUM** | 3 (Rivera, Wang, Mendez) |
| LOW | 3 (Chen, O'Brien, Kim) |

**Winner: MEDIUM**

**Committee reasoning:** The code quality is actually reasonable without it — consistent style, good TypeScript usage. But as the project grows (especially with contributors), lack of linting will cause drift. This doesn't affect users at all (O'Brien).

**Recommendation:** Add Expo's recommended ESLint config + Prettier post-launch. 15-minute setup. Not a launch blocker.

---

### Issue 17: Privacy Policy has placeholder company name

| Priority | Votes |
|----------|-------|
| **CRITICAL** | 6 (Kim, Patel, Rivera, Wang, Chen, O'Brien) |
| HIGH | 1 (Mendez) |

**Winner: CRITICAL**

**Committee reasoning:** Confirmed: `[Company Name] LLC` appears twice and `[contact@example.com]` appears once. Apple requires a valid, reachable privacy policy URL for App Store submission (Patel). A privacy policy with placeholder text is instant App Store rejection. Beyond that, it's legally void — a privacy policy that doesn't identify who is making the commitments isn't enforceable (Kim).

**Recommendation:** Replace `[Company Name] LLC` with the actual entity name (or Dr. Gursimran Singh's name if no LLC exists). Replace `[contact@example.com]` with a real email. Do this before any build is submitted. 2-minute fix.

---

### Issue 18: No CCPA compliance mention

| Priority | Votes |
|----------|-------|
| ~~CRITICAL~~ | 0 |
| HIGH | 0 |
| MEDIUM | 0 |
| **N/A — Already addressed** | 7 |

**Winner: N/A — FALSE FINDING**

**Committee reasoning:** The scout report was wrong on this one. The Privacy Policy *already includes* a full CCPA section covering right to know, right to delete, right to opt out of sale, and non-discrimination. Verified directly in the file. No action needed.

**Recommendation:** No change required. The CCPA section is well-written and accurate for an app that collects no user data.

---

### Issue 19: No shift deletion confirmation

| Priority | Votes |
|----------|-------|
| CRITICAL | 0 |
| **HIGH** | 4 (O'Brien, Rivera, Chen, Mendez) |
| MEDIUM | 3 (Patel, Wang, Kim) |

**Winner: HIGH**

**Committee reasoning:** Confirmed in `add-shift.tsx`: `handleDelete` calls `removeShift(existingShift.id)` directly with no confirmation dialog. Deleting a shift triggers plan regeneration (via the store subscription), so an accidental delete immediately changes the user's sleep plan. O'Brien: "I'm on my phone at 3am with shaky hands after a 12-hour ICU shift. An accidental tap shouldn't nuke my schedule." This is a destructive action without a confirmation gate.

**Recommendation:** Add `Alert.alert("Delete Shift?", "This will remove the shift and regenerate your sleep plan.", [{text: "Cancel"}, {text: "Delete", style: "destructive", onPress: ...}])`. 10-line fix.

---

### Issue 20: No offline/connectivity indicator

| Priority | Votes |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 0 |
| **MEDIUM** | 4 (Patel, O'Brien, Rivera, Mendez) |
| LOW | 3 (Chen, Wang, Kim) |

**Winner: MEDIUM**

**Committee reasoning:** The app is local-first — plan generation, shift storage, and the core loop all work offline. Supabase is used for auth and cloud sync (optional). Given the local-first architecture, offline functionality is mostly fine. The main risk is auth/sync operations failing silently when offline (Patel). But since the core value prop works without internet, this isn't a launch blocker.

**Recommendation:** Add a simple connectivity banner for when cloud features are attempted offline. Not needed for v1 if launching as local-only/free.

---

### Issue 21: Theme imports are inconsistent across screens

| Priority | Votes |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 0 |
| **MEDIUM** | 4 (Patel, Mendez, Rivera, Wang) |
| LOW | 3 (Chen, O'Brien, Kim) |

**Winner: MEDIUM**

**Committee reasoning:** Confirmed: `schedule.tsx` imports `BACKGROUND, ACCENT, TEXT` directly (named sub-exports), while `household.tsx` imports `COLORS, SPACING, TYPOGRAPHY` (nested objects). Both work — the theme's `index.ts` exports both styles. It's a consistency issue, not a bug (Patel). But inconsistent imports lead to inconsistent refactoring — if you rename `COLORS.accent.primary`, you'd miss the screens using `ACCENT.primary`.

**Recommendation:** Standardize to one pattern in a post-launch cleanup pass. Not user-facing, not urgent.

---

### Issue 22: Auth screens use hardcoded colors instead of theme tokens

| Priority | Votes |
|----------|-------|
| CRITICAL | 0 |
| **HIGH** | 3 (Mendez, Patel, Rivera) |
| MEDIUM | 3 (Wang, O'Brien, Chen) |
| LOW | 1 (Kim) |

**Winner: HIGH (by tiebreak — Mendez argues design consistency is core to brand trust at first impression)**

**Committee reasoning:** Confirmed: `sign-in.tsx` uses hardcoded hex values (`#0A0E1A`, `#8E8E93`, `#6C63FF`, `#141927`, etc.) instead of theme tokens. The sign-in screen is one of the first things users see. If the theme ever changes, auth screens will look different from the rest of the app (Mendez). It's also a maintenance hazard — these same colors exist as proper tokens in `colors.ts`.

**Recommendation:** Replace hardcoded values with theme token imports. 15-minute refactor. Do before launch since auth is the first impression.

---

### Issue 23: No retry mechanism for network failures

| Priority | Votes |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 1 (Patel) |
| **MEDIUM** | 4 (Rivera, O'Brien, Chen, Wang) |
| LOW | 2 (Mendez, Kim) |

**Winner: MEDIUM**

**Committee reasoning:** Given the local-first architecture, network failures primarily affect auth and cloud sync — both of which are optional. Supabase's JS client has some built-in retry logic. The core plan generation and shift management work entirely offline. Retry logic would matter more if the app depended on a backend for core features (Patel).

**Recommendation:** Add basic retry with exponential backoff to auth and sync operations post-launch. Not a v1 blocker.

---

### Issue 24: Google Calendar live sync missing (critical competitive gap)

| Priority | Votes |
|----------|-------|
| CRITICAL | 0 |
| **HIGH** | 4 (Rivera, O'Brien, Wang, Mendez) |
| MEDIUM | 3 (Patel, Chen, Kim) |

**Winner: HIGH**

**Committee reasoning:** The app supports ICS file import (manual) but not live Google Calendar sync. Rivera: "Every competitor has this. Shift workers get their schedules pushed to Google Calendar by staffing systems (Kronos, QGenda). Manual ICS import adds friction that kills adoption." O'Brien: "I get my schedule in Google Calendar from QGenda. I'm not going to export an ICS file every two weeks." However, this is a significant engineering effort (OAuth, Calendar API, background sync) that shouldn't block v1 (Patel).

**Recommendation:** Ship v1 with ICS import. Build Google Calendar sync as the flagship v1.1 feature. Mention "Google Calendar sync coming soon" in the app to set expectations. This is the single most important post-launch feature.

---

### Issue 25: No weekly sleep report feature

| Priority | Votes |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 2 (Rivera, Wang) |
| **MEDIUM** | 4 (Chen, O'Brien, Mendez, Patel) |
| LOW | 1 (Kim) |

**Winner: MEDIUM**

**Committee reasoning:** Weekly reports drive retention (Wang — "it's the Duolingo weekly email equivalent for health apps"). The recovery tab already has `WeeklyTrendChart` and `RecoveryScoreCard` components, so some of the building blocks exist. But a polished weekly report (push notification, shareable card, trend analysis) is a feature, not a bug fix (Rivera).

**Recommendation:** Prioritize for v1.1 or v1.2. Existing recovery components are a good foundation. Not a launch blocker.

---

### Issue 26: app.json still references old nightshift branding

| Priority | Votes |
|----------|-------|
| **CRITICAL** | 5 (Patel, Kim, Rivera, Mendez, Wang) |
| HIGH | 2 (Chen, O'Brien) |

**Winner: CRITICAL**

**Committee reasoning:** Same as Issue #10 — `app.json` has `com.nightshift.app` for both iOS and Android identifiers. Additionally flagged because `eas.json` submit section has empty `appleId`, `ascAppId`, and `appleTeamId` fields, meaning EAS Submit won't work. The branding inconsistency (app name says "ShiftWell" but IDs say "nightshift") could cause confusion with Apple during review (Patel). Combined with Issue #10 into one remediation.

**Recommendation:** Consolidated with Issue #10. Change bundle IDs, fill in EAS submit config. Must be done before first build.

---

### Issue 27: Should v1 launch as 100% free or freemium?

| Vote | Members |
|------|---------|
| **100% Free for v1** | 5 (Rivera, Wang, O'Brien, Mendez, Kim) |
| Freemium | 1 (Patel — "if the paywall is ready, ship it") |
| Abstain | 1 (Chen — "not my domain") |

**Winner: 100% FREE for v1**

**Committee reasoning:**

**Rivera:** "You have zero users and zero social proof. Your first job is to get 1,000 people to love this app, not to extract $4.99/month from nobody. Free removes every adoption barrier. Paywall can come in v1.2 once you have retention data."

**Wang:** "The behavioral economics are clear: shift workers are skeptical of new health apps. A free tier with a future upgrade path (once they're invested in their data) will convert better than gating features on day one when trust is zero."

**O'Brien:** "Nurses talk. If someone in the break room says 'this app is free and actually helps,' it spreads. If someone says 'it wanted my credit card before I could see if it works,' it's dead."

**Kim:** "Launching free eliminates the deceptive practices risk from Issues #1 and #2 entirely. You can add monetization when the infrastructure is actually ready."

**Mendez:** "Let the brand establish itself as genuinely helpful first. Premium positioning comes after earned trust."

**Recommendation:** Launch v1 as 100% free. Remove the paywall screen or make it a "coming soon" teaser. Strip all premium gates. Monetize in v1.2+ once you have retention data and RevenueCat is properly integrated.

---

### Issue 28: What's the single most impactful UX improvement not on this list?

| Suggestion | Members |
|------------|---------|
| **Push notification onboarding / permissions** | Rivera, Chen, O'Brien |
| Shift template/recurring shifts | Wang, Mendez |
| Dark mode refinement (true OLED black) | Patel |
| Quick-add shift from Today screen | Kim (abstain from UX, offered this) |

**Winner: Push notification onboarding & permission flow**

**Committee reasoning:**

**Rivera:** "The entire value of this app is telling you *when* to do things — sleep, caffeine cutoff, light exposure. If notifications aren't set up properly, the app is a fancy schedule viewer. The notification permission request needs to be its own onboarding step with clear value framing: 'We'll remind you 15 minutes before your sleep window so you can wind down.'"

**Chen:** "Circadian interventions only work if they're timed correctly. A notification at the right moment is the difference between a user following the plan and forgetting it exists."

**O'Brien:** "At 3am after a 12-hour shift, I'm not opening an app to check my plan. I need the app to ping me: 'Wind down in 15 minutes. Caffeine cutoff now.'"

**Recommendation:** Add a notification permission step to onboarding (between preferences and healthkit). Frame it around the value: "Get timely reminders for sleep windows, caffeine cutoffs, and light exposure." The `notification-service.ts` already exists — this is about the permission UX and ensuring users opt in.

---

### Issue 29: What's the biggest risk to user safety that needs addressing before launch?

| Risk | Members |
|------|---------|
| **Silent plan generation failure (Issue #8)** | Chen, O'Brien, Patel |
| Missing health disclaimer (Issue #11) | Kim, Wang |
| Stale closure showing outdated plan (Issue #15) | Rivera, Mendez |

**Winner: Silent plan generation failure (Issue #8) — but all three are interrelated**

**Committee reasoning:**

**Chen:** "The worst-case scenario: a nurse checks ShiftWell before driving home after a night shift. The plan says 'sleep window: 8am-3pm' but plan generation silently failed and they're seeing yesterday's plan, which was for a different shift pattern. They delay sleep based on stale advice and drive drowsy. We need: (1) the disclaimer so they know this isn't medical advice, (2) working plan generation with visible errors, and (3) accurate real-time display."

**O'Brien:** "All three of these — #8, #11, #15 — are about the same thing: can I trust what this app tells me? If the answer is 'maybe, but it might be showing you stale or failed data with no warning,' that's a safety issue."

**Recommendation:** Fix all three before launch. They form a triangle of trust:
1. **Disclaimer** (Issue #11) — set expectations
2. **Error handling** (Issue #8) — make failures visible
3. **Stale closure** (Issue #15) — make current state accurate

---

### Issue 30: What feature should be cut to ship faster?

| Feature to cut | Members |
|----------------|---------|
| **Premium/paywall system entirely** | Rivera, Wang, Kim, O'Brien |
| Google Calendar sync expectation | Patel |
| Recovery/analytics tab | Mendez |
| Cloud sync/Supabase backend | Chen |

**Winner: Premium/paywall system entirely**

**Committee reasoning:**

**Rivera:** "Cut the paywall. It's the source of Issues #1, #2, and #13. It adds complexity to every feature decision. And per Issue #27, you should launch free anyway. Removing it eliminates three critical bugs instantly."

**Wang:** "The premium store, entitlements system, RevenueCat integration, and paywall screen represent meaningful code surface area that needs testing, configuration, and maintenance. All for a feature you shouldn't use at launch."

**Kim:** "Every line of monetization code you ship is a line Apple Review scrutinizes and a line that creates potential consumer protection exposure."

**Recommendation:** For v1, remove or gate behind a feature flag: `paywall.tsx`, premium feature gates, RevenueCat initialization. Keep the `premium-service.ts` and `premium-store.ts` code in the repo for v1.2. This immediately resolves Issues #1, #2, and #13.

---

## TOP 10 PRIORITY RANKING

What to fix first, in order:

| Rank | Issue | Priority | Effort | Why This Order |
|------|-------|----------|--------|----------------|
| **1** | #10/#26: Bundle ID + branding | CRITICAL | 5 min | Permanent consequence if missed. Cannot be changed post-publish. |
| **2** | #17: Privacy Policy placeholders | CRITICAL | 2 min | Instant App Store rejection. Legally void without real entity name. |
| **3** | #11: Health disclaimer in app | CRITICAL | 1 hr | Liability exposure. Apple expects it for health apps. Already written in HEALTH_DISCLAIMERS.md. |
| **4** | #15: Stale closure bug | CRITICAL | 5 min | Core feature broken. Users see outdated block info. 1-line fix. |
| **5** | #8: Silent plan generation errors | CRITICAL | 2 hr | Safety risk. Users can't tell if their plan is valid. |
| **6** | #1/#2: Paywall decision (→ cut it) | CRITICAL | 1 hr | Resolves 3 critical issues at once. Unblocks App Store submission. |
| **7** | #4: Pet data discarded | HIGH | 30 min | Trust violation. Either use it or remove the toggle. |
| **8** | #19: Shift deletion confirmation | HIGH | 15 min | Destructive action without gate. Easy fix, high impact. |
| **9** | #7: Schedule empty state | HIGH | 2 hr | First-use experience. Directly impacts Day 1 retention. |
| **10** | #22: Auth hardcoded colors | HIGH | 15 min | First impression screen with inconsistent theming. |

### Honorable mentions (do before v1.1):
- #12: Accessibility pass (HIGH — do within 2 weeks of launch)
- #14: Supabase empty credentials guard (HIGH — trivial fix)
- #24: Google Calendar sync (HIGH — flagship v1.1 feature)
- #9: Analytics SDK (HIGH — add within first 2 weeks)
- #3: Progress bar totalSteps (MEDIUM — 5-minute fix, just do it)

---

## COMMITTEE CONSENSUS: LAUNCH STRATEGY

### Unanimous Agreements (7/7):
1. **Launch v1 as 100% free.** Monetize later.
2. **Remove the paywall screen** (or feature-flag it) for v1.
3. **Fix bundle ID before any build is submitted.** This is irreversible.
4. **Health disclaimer must be in the app** before any public release.
5. **The privacy policy must have real contact info** before submission.

### Strong Consensus (5+/7):
6. **The stale closure bug (#15) and silent errors (#8) are the two most dangerous technical bugs.** Both must be fixed pre-launch.
7. **Google Calendar sync is the #1 post-launch feature.** ICS import is acceptable for v1 but not for long-term retention.
8. **The app's core circadian engine and plan generation are genuinely strong.** The clinical logic is solid. The issues are all in the surrounding infrastructure and UX, not the core science.

### Dr. Chen's Clinical Note:
> "The circadian science in this app — the two-process model implementation, the shift classification, the light exposure protocols, the caffeine timing — is surprisingly rigorous for a v1. Dr. Singh's medical background shows. The recommendations I'd make are around *presentation* of this science, not the science itself. Specifically: always show confidence/uncertainty ('this plan is based on your reported shifts — actual sleep quality may vary'), never present plans as prescriptive medical advice, and make it very clear when data is stale or generation has failed. The engine is good. The UI's honesty about the engine's limitations needs work."

### Marcus Rivera's Product Note:
> "This app has a genuine competitive moat: it's built by a physician who actually works shifts. That's the brand story. Don't bury it. The 'built by a night shift ER doc' positioning is worth more than any feature. Lean into it in the App Store listing, the onboarding, and the brand voice. Most sleep apps are built by people who sleep 8 hours a night."

### James O'Brien's End-User Note:
> "I've tried every shift work app. They're all built by people who think shift work means '9pm to 5am.' This is the first one that gets the complexity — rotating schedules, irregular patterns, the reality that my dog and my toddler don't care about my circadian rhythm. Fix the bugs on this list, and I'd actually use this. That's not something I say about most of these apps."

---

*Report generated by 7-member expert committee simulation. All findings are grounded in verified codebase analysis, not assumptions.*

---
Created: 2026-03-24
Last Reviewed: 2026-03-24
Last Edited: 2026-03-24
Review Notes: Freshness footer added during comprehensive audit.
