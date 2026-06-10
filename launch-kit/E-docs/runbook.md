# ShiftWell Internal Operations Runbook

**Status:** Initial creation — Launch phase (Pre-TestFlight)  
**Audience:** Founder/Solo Developer (Dr. Gursimran Singh, DO)  
**Version:** 1.0

---

## Executive Summary

This runbook covers day-to-day operations for ShiftWell from TestFlight through App Store launch and post-launch monitoring. It is designed for solo-founder operation with clear checklists, severity definitions, and escalation procedures.

**Stack:**
- Mobile: Expo 55.0.6, React Native 0.83.2 | Bundle ID: `com.shiftwell.app`
- Backend: Express 4.x API (api/ directory)
- Database: Supabase (migrations in supabase/ directory)
- Build: EAS Build (eas.json configured)
- Testing: Jest, 1,059 tests, 71 suites (all must pass pre-deployment)

---

## 1. Deploy Procedure

### 1.1 Mobile App: EAS Build → TestFlight → App Store

#### Pre-Deploy Checklist

1. **Run full test suite** — must pass 100%
   ```bash
   npm test
   ```
   - All 1,059 tests must pass
   - If tests fail, fix before proceeding
   - Commit all test fixes

2. **Update version numbers**
   - Edit `app.json`: increment `version` and `ios.build`
   - Example: `1.0.0` → `1.0.1` (patch) or `1.1.0` (minor)
   - Push to Git

3. **Update CHANGELOG**
   - Document what changed in this version
   - Format: date, version, features/fixes, known issues
   - Example:
     ```markdown
     ## 1.0.1 — 2026-04-19
     - Fix: Calendar sync hangs on large calendars
     - Fix: WHOOP connection drops after 12 hours
     - Perf: Reduce algorithm computation by 20%
     ```

4. **Verify dark mode UI**
   - Test on device/simulator in Settings > Display > Dark Appearance
   - Ensure all screens render correctly in dark mode

5. **Validate bundle ID**
   - Confirm `app.json` has `bundleIdentifier: "com.shiftwell.app"`

6. **Check critical features**
   - Sleep algorithm generates output correctly
   - Calendar sync works end-to-end
   - Premium features gate correctly
   - Login/signup flow completes
   - Crash reporting initialized

#### Build for Production

```bash
# Make sure you're on main branch
git checkout main
git pull origin main

# Build for iOS production profile
eas build --platform ios --profile production
```

- Build takes ~15–20 minutes
- Monitor progress at https://expo.dev (dashboard)
- When complete, binary is automatically uploaded to App Store Connect

#### TestFlight Setup

1. Go to https://appstoreconnect.apple.com
2. Navigate to: **My Apps → ShiftWell → TestFlight**
3. Add build to TestFlight group
   - Click the new build number
   - Under "Build Testing", check "External Testing"
   - Add test groups (e.g., "Beta Testers", "Family", "Team")
   - Add tester email addresses
4. Testers receive invitation link via TestFlight app on iOS
5. Monitor crash reports in **Crashes** tab during 2–7 day review window

#### App Store Submission

1. Navigate to https://appstoreconnect.apple.com
2. Go to: **My Apps → ShiftWell → App Store**
3. Verify or update:
   - **App Information:** name, subtitle, description (use `docs/launch/APP_STORE_LISTING.md`)
   - **Screenshots:** one screenshot per device size (iPhone, iPad if applicable)
   - **Preview:** optional 30-second video
   - **Keywords:** search terms (e.g., sleep, circadian, shift work, scheduling)
   - **Category:** Health & Fitness
   - **Ratings:** health/medical claims aligned with `docs/launch/HEALTH_DISCLAIMERS.md`
4. Review privacy practices (linked to `docs/launch/PRIVACY_POLICY.md`)
5. Click **Save** → **Submit for Review**
6. Apple review takes 24–48 hours
7. Check email for approval or rejection; respond to any questions

