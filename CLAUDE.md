---
tags: [config, active, navigator]
purpose: "Project entry point, routing, and compact context for ShiftWell app"
workflows: [all]
---

# ShiftWell

> Extends `~/.claude/CLAUDE.md` (global). This file adds project-specific rules only.

## What This Is
Expo/React Native circadian sleep optimization app for shift workers.
Phase 1-3 complete. 1,059 tests passing (71 suites). Pre-TestFlight stage.
Monetization: Freemium + $29.99/yr annual sub with 7-day premium trial.

## The Problem
700 million shift workers globally. 32% of US healthcare workers report short sleep. Shift Work Sleep Disorder affects 10-38% of night shift workers. No existing app combines calendar-aware scheduling with science-backed circadian optimization.

## The Solution
AI-powered circadian rhythm optimization: import shift schedule, read personal calendar, generate science-backed sleep/nap/meal/light plans, export to calendar. Deterministic algorithm based on Two-Process Model and NIOSH protocols — not LLM-based.

## Quick Start
```bash
npm test              # Run all 1,059 tests (must pass before any commit)
npx expo start        # Test on device/simulator
eas build --platform ios  # EAS build for TestFlight
```

## Project Rules
- Run `npm test` before any commit — 1,059 tests must pass
- Expo/React Native stack — `npx expo start` to test on device/simulator
- EAS builds for TestFlight: `eas build --platform ios`
- Keep bundle ID and EAS profiles per Phase 02 config
- Algorithm is core IP — changes to `src/lib/circadian/` must maintain all existing tests
- Dark-mode-first UI, professional quality, science-backed everything
- Founder is an ED physician and beginner coder — explain decisions clearly

