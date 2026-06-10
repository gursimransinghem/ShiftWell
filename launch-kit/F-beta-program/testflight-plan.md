# ShiftWell TestFlight Beta Program Plan

## Executive Summary

ShiftWell is conducting a phased 8-week TestFlight beta program to validate core functionality, collect real-world shift worker feedback, and refine the freemium + premium trial model before App Store submission. The program scales from 10 internal testers to 200 public beta participants, prioritizing healthcare workers (EM, nursing, EMS) as launch markets.

---

## 1. Target Numbers & Rationale

### Phase Breakdown

| Phase | Cohort | Size | Duration | Goal |
|-------|--------|------|----------|------|
| **0** | Internal | 10–15 | 1 week | Smoke test, crash fixes, build stability |
| **1** | Friends & Family | 10–15 | 2 weeks | EM colleague feedback, workflow validation |
| **2** | Healthcare Workers | 50 | 3 weeks | Nursing, residents, EMS feedback, premium UX |
| **3** | Public Beta | 200 | 2 weeks | Broad shift worker feedback, launch readiness |

### Sizing Rationale

**Phase 0 (10–15 internal):**
- Sim + Jess + 3–4 trusted developer friends (tight feedback loop)
- Goal: **stability**, not scale
- High-risk period; expect crashes, iOS/Android rendering issues, Supabase integration bugs
- Weekly build cadence; fixes within 24h for blockers
- Can communicate via private Slack/Discord channel

**Phase 1 (10–15 Friends & Family):**
- EM colleagues at HCA Florida Trinity Hospital (trusted, local, shift-aware)
- Goal: **workflow validation** in real emergency department rotations
- Real shift schedules; immediate feedback on calendar import, meal timing, nap scheduling
- Can do in-person debrief; capture pain points before scaling
- Invitation: personal SMS/group text from Sim + private Slack group

**Phase 2 (50 Healthcare Workers):**
- Nurses, residents, EMS across multiple health systems (50–75% nurses, 25–35% residents/EMS)
- Goal: **premium conversion & retention signals**, diverse shift patterns
- ~2 weeks full testing; monitor trial-to-paid conversion, churn, nap/light plan adoption
- Large enough to detect device/OS bugs; small enough for triage
- Recruitment: nursing subreddits, Facebook groups, medical school alumni networks

**Phase 3 (200 Public Beta):**
- Broader shift workers: hospitality, manufacturing, security, transportation, pilots
- Goal: **app store readiness**, edge cases, diverse schedules
- Captures long-tail device issues (older iOS/Android, connectivity edge cases)
- 2 weeks; focus on churn, crash rates, NPS
- Recruitment: Twitter/X medical community, r/ems, r/nightshift, generic shift worker groups

### Why These Numbers?

- **10–15 internal:** TestFlight's typical invite limit per build iteration; enough for parallelizable triage
- **10–15 F&F:** Can be managed via single Slack workspace; high touch, fast iteration
- **50 Phase 2:** Statistically meaningful sample (>30 for parametric tests); manageable support load (1 support person can handle 20–50 testers)
- **200 Phase 3:** Tests app store submission infrastructure (App Store Connect groups, build distribution, review turnaround); data-rich for prelaunch metrics (crash rate, session length, retention)

---

## 2. Phased Rollout Timeline

### Phase 0: Internal Smoke Test (Week 1)

**Participants:** Sim, Jess, 3–4 dev friends (total 10–15)

**Objectives:**
- App installs and launches without crash
- Onboarding flow completes (email signup, calendar permissions)
- Calendar sync (Google Calendar, iCloud) works
- Circadian algorithm generates plans
- Export to calendar functional
- Premium trial flow (sign-up, payment processing) works in sandbox
- No iOS crashes on iPhone 13–15; no Android crashes on Android 12–14

**Build Cadence:** 2–3 times per week (Monday, Wednesday, Friday)
**Hotfix SLA:** 24h for blocking crashes

**Communication:** Private Slack #internal-testflight
**Feedback Format:** 5-minute async surveys (daily) + optional 15-min Zoom debrief (Thursday EOD)

**Success Criteria:**
- 0 p0/p1 crashes across all testers
- Onboarding completion rate >90%
- Calendar sync success rate >95%
- Payment sandbox environment tested and ready

---

### Phase 1: Friends & Family (Week 2–3)

**Participants:** EM colleagues at HCA Florida Trinity Hospital + Sim's med school network (10–15)

