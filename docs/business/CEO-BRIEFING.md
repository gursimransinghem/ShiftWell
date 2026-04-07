# CEO Briefing — ShiftWell

**Last cycle:** 2026-04-07 (Midday)
**Next scheduled:** Next CEO Loop run
**Cycle #:** 2

---

## Status Dashboard

| Department | Health | Last Action | Next Trigger |
|-----------|--------|-------------|--------------|
| Product | ✅ GREEN | Updated VISUAL_ROADMAP.md — phases 7-11 logged | Phase completion or customer feedback |
| Engineering | ⚠️ YELLOW | 383 tests passing, 0 TS errors; npm test script missing | STATE.md change or test failure |
| Marketing | ✅ GREEN | ASO strategy + 6-week pre-launch content calendar complete | >3 days since last run (Cycle 3) |
| Operations | ✅ GREEN | Full compliance audit; all gates confirmed pending | LLC filed or financial change |
| Strategy | ✅ GREEN | Pricing corrected; Individual dev enrollment flagged | Phase completion or monthly (May 2026) |
| Design | 💤 Dormant | — | TestFlight launch |
| Social Media | 💤 Dormant | — | TestFlight launch |
| Customer Success | 💤 Dormant | — | TestFlight launch |
| Advertising | 💤 Dormant | — | App Store launch |
| Sales | 💤 Dormant | — | $2.5K MRR |

---

## Needs Your Approval

These are decisions only Sim can make. Nothing was executed without approval.

### 🔴 CRITICAL — LLC Company Name Decision
**What:** Pick the company name: **ShiftWell**, Circadian Labs, or Vigil Health.
**Why now:** LLC → EIN → D-U-N-S → Apple Developer is a serial chain. Every week of delay = a week added to TestFlight launch. The name also blocks social handle claims, domain registration, and ASO copy.
**Recommendation (Strategy):** File as ShiftWell today. No USPTO conflicts found. Can update branding later before marketing spend.

### 🟠 HIGH — Record 60-Second App Walkthrough *(NEW — Cycle 2)*
**What:** Screen-record a 60-second demo: enter shift schedule → plan generates → exports to calendar.
**Why now:** This is the single highest-value pre-launch marketing asset. The app is functionally complete and ready to record. No production equipment needed — screen capture is enough.
**Action:** Record on device/simulator whenever convenient. Takes 15 minutes.

### 🟠 HIGH — Build Waitlist Landing Page *(NEW — Cycle 2)*
**What:** shiftwell.com email capture. Offer: "Get early access + free 30-day premium trial."
**Why now:** Every week without a waitlist page is a week where pre-launch interest has nowhere to go. Marketing can draft copy; Sim needs to approve and launch.
**Recommendation:** This and the social handle claim can be done this week.

### 🟠 HIGH — LinkedIn Founder Story *(NEW — Cycle 2)*
**What:** A first-person LinkedIn post from Sim — "I built this app at 2AM after a 12-hour ER shift."
**Why:** The physician-built narrative is ShiftWell's strongest competitive differentiator. Medical audience trusts MD voice. Claude can draft the structure; Sim must write it in his own words.

### 🟠 HIGH — Individual vs Organization Apple Developer Enrollment
**What:** Individual enrollment is instant + $99. Organization requires D-U-N-S (~5 weeks after LLC). Both support TestFlight.
**Trade-off:** Individual = ship to TestFlight in days. Organization = full brand credibility on App Store but 5+ week wait. You can transfer later.
**Recommendation (Strategy):** If 5 weeks is unacceptable, enroll as Individual now.

### 🟠 HIGH — Trademark Filing
**What:** Need clearance search (~$300-500) before filing Class 9 + Class 44 (~$500-700). Can parallelize with LLC.
**Why now:** Once social media starts and you spend on marketing, the name becomes an asset worth protecting.

### 🟡 MEDIUM — Claim Social Handles *(NEW — Cycle 2)*
**What:** @shiftwell_sleep on Instagram and TikTok. Takes 5 minutes.
**Why now:** Name squatting is real. Even if posting doesn't start for 4 weeks, claim the handle today.

### 🟡 MEDIUM — Commit Phase 10/11 Staged Changes
**What:** 11 modified files + 1 new test file are uncommitted. Includes account deletion, EAS config, app.json updates, medical disclaimers.
**Risk:** Branch is 165 commits ahead of origin; no remote backup of any v1.1 work.
**Recommendation (Engineering):** Confirm these are ready, then commit + push.

