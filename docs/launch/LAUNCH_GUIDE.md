# ShiftWell: Complete Launch Guide

From "Code Complete" to Live on the App Store

**Last updated:** 2026-04-05

---

## Overview

This guide consolidates all steps needed to get ShiftWell from code to production. Everything here is paperwork and clicking buttons — you've already done the hardest part (building the app).

**Estimated timeline:** 6-8 hours active work over 2-3 weeks
**Estimated cost:** ~$250-400 one-time ($99/year for Apple after that)

---

## PART 1: BUSINESS FORMATION (Do First — Blocks Everything)

These steps must happen first. They unlock everything else.

### Step 1.1: Form Your LLC

**Estimated time:** 30 minutes | **Cost:** $50-200

An LLC creates a legal wall between you and your app. If someone sues the app, they sue the LLC, not you personally. Your house, savings, and personal assets stay protected. It also looks more professional on the App Store.

**How to do it:**

1. **Pick your state.** Register in whatever state you live in. (Wyoming/Delaware have lower fees but add complexity for solo founders — stick with your home state.)

2. **Go to your state's Secretary of State website.** Google "[your state] Secretary of State file LLC" and it'll be the first result.

3. **File your "Articles of Organization."** This official form creates your LLC. You'll need:
   - LLC name (e.g., "ShiftWell Health LLC" — confirm availability in your state)
   - Your address
   - What the business does ("Mobile health application development")
   - Your name as the organizer

4. **Choose a registered agent.** This person receives official legal mail. You can be your own registered agent and use your home address. Or pay $50/year for privacy (services like Northwest Registered Agent keep your address out of public records).

5. **Create an Operating Agreement.** Even as a solo founder, this document strengthens your LLC protection. It's one page saying "I own 100% of this LLC and here's how I run it." Use a free template from your state — you don't file it, just keep it in your records.

6. **Pay the filing fee** ($50-200 depending on your state). You'll get confirmation within days (some states process instantly).

You now own a business.

### Step 1.2: Get Your EIN (Employer Identification Number)

**Estimated time:** 10 minutes | **Cost:** FREE

An EIN is like a Social Security number for your business. You'll need it to:
- Open a business bank account
- File business taxes
- Enroll in the Apple Developer Program

**How to do it:**

1. Go to [irs.gov/ein](https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online)

2. Click "Apply Online Now"

3. Answer the straightforward questions:
   - Entity type: LLC
   - Number of members: 1
   - Why you're applying: "Started a new business"
   - Your LLC name and address
   - Your personal info (as responsible party)

4. Submit. You get your EIN immediately on screen. Save the confirmation letter as PDF.

**Important:** Never pay a third party for your EIN. It's free directly from the IRS. Any website charging you is just filling out the same free form on your behalf.

### Step 1.3: Open a Business Bank Account

**Estimated time:** 30 minutes | **Cost:** Usually free

Keeping business money separate from personal money:
- Protects your LLC (mixing funds can "pierce the corporate veil")
- Makes taxes easier (all business transactions in one place)

**How to do it:**

1. **Choose a bank:**
   - Your current bank (walk in with documents — easiest)
   - Online business bank (Mercury, Relay, Novo — no fees, startup-friendly)

