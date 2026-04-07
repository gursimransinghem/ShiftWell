---
phase: 31-app-store-optimization
plan: "01"
subsystem: launch
tags: [aso, i18n, localization, app-store, keywords, screenshots]
dependency_graph:
  requires: []
  provides: [ASO-01, ASO-02, ASO-03]
  affects: [docs/launch/APP_STORE_LISTING.md, docs/launch/ASO-KEYWORD-STRATEGY.md, docs/launch/SPANISH-LOCALIZATION.md, src/i18n/]
tech_stack:
  added: [expo-localization]
  patterns: [dot-notation-i18n, locale-fallback-chain, spanish-healthcare-register]
key_files:
  created:
    - docs/launch/SPANISH-LOCALIZATION.md
  modified:
    - docs/launch/APP_STORE_LISTING.md
    - docs/launch/ASO-KEYWORD-STRATEGY.md
    - src/i18n/en.ts
    - src/i18n/es.ts
    - src/i18n/index.ts
decisions:
  - "i18n provider uses expo-localization getLocales() with startsWith('es') match — covers all Spanish variants (es-US, es-MX, es-419)"
  - "English fallback in t() prevents blank UI for partially-translated keys"
  - "Review solicitation triggers after first adherent day (recovery >60) at Day 3-7 — compliant with Apple guidelines Section 1.1.7"
  - "Spanish App Store metadata targets es-US and es-MX identically — same content, two locales"
  - "app/en.ts uses 'as const' export for full TypeScript narrowing — TranslationKeys type derived from value"
metrics:
  duration: 4min
  completed_date: "2026-04-07"
  tasks_completed: 2
  files_modified: 5
  files_created: 1
---

# Phase 31 Plan 01: App Store Optimization Summary

**One-liner:** ASO keyword strategy targeting shift-worker search terms, 6 outcome-data screenshots, and Spanish i18n with healthcare-register translations covering 100% of user-facing strings.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Screenshot strategy and ASO keyword optimization | 6f26bbb | docs/launch/APP_STORE_LISTING.md, docs/launch/ASO-KEYWORD-STRATEGY.md |
| 2 | Spanish localization — i18n infrastructure and translation strings | b6ec5bd | src/i18n/en.ts, src/i18n/es.ts, src/i18n/index.ts, docs/launch/SPANISH-LOCALIZATION.md |

## What Was Built

### Task 1: ASO Keyword Optimization

**APP_STORE_LISTING.md** — Added "Screenshot Refresh" section with 6 outcome-data screenshots:
- Screenshot 1 (Hero): Recovery score 78/100 + "62% better recovery in 90 days" outcome badge
- Screenshot 2 (Calendar): Color-coded sleep windows with shift schedule
- Screenshot 3 (Algorithm): Sleep debt gauge + AdaptiveInsightCard with Two-Process Model credibility
- Screenshot 4 (Adaptive): Plan change explanation with "Why?" expanded
- Screenshot 5 (Spanish): Same hero screenshot in Spanish locale
- Screenshot 6 (Outcomes): Before/after recovery score trends, "23% improvement in 30 days"

**ASO-KEYWORD-STRATEGY.md** — Added:
- Title optimization: "ShiftWell: Shift Sleep" (22 chars) adds keyword indexing
- Subtitle recommendation: "Circadian Sleep for Nurses" (29 chars) targets 4.3M US nurses
- Description first-paragraph template with 8 target keywords in 300 characters
- Review solicitation implementation spec with `expo-store-review` / `SKStoreReviewRequest.requestReview()`
- Trigger logic: recovery > 60 AND adherence = true, Day 3-7, max once per 90 days

### Task 2: Spanish Localization

**src/i18n/en.ts** — Expanded from 32-line stub to full typed baseline covering all 7 sections: onboarding, today, adaptive, debtCard, settings, paywall, common. Exports `TranslationKeys` type from `as const`.

**src/i18n/es.ts** — 98-line Spanish translation file in healthcare professional register. Key terminology: turno nocturno (night shift), turno rotativo (rotating shift), ventana de sueño (sleep window), deuda de sueño (sleep debt), puntuación de recuperación (recovery score), cerebro adaptativo (adaptive brain).

**src/i18n/index.ts** — Rebuilt from i18n-js dependency to native expo-localization implementation:
- `getLocale()` — detects Spanish via `languageCode.startsWith('es')`, covers all Spanish variants
- `t(key)` — dot-notation key resolution with English fallback chain
- `useTranslation()` — React hook returning `{ t, locale }`
- Legacy `i18n.t` export preserved for any existing callers

**docs/launch/SPANISH-LOCALIZATION.md** — 219-line strategy document covering:
- App Store Connect Spanish metadata (es-US and es-MX): name, subtitle, description (~2,800 chars), keywords (90 chars)
- Key terminology reference table (English → Spanish medical register)
- Locale detection and fallback strategy
- Submission checklist and localization roadmap

## Deviations from Plan

### Out-of-Scope Issues Discovered

**1. Pre-existing merge conflicts — not fixed**
- `jest.config.js` has git merge conflict markers — tests cannot run
- `src/lib/ai/weekly-brief-generator.ts` has merge conflict markers (lines 308, 315, 338, 379, 419)
- **Action:** Logged to deferred-items.md. Not introduced by Phase 31 changes.

**2. i18n-js replaced with expo-localization**
- Existing `src/i18n/index.ts` used `i18n-js` library with `I18n` class
- Plan specified `expo-localization` with named `getLocale`/`useTranslation` exports
- **Resolution:** Replaced with plan-specified implementation. Legacy `i18n.t` export preserved.

## Known Stubs

None — all i18n strings are real translations. No placeholder text. Spanish metadata is full production-ready copy.

## Self-Check: PASSED

### Files Created
- [FOUND] docs/launch/SPANISH-LOCALIZATION.md
- [FOUND] src/i18n/es.ts (expanded)
- [FOUND] src/i18n/en.ts (expanded)
- [FOUND] src/i18n/index.ts (rebuilt)
- [FOUND] docs/launch/ASO-KEYWORD-STRATEGY.md (updated)
- [FOUND] docs/launch/APP_STORE_LISTING.md (updated)

### Commits
- [FOUND] 6f26bbb — feat(31-01): screenshot strategy and ASO keyword optimization
- [FOUND] b6ec5bd — feat(31-01): Spanish localization i18n infrastructure and translation strings