#### Post-Deploy Monitoring (First 48 Hours)

- **Crash Reports:** Check App Store Connect **Crashes** tab every 2–4 hours
  - If crash rate > 1% of sessions: P0 incident (see Section 2)
- **Supabase Logs:** Check realtime logs for errors
  - Navigate to Supabase dashboard → **Logs** → filter by `error`
  - Look for failed API calls, database constraints, RLS violations
- **API Health:** Verify health endpoint responds
  ```bash
  curl https://<api-url>/health
  ```
  - Expected response: `{ "status": "ok" }`
- **User Reports:** Monitor App Store reviews daily (first 14 days)
  - Respond publicly to critical issues within 24 hours
  - Acknowledge bugs, provide ETA for fix

### 1.2 API Deployment

#### Pre-Deploy

1. **Test locally**
   ```bash
   npm test --prefix api/
   # All tests must pass
   ```

2. **Verify environment variables**
   - API must have: `SUPABASE_URL`, `SUPABASE_KEY`, `NODE_ENV`
   - Check hosting platform's environment variable settings

3. **Review database migrations** (if any)
   - Check `supabase/migrations/` for new .sql files
   - Test migration on staging first
   - Plan rollback migration if needed

#### Deploy

1. **Run pending migrations**
   ```bash
   npx supabase migration up
   # Verify migration success in Supabase dashboard
   ```

2. **Deploy API to hosting platform**
   - If using Vercel: push to `main` branch (auto-deploys)
   - If using self-hosted: build and deploy using platform's CI/CD
   - If using Heroku/Railway: push to deploy remote
   - Monitor deployment logs for errors

3. **Verify health endpoint**
   ```bash
   curl https://<api-domain>/health
   # Should return 200 OK with { "status": "ok" }
   ```

4. **Smoke test critical endpoints**
   - POST `/auth/signup` → verify user creation in Supabase
   - POST `/sleep/calculate` → verify algorithm runs and returns data
   - GET `/calendar/events` → verify calendar sync works

#### Post-Deploy

- **Monitor error rates** — check API logs for 500, 502, 503 errors
- **Check database connections** — ensure connection pool is stable
- **Verify RLS policies** — ensure data isolation is working (run a test query)

---

## 2. Incident Response

### 2.1 Severity Levels

| Level | Definition | Response Window | Example |
|-------|-----------|-----------------|---------|
| **P0** | App crash on launch, data loss, security breach, service down | Within 30 min | App crashes every time user opens it; user session data deleted; auth token leaked |
| **P1** | Core feature broken (sleep algorithm, calendar sync, login), API down | Within 1 hour | Sleep algorithm returns null; calendar won't sync; API returns 500; can't save preferences |
| **P2** | Non-critical feature broken, UI bug, performance degradation | Within 24 hours | Typo in sleep duration display; button animation stutters; notification 2 seconds late |
| **P3** | Minor cosmetic issue, edge case, documentation error | Next sprint | Spelling error in onboarding; edge case with dates 50 years in future; FAQ typo |

### 2.2 Incident Detection

**Sources:**
- App Store **Crashes** tab (auto-detected)
- Supabase **Logs** tab (error spikes)
- App Store **Reviews** (user complaints)
- GitHub issues / user support email
- Sentry or crash reporting service (if integrated)
- Manual testing or regression reports

### 2.3 Incident Response Flow

#### Step 1: Detect & Assess (0–5 min)

1. **Confirm the issue**
   - Is it reproducible?
   - What's the scope? (all users? specific device? specific workflow?)
   - Check crash rate: `App Store Connect → Crashes` or `Supabase → Logs`

2. **Determine severity**
   - Use severity matrix (Section 2.1)
   - When in doubt, escalate up (e.g., P2 → P1)