2. **Bring these documents:**
   - Articles of Organization (LLC formation docs)
   - EIN confirmation letter
   - Personal ID (driver's license)
   - Operating Agreement (some banks ask for this)

3. **Open a business checking account.** That's all you need for now.

4. **Set up online access** for checking balances and tracking expenses.

All app-related expenses (Apple Developer, design tools, etc.) go through this account. All future app revenue goes here too.

---

## PART 2: APPLE DEVELOPER SETUP (Blocks TestFlight)

### Step 2.1: Obtain D-U-N-S Number

**Estimated time:** 5 minutes to apply, 1-5 business days to receive | **Cost:** FREE

A D-U-N-S number is a free business identifier from Dun & Bradstreet. Required for enrolling as an Organization in the Apple Developer Program.

**How to do it:**

1. Go to Apple's developer enrollment page at [developer.apple.com/programs/enroll](https://developer.apple.com/programs/enroll)

2. Apple's enrollment system will check if your LLC already has a D-U-N-S number

3. If not, Apple submits the request for you — takes 1-5 business days

4. You'll get an email when it's ready

### Step 2.2: Enroll in the Apple Developer Program

**Estimated time:** 15 minutes to start, then 1-5 business days waiting | **Cost:** $99/year

You cannot publish on the App Store or use TestFlight without an Apple Developer account.

**How to do it:**

1. Go to [developer.apple.com/programs/enroll](https://developer.apple.com/programs/enroll)

2. Sign in with your Apple ID (create one if you don't have it)

3. **Choose "Organization"** — not Individual. This displays your LLC name on the App Store instead of your personal name. More professional, builds trust for a health app.

4. You'll need the D-U-N-S number from Step 2.1

5. Apple will ask for a website. It can be a simple one-page site with your LLC name, what ShiftWell is, and contact email. Options:
   - GitHub Pages (free)
   - Carrd ($19/year)
   - Google Site (free)
   - This is also where you'll host your privacy policy later

6. Pay the $99/year fee with your business bank account

7. Wait 24-48 hours for Apple to verify enrollment

Once approved, you have access to:
- **App Store Connect** — where you manage your app listing
- **TestFlight** — where you distribute beta builds

### Step 2.3: Set Up App Store Connect

**Estimated time:** 15 minutes

Log in to [appstoreconnect.apple.com](https://appstoreconnect.apple.com) and create your app:

1. Click "+" → "New App"

2. Fill in:
   - **Platform:** iOS
   - **Name:** ShiftWell
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** `com.shiftwell.app` (must match app.json exactly)
   - **SKU:** `shiftwell-ios-v1` (any unique string for your records)

3. Set up App Information:
   - **Category:** Health & Fitness
   - **Sub-category:** Lifestyle or Medical
   - **Content rating:** 4+

4. Add Privacy Policy URL (see Part 4)

---

## PART 3: LOCAL TESTING (Before TestFlight)

### Step 3.1: Test on Your Physical iPhone

**Estimated time:** 30 minutes | **Cost:** Free

Never ship an app you haven't used on a real phone. The simulator can't test everything — real touch, notifications, dark theme, actual performance.

**How to do it:**

1. Make sure Node.js is installed. In Terminal:
   ```
   node --version
   ```
   If you see a version number, you're good. Otherwise download from [nodejs.org](https://nodejs.org) (LTS version).

2. In Terminal, navigate to the project:
   ```
   cd path/to/ShiftWell
   npx expo start
   ```

3. On your iPhone:
   - Download the **"Expo Go"** app (free, from App Store)
   - Open your iPhone camera and point at the QR code on your computer screen
   - Tap the notification that appears

4. **Test everything like a real user:**
   - Add a shift schedule
   - Generate a sleep optimization plan
   - Export the plan to your calendar
   - Try every button and screen
   - Check text readability, dark theme, brightness in different lighting
   - Look for crashes, confusing wording, hard-to-tap buttons, slow screens

5. Write down anything that feels off. You can fix these before TestFlight.

### Step 3.2: Generate Your App Icon

**Estimated time:** 20-30 minutes | **Cost:** Free-$10

Your app icon is the first thing potential users see. A clean, professional icon builds instant trust for a health app.

**How to do it:**

1. Check the icon guide in the project for design concepts and AI prompts

2. Generate your icon using:
   - **DALL-E** (via ChatGPT) — free if you have an account
   - **Midjourney** — $10/month, often most polished
   - **Ideogram** — free tier available

3. Requirements:
   - Exactly **1024 x 1024 pixels**
   - **PNG format**
   - **No transparency** (Apple requires solid background)
   - **No rounded corners** (Apple adds them automatically)

4. Replace the placeholder:
   - Save as `icon.png`
   - Place at `assets/images/icon.png`
   - The build system automatically generates all required sizes

5. Check it at small size (home screen size). Can you still tell what it is?

---

## PART 4: TestFlight Beta Testing

### Step 4.1: Prepare for TestFlight

**Estimated time:** Varies | **Cost:** Free (included in $99/yr Apple Developer fee)

Before creating your first TestFlight build, verify these items are in place:

| Item | Status | Details |
|------|--------|---------|
| Bundle ID | Confirmed | `com.shiftwell.app` in app.json |
| App icon | Confirmed | 1024×1024 PNG, RGB, no alpha channel |
| Privacy policy | Ready to host | `PRIVACY_POLICY.md` is complete |
| Health disclaimer | In app | Displayed on first onboarding screen |
| Error handling | Implemented | Error banners + retry logic |
| Shift deletion | Needs confirmation | Add Alert dialog before deleting |

**Outstanding code items (not TestFlight blockers, fix after beta):**
- Supabase client — add graceful failure if env vars missing
- Auth screens — import colors from theme instead of hardcoding hex
- Add analytics (PostHog or TelemetryDeck)
- Google Calendar live sync (Phase 2 feature)

### Step 4.2: Install EAS CLI and Log In

**Estimated time:** 5 minutes

EAS (Expo Application Services) is the build service you'll use.

```bash
npm install -g eas-cli
eas login
```

You'll use your Expo account (free account is fine).

### Step 4.3: Configure EAS (First Time Only)

```bash
cd ShiftWell
eas build:configure
```

This links your project to your Expo account. It may update `eas.json` and `app.json` — that's normal.

### Step 4.4: Register a Physical Device (Optional but Recommended)

If you want to test on your own iPhone before going to TestFlight:

```bash
eas device:create
```

This generates a link. Open it on your iPhone's Safari, follow the prompts to install a provisioning profile. Now your device can run development and preview builds.

### Step 4.5: Create Your First Production Build

```bash
eas build --platform ios --profile production
```

This creates the real `.ipa` file that goes to TestFlight/App Store. Key details:

- Runs in the cloud — takes 10-20 minutes typically
- EAS will ask if you want it to manage credentials — **say yes**
- Will auto-increment build number on each build
- You'll get a link to track progress on [expo.dev](https://expo.dev)

### Step 4.6: Submit to TestFlight

Once the build completes:

```bash
eas submit --platform ios
```

You'll be prompted for Apple ID credentials (the email you use for Apple Developer). EAS uploads the build to App Store Connect automatically.

**First-time only:** Apple may ask you to generate an **App-Specific Password**:
1. Go to [appleid.apple.com](https://appleid.apple.com)
2. Sign-In and Security → App-Specific Passwords
3. Create one and use it when prompted by EAS

### Step 4.7: Handle Export Compliance

Log into [appstoreconnect.apple.com](https://appstoreconnect.apple.com):

1. Go to your app > TestFlight tab
2. You'll see a yellow "Missing Compliance" warning
3. Click it and answer: **"Does your app use encryption?"**
   - ShiftWell does not use custom encryption (standard HTTPS doesn't count), so select **"No"**
4. This clears the warning

**Permanent fix (for future builds):** Add this to `app.json`:
```json
"ios": {
  "infoPlist": {
    "ITSAppUsesNonExemptEncryption": false
  }
}
```

### Step 4.8: Recruit Beta Testers

**Estimated time:** 10 minutes

Aim for **5-10 people** from your ED:
- Nurses (varied shift patterns)
- Residents (tech-savvy feedback)
- Attendings (different perspective)
- Paramedics/techs (different shift structures)
- Anyone working nights or rotating shifts

**How to ask (keep it casual):**

> "Hey! I built an app that helps shift workers figure out the best times to sleep based on their schedule. Would you try it for a couple weeks and give me honest feedback? It's free, takes 2 minutes to set up, and I'll send you a TestFlight invite."

**To add testers in App Store Connect:**

1. Go to your app > TestFlight tab
2. Click **"Internal Testing"** (up to 100 testers on your team)
3. Click "+" to create a group (e.g., "Beta Testers")
4. Add tester email addresses

**For external testers** (anyone outside your team):
1. Click **"External Testing"** (up to 10,000 testers)
2. Create a group → add email addresses
3. First external build requires Apple review (24-48 hours)
4. You'll need to provide "What to Test" notes and contact email

Testers receive an invitation email. They:
- Open email on iPhone
- Download the TestFlight app (free, from Apple)
- Accept invitation
- Install ShiftWell through TestFlight

### Step 4.9: Collect and Iterate on Feedback (1-2 Weeks)

This is the most valuable phase. Real users reveal things months of development won't.

**What to do with feedback:**

1. **Collect everything.** Write down every comment, complaint, suggestion in a simple doc.

2. **Sort into three buckets:**
   - **Bugs** — "App crashed when..." or "This button doesn't work." Fix immediately.
   - **UX issues** — "I didn't understand this screen" or "Can't find where to..." Fix before launch.
   - **Feature requests** — "Would be cool if it could..." Save for v1.1. Don't build now.

3. **Implement fixes.** Describe feedback in plain language to Claude Code, work through solutions together.

4. **Send updated builds.** Your testers get a notification that an update is available.

5. **Know when to stop.** You'll never run out of feedback. Stop when testers say "yeah, this is solid."

---

## PART 5: APP STORE SUBMISSION

### Step 5.1: Create a Production Build (If Not Done in TestFlight)

```bash
eas build --platform ios --profile production
```

If you already have a recent production build from TestFlight testing, you can reuse it. Otherwise, create a fresh one.

### Step 5.2: Submit to App Store Connect

```bash
eas submit --platform ios
```

This uploads the build. This does NOT publish it — you still need to configure everything in App Store Connect first.

### Step 5.3: Prepare Your Privacy Policy

**Estimated time:** 10 minutes

Apple requires a live URL for your privacy policy.

**Options:**
- **GitHub Pages** (easiest — 5 minutes):
  1. Push `PRIVACY_POLICY.md` to your public repo
  2. Rename to `index.md` in a `/privacy` folder
  3. Enable GitHub Pages in repo Settings → Pages
  4. URL will be: `https://yourusername.github.io/ShiftWell/privacy/`
- **Alternative:** Paste contents into notion.so or a simple HTML file

**Add to App Store Connect:**
1. Go to your app > App Information
2. Add the Privacy Policy URL

### Step 5.4: Take App Store Screenshots

**Estimated time:** 30-60 minutes

You need screenshots for at least these sizes:

| Device | Size | Required? |
|--------|------|-----------|
| iPhone 6.9" (15 Pro Max) | 1320 x 2868 | Yes |
| iPhone 6.3" (15 Pro) | 1206 x 2622 | Yes |
| iPhone 6.7" (15 Plus) | 1290 x 2796 | Recommended |
| iPhone 6.5" (11 Pro Max) | 1284 x 2778 | Recommended |
| iPad 12.9" (if `supportsTablet: true`) | 2048 x 2732 | Required |

**How to get screenshots:**

1. Use iOS Simulator: Cmd+S takes a screenshot (Mac only)
2. Or take real screenshots on iPhone, crop to exact sizes
3. Tools like Fastlane Frameit or [screenshots.pro](https://screenshots.pro) add device frames and captions

**Tips:**
- Need 2-10 screenshots per size
- Show key features: schedule import, sleep recommendations, timeline view
- Screenshots sell the app — make them good

### Step 5.5: Fill in App Store Listing

Log into [appstoreconnect.apple.com](https://appstoreconnect.apple.com). Fill in:

**App Information:**
- **App name:** ShiftWell
- **Subtitle** (30 chars): e.g., "Sleep Better on Shift Work"
- **Category:** Health & Fitness
- **Privacy Policy URL:** Your hosted policy (Step 5.3)
- **Content Rights:** Confirm you own all content

**Pricing and Availability:**
- Set your price (or Free)
- Choose distribution countries

**Version Information:**
- **Description** (up to 4000 chars) — use content from `APP_STORE_LISTING.md`
- **Keywords** (up to 100 chars, comma-separated) — from `APP_STORE_LISTING.md`
- **Support URL** — your website
- **Marketing URL** (optional)

**Review Information:**
- **Contact info** for the review team
- **Notes for the reviewer** — explain what the app does, any login credentials if testers need them

### Step 5.6: Submit for Review

1. Select the build you uploaded
2. Review all information one more time
3. Choose release method:
   - **Manual** — you decide when to release after approval
   - **Automatic** — releases automatically after approval
4. Click **"Submit for Review"**

**Timeline:** Usually 24-48 hours, but can take up to a week for first submissions.

### Step 5.7: Handle App Store Review

Apple reviews thoroughly. Health apps get extra scrutiny. **If rejected:**

1. Read the rejection reason carefully — Apple tells you exactly what to fix
2. **Common health app rejections:**
   - Missing privacy policy URL — add it
   - Screenshots don't match current app — retake them
   - Health claims need disclaimers — already in `HEALTH_DISCLAIMERS.md`
   - Missing purpose strings for permissions — document why you ask for each permission
3. Fix the issue, resubmit
4. Most rejections resolve in one round

**Once approved:** Your app goes live. Take a screenshot of ShiftWell on the App Store. You earned it.

---

## PART 6: TROUBLESHOOTING & FAQ

### "What if I get rejected by Apple?"

It's normal. Even big companies get rejections. Health apps always get extra scrutiny. Apple tells you exactly why and what to fix. Common issues:

- **Missing privacy policy URL** — easy fix, use the one you already wrote
- **Screenshots don't match current app** — retake them
- **Health claims without disclaimers** — already covered in `HEALTH_DISCLAIMERS.md`
- **Missing permission purpose strings** — document why you ask for each permission

Read the reason, fix it, resubmit. Most resolve in one round.

### "What if my build fails?"

**Build fails with credential errors:**
- Run `eas credentials` to manage interactively
- Let EAS manage credentials for you if prompted

**Build fails with "Bundle Identifier Already in Use":**
- Change `bundleIdentifier` in `app.json` to something unique
- Must match what you registered in Apple Developer portal

**Icon rejected or build fails on icon:**
- Must be exactly 1024x1024 pixels
- PNG format, no transparency, no rounded corners
- Open in image editor, flatten to remove transparency, export without alpha, resize to 1024x1024

**Provisioning Profile Issues ("No matching provisioning profile"):**
- For preview/development: Make sure device is registered with `eas device:create`
- Run `eas build --clear-cache` to force fresh credentials
- Check Apple Developer portal that your App ID is registered under Identifiers

### "Do I need a lawyer?"

Not yet. The `PRIVACY_POLICY.md` and health disclaimers in the app are solid for v1 launch. They cover key legal requirements for a wellness app.

**Consider a lawyer when:**
- Revenue exceeds $10K/year
- You add features involving medical advice (not just wellness)
- You're raising outside investment
- You're collecting sensitive health data

For now, your LLC provides liability protection and disclaimers make clear the app provides general wellness information, not medical advice.

### "What about Android?"

ShiftWell is built with Expo, which is cross-platform. The same code can run on Android with minimal extra work. Launch on iOS first because:

- One platform = fewer bugs, fewer edge cases, fewer support requests
- iPhone users statistically spend more on apps
- Learn from iOS launch, apply to Android

When ready for Android, you'll need a Google Play Developer account ($25 one-time) and some Android-specific build steps.

### "When should I quit my day job?"

Don't. Not yet. Here's why:

- **Your clinical work is your competitive advantage.** You understand shift workers because you ARE one. That insight makes ShiftWell better than anything a pure tech company builds.
- **Your credibility matters.** "Built by an ER doctor who works nights" is incredibly powerful marketing.
- **Financial safety.** Don't quit until the app generates reliable income replacing your salary, OR you've raised 18+ months of funding.

Best-case scenario: Keep clinical work part-time even if the app succeeds. Stay connected to users, maintain credibility, have financial stability as the business grows.

### "How much should I charge?"

For v1 launch, consider launching free to build user base and collect feedback. Common models for health apps:

- **Freemium** — basic features free, advanced features for $4.99-9.99/month
- **One-time purchase** — $4.99-14.99
- **Free with "pro" upgrade**

Don't let pricing delay your launch. Ship it, learn from users, then decide.

### "What if nobody downloads it?"

That's okay — expected at first. App Store discovery is slow. Your first users come from:

1. Beta testers telling colleagues
2. You sharing in shift worker communities (Reddit, Facebook groups, nursing forums)
3. Word of mouth in your hospital

Focus on making the app genuinely useful for a small group first. If 50 shift workers love it, that's worth more than 5,000 one-time downloads.

### "What about iOS Simulator vs. Physical Device?"

- **Expo Go** — quickest, but doesn't support all native modules
- **iOS Simulator** — requires Mac/Xcode, good for development
- **Physical device** — real performance, real touch, real notifications — best for final testing before launch

Register your device with `eas device:create` to test preview builds.

### "EAS builds are slow"

Free Expo accounts share build infrastructure. Builds can queue 5-30 minutes. Options:

- Paid Expo plan ($99/month) gives priority builds
- Local builds on Mac with `eas build --local` (requires Xcode)

### "Missing Compliance warning on TestFlight"

Apple asks if your app uses encryption. ShiftWell doesn't use custom encryption (standard HTTPS doesn't count).

**Quick fix:** In App Store Connect, click the warning and answer "No"

**Permanent fix:** Add this to `app.json`:
```json
"ios": {
  "infoPlist": {
    "ITSAppUsesNonExemptEncryption": false
  }
}
```

### "Splash screen looks wrong"

Your splash uses `"resizeMode": "contain"` with dark background. If it looks off:
- Make sure splash image is reasonable size (logo 200x200 to 600x600)
- Background color fills screen around the image

---

## COMMAND QUICK REFERENCE

| What you want to do | Command |
|---|---|
| Start local dev server | `npx expo start` |
| Run on iOS Simulator | `npx expo start --ios` |
| Register a test device | `eas device:create` |
| Build for Simulator | `eas build --platform ios --profile development` |
| Build for physical device | `eas build --platform ios --profile preview` |
| Build for TestFlight/App Store | `eas build --platform ios --profile production` |
| Submit to App Store Connect | `eas submit --platform ios` |
| Manage signing credentials | `eas credentials` |
| Check build status | `eas build:list` |
| Run tests before committing | `npm test` |

---

## SUMMARY CHECKLIST

| # | Step | Time | Cost | Status |
|---|------|------|------|--------|
| 1 | Form your LLC | 30 min | $50-200 | [ ] |
| 2 | Get your EIN | 10 min | Free | [ ] |
| 3 | Open business bank account | 30 min | Free | [ ] |
| 4 | Get D-U-N-S number | 5 min + 1-5 days | Free | [ ] |
| 5 | Enroll in Apple Developer | 15 min + 1-5 days | $99/year | [ ] |
| 6 | Set up App Store Connect | 15 min | Free | [ ] |
| 7 | Test on physical iPhone | 30 min | Free | [ ] |
| 8 | Generate app icon | 20-30 min | Free-$10 | [ ] |
| 9 | Install EAS CLI | 5 min | Free | [ ] |
| 10 | Register test device | 5 min | Free | [ ] |
| 11 | Recruit beta testers | 10 min | Free | [ ] |
| 12 | Create TestFlight build | 15-30 min | Free | [ ] |
| 13 | Submit to TestFlight | 10 min | Free | [ ] |
| 14 | Iterate on feedback | 1-2 weeks | Free | [ ] |
| 15 | Take App Store screenshots | 30-60 min | Free | [ ] |
| 16 | Prepare privacy policy | 10 min | Free | [ ] |
| 17 | Submit to App Store | 2-3 hours | Free | [ ] |
| 18 | Handle App Store review | 1-3 days | Free | [ ] |

**Total active time:** 6-8 hours over 2-3 weeks
**Total cost:** ~$250-400 plus $99/year for Apple

---

**You've already done the hardest part — you built an app. Everything from here is paperwork and clicking buttons. One step at a time. Let's go.**

---

Created: 2026-04-05
Last Reviewed: 2026-04-05
Last Edited: 2026-04-05
Review Notes: Consolidated from 4 launch files (FOUNDER_ACTION_GUIDE.md, SIM_ACTION_PLAN.md, TESTFLIGHT_CHECKLIST.md, DEPLOYMENT_GUIDE.md). Eliminated duplicates, preserved all unique content, organized into logical sections: Business Formation, Apple Developer Setup, Local Testing, TestFlight, App Store Submission, Troubleshooting.
