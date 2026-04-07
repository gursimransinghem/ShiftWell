---
phase: 19-ai-coaching-research
plan: 01
subsystem: ai
tags: [claude-api, safety, guardrails, fda, prompts, coaching, literature-review, edge-cases]

requires:
  - phase: 18-revenucat-hard-gating
    provides: Premium feature gating architecture — AI coaching will be premium-only, builds on this gating model

provides:
  - Prompt architecture with context injection schema for Claude API integration
  - 10+ cited literature review establishing scientific and regulatory foundation
  - 8-category safety prohibition list with detection heuristics
  - 3-tier crisis detection protocol including 72h deprivation data trigger
  - Prompt injection defense specifications
  - 62 numbered edge case test prompts (TC-001 through TC-062)
  - Content review process and kill switch specification

affects:
  - 20-claude-weekly-brief (uses AI-COACHING-FRAMEWORK.md prompt architecture directly)
  - 22-predictive-calendar-engine (transition coaching prompt template)
  - 23-pattern-recognition-engine (pattern alert prompt template)
  - 25-intelligence-polish (A/B testing framework for prompt optimization)

tech-stack:
  added: []
  patterns:
    - Claude API with structured JSON output (all features output JSON, never freeform text)
    - 3-layer safety architecture (system prompt + post-generation scanner + fallback content)
    - Context injection schema (static system prompt + dynamic user context JSON per request)
    - Tiered crisis detection (Tier 1 normal, Tier 2 elevated, Tier 3 crisis with UI overlay)
    - Prompt caching (24h TTL for static system prompt + safety guardrails layer)

key-files:
  created:
    - .planning/phases/19-ai-coaching-research/AI-COACHING-FRAMEWORK.md
    - .planning/phases/19-ai-coaching-research/SAFETY-GUARDRAILS.md
    - .planning/phases/19-ai-coaching-research/EDGE-CASE-TEST-SUITE.md
  modified:
    - docs/science/SLEEP-SCIENCE-DATABASE.md

key-decisions:
  - "Claude model selection: Haiku for Weekly Brief and Pattern Alerts (cost), Sonnet for Transition Coaching and Chat (reasoning quality)"
  - "Structured JSON output for ALL AI features — never freeform text — for safety classification and UI reliability"
  - "3-layer safety architecture mandatory: system prompt + output scanner + fallback content (not single-layer)"
  - "Crisis detection must trigger UI overlay, not just inline response text — visibility requirement for Tier 3"
  - "62 edge cases defined and must all pass before Phase 20 AI feature launch"
  - "FDA General Wellness exemption is the regulatory anchor — any AI diagnostic language triggers SaMD reclassification risk"

patterns-established:
  - "AI prompt assembly order: system prompt → safety guardrails → user context JSON → feature template → user message"
  - "Data sent to API: only aggregated metrics (adherence %, debt hours, avg duration, shift type, first name). Never: HealthKit raw, PII beyond first name, calendar event titles"
  - "Tone baseline: validate before advise, specific data references required, one recommendation per response, max 150 words for alerts, max 300 words for briefs"

requirements-completed: [RES-06, RES-07, RES-08]

duration: 16min
completed: 2026-04-07
---

# Phase 19 Plan 01: AI Coaching Research Summary

**Claude API safety framework for shift worker sleep coaching — FDA-compliant prompt architecture, 8-category prohibition system, and 62-case edge test suite**

## Performance

- **Duration:** 16 min
- **Started:** 2026-04-07T18:22:45Z
- **Completed:** 2026-04-07T18:39:08Z
- **Tasks:** 2 (Task 3 is a human-verify checkpoint — awaiting approval)
- **Files modified:** 4

## Accomplishments

- AI-COACHING-FRAMEWORK.md: 604-line document with 5 sections covering 10 cited sources, full context injection schema with required/optional/never-send fields, coach vs. clinician tone comparison table, content boundaries, and failure mode analysis
- SAFETY-GUARDRAILS.md: 627-line document defining all 8 prohibited output categories with definitions, prohibited examples, and detection heuristics; 3-tier crisis protocol; prompt injection defenses; content review cadence
- EDGE-CASE-TEST-SUITE.md: 62 numbered test cases (TC-001 through TC-062) across 9 categories including normal use, boundary pushing, edge data, adversarial jailbreaks, and crisis escalation
- docs/science/SLEEP-SCIENCE-DATABASE.md: Appended "AI Coaching & Digital Health" section with 11 citations across 4 sub-categories

## Task Commits

1. **Task 1: Literature review and AI coaching framework** - `5788070` (feat)
2. **Task 2: Safety guardrails and edge case test suite** - `3ae581d` (feat)

**Plan metadata:** (pending after human verify checkpoint)

## Files Created/Modified

- `.planning/phases/19-ai-coaching-research/AI-COACHING-FRAMEWORK.md` — 5-section framework: literature review (10 sources), prompt architecture with context injection schema, tone guidelines with coach/clinician comparison table, content boundaries, failure mode analysis
- `.planning/phases/19-ai-coaching-research/SAFETY-GUARDRAILS.md` — 8 prohibited categories with detection heuristics, required disclaimers (exact text), tiered crisis protocol including 72h deprivation data trigger, prompt injection defenses, monthly review cadence
- `.planning/phases/19-ai-coaching-research/EDGE-CASE-TEST-SUITE.md` — 62 test cases (TC-001–TC-062): normal use (10), boundary pushing (10), edge data (8), hard schedules (8), positive framing (6), minimal data (5), adversarial (5), crisis (5), tricky boundary (5)
- `docs/science/SLEEP-SCIENCE-DATABASE.md` — New section: AI Coaching & Digital Health with 11 citations (Luxton, Scholten, Naslund, Amagai, Torous, FDA 2026, Nature LLM Guardrails, Fitzpatrick, Inkster, Prochaska, Martinez-Miranda)