**Objectives:**
- Real shift schedule testing (12h, 24h, rotating schedules)
- Calendar integration with hospital shift system
- Nap scheduling and light exposure plan feedback
- Meal timing recommendations validation
- Premium trial UX (7-day free trial, conversion pressure)
- Retention over 2-week shift cycle

**Build Cadence:** Weekly (Monday AM)
**Hotfix SLA:** 48h for blocking issues

**Communication:** Private Slack #friends-family or WhatsApp group text (depending on Sim's preference)
**Feedback Format:**
- Weekly async survey (5 min): "How many plans did you use? Which was most helpful? Did you follow the nap recommendation?"
- Optional 30-min call mid-week for qualitative feedback

**Recruitment Message (to send via SMS/group text):**

> "Hey [Name] — I've built an app that optimizes sleep for shift workers using circadian rhythm science. It syncs with your calendar, generates personalized sleep/nap/meal plans, and exports to Google Calendar. I'm running a private beta and would love your feedback. No payment required (7-day free trial, then $29.99/yr). Takes 5 min to set up. Link: [TestFlight link]. Let me know if you hit any issues!"

**Success Criteria:**
- >80% of testers run the algorithm at least once
- >50% complete at least one nap recommendation
- NPS >40 (3–4 word feedback acceptable)
- 0 blocking crashes
- Premium trial UX is clear (testers understand the freemium model)

---

### Phase 2: Healthcare Workers (Week 4–6)

**Participants:** 50 testers (nurses, residents, EMS, other healthcare shift workers)
**Geographic Diversity:** Aim for 70% US (multiple time zones), 30% international (UK, AU, Canada)

**Objectives:**
- Convert trial to paid subscription (target: 15–20%)
- Sustained engagement over 3-week period (>50% retention after day 7)
- Diversity of shift patterns (12h, 8h, 24h, rotating, on-call)
- Feedback on specific features: calendar import, meal timing, light exposure
- Device/OS coverage: iOS 16+, Android 12+
- Dark mode UI validation (consistency, readability)
- Pain points for premium vs. freemium feature set

**Build Cadence:** Weekly (Monday AM)
**Hotfix SLA:** 24h for blocking issues

**Communication:**
- Email: weekly update (what's fixed, what's next)
- Slack workspace #phase2-testers for async Q&A
- Optional: biweekly Zoom "office hours" (Thu 12pm ET) for group feedback

**Recruitment Strategy:**

#### Nursing Subreddits (target: 20 testers)
- **r/nursing** (525k members) — post in weekly megathread + crosspost key subreddits
- **r/nightshift** (145k members) — shift-specific, very high relevance
- **r/StudentNurse** (75k members) — younger demographic, tech-savvy
- Post Title: "Seeking Shift Nurses for Free 3-Week Beta: Science-Backed Circadian Sleep App"
- Post Format: 100-word pitch + TestFlight link

**Recruitment Message (Reddit):**

> **Seeking shift nurses for beta: ShiftWell — circadian sleep optimization app**
>
> Building an app designed specifically for shift workers (nurses, residents, EMS, etc.). It syncs your shift schedule with your personal calendar, then generates science-backed plans for sleep, napping, meals, and light exposure to help your body adapt faster.
>
> **What's included:**
> - Calendar sync (Google, iCloud, Outlook)
> - Personalized sleep/nap/meal/light schedules
> - 7-day premium trial free
> - $29.99/year or stay on free tier
>
> **What we need:** 3 weeks of testing on your phone (iOS 16+ or Android 12+). 5-min setup, then let it run. We'll ask for brief weekly feedback.
>
> **No payment required** during the 7-day trial. After that, the app stays free with core features; premium unlocks custom light timing.
>
> TestFlight link: [link] (iOS) | Android: [link]
>
> Nurses and shift workers especially welcome. Thank you!

#### Facebook Groups (target: 15 testers)
- **Night Shift Nurses** (~18k members, UK + US)
- **Night Shift Workers Support** (~12k members, global)
- **Nursing Students & Nurses Support Group** (~25k members)

**Post Format:** 150-word pitch in group feed (tag admins if promotion posts require approval)

**Recruitment Message (Facebook):**