## Authority Chain
1. **This file (CLAUDE.md)** — routing, project rules, compact context
2. **docs/dev/** — authoritative for all technical decisions
3. **docs/business/** — authoritative for business, financial, competitive decisions
4. **docs/launch/** — authoritative for deployment, App Store, legal
5. **docs/marketing/** — authoritative for content, design, social media
6. **docs/vision/** — authoritative for product roadmap, brand, feature backlog
7. **docs/research/** — authoritative for science, competitor analysis, market data
8. **_archive/** — historical only, never auto-loaded

## File Map

| Path | Purpose | Tags | Workflow |
|------|---------|------|----------|
| docs/dev/PHASE_2_ARCHITECTURE.md | System design decisions | rules, active | Code dev |
| docs/dev/IMPLEMENTATION_PLAN.md | Current sprint roadmap | rules, active | Code dev |
| docs/business/BUSINESS-PLAN-V2.md | Business strategy, market, product roadmap, financials | rules, active | Business |
| docs/business/MARKETING-PLAN.md | Go-to-market strategy, channels, content calendar, KPIs | rules, active | Marketing |
| docs/business/COMPETITIVE_ANALYSIS.md | Consolidated competitor intel | reference, active | Business |
| docs/business/COMPETITIVE_EDGE_LOG.md | Competitive advantages | reference, active | Business |
| docs/business/FINANCIAL_TRACKER.md | Revenue projections | reference, active | Business |
| docs/launch/LAUNCH_CHECKLIST.md | Pre-submission checklist | rules, active | Launch |
| docs/launch/APP_STORE_LISTING.md | Store metadata & screenshots | template, active | Launch |
| docs/launch/PRIVACY_POLICY.md | Legal privacy policy | rules, active | Legal |
| docs/launch/HEALTH_DISCLAIMERS.md | Medical disclaimers | rules, active | Legal |
| docs/launch/APP_ICON_SPEC.md | Icon specifications | reference | Launch |
| docs/marketing/SOCIAL_MEDIA_STRATEGY.md | Content & posting strategy | reference, active | Marketing |
| docs/marketing/DESIGN_ASSETS_CATALOG.md | Asset inventory | reference | Marketing |
| docs/vision/MANIFESTO.md | Product vision & mission | reference | Vision |
| docs/vision/VISUAL_ROADMAP.md | Feature roadmap | reference, active | Vision |
| docs/research/RECOVERY_ALGORITHM_SCIENCE.md | Algorithm research basis | reference | Science |
| docs/research/SLEEP-SCIENCE-DATABASE.md | Sleep science citations | reference | Science |
| tasks/todo.md | Current work items | active | All |
| tasks/lessons.md | Mistakes and patterns learned | reference | All |
| tasks/RESUME-PROMPT.md | Session resume context | active | Operations |
| logs/ACTIVITY_LOG.md | Dev session history (last 30 days) | changelog | Operations |

## Workflow Loading Protocol
Load ONLY the files needed for the active workflow. Do NOT load files from other workflows.

**Code development:** CLAUDE.md + docs/dev/IMPLEMENTATION_PLAN.md + docs/dev/PHASE_2_ARCHITECTURE.md + tasks/todo.md + logs/ACTIVITY_LOG.md (last 30 days only)

**Business/strategy:** CLAUDE.md + docs/business/BUSINESS-PLAN-V2.md + docs/business/COMPETITIVE_ANALYSIS.md + docs/business/COMPETITIVE_EDGE_LOG.md + docs/business/FINANCIAL_TRACKER.md + docs/vision/MANIFESTO.md + docs/vision/VISUAL_ROADMAP.md

**Marketing/GTM:** CLAUDE.md + docs/business/MARKETING-PLAN.md + docs/business/BUSINESS-PLAN-V2.md (executive summary, market analysis) + docs/vision/MANIFESTO.md

**Launch prep:** CLAUDE.md + docs/business/MARKETING-PLAN.md (launch timeline) + docs/launch/LAUNCH_CHECKLIST.md + docs/launch/APP_STORE_LISTING.md + docs/launch/APP_ICON_SPEC.md + docs/marketing/SOCIAL_MEDIA_STRATEGY.md + docs/marketing/DESIGN_ASSETS_CATALOG.md

**Legal review:** CLAUDE.md + docs/launch/PRIVACY_POLICY.md + docs/launch/HEALTH_DISCLAIMERS.md

**Design planning:** CLAUDE.md + docs/design/ (active specs only) + docs/superpowers/ADAPTIVE_BRAIN_DESIGN.md + docs/superpowers/PLANNING_SYNC_DESIGN.md

**Science/algorithm reference:** CLAUDE.md + docs/research/RECOVERY_ALGORITHM_SCIENCE.md + docs/research/SLEEP-SCIENCE-DATABASE.md

**Operations/resume:** CLAUDE.md + tasks/RESUME-PROMPT.md + tasks/todo.md + tasks/lessons.md + logs/ACTIVITY_LOG.md (last 30 days only)

### NEVER AUTO-LOAD
- `_archive/` — Historical planning phases, old documents, design versions
- `.planning/` — Superseded by docs/ structure, 185K tokens of dead weight
- `logs/_monthly-summaries/` — Compacted activity history

## Scientific Foundation
Algorithm traces to published research: Two-Process Model (Borbely 1982), AASM Guidelines (2015/2023), Eastman & Burgess (2009) circadian shifting, Czeisler et al. (1990) bright light, Drake et al. (2004) SWSD prevalence, AHA Scientific Statement (2025) circadian disruption, Boivin & Boudreau (2014) shift work interventions, NIOSH CDC anchor sleep, Gander et al. (2011) fatigue risk, St. Hilaire et al. (2017) math modeling, Milner & Cote (2009) napping, Ruggiero & Redeker (2014) nap/shift work, Drake et al. (2013) caffeine timing, Manoogian et al. (2022) time-restricted eating, Chellappa et al. (2021) daytime eating in night work.

## Context Window Management
Always prefer spawning subagents for parallelizable tasks. Keep main thread for decisions, status, errors, and commits. Use subagents for research, file generation, exploration, planning, bulk operations, and documentation updates.

## Market
mHealth market: $82.45B (2025), 22.3% CAGR. Healthcare AI VC: $11.1B (2024). Target: shift workers → travelers, surgeons, new parents, students.

## Blockers
- LLC filing not yet started
- Apple Developer enrollment pending LLC
- D-U-N-S number ~5 weeks to TestFlight
- Company name TBD (top picks: Circadian Labs, Vigil Health)

---
Created: 2026-04-05
Last Reviewed: 2026-04-06
Last Edited: 2026-04-06
Review Notes: Upgraded with YAML frontmatter, file map table, expanded workflow loading protocol (7 workflows), per-workflow token optimization from architecture proposal. Added design planning and science/algorithm workflows. Backed up previous version.

## SimVault Reference
Check /Users/sima/Obsidian/SimVault/wiki/topics/health.md before cold-researching health/wellness topics.
Check /Users/sima/Obsidian/SimVault/wiki/topics/active-projects.md for current project state.
Log significant findings to SimVault/projects/ or SimVault/knowledge/.
