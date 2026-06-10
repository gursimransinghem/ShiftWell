# State of ShiftWell — April 18, 2026

> Executive summary of project health, readiness, blockers, and competitive position.
> Synthesized from 37 deliverables produced in the April 17-18 overnight session.

---

## Project Health Scorecard

| Domain | Grade | Status | Key Evidence |
|--------|-------|--------|-------------|
| **Algorithm** | A | Ship-ready | 1,343 tests passing (100%), Two-Process Model + NIOSH protocols, 12 circadian modules in codebase + 5 new modules spec'd |
| **Tests** | A | Ship-ready | 80 suites, 1,343 tests, 0 flaky, 12s total runtime, OOM fix applied |
| **Security** | B- | Needs 1 fix | Supabase RLS on all 6 tables, SecureStore for tokens. **P1: Claude API key exposed in client bundle — must route through Edge Function before TestFlight** |
| **Design** | B | Needs icon | 6-screen onboarding spec, dark-mode-first UI, retention mechanics designed. **Blocker: Expo default icon must be replaced** |
| **Legal** | B- | Drafted | 5 docs complete (privacy policy, ToS, medical disclaimer, data disclosure, DPA). All require attorney review + placeholder completion |
| **Marketing** | A- | Ready to deploy | 20 Instagram posts, 5 email sequences, 5 community posts, press kit, 3 SEO landing pages, video script |
| **Operations** | B | Restructure planned | CEO automation loop running but 3x/day is excessive. v2.0 spec ready (1x/day + event-driven) |
| **Business** | A- | Strategy complete | Pricing tiers defined, partnership templates ready, Year 1 projections modeled |

**Overall: B+ — Code-ready for TestFlight. Blocked by 3 human decisions, not engineering.**

---

## Ship-Readiness Matrix

### Ready to Ship

| Asset | Details |
|-------|---------|
| Core algorithm | 9 modules, deterministic, science-backed, fully tested |
| Test suite | 1,343 tests, 80 suites, 100% pass rate |
| App Store listing | Name, subtitle, keywords (96/100 chars), description, promotional text — all within limits |
| Category & age rating | Health & Fitness primary, Medical secondary, 4+ rating, FDA General Wellness compliant |
| Screenshot specs | 10-frame carousel with keyword-rich captions, 3 device sizes |
| Video script | 28-second preview, 5-scene structure, production spec |
| Beta program | 4-phase TestFlight plan, 3-wave surveys, success metrics with kill criteria, 8-week ops plan |
| Marketing assets | Community posts (Reddit/HN/PH), email sequences, Instagram pack (20 posts + 5 reels), press kit |
| SEO pages | 3 landing pages (nurses, first responders, healthcare workers) with Schema.org markup |
| Documentation | README, user guide (650 lines), runbook, 5 ADRs |
| Onboarding spec | 6 screens, 90-second target, progressive disclosure |
| Pricing strategy | Free / Pro ($6.99/mo or $49.99/yr) / Enterprise ($12/seat/mo) |
| Retention mechanics | Sleep score gamification, smart notifications, weekly reports, re-engagement flows |
| Partnership templates | 5 outreach templates (hospital CNO, residency, media, wearable x2) |

### Needs Work Before TestFlight

| Item | Effort | Severity |
|------|--------|----------|
| App icon design | 2-5 days (Fiverr) or 1-2 hrs (AI-gen) | **Blocker** — Expo default destroys credibility |
| Claude API key routing | 2-4 hours | **P1** — Security: must not ship exposed key |
| Google OAuth client ID | 10 minutes | **P1** — Blocks calendar import testing |
| LLC filing | 30 minutes | **Blocker** — Starts 5-week D-U-N-S clock |
| Apple Developer enrollment | 15 minutes + $99 | **Blocker** — Required for TestFlight builds |
| Attorney review of legal docs | 1-2 weeks (external) | **P1** — 5 docs need review before public launch |
| Feedback mechanism implementation | 8-10 hours | **P2** — Shake-to-report + Supabase table |
| CI/CD pipeline | 4-6 hours | **P2** — No GitHub Actions yet |
| npm audit fixes | 5 minutes | **P2** — 1 critical (node-forge), 3 high |

---

## Top 5 Blockers (Ranked by Severity)

