---
tags: [config, active, navigator, non-clinical]
purpose: "Project AGENTS.md for ShiftWell. Pointer to ~/AGENTS.md + ShiftWell overrides."
---

# ShiftWell — Project AGENTS.md

This file points to the canonical `~/AGENTS.md` and adds ShiftWell-specific overrides. The detailed project context lives in `CLAUDE.md`; this file exists so Cursor and Codex (which look for `AGENTS.md`) pick up the same rules as Claude Code.

## Boundary

ShiftWell is **non-clinical** — no PHI processed in this repo. Anonymized population-level data only (cohort minimum 20, differential privacy applied). Cursor Background Agents and cloud MCPs are **allowed** in this dir.

If you find PHI here (e.g. a real user's HealthKit data ended up in test fixtures), stop and report — that would be an incident requiring scrub.

## Engine

- **Cursor as cockpit, Claude as engine** — per `~/AGENTS.md §3`. This is a TypeScript / React Native / Expo project; Sonnet handles execute, Opus for plan/review.
- **Worktrees encouraged** for parallel phase work — see `SHIPPING.md` in this dir for the recommended layout.
- **Background Agents are eligible** for non-clinical phases that don't need local MCPs — log results in `~/projects/the-build-project/unified-ai-stack/bg-agents-eval/eval-log.tsv` per the 30-day eval.

## Project rules

See `CLAUDE.md` in this directory for full rules. Highlights:
- `npm test` (1,062 tests as of 2026-05-07) before any commit
- Algorithm IP in `src/lib/circadian/` — never break existing tests
- Founder is an ED physician + beginner coder — explain non-trivial decisions
- Dark-mode-first UI; professional quality; science-backed only (no LLM-based clinical claims)

## Ship-Learn-AI Operating System

Load these files for any work about shipping, pilot users, AI scope, research, monetization, brand, or institutional growth:

- `docs/dev/PHASE_ACCEPTANCE_GATES.md` - required phase gates, endpoints, acceptance criteria, and evidence rules
- `docs/vision/FUTURE_IDEAS.md` - deferred AI, growth, institutional, and adjacent-market ideas
- `docs/research/RESEARCH-KNOWLEDGEBASE-PROGRAM-2026-05-07.md` - sleep science, AI workflow, Apple shipping, and atomic KB research program
- `docs/superpowers/specs/2026-05-07-ship-learn-ai-growth-design.md` - accepted strategic design
- `docs/superpowers/plans/2026-05-07-ship-learn-ai-growth.md` - execution plan

Phase advancement rule:

- No phase advances without a documented evidence bundle.
- Evidence must satisfy objective acceptance criteria in `docs/dev/PHASE_ACCEPTANCE_GATES.md`.
- Required signoff: Codex, Claude, Lead Engineer, and relevant coding/reviewer agents.
- AI remains a controlled validation/rerun gate until pilot data and M0-M4 evidence justify expansion.

Skill routing for future sessions:

- Always consider `$superpowers:using-superpowers`, `$superpowers:executing-plans`, `$superpowers:verification-before-completion`, `$superpowers:systematic-debugging`, and `$source-command-gotcha-sweep`.
- Use `$superpowers:test-driven-development` for behavior changes and `$superpowers:brainstorming` plus `$utility-gate` for major new work.
- Use `$superpowers:dispatching-parallel-agents`, `$superpowers:subagent-driven-development`, `$parallel-dispatch`, and `$overnight-execute` for independent research, review, and implementation lanes.
- Use `$second-opinion`, `$parallel-tournament`, and `$adversarial-review-panel` before major phase closure.
- Use `$build-ios-apps`, `$build-ios-apps:ios-debugger-agent`, `$build-ios-apps:ios-ettrace-performance`, `$build-ios-apps:ios-memgraph-leaks`, `$build-ios-apps:swiftui-ui-patterns`, and `$build-ios-apps:ios-app-intents` only for iOS runtime, native UI, performance, memory, or system-integration work.
- Use `$frontend-design:frontend-design`, `$figma:figma-create-design-system-rules`, `$figma:figma-generate-design`, `$figma:figma-generate-library`, `$figma:figma-implement-design`, `$figma:figma-code-connect`, and `$imagegen` only for focused design work.
- Use `$atomic-agents`, `$atomic-agents:new-app`, and `$auth0:auth0-cli` only after a gated architecture decision selects a separate agent service or Auth0.

## Workflow

1. Load `.planning/STATE.md` first (gsd_state_version 1.0; current milestone v1.1).
2. Pick the active phase from `.planning/ROADMAP.md`.
3. Load the Ship-Learn-AI operating docs above for launch, AI, research, monetization, or growth work.
4. For non-trivial work, write a plan via `ce-plan` or `docs/superpowers/plans/` first, then execute.
5. Use `ce-commit-push-pr` when shipping.

## Known external blockers

These are unblocked by Sim, not by Claude:

- LLC formation → blocks Apple Developer enrollment
- Apple Developer Program enrollment (D-U-N-S, ~5 weeks) → blocks TestFlight distribution
- Trademark clearance for "ShiftWell" ($500, in progress)

Do not waste cycles trying to "unblock" these in code. Track in `SHIPPING.md`.