> [Image: app logo or iPhone screenshot]
>
> **ShiftWell Beta — Free 3-Week Test for Shift Workers**
>
> Hi everyone. I'm Dr. Gursimran Singh (EM physician at HCA Florida Trinity Hospital), and I've built an app to help shift workers sleep better. It's based on circadian rhythm science and works by syncing your shift calendar to generate personalized sleep, nap, and meal timing recommendations.
>
> **We're looking for 50 nurses, residents, EMS, and other shift workers to test it for free (3 weeks).**
>
> Download on TestFlight (iOS) or [Android] — no payment required. Then let us know what works and what doesn't.
>
> Questions? Comment below. Link in first comment.

#### Medical School / Residency Alumni Networks (target: 10 testers)

- Email targeted alumni networks (Harvard, Johns Hopkins, USF, FSU medical schools)
- Slack communities for residents (r/Residency subreddit, specialty-specific Slack groups)
- Medical LinkedIn groups (Emergency Medicine, Internal Medicine, Surgery)

**Recruitment Message (Email):**

> **Subject: Beta Testing Opportunity – Shift Worker Sleep Optimization App**
>
> Hi [Classmate/Colleague],
>
> I'm running a closed beta for ShiftWell, an app I built to help shift workers (especially healthcare providers) optimize sleep using circadian rhythm science. I'm looking for 50 healthcare workers (doctors, nurses, residents, EMS) to test it over 3 weeks.
>
> It's free to download and includes a 7-day premium trial (no credit card required to try).
>
> **If interested:**
> 1. Download via TestFlight link: [link]
> 2. Fill out the onboarding (2 min)
> 3. Reply with any feedback weekly
>
> We're targeting launch in late May. Your feedback is critical to the final product.
>
> Thanks,
> Gursimran

#### Medical Twitter/X (target: 5 testers)

- Retweet/quote communities: #MedTwitter, #ResidencyTwitter, #EmergencyMedicine hashtags
- Tag influential EM accounts: @ALiemMD, @EMMit, @AcademicLifeEM

**Tweet Format:**

> Just launched ShiftWell beta — circadian sleep optimization for 700M shift workers.
>
> Import your shift schedule, get AI-powered sleep/nap/meal/light timing, export to calendar. No science fiction, just Two-Process Model math.
>
> Testing with 50 healthcare workers now. DM for TestFlight link. 7-day free trial.
>
> cc @ALiemMD @AcademicLifeEM

---

### Phase 3: Public Beta (Week 7–8)

**Participants:** 200 shift workers (broader demographics: hospitality, manufacturing, security, transportation, pilots, caregivers)

**Objectives:**
- Validate app store submission readiness (crash rates <0.1%, ANR <0.05%, battery impact negligible)
- Broad shift pattern coverage (on-call, split shifts, rotating international)
- Measure baseline metrics (DAU, session length, retention day 1/7/14)
- Collect NPS and qualitative feedback for app store optimization
- Identify long-tail device issues (older iOS, Android variants)
- Stress test Supabase backend (spike in concurrent users)

**Build Cadence:** Weekly (Monday AM)
**Hotfix SLA:** Crashes fixed within 24h

**Communication:**
- Email digest (weekly): "Here's what we fixed. Here's what's next."
- Slack workspace #public-beta for feedback + known issues
- In-app survey: after 7 days of usage, ask NPS + top 3 features

**Recruitment Strategy:**

#### r/ems, r/emergencymedicine (target: 30 testers)

**Post Title:** "ShiftWell Beta Open: App for Shift Workers' Sleep + Circadian Optimization"

#### r/nightshift (cross-promotion from Phase 2, target: 20 testers)

#### Shift Worker Facebook Groups (target: 30 testers)
- **Nurses & Shift Workers Worldwide**
- **Manufacturing Shift Workers**
- **Hospitality Night Shift Workers**

#### Twitter/X Medical & Wellness Communities (target: 20 testers)
- #HealthTech, #MedTech, #Wellness hashtags
- Tag health/fitness influencers with relevant audiences

#### ShiftWell Public Waitlist Landing Page (target: 60+ testers)
- If not already created, launch simple landing page (Webflow or Notion):
  - Headline: "Sleep better on shift work"
  - CTA: "Join beta (early access to $29.99/year)"
  - Email capture (ConvertKit or Mailchimp)
  - Estimate: 200–300 signups → 60–100 opt into Phase 3

#### Generic Shift Worker Reddit (target: 20 testers)
- r/jobs, r/workfromhome, subreddits for pilots (r/flying, r/ATP), caregivers

**Public Recruitment Message (Reddit/Facebook/Twitter):**