| # | Blocker | Impact | Resolution | Time |
|---|---------|--------|------------|------|
| 1 | **LLC not filed** | Blocks D-U-N-S → Apple Org enrollment → production builds. Every day of delay = 1 day added to TestFlight timeline. | File as "ShiftWell LLC" in Florida today. | 30 min + 5 weeks wait |
| 2 | **Apple Developer not enrolled** | No TestFlight builds possible. Individual enrollment ($99) unblocks beta immediately; Org enrollment needs D-U-N-S. | Enroll Individual now, upgrade to Org when D-U-N-S arrives. | 15 min + $99 |
| 3 | **App icon is Expo default** | Signals "unfinished app" to every beta tester. First impression killer. | Commission on Fiverr ($50-100) or AI-generate + Figma cleanup. Dark navy + gold. | 2-5 days |
| 4 | **Claude API key in client bundle** | Security vulnerability. If shipped, API key is extractable from app binary. | Route through Supabase Edge Function. | 2-4 hours |
| 5 | **Legal docs need attorney review** | Cannot publicly launch without reviewed privacy policy and ToS. Beta can proceed with drafts + disclaimer. | Engage attorney. Placeholders: [COMPANY_NAME], [CONTACT_EMAIL], [DATE]. | 1-2 weeks external |

**Critical path: Blockers 1 + 2 take ~45 minutes of human action and unblock everything else.**

---

## Key Metrics

| Metric | Value |
|--------|-------|
| Source code | ~32,400 lines (190 files in src/) |
| Test code | 70,498 lines |
| Test count | 1,343 (up from 1,059 — +27% overnight) |
| Test suites | 80 |
| Pass rate | 100% |
| TypeScript errors | 0 (14 fixed during audit) |
| Circadian algorithm modules | 12 existing + 5 new spec'd |
| Zustand stores | 15 |
| Supabase tables (with RLS) | 6 |
| Deliverables produced overnight | 37 files |
| Launch-kit coverage areas | 6 (test quality, App Store, legal, marketing, docs, beta) |
| SEO landing pages | 3 (nurses, first responders, healthcare workers) |
| Partnership templates | 5 |
| ADRs documented | 5 |
| Algorithm improvement modules spec'd | 5 (140 hours estimated) |
| Android port estimated effort | 136 hours |
| Monthly operating cost (at scale) | ~$205 |
| Break-even point | ~43 Pro subscribers |
| Year 1 revenue projection (mid) | ~$57K ARR |

---

## Competitive Position

| Competitor | Price | ShiftWell Advantage |
|------------|-------|-------------------|
| Timeshifter | $69.99/yr | ShiftWell writes to calendar (not overlay), 58% cheaper, shift-worker focused (not jet lag) |
| RISE | $69.99/yr | ShiftWell is shift-aware (RISE assumes day schedules), 58% cheaper |
| Riseo | $49.99/yr | ShiftWell has ICS import + calendar export, no wearable required |
| OffShift | $29.99/yr | ShiftWell has science-backed algorithm (Two-Process Model), physician founder credibility, more features at $49.99/yr |
| Sleep Cycle | $39.99/yr | ShiftWell is built for rotating schedules, not just alarm optimization |

**Moat:** Calendar-native plan writing + ICS import + deterministic circadian algorithm + EM physician founder. No competitor combines all four.

**TAM:** 700M shift workers globally. 22M in US. 32% of US healthcare workers report short sleep. $82.45B mHealth market (22.3% CAGR).

---

## Overnight Session Output Summary

| Category | Files | Highlights |
|----------|-------|-----------|
| A — Test Quality | 1 | +284 new tests, OOM fix, zero flaky |
| B — App Store | 5 | Full listing, screenshot specs, video script, category/rating, icon audit |
| C — Legal | 5 | Privacy policy, ToS, medical disclaimer, data disclosure, DPA |
| D — Marketing | 4 | Instagram (20 posts), email (5 sequences), community (5 posts), press kit |
| E — Documentation | 8 | README, user guide, runbook, 5 ADRs |
| F — Beta Program | 6 | TestFlight plan, surveys, metrics, feedback design, onboarding, weekly ops |
| Onboarding/Pricing/Retention | 3 | 6-screen flow, 3-tier pricing, retention mechanics |
| Partnerships | 5 | Hospital, residency, media, wearable (x2), tracker |
| Algorithm Spec | 1 | 5 modules, 140 hours, DLMO + phase + substance + fatigue + wearable |
| Android Roadmap | 1 | 3-phase port, 136 hours, Health Connect adapter |
| SEO | 5 | 3 landing pages + sitemap + robots.txt |
| War Room Reports | 3 | CTO audit, COO assessment, QA report — all blockers identified and triaged |
| CEO Loop Revamp | 2+ | v2.0 spec (1x/day, event-driven, 67% cost reduction) |
| **Total** | **~44** | |

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial creation. Synthesized from 37+ deliverables across launch-kit, docs, website, scripts, and war room reports produced during April 17-18 overnight session.
