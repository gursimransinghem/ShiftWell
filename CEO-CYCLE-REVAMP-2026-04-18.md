# CEO Loop Revamp Report

**Date:** 2026-04-18
**Version:** v1.0 → v2.0
**Location:** `scripts/company-ops-v2/`

---

## What Was Wrong

The CEO Loop v1 ran 20 cycles over 10 days (Apr 7-16). Only 5 cycles dispatched any work. The last 15 cycles (75%) produced zero artifacts but still committed "quiet cycle — no triggers met" entries to git, polluting commit history and costing ~$0.50-1.00 each in API spend for nothing.

### Root Causes

**1. 3x/day is absurd for a side project.** ShiftWell gets meaningful code work during Sim's sporadic sessions between ER shifts. Between sessions, literally nothing changes — so 2 of every 3 daily runs are guaranteed to find nothing.

**2. No change detection gate.** The loop evaluated all triggers every cycle regardless of whether ANYTHING had changed in the repo. It should have short-circuited if `git log` showed zero new commits.

**3. PATH broken in LaunchAgent environment.** The LaunchAgent doesn't inherit shell profile settings, so npm/npx/node were never in PATH. This meant Engineering triggers for test failures and TS errors COULD NEVER FIRE — even when real test failures existed. Noted in Cycle 7 but never fixed. This is the single most impactful bug.

**4. Trigger logic was simultaneously too narrow and too dependent on human actions.** Every trigger required Sim to do something first (commit code, file LLC, update a tracker). With Sim working 12-hour ER shifts, days pass between actions. The loop had no ability to generate its own work.

**5. The COO was actually a reporter.** Despite the prompt saying "you are a COO, not a reporter," the approval gates were so broad that the loop classified virtually everything as needing approval. The merge conflict in settings.tsx was fully analyzed in Cycle 5 (Apr 8) with line-by-line fix instructions — but it sat for 10 more days because the loop wouldn't execute a fix classified as "needs approval."

**6. Quiet cycles committed to git.** Every "no departments dispatched" result got committed, creating ~15 meaningless commits. This is noise masquerading as activity.

**7. Briefing format bloated.** CEO-BRIEFING.md ballooned to 162 lines with historical cycle summaries. Sim reads this on his phone between patients — it needs to be <80 lines of actionable content.

**8. No Obsidian integration.** Sim's knowledge base is in Obsidian/SimVault but the loop only wrote to the git repo. Briefings weren't accessible from Sim's daily workflow.

### What Worked (Kept in v2)

The first 7 cycles (Apr 7-9) were genuinely valuable: found broken npm test script, stale test counts, wrong pricing in business plan, merge conflict blocking builds, Google OAuth placeholder, competitive ASO intelligence. The architecture (lock file, log rotation, budget caps, smart throttle concept, subagent dispatch) was solid engineering. The department prompt structure was well-designed.

---

## What Changed

### Schedule: 3x/day → 1x/day + on-demand

| Aspect | v1 | v2 |
|--------|----|----|
| Frequency | 3x/day (8am, 1pm, 7pm) | 1x/day (6am) + `--force` for on-demand |
| Weekly cycles | 21 | 7 (+ on-demand) |
| Estimated cost | $21-35/week | $5-10/week |
| Git commits/week | 21 (mostly empty) | 2-5 (only real work) |

### Change Detection Gate (NEW)

