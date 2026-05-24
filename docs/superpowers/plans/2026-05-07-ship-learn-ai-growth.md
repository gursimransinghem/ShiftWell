# ShiftWell Ship, Learn, AI, Growth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move ShiftWell from current repo state to shipped TestFlight app, pilot learning loop, hardened algorithm/UX, AI Gatekeeper, paid product, brand growth, institutional adoption, and adjacent vertical expansion using explicit phase gates.

**Architecture:** Deterministic algorithm first; evidence-backed research wiki and atomic KB; controlled AI Gatekeeper between algorithm and user; analytics/crash/backend/subscription proof before scale; phase evidence bundles as the release control plane.

**Tech Stack:** Expo/React Native, TypeScript, Jest, Apple HealthKit, EAS Build/Submit, Supabase, PostHog, Sentry, RevenueCat, future optional Atomic Agents/Auth0/Figma integration as gated workstreams.

---

## Phase 0: State Reconciliation

- [ ] Read `AGENTS.md`, `CLAUDE.md`, `.planning/STATE.md`, `.planning/ROADMAP.md`, `SHIPPING.md`, `tasks/todo.md`, launch docs, design audit, and current git status.
- [ ] Run `npm test -- --runInBand`.
- [ ] Run `./node_modules/.bin/tsc --noEmit --pretty false`.
- [ ] Run Expo/EAS readiness checks if dependencies and credentials are available.
- [ ] Verify Sentry, PostHog, Supabase, RevenueCat, HealthKit, Apple Developer, App Store Connect, and launch metadata state.
- [ ] Create `docs/dev/evidence/M0-state-reconciliation-YYYY-MM-DD.md`.
- [ ] Get Codex, Claude, Lead Engineer, and reviewer signoff.

Acceptance criteria:

- Evidence file documents exact command output and current blockers.
- P0/P1/P2 blocker list exists.
- Stale docs are documented.
- Lead Engineer chooses next executable phase.

## Phase 1: TestFlight MVP Cut

- [ ] Freeze MVP features and explicitly defer nonessential AI/growth scope to `docs/vision/FUTURE_IDEAS.md`.
- [ ] Fix P0 build, TypeScript, and runtime blockers.
- [ ] Verify onboarding, schedule setup, plan generation, Today screen, feedback, settings, notifications, and HealthKit permissions.
- [ ] Verify PostHog event capture.
- [ ] Verify Sentry event capture.
- [ ] Verify Supabase MVP flows.
- [ ] Verify RevenueCat sandbox if paywall is included.
- [ ] Build iOS with EAS.
- [ ] Upload to App Store Connect/TestFlight.
- [ ] Create evidence bundle and signoff.

Acceptance criteria:

- iOS build exists and can be installed by a tester.
- Core path has screenshot/video proof.
- Instrumentation proof exists.
- No unresolved P0 issue remains.

## Phase 2: Pilot Readiness

- [ ] Define pilot cohort and schedule archetypes.
- [ ] Write pilot guide and support workflow.
- [ ] Define feedback taxonomy.
- [ ] Validate internal UAT for rotating, night, recovery, and irregular-family-disruption scenarios.
- [ ] Create pilot evidence bundle and signoff.

Acceptance criteria:

- Pilot can start without requiring undocumented Sim instructions.
- Feedback is structured and reviewable.
- UAT scenarios pass or are explicitly blocked.

## Phase 3: Pilot Data Loop

- [ ] Launch pilot.
- [ ] Monitor activation, retention, crash-free sessions, and feedback.
- [ ] Run weekly bug and algorithm trust triage.
- [ ] Add pilot cases to validation fixtures when appropriate.
- [ ] Create weekly readouts.

Acceptance criteria:

- Real user data exists.
- Product decisions are tied to observed behavior.
- Algorithm complaints have input/output context.

## Phase 4: Algorithm And Adaptive Validation

- [ ] Build deterministic validation fixtures from pilot scenarios.
- [ ] Verify adaptive feedback bounds.
- [ ] Verify rerun triggers for new shifts, poor sleep, user feedback, and HealthKit sleep changes.
- [ ] Compare recommendations against cited sleep science KB claims.
- [ ] Create algorithm validation report and signoff.

Acceptance criteria:

- Same inputs produce same recommendation outputs.
- Adaptive changes are bounded.
- Rerun logic is test covered or documented as blocked.
- AI Gatekeeper entry is approved.

## Phase 5: AI Gatekeeper v0

- [ ] Define recommendation output schema.
- [ ] Define AI validation schema.
- [ ] Build golden-case harness.
- [ ] Implement rerun request protocol behind feature flag.
- [ ] Add provenance logging.
- [ ] Run adversarial review panel and second-opinion review.
- [ ] Pilot behind feature flag.

