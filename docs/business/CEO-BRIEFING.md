# CEO Briefing — ShiftWell

**Last cycle:** 2026-04-15 (Midday)
**Next scheduled:** Next CEO Loop run
**Cycle #:** 16

---

## Status Dashboard

| Department | Health | Last Action | Next Trigger |
|-----------|--------|-------------|--------------|
| Product | ✅ GREEN | VISUAL_ROADMAP updated to Phase A/B/C ship path; Phase 28 complete | Phase A/B/C completion or feedback |
| Engineering | ⚠️ YELLOW | 1,059 tests / 71 suites passing; BLOCKER: settings.tsx merge conflict (14 TS errors); C10 pipeline corrected (OAuth placeholder in app.json:92) | Resolve conflict; Google client ID |
| Marketing | ✅ GREEN | AfterShift investigated (LOW-MEDIUM, tracker not planner); calendar copy sharpened; Week 2 content drafted; OffShift flagged for next cycle | >3 days — fires Apr 17 |
| Operations | ✅ GREEN | All legal gates pending; no change | LLC filed or financial change |
| Strategy | ✅ GREEN | Slim-down pivot confirmed aligned with business plan | Phase A-C completion or monthly (May) |
| Design | 💤 Dormant | — | TestFlight launch |
| Social Media | 💤 Dormant | — | TestFlight launch |
| Customer Success | 💤 Dormant | — | TestFlight launch |
| Advertising | 💤 Dormant | — | App Store launch |
| Sales | 💤 Dormant | — | $2.5K MRR |

---

## Needs Your Approval

These are decisions only Sim can make. Nothing was executed without approval.

### 🚨 PERSONAL DEADLINE — 2025 Tax Filing Due **TODAY April 15 — FILE NOW OR EXTENSION BY MIDNIGHT** *(Non-ShiftWell)*
**What:** Upload W-2 to TurboTax and file personal taxes.
**Why flagged here:** April 15 IS TODAY. Federal deadline is midnight tonight. Every hour you wait is a risk.
**Option A:** TurboTax → upload W-2 → file now. Done.
**Option B (if not ready):** File Form 4868 at IRS.gov — takes 5 minutes, buys 6 months. **Must submit by midnight tonight to avoid penalties.**

### 🔴 CRITICAL — Resolve Merge Conflict in `app/(tabs)/settings.tsx` *(Cycle 3, updated Cycle 5)*
**What:** Unresolved merge conflict markers at lines 16-46 and 336-384. Causing 14 TypeScript errors that block any EAS production build.
**Decision made (Cycle 5 analysis):** Keep the **worktree version** in both conflict sections.
- Section 1 (imports): Worktree removes ReferralCard (being archived in Phase A) and adds WeeklyBriefToggle (explicitly must stay active per Phase A plan)
- Section 2 (UI): Worktree replaces dead "COMMUNITY" section with "AI COACHING" + "PROFILE" — both are active, non-premature features
**Action (5 minutes):**
1. Open `app/(tabs)/settings.tsx`
2. Lines 16-46: Delete lines 16 (`<<<<<<< HEAD`) through 22 (`import ReferralCard...`) and line 46 (`>>>>>>> worktree-agent-a211ed4f`), keep lines 23-45
3. Lines 336-384: Delete lines 336 (`<<<<<<< HEAD`) through 339 (`<ReferralCard />`), and line 384 (`>>>>>>> worktree-agent-a211ed4f`), keep lines 341-383
4. `git add app/(tabs)/settings.tsx && git commit -m "fix: resolve settings.tsx merge conflict — keep worktree version"`
**Must do before:** Starting Phase A slim-down.

### 🔴 CRITICAL — LLC Company Name Decision
**What:** Pick the company name: **ShiftWell**, Circadian Labs, or Vigil Health.
**Why now:** LLC → EIN → D-U-N-S → Apple Developer is a serial chain. Every week of delay = a week added to TestFlight launch. The name also blocks social handle claims, domain registration, and ASO copy.
**Recommendation (Strategy):** File as ShiftWell today. No USPTO conflicts found. Can update branding later before marketing spend.

### 🟠 HIGH — Individual vs Organization Apple Developer Enrollment
**What:** Individual enrollment is instant + $99. Organization requires D-U-N-S (~5 weeks after LLC). Both support TestFlight.
**Trade-off:** Individual = ship to TestFlight in days. Organization = full brand credibility on App Store but 5+ week wait. You can transfer later.
**Recommendation (Strategy):** Individual now. Upgrade to Org after D-U-N-S resolves. Could shave 5 weeks off TestFlight date.

### 🟠 HIGH — Record 60-Second App Walkthrough *(Cycle 2)*
**What:** Screen-record a 60-second demo: enter shift schedule → plan generates → exports to calendar.
**Why now:** Highest-value pre-launch marketing asset. App is ready to record. 15 minutes.

### 🟠 HIGH — Build Waitlist Landing Page *(Cycle 2)*
**What:** shiftwell.com email capture. "Get early access + free 30-day premium trial."
**Why now:** Every week without a waitlist page = fewer Day 1 users. Every week of LLC wait is a week the page should be running.

### 🟠 HIGH — LinkedIn Founder Story *(Cycle 2)*
**What:** First-person post: "I built this app at 2AM after a 12-hour ER shift." Claude can draft structure; Sim must write it.
**Why:** Physician-built narrative is the strongest competitive differentiator.

### 🟠 HIGH — Trademark Filing
**What:** Clearance search (~$300-500) then Class 9 + Class 44 filing (~$500-700). Can parallelize with LLC.
**Why now:** Protect the name before marketing spend begins.

