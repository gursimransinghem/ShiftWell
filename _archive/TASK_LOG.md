# Task Log — [App Name TBD]

> **Last updated:** 2026-04-02
> **Purpose:** Central tracker for all completed, active, planned tasks and ideas.

---

## Completed Tasks

| # | Task | Completed | Notes |
|---|------|-----------|-------|
| 1 | Core circadian algorithm engine (11 modules) | 2026-03 (Week 1) | classify-shifts, sleep-windows, nap-engine, caffeine, meals, light-protocol, types |
| 2 | ICS parser + generator + shift detector | 2026-03 (Week 1) | Calendar import/export pipeline working |
| 3 | Unit test suite (20 tests) | 2026-03 (Week 1) | Algorithm coverage |
| 4 | Theme & design system (dark mode, tokens) | 2026-03 (Week 2) | Colors, typography, spacing, border radii |
| 5 | Zustand stores (user, shifts, plan) | 2026-03 (Week 2) | AsyncStorage persisted, auto-regeneration |
| 6 | Shared UI components (6) | 2026-03 (Week 2) | Button, Card, ProgressBar, OptionCard, TimeRangePicker |
| 7 | Onboarding flow (6 files) | 2026-03 (Week 2) | Welcome, chronotype quiz, household, sleep prefs |
| 8 | Calendar & shift entry UI | 2026-03 (Week 2) | MonthView, DayDetail, add/edit shift modal |
| 9 | Navigation (3-tab layout) | 2026-03 (Week 2) | Today, Schedule, Settings with Expo Router |
| 10 | Today screen (daily driver) | 2026-03 (Week 3) | Timeline, CountdownCards, InsightBanner, TipCard |
| 11 | Import/export flow | 2026-03 (Week 3) | 3-step .ics import, share sheet export |
| 12 | Settings screen | 2026-03 (Week 3) | Import/export, profile display, about, reset |
| 13 | Sleep tips engine (25+ tips) | 2026-03 (Week 3) | Evidence-based, categorized, daily rotation |
| 14 | Animations | 2026-03 (Week 4) | Staggered, transitions, pulsing, press feedback |
| 15 | Test suite expansion (83 tests) | 2026-03 (Week 4) | Edge cases, all modules covered |
| 16 | EAS/ship configuration | 2026-03 (Week 4) | eas.json, app.json, App Store metadata draft |
| 17 | Business plan v1 | 2026-03 (Week 4) | LLC, monetization, go-to-market, financials |
| 18 | Phase 2 infrastructure (partial) | 2026-03 | Supabase, auth, HealthKit, premium, notifications, sync |
| 19 | Phase 3 UI wiring (partial) | 2026-03 | Auth/paywall routes, recovery score dashboard |
| 20 | Borbely two-process energy model | 2026-03-31 | Ported from ULOS |
| 21 | Landing page redesign | 2026-03 | Editorial aesthetic |
| 22 | Committee top-10 issues fix | 2026-03 | All critical + high priority resolved |
| 23 | ICS parser crash safety fix | 2026-03 | Plus hasPets algorithm, paywall CTA |
| 24 | Project dashboard (HTML) | 2026-04-01 | Interactive 8-section command center |
| 25 | Deep questioning / vision session | 2026-04-01 | Full product vision aligned |
| 26 | Business model research (10 competitors) | 2026-04-01 | Pricing, trials, conversion data |
| 27 | Naming research (25+ candidates, 4 rounds) | 2026-04-01/02 | Trademark checks, risk ratings |
| 28 | Competitor analysis (38 products) | 2026-04-02 | Definitive market intelligence report |
| 29 | ShiftWell BCEHS deep dive | 2026-04-02 | Trademark conflict confirmed |
| 30 | Competitor log + competitive edge log | 2026-04-02 | Living tracking docs created |

---

## Active Tasks