> **ShiftWell Beta – Free 2-Week Test – Sleep Optimization for Shift Workers**
>
> ShiftWell is a mobile app (iOS + Android) that helps shift workers sleep better by syncing your shift calendar to your phone, then generating personalized sleep, nap, meal, and light exposure schedules based on circadian rhythm science.
>
> **We're opening the beta to 200 shift workers (final 2 weeks before App Store launch).**
>
> **Free to join. 7-day premium trial included. No credit card required.**
>
> Download: [TestFlight iOS link] | [Android beta link]
>
> Shift workers of all types welcome: nurses, EMS, pilots, security, hospitality, manufacturing, on-call parents, etc.
>
> We're collecting feedback to finalize the app before launch. Takes 2 min to set up. Questions? Reply here or join our Slack: [Slack invite link].

---

## 3. Recruitment Channels & Tactics Summary

| Channel | Phase | Size | Timeline | Tactic |
|---------|-------|------|----------|--------|
| Personal SMS | 1 | 10–15 | Week 2 | Direct text to EM colleagues |
| r/nursing, r/nightshift, r/StudentNurse | 2 | 20 | Week 4 Mon | Reddit megathread posts + crosspost |
| r/ems, r/emergencymedicine | 2–3 | 20 | Week 4 Mon, Week 7 Mon | Dedicated posts |
| Facebook: Night Shift Nurses, Night Shift Workers Support | 2–3 | 25 | Week 4 Mon, Week 7 Mon | Group feed posts (tag admins) |
| Medical school alumni networks | 2 | 10 | Week 4 | Targeted email to class listservs |
| Medical Twitter/X | 2–3 | 10 | Week 4 Mon, Week 7 Mon | Tweets + DM targeted accounts |
| ShiftWell public waitlist landing page | 3 | 60 | Week 7 | Email campaign to signups |
| Residency Slack + r/Residency | 2 | 5 | Week 4 | Slack posts + Reddit comments |

**Timeline:**
- **Week 1 (Phase 0):** Zero recruitment; internal only
- **Week 2–3 (Phase 1):** Personal outreach (SMS, email) to EM colleagues
- **Week 4–6 (Phase 2):** Public posts on Reddit, Facebook, email alumni networks
- **Week 7–8 (Phase 3):** Repost Reddit, launch waitlist email campaign, final Twitter push

---

## 4. TestFlight Group Configuration

### App Store Connect Groups

Set up 4 groups in App Store Connect:

1. **Internal & QA** (10–15 testers)
   - Name: `ShiftWell Phase 0 – Internal`
   - Testers: Sim, Jess, dev friends
   - Managed by: Sim
   - Access: All builds immediately upon TestFlight submission

2. **Friends & Family** (10–15 testers)
   - Name: `ShiftWell Phase 1 – F&F`
   - Testers: EM colleagues (HCA Trinity + med school contacts)
   - Managed by: Sim
   - Access: All builds (2–4 hour delay after Phase 0 validation)

3. **Healthcare Workers** (50 testers)
   - Name: `ShiftWell Phase 2 – Healthcare`
   - Testers: Nurses, residents, EMS (recruited via subreddits, Facebook, alumni)
   - Managed by: Sim + Jess (if available)
   - Access: Weekly builds (every Monday AM, after Phase 1 signoff)

4. **Public Beta** (200 testers)
   - Name: `ShiftWell Phase 3 – Public`
   - Testers: Broad shift workers (waitlist, Reddit, Twitter)
   - Managed by: Sim + support person (if hired by Week 7)
   - Access: Weekly builds (every Monday AM, after Phase 2 signoff)

### Group Access Rules

- **Phase 0 → Phase 1:** Do not unlock Phase 1 group until:
  - Zero p0/p1 crashes in Phase 0
  - Onboarding >90% success rate
  - Premium trial payment flow confirmed working
  
- **Phase 1 → Phase 2:** Unlock Phase 2 after 3 days of Phase 1 testing:
  - Real shift schedule testing validated
  - No blocking crashes (p1 or higher)
  - Preliminary NPS >30

- **Phase 2 → Phase 3:** Unlock Phase 3 after 1 week of Phase 2 testing:
  - Crash rate <0.5% daily
  - Premium conversion >5%
  - Core workflow (import → plan → export) stable

### Tester Acceptance & Communication

- **Acceptance email template (to send via TestFlight invitations):**