3. **Document initial findings**
   - Note time detected, affected feature, error message/stack trace, estimated scope
   - Example:
     ```
     2026-04-19 14:32 UTC | P1: Sleep Algorithm Broken
     Error: "Cannot read property 'bedtime' of undefined"
     Scope: All users on v1.0.1
     Stack: src/lib/circadian/algorithm.ts:42
     First report: 2026-04-19 14:15 UTC
     Crash count: 312 in last 20 minutes
     ```

#### Step 2: P0 Response (Immediate)

If **P0 (app crash, data loss, security breach):**

1. **Declare incident** — document start time, severity, brief description

2. **Immediate rollback** (choose one based on change type)

   **Option A: JavaScript-only change** (UI, logic, non-native)
   ```bash
   # Find last known good build/version
   # Create a branch with the previous code
   git checkout v1.0.0  # last stable tag
   
   # Deploy an OTA (over-the-air) update
   eas update --branch production --message "Hotfix: revert to v1.0.0"
   ```
   - Users get update on next app launch (no App Store review needed)
   - Fastest rollback method (~10 minutes)

   **Option B: Native code or build issue** (cannot OTA)
   ```bash
   # Revert code and build new native binary
   git revert <bad-commit-hash>  # or reset to last tag
   eas build --platform ios --profile production
   # Build takes ~15 min, upload ~2 min, then submit to App Store
   # Request expedited review in App Store Connect (mention P0)
   ```
   - Takes 45–90 minutes (build + upload + expedited review)
   - If expedited review is rejected: post to reviews acknowledging issue + ETA

3. **Notify affected users** (if P0)
   - Post to App Store reviews: "We're aware of the crash; rollback deployed. Update via TestFlight/App Store or force quit the app."
   - If data loss: offer support (email, refund if premium charged)

4. **Pause traffic** (if security breach)
   - Disable logins: set `auth.enabled = false` in Supabase via SQL
   - Block API: return 503 on non-health endpoints
   - Post banner: "We're securing your account. Back online in 10 minutes."

#### Step 3: P1 Response (1 Hour)

If **P1 (core feature broken):**

1. **Investigate** (~30 minutes)
   - Reproduce on simulator/device
   - Check Supabase logs, API error rates, RLS policies
   - Identify root cause (code change, database schema, API, environment)

2. **Hotfix** (~20 minutes)
   - Make minimal change to fix issue
   - Test locally: `npm test` (all tests must pass)
   - Commit with message: `hotfix: [P1 issue name]`

3. **Deploy** (see Step 2, Option A or B based on change type)

4. **Verify** (~10 minutes)
   - Test the fix on TestFlight or fresh build
   - Confirm feature works end-to-end
   - Check crash rate returns to baseline

#### Step 4: P2 Response (24 Hours)

If **P2 (non-critical broken feature):**

1. **Investigate** same day
2. **Create bug ticket** for next release
3. **Workaround** if possible (document in release notes)
4. **Plan fix** for next sprint
5. **No immediate rollback** required

#### Step 5: P3 Response (Next Sprint)

If **P3 (minor issue):**

1. **Log in issue tracker**
2. **Add to backlog** (prioritize after P0–P2 items)
3. **No rollback needed**

### 2.4 Post-Incident Postmortem

Within 24 hours of resolution, write a brief postmortem (1 page):

**Format:**
```markdown
## Postmortem: [Issue Title]

**Date:** 2026-04-19  
**Severity:** P1  
**Duration:** 45 min (2026-04-19 14:32–15:17 UTC)

### What Happened
Sleep algorithm crashed with "Cannot read property 'bedtime' of undefined" 
for all users on v1.0.1. Affected 312 sessions in 20 minutes.

### Root Cause
Code change in src/lib/circadian/algorithm.ts line 42:
- Removed null check on user preference object
- Regression test suite missed this edge case

### Impact
- 312 users saw app crash on open
- ~5 users unable to view sleep plan
- 1 user requested refund (approved)

### Resolution
- Deployed OTA rollback to v1.0.0 in 10 minutes
- Users updated on next app launch
- Fixed in v1.0.2 with improved null-safety tests

### Prevention
- Add pre-commit hook to run `npm test` automatically
- Add regression test for null/undefined user preferences
- Code review checklist to verify null checks on user data

### Action Items
- [ ] Add regression test (by 2026-04-21)
- [ ] Setup pre-commit hooks (by 2026-04-21)
- [ ] Update code review template (by 2026-04-20)
```

