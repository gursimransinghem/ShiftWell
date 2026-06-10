# ShiftWell — TestFlight Submission Guide

> Step-by-step guide to get ShiftWell from "tests pass" to "50 beta testers installing via TestFlight."
> Written for a solo founder/beginner coder using Expo SDK 52 + EAS Build.

---

## 1. Pre-Requisites Checklist

Complete every item before attempting a TestFlight build. Items are ordered by lead time — start the slow ones first.

### Business & Legal (Start These Immediately)

- [ ] **LLC filed in Florida** — Required for Organization Apple Developer account. File at [sunbiz.org](https://sunbiz.org). ~$125 filing fee. Takes 1-3 business days for online filing.
  - ⚠️ **STATUS CHECK:** Per sprint plan, LLC is NOT yet filed. This is the critical path — it starts the D-U-N-S clock.
  - Company name decision needed first (top picks: Circadian Labs, Vigil Health).

- [ ] **D-U-N-S number obtained** — Required for Organization Apple Developer account. Apply free at [developer.apple.com/enroll/duns-lookup](https://developer.apple.com/enroll/duns-lookup/) after LLC is active. Takes **2-5 weeks** (Apple says "up to 30 business days," typical is 2-3 weeks).
  - ⚠️ **WORKAROUND:** You can enroll as an **Individual** developer ($99/yr) immediately and start TestFlight while waiting for D-U-N-S. Convert to Organization later. Individual accounts support TestFlight with up to 10,000 external testers — there is no functional limitation for beta.

- [ ] **Domain purchased** — `shiftwell.app` (or chosen domain). Needed for support email, privacy policy URL, and App Store listing.
  - Set up: `sim@shiftwell.app`, `support@shiftwell.app`, `beta@shiftwell.app`

### Apple Developer Account

- [ ] **Apple Developer Program enrollment ($99/yr)** — Enroll at [developer.apple.com/programs/enroll](https://developer.apple.com/programs/enroll/).
  - ⚠️ **STATUS CHECK:** Per CLAUDE.md, Apple Developer enrollment is pending LLC. **Recommendation:** Enroll as Individual now (uses your personal Apple ID). Takes 24-48 hours to process. You can convert to Organization once D-U-N-S arrives.
  - You need: Apple ID with two-factor authentication enabled, valid credit card.
  - After enrollment, you'll have access to App Store Connect and the developer portal.

- [ ] **App ID registered** — EAS Build does this automatically on first build. Your bundle ID is already set: `com.shiftwell.app` (confirmed in both `app.json` and `eas.json`). No manual action needed unless you want to pre-register it.

- [ ] **Apple Sign-In capability enabled** — Your `app.json` has `usesAppleSignIn: true`. The App ID must have "Sign in with Apple" capability enabled in the developer portal. EAS handles this if you let it manage credentials (recommended).

- [ ] **HealthKit capability enabled** — Your `app.json` declares HealthKit entitlements. The App ID needs the HealthKit capability. Again, EAS handles this with managed credentials.

### Development Environment

- [ ] **Xcode installed** — Required for iOS builds even with EAS. Install from the Mac App Store. Xcode 15+ required for Expo SDK 52.
  - After install: `sudo xcode-select --switch /Applications/Xcode.app`
  - Accept license: `sudo xcodebuild -license accept`

- [ ] **EAS CLI installed and authenticated**
  ```bash
  npm install -g eas-cli
  eas login  # Log in with your Expo account
  eas whoami  # Verify you're logged in
  ```

- [ ] **Expo project linked to EAS**
  ```bash
  eas init  # Links your project to EAS (creates project ID in app.json)
  ```

- [ ] **Apple credentials configured with EAS**
  ```bash
  eas credentials  # Interactive setup — select iOS, then choose managed credentials
  ```
  EAS will prompt you to log in with your Apple ID and can automatically create provisioning profiles and certificates. Choose "Let Expo handle it" (managed credentials) — this is the recommended path for beginners.

### Code Readiness

- [ ] **All tests passing** — `npm test` must show 1,059+ tests passing, 0 failures.
- [ ] **API key migration complete** — No `EXPO_PUBLIC_ANTHROPIC_API_KEY` in codebase. Claude API calls routed through Supabase Edge Function (Sprint 1, Task 1.1).
- [ ] **Bundle inspection clean** — `npx expo export` then `grep -r 'sk-ant-' dist/` returns zero matches.
- [ ] **Onboarding flow implemented** — 6-screen flow functional (Sprint 1, Task 1.3).
- [ ] **App icon replaced** — Production icon at `./assets/images/icon.png` (1024x1024). No placeholder icons.
- [ ] **`npm audit`** — Zero high/critical vulnerabilities. Run `npm audit fix` if needed.

---

## 2. EAS Build Setup

Your `eas.json` already has three profiles configured. Here's what each does and how to use them.

### Understanding Your Current eas.json

```json
{
  "build": {
    "development": {
      "developmentClient": true,      // Builds a debug app with dev tools
      "distribution": "internal",      // Install via QR code, not App Store
      "ios": { "simulator": true }     // Simulator-only (no device install)
    },
    "preview": {
      "distribution": "internal",      // Install on registered devices via link
      "ios": { "simulator": false }    // Builds for real devices
    },
    "production": {
      "distribution": "store",         // Submits to App Store / TestFlight
      "autoIncrement": true,           // Auto-bumps build number each build
      "ios": { "bundleIdentifier": "com.shiftwell.app" }
    }
  }
}
```

**Which profile for TestFlight?** Use `production`. TestFlight is part of the App Store distribution pipeline — you need `"distribution": "store"`.

### Recommended: Add a Dedicated TestFlight Profile

Add a `beta` profile to `eas.json` that's identical to production but with a distinct channel for OTA updates:

```json
{
  "build": {
    "development": { "..." : "..." },
    "preview": { "..." : "..." },
    "beta": {
      "distribution": "store",
      "autoIncrement": true,
      "channel": "beta",
      "ios": {
        "bundleIdentifier": "com.shiftwell.app"
      },
      "env": {
        "APP_ENV": "beta"
      }
    },
    "production": { "..." : "..." }
  }
}
```

The `channel: "beta"` lets you push OTA updates only to beta testers without affecting production users later.

### Environment Variables

Your app uses Supabase and (after migration) no longer needs a client-side Anthropic key. Set EAS secrets for any values that shouldn't be in code:

```bash
# Set secrets (these are encrypted and injected at build time)
eas secret:create --name SUPABASE_URL --value "https://your-project.supabase.co" --scope project
eas secret:create --name SUPABASE_ANON_KEY --value "your-anon-key" --scope project
```

Note: `SUPABASE_ANON_KEY` is a public key (safe for client bundles). The Anthropic API key lives only on the Supabase Edge Function — never in the app bundle.

For environment-specific config, use the `APP_ENV` variable set in the beta profile above:

```typescript
// src/config.ts
const ENV = process.env.APP_ENV || 'production';
const config = {
  beta: {
    supabaseUrl: 'https://your-project.supabase.co',
    // ... beta-specific settings
  },
  production: {
    supabaseUrl: 'https://your-project.supabase.co',
    // ... production settings
  },
}[ENV];
```

### Building for TestFlight

```bash
# Build iOS for TestFlight (uses production or beta profile)
eas build --platform ios --profile beta

# What happens:
# 1. EAS uploads your project to Expo's build servers
# 2. Expo builds the .ipa file in the cloud (no local Xcode build needed)
# 3. Build takes 15-30 minutes
# 4. You get a link to download the .ipa or submit directly
```

### Submitting the Build to TestFlight

After the build completes:

```bash
# Option A: Auto-submit to App Store Connect (recommended)
eas submit --platform ios --profile beta

# Option B: Submit during build (one command does both)
eas build --platform ios --profile beta --auto-submit
```

EAS will prompt for your App Store Connect credentials (Apple ID + app-specific password). Generate an app-specific password at [appleid.apple.com](https://appleid.apple.com) under Sign-In and Security → App-Specific Passwords.

### Common Build Errors and Fixes (Expo SDK 52)

| Error | Cause | Fix |
|-------|-------|-----|
| `Provisioning profile ... doesn't match` | Mismatched bundle ID or capabilities | Run `eas credentials` and regenerate profiles |
| `No signing certificate` | Apple Developer account not linked | Run `eas credentials`, log in with Apple ID |
| `Build failed: Xcode 15 required` | EAS build image uses old Xcode | Add `"image": "latest"` under `ios` in your build profile |
| `HealthKit capability not found` | App ID missing HealthKit | Go to developer.apple.com → Certificates, IDs & Profiles → App IDs → enable HealthKit |
| `expo-doctor` warnings about SDK version | Dependency version mismatches | Run `npx expo install --check` to fix versions |
| `ITMS-90078: Missing Push Notification Entitlement` | Using notifications without capability | EAS should handle this; if not, enable in developer portal |
| `error: Unexpected token` in build logs | Node version mismatch | Add `"node": "20.x.x"` to your eas.json `build` config |

**Pro tip:** If a build fails, check the full log on the EAS dashboard (link is in the terminal output). The last 20-30 lines usually contain the real error.

---

## 3. App Store Connect Setup

### Creating the App Listing

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** (top left) → **New App**
3. Fill in:
   - **Platform:** iOS
   - **Name:** ShiftWell
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** `com.shiftwell.app` (select from dropdown — it appears after your first EAS build or manual App ID registration)
   - **SKU:** `shiftwell-ios-001` (internal identifier, anything unique)
   - **User Access:** Full Access
4. Click **Create**

This creates the app listing. You won't fill in most metadata until App Store submission — TestFlight only needs the basics.

### Setting Up TestFlight

Once your first build is uploaded (via `eas submit`), it appears in App Store Connect under your app → **TestFlight** tab.

**First-time setup for any new build:**

1. Navigate to **TestFlight** → your build appears under **iOS Builds**
2. Apple runs **automated processing** (5-15 minutes). Wait for status to change from "Processing" to "Ready to Test" (internal) or "Ready to Submit" (external).
3. You'll need to fill in **Export Compliance** — select "No" for the encryption question (your `app.json` already declares `ITSAppUsesNonExemptEncryption: false`, but App Store Connect asks again for the first build).

### Adding Internal Testers (First 5 for Smoke Test)

Internal testers = people with App Store Connect access. Builds are available immediately — no Apple review required.

1. **TestFlight** → **Internal Testing** → **+** (create group)
2. Name it: `Phase 0 — Internal`
3. **Add Testers** → add Apple IDs for Sim, Jess, and 3-4 dev friends
   - Each person needs an Apple ID (the email they use for their Apple account)
   - They'll receive an email invitation to install TestFlight from the App Store, then install ShiftWell
4. **Enable automatic distribution** — toggle ON so every new build goes to this group automatically
5. Limit: **100 internal testers** (must be App Store Connect users with at least the "Customer Support" role)

**To add someone as an App Store Connect user:**
App Store Connect → Users and Access → + → enter their Apple ID email → assign role "Customer Support" (minimum for TestFlight access)

### Adding External Testers (50 Beta Users)

External testers = anyone with an Apple ID. Does NOT require App Store Connect access. **First build to external testers requires Apple's Beta App Review (1-2 days).**

1. **TestFlight** → **External Testing** → **+** (create group)
2. Create groups per your beta plan:
   - `Phase 1 — Friends & Family` (15 testers)
   - `Phase 2 — Healthcare Workers` (50 testers)
   - `Phase 3 — Public Beta` (200 testers)
3. **Add testers** by email address (their Apple ID email) OR generate a **public link**:
   - Public link: Anyone with the link can join (up to 10,000 testers). Great for Reddit/social media recruitment.
   - To create: select group → **Enable Public Link** → copy the link
   - You can disable the link anytime to stop new signups
4. **Set a tester limit** on the public link if you want to cap at 50

### Beta App Review Requirements

Apple reviews your first external TestFlight build. They check:

- **App launches without crashing** — they will install and open it
- **App has basic functionality** — onboarding should work, core features accessible
- **No placeholder content** — no "Lorem ipsum," no stock photos in core UI
- **Privacy policy URL** — must be a live, accessible webpage (not a blank page)
- **App description makes sense** — the "What to Test" field and beta description should be coherent
- **No egregious policy violations** — no private API usage, no hidden features

**Typical review time:** 24-48 hours. Subsequent builds do NOT require re-review unless you change something significant (new capabilities, new permissions).

**If rejected:** Apple emails you with the reason. Common beta rejections: crash on launch, missing privacy policy URL, placeholder content. Fix and resubmit — beta reviews are much faster than full App Store reviews.

### Beta App Description and "What to Test" Text

When you create an external testing group, you'll fill in:

**Beta App Description:**
> ShiftWell optimizes sleep for shift workers using circadian rhythm science. Import your shift schedule, get personalized sleep, nap, meal, and light exposure plans, and export them to your calendar. Built by an emergency medicine physician for the 700 million shift workers worldwide.

**What to Test:**
> 1. Complete the 6-screen onboarding flow (should take <90 seconds)
> 2. Import your shift schedule from Google Calendar (or use Demo Mode)
> 3. Generate a circadian optimization plan
> 4. Review your sleep, nap, meal, and light exposure recommendations
> 5. Export the plan to your calendar
> 6. Try the 7-day premium trial (no payment required during beta)
>
> Please report: crashes, confusing UI, incorrect plan recommendations, calendar sync issues, or any feature you expected but couldn't find.
>
> Feedback: Slack (#bugs channel) or email beta@shiftwell.app

**Feedback Email:** `beta@shiftwell.app`

---

## 4. Submission Checklist

Complete these items before submitting your first external TestFlight build.

### Privacy Nutrition Labels

App Store Connect asks you to declare what data your app collects. Based on ShiftWell's `app.json` and feature set:

| Data Type | Collected? | Linked to Identity? | Used for Tracking? | Purpose |
|-----------|-----------|---------------------|-------------------|---------|
| **Health & Fitness** (sleep data, HRV) | Yes | Yes | No | App Functionality |
| **Location** (coarse — for commute) | Yes | No | No | App Functionality |
| **Contacts** (calendar events) | Yes | No | No | App Functionality |
| **Identifiers** (user ID) | Yes | Yes | No | App Functionality |
| **Usage Data** (analytics) | Yes | No | No | Analytics |
| **Email Address** | Yes | Yes | No | App Functionality |
| **Name** | Yes (if Apple Sign-In shares it) | Yes | No | App Functionality |

**Key points:**
- ShiftWell does NOT track users across other apps/websites → answer "No" to tracking questions
- HealthKit data is collected → you MUST declare Health & Fitness
- Calendar data is read → declare under Contacts (calendar events category)
- Supabase stores user data → it's linked to identity

### Health Data Usage Declaration

Because your app uses HealthKit (`com.apple.developer.healthkit` is in your entitlements):

- [ ] **HealthKit Usage Description** — already in `app.json`: "ShiftWell uses Apple Health data, including sleep records and heart rate variability from your Apple Watch, to optimize your sleep schedule and calculate your recovery score."
- [ ] **HealthKit entitlement** — already declared in `app.json` entitlements
- [ ] Apple will ask **specifically which HealthKit data types** you read/write during review. Prepare a list: Sleep Analysis, Heart Rate Variability, Heart Rate (if applicable)
- [ ] Your app must provide **meaningful health functionality** — not just collect data. ShiftWell's circadian optimization qualifies.

### Required App Metadata

For TestFlight specifically, you need minimal metadata. But prepare these now to avoid delays:

- [ ] **App icon** — 1024x1024 PNG, no alpha/transparency, no rounded corners (Apple adds them)
- [ ] **Privacy Policy URL** — must be live and accessible. Host at `shiftwell.app/privacy` (content per `docs/launch/PRIVACY_POLICY.md`)
- [ ] **Support URL** — `shiftwell.app/support` or just `mailto:support@shiftwell.app`
- [ ] **Beta App Description** — see Section 3 above
- [ ] **What to Test** — see Section 3 above
- [ ] **Contact info** — your email for Apple review team to reach you

### Export Compliance (Encryption)

Your `app.json` already declares:
```json
"ITSAppUsesNonExemptEncryption": false
```

This means your app does NOT use custom encryption beyond standard HTTPS (which is exempt). This is correct for ShiftWell — Supabase uses standard TLS, and you're not doing any custom crypto.

App Store Connect will still ask on your first build. Select **"No"** — your app only uses standard HTTPS/TLS which is exempt from export compliance requirements.

---

## 5. Post-Submission

### Monitoring Crashes in TestFlight

**TestFlight's built-in crash reporting:**
1. App Store Connect → your app → TestFlight → **Crashes** tab
2. Shows crash logs from all TestFlight users, grouped by crash signature
3. Limited detail — stack traces are symbolicated but sparse

**Recommended: Add Sentry (Sprint 2, Task 2.1)**

Sentry gives you much better crash visibility than TestFlight alone:

```bash
npx expo install @sentry/react-native
```

Configure in your app entry point. This is scoped for Sprint 2, but the sooner it's in, the better your crash data will be.

**TestFlight also collects:**
- Screenshots from testers (testers can submit via the TestFlight app)
- Tester feedback text (submitted via TestFlight app → "Send Beta Feedback")
- Usage metrics (installs, sessions, crashes per build)

### OTA Updates via EAS Update

OTA (Over-The-Air) updates push JavaScript changes to users **without building a new binary or going through TestFlight review**. This is your fast lane for bug fixes.

**What OTA can update:** JavaScript code, assets (images, fonts), configuration changes.

**What OTA cannot update:** Native modules, new permissions, new capabilities, Expo SDK version changes. These require a new binary build.

```bash
# Install EAS Update support
npx expo install expo-updates

# Push an update to your beta channel
eas update --branch beta --message "Fix calendar sync crash on iPhone 15"

# What happens:
# 1. Your JS bundle is uploaded to Expo's CDN
# 2. Beta testers' apps check for updates on next launch
# 3. Update downloads in background, applies on next app restart
# 4. No TestFlight review needed, no new build number
```

**Typical OTA update cycle:** Fix bug → `npm test` → `eas update --branch beta` → testers get fix within minutes.

**When to use OTA vs. new build:**

| Change Type | OTA Update | New Build |
|-------------|-----------|-----------|
| Bug fix in JS/TS code | ✅ | — |
| UI tweak (colors, text, layout) | ✅ | — |
| New image/font assets | ✅ | — |
| New native dependency | — | ✅ |
| New iOS permission | — | ✅ |
| Expo SDK upgrade | — | ✅ |
| New HealthKit data type | — | ✅ |

### Collecting Feedback from Testers

**Built-in TestFlight feedback:**
- Testers shake their phone or take a screenshot → TestFlight prompts them to send feedback
- Feedback appears in App Store Connect → TestFlight → **Feedback** section
- Includes: screenshot, tester's text notes, device info, OS version

**Additional feedback channels (per your beta plan):**
- Slack workspace with `#bugs`, `#feature-ideas` channels
- Weekly 5-minute surveys (Google Forms or Typeform)
- Email: `beta@shiftwell.app`
- In-app NPS survey after 7 days (implement in Sprint 2)

### Revoking Access for Unresponsive Testers

1. App Store Connect → TestFlight → select the external testing group
2. Find the tester → click the **–** button or select and **Remove**
3. The tester's access is revoked immediately — the app stops working within 24 hours
4. If using a public link: you can't revoke individual users who joined via link. Instead, **disable the public link** and create a new one, then re-invite active testers.

**Tester management tips:**
- Set expectations upfront: "If we don't hear from you in 2 weeks, we may remove access to make room for active testers"
- TestFlight builds expire after **90 days** automatically
- You can see which testers have installed vs. just been invited (App Store Connect shows install status)

---

## 6. Timeline Estimate

Realistic timeline from "start now" to "50 testers can install." Assumes 15-20 hrs/week dev time and parallel-tracking admin tasks.

| Day | Task | Duration | Blocker? |
|-----|------|----------|----------|
| **Day 1** | Enroll Apple Developer (Individual, $99) | 24-48 hrs to process | Yes — can't build without this |
| **Day 1** | File LLC (if ready with company name) | 1-3 business days | No — not needed for Individual enrollment |
| **Day 1** | Apply for D-U-N-S (after LLC active) | 2-5 weeks | No — only needed for Organization conversion |
| **Day 1** | Install EAS CLI, run `eas login`, run `eas credentials` | 30 minutes | — |
| **Day 1** | Purchase domain, set up email aliases | 1 hour | — |
| **Day 2-3** | Apple Developer account approved | _(waiting)_ | — |
| **Day 3** | Set up App Store Connect app listing | 30 minutes | Needs approved developer account |
| **Day 3** | Complete Sprint 1 code tasks (API migration, onboarding, icon) | ~30 hours over 2 weeks | — |
| **Day 14** | First `eas build --platform ios --profile beta` | 15-30 min build time | Needs all Sprint 1 code tasks done |
| **Day 14** | `eas submit --platform ios` → upload to TestFlight | 10 minutes | — |
| **Day 14** | Automated processing in App Store Connect | 5-15 minutes | — |
| **Day 14** | Add internal testers (Phase 0 group) | 15 minutes | — |
| **Day 14** | Internal testers install and smoke test | 1-3 days | — |
| **Day 17** | Fix any Phase 0 blockers, push OTA or rebuild | 1-3 days | — |
| **Day 20** | Submit build to external testing group | 10 minutes | — |
| **Day 20-22** | Apple Beta App Review | 24-48 hours | Yes — Apple must approve |
| **Day 22** | External testers (Phase 1 F&F) can install | — | — |
| **Day 28-30** | Phase 2 (50 healthcare workers) invited | — | Phase 1 sign-off |

### Summary

| Milestone | Realistic Earliest Date | What's Needed |
|-----------|------------------------|---------------|
| Apple Developer account active | Day 3 | $99, Apple ID with 2FA |
| First TestFlight build (internal) | Day 14 | Sprint 1 code complete |
| Internal testers installing | Day 14 | App Store Connect setup |
| External testers installing (Phase 1) | Day 22 | Beta App Review passed |
| 50 testers installing (Phase 2) | Day 30 | Phase 1 metrics met |

**Fastest possible path to internal TestFlight:** ~3 days (if Apple Developer enrollment is instant, code is ready, and build succeeds first try). Realistic with Sprint 1 work: **2 weeks**.

**Fastest path to external testers:** Add 1-2 days for Beta App Review on top of internal. Realistic: **3 weeks from today**.

---

## Quick Reference: Key Commands

```bash
# Build for TestFlight
eas build --platform ios --profile beta

# Submit to App Store Connect
eas submit --platform ios

# Build and auto-submit in one step
eas build --platform ios --profile beta --auto-submit

# Push an OTA update (no new build needed)
eas update --branch beta --message "Description of changes"

# Check build status
eas build:list --platform ios

# View/manage credentials
eas credentials

# Run all tests before building
npm test

# Check for dependency issues
npx expo-doctor
```

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial creation — comprehensive TestFlight guide covering pre-requisites, EAS build setup, App Store Connect configuration, submission checklist, post-submission monitoring, and timeline. Cross-referenced with existing eas.json, app.json, sprint plan, and beta program plan. Bundle ID confirmed as com.shiftwell.app. HealthKit, Apple Sign-In, and privacy manifest configurations verified against app.json.