> **Subject: You're invited to ShiftWell beta!**
>
> Hi [Name],
>
> Thanks for agreeing to test ShiftWell, my circadian sleep optimization app for shift workers. Here's what you need to know:
>
> 1. **Download:** Tap the TestFlight link to install (iOS) or use the Android link
> 2. **Setup:** 2-min onboarding (email, calendar sync)
> 3. **Try it:** Import your shift schedule, run the algorithm, check out the sleep/nap plans
> 4. **Feedback:** Weekly survey (5 min) + optional Slack/email messages anytime you hit an issue
>
> **Important:** This is a closed beta. Please don't share the TestFlight link.
>
> **7-day free trial included.** After that, freemium model: core features stay free, or $29.99/year for premium.
>
> Questions? Reply to this email or post in Slack: [Slack invite]
>
> Let's build a better app for shift workers.
>
> Gursimran

---

## 5. Build Distribution Strategy

### Weekly Build Release Cadence

**Standard Schedule (Phase 1–3):**
- **Monday 9 AM ET:** Build submitted to TestFlight
- **Monday 2 PM ET:** Build available for Phase 0 (internal)
- **Tuesday 9 AM ET:** Build promoted to Phase 1 (after Phase 0 sign-off)
- **Wednesday 9 AM ET:** Build promoted to Phase 2–3 (after Phase 1 sign-off)

**Rationale:**
- Staggered release reduces risk of cascading bugs
- Phase 0 acts as quality gate for Phase 1+
- Testers have 3–4 days to report issues before next build
- Weekly cadence keeps momentum without overhead of daily deploys

### Hotfix Protocol

**For p0 / p1 crashes:**
- Reproduction: Tester reports crash in Slack or via email
- Triage: Sim reviews crash logs in TestFlight analytics within 2 hours
- Fix: Deploy hotfix build within 24h (can break weekly cadence)
- Communication: Announcement in #testflight Slack channel + direct email to affected testers
- SLA: 24h fix + 2h build distribution

**For p2 / p3 issues (usability, minor crashes):**
- Log for next weekly build
- No out-of-cycle release
- Include in release notes

### Release Notes Template (per build)

> **ShiftWell v0.2.3 – [Date]**
>
> **What's new:**
> - [Feature 1]
> - [Improvement 1]
>
> **What we fixed:**
> - [Bug 1]
> - [Crash fix 1]
>
> **What we're working on:**
> - [Next sprint item]
>
> **Feedback?** Post in Slack #phase[X]-testers or reply to this email.

### Build Submission & Version Management

- **iOS:** Submit to TestFlight via Xcode or Expo EAS (recommended: EAS for faster turnaround)
  - Version: 0.2.0 (Phase 0), 0.3.0 (Phase 1), 0.4.0 (Phase 2), 0.5.0 (Phase 3)
  - Build increment on each TestFlight submission

- **Android:** Submit via Play Console internal testing
  - Parallel versioning with iOS
  - Keep version numbers in sync across platforms

---

## 6. Recruitment Messaging Drafts

### Phase 1 (Friends & Family, EM Colleagues) – SMS/WhatsApp

> Hey [Name] — I've built an app called ShiftWell that optimizes sleep for shift workers. It syncs your shift calendar and generates personalized sleep/nap/meal/light plans. I'm beta testing with a few EM colleagues and would love your feedback. Takes 5 min to try. No payment required (7-day free trial included). Link: [TestFlight link]. LMK if you hit any issues!

### Phase 2 (Healthcare Workers, Reddit)

**Title:** "Seeking Shift Nurses + Residents + EMS for Beta: ShiftWell – Circadian Sleep Optimization App"

**Body:**
> I'm Dr. Gursimran Singh, an EM physician, and I've built an app called ShiftWell that helps shift workers sleep better. It syncs your shift schedule with your calendar, then generates personalized sleep, nap, meal, and light exposure recommendations based on circadian science.
>
> **I'm looking for 50 shift workers (nurses, residents, EMS, etc.) to test it for 3 weeks, free.**
>
> **What it does:**
> - Import your Google Calendar (or iCloud/Outlook)
> - Run the circadian algorithm
> - Get personalized plans: when to sleep, when to nap, when to eat, when to get light
> - Export directly to your calendar
>
> **What it costs:**
> - 7-day premium trial (free)
> - Free tier after (core features)
> - $29.99/year optional (premium features)
>
> **What we need from you:**
> - Download via TestFlight (takes 2 min)
> - Set up your shift schedule (3 min)
> - Use it for 3 weeks
> - Brief weekly feedback (5 min survey)
>
> **Download:** [TestFlight iOS link] | [Android beta link]
>
> Nurses, residents, and EMS especially welcome. Comment below or DM me. Thanks!