---

## 3. Support SOPs

### 3.1 Handling User Reports

#### Daily Review (First 14 Days Post-Launch)

1. Open https://appstoreconnect.apple.com
2. Navigate to: **My Apps → ShiftWell → Reviews**
3. Filter by: **Rating: 1–3 stars** (negative feedback)
4. Read each review and categorize

#### Common Issues & Responses

##### Issue: "Can't log in / Stuck on sign-up"

**Root causes:**
- Apple ID sign-in failure (OAuth)
- Email verification not arriving
- RLS policy blocking user creation

**Response template:**
```
Thank you for reporting! We're sorry you're having trouble.

Please try:
1. Force-close the app (swipe from top-right corner)
2. Try again
3. If still stuck, try signing up with a different email

If this persists, we'd love to help — email us at support@shiftwell.com 
with the error message you see. We typically respond within 24 hours.
```

**Backend fix:**
- Check Supabase: **SQL Editor** → run query to verify user row
- Check RLS policies: `Database → Policies` → verify INSERT policy allows new users
- Check email service: Supabase **Auth → Logs** for email send failures

##### Issue: "Calendar won't sync / Events not showing"

**Root causes:**
- Permission not granted (iOS privacy)
- Calendar ID not saved in database
- Sync endpoint timing out

**Response template:**
```
Thanks for reaching out! Calendar sync relies on permission from your iPhone.

Please check:
1. Settings → ShiftWell → Calendars → toggle ON
2. Go back to the app and open the Calendar tab
3. Tap "Sync" button if visible

If events still don't appear, try:
- Force-close and reopen the app
- Sign out, then sign back in

Still having trouble? Email support@shiftwell.com with a screenshot.
```

**Backend fix:**
- Check Supabase **Logs** for sync job errors
- Query user's calendar metadata: `SELECT * FROM user_calendars WHERE user_id = 'xyz'`
- Test sync endpoint locally

##### Issue: "WHOOP integration disconnected / Won't reconnect"

**Root causes:**
- OAuth token expired
- WHOOP API down
- RLS policy blocking token storage

**Response template:**
```
WHOOP integrations can sometimes disconnect. Here's how to fix:

1. Go to Settings → Connected Apps
2. Tap "WHOOP" → "Disconnect"
3. Tap "Connect WHOOP" again
4. Complete the WHOOP login
5. Back in ShiftWell, tap "Refresh" to sync your latest data

If this doesn't work, you can still use ShiftWell without WHOOP — 
just enter your sleep manually. Email us at support@shiftwell.com if you need help.
```

**Backend fix:**
- Check Supabase for token: `SELECT whoop_access_token FROM integrations WHERE user_id = 'xyz'`
- Check WHOOP API status at whoop.com/status
- If token expired, trigger re-auth flow

##### Issue: "Sleep score / recommendations don't make sense"

**Root causes:**
- User misunderstood algorithm output
- Edge case in calculation
- Timezone issue

**Response template:**
```
ShiftWell uses a science-backed sleep optimization algorithm 
to personalize recommendations for shift workers.

Your sleep score is based on:
- Sleep duration vs. your target
- Sleep timing (aligned to your circadian rhythm)
- Recovery from consecutive night shifts

The algorithm learns from your sleep patterns, so it may adjust 
recommendations over time as it gathers more data.

Questions about a specific recommendation? Email support@shiftwell.com 
with a screenshot, and we'll explain our thinking.
```