### 🟡 MEDIUM — Claim Social Handles *(Cycle 2)*
**What:** @shiftwell_sleep on Instagram and TikTok. 5 minutes.

### 🟡 MEDIUM — App Store Subtitle Approval *(Cycle 2)*
**What:** "Circadian Plans, Auto-Scheduled" (30 chars). Approve before TestFlight build.

### 🟠 HIGH — Google iOS Client ID for app.json *(NEW — Cycle 6)*
**What:** `app.json:92` has `iosUrlScheme: "com.googleusercontent.apps.PLACEHOLDER_CLIENT_ID"`. Blocks Google Calendar OAuth on TestFlight builds.
**Action (10 minutes):**
1. Go to Google Cloud Console → Create/select project → APIs & Services → Credentials
2. Create Credential → OAuth 2.0 Client ID → iOS → Bundle ID: `com.shiftwell.app`
3. Copy the client ID (format: `<numbers>.apps.googleusercontent.com`)
4. In `app.json:92`, replace `PLACEHOLDER_CLIENT_ID` with the real client ID
5. Also set `iosClientId` in `app.json` under `expo.android`/`ios` if prompted by Expo
**Must do before:** TestFlight build — blocks Google Calendar sync.

### 🟡 MEDIUM — Investigate OffShift App *(NEW — Cycle 14)*
**What:** "OffShift – Shift Work Sleep" (App Store ID 6756209316) surfaced during AfterShift investigation. Features and pricing unknown.
**Action (15 minutes):** Marketing will investigate Cycle 15 (Apr 17) automatically. No action needed from Sim now.
**Why flagged:** Situational awareness — another shift-work sleep app in the same App Store cluster.

### 🟠 HIGH — Review and Approve Week 2 Content Drafts *(NEW — Cycle 14)*
**What:** Two content pieces ready for your review in `docs/marketing/CONTENT-WEEK2-APR14.md`:
1. **SWSD Explainer Post** (~240 words, LinkedIn/Instagram) — explains SWSD, cites 10-38% prevalence, positions ShiftWell. Please verify clinical accuracy of the statistics and mechanism description.
2. **Caffeine Timing Carousel** (7 slides) — adenosine mechanics → half-life math → shift worker cutoff rules. Slide 5 cites Drake et al. 2013. Please verify accuracy of caffeine science slides.
**Action (20 minutes):** Read the file, approve or redline. These are ready to hand to a designer as soon as you approve.
**Why now:** Week 2 content window is now (Apr 14-18). The carousel in particular is high-shareability — best posted Thursday/Friday.

### 🟢 LOW — Add investor summary line to BUSINESS-PLAN-V2.md *(NEW — Cycle 3)*
**What:** Under v2.0 roadmap: "Enterprise module, employer dashboard, and API layer built and staged in v2 archive — reintroduced on first hospital inquiry."
**Why:** Protects enterprise story in pre-seed pitch. Signals capital discipline, not capability loss.

---

## What Happened This Cycle

**Cycle 16 — Quiet cycle. No departments dispatched. All triggers evaluated and skipped.**

All five active departments evaluated — none met dispatch threshold:
- **Marketing:** 1 day since Apr 14 run. Fires Apr 17 (OffShift investigation + any new intel).
- **Engineering:** settings.tsx merge conflict unchanged. No code activity since morning. Waiting on Sim's 5-minute fix.
- **Product:** No commits, no STATE.md changes, no feedback. Clean hold.
- **Operations:** No financial changes, no legal deadlines with hard dates, not first of month.
- **Strategy:** No phase completed, not first of month.

**🚨 Tax deadline is TONIGHT.** It is now midday on April 15. File via TurboTax or submit Form 4868 at IRS.gov by midnight. Do not let this slip past 9PM.

---

*Previous cycle (Cycle 15 — 2026-04-15 Morning): Quiet. No departments dispatched. Tax deadline flagged.*

---

## The Big Picture

### The New Plan: Phase A → B → C → Ship
```
Phase A (Slim Down, 1-2 sessions)  ←── Start next session, no blockers
    ↓
Phase B (Ship Polish, 2-3 sessions) ←── Immediately after Phase A
    ↓                                     (crash reporting, analytics, device walkthrough)
LLC filed → EIN → Apple Dev Individual ($99, instant)
    ↓
Phase C (TestFlight Prep, 1 session) ←── Submit when Apple Dev active
    ↓
TestFlight live — 20-50 testers
```

**The code will be ready before Apple Dev is. Execute Phase A now.**

### Before Phase A (This Session / Tonight)
1. **Resolve settings.tsx merge conflict** — 5 minutes, unblocks EAS builds
2. **Start Phase A** — plan is written, dependencies analyzed, ready to execute

### During the LLC Wait Window (Weeks 1-6)
1. Phase A execution (archive premature modules, make all features free)
2. Phase B execution (onboarding smoke test, calendar sync, crash reporting, analytics, feedback)
3. Record 60-sec app demo (15 min, this week)
4. Claim @shiftwell_sleep handles (5 min, this week)
5. Build waitlist landing page
6. Write LinkedIn founder story (Sim's voice required)

---

## What's Coming Next

**Cycle 17 triggers:**
- **Marketing: April 17** (>3 days since Apr 14 — fires guaranteed; OffShift investigation on deck)
- **Engineering:** Fires **immediately** when Sim resolves settings.tsx or starts Phase A
- **Product:** Phase A/B completion
- **Operations:** LLC filed or FINANCIAL_TRACKER changes
- **Strategy:** Monthly (May 2026) unless phase completed first

---

*Generated by CEO Loop v1.0 — Cycle #16 — 2026-04-15 (Midday)*