### 🟡 MEDIUM — App Store Subtitle Approval *(NEW — Cycle 2)*
**What:** Marketing recommends: "Circadian Plans, Auto-Scheduled" (30 chars).
**Why:** Communicates automation (key differentiator) and differentiates from tracking apps.

### 🟢 LOW — Fix `npm test` script
**What:** Add `"test": "jest"` to package.json. One line.
**Impact:** CEO Loop, CLAUDE.md, and CI will all work as documented.

---

## What Happened This Cycle

**1 of 5 active departments ran.** Engineering/Product/Operations/Strategy not triggered (no STATE.md changes, no financial changes, not first of month). Marketing triggered: first-ever run, explicitly deferred from Cycle 1.

### Marketing — Cycle 2
**Key finding:** The "shift worker sleep" keyword cluster is **genuinely uncontested** in the App Store. Timeshifter owns jet-lag search; Rise Science owns "energy/sleep debt." Nobody owns "night shift sleep app," "nurse sleep schedule," or "shift work sleep disorder" — these are ShiftWell's to take at launch.

**Competitive positioning:**
- vs. Timeshifter: $20/yr cheaper, calendar sync, dynamic rescheduling. Their users are travelers, not shift workers.
- vs. Rise Science: Beautiful UI but algorithm breaks for irregular schedules. Multiple user complaints confirm this.
- vs. Arcashift: Same price, persistent bugs, users actively frustrated and primed to switch.
- vs. Wearables: "They tell you how you slept. We tell you how to sleep."

**ASO strategy:**
- Primary keywords to own: "night shift sleep app," "shift worker sleep," "nurse sleep schedule," "shift work sleep disorder"
- App name recommendation: `ShiftWell – Shift Worker Sleep` (30 chars, keyword-loaded)
- Subtitle: `Circadian Plans, Auto-Scheduled`
- Keyword field: `night shift,shift work,circadian,nurse sleep,paramedic,rotation,sleep schedule,fatigue,schedule`

**6-week pre-launch content calendar:**
1. Week 1: The Problem (stat carousels, founder LinkedIn post)
2. Week 2: The Science (SWSD explainer, circadian infographic)
3. Week 3: The Solution (60-sec app demo, product explainer)
4. Week 4: Physician Credibility (Sim's "Why I built it" — his voice required)
5. Week 5: Social Proof (requires real beta user data — can't be fabricated)
6. Week 6: Launch Readiness (waitlist email blast, countdown posts)

**Artifacts:** `COMPETITOR_LOG.md` (Marketing Analysis appended), `MARKETING-CYCLE-REPORT.md` (new, 285 lines)

---

## The Big Picture

### LLC → TestFlight Critical Path
```
File LLC (ShiftWell) → EIN (same day) → Apple Dev Individual ($99, instant) → TestFlight build
        ↑
This week unlocks everything. Every day of delay = a day off launch.
```

### The 5-6 Week Wait Window — What to Do Now
The LLC processing window maps perfectly to pre-launch marketing setup:
1. Record 60-sec app demo (15 min, this week)
2. Claim @shiftwell_sleep handles (5 min, this week)
3. Build waitlist landing page (can be delegated to Marketing dept next cycle)
4. Write LinkedIn founder story (Sim's voice required)
5. Fix BUG-01-03 (trial auto-start, score finalization, downgrade screen)
6. Replace Google OAuth placeholder client ID
7. Update Expo SDK 55.0.6 → 55.0.11
8. App icon + splash screen finalization

### Immediate code work (unblocked, can do now):
1. Fix BUG-01-03 — pre-TestFlight blockers (Phase 7)
2. Replace Google OAuth placeholder client ID (will crash on real users)
3. Add `"test": "jest"` to package.json (one line)
4. Update Expo SDK to 55.0.11
5. Commit/push Phase 10/11 staged changes (no remote backup)

---

## What's Coming Next

**Cycle 3 triggers:**
- Marketing: Will trigger again in ~3 days (April 10) if not sooner
- Engineering: Will trigger when STATE.md changes (next GSD phase execution)
- Product: Will trigger at next GSD phase completion
- Operations: Will trigger when LLC is filed or FINANCIAL_TRACKER changes
- Strategy: Monthly (May 2026) unless phase completed first

---

*Generated by CEO Loop v1.0 — Cycle #2 — 2026-04-07 (Midday)*
