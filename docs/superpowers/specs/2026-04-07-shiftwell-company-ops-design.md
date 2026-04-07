# ShiftWell Company Operating System

**Date:** 2026-04-07
**Status:** Approved
**Scope:** AI-operated company structure with automated department agents

---

## Overview

ShiftWell operates as an AI-run company. Claude acts as COO — proposes strategies and plans, Sim (founder/angel investor) approves direction, Claude executes. Every department is an automated subagent dispatched by a central CEO Loop running on Mac Mini infrastructure.

The full org is designed upfront. Departments activate at clear business milestones. Dormant departments cost nothing until triggered.

---

## Operating Model

### The CEO Loop

A LaunchAgent on the Mac Mini triggers a Claude Code session 3 times per day. This is the company's heartbeat.

```
CEO Loop (3x/day — morning, midday, evening):

  1. Read COMPANY-OPS.md (state of all departments)
  2. Check each department's trigger conditions
  3. Skip departments with no triggers fired (smart throttle)
  4. Build task assignments for active departments
  5. Dispatch department subagents (up to 3 parallel)
  6. Review returned artifacts — quality check, consistency check
  7. Commit outputs to docs/ structure
  8. Update COMPANY-OPS.md with new state
  9. Write CEO-BRIEFING.md for Sim
```

### Smart Throttle

Every department runs at 3x/day frequency but only fires when trigger conditions are met. No trigger = skip. This keeps API costs proportional to actual work, not calendar time.

Estimated cost: $3-10/day depending on how many departments trigger per cycle. Scales down on quiet days, up on active ones.

### Sim's Touchpoints

**One file to check:** `docs/business/CEO-BRIEFING.md` — rolling briefing updated after each CEO Loop cycle. Contains:
- What happened this cycle
- What needs Sim's approval (with inline approve/reject markers)
- What's coming next cycle
- Department status dashboard (1-line per dept)

**Approval gates** (things that wait for Sim before executing):
- Financial spend over $50
- External communications (social posts, emails, outreach)
- Strategic pivots (pricing changes, new market targets, feature cuts)
- App Store submissions
- Hiring decisions
- Ad campaign launches

Everything else runs autonomously.

---

## Departments

### 1. Product

**Mission:** Own the roadmap, prioritize features, define requirements, maintain product-market fit.

**Active:** NOW

**Trigger conditions:**
- GSD phase completes or milestone boundary reached
- New user feedback received (TestFlight, App Store reviews)
- Competitor ships a relevant feature
- Roadmap item approaches its target date

**Deliverables:**
- Roadmap priority updates
- Feature specs and requirement definitions
- User feedback synthesis reports
- Product-market fit assessments

**Agent behavior:** Reviews GSD state (`.planning/STATE.md`, `ROADMAP.md`), checks phase progress against timeline, flags scope creep, proposes next priorities, synthesizes any user feedback into actionable items. Updates `docs/vision/VISUAL_ROADMAP.md`.

---

### 2. Engineering

**Mission:** Ship code, maintain quality, manage technical debt, keep the build green.

**Active:** NOW

**Trigger conditions:**
- Code committed (new phase work landed)
- Tests fail or test count drops
- Phase plan ready for execution
- Bugs filed or TypeScript errors detected
- Dependency updates available (security patches)

**Deliverables:**
- Phase execution via GSD workflow
- Test coverage reports
- Technical debt inventory
- Build health status

**Agent behavior:** Runs GSD phase plans, monitors test results, flags regressions, tracks TypeScript error count, proposes tech debt cleanup when between phases. This formalizes the existing GSD workflow as a department. Updates `.planning/STATE.md` and phase artifacts.

---

### 3. Design

**Mission:** Brand identity, UI consistency, visual assets, design system maintenance.

**Active:** TestFlight launch (activated when first external users see the app)

**Trigger conditions:**
- Product department requests a design asset or spec
- UI audit flags brand inconsistency (non-gold hex, wrong dark-mode contrast)
- New screen or feature needs design treatment
- Marketing/Social Media needs visual assets

