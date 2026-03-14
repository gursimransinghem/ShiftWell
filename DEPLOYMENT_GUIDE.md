# ShiftWell Deployment Guide

A practical, step-by-step guide to getting ShiftWell onto TestFlight and eventually the App Store. Written for someone who has never deployed an iOS app before.

---

## Table of Contents

1. [Pre-Flight Checklist](#pre-flight-checklist)
2. [First TestFlight Build](#step-by-step-first-testflight-build)
3. [App Store Submission](#step-by-step-app-store-submission)
4. [Common Issues & Troubleshooting](#common-issues--troubleshooting)
5. [Local Development Testing](#local-development-testing)

---

## Pre-Flight Checklist

Before you can build and submit anything, you need these things in place:

### 1. Apple Developer Account ($99/year)

- Go to https://developer.apple.com/programs/ and enroll.
- Use your personal Apple ID or create a new one for the business.
- Enrollment takes **up to 48 hours** to be approved.
- Once approved, note your **Apple Team ID** (found under Membership in the developer portal).

### 2. App Store Connect Setup

- Log in to https://appstoreconnect.apple.com.
- Click the "+" button and select "New App".
- Fill in:
  - **Platform:** iOS
  - **Name:** ShiftWell
  - **Primary Language:** English (U.S.)
  - **Bundle ID:** `com.nightshift.app` (register this first under Certificates, Identifiers & Profiles in the developer portal)
  - **SKU:** `nightshift-app` (any unique string, for your records only)
- After creating the app, note the **Apple ID** (a numeric ID shown on the App Information page) — this is your `ascAppId`.

### 3. Fill In Missing eas.json Credentials

Your `eas.json` has three empty fields under `submit.production.ios` that **must** be filled in before you can submit:

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your-apple-id@email.com",
      "ascAppId": "1234567890",
      "appleTeamId": "ABCDE12345"
    }
  }
}
```

| Field | Where to find it |
|-------|------------------|
| `appleId` | The email address you use to log into Apple Developer |
| `ascAppId` | App Store Connect > Your App > App Information > Apple ID (a number like `1234567890`) |
| `appleTeamId` | Apple Developer portal > Membership > Team ID (a 10-character string like `ABCDE12345`) |

### 4. Expo Account

- Create a free account at https://expo.dev if you don't have one.
- You will log in with this during the build process.

### 5. Asset Requirements (Already Done)

Your project already has these required assets in `assets/images/`:
- `icon.png` — App icon (should be 1024x1024, no transparency, no rounded corners)
- `splash-icon.png` — Splash screen image
- `favicon.png` — Web favicon

**Double-check:** Your `icon.png` must be exactly **1024x1024 pixels**, with **no transparency** and **no alpha channel**. Apple will reject builds if this is wrong. You can verify with any image editor.

### 6. Node.js and Tools

- Node.js 18+ installed on your machine
- Git installed
- A Mac is **not** required for EAS builds (they run in the cloud), but you will need one for local development builds on a simulator.

---

## Step-by-Step: First TestFlight Build

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

This is Expo's build service command-line tool. You only need to install it once.

### Step 2: Log In to Expo

```bash
eas login
```

Enter your Expo account email and password.

### Step 3: Configure the Project

```bash
cd nightshift
eas build:configure
```

This links your local project to your Expo account. It may update `eas.json` and `app.json` — that's normal.

### Step 4: Run a Development Build (Optional but Recommended)

This creates a build you can install on your **iOS Simulator** to test with:

```bash
eas build --platform ios --profile development
```

- Your current `eas.json` development profile has `"simulator": true`, so this will produce a simulator build.
- If you want to test on a **physical iPhone** during development, change `"simulator": false` in the development profile and register your device (see Step 4a below).

#### Step 4a: Register a Test Device (for physical iPhone testing)

```bash
eas device:create
```

This generates a link. Open it on your iPhone's Safari, follow the prompts to install a provisioning profile. This registers your device's UDID with Apple so it can run development/preview builds.

### Step 5: Create a Preview Build (Internal Testing)

```bash
eas build --platform ios --profile preview
```

- This creates a real `.ipa` file you can install on **registered physical devices**.
- The `preview` profile uses `"distribution": "internal"`, meaning it uses ad-hoc provisioning (limited to registered devices, no TestFlight needed).
- Good for quick testing before going through TestFlight.
- EAS will handle all provisioning profiles and certificates automatically — just follow the prompts.

### Step 6: Create a Production Build (for TestFlight)

```bash
eas build --platform ios --profile production
```

- This creates the actual build that will go to TestFlight/App Store.
- The `production` profile has `"autoIncrement": true`, so the build number will automatically increase with each build. No need to manually update it.
- EAS will ask if you want it to manage your credentials — **say yes**. It will create the necessary certificates and provisioning profiles for you.
- The build runs in the cloud and typically takes **10-20 minutes**.
- You'll get a link to track progress on https://expo.dev.

### Step 7: Submit to TestFlight

Once the production build completes:

```bash
eas submit --platform ios
```

- You will be prompted for your Apple ID credentials (the ones you put in `eas.json`).
- EAS uploads the build to App Store Connect automatically.
- **Important:** The first time you submit, Apple may ask you to generate an **App-Specific Password** at https://appleid.apple.com (under Sign-In and Security > App-Specific Passwords). Create one and use it when prompted.

### Step 8: Handle Export Compliance

After submission, log in to App Store Connect:
1. Go to your app > TestFlight tab.
2. You'll likely see a yellow "Missing Compliance" warning.
3. Click it and answer: **"Does your app use encryption?"**
   - ShiftWell does not appear to use custom encryption, so select **"No"** (standard HTTPS doesn't count).
4. This clears the warning and makes the build available for testing.

### Step 9: Invite Beta Testers

In App Store Connect:
1. Go to your app > TestFlight tab.
2. Click **"Internal Testing"** in the sidebar.
3. Click the "+" to create a new group (e.g., "Alpha Testers").
4. Add testers by email — they'll receive an invitation to install TestFlight and your app.
5. Internal testers (up to 100) must be part of your App Store Connect team.

For **External Testing** (up to 10,000 testers, anyone with an email):
1. Click "External Testing" > create a group > add testers.
2. External builds require a **brief Apple review** (usually 24-48 hours for the first one).
3. You'll need to fill in: "What to Test" notes and a contact email.

---

## Step-by-Step: App Store Submission

### Step 1: Production Build

```bash
eas build --platform ios --profile production
```

Same command as TestFlight. If you already have a recent production build, you can skip this.

### Step 2: Submit to App Store Connect

```bash
eas submit --platform ios
```

This uploads the build. It does NOT publish it — you still need to configure everything in App Store Connect.

### Step 3: Configure in App Store Connect

Log in to https://appstoreconnect.apple.com and fill in everything for your app:

**App Information:**
- App name: ShiftWell
- Subtitle (30 chars max): e.g., "Sleep Better on Shift Work"
- Category: Health & Fitness
- Secondary Category: Medical (optional)
- Privacy Policy URL (required): You need a hosted privacy policy page
- Content Rights: Confirm you own or have rights to all content

**Pricing and Availability:**
- Set your price (or Free)
- Choose which countries to distribute in

### Step 4: Screenshots (Required)

You need screenshots for at least these sizes:

| Device | Size (pixels) | Required? |
|--------|---------------|-----------|
| iPhone 6.9" (iPhone 16 Pro Max) | 1320 x 2868 | Yes |
| iPhone 6.3" (iPhone 16 Pro) | 1206 x 2622 | Yes |
| iPhone 6.7" (iPhone 15 Plus) | 1290 x 2796 | Recommended |
| iPhone 6.5" (iPhone 11 Pro Max) | 1284 x 2778 | Recommended |
| iPhone 5.5" (iPhone 8 Plus) | 1242 x 2208 | Yes (if supporting) |
| iPad 12.9" (if supporting tablet) | 2048 x 2732 | Required if `supportsTablet: true` |

**Important:** Your `app.json` has `"supportsTablet": true`. This means you must provide iPad screenshots too, or change it to `false` if you don't want to support iPad yet.

**Tips:**
- You need 2-10 screenshots per size.
- Use the iOS Simulator to take screenshots (Cmd+S in Simulator).
- Tools like Fastlane Frameit or https://screenshots.pro can add device frames and captions.
- Screenshots sell your app — show the key features (schedule import, sleep recommendations, timeline view).

### Step 5: Submit for Review

In App Store Connect:
1. Go to your app > iOS App section.
2. Select the build you uploaded.
3. Fill in the "Version Information":
   - Description (up to 4000 chars)
   - Keywords (up to 100 chars, comma-separated)
   - Support URL
   - Marketing URL (optional)
4. Fill in the "Review Information":
   - Contact info for the review team
   - Notes for the reviewer (explain what the app does, any login credentials if needed)
5. Set the release method: Manual or Automatic after approval.
6. Click **"Submit for Review"**.

**Review timeline:** Typically 24-48 hours, but can take up to a week for first submissions.

---

## Common Issues & Troubleshooting

### "Missing Compliance" Warning on TestFlight

**What it means:** Apple requires you to declare whether your app uses encryption.

**Fix:** In App Store Connect > TestFlight > click the warning > answer "No" (unless you use custom encryption beyond standard HTTPS).

**Permanent fix:** Add this to the `ios.infoPlist` section of your `app.json`:
```json
"ITSAppUsesNonExemptEncryption": false
```
This auto-answers the question for future builds.

### Build Fails with Credential Errors

**What it means:** EAS couldn't create or find signing certificates.

**Fixes:**
- Run `eas credentials` to manage your certificates interactively.
- If prompted, let EAS manage credentials for you (select "Let Expo handle it").
- If you have existing certificates from another tool, you may need to revoke them first in the Apple Developer portal under Certificates.

### Build Fails with "Bundle Identifier Already in Use"

**What it means:** Another app or developer already registered `com.nightshift.app`.

**Fix:** Change `bundleIdentifier` in `app.json` to something unique, like `com.yourname.nightshift`.

### Icon Rejected or Build Fails on Icon

**Requirements for `icon.png`:**
- Exactly 1024x1024 pixels
- PNG format
- No transparency (no alpha channel)
- No rounded corners (Apple adds them automatically)

**Fix:** Open your icon in an image editor, flatten it to remove transparency, export as PNG without alpha, resize to 1024x1024.

### Provisioning Profile Issues

**Symptoms:** "No matching provisioning profile" or device can't install the build.

**Fixes:**
- For `preview`/`development` profiles: Make sure your device is registered with `eas device:create`.
- Run `eas build --clear-cache` to force fresh credentials.
- In Apple Developer portal, check that your App ID (`com.nightshift.app`) is registered under Identifiers.

### Splash Screen Issues

Your splash screen uses `"resizeMode": "contain"` with a dark background (`#0A0E1A`). If it looks wrong:
- Make sure `splash-icon.png` is a reasonable size (a centered logo works best, around 200x200 to 600x600).
- The background color fills the rest of the screen around the image.

### EAS Build Queue is Slow

- Free Expo accounts share build infrastructure. Builds can queue for 5-30 minutes.
- A paid Expo plan ($99/month for Production) gives priority builds.
- You can also run local builds on a Mac with `eas build --local` (requires Xcode installed).

### iPad Support Considerations

Your `app.json` has `"supportsTablet": true`. This means:
- Apple requires iPad screenshots for App Store submission.
- Your app must look reasonable on iPad screens.
- If you're not ready for iPad, set `"supportsTablet": false` to simplify your first submission.

---

## Local Development Testing

### Option 1: Expo Go (Quickest, with Limitations)

Expo Go is a pre-built app that can run your project without a custom build.

1. Install **Expo Go** from the App Store on your iPhone.
2. On your computer, in the `nightshift` directory, run:
   ```bash
   npx expo start
   ```
3. Scan the QR code shown in the terminal with your iPhone camera.
4. The app opens in Expo Go.

**Limitations:** Expo Go does not support all native modules. If your app uses native features not included in Expo Go, you'll see errors. In that case, use a development build instead.

### Option 2: iOS Simulator (Mac Required)

1. Install Xcode from the Mac App Store (free, but large download ~12GB).
2. Open Xcode at least once to accept the license and install components.
3. Run:
   ```bash
   npx expo start --ios
   ```
4. This automatically opens the iOS Simulator and loads your app.

### Option 3: Development Build on Physical iPhone (Best for Real Testing)

1. Register your device:
   ```bash
   eas device:create
   ```
2. Update the `development` profile in `eas.json` to allow physical devices:
   ```json
   "development": {
     "developmentClient": true,
     "distribution": "internal",
     "ios": {
       "simulator": false
     }
   }
   ```
   (Or create a separate profile that keeps `simulator: true` and add a `development-device` profile with `simulator: false`.)
3. Build:
   ```bash
   eas build --platform ios --profile development
   ```
4. Once the build finishes, you'll get a QR code or link. Open it on your iPhone to install.
5. Then run the dev server:
   ```bash
   npx expo start --dev-client
   ```
6. Open the installed "ShiftWell" app on your phone — it will connect to the dev server and show your app with live reloading.

### Debugging Tips

- **Shake your iPhone** (or press Cmd+D in Simulator) to open the React Native dev menu.
- **Console logs:** Visible in the terminal where you ran `npx expo start`.
- **React Native Debugger:** Press "j" in the terminal to open the JavaScript debugger in Chrome.
- **Network issues:** Make sure your phone and computer are on the same Wi-Fi network.
- **Clear caches** if things get weird:
  ```bash
  npx expo start --clear
  ```

---

## Quick Reference: Command Cheat Sheet

| What you want to do | Command |
|---|---|
| Start local dev server | `npx expo start` |
| Run on iOS Simulator | `npx expo start --ios` |
| Register a test device | `eas device:create` |
| Build for Simulator | `eas build --platform ios --profile development` |
| Build for physical device (internal) | `eas build --platform ios --profile preview` |
| Build for TestFlight / App Store | `eas build --platform ios --profile production` |
| Submit to App Store Connect | `eas submit --platform ios` |
| Manage signing credentials | `eas credentials` |
| Check build status | `eas build:list` |
| Run tests before committing | `npx jest` |