### Phase 2 (Healthcare Workers, Facebook)

**Post format:** Image (app screenshot) + 150-word caption

> **ShiftWell Beta – Free for Healthcare Shift Workers**
>
> Hi everyone. I'm Dr. Gursimran Singh, an EM physician and founder of ShiftWell. I've spent the last two years building an app specifically for shift workers — based on real circadian science, not app-store hype.
>
> **The problem:** 700 million shift workers globally. Many struggle with sleep, fatigue, and circadian misalignment.
>
> **The solution:** ShiftWell syncs your shift calendar to your phone, then generates personalized sleep, nap, meal, and light schedules to help your body adapt faster.
>
> **We're recruiting 50 nurses, residents, EMS, and other shift workers to test it for 3 weeks (free).**
>
> TestFlight link: [link] (takes 2 min to set up)
> 
> No payment required. 7-day trial included. We're collecting feedback to finalize before App Store launch.
>
> Comment below or DM for questions. Shift workers everywhere welcome!

### Phase 2 (Healthcare Workers, Email to Alumni Networks)

**Subject:** "Beta Testing Opportunity – ShiftWell Sleep Optimization App"

> Hi [Classmate/Residency Colleague],
>
> I'm reaching out because I think you might be interested in helping test something I've been building: ShiftWell, an app that optimizes sleep for shift workers using circadian science.
>
> I'm running a closed beta with 50 healthcare workers (doctors, nurses, residents, EMS) and would love to have you involved.
>
> **What it does:**
> - Syncs your shift schedule to your calendar
> - Generates personalized sleep/nap/meal/light plans
> - Exports recommendations directly to Google Calendar
> - Based on Two-Process Model and NIOSH protocols (not LLM guessing)
>
> **What it costs:** Nothing during beta. 7-day premium trial, then $29.99/year or stay free.
>
> **What we need:** 3 weeks of testing, one 5-min survey per week.
>
> **Interested?** Download via TestFlight: [link]. Takes 2 min. Reply if you have questions.
>
> Thanks,  
> Gursimran

### Phase 3 (Public Beta, Reddit)

**Title:** "ShiftWell Beta Expanding: 200 Shift Workers Needed – Sleep Optimization App"

**Body:**
> ShiftWell is opening its final beta phase before App Store launch. We're recruiting 200 shift workers across all industries.
>
> **What it does:**
> - Syncs shift schedule → generates personalized sleep/nap/meal/light plans → exports to calendar
> - Works for nurses, EMS, pilots, security, hospitality, manufacturing, on-call parents, etc.
>
> **Join the beta:**
> - Download TestFlight (iOS) or Android link
> - Set up in 2 minutes
> - Test for 2 weeks (free)
> - Provide feedback (optional weekly survey)
>
> **What it costs:** 7-day premium trial included (no card required). Then freemium or $29.99/year premium.
>
> **Download:** [TestFlight link] | [Android link]
>
> Questions? Post here or join Slack: [link]

### Phase 3 (Public Beta, Twitter/X)

> **ShiftWell Beta Now Open – 200 Shift Workers Welcome**
>
> We're expanding beta to 200 testers (final 2 weeks before launch). Built for nurses, EMS, pilots, security, hospitality, manufacturing, on-call parents — anyone on a non-standard schedule.
>
> Download free: [TestFlight] [Android]
> 7-day premium trial included.
> No credit card required.
>
> Help us finalize a tool for the 700M shift workers who need better sleep.

---

## 7. Success Metrics & Exit Criteria

### Phase 0 (Internal)
- **Crash rate:** <0.1% (0 blocking crashes)
- **Onboarding completion:** >90%
- **Calendar sync success:** >95%
- **Premium trial flow:** 100% (payment sandbox verified)
- **Exit:** Unlock Phase 1

### Phase 1 (F&F)
- **Crash rate:** <0.5% (no p0/p1 crashes)
- **Retention day 3:** >80%
- **NPS:** >40
- **Feature engagement:** >50% run algorithm, >30% attempt a nap recommendation
- **Exit:** Unlock Phase 2

### Phase 2 (Healthcare)
- **Crash rate:** <0.5%
- **Retention day 7:** >60%
- **Premium conversion:** 10–20%
- **NPS:** >50
- **Device coverage:** iOS 16–17, Android 12–14 (0 critical bugs)
- **Exit:** Unlock Phase 3