## Decisions Made

- **Haiku for high-volume, Sonnet for reasoning-heavy.** Weekly Brief and Pattern Alerts use claude-haiku-4-5 (~$0.015/user/month total). Transition Coaching and future Chat use claude-sonnet-4-5 for quality. Estimate: 0.4% of subscription revenue for AI features.
- **All AI output is structured JSON.** No freeform text to users. Enables safety classification, reliable UI rendering, and retry-free parsing.
- **3-layer safety is non-negotiable.** System prompt alone is insufficient for health apps. Post-generation scanner + fallback content are required layers.
- **Crisis UI overlay is mandatory.** Tier 3 crisis responses must appear as a full-screen overlay, not just inline response text — ensures visibility even for users who don't read full AI responses.
- **62 edge cases must all pass before Phase 20 launch.** Test suite becomes a regression gate for every prompt change.
- **FDA General Wellness exemption is the regulatory foundation.** Preserving this classification requires that AI-generated content never contains diagnostic language, medication guidance, or prognosis statements — one violation risks SaMD reclassification.

## Deviations from Plan

**1. [Rule 2 - Missing Content] Added 12 test cases beyond the required 50**

- **Found during:** Task 2 (Edge Case Test Suite creation)
- **Issue:** The required 50 cases were fully planned; however, coverage gaps were identified in tricky boundary cases (TC-058 through TC-062) and additional adversarial variants. 50 cases adequately covered primary categories but left tricky boundaries underrepresented.
- **Fix:** Added 12 additional cases for a total of 62 (TC-001 through TC-062), adding a Category I: Tricky Boundaries section.
- **Files modified:** EDGE-CASE-TEST-SUITE.md
- **Verification:** grep -c "^TC-0" returns 62
- **Committed in:** 3ae581d (Task 2 commit)

---

**Total deviations:** 1 expansion (Rule 2 — added critical test coverage beyond minimum)
**Impact on plan:** Positive. 12 additional edge cases improve pre-launch safety validation with no scope creep.

## Issues Encountered

- SLEEP-SCIENCE-DATABASE.md had a duplicate `---` separator at the Phase 13 section boundary that required careful matching for the edit. Resolved by reading the exact file content around the insertion point before editing.
- docs/research/ already contained earlier drafts of AI-COACHING-FRAMEWORK.md and SAFETY-GUARDRAILS.md from prior research work. Plan-required files were created in the correct location (.planning/phases/19-ai-coaching-research/) with full content meeting all plan requirements. No conflict — the existing docs/research/ files serve as a quick reference copy.

## User Setup Required

None — this is a research phase producing documents only. No external service configuration required.

## Next Phase Readiness

**Ready for Phase 20 (Claude Weekly Brief):**
- System prompt template is ready to implement (AI-COACHING-FRAMEWORK.md Section 2.1)
- Context injection schema is defined (Section 2.2) — Phase 20 needs to implement `buildUserContext()` accordingly
- Weekly Brief prompt template is defined (Appendix)
- Weekly Brief JSON output schema is defined (Section 3.1 in AI-COACHING-FRAMEWORK.md)
- Safety scanner TypeScript sketch is provided (SAFETY-GUARDRAILS.md Section 5)
- All 62 edge cases must pass against the final implemented system prompt before launch

**Concerns for Phase 20:**
- The post-generation safety scanner (SAFETY-GUARDRAILS.md Section 5) requires implementation — it's specified but not yet code
- The kill switch (remote config flag `ai_coaching_enabled`) needs to be wired in Phase 20 before any AI features go live
- Anthropic's data retention policy for the API tier being used should be verified and documented in the privacy disclosure before opt-in screen is shipped

---
*Phase: 19-ai-coaching-research*
*Completed: 2026-04-07*

## Self-Check: PASSED

Files exist:
- FOUND: .planning/phases/19-ai-coaching-research/AI-COACHING-FRAMEWORK.md
- FOUND: .planning/phases/19-ai-coaching-research/SAFETY-GUARDRAILS.md
- FOUND: .planning/phases/19-ai-coaching-research/EDGE-CASE-TEST-SUITE.md
- FOUND: docs/science/SLEEP-SCIENCE-DATABASE.md (AI Coaching section appended)

Commits exist:
- FOUND: 5788070 (Task 1 — AI coaching framework)
- FOUND: 3ae581d (Task 2 — Safety guardrails + edge case test suite)

Success criteria:
- AI-COACHING-FRAMEWORK.md: 10 sources cited, prompt architecture with context schema, tone comparison table — VERIFIED
- SAFETY-GUARDRAILS.md: 8 prohibited categories, crisis protocol (72h trigger), injection defenses — VERIFIED
- EDGE-CASE-TEST-SUITE.md: 62 cases (> 50 required), PASS/FAIL labels, guardrail references — VERIFIED
- SLEEP-SCIENCE-DATABASE.md: AI Coaching & Digital Health section added — VERIFIED
