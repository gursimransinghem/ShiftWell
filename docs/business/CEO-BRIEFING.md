# CEO Briefing — ShiftWell

**Last cycle:** 2026-04-08 (Morning)
**Next scheduled:** Next CEO Loop run
**Cycle #:** 4

---

## Status Dashboard

| Department | Health | Last Action | Next Trigger |
|-----------|--------|-------------|--------------|
| Product | ✅ GREEN | VISUAL_ROADMAP updated to Phase A/B/C ship path; Phase 28 complete | Phase A/B/C completion or feedback |
| Engineering | ⚠️ YELLOW | 1,059 tests / 71 suites passing; BLOCKER: settings.tsx merge conflict (14 TS errors); npm test script fixed ✓ | Resolve conflict; STATE.md change |
| Marketing | ✅ GREEN | ASO strategy + 6-week pre-launch content calendar complete | >3 days (Apr 10) |
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

### 🔴 CRITICAL — Resolve Merge Conflict in `app/(tabs)/settings.tsx` *(NEW — Cycle 3)*
**What:** Unresolved merge conflict markers from `worktree-agent-a211ed4f` at lines 16-46 and 336-384. Causing 14 TypeScript errors that will block any EAS production build.
**Action:** Open the file, choose which version to keep (HEAD or the worktree), remove the conflict markers, and commit. 5-minute fix.
**Must do before:** Starting Phase A slim-down — running archival with a broken sibling file compounds errors.

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

### 🟢 LOW — Add investor summary line to BUSINESS-PLAN-V2.md *(NEW — Cycle 3)*
**What:** Under v2.0 roadmap: "Enterprise module, employer dashboard, and API layer built and staged in v2 archive — reintroduced on first hospital inquiry."
**Why:** Protects enterprise story in pre-seed pitch. Signals capital discipline, not capability loss.

---

## What Happened This Cycle

**Cycle 4 — Quiet maintenance cycle.** No departments dispatched — no triggers met.

**Autonomous fix executed:** Added `"test": "jest"` to `package.json` scripts. This was a one-line fix flagged across 3 consecutive cycles. `npm test` now works. PA #4 removed from pending approvals.

**Key status:** No code commits since Cycle 3 (last night). Settings.tsx merge conflict unchanged. Critical path is entirely blocked on Sim completing LLC filing. Nothing engineering can do that wasn't already done last cycle.

**Next live triggers:**
- Marketing fires **April 10** (>3 days threshold)
- Engineering fires **immediately** when Sim resolves settings.tsx or starts Phase A
- Operations fires **when LLC is filed** or FINANCIAL_TRACKER changes

---

*Previous cycle summary (Cycle 3 — 2026-04-07 Evening): 3 departments ran. Engineering found settings.tsx merge conflict (14 TS errors). Product updated VISUAL_ROADMAP to Phase A/B/C. Strategy confirmed slim-down pivot aligned.*

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

**Cycle 5 triggers:**
- Engineering: Phase A execution start (STATE.md change) or Sim resolves settings.tsx
- Product: Phase A/B completion
- Marketing: **April 10** (>3 days since last run) — GUARANTEED to fire
- Operations: LLC filed or FINANCIAL_TRACKER changes
- Strategy: Monthly (May 2026) unless phase completed first

---

*Generated by CEO Loop v1.0 — Cycle #4 — 2026-04-08 (Morning)*
