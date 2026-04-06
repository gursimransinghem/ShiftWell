# ShiftWell

## What This Is
Expo/React Native circadian sleep optimization app for shift workers.
Phase 1-3 complete. 116 tests passing. Pre-TestFlight stage.
Monetization: Freemium + $29.99/yr annual sub with 7-day premium trial.

## The Problem
700 million shift workers globally. 32% of US healthcare workers report short sleep. Shift Work Sleep Disorder affects 10-38% of night shift workers. No existing app combines calendar-aware scheduling with science-backed circadian optimization.

## The Solution
AI-powered circadian rhythm optimization: import shift schedule, read personal calendar, generate science-backed sleep/nap/meal/light plans, export to calendar. Deterministic algorithm based on Two-Process Model and NIOSH protocols — not LLM-based.

## Market
mHealth market: $82.45B (2025), 22.3% CAGR. Healthcare AI VC: $11.1B (2024). Target: shift workers → travelers, surgeons, new parents, students.

## Project Rules
- Run `npm test` before any commit — 116 tests must pass
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

## Workflow Loading Protocol
Load ONLY the files needed for the active workflow. Do NOT load files from other workflows.

**Code development:** docs/dev/IMPLEMENTATION_PLAN.md + docs/dev/PHASE_2_ARCHITECTURE.md
**Business/strategy:** docs/business/BUSINESS_PLAN.md + FINANCIAL_TRACKER.md + COMPETITIVE_EDGE_LOG.md + COMPETITOR_LOG.md
**Launch prep:** docs/launch/LAUNCH_GUIDE.md + APP_STORE_LISTING.md + APP_ICON_GUIDE.md
**Legal review:** docs/launch/PRIVACY_POLICY.md + HEALTH_DISCLAIMERS.md
**Marketing/content:** docs/marketing/SOCIAL_MEDIA_GUIDE.md + DESIGN_ASSETS_GUIDE.md
**Vision/roadmap:** docs/vision/MANIFESTO.md + VISUAL_ROADMAP.md + IDEAS_LOG.md

## Key Files
- tasks/todo.md — Current work items
- tasks/lessons.md — Mistakes and patterns learned
- logs/ACTIVITY_LOG.md — Development session history (append-only)

## Scientific Foundation
Algorithm traces to published research: Two-Process Model (Borbely 1982), AASM Guidelines (2015/2023), Eastman & Burgess (2009) circadian shifting, Czeisler et al. (1990) bright light, Drake et al. (2004) SWSD prevalence, AHA Scientific Statement (2025) circadian disruption, Boivin & Boudreau (2014) shift work interventions, NIOSH CDC anchor sleep, Gander et al. (2011) fatigue risk, St. Hilaire et al. (2017) math modeling, Milner & Cote (2009) napping, Ruggiero & Redeker (2014) nap/shift work, Drake et al. (2013) caffeine timing, Manoogian et al. (2022) time-restricted eating, Chellappa et al. (2021) daytime eating in night work.

## Context Window Management
Always prefer spawning subagents for parallelizable tasks. Keep main thread for decisions, status, errors, and commits. Use subagents for research, file generation, exploration, planning, bulk operations, and documentation updates.

## Blockers
- LLC filing not yet started
- Apple Developer enrollment pending LLC
- D-U-N-S number ~5 weeks to TestFlight
- Company name TBD (top picks: Circadian Labs, Vigil Health)

---
Created: 2026-04-05
Last Reviewed: 2026-04-05
Last Edited: 2026-04-05
Review Notes: Restructured from 107-word stub to full routing CLAUDE.md. Absorbed unique content from PROJECT_CONTEXT.md (market data, scientific foundation, session instructions). Workflow loading protocol and authority chain added.
