# COO Assessment: ShiftWell CEO Loop & Project Status

**Prepared for:** Dr. Gursimran Singh, DO
**Date:** 2026-04-18
**Assessor:** COO/Chief of Staff (Audit)
**Scope:** CEO Loop effectiveness, planning phase audit, project reality check, critical decisions

---

## Executive Summary

The CEO Loop is a well-engineered automation that has delivered real value in its first 10 days — but it has hit a wall. Of 20 cycles run, only 5 dispatched any work. The last 15 cycles (Cycles 6-20) produced exactly **zero code changes** and spent most of their budget writing "no triggers met" to a state file. Meanwhile, the project itself is more mature than the loop's reporting suggests: 34,665 lines of source code, 70,498 lines of tests, 200 source files, and 30 app screens. The bottleneck is not code — it's two human decisions (LLC name + Apple Developer enrollment) that have been pending since Cycle 1.

**Bottom line:** Keep the CEO Loop, but restructure it. Kill the 3x/day cadence. Move to 1x/day with an escape hatch. And make the two pending decisions today — every day of delay is a day added to TestFlight.

---

## Part 1: CEO Loop Audit

### What the Loop Actually Is

A LaunchAgent-triggered shell script (`ceo-loop.sh`) that runs Claude Code CLI (`claude -p`) 3x/day (8am, 1pm, 7pm ET) using Sonnet with a $5/cycle budget cap. It reads a system prompt (`ceo-prompt.md`) that acts as a COO, evaluates trigger conditions for 5 active departments, dispatches subagents for triggered departments, commits artifacts, and updates state files. Morning cycles also send an iMessage briefing summary.

**Architecture verdict:** Clean, well-designed. Lock file prevents overlaps. Log rotation keeps disk clean. Smart throttle skips departments with no work. Budget-conscious. The engineering is solid.

### Cycle History: The Numbers

| Metric | Value |
|--------|-------|
| Total cycles run | 20 |
| Cycles that dispatched work | 5 (Cycles 1, 2, 3, 9, 14) |
| Cycles that did nothing | 15 (75%) |
| Departments dispatched total | 12 invocations across 5 cycles |
| Days the loop has been running | 10 (Apr 7-16) |
| Actual code commits from CEO Loop | 0 |
| Doc/state commits from CEO Loop | 21 |
| Marketing department dispatches | 4 (Cycles 2, 9, 14 + 1 in Cycle 1) |

### What the Loop Has Actually Done (Value)

**Genuine value delivered:**

1. **Cycle 1 (Apr 7):** Found `npm test` was broken (no script in package.json), caught stale test count (116 vs 383), found 11 uncommitted files, caught wrong pricing in business plan ($4.99 vs $6.99), flagged Google OAuth placeholder. This single cycle justified the entire system.

2. **Cycle 2 (Apr 7):** Competitive ASO analysis — discovered "shift worker sleep" keyword cluster is uncontested. Identified waitlist page and app demo as highest-value pre-launch assets.

3. **Cycle 3 (Apr 7):** Found the settings.tsx merge conflict (14 TS errors). Correctly identified it would block EAS builds. Mapped the Phase A/B/C ship path.

4. **Cycle 4 (Apr 8):** Fixed `npm test` script — the only actual autonomous code fix in 20 cycles.

5. **Cycle 5 (Apr 8):** Deep analysis of the merge conflict — correctly recommended keeping the worktree version with specific line-by-line instructions.

6. **Cycle 6 (Apr 8):** Found PLACEHOLDER_CLIENT_ID in app.json:92 that previous checks missed. Good catch.

7. **Cycle 7 (Apr 9):** Fixed stale test count in CLAUDE.md (116 → 1,059). Minor but correct.

8. **Cycle 9 (Apr 11):** Competitor scan — Arcashift update, Rise Science Apple award, AfterShift new entrant. Actionable intelligence.

9. **Cycle 14 (Apr 14):** AfterShift investigated (low threat — tracker not planner). Week 2 content drafted (SWSD explainer + caffeine carousel). Calendar copy sharpened across docs. Most productive marketing cycle.

10. **Tax deadline alerts (Cycles 10-18):** Caught the April 15 deadline and escalated across 9 consecutive cycles. Useful real-world catch outside project scope.

**Total value items:** ~10 meaningful outputs across 20 cycles.

### What the Loop Has NOT Done (Gaps)

1. **Zero code written.** Despite having an Engineering department, the loop has never written or committed actual code. The "autonomous fix" authority (one-line fixes, config corrections) was used exactly once (package.json test script).

2. **No decisions executed.** Every decision the loop identifies gets added to "Pending Approvals" and waits for Sim. After 20 cycles, there are 14 pending approvals, the oldest from Cycle 1. The loop is a reporter, not an executor.