**Backend investigation:**
- Check algorithm inputs: `SELECT * FROM user_sleep_logs WHERE user_id = 'xyz' ORDER BY date DESC LIMIT 7`
- Check timezone: `SELECT timezone FROM users WHERE id = 'xyz'`
- Reproduce in simulator with same user data
- Verify algorithm logic in `src/lib/circadian/algorithm.ts`

##### Issue: "Charged but didn't get premium / Can't download the app"

**Billing (IAP handled by Apple):**
```
Hi! ShiftWell uses Apple's App Store billing, so refunds are handled by Apple.

To request a refund:
1. Open App Store app
2. Tap your profile (top right)
3. Tap "Purchases"
4. Find "ShiftWell Premium"
5. Tap "Problem" → request refund

Apple typically responds within 24–48 hours. 
If you have questions about the app itself, email us at support@shiftwell.com.
```

**Download issues:**
- Likely iOS version incompatibility or region restriction
- Verify in App Store Connect: **App Information → General → Minimum OS** is set correctly
- Check if user is in region where app is available (no restrictions in app.json)

### 3.2 Support Email Template Responses

Save these as templates in email client for fast responses:

#### Template 1: Account / Login Issue
```
Subject: Re: Can't sign in to ShiftWell

Hi [User Name],

Thanks for reaching out! Sign-in issues are usually one of:

1. Apple ID sign-in permission not granted
   → Go to Settings → [Your Name] → Apps & Websites → ShiftWell → Remove
   → Then sign in again in the app

2. Email verification email didn't arrive
   → Check spam folder, or reply here to request a resend

3. Account locked (too many login attempts)
   → Wait 15 minutes and try again

Please let me know which step you tried, and I'll help troubleshoot further.

Best,
ShiftWell Support
```

#### Template 2: Feature Not Working
```
Subject: Re: [Feature] not working

Hi [User Name],

I'm sorry you're experiencing trouble with [feature name]. 
To help you faster, could you please:

1. Your iOS version (Settings → General → About → Software Version)
2. ShiftWell app version (App Store → ShiftWell → Version)
3. Exact steps to reproduce the issue
4. Screenshot of the error (if any)
5. Did this work before, or first time trying?

I'll investigate and get back to you within 24 hours.

Thanks,
ShiftWell Support
```

#### Template 3: Refund Request
```
Subject: Re: Refund request

Hi [User Name],

Thanks for using ShiftWell. If you're not satisfied with the app, 
you can request a refund directly from Apple:

1. Open the App Store app
2. Tap your profile (top right)
3. Tap "Purchases" 
4. Find "ShiftWell Premium"
5. Tap "Problem" or "Report a Problem"
6. Select "I'd like a refund"
7. Choose a reason and submit

Apple usually responds within 24–48 hours. 
If you have feedback on the app itself, I'd love to hear it.

Best,
ShiftWell Support
```

---

## 4. Monitoring Checklist (Post-Launch)

### 4.1 Daily (First 2 Weeks)

**Every morning (9 AM):**

- [ ] **App Store Connect → Crashes**
  - Crash rate: should be < 0.1% of sessions
  - New crashes? Triage as P0/P1
  
- [ ] **Supabase Dashboard → Logs**
  - Filter by `error` level
  - Any 500 errors? Investigate

- [ ] **App Store Reviews**
  - Any new 1–2 star reviews? Read and respond to critical issues
  - Track common complaints (see Section 3)

- [ ] **Metrics snapshot** (App Store Connect)
  - New signups today
  - Active users today
  - Top crashes (if any)

**Every evening (5 PM):**

- [ ] **Supabase → Metrics**
  - Database size growing as expected?
  - RLS audit log clean?

- [ ] **API Health Check**
  ```bash
  curl https://<api-url>/health
  ```
  - Response: `{"status":"ok"}`

### 4.2 Weekly (Weeks 2–8)