### Phase 3 (Public)
- **Crash rate:** <0.1% (ANR <0.05%)
- **Retention day 7:** >50%
- **Retention day 14:** >30%
- **Premium conversion:** 10–15%
- **NPS:** >45
- **Session length:** median 5–8 min (healthy engagement)
- **Exit:** App Store ready (submit for review)

---

## 8. Support & Communication Plan

### Slack Workspace (for all phases)

Create a private Slack workspace with channels:

- `#general` — announcements, changelog
- `#bugs` — tester-reported issues (Sim monitors daily)
- `#feature-ideas` — feedback on features
- `#ios` — iOS-specific issues
- `#android` — Android-specific issues
- `#phase0-internal` — Phase 0 only
- `#phase1-ff` — Phase 1 only
- `#phase2-healthcare` — Phase 2 only
- `#phase3-public` — Phase 3 only
- `#random` — social / off-topic

**Slack bot integration (optional):**
- Notify testers of new builds (GitHub Actions + Slack webhook)
- Collect feedback via Slack polls (weekly)

### Email Updates

**Weekly newsletter** (every Monday after build release):
- What's new in this build
- Known issues we're working on
- What's coming next
- Link to Slack for real-time feedback

**Template:**
> **ShiftWell Weekly Update – [Week of April 21]**
>
> **What's new:**
> - Fixed calendar sync delay on Android 12
> - Added dark mode refinements
>
> **Known issues:**
> - Supabase occasional sync delay in poor connectivity (investigating)
>
> **Coming next:**
> - Export to Outlook
> - Watchlist integration (beta)
>
> **Download latest build:** [TestFlight link]
> **Join Slack:** [Slack invite]
> **Reply with feedback:** [email]

### In-App Feedback Prompt

Add an in-app survey after day 7 of usage:

> **Tell us what you think!**
> 
> How likely are you to recommend ShiftWell to a shift worker friend? (1–10)
> 
> [Slider] → [Submit]
> 
> Optional: What's the #1 thing ShiftWell should improve?

---

## 9. Timeline & Milestones

| Date | Milestone | Owners |
|------|-----------|--------|
| **Week 1 (Apr 21)** | Phase 0 build ready; send TestFlight invites to 10–15 internal | Sim, Jess |
| **Week 1 (Apr 25)** | Phase 0 final sign-off; 0 critical crashes | Sim |
| **Week 2 (Apr 28)** | Phase 1 invites sent to EM colleagues; Slack workspace ready | Sim |
| **Week 3 (May 5)** | Phase 1 sign-off; NPS >40; unlock Phase 2 | Sim |
| **Week 4 (May 12)** | Phase 2 recruitment posts live on Reddit, Facebook; 50 testers invited | Sim, Jess |
| **Week 6 (May 26)** | Phase 2 sign-off; conversion >10%; unlock Phase 3 | Sim |
| **Week 7 (Jun 2)** | Phase 3 invites sent; waitlist email campaign; Reddit/Twitter final push | Sim, Jess |
| **Week 8 (Jun 9)** | Phase 3 sign-off; finalize release notes, screenshots, app store metadata | Sim |
| **Week 9 (Jun 16)** | Submit to App Store for review | Sim |

---

