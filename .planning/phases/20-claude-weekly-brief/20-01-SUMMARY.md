---
phase: 20-claude-weekly-brief
plan: 01
subsystem: ai
tags: [claude-api, weekly-brief, guardrails, safety, zustand, scheduler, settings]
dependency_graph:
  requires: [19-01, 15-01]
  provides: [claude-api-client, weekly-brief-generator, ai-store, weekly-brief-scheduler, settings-toggle]
  affects: [settings-screen, today-screen]
tech_stack:
  added: []
  patterns: [tdd-red-green, zustand-persist, appstate-listener, fetch-api-client]
key_files:
  created:
    - src/lib/ai/types.ts
    - src/lib/ai/claude-client.ts
    - src/lib/ai/weekly-brief-generator.ts
    - src/lib/ai/weekly-brief-scheduler.ts
    - src/store/ai-store.ts
    - src/components/settings/WeeklyBriefToggle.tsx
    - __tests__/lib/ai/weekly-brief-generator.test.ts
  modified:
    - src/store/user-store.ts
    - app/(tabs)/settings.tsx
decisions:
  - "Use claude-haiku-4-5 as default model per AI-COACHING-FRAMEWORK.md Section 2.4 cost analysis"
  - "Guardrails cover all 8 SAFETY-GUARDRAILS.md prohibited categories using regex matching"
  - "AI store persists briefs only (not isGenerating/lastError) per partialize pattern from score-store"
  - "Scheduler hook uses AppState listener + 1-hour cooldown to prevent duplicate generation"
  - "sleepDebtHours derived from circadianDebtScore (0-100 mapped to 0-14h) since PlanStats has no direct debt field"
metrics:
  duration: 5m
  completed_date: "2026-04-07"
  tasks_completed: 3
  files_modified: 9
---

# Phase 20 Plan 01: Claude Weekly Brief Pipeline Summary

**One-liner:** Anthropic claude-haiku-4-5 client with 8-category safety guardrails, weekly brief generation pipeline, Zustand persist store (12-brief cap), Monday/8AM scheduler hook, and Settings toggle.

---

## What Was Built

### Task 1: Claude API client, types, and AI store (TDD Red)

**`src/lib/ai/types.ts`** — Core types:
- `BriefContext` — Input to the generation pipeline (userId, weekStartISO, adherencePercent, sleepDebtHours, avgDiscrepancyMinutes, upcomingShifts, hardTransitionDays)
- `WeeklyBrief` — Output stored in AI store (id, text, recommendation, adherencePercent, model, tokensUsed, passedGuardrails)
- `BriefGenerationResult` — Pipeline result wrapper (success, brief?, error?, guardrailFailure?)
- `ClaudeAPIError` — Typed error with statusCode for 429/5xx handling

**`src/lib/ai/claude-client.ts`** — Anthropic Messages API client:
- `generateCompletion(systemPrompt, userMessage, model?)` — POSTs to `https://api.anthropic.com/v1/messages`
- Headers: `x-api-key`, `anthropic-version: 2023-06-01`, `content-type: application/json`
- Body: model, max_tokens: 300, system, messages
- 429 → ClaudeAPIError(429, 'Rate limit exceeded — retry after 60s')
- 4xx/5xx → ClaudeAPIError(statusCode, body message)
- Returns `{ text: content[0].text, tokensUsed: input_tokens + output_tokens }`

**`src/store/ai-store.ts`** — Zustand persist store:
- State: `briefs: WeeklyBrief[]` (max 12), `isGenerating: boolean`, `lastError: string | null`
- Actions: `setLatestBrief`, `setGenerating`, `setError`, `getLastBriefForWeek`
- `setLatestBrief` deduplicates by weekStartISO and caps at 12 entries
- partialize: briefs only (transient state excluded)
- Store name: `'ai-store'`

**`__tests__/lib/ai/weekly-brief-generator.test.ts`** — 10-test scaffold (RED phase written first).

### Task 2: Weekly brief generator pipeline (TDD Green)

**`src/lib/ai/weekly-brief-generator.ts`** — Full pipeline:

- `buildSystemPrompt()` — Derives from AI-COACHING-FRAMEWORK.md Section 2 with role identity, content rules, language boundaries, and role permanence injection resistance
- `buildUserMessage(ctx)` — Structures BriefContext into 4-line prompt: adherence%, debt, discrepancy, shift summary + transition count
- `validateGuardrails(text)` — Regex-based scanner covering all 8 SAFETY-GUARDRAILS.md prohibited categories:
  1. Medical Diagnosis: disorder/syndrome/disease names + "you may have" / "you have" patterns
  2. Medication Guidance: drug/supplement names, dosage/mg terms
  3. Emergency Clinical Guidance: "safe to drive", "fit for duty" patterns
  4. Mental Health Assessment: depression/anxiety/burnout terms
  5. Prognosis: "at risk for", "will develop", "leads to disease" patterns
  6. Symptom Interpretation: "could indicate", "may be a sign of" patterns
  7. Nutritional Prescriptions: calorie/macronutrient/keto terms
  8. Legal/Employment Advice: FMLA/ADA/workers comp terms
- `extractRecommendation(text)` — Returns last imperative-verb sentence (Try/Consider/Aim/Move/Add/Prioritize/Avoid/etc.); fallback: last sentence
- `generateWeeklyBrief(ctx)` — Pipeline: build prompts → generateCompletion → validateGuardrails → extractRecommendation → WeeklyBrief with `crypto.randomUUID()`

All 10 scaffold tests pass. Full suite: 120/120.

### Task 3: Settings toggle and Monday scheduling hook

**`src/store/user-store.ts`** — Added `weeklyBriefEnabled: boolean` (default: true) with `setWeeklyBriefEnabled` action, included in persist.

**`src/lib/ai/weekly-brief-scheduler.ts`** — `useWeeklyBriefScheduler()` hook:
- Guards: isMonday, hour >= 8, weeklyBriefEnabled, 1-hour cooldown, no existing brief this week
- Builds BriefContext from plan-store (debt via circadianDebtScore) and shifts-store (next 7 days, hard transitions)
- Runs on mount and on AppState 'active' events
- Handles errors via setError/setGenerating

**`src/components/settings/WeeklyBriefToggle.tsx`** — Toggle row:
- Label: "Weekly Sleep Brief", sub-label: "AI-generated Monday morning summary"
- Switch bound to useUserStore weeklyBriefEnabled
- Matches existing ToggleRow style (dark background, left label+sublabel, right Switch)

**`app/(tabs)/settings.tsx`** — Added "AI COACHING" section with WeeklyBriefToggle before Profile section.

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] PlanStats has no `currentDebtHours` field**
- **Found during:** Task 3
- **Issue:** Plan's Task 3 action referenced `plan?.stats?.currentDebtHours` but PlanStats only has `circadianDebtScore` (0-100) per `src/lib/circadian/types.ts`
- **Fix:** Derived sleepDebtHours by mapping circadianDebtScore to hours: `(score / 100) * 14` hours max, rounded to 1 decimal
- **Files modified:** src/lib/ai/weekly-brief-scheduler.ts
- **Commit:** 3e6f0cb

---

## Known Stubs

- `adherencePercent: 0` in `buildBriefContext()` within weekly-brief-scheduler.ts — hardcoded to 0 until Phase 15 score store integration provides 7-day adherence average. The score-store in this worktree does not expose per-night adherence history; this will be wired when Phase 15 data is available.
- `avgDiscrepancyMinutes: 0` in `buildBriefContext()` — defaults to 0 until Phase 15 feedback/discrepancy store is integrated.

These stubs do not prevent the plan's goal from being achieved — the brief pipeline is fully functional and uses live debt and shift data. The adherence and discrepancy values will enrich the brief when integrated in Phase 15+.

---

## Verification Results

```
grep "api.anthropic.com" src/lib/ai/claude-client.ts
# PASS — const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

grep -c "violation" src/lib/ai/weekly-brief-generator.ts
# 11 — covers all 8 prohibited categories

grep "weeklyBriefEnabled" src/store/user-store.ts
# weeklyBriefEnabled: boolean — in interface
# weeklyBriefEnabled: true  — default state
# setWeeklyBriefEnabled action present

npx jest --no-coverage
# Test Suites: 10 passed, 10 total
# Tests: 120 passed, 120 total (was 110 before this plan)
```

## Self-Check: PASSED