3. **The merge conflict is still open.** Identified in Cycle 3 (Apr 7), fully analyzed in Cycle 5, instructions written — still unresolved 11 days later. The loop has mentioned it in every single cycle since. It cannot fix it because it classified it as needing approval (even though the fix instructions are trivial).

4. **No progress on the actual critical path.** LLC filing, Apple Developer enrollment, and the merge conflict fix are the three things that matter. The loop can't do any of them.

5. **Marketing content drafted but never approved.** Week 2 content (SWSD explainer, caffeine carousel) drafted Apr 14, sitting in docs/marketing/ awaiting Sim's clinical review. The content window was "Apr 14-18" — it's now Apr 18.

### Cost Analysis

**Estimated spend:**
- 5 cycles with department dispatches: ~$3-5 each = $15-25
- 15 quiet cycles (trigger evaluation only): ~$0.50-1.00 each = $7.50-15
- **Total estimated: $22-40 over 10 days (~$3/day)**

**Cost efficiency:**
- Cycles 1-3 had the highest ROI (found real bugs, mapped strategy, competitive intel)
- Cycles 10-20 had near-zero ROI (all quiet, repeating "no triggers met")
- The 3x/day cadence means 2 out of 3 daily runs are guaranteed to find nothing new

### Verdict: Is the CEO Loop Worth Keeping?

**Yes, but it needs surgery.** The first week proved its value. The second week proved it runs too often. Here's what to change:

