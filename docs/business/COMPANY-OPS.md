# ShiftWell Company Operations

**Last updated:** 2026-04-15 (Evening)
**CEO Loop version:** 1.0
**Cycle count:** 17

## Department Status

| # | Department | Status | Last Run | Trigger State | Notes |
|---|-----------|--------|----------|---------------|-------|
| 1 | Product | Active | 2026-04-07 (Eve) | Next: Phase A/B/C completion or feedback | Updated VISUAL_ROADMAP.md — Phase A/B/C ship path active; Phase 28 complete |
| 2 | Engineering | Active | 2026-04-08 (Morn) | Next: STATE.md change or test failure | 1,059 tests / 71 suites — YELLOW: 14 TS errors (merge conflict settings.tsx); npm test script fixed |
| 3 | Marketing | Active | 2026-04-14 (Eve) | Next: >3 days since last run — fires Apr 17 | AfterShift investigated (LOW-MEDIUM, tracker not planner, PA #14 closed); calendar copy sharpened across docs; Week 2 content drafted; OffShift app investigation scheduled for Cycle 16 (Apr 17) |
| 4 | Operations | Active | 2026-04-07 | Next: financial change or LLC filed | All 5 legal gates pending; Expo SDK 5 patches behind |
| 5 | Strategy & Planning | Active | 2026-04-07 (Eve) | Next: Phase A-C completion or monthly | Slim-down pivot confirmed aligned; no business plan changes needed |
| 6 | Design | Dormant | -- | Activates: TestFlight launch | -- |
| 7 | Social Media | Dormant | -- | Activates: TestFlight launch | -- |
| 8 | Customer Success | Dormant | -- | Activates: TestFlight launch | -- |
| 9 | Advertising | Dormant | -- | Activates: App Store launch | -- |
| 10 | Sales | Dormant | -- | Activates: $2.5K MRR | -- |

## Pending Approvals

| # | Item | Department | Priority | Decision Needed |
|---|------|-----------|----------|-----------------|
| 1 | LLC company name: Circadian Labs vs Vigil Health vs ShiftWell | Strategy/Ops | CRITICAL | Name decision starts 5-week Apple Dev clock |
| 2 | Individual vs Organization Apple Developer enrollment | Strategy | HIGH | Individual = instant TestFlight; Org = full brand but 5+ weeks |
| 3 | Trademark clearance search + filing | Operations | HIGH | Can parallelize with LLC; protect name before marketing spend |
| 5 | Commit and push Phase 10/11 staged changes | Engineering | MEDIUM | 11 modified files + 1 new test; should be committed before TestFlight build |
| 11 | Resolve merge conflict in `app/(tabs)/settings.tsx` | Engineering | CRITICAL | Recommendation: **keep WORKTREE version**. Phase A archives ReferralCard (HEAD's `src/lib/growth/`); worktree adds WeeklyBriefToggle (marked "must stay active" in Phase A plan). Accept worktree, remove markers, commit. |
| 12 | Add investor summary line to BUSINESS-PLAN-V2.md | Strategy | LOW | "Enterprise module staged in v2 archive, reintroduced on first hospital inquiry" — protects enterprise story in pre-seed pitch |
| 6 | Record 60-second app walkthrough (screen capture) | Marketing | HIGH | Single highest-value pre-launch asset; app is ready now |
| 7 | Build waitlist landing page (shiftwell.com) | Marketing | HIGH | Email capture pre-launch; every week delayed = fewer Day 1 users |
| 8 | LinkedIn founder story in Sim's voice | Marketing | HIGH | Medical audience trusts MD voice; Claude can draft structure, Sim must write it |
| 9 | Claim social handles (@shiftwell_sleep) | Marketing | MEDIUM | Name squatting risk; claim now before marketing spend |
| 10 | App Store subtitle approval: "Circadian Plans, Auto-Scheduled" | Marketing | MEDIUM | Required for ASO listing; approve before TestFlight build |
| 13 | Google iOS client ID for app.json | Engineering | HIGH | Replace PLACEHOLDER_CLIENT_ID in app.json:92 iosUrlScheme — need real client ID from Google Cloud Console (create project → OAuth 2.0 iOS credential → client ID) |
| 16 | Investigate OffShift app (new competitor) | Marketing | MEDIUM | "OffShift – Shift Work Sleep" (App Store ID 6756209316) surfaced during AfterShift investigation. Features unknown. Check next Marketing cycle (Apr 17). |
| 17 | Review + approve Week 2 content drafts | Marketing | HIGH | SWSD explainer post + caffeine timing carousel drafted in `docs/marketing/CONTENT-WEEK2-APR14.md`. Both require Sim clinical accuracy review before posting. |

## Recent Activity

### Cycle 17 — 2026-04-15 (Evening)
**Departments dispatched:** None (quiet cycle — no triggers met)
**Autonomous fixes:** None needed.

**Trigger evaluation:**
- Marketing: Last run Apr 14, today Apr 15 = 1 day. Threshold >3 days — fires **Apr 17**. Skip.
- Engineering: settings.tsx conflict unchanged (2 markers confirmed). No code commits or STATE.md activity since Cycle 14. Skip.
- Product: No commits, STATE.md unchanged (Apr 7), no customer feedback. Skip.
- Operations: FINANCIAL_TRACKER unchanged (Apr 2). No LLC filed. Not first of month. Skip.
- Strategy: No phase completed. Not first of month (May 2026). Skip.

**🚨 PERSONAL — 2025 TAX DEADLINE: TONIGHT.** April 15 is today. Federal deadline is midnight. File via TurboTax or submit Form 4868 at IRS.gov NOW. Do not let this pass midnight.

**No artifacts committed this cycle.**

---

### Cycle 16 — 2026-04-15 (Midday)
**Departments dispatched:** None (quiet cycle — no triggers met)
**Autonomous fixes:** None needed.

**Trigger evaluation:**
- Marketing: Last run Apr 14, today Apr 15 = 1 day. Threshold >3 days — fires **Apr 17**. Skip.
- Engineering: No new commits. STATE.md unchanged (Apr 7). settings.tsx conflict still pending Sim. Skip.
- Product: No commits, STATE.md unchanged (Apr 7), no customer feedback. Skip.
- Operations: FINANCIAL_TRACKER unchanged (Apr 2). Not first of month. No LLC filed. Skip.
- Strategy: No phase completed. Not first of month. Skip.

**🚨 PERSONAL — 2025 TAX FILING DUE TODAY (MIDDAY):** April 15 deadline is tonight. File via TurboTax NOW or submit Form 4868 at IRS.gov (5 min, buys 6 months). Do not wait until evening.

**No artifacts committed this cycle.**

---

### Cycle 15 — 2026-04-15 (Morning)
**Departments dispatched:** None (quiet cycle — no triggers met)
**Autonomous fixes:** None needed.

**Trigger evaluation:**
- Marketing: Last run Apr 14, today Apr 15 = 1 day. Threshold >3 days — fires **Apr 17**. Skip.
- Engineering: settings.tsx conflict unchanged (14 TS errors); no STATE.md or commit activity since Cycle 14. Skip.
- Product: No commits, STATE.md unchanged (Apr 7), no customer feedback file exists. Skip.
- Operations: FINANCIAL_TRACKER unchanged (Apr 2). No ShiftWell hard legal deadlines within 14 days. Not first of month. Skip.
- Strategy: No phase completed, not first of month. Skip.

**🚨 PERSONAL — 2025 TAX FILING DUE TODAY:** April 15 is the federal tax deadline. File via TurboTax immediately or submit Form 4868 (extension) by midnight to avoid penalties.

**No artifacts committed this cycle.**

---

### Cycle 14 — 2026-04-14 (Evening)
**Departments dispatched:** Marketing (triggered — 3 days since Apr 11 run)
**Autonomous fixes:** None needed.

**Trigger evaluation:**
- Marketing: Last run Apr 11, today Apr 14 = 3 days. Threshold met — **TRIGGERED**.
- Engineering: settings.tsx conflict unchanged, no STATE.md or commit activity. Skip.
- Product: No commits, STATE.md unchanged, no customer feedback. Skip.
- Operations: FINANCIAL_TRACKER unchanged (Apr 2). No LLC filed. Not first of month. Skip.
- Strategy: No phase completed, not first of month. Skip.

**Marketing key findings (Cycle 14):**
- **AfterShift investigated (PA #14 CLOSED):** Indie dev (Antti Aittamaa, Ireland). Sleep TRACKER not planner — reads Apple Health data, shows recovery scores, zero calendar output. No reviews yet, no funding. Threat: LOW-MEDIUM. Not a brand conflict. Watch for: any update adding plan generation or calendar output.
- **OffShift (ID 6756209316)** surfaced in same search. Unknown features. Added as PA #16 for Cycle 15.
- **Week 2 content drafted:** SWSD explainer (LinkedIn/Instagram, ~240 words, cites Drake 2004/2013) + caffeine timing carousel (7 slides, adenosine → half-life → circadian timing → shift-specific cutoff rules). Both require Sim approval. → `docs/marketing/CONTENT-WEEK2-APR14.md`
- **Calendar copy sharpened (PA #15 CLOSED):** 7 instances updated across MARKETING-PLAN.md (4) and APP_STORE_LISTING.md (3). Language now: "Not an overlay. Not suggestions. Actual sleep blocks." Directly counters Rise Science's overlay narrative.

**Artifacts committed:** COMPETITOR_LOG.md, MARKETING-PLAN.md, APP_STORE_LISTING.md, CONTENT-WEEK2-APR14.md, MARKETING-CYCLE-REPORT.md

---

### Cycle 13 — 2026-04-13 (Morning)
**Departments dispatched:** None (quiet cycle — no triggers met)
**Autonomous fixes:** None needed.

**Trigger evaluation:**
- Marketing: Last run Apr 11, today Apr 13 = 2 days. Threshold >3 days — fires **tomorrow Apr 14**. Skip.
- Engineering: settings.tsx conflict confirmed still pending (merge conflict markers, 14 TS errors). No new commits or STATE.md activity. Skip.
- Product: No commits, STATE.md unchanged since Apr 7, no customer feedback. Skip.
- Operations: FINANCIAL_TRACKER last modified Apr 2 — no change. No LLC filed. Not first of month. Skip.
- Strategy: No phase completed, not first of month. Skip.

**🚨 TAX DEADLINE ESCALATION — FINAL WARNING:** April 15 is **TOMORROW**. Last opportunity to file before deadline. TurboTax: upload W-2 and file tonight. Form 4868 by Apr 15 if extension needed.

**No artifacts committed this cycle.**

---

### Cycle 12 — 2026-04-12 (Evening)
**Departments dispatched:** None (quiet cycle — no triggers met)
**Autonomous fixes:** None needed.

**Trigger evaluation:**
- Marketing: Last run Apr 11, today Apr 12 = 1 day. Threshold >3 days — fires Apr 14 (**2 days**). Skip.
- Engineering: settings.tsx conflict confirmed still present (2 markers). No new commits or STATE.md activity. Skip.
- Product: No commits, STATE.md unchanged, no customer feedback. Skip.
- Operations: FINANCIAL_TRACKER last modified Apr 2 — no change. No LLC filed. Not first of month. Skip.
- Strategy: No phase completed, not first of month. Skip.

**⚠️ Tax deadline escalation:** April 15 is **3 days away**. This is the last evening cycle before the deadline. File tonight or tomorrow.

**No artifacts committed this cycle.**

---

### Cycle 11 — 2026-04-12 (Midday)
**Departments dispatched:** None (quiet cycle — no triggers met)
**Autonomous fixes:** Corrected Marketing trigger description ("fires tomorrow" → "fires Apr 14, 2 days away") in department table.

**Trigger evaluation:**
- Marketing: Last run Apr 11, today Apr 12 = 1 day. Threshold >3 days — fires Apr 14 (**2 days**). Skip.
- Engineering: settings.tsx conflict unchanged; no STATE.md or commit activity since Cycle 10. Re-dispatch adds zero value. Skip.
- Product: No commits, no STATE.md changes, no customer feedback. Skip.
- Operations: FINANCIAL_TRACKER last updated Apr 2 — no change. No LLC filed. Not first of month. Skip.
- Strategy: No phase completed, not first of month. Skip.

**Critical alert — personal:** Sim's **2025 tax filing** due **April 15** — now **3 days away**. Upload W-2 to TurboTax immediately.

**No artifacts committed this cycle.**

---

### Cycle 10 — 2026-04-12 (Morning)
**Departments dispatched:** None (quiet cycle — no triggers met)
**Autonomous fixes:** None needed.

**Trigger evaluation:**
- Marketing: Last run Apr 11, today Apr 12 = 1 day. Threshold >3 days — fires Apr 14 (**tomorrow**). Skip.
- Engineering: settings.tsx conflict still present; no STATE.md activity; no new commits. Re-dispatch adds zero value. Skip.
- Product: No commits, no STATE.md changes, no customer feedback. Skip.
- Operations: FINANCIAL_TRACKER unchanged (Apr 2). No ShiftWell legal deadlines in PROJECT.md within 14 days. Not first of month. Skip. *(Note: April 15 personal tax deadline flagged in CEO Briefing — outside Operations scope but time-critical.)*
- Strategy: No phase completed, not first of month. Skip.

**Critical alert — non-ShiftWell:** Sim's **2025 personal tax filing** due April 15 (3 days). Upload W-2 to TurboTax. Unrelated to ShiftWell but flagged in CEO Briefing as urgent.

**No artifacts committed this cycle.**

---

### Cycle 9 — 2026-04-11 (Evening)
**Departments dispatched:** Marketing (triggered — 4 days since Apr 7 run, threshold >3 days)
**Autonomous fixes:** None needed.

**Trigger evaluation:**
- Marketing: Last run Apr 7, today Apr 11 = 4 days. Threshold >3 days — **TRIGGERED** (overdue since Apr 10).
- Engineering: settings.tsx merge conflict still present (confirmed); STATE.md unchanged since Apr 7. No re-dispatch value.
- Product: No commits, STATE.md unchanged, no customer feedback. Skip.
- Operations: FINANCIAL_TRACKER unchanged (Apr 2). No LLC filing. Not first of month. Skip.
- Strategy: No phase completed, not first of month. Skip.

**Marketing key findings:**
- Arcashift shipped Jet Lag Planner + "Sleep Groove" score + UI refresh. Threat: MEDIUM → MEDIUM-HIGH. Competing in 3 directions = engineering resources thinning.
- Rise Science won Apple Best App of 2026 — credibility moat. Calendar integration is OVERLAY not plan-writing. Creates brand confusion — all ShiftWell copy needs updating.
- Timeshifter received CDC Yellow Book 2026 citation + expanded United Airlines partnership. Institutional moat in jet lag niche only.
- **NEW competitor:** AfterShift: Sleep & Shift Work App — direct naming overlap surfaced in App Store search. Priority investigation needed.
- Week 2 content (Apr 14-18): SWSD explainer + caffeine timing carousel should be drafted by Claude this week.

**New Pending Approvals:** #14 (AfterShift investigation), #15 (copy update: "writes your plan to your calendar")

**Artifacts committed:** COMPETITOR_LOG.md, MARKETING-CYCLE-REPORT.md

---

### Cycle 8 — 2026-04-09 (Midday)
**Departments dispatched:** None (quiet cycle — no triggers met)
**Autonomous fixes:** None needed this cycle.

**Trigger evaluation:**
- Engineering: settings.tsx conflict markers confirmed still present; STATE.md unchanged since Apr 7; re-dispatch adds zero value. Skip.
- Product: No commits since C7, STATE.md unchanged, no customer feedback. Skip.
- Marketing: Last run Apr 7, today Apr 9 = 2 days. Threshold >3 days — **fires tomorrow (Apr 10)**. Skip.
- Operations: FINANCIAL_TRACKER unchanged (Apr 2). No LLC filing. Not first of month. Skip.
- Strategy: No phase completed, not first of month. Skip.

**Critical path unchanged:** LLC filing is the sole unblocked action Sim can take today. Marketing fires guaranteed tomorrow.

---

### Cycle 7 — 2026-04-09 (Morning)
**Departments dispatched:** None (quiet cycle — no triggers met)
**Autonomous fix:** Updated test count in CLAUDE.md — 3 instances of "116 tests" corrected to "1,059 tests (71 suites)". Count was stale since Cycle 1; now accurate across Quick Start, What This Is, and Project Rules sections.

**Trigger evaluation:**
- Engineering: settings.tsx conflict markers still present. TS error check inconclusive (npm/npx not in shell PATH this session). STATE.md unchanged since Apr 7 (last Engineering run Apr 8). Skip.
- Product: No commits since Cycle 6, STATE.md unchanged. Skip.
- Marketing: Last run Apr 7, today Apr 9 = 2 days. Threshold >3 days — **fires tomorrow (Apr 10)**. Skip.
- Operations: FINANCIAL_TRACKER unchanged (Apr 2). No PROJECT.md legal deadlines. Not first of month. Skip.
- Strategy: No phase completed, not first of month. Skip.

**Note on TS check:** `npx tsc --noEmit` returns 0 in this shell (npm not in PATH). Conflict markers still confirmed present in settings.tsx lines 16, 23, 46, 336, 340, 384. Previous cycle analysis stands — keep worktree version. Fix is Sim's 5-minute action.

**Artifacts committed:** CLAUDE.md (test count correction)

### Cycle 6 — 2026-04-08 (Evening)
**Departments dispatched:** None (quiet cycle — no triggers met)
**Autonomous fix:** C10 status corrected from `ready` → `blocked` — PLACEHOLDER_CLIENT_ID found in `app.json:92` (iosUrlScheme). Previous check only scanned `src/`. Added PA #13 for Sim.

**Pipeline verification (auto-checks run):**
- C7 (privacyManifests): ✅ CONFIRMED — `privacyManifests` key present in app.json
- C8 (HealthKit entitlements): ✅ CONFIRMED — `healthkit.background-delivery` present in app.json
- C9 (EAS production profile): ✅ CONFIRMED — `"production"` profile present in eas.json
- C10 (Google OAuth): ❌ CORRECTED — `PLACEHOLDER_CLIENT_ID` in `app.json:92` iosUrlScheme
- C12 (installedAt): ✅ CONFIRMED — `AsyncStorage.setItem('installedAt', ...)` in `app/(onboarding)/calendar.tsx`

**Trigger evaluation:**
- Engineering: settings.tsx merge conflict unchanged; no STATE.md activity. Re-dispatch adds no value — fix is Sim's 5-min action.
- Product: No new commits, no STATE.md change, no customer feedback.
- Marketing: 1 day since last run (threshold >3 days, triggers Apr 10). Skip.
- Operations: FINANCIAL_TRACKER unchanged; no hard project deadlines. Skip.
- Strategy: No phase completed, not first of month. Skip.

**New Pending Approval:** PA #13 — Google iOS client ID (app.json:92 PLACEHOLDER_CLIENT_ID)

### Cycle 5 — 2026-04-08 (Midday)
**Departments dispatched:** None (quiet cycle — no triggers met)
**Autonomous fix:** Updated C11 status to `done` in Code pipeline (npm test script confirmed fixed Cycle 4).

**Trigger evaluation:**
- Engineering: settings.tsx merge conflict unchanged; STATE.md last updated 2026-04-07 — no new activity. No re-dispatch value.
- Product: No commits since Cycle 4, no STATE.md change, no customer feedback.
- Marketing: 1 day since last run (threshold >3 days, triggers Apr 10).
- Operations: FINANCIAL_TRACKER last modified Apr 2 — no change.
- Strategy: No phase completed, not first of month.

**Key intel — settings.tsx conflict resolution recommendation:**
Deep analysis of both conflict sides against Phase A plan reveals the worktree version is the correct choice:
- **Conflict 1 (lines 16-46 imports):** Worktree removes ReferralCard import (growth module being archived in Phase A) and adds WeeklyBriefToggle (explicitly marked "must stay active" in Phase A plan). Worktree is correct.
- **Conflict 2 (lines 336-384 UI sections):** Worktree replaces "COMMUNITY" (ReferralCard) with "AI COACHING" (WeeklyBriefToggle) + "PROFILE" (user preferences editor). Both are functional, non-premature features. Worktree is correct.
- **Action for Sim:** In settings.tsx, remove `<<<<<<< HEAD` through `=======` (keep worktree content), remove `>>>>>>> worktree-agent-a211ed4f` markers, commit. Both conflict sections: accept worktree.

**Status:** Critical path unchanged — LLC filing is sole unblocked action. Code will be TestFlight-ready before Apple Dev enrollment completes.

### Cycle 4 — 2026-04-08 (Morning)
**Departments dispatched:** None (quiet cycle — no triggers met)
**Autonomous fix:** Added `"test": "jest"` to package.json scripts — 3-cycle pending item resolved

**Trigger evaluation:**
- Engineering: settings.tsx merge conflict still present (14 TS errors), but already fully documented in PA #11 — re-dispatch adds no value. Waiting on Sim.
- Product: No commits since Cycle 3, no STATE.md changes, no customer feedback
- Marketing: 1 day since last run (threshold >3 days, triggers Apr 10)
- Operations: FINANCIAL_TRACKER last modified Apr 2, unchanged
- Strategy: No phase completed, not first of month

**Status:** No code was written overnight. Critical path is still LLC filing → Apple Dev enrollment. All blockers documented and waiting on Sim. Next meaningful trigger: Marketing (Apr 10), or Sim starts Phase A execution.

**Artifacts committed:** package.json (npm test script)

### Cycle 3 — 2026-04-07 (Evening)
**Departments dispatched:** Engineering, Product, Strategy & Planning
**Marketing/Operations:** Not triggered (Marketing <3 days since last run; FINANCIAL_TRACKER unchanged)

**Key findings:**
- **CRITICAL:** `app/(tabs)/settings.tsx` has unresolved git merge conflict from `worktree-agent-a211ed4f` — 14 TS errors, will break EAS build. Must resolve before Phase A.
- Test count jumped 383→1,059 (71 suites) — 3 new test files for fatigue-model, timezone-handler, circadian-protocols-multi all green
- Phase 28 (Employer Dashboard) confirmed complete; Phase A slim-down plan written and ready to execute
- VISUAL_ROADMAP.md updated: 38-phase tracker replaced with Phase A/B/C ship path
- Slim-down strategy confirmed aligned with existing business plan — free TestFlight was already planned (paywall activates Month 3-4)
- Enterprise archival does NOT hurt investor story if documented as "demand-gated v2 staging"
- Phase A + Phase B can be completed entirely within the LLC formation waiting window (~5-6 weeks)
- Critical path to TestFlight is now LLC filing, not code — code will be ready first

**Slim-down engineering risks flagged:**
- Resolve settings.tsx merge conflict FIRST before Phase A (risk of compounding errors)
- CircadianForecastCard → prediction-store import must be removed before archiving prediction-store
- Run `tsc --noEmit` after each slim-down Task (not just at the end)

**New Pending Approvals added:** #11 settings.tsx merge conflict (CRITICAL), #12 investor summary line

**Artifacts committed:** VISUAL_ROADMAP.md (Product — Phase A/B/C ship path)

### Cycle 2 — 2026-04-07 (Midday)
**Departments dispatched:** Marketing
**All others:** Not triggered (no STATE.md changes, no financial changes, not first of month)

**Key findings:**
- "Shift worker sleep" keyword cluster is uncontested in App Store — ShiftWell has first-mover ASO advantage
- Timeshifter owns "jet lag" keywords (not shift work); Rise Science owns "energy/sleep debt" — neither owns our niche
- Arcashift users actively frustrated (persistent bugs) — primed to switch; monitor their 1-star reviews
- App name is blocking ASO copy, social handles, domain registration — CRITICAL path item
- 60-second app screen recording is single highest-value pre-launch marketing asset (app is ready to record now)
- Waitlist landing page: every week of delay = fewer Day 1 users; build before TestFlight
- Best pre-launch window (~5-6 weeks while waiting on LLC) maps perfectly to 6-week content calendar

**New Pending Approvals added:** App name finalization, LinkedIn founder story (Sim voice), waitlist page launch, social handle claims, app demo recording

**Artifacts committed:** COMPETITOR_LOG.md (Marketing Analysis appended), MARKETING-CYCLE-REPORT.md (new)

### Cycle 1 — 2026-04-07 (Morning)
**Departments dispatched:** Engineering, Product, Operations, Strategy & Planning
**Marketing:** Skipped (WebSearch cost; no urgent intel)

**Key findings:**
- `npm test` broken — no script in package.json; actual command is `npx jest` (383 tests pass)
- CLAUDE.md documents "116 tests" — outdated (383 actual)
- STATE.md progress counters stale (shows 2 phases; ROADMAP shows 5 complete)
- 11 files with uncommitted Phase 10/11 changes; branch 165 commits ahead, never pushed
- BUSINESS_PLAN.md had wrong pricing ($4.99/mo) — corrected to $6.99/mo
- Google OAuth uses placeholder client ID — must replace before any user testing
- Expo SDK 55.0.6 is 5 patches behind (55.0.11 available)

**Artifacts committed:** VISUAL_ROADMAP.md, BUSINESS_PLAN.md

## Activation Triggers

| Department | Trigger Condition | How to Detect |
|-----------|-------------------|---------------|
| Design | TestFlight build distributed | `eas build:list` shows distributed build |
| Social Media | TestFlight build distributed | Same as Design |
| Customer Success | TestFlight build distributed | Same as Design |
| Advertising | App published on App Store | App Store Connect status = "Ready for Sale" |
| Sales | MRR >= $2,500 | RevenueCat dashboard or FINANCIAL_TRACKER.md |

## Launch Pipeline

Three parallel tracks to App Store. Operations department auto-checks each step every cycle.

**Statuses:** `blocked` → `ready` → `waiting-on-sim` → `in-progress` → `done`

### Track 1: Legal (gates TestFlight)

| # | Step | Status | Blocked By | Auto-Check | Notes |
|---|------|--------|-----------|------------|-------|
| L1 | LLC filing (FL) | waiting-on-sim | -- | Sim confirms filing receipt | Pick name: ShiftWell recommended |
| L2 | EIN from IRS | blocked | L1 | Sim provides EIN number | Free, instant online after LLC |
| L3 | Business bank account | blocked | L2 | Sim confirms account open | Mercury or local bank |
| L4a | Apple Dev (Individual) | blocked | Apple ID | `eas whoami` shows paid account | Instant, $99 — bridge to TestFlight |
| L4b | Apple Dev (Organization) | blocked | L1+L2+D-U-N-S | `eas whoami` shows org account | 5+ weeks, full brand on App Store |
| L5 | D-U-N-S number | blocked | L1 | Sim confirms D-U-N-S received | 1-5 business days after LLC |
| L6 | Trademark clearance | blocked | L1 | Sim confirms search complete | ~$300-500, 2 weeks, parallelizable |
| L7 | Trademark filing | blocked | L6 | Sim confirms USPTO filed | Class 9 + 44, ~$500-700 |

### Track 2: Code (gates clean build)

| # | Step | Status | Blocked By | Auto-Check | Notes |
|---|------|--------|-----------|------------|-------|
| C1 | BUG-01 trial start | in-progress | -- | `grep "startTrial" src/store/premium-store.ts` in initializePremium | Phase 7 |
| C2 | BUG-02 score pipeline | in-progress | -- | `grep "finalizeDay" app/_layout.tsx` in AppState handler | Phase 7 |
| C3 | BUG-03 downgrade screen | in-progress | -- | `test -f app/downgrade.tsx` | Phase 7 |
| C4 | BUG-04 TypeScript errors | in-progress | -- | `npx tsc --noEmit 2>&1 \| grep -c error` = 0 | 14 TS errors re-opened: merge conflict in settings.tsx (worktree-agent-a211ed4f) |
| C5 | BUG-05 computeDelta | done | -- | Distinct args in useAdaptivePlan.ts | Fixed in Phase 7 |
| C6 | BUG-06 LIVE-03 score | done | -- | todayScore() in startSleepActivity | Fixed in Phase 7 |
| C7 | Privacy manifest | ready | -- | `grep "privacyManifests" app.json` | TF-01, 15-min config |
| C8 | HealthKit entitlements | ready | -- | `grep "healthkit.background-delivery" app.json` | TF-02 |
| C9 | EAS production profile | ready | -- | `grep '"production"' eas.json` | TF-04 |
| C10 | Google OAuth real ID | blocked | -- | No "placeholder" in OAuth config | PLACEHOLDER_CLIENT_ID in app.json:92 (`iosUrlScheme`) — must replace with real Google iOS client ID (Cycle 6 finding) |
| C11 | npm test script | done | -- | `grep '"test"' package.json` | Fixed Cycle 4 — `"test": "jest"` added to package.json |
| C12 | installedAt timestamp | ready | -- | `grep "installedAt" src/` in onboarding completion | TF-05 |

### Track 3: Assets (gates App Store submission)

| # | Step | Status | Blocked By | Auto-Check | Notes |
|---|------|--------|-----------|------------|-------|
| A1 | App icon (1024x1024) | ready | -- | `test -f assets/images/icon.png` + not default Expo | TF-03 |
| A2 | Splash screen | ready | -- | Custom splash in app.json, not default | TF-03 |
| A3 | Screenshots (1290x2796) | blocked | C1-C3 | Files exist in docs/launch/screenshots/ | After bug fixes |
| A4 | Privacy policy hosted | ready | -- | URL live and returning 200 | APP-04 |
| A5 | Medical disclaimer | ready | -- | `grep "not a substitute" app/` in onboarding | APP-02 |
| A6 | App Store listing copy | ready | -- | APP_STORE_LISTING.md complete | APP-05 |
| A7 | Account deletion | ready | -- | `test -f app/settings/delete-account.tsx` or equivalent | APP-01 |
| A8 | App Review notes | blocked | A3-A7 | Written in docs/launch/ | Last before submission |

### Pipeline Summary

| Track | Total | Done | In Progress | Ready | Blocked |
|-------|-------|------|-------------|-------|---------|
| Legal | 7 | 0 | 0 | 0 | 7 |
| Code | 12 | 3 | 4 | 4 | 1 |
| Assets | 8 | 0 | 0 | 5 | 3 |
| **Total** | **27** | **3** | **4** | **9** | **11** |

### Critical Path

```
LLC (L1) → EIN (L2) → Apple Dev Individual (L4a) → TestFlight build
                                                      ↑
Bug fixes (C1-C3) + Privacy manifest (C7) + EAS profile (C9) ──┘
```

**Shortest path to TestFlight:** LLC filed → EIN (same day) → Apple Dev Individual ($99, instant) → fix C1-C3 + C7 + C9 → `eas build --platform ios --profile production` → `eas submit` → TestFlight live.

**Estimated time if LLC filed today:** ~1 week to TestFlight (LLC processing + bug fixes in parallel).

## Smart Throttle

Departments only dispatch when their trigger conditions fire. If no triggers are met for a department in a cycle, it is skipped entirely. Silent cycles (where no departments trigger) are expected behavior — not a bug. This keeps API costs proportional to actual work.

## Configuration

- **Max parallel subagents:** 3
- **Budget per cycle:** $5 max
- **Approval required for:** Financial spend >$50, external comms, strategic pivots, App Store submissions, hiring, ad campaigns