## 10. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Recruitment shortfall** (can't reach 50–200 target) | Medium | High | Pre-launch waitlist landing page; early Reddit posts; referral incentive (bonus premium months for referrals) |
| **Critical crash in Phase 1** (blocks F&F validation) | Low | High | Phase 0 acts as gatekeeper; mobile crash analytics (Firebase or Sentry) on by default |
| **Payment processor issue** (premium trial fails) | Low | High | Test sandbox environment thoroughly in Phase 0; have Stripe and RevenueCat backup tested |
| **Supabase outage** (backend down during beta) | Low | Medium | Local caching of calendar plans; offline mode; status page published to testers |
| **Low NPS / churn** (product doesn't resonate) | Medium | High | Phase 1 early feedback gates Phase 2; be ready to pivot freemium model or feature set |
| **Uneven timezone coverage** (test data skewed to US) | Medium | Low | Explicitly recruit Phase 2 & 3 testers from UK, AU, Canada; use Slack timezone reminder |
| **Device fragmentation** (crashes only on older Android) | Medium | Medium | TestFlight analytics broken down by device/OS; allocate hotfix cycle for edge devices |

---

## 11. Post-Beta Handoff

### App Store Submission Prep

By end of Phase 3 (Week 8), prepare:

1. **App Store metadata:**
   - App name: ShiftWell
   - Subtitle: "Circadian Sleep Optimization for Shift Workers"
   - Description (4–5 sentences, per docs/launch/APP_STORE_LISTING.md)
   - Keywords: shift worker, sleep, circadian, EM, nurse
   - Screenshot pack (3–5 marketing screenshots from beta)
   - Privacy policy URL (finalized per PRIVACY_POLICY.md)
   - Health disclaimer (per HEALTH_DISCLAIMERS.md)

2. **Release notes (v1.0):**
   - Summary of features validated in beta
   - Link to support email

3. **Support infrastructure:**
   - Support email alias (support@shiftwell.app)
   - Feedback form (Typeform or similar)
   - FAQ (1-page, updated from beta feedback)

4. **Analytics & monitoring:**
   - Crash reporting (Firebase Crashlytics or Sentry)
   - Session tracking (Amplitude or Mixpanel)
   - Premium conversion funnels (RevenueCat)

---

## Appendix: Testing Checklist (Per Phase)

### Phase 0 Internal Checklist

- [ ] App installs without errors (iOS + Android)
- [ ] Onboarding completes (email + calendar sync)
- [ ] Google Calendar sync works
- [ ] iCloud Calendar sync works (if implemented)
- [ ] Algorithm runs and produces plans
- [ ] Export to calendar functional
- [ ] Premium trial flow: enter payment info, confirm charge in sandbox
- [ ] Dark mode UI rendering consistent
- [ ] No crashes in 1-hour usage session (per tester)
- [ ] App icon, splash screen display correctly
- [ ] Notification permissions prompt works (if implemented)

### Phase 1 Friends & Family Checklist

- [ ] All Phase 0 items passing
- [ ] Real shift schedule import works (EM rotations vary; 12h, 24h, nights)
- [ ] Plan recommendations align with shift times
- [ ] Nap suggestion timing is reasonable
- [ ] Meal timing doesn't conflict with shift breaks
- [ ] Export to calendar preserves plan details
- [ ] Calendar entries show up in native Calendar app
- [ ] Premium trial UI doesn't confuse testers
- [ ] No crashes over 2-week real usage
- [ ] Battery impact acceptable (1–3% per day)

### Phase 2 Healthcare Workers Checklist

- [ ] All Phase 1 items passing
- [ ] Diverse shift patterns tested (12h, 8h, 24h, rotating, on-call)
- [ ] iOS 16 + 17 device variants (iPhone 13–15)
- [ ] Android 12, 13, 14 device variants (Samsung, Pixel, Motorola)
- [ ] Premium conversion flow clear (no confusion about freemium)
- [ ] Weekly email update lands cleanly (no formatting issues)
- [ ] Slack workspace accessible and intuitive
- [ ] Crash rate <0.5% across 50 testers
- [ ] Retention day 7 >60%
- [ ] NPS feedback actionable (top 3 features requested)

### Phase 3 Public Beta Checklist

- [ ] All Phase 2 items passing
- [ ] 200 testers onboarded (target recruitment)
- [ ] Device coverage: iOS 16+, Android 12+ (diverse manufacturers)
- [ ] Crash rate <0.1% with 0 ANRs
- [ ] Session length and DAU healthy
- [ ] Premium trial conversion tracking validated
- [ ] In-app NPS survey implemented
- [ ] App Store metadata finalized
- [ ] Privacy policy + health disclaimers reviewed by legal
- [ ] Analytics dashboard (Amplitude/Mixpanel) connected
- [ ] Support email + FAQ ready

---

## Appendix: Supabase Configuration for Beta

**During Phase 0:**
- Supabase project already configured (per project notes)
- Test email signup and OAuth flow in sandbox
- Verify row-level security (RLS) policies block unauthorized data access
- Test calendar sync API endpoints under load (simulate 200 concurrent users for Phase 3)

**Environment variables:**
- iOS/Android: `SUPABASE_URL` and `SUPABASE_ANON_KEY` hardcoded (public; this is safe for anon key)
- TestFlight builds: point to production Supabase (not sandbox; production data during beta)
- Monitor Supabase real-time logs during each phase for errors

---

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial creation — comprehensive TestFlight beta strategy with phased rollout, recruitment messaging, support plan, and success metrics. Ready for implementation across all four phases. Integration with App Store Connect TestFlight groups, build distribution cadence, and post-beta handoff documented.