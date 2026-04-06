# ShiftWell — TestFlight Readiness Checklist
> Generated: 2026-03-23 | Branch: fix/testflight-blockers

---

## Status: Fixed in This Session (Code)

| Blocker | Status | Details |
|---------|--------|---------|
| Bundle ID | ✅ Already correct | `com.shiftwell.app` in app.json — was fixed in a prior session |
| App icon | ✅ Already correct | `assets/images/icon.png` — 1024×1024, RGB, no alpha channel |
| Splash screen | ✅ Already correct | `assets/images/splash-icon.png` — 1024×1024, has alpha (fine for splash, only icon matters) |
| Privacy policy | ✅ Already correct | `PRIVACY_POLICY.md` — real name (Dr. Gursimran Singh), real email (shiftwell.app@gmail.com) |
| Health disclaimer | ✅ Already in app | `app/(onboarding)/welcome.tsx` — disclaimer text displayed on first onboarding screen |
| Plan error banner | ✅ Already in app | `app/(tabs)/index.tsx` — shows error + retry when plan generation fails |
| ICS import premium gate | ✅ Already free | `src/lib/premium/entitlements.ts` — all features free (committee decision) |
| Stale closure in useTodayPlan | ✅ Already fixed | `tick` is in useMemo deps array |
| Schedule empty state | ✅ Already exists | `app/(tabs)/schedule.tsx` — empty state with CTA |
| Progress bar step count | ✅ Already correct | 6 onboarding screens = totalSteps={6} |
| **ICS parser crash** | ✅ **Fixed this session** | Per-event try/catch + null checks for startDate/endDate + isNaN guards |
| **hasPets algorithm** | ✅ **Fixed this session** | Night-shift sleep end capped 30 min earlier when hasPets = true |
| **Paywall CTA buttons** | ✅ **Fixed this session** | Alert.alert() with "Coming Soon / 100% free" messaging |

---

## Requires Manual Action (Sim's Action Items)

### 1. Apple Developer Account ($99/year)
- [ ] Go to developer.apple.com/programs/enroll/
- [ ] Sign in with Apple ID
- [ ] Choose "Individual" or "Organization" (Organization requires D-U-N-S number)
- [ ] Pay $99/year fee
- [ ] Wait 24-48h for approval

### 2. App Store Connect Setup (after Apple Dev enrollment)
- [ ] Log in to appstoreconnect.apple.com
- [ ] Click "+" → "New App"
- [ ] Fill out:
  - **Platform**: iOS
  - **Name**: ShiftWell
  - **Primary language**: English (U.S.)
  - **Bundle ID**: `com.shiftwell.app` (must match app.json exactly)
  - **SKU**: `shiftwell-ios-v1` (any unique string)
- [ ] Set up App Information:
  - Category: Health & Fitness
  - Sub-category: Lifestyle
  - Content rating: 4+
- [ ] Add Privacy policy URL (see below)

### 3. Privacy Policy URL
The `PRIVACY_POLICY.md` is complete and ready to host. Options:
- **GitHub Pages** (easiest — 5 min):
  1. Push `PRIVACY_POLICY.md` to the ShiftWell public repo
  2. Rename to `index.md` in a `/privacy` folder
  3. Enable GitHub Pages in repo Settings → Pages
  4. URL will be: `https://gursimransinghem.github.io/ShiftWell/privacy/`
- **Alternative**: Paste contents into a free site like notion.so or use a simple HTML file

### 4. EAS Build Setup
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure (first time only)
eas build:configure

# Build for TestFlight
eas build --platform ios --profile preview
```
Requires: Apple Developer enrollment + Xcode on a Mac (or EAS cloud build)

### 5. TestFlight Distribution
- [ ] Upload build via `eas submit` or Xcode Organizer
- [ ] In App Store Connect → TestFlight:
  - Add yourself as internal tester first
  - Add beta testers (up to 10,000 with external testing)
  - For external testers: requires Apple's TestFlight beta review (~1 day)
- [ ] Share TestFlight link with ED colleagues

### 6. App Store Connect Metadata (needed before submission, not TestFlight)
- [ ] Screenshots: 6.7" iPhone (required), 6.5" iPhone
- [ ] App preview video (optional but recommended)
- [ ] Description (from APP_STORE_LISTING.md)
- [ ] Keywords (from APP_STORE_LISTING.md)
- [ ] Support URL
- [ ] Marketing URL (optional)

---

## Outstanding Code Issues (Not TestFlight Blockers, Fix in Next Session)

| Issue | Priority | File | Fix |
|-------|----------|------|-----|
| Shift deletion — no confirmation dialog | HIGH | `app/(tabs)/schedule.tsx` | Add `Alert.alert('Delete shift?', ...)` |
| Supabase client — silent crash if env vars missing | HIGH | `src/lib/supabase/client.ts` | Check for vars at startup, disable gracefully |
| Auth screens — hardcoded hex colors | MEDIUM | `app/(auth)/sign-in.tsx`, `sign-up.tsx` | Import from theme tokens |
| No analytics | MEDIUM | — | Add PostHog or TelemetryDeck (5 lines of code) |
| Google Calendar live sync | LOW | — | Phase 2 feature, ICS import is fine for beta |

---

## Quick Reference: Key Files

```
app.json                           → Bundle ID, version, icon paths, permissions
assets/images/icon.png             → 1024×1024 RGB no-alpha ✅
assets/images/splash-icon.png      → 1024×1024 (alpha OK for splash) ✅
PRIVACY_POLICY.md                  → Complete, needs URL hosting
src/lib/calendar/ics-parser.ts     → Fixed: null-safe per-event parsing
src/lib/circadian/sleep-windows.ts → Fixed: hasPets wired to algorithm
app/paywall.tsx                    → Fixed: CTA buttons show Alert
src/lib/premium/entitlements.ts    → All features free for v1 launch
```

---
*Branch: fix/testflight-blockers | Commit: 138b572*