Before evaluating ANY triggers, v2 checks whether anything meaningful has changed since the last run. It looks at git commits (excluding CEO Loop's own), file checksums on key state files, time-based triggers (marketing cadence, monthly ops), and stale approval counts. If nothing triggers the gate, the cycle logs a one-line skip and exits. No API spend. No git commit.

### PATH Fix (CRITICAL)

v2's `setup_path()` function explicitly searches for node/npm in common locations (nvm, volta, fnm, homebrew, local bin) and sources shell profile. The LaunchAgent plist also includes explicit PATH with node directory. This unblocks Engineering triggers that were broken for all 20 v1 cycles.

### Integration Data Pre-Collection (NEW)

The shell script now collects git log, test results, dependency audit, TypeScript error count, and working tree status BEFORE invoking Claude. This data is passed directly in the prompt, so the AI doesn't need to re-run these commands (saving time and avoiding PATH issues).

### Expanded Autonomous Authority

v1 classified almost everything as "needs approval." v2 expands autonomous authority:
- Merge conflicts where analysis is high-confidence → FIX IT
- One-line code fixes that are obviously correct → FIX IT
- Config corrections → FIX IT
- Stale documentation updates → FIX IT

Only truly ambiguous decisions or financial/external actions require approval.

### Stale Approval Aging (NEW)

Pending Approvals older than 7 days get flagged STALE in the briefing. After 14 days, they either auto-resolve (if within expanded authority) or get archived as "Deferred by inaction." This prevents the approval list from growing indefinitely while Sim works shifts.

### Briefing Format: Status Report → Decision Document

v1 briefing: 162 lines of historical summaries and status tables.
v2 briefing structure:
1. **Do This Now** — items Sim can act on in <5 min, with exact steps
2. **Decisions Needed** — items requiring judgment, with recommendation
3. **What Changed** — 2-3 bullets max
4. **Stale Items** — escalated approvals
5. **Dashboard** — compact status table

Target: <80 lines total.

### Quiet Mode (NEW)

If no departments trigger and no autonomous fixes are made, v2 writes a one-line entry to a separate `quiet-cycles.log` file. It does NOT update COMPANY-OPS.md, does NOT update CEO-BRIEFING.md, and does NOT commit to git. The quiet cycle log rotates when it exceeds 1MB.

### Health Check Subcommand (NEW)

`ceo-loop.sh --health` runs a self-diagnostic checking: Claude CLI availability, node/npm PATH, project directory, state files, lock file status, last run timestamp, Obsidian output directory, git status, and disk space. Useful for debugging after a stall.

### Obsidian Output (NEW)

After each cycle, briefing and cycle log are copied to `~/Obsidian/SimVault/projects/shiftwell/`. This integrates the CEO Loop output into Sim's existing knowledge management workflow.

### Dormant Department Checks: Daily → Monday Only

v1 checked whether dormant departments (Design, Social Media, etc.) should activate every single cycle. Since their triggers (TestFlight launch, App Store launch) change at most weekly, v2 only checks on Mondays.

### Marketing Cadence: 3 days → 5 days

For a pre-launch side project, competitor scanning every 3 days is too frequent. Raised to 5 days. Can be lowered back to 3 post-launch when the market moves faster.

---

## File Structure

```
scripts/company-ops-v2/
├── ceo-loop.sh                         # Main loop script (revamped)
├── ceo-prompt.md                       # COO system prompt (rewritten)
├── send-briefing.sh                    # Briefing delivery (terminal + iMessage + Obsidian)
├── com.shiftwell.ceo-loop-v2.plist     # LaunchAgent (1x/day at 6am)
└── departments/                        # Department prompts (carried from v1)
    ├── product.md
    ├── engineering.md
    ├── marketing.md
    ├── operations.md
    ├── strategy.md
    ├── design.md
    ├── social-media.md
    ├── advertising.md
    ├── sales.md
    └── customer-success.md
```

---

## How to Deploy

### 1. Unload v1 LaunchAgent

```bash
launchctl unload ~/Library/LaunchAgents/com.shiftwell.ceo-loop.plist 2>/dev/null
```

### 2. Copy v2 files

```bash
cp -r ~/Projects/ShiftWell-sandbox/scripts/company-ops-v2/ ~/Projects/ShiftWell/scripts/company-ops-v2/
chmod +x ~/Projects/ShiftWell/scripts/company-ops-v2/ceo-loop.sh
chmod +x ~/Projects/ShiftWell/scripts/company-ops-v2/send-briefing.sh
```

### 3. Update paths in plist

Edit `com.shiftwell.ceo-loop-v2.plist` — verify the username and node path match your system:
```bash
# Check your node path:
which node
# Check your username:
whoami
```

### 4. Install LaunchAgent

```bash
cp ~/Projects/ShiftWell/scripts/company-ops-v2/com.shiftwell.ceo-loop-v2.plist \
   ~/Library/LaunchAgents/com.shiftwell.ceo-loop.plist
launchctl load ~/Library/LaunchAgents/com.shiftwell.ceo-loop.plist
```

### 5. Run health check

```bash
bash ~/Projects/ShiftWell/scripts/company-ops-v2/ceo-loop.sh --health
```

### 6. Test run

```bash
bash ~/Projects/ShiftWell/scripts/company-ops-v2/ceo-loop.sh --force
```

### 7. Verify

```bash
# Check the log
cat ~/Projects/ShiftWell/logs/ceo-loop/$(ls -t ~/Projects/ShiftWell/logs/ceo-loop/*.log | head -1)

# Check briefing
cat ~/Projects/ShiftWell/docs/business/CEO-BRIEFING.md

# Check Obsidian output
ls ~/Obsidian/SimVault/projects/shiftwell/
```

---

## Environment Variables (Optional Overrides)

| Variable | Default | Purpose |
|----------|---------|---------|
| `SHIFTWELL_DIR` | `$HOME/Projects/ShiftWell` | Project root |
| `OBSIDIAN_SHIFTWELL` | `$HOME/Obsidian/SimVault/projects/shiftwell` | Obsidian output dir |
| `CEO_LOOP_MODEL` | `sonnet` | Claude model for loop |
| `CEO_LOOP_BUDGET` | `3` | Max USD per cycle |
| `CEO_LOOP_RECIPIENT` | `+15862561089` | iMessage recipient |

---

## Expected Behavior After Deploy

**Day 1:** First run at 6 AM. Since it's the first v2 run, it will detect "first_run" or "no_previous_snapshot" and execute a full cycle. Should dispatch at least Marketing (if >5 days since last run) and Engineering (if TS errors persist).

**Quiet days:** When Sim doesn't code, the loop detects no changes via snapshot comparison. Logs a one-line skip. No API cost. No git noise.

**Active days:** When Sim commits code, the next morning run detects git activity, collects fresh test/TS data, and dispatches relevant departments. Engineering gets real integration data. Marketing fires on its 5-day cadence.

**Stale approval cleanup:** Within 2 weeks, all 14 current Pending Approvals will either be acted on, auto-resolved, or archived. The approval list will stay lean.

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial revamp report. Covers root cause analysis of v1 stall, all v2 changes, deployment instructions, and expected behavior.