| Change | Why |
|--------|-----|
| **1x/day** (morning only) instead of 3x/day | 67% cost savings. Nothing meaningful happens between morning and evening on a side project. |
| **Event-driven triggers** for code changes | Run on `git push` hook instead of timer for Engineering department. |
| **Remove the approval gate on obvious fixes** | The merge conflict fix was fully analyzed in Cycle 5. The loop should have been empowered to fix it. Expand autonomous authority to include resolving its own identified issues when the analysis is high-confidence. |
| **Expire stale approvals** | If a Pending Approval sits for 7 days, auto-escalate in the briefing. After 14 days, either auto-resolve (if within authority) or archive with a "Sim chose not to act" note. |
| **Kill quiet cycle commits** | Don't commit "no departments dispatched" to git. It's noise. Only commit when artifacts are produced. |
| **Add a "skip if nothing changed since last cycle" gate** | If `git log --since="last cycle"` shows 0 non-CEO commits, skip the entire cycle (don't even evaluate triggers). |

---

## Part 2: Planning Phase Audit

### The 38-Phase Landscape

The project has 38 planning phases in `.planning/phases/`. STATE.md claims 77% completion (44/57 plans). Here's reality:

### Phases with Working Code (Verified)

| Phase | Name | Status | Evidence |
|-------|------|--------|----------|
| 01 | Foundation/Onboarding | Complete | 9 onboarding screens in app/(onboarding)/, design system in src/theme/ |
| 02 | Calendar Sync | Complete | 9 files in src/lib/calendar/ (2,232 lines), Google + Apple |
| 03 | Sleep Plan Generation | Complete | 13 files in src/lib/circadian/ (3,584 lines) — core IP |
| 04 | Night Sky Mode / Notifications | Complete | 3 files in src/lib/notifications/ (639 lines) |
| 05 | Live Activities / Recovery Score | Partial | Score logic in src/lib/adherence/ (186 lines), Live Activities blocked on Apple Dev |
| 06 | Premium / Settings | Complete | 5 files in src/lib/premium/ (465 lines) |
| 07 | Critical Bug Fixes | Complete | BUG-05 and BUG-06 fixed, BUG-01 through BUG-04 in progress |
| 08 | Adaptive Brain | Complete | 10 files in src/lib/adaptive/ (1,860 lines) |
| 14 | HealthKit Sleep Ingestion | Complete | 6 files in src/lib/healthkit/ (1,545 lines) |
| 15 | Algorithm Feedback Engine | Complete | 4 files in src/lib/feedback/ (468 lines) |
| 17 | Growth Engine | Complete | 4 files in src/lib/growth/ (498 lines) |
| 18 | RevenueCat Hard Gating | Complete | Included in premium store |

### Phases with Code but Likely Premature

| Phase | Name | Lines | Assessment |
|-------|------|-------|------------|
| 19-20 | AI Coaching / Claude Weekly Brief | 788 lines (ai/) | Pre-revenue feature. Should be archived per Phase A plan. |
| 21-23 | Predictive Scheduling / Pattern Recognition | 990 lines (predictive/ + patterns/) | Cool but premature. No users yet. |
| 25 | Intelligence Polish | 231 lines | Polishing features nobody has used. |
| 26-30 | Enterprise (research, pipeline, dashboard, API, sales kit) | 2,341 lines (enterprise/ + api/) | Way ahead of current stage. No users, no revenue, no pilots. |
| 31 | ASO / i18n | Partial | Spanish translations before English app ships. |
| 32-33 | HRV / Apple Watch | 349 lines (hrv/) + watch | Hardware dependency, no Apple Dev account. |
| 34 | 30-Day Autopilot | 417 lines (autopilot/) | Requires 30 days of user data to function. |
| 35-38 | Validation Study, Android, Advanced | Research/plans only | Years away from relevance. |

### Phases That Are Just Plans (No Production Code)

Phases 9, 10, 11, 12, 13, 16, 24, 28, 36, 37 — these have planning docs and possibly research summaries but no corresponding production source code. Phase 10 (TestFlight Prep) and 11 (App Store Prep) are the most immediately relevant.

### What Phase Is the Project Actually At?

**The project is at Phase 10 (TestFlight Prep) — but the roadmap went sideways.**

Instead of proceeding linearly through 38 phases, the GSD framework built code for phases 1-8 + 13-35 in rapid succession, creating a codebase that's simultaneously impressive (34K lines, 1,059 tests) and premature (enterprise dashboards before the first user). The CEO Loop's Phase A/B/C plan correctly identifies this and proposes slimming down.

**Realistic assessment:**
- Phases 1-8: Complete, working, tested
- Phases 9-12: Partially complete, blocked on Apple Developer
- Phases 13-18: Code exists but untested with real users
- Phases 19-38: Built too early, should be archived (Phase A plan)

---

## Part 3: Real Project Status vs. CEO Loop Reports

### What the CEO Loop Says

"Engineering: YELLOW. 1,059 tests / 71 suites passing. Phase A/B/C path active. Code will be ready before Apple Dev is."

### What's Actually True

| Claim | Reality |
|-------|---------|
| 1,059 tests passing | Likely true (verified at multiple points) but **no test has been run since Apr 7** from the CEO loop — npm/npx not in shell PATH |
| 14 TS errors from merge conflict | True, still unfixed after 11 days |
| Phase A ready to start | True but not started. Plan exists, no execution. |
| "Code will be ready before Apple Dev" | **False.** Code has a blocking merge conflict + 3 open bugs (BUG-01 through BUG-03) + a placeholder OAuth ID. None have been touched since Apr 7. |
| Legal track: 0/7 complete | True. No LLC filed. No EIN. No Apple Dev. No D-U-N-S. |
| Asset track: 0/8 complete | True. No screenshots, no hosted privacy policy (URL), no app review notes. |
| "Critical path is LLC filing" | **Partially true.** LLC is the longest pole, but the 5-minute merge conflict fix and the 10-minute Google OAuth setup are also blocking. All three are human actions. |

### The Real Bottleneck

The project is not blocked on code or planning. It's blocked on **Sim making three decisions and spending 20 minutes on mechanical tasks:**

1. Pick a company name (5 min decision)
2. File the LLC (30 min online, ~$125 FL filing)
3. Fix the merge conflict (5 min, instructions provided)
4. Set up Google OAuth client ID (10 min in Google Cloud Console)

Until these happen, the CEO Loop will continue running 3x/day, finding nothing to do, and committing "quiet cycle" state updates to git.

---

## Part 4: Pending Decision Analysis

### Decision 1: LLC Company Name

**Options on the table:**

| Name | Pros | Cons |
|------|------|------|
| **ShiftWell** (recommended) | App name = company name (brand unity), no USPTO conflicts found, domain presumably available, matches existing code/docs | Generic-sounding, might limit pivot potential |
| Circadian Labs | Science-credible, implies R&D depth, good for enterprise/investor narrative | Doesn't match app name, would need to maintain two brands |
| Vigil Health | Professional, medical-adjacent, broad | Doesn't match app name, "vigil" has religious/death connotations in some contexts |

**My recommendation: File as ShiftWell LLC today.** Reasons:
- Eliminates the two-brand problem
- Every doc, code reference, and marketing draft already uses "ShiftWell"
- You can always DBA or rebrand later (costs ~$50 in FL)
- The name decision has been pending since Cycle 1 (11 days). Every day is a day added to the 5-week D-U-N-S clock

### Decision 2: Apple Developer Enrollment

| Option | Cost | Time to TestFlight | Trade-offs |
|--------|------|--------------------|------------|
| **Individual (recommended)** | $99 | Days (instant after enrollment) | Your personal name on App Store initially, must transfer to Org later |
| Organization | $99 | 5-6 weeks (needs LLC + EIN + D-U-N-S) | Company name on App Store from day 1, but delays TestFlight by 5+ weeks |
| **Both (optimal)** | $198 | Days for TestFlight, weeks for Org transition | Individual now for speed, Org enrollment in parallel |

**My recommendation: Individual enrollment NOW, today.** Then file LLC and start Org enrollment in parallel. Reasons:
- TestFlight doesn't show the developer name prominently — testers won't care
- You can transfer the app to the Org account later (Apple supports this)
- 5 weeks of real user testing is worth far more than having "ShiftWell LLC" on a TestFlight invite
- $99 is not a meaningful cost to avoid if it buys 5 weeks of testing

---

## Part 5: What Actually Matters Right Now

### Prioritized Action List (Ranked by Impact on Shipping)

| # | Action | Time | Impact | Blocked By |
|---|--------|------|--------|------------|
| 1 | **Fix settings.tsx merge conflict** | 5 min | Unblocks EAS builds, clears 14 TS errors | Nothing — do it now |
| 2 | **Set up Google OAuth client ID** | 10 min | Unblocks Google Calendar sync for testing | Google Cloud Console access |
| 3 | **Decide: company name = ShiftWell** | 0 min | Unblocks LLC filing | Decision fatigue |
| 4 | **File FL LLC online** | 30 min | Starts the 5-week D-U-N-S clock | Name decision |
| 5 | **Enroll in Apple Developer (Individual)** | 15 min | Unblocks TestFlight immediately | $99, Apple ID |
| 6 | **Run Phase A slim-down** | 2-3 sessions | Removes premature features, simplifies app | Merge conflict fix |
| 7 | **Run Phase B ship polish** | 2-3 sessions | Crash reporting, analytics, onboarding walkthrough | Phase A |
| 8 | **Record 60-second app demo** | 15 min | Highest-value marketing asset | App running on device |
| 9 | **Claim @shiftwell_sleep handles** | 5 min | Prevents name squatting | Nothing |
| 10 | **Review/approve Week 2 content** | 20 min | Content window closing (was Apr 14-18) | Sim's clinical review |

### The 20-Minute Sprint That Unblocks Everything

Actions 1, 2, 3, and 9 take a combined 20 minutes and unblock the entire critical path. Action 4 takes 30 more minutes. Action 5 takes 15 minutes and delivers TestFlight access within days.

**Total time to unblock TestFlight: ~1 hour of human effort.**

---

## Part 6: CEO Loop Restructure Recommendation

### Keep, But Reform

```
BEFORE (current):
  3x/day × 7 days = 21 cycles/week
  ~$21-35/week
  75% quiet cycles
  Git history polluted with "no triggers met" commits

AFTER (proposed):
  1x/day (morning) + event-driven hooks
  ~$5-10/week
  Only runs when there's actual work
  Commits only on actual artifacts
```

### Specific Changes

1. **Reduce to 1x/day (8am ET).** Side projects don't need midday and evening check-ins.
2. **Add git post-commit hook** that triggers Engineering department evaluation on actual code changes.
3. **Stop committing quiet cycles.** If no departments dispatched, update COMPANY-OPS.md timestamp but don't `git commit`.
4. **Expand autonomous authority.** If the loop identifies a fix AND provides high-confidence analysis AND the fix is < 10 lines, execute it. The merge conflict should have been fixed by Cycle 6.
5. **Add an "approval aging" system.** Pending Approvals older than 7 days get flagged as STALE in the briefing. After 14 days, they either auto-resolve or get moved to an "Acknowledged but Deferred" section.
6. **Kill dormant department evaluation.** Don't check if Design/Social/CS/Advertising/Sales should activate every cycle. Check once per week on Monday.

### Estimated Savings

- Cost: 67% reduction (~$10/week vs ~$30/week)
- Git noise: 90% reduction (2-3 commits/week vs 21)
- Signal-to-noise ratio: Dramatically improved (every cycle produces something)

---

## Appendix A: Mac Mini & Desktop Dump Access

SSH to Mac Mini (100.118.87.10) was reachable but authentication failed from the sandbox environment (no SSH keys available). The Desktop dump path (`~/Desktop/Files From Mac Mini/4-16 dump SimVault Archive Shiftwell/`) was not accessible from the Cowork sandbox filesystem. These would need to be checked from Sim's local machine directly. If there are CEO artifacts on the Mac Mini, they're likely duplicates of what's already in the git repo — the CEO Loop commits everything it produces.

## Appendix B: Codebase Metrics

| Metric | Value |
|--------|-------|
| Source files (*.ts/*.tsx) | 200 |
| Source lines of code | 34,665 |
| Test lines of code | 70,498 |
| Test files | 10 (concentrated, not per-module) |
| App screens | 30 |
| Library modules (src/lib/) | 25 |
| Zustand stores | 15 |
| Planning phases | 38 |
| Planning docs | ~160 files |
| Git commits total | 165+ ahead of remote (never pushed) |

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial COO assessment. Full audit of CEO Loop cycles 1-20, planning phases 1-38, codebase metrics, pending decisions. SSH/Desktop dump inaccessible from sandbox.