**Every Monday morning:**

- [ ] **Active Users (MAU)**
  - App Store Connect → Analytics → Installs & Sales
  - Track week-over-week growth

- [ ] **Crash Rate**
  - Trend: should be decreasing or flat
  - If increasing: investigate and hotfix

- [ ] **Retention Rate**
  - App Store Connect → Analytics → Usage
  - D1 (day 1): % of users back next day
  - D7 (day 7): % of users back after 1 week
  - Target: > 40% D1, > 20% D7 for launch

- [ ] **Premium Conversion**
  - App Store Connect → Sales
  - Revenue this week vs. last week
  - Conversion rate: premium users / total users

- [ ] **Support Tickets**
  - Any patterns emerging? Prioritize top 3 issues

### 4.3 Monthly (After Week 8)

**First of every month:**

- [ ] **Monthly Active Users (MAU)**
  - App Store Connect → Analytics
  - Month-over-month growth rate

- [ ] **Revenue & Churn**
  - Total revenue (MRR = monthly recurring revenue)
  - Churn rate: % of premium users not renewing
  - Target: < 10% monthly churn for year 1

- [ ] **Feature Usage**
  - Which features are most used?
  - Which are abandoned?
  - Plan next iteration based on data

- [ ] **Crash Trends**
  - Any systemic issues?
  - Performance degrading?

- [ ] **User Feedback Summary**
  - Compile reviews, support emails, crash reports
  - Top 5 requested features?
  - Top 3 pain points?

### 4.4 Monitoring Tools & Dashboards

| Metric | Tool | Path | Frequency |
|--------|------|------|-----------|
| Crash reports | App Store Connect | My Apps → ShiftWell → Crashes | Daily |
| Active users | App Store Connect | My Apps → ShiftWell → Analytics → Usage | Weekly |
| Revenue | App Store Connect | My Apps → ShiftWell → Sales | Weekly |
| API errors | Supabase | Logs (filter by error) | Daily |
| Database health | Supabase | Metrics | Weekly |
| User signups | Supabase | SQL: `SELECT DATE(created_at), COUNT(*) FROM users GROUP BY DATE(created_at)` | Daily |

---

## 5. Rollback Procedure

### 5.1 JavaScript/React Native Code (OTA Update)

**When:** Quick fix for non-native changes (UI, logic, algorithm)  
**Time:** ~10 minutes  
**Review required:** No (bypasses App Store)

**Steps:**

1. Identify last known good version
   ```bash
   git log --oneline | head -20  # Find a good commit
   git tag  # Or find last release tag
   ```

2. Create hotfix branch from good version
   ```bash
   git checkout v1.0.0  # Last stable tag
   git checkout -b hotfix/revert-to-v1.0.0
   ```

3. Deploy OTA update
   ```bash
   eas update --branch production --message "Hotfix: revert to v1.0.0"
   ```

4. Monitor rollout
   - Users get update on next app launch
   - Check crash rate in App Store Connect within 10 minutes
   - Should drop to baseline

5. Investigate root cause in parallel
   - Fix the issue properly
   - Add tests to prevent regression
   - Merge to `main` when ready

### 5.2 Native Code / Build Issues

**When:** Rollback involves native iOS code or build configuration  
**Time:** 45–90 minutes  
**Review required:** Yes (App Store expedited review)

**Steps:**

1. Identify last good build
   ```bash
   git log --oneline app.json  # Check version history
   git tag  # Find last release tag
   ```

2. Revert to previous commit
   ```bash
   git revert <bad-commit-hash>
   # Or:
   git reset --hard v1.0.0  # Reset to tag
   ```

3. Build new binary
   ```bash
   eas build --platform ios --profile production
   # Takes ~15 minutes, uploads automatically
   ```

4. Submit to App Store
   - App Store Connect → Builds
   - Select new build → **Submit for Review**
   - Check "expedited review" box
   - Message: "P0 hotfix: reverting v1.0.1 native changes"
   - Apple typically approves in 1–3 hours for hotfixes