**Deliverables:**
- Design specs for new features
- Brand consistency audit reports
- Asset creation briefs (app icon, screenshots, social graphics)
- Design system documentation updates

**Agent behavior:** Audits UI against brand tokens (warm gold #C8A84B, dark base), produces design specs for new features following existing patterns, maintains brand guidelines. Works in `docs/marketing/DESIGN_ASSETS_CATALOG.md` and produces specs in `docs/superpowers/specs/`.

---

### 4. Marketing

**Mission:** Growth strategy, ASO, competitor monitoring, content strategy, organic acquisition.

**Active:** NOW

**Trigger conditions:**
- ASO keyword data stale (>3 days since last refresh)
- Competitor ships update or changes pricing
- Content calendar has upcoming gap
- Download/conversion metrics available
- New market opportunity identified

**Deliverables:**
- ASO keyword strategy and updates
- Competitor activity reports (updates to `docs/business/COMPETITIVE_ANALYSIS.md`)
- Content strategy recommendations
- Growth channel analysis
- Marketing campaign proposals (for Sim approval)

**Agent behavior:** Researches App Store keyword rankings, monitors competitor App Store pages, updates `docs/business/COMPETITIVE_ANALYSIS.md` and `COMPETITIVE_EDGE_LOG.md`, proposes content themes, tracks organic growth metrics when available. Updates `docs/marketing/SOCIAL_MEDIA_STRATEGY.md`.

---

### 5. Social Media

**Mission:** Content creation, posting calendar, community engagement, brand voice.

**Active:** TestFlight launch (content starts when there's something to show)

**Trigger conditions:**
- Post scheduled for today in content calendar
- Engagement spike on existing content (respond/amplify)
- Milestone shipped (announce-worthy event)
- Content gap in upcoming week

**Deliverables:**
- Social post drafts (for Sim approval before posting)
- Content calendar (weekly view)
- Engagement reports
- Platform-specific content adaptations

**Agent behavior:** Drafts social content following brand voice (premium, confident, never clinical), proposes posting schedule, prepares platform-specific versions (Twitter/X, Reddit r/nursing, Instagram, LinkedIn). All posts require Sim approval before publishing. Maintains content calendar in `docs/marketing/CONTENT-CALENDAR.md`.

---

### 6. Advertising

**Mission:** Paid acquisition — ad creative, targeting strategy, budget allocation, campaign management.

**Active:** App Store launch

**Trigger conditions:**
- Campaign running (monitor performance daily)
- Spend approaching budget threshold
- A/B test results ready for analysis
- New campaign proposal approved by Sim
- Cost-per-acquisition exceeds target

**Deliverables:**
- Ad copy and creative concepts (for Sim approval)
- Targeting strategy documents
- Budget allocation recommendations
- Campaign performance reports
- A/B test analysis

**Agent behavior:** Creates ad variations for Apple Search Ads, Reddit, Instagram; researches placement opportunities; proposes A/B tests; monitors spend vs. acquisition. All campaign launches and budget changes require Sim approval. Produces strategy in `docs/marketing/AD-CAMPAIGNS.md`.

---

### 7. Sales

**Mission:** B2B outreach, hospital partnerships, enterprise pipeline.

**Active:** $2.5K MRR (proves consumer product-market fit before enterprise)

**Trigger conditions:**
- New lead signal (hospital inquiry, enterprise interest)
- Outreach follow-up due (cadence-based)
- Case study data ready from user metrics
- Conference or industry event approaching

**Deliverables:**
- Prospect lists (hospitals, healthcare systems)
- Outreach email templates (for Sim approval)
- Pitch deck updates
- Case studies from anonymized user data
- Partnership proposals

**Agent behavior:** Researches hospital wellness programs, nurse retention initiatives; drafts outreach following the enterprise pitch angle from COMPETITIVE_EDGE_LOG.md ("nurse retention + patient safety + legal protection"); prepares case studies. All external outreach requires Sim approval. Works in `docs/business/SALES-PIPELINE.md`.

---

### 8. Operations

**Mission:** Legal compliance, financial tracking, infrastructure health, administrative tasks.

**Active:** NOW

**Trigger conditions:**
- Legal deadline approaching (LLC, trademark, privacy policy update)
- Financial data changes (new expense, revenue milestone)
- Infrastructure alert (build failure, service outage, cert expiry)
- Compliance requirement change (Apple policy update)

**Deliverables:**
- Financial summary updates (`docs/business/FINANCIAL_TRACKER.md`)
- Compliance checklist status
- Blocker tracking and escalation
- Infrastructure health reports

**Agent behavior:** Updates FINANCIAL_TRACKER.md with any new expenses or revenue, checks legal TODO status (LLC formation, trademark, Apple Developer enrollment), monitors Apple policy changes that affect the app, tracks infrastructure costs. Escalates blockers to Sim.

---

### 9. Strategy & Planning

**Mission:** Business strategy, milestone planning, market positioning, long-term roadmap, investor-ready thinking.

**Active:** NOW

**Trigger conditions:**
- Milestone boundary reached (phase complete, version shipped)
- KPI deviation >20% from target
- Dormant department's activation trigger approaching
- Market shift (new competitor, regulatory change, pricing pressure)
- Quarterly review due

**Deliverables:**
- Milestone reviews and retrospectives
- Strategic roadmap updates
- Market positioning analysis
- Business plan revisions (`docs/business/BUSINESS_PLAN.md`)
- Financial projection updates
- Activation trigger assessments for dormant departments

**Agent behavior:** Reviews PROJECT.md and BUSINESS_PLAN.md against actual progress, checks milestone targets from FINANCIAL_TRACKER.md, proposes strategic adjustments, flags when dormant departments should activate, runs quarterly business reviews. This is the "CEO's own department" — the strategic brain.

---

### 10. Customer Success

**Mission:** User feedback processing, support, retention, satisfaction.

**Active:** TestFlight launch

**Trigger conditions:**
- New TestFlight feedback submitted
- App Store review posted
- Support request received
- Churn signal detected (user disables notifications, uninstalls)
- NPS or satisfaction survey results available

**Deliverables:**
- Feedback digest (categorized, prioritized)
- Feature requests ranked by frequency and impact
- Churn risk flags with proposed interventions
- User satisfaction reports

**Agent behavior:** Processes all user feedback channels, categorizes issues (bug, feature request, UX confusion, praise), ranks by frequency, proposes fixes to Product department, identifies churn patterns. Works in `docs/business/CUSTOMER-FEEDBACK.md`.

---

## Activation Schedule

| Department | Activates | Trigger |
|-----------|-----------|---------|
| Product | NOW | -- |
| Engineering | NOW | -- |
| Marketing | NOW | -- |
| Operations | NOW | -- |
| Strategy & Planning | NOW | -- |
| Design | TestFlight launch | First external users |
| Social Media | TestFlight launch | Content to show |
| Customer Success | TestFlight launch | Feedback to process |
| Advertising | App Store launch | Paid acquisition viable |
| Sales | $2.5K MRR | Consumer PMF proven |

---

## Technical Implementation

### Infrastructure

- **Host:** Mac Mini (always-on)
- **Scheduler:** LaunchAgent plist, 3x/day (e.g., 8am, 1pm, 7pm ET)
- **Runtime:** Claude Code CLI session
- **State file:** `docs/business/COMPANY-OPS.md` — single source of truth for all department states
- **Briefing file:** `docs/business/CEO-BRIEFING.md` — rolling Sim-facing summary
- **Cost control:** Smart throttle + token-efficient subagent prompts

### CEO Loop LaunchAgent

```xml
<!-- ~/Library/LaunchAgents/com.shiftwell.ceo-loop.plist -->
<!-- Triggers Claude Code session 3x/day -->
<!-- Reads COMPANY-OPS.md, dispatches departments, writes briefing -->
```

The LaunchAgent calls a shell script that:
1. `cd ~/projects/ShiftWell`
2. Launches Claude Code with the CEO Loop prompt
3. Claude reads state, dispatches, reviews, commits, briefs
4. Session exits cleanly

### Subagent Dispatch Pattern

```
CEO Loop (parent):
  ├── Dispatch: Marketing agent (if triggered)
  ├── Dispatch: Operations agent (if triggered)
  └── Dispatch: Strategy agent (if triggered)
  
  [wait for all to return]
  
  ├── Review Marketing output → approve/revise
  ├── Review Operations output → approve/revise
  └── Review Strategy output → approve/revise
  
  Commit all artifacts
  Update COMPANY-OPS.md
  Write CEO-BRIEFING.md
```

Up to 3 subagents per dispatch wave. If >3 departments trigger in one cycle, the CEO prioritizes by urgency and runs multiple waves.

### State File Structure (COMPANY-OPS.md)

```markdown
# ShiftWell Company Operations

## Department Status

| Department | Status | Last Run | Next Trigger | Notes |
|-----------|--------|----------|-------------|-------|
| Product | Active | 2026-04-07 08:00 | Phase 7 completes | Monitoring GSD |
| Engineering | Active | 2026-04-07 08:00 | Tests pass | Phase 7 executing |
| Marketing | Active | 2026-04-07 08:00 | ASO refresh due | Keywords researched |
| Operations | Active | 2026-04-07 08:00 | LLC filing | Tracking blockers |
| Strategy | Active | 2026-04-07 08:00 | Monthly review | Q2 planning |
| Design | Dormant | -- | TestFlight launch | -- |
| Social Media | Dormant | -- | TestFlight launch | -- |
| Customer Success | Dormant | -- | TestFlight launch | -- |
| Advertising | Dormant | -- | App Store launch | -- |
| Sales | Dormant | -- | $2.5K MRR | -- |

## Pending Approvals

- [ ] [MARKETING] Social post draft: "ShiftWell launch announcement" → needs Sim review
- [ ] [OPS] LLC filing: ready to submit, $125 → needs Sim financial approval

## Recent Activity

- 2026-04-07 08:00: CEO Loop #1 — Marketing (ASO research), Operations (blocker check), Strategy (milestone review)
```

---

## File Outputs by Department

All departments write to existing `docs/` folders per the authority chain in CLAUDE.md:

| Department | Primary Output Location |
|-----------|------------------------|
| Product | `docs/vision/`, `.planning/` |
| Engineering | `.planning/`, `src/` |
| Design | `docs/marketing/DESIGN_ASSETS_CATALOG.md`, `docs/superpowers/specs/` |
| Marketing | `docs/marketing/`, `docs/business/COMPETITIVE_ANALYSIS.md` |
| Social Media | `docs/marketing/CONTENT-CALENDAR.md` |
| Advertising | `docs/marketing/AD-CAMPAIGNS.md` |
| Sales | `docs/business/SALES-PIPELINE.md` |
| Operations | `docs/business/FINANCIAL_TRACKER.md`, `docs/launch/` |
| Strategy & Planning | `docs/business/BUSINESS_PLAN.md`, `docs/business/COMPANY-OPS.md` |
| Customer Success | `docs/business/CUSTOMER-FEEDBACK.md` |

**Briefing:** `docs/business/CEO-BRIEFING.md`
**State:** `docs/business/COMPANY-OPS.md`

---

## Success Criteria

1. CEO Loop runs 3x/day without manual intervention
2. Smart throttle correctly skips idle departments (no busywork output)
3. CEO-BRIEFING.md is clear, actionable, and updated after every cycle
4. Approval gates are respected — no external actions without Sim's sign-off
5. Department outputs are committed to correct `docs/` locations
6. Dormant departments activate automatically when their trigger condition is met
7. API costs stay under $15/day average in steady state
8. Sim can ignore the system for a week and catch up in one briefing read

---

*Spec approved: 2026-04-07*
*Implementation: LaunchAgent + CEO Loop prompt + department agent prompts + COMPANY-OPS.md initialization*