| # | Task | Started | Owner | Status | Blocker? |
|---|------|---------|-------|--------|----------|
| 1 | **Finalize app name** | 2026-04-01 | Sim | In progress | Sim deciding between Circawell, Circadio, or new direction |
| 2 | **Review & approve master plan** | 2026-04-02 | Sim | Pending | Plan file ready for review |
| 3 | **Create .planning/ GSD artifacts** | 2026-04-02 | Claude | Blocked | Waiting on plan approval |

---

## To Be Planned

_Tasks that are scoped but not yet broken into executable steps._

| # | Task | Target Version | Dependencies | Priority |
|---|------|---------------|-------------|:---:|
| 1 | Create PROJECT.md (GSD format) | — | Plan approval | HIGH |
| 2 | Create REQUIREMENTS.md with REQ-IDs | — | Plan approval | HIGH |
| 3 | Create ROADMAP.md (phased execution) | — | Plan approval + name | HIGH |
| 4 | Create SIM_ACTION_PLAN.md (personal checklist) | — | Plan approval | HIGH |
| 5 | Logo design concepts | — | Name finalized | HIGH |
| 6 | Redesign onboarding (routine builder) | v1.0 | Plan approval | HIGH |
| 7 | Calendar sync (Apple + Google) | v1.0 | Phase planning | HIGH |
| 8 | Night Sky Mode | v1.0 | Design system update | MEDIUM |
| 9 | Live Activities implementation | v1.0 | iOS development | MEDIUM |
| 10 | Push notification cadence system | v1.0 | Notification service update | MEDIUM |
| 11 | Paywall on calendar export | v1.0 | Premium service wiring | MEDIUM |
| 12 | 14-day premium trial flow | v1.0 | Premium service | MEDIUM |
| 13 | Website (interactive landing page) | Pre-launch | Name + logo + design | HIGH |
| 14 | AI weekly check-in (Claude API) | v1.1 | API integration | MEDIUM |
| 15 | HealthKit feedback loop | v1.1 | HealthKit service completion | MEDIUM |
| 16 | Recovery Score v2 | v1.1 | HealthKit data | MEDIUM |
| 17 | Sleep Debt Tracker | v1.1 | Algorithm update | MEDIUM |
| 18 | Gamification system | v1.2 | Design + algorithm | LOW |
| 19 | Shift Crew (full flow) | v1.2 | Social infrastructure | LOW |
| 20 | Household mode | v1.2 | Multi-user architecture | LOW |
| 21 | Social media account setup | Pre-launch | Name + logo | MEDIUM |
| 22 | Content calendar for launch | Pre-launch | Social accounts | MEDIUM |
| 23 | App Store listing optimization | Pre-launch | Name + screenshots | MEDIUM |
| 24 | Business plan v2 (updated with research) | Pre-launch | Plan approval | MEDIUM |

---

## Ideas to Iron Out

_Concepts that need further discussion, research, or decision before they become tasks._

| # | Idea | Category | Status | Notes |
|---|------|----------|--------|-------|
| 1 | Soundscapes / ambient tones in Night Sky Mode | Feature | Undecided | Build or defer to Calm/BetterSleep? Auto-play at bedtime? |
| 2 | Partner app experience for Household mode | Architecture | Undecided | Does the partner need the full app or a lightweight companion? |
| 3 | B2B pricing model for team/department licenses | Business | Future | Timeshifter does per-pilot. Fatigue Science $15-50/user/mo. What's ours? |
| 4 | DND / Focus mode automation method | Technical | Research needed | iOS Shortcuts vs native Focus mode API vs both? |
| 5 | Free morning sleep-in algorithm logic | Technical | Needs verification | How does algorithm detect "nothing tomorrow"? Edge cases? |
| 6 | Apple Watch scope for v2 | Feature | Future | Haptic tap, complications, sleep tracking — what's minimum viable? |
| 7 | Merch strategy | Brand | Post-launch | Gold owl on black. When to start? Print-on-demand vs inventory? |
| 8 | AI cost management at scale | Business | Research needed | $0.40/user/mo at 10K users = $4K/mo. At 100K? Caching strategies? |
| 9 | Data privacy positioning | Marketing | Decided (privacy-forward) | Need specific language. HIPAA not required but physician-grade ethics messaging. |
| 10 | Wearable integrations beyond Apple Watch | Feature | Future | Oura, WHOOP, Garmin — through HealthKit or direct? |
| 11 | Localization / multi-language | Feature | Future | Which languages first? Shift work is global. |
| 12 | Android launch timing | Platform | Future | React Native gives us this free-ish. When do we prioritize? |
| 13 | Referral reward structure | Business | Approved concept | Free month of premium per referral — need exact mechanics |
| 14 | Weekly check-in notification timing | UX | Needs design | When to prompt? Sunday night? Monday morning? User-configurable? |
| 15 | Calendar event styling | UX | Needs design | What do our sleep blocks look like in Apple/Google Calendar? Color, icon, description? |