5. Meanwhile, communicate with users
   - Post to App Store reviews: "We're fixing a critical issue. New version incoming within 24 hours. Sorry for the inconvenience!"
   - If data loss involved: offer support email for affected users

### 5.3 Database Rollback

**When:** Data migration issue, bad schema change, or data loss  
**Time:** 10 minutes (if rollback migration pre-written)  
**Review required:** No (internal database change)

**Steps:**

1. **Never drop tables without backup** — Supabase keeps daily backups
   - Go to Supabase dashboard → **Backups**
   - Note: backups are for disaster recovery, not routine rollback

2. **For migration rollback:**

   First, write a reverse migration:
   ```sql
   -- supabase/migrations/20260419000000_reverse_schema_change.sql
   
   -- If you added a column, drop it:
   ALTER TABLE users DROP COLUMN new_column;
   
   -- If you changed a column type, revert it:
   ALTER TABLE sleep_logs ALTER COLUMN duration TYPE INT USING duration::INT;
   
   -- If you added a table, drop it:
   DROP TABLE new_table CASCADE;
   ```

3. **Test on staging first**
   ```bash
   # Connect to staging database and run the reverse migration
   npx supabase migration up --staging  # Run forward
   npx supabase migration down          # Test rollback
   ```

4. **Apply to production**
   ```bash
   npx supabase migration up  # Runs the reverse migration
   ```

5. **Verify data integrity**
   ```sql
   -- Spot check key tables
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM sleep_logs;
   SELECT AVG(duration) FROM sleep_logs;  -- Sanity check
   ```

---

## 6. Key Contacts & Access

### 6.1 Essential Accounts

| Service | Purpose | URL | Status |
|---------|---------|-----|--------|
| Apple Developer | iOS app signing & deployment | https://developer.apple.com | Pending LLC setup |
| App Store Connect | App Store submission, crash reports, analytics | https://appstoreconnect.apple.com | Active |
| EAS Dashboard | Build pipeline, OTA updates | https://expo.dev | Active |
| Supabase | Database, auth, logs | https://app.supabase.com | Active |
| GitHub | Code repository | https://github.com/[org]/shiftwell | Active |

### 6.2 Platform Access & Credentials

**Apple Developer Account:**
- Status: Pending LLC formation and D-U-N-S number
- Timeline: ~4–5 weeks until TestFlight ready
- What you'll need: LLC legal paperwork + D-U-N-S number + Apple ID
- Once live: Sign code with certificate, upload builds to App Store Connect

**Supabase Project:**
- Dashboard: https://app.supabase.com
- Keep `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env` (never commit)
- Migrations: run via `npx supabase migration up`
- Backups: automatic daily (14-day retention)

**EAS Account:**
- Linked to Expo account (same as GitHub)
- Dashboard: https://expo.dev
- Builds auto-upload to App Store Connect (requires Apple Developer account)
- OTA updates: via `eas update` command

**GitHub Repository:**
- Main branch: always deployable (all tests pass)
- Branches: `develop`, feature branches, hotfix branches
- CI/CD: GitHub Actions (optional, TBD)

### 6.3 Support Contact Info

| Channel | Purpose | Response Time | Notes |
|---------|---------|----------------|-------|
| support@shiftwell.com | User support | 24 hours | Forward user reports here |
| App Store Reviews | User feedback | Daily check | Public responses visible to all users |
| GitHub Issues | Internal bugs | As time allows | Prioritize by severity |
| Supabase Logs | Error monitoring | Real-time alerts (if configured) | Manual check daily first 2 weeks |

### 6.4 Setting Up Support Email

- Create email alias: `support@shiftwell.com` → your Gmail (recommended: use Gmail filters)
- Use templates from Section 3.2 for fast response
- Archive after response for record-keeping
- Forward critical issues (P0/P1) to yourself immediately