Acceptance criteria:

- AI cannot bypass deterministic algorithm.
- Rerun requests include input delta, reason code, algorithm version, output hash, validation result, and explanation.
- Low-confidence AI output fails closed.
- Privacy review passes.

## Phase 6: Paid Conversion

- [ ] Finalize first subscription tier.
- [ ] Verify RevenueCat products and entitlements.
- [ ] Verify App Store subscription metadata.
- [ ] Test sandbox purchase, restore, and entitlement refresh.
- [ ] Instrument paywall funnel.
- [ ] Review copy against brand principles.

Acceptance criteria:

- Purchase and restore work in sandbox.
- Entitlement gates work.
- Paywall copy is restrained and citation-safe.

## Phase 7: Public Growth

- [ ] Build citation-backed content claim library.
- [ ] Prepare physician/founder credibility materials.
- [ ] Draft social, podcast, article, and influencer outreach.
- [ ] Draft Figs collaboration concept.
- [ ] Instrument acquisition source tracking.

Acceptance criteria:

- Every public claim has citation or opinion label.
- No dark patterns or fake urgency.
- Growth source tracking works.

## Phase 8: Enterprise And Residency

- [ ] Create residency program pilot package.
- [ ] Create nursing department pilot package.
- [ ] Create institutional one-pager and deck.
- [ ] Create privacy/security summary.
- [ ] Define measurable outcomes.
- [ ] Run compliance/legal review before broad outreach.

Acceptance criteria:

- Institutional materials cite actual data or mark assumptions.
- Privacy/security posture is documented.
- Outcome metrics are measurable.

## Phase 9: Adjacent Verticals

- [ ] Pick one vertical.
- [ ] Run user interviews.
- [ ] Build vertical-specific evidence map.
- [ ] Review algorithm assumptions.
- [ ] Prototype only after Lead Engineer approval.

Acceptance criteria:

- Vertical problem is proven.
- Evidence map exists.
- Algorithm changes are understood.

## Research Program Tasks

- [ ] Build sleep science source ledger from AASM, NIOSH/CDC, PubMed/NIH, Apple HealthKit docs, and selected reviews/RCTs.
- [ ] Draft sleep science wiki.
- [ ] Convert wiki into atomic KB with claim IDs.
- [ ] Build AI app development workflow wiki from GitHub, Reddit, YouTube/NotebookLM, and official docs.
- [ ] Build Apple shipping checklist from Apple and Expo official docs.
- [ ] Verify Supabase, PostHog, Sentry, RevenueCat, and optional Auth0 implementation docs.
- [ ] Link research outputs into algorithm, AI Gatekeeper, public claim, and institutional claim reviews.

Acceptance criteria:

- Every claim has a source.
- Source confidence is graded.
- Reddit/YouTube/blog findings are tagged anecdotal unless independently verified.
- Official docs win conflicts.

## Skill Use Plan

- [ ] Use `$superpowers:brainstorming` and `$utility-gate` before adding major workstreams.
- [ ] Use `$superpowers:executing-plans` and `$superpowers:verification-before-completion` for every milestone.
- [ ] Use `$superpowers:test-driven-development` for behavior changes.
- [ ] Use `$superpowers:systematic-debugging` for bugs and build failures.
- [ ] Use `$superpowers:dispatching-parallel-agents`, `$superpowers:subagent-driven-development`, `$parallel-dispatch`, and `$overnight-execute` for independent research/review/implementation lanes.
- [ ] Use `$second-opinion`, `$parallel-tournament`, and `$adversarial-review-panel` before major phase closure.
- [ ] Use `$build-ios-apps`, `$build-ios-apps:ios-debugger-agent`, `$build-ios-apps:ios-ettrace-performance`, and `$build-ios-apps:ios-memgraph-leaks` for iOS runtime, performance, and memory evidence.
- [ ] Use `$build-ios-apps:swiftui-ui-patterns` and `$build-ios-apps:ios-app-intents` only for native iOS surfaces or system integration work.
- [ ] Use `$frontend-design:frontend-design`, Figma skills, and `$imagegen` only for focused design work.
- [ ] Use `$atomic-agents` and `$atomic-agents:new-app` only if the AI Gatekeeper becomes a separate agent service.
- [ ] Use `$auth0:auth0-cli` only if Auth0 is selected after an auth architecture decision.
- [ ] Use `$source-command-gotcha-sweep` before closeout.

## Final Verification

- [ ] Evidence bundle exists.
- [ ] `git diff --check` passes for touched files.
- [ ] Relevant tests pass or failures are documented as pre-existing/nonblocking.
- [ ] Docs link to each other without stale obvious paths.
- [ ] Status breadcrumb is appended.
- [ ] Lead Engineer confirms next phase.