---

## Claude Recommendations & Identified Opportunities

_Ideas and recommendations surfaced by Claude during analysis. Sim to review and approve/defer/reject._

| # | Recommendation | Rationale | Priority | Status |
|---|---------------|-----------|:---:|--------|
| 1 | **Gate calendar export as paywall trigger** | Research shows it's the highest-value feature at the natural end of the free experience. 45.7% conversion with 14-day trials. | HIGH | Approved |
| 2 | **Price at $6.99/mo or $49.99/yr** | Data shows this sits perfectly between Sleep Cycle ($30/yr, declining) and Rise ($70/yr, complaints). Sweet spot. | HIGH | Approved |
| 3 | **Add $149.99 lifetime option** | Captures "I hate subscriptions" crowd. One-time revenue spike per user. AutoSleep proves this model works. | MEDIUM | Approved |
| 4 | **14-day trial (not 7, not 30)** | Covers full shift rotation cycle. 45.7% vs 26.8% conversion. Health apps need time to prove value. | HIGH | Approved |
| 5 | **Lean hard into "Built by an ED Physician"** | Timeshifter uses "Harvard scientists." Rise uses "sleep scientists." We have a PRACTICING physician who LIVES this problem. More relatable. | HIGH | Pending |
| 6 | **Target nurses as first early adopters** | Largest shift worker group in healthcare. Active social networks. Word-of-mouth driven. Nurses trust physicians. | HIGH | Pending |
| 7 | **Apply for Apple Design Award** | Rise won Apple Best App. Beautiful UI + health innovation = Apple loves this. Plan for it from day one. | MEDIUM | Pending |
| 8 | **Pursue NIH SBIR/STTR grant** | Arcashift got $2M NIH. SleepSpace got $3.5M. We have clinical credibility + a working algorithm. Free money + credibility. | MEDIUM | Pending |
| 9 | **Build for "Shift Crew" viral loop early** | Every crew invite = new download from exact target audience. Organic growth without ad spend. | MEDIUM | Approved (v1.2) |
| 10 | **Consider Apple Health integration as free tier** | If HealthKit feed is free, the app gets smarter for all users → better reviews → more downloads. Premium is the AI + calendar export. | LOW | Pending |
| 11 | **Calendar event description as micro-marketing** | Sleep blocks exported to calendar can include: "Scheduled by [App Name] — your rhythm, optimized. getappname.com" — every calendar event is an ad. | LOW | Pending |
| 12 | **Pre-adaptation alerts for upcoming shift changes** | "Next week you switch to nights. Starting Thursday, delay your bedtime by 2h/day." Nobody does this proactively. | HIGH | Approved (v1.0 algorithm) |
| 13 | **Explore hospital partnerships for beta testing** | HCA Healthcare (Sim's employer) has 180+ hospitals. Built-in beta test pool if approved through proper channels. | MEDIUM | Pending |

---
*Updated: 2026-04-02 — Update as tasks complete, new ideas emerge, or priorities shift.*