---

## 7. Pre-Launch Checklist

Use this 1 week before App Store submission:

- [ ] All 1,059 tests passing
- [ ] app.json version bumped (e.g., 1.0.0)
- [ ] CHANGELOG updated with feature list
- [ ] App Store listing screenshots ready (5 images, iPhone 6.7-inch or 6.1-inch)
- [ ] App description: 80 chars, mention key features (calendar, algorithm, shift worker)
- [ ] Keywords selected (sleep, circadian, shift work, optimization, schedule)
- [ ] Privacy Policy linked in app.json and App Store
- [ ] Health Disclaimers reviewed and compliant
- [ ] Dark mode tested on device
- [ ] Calendar sync tested end-to-end
- [ ] Premium paywall tested (7-day trial + $29.99/yr)
- [ ] Support email set up (support@shiftwell.com or similar)
- [ ] Crash reporting configured (Sentry or similar, optional)
- [ ] API health endpoint verified
- [ ] Supabase RLS policies reviewed
- [ ] Backup plan documented (this runbook!)

---

## 8. Emergency Contacts & Escalation

### 8.1 You're the Solo Founder

**Primary escalation:** Dr. Gursimran Singh, DO (you)

If overwhelmed:
- **Medical advisor review:** Consult ED colleague on health/safety claims before public statements
- **Legal review:** Consult lawyer on privacy/liability before responding to serious issues
- **Investor/advisory board:** Notify of any P0 incidents (if applicable)

### 8.2 Third-Party Support

- **Apple Developer Support:** https://developer.apple.com/help/app-store-connect/ (free account, paid support available)
- **Supabase Support:** https://supabase.com/support (free tier has email support)
- **Expo Support:** https://expo.dev/help (community forum + paid support)

---

## 9. Documentation Index

For detailed procedures, refer to:

- **Deployment:** docs/launch/LAUNCH_CHECKLIST.md
- **App Store:** docs/launch/APP_STORE_LISTING.md
- **Privacy & Legal:** docs/launch/PRIVACY_POLICY.md, docs/launch/HEALTH_DISCLAIMERS.md
- **Algorithm:** docs/research/RECOVERY_ALGORITHM_SCIENCE.md
- **Architecture:** docs/dev/PHASE_2_ARCHITECTURE.md
- **Implementation:** docs/dev/IMPLEMENTATION_PLAN.md

---

## 10. Quick Reference: Command Cheat Sheet

```bash
# Testing
npm test                           # Run all 1,059 tests (must pass before deploy)
npm test -- --watch               # Run tests in watch mode

# Building & Deploying
npm run build                      # Build for production
eas build --platform ios --profile production  # Build iOS binary
eas update --branch production     # Deploy JavaScript OTA update
eas update --branch production --message "Hotfix: [description]"

# Database
npx supabase migration up          # Run pending migrations
npx supabase migration down        # Rollback last migration
npx supabase db push              # Push local schema to Supabase

# API
npm test --prefix api/             # Test API locally
curl https://<api-url>/health      # Check API health

# Git Workflow
git checkout main && git pull origin main
git checkout -b feature/[name]     # Create feature branch
git commit -m "feat: [description]"
git push origin feature/[name]     # Create PR
git tag v1.0.1 && git push --tags # Tag release

# Local Development
npx expo start                     # Start local dev server
npx expo start --ios              # Start on iOS simulator
npx expo start --android          # Start on Android emulator
```

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-04-18 | Initial creation — launch documentation package | Dr. Gursimran Singh, DO |

---

**Created:** 2026-04-18  
**Last Reviewed:** 2026-04-18  
**Last Edited:** 2026-04-18  
**Review Notes:** Initial creation — comprehensive operations guide for solo founder from TestFlight through App Store launch and ongoing monitoring. All sections include checklists, templates, and command references for quick reference.

