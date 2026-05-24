# ShiftWell Phase Acceptance Gates

Created: 2026-05-07
Status: Required governance for ship -> pilot -> harden -> AI -> growth

## Non-Negotiable Rule

No phase advances until every required endpoint for the current phase has passing evidence documented in this file or a linked evidence bundle.

Required signoff for a phase to pass:

- Codex verification.
- Claude verification.
- Lead Engineer verification.
- Relevant coding/reviewer agents when the phase used subagents.

If any acceptance criterion lacks evidence, the phase is blocked. Do not treat "looks good" as evidence.

## Evidence Bundle Template

Create or update a phase evidence file before requesting signoff:

Path:

`docs/dev/evidence/M<phase-number>-<short-name>-YYYY-MM-DD.md`

Required sections:

- Phase name.
- Commit or worktree identifier.
- Scope summary.
- Exact commands run.
- Exact pass/fail results.
- Screenshots or artifact paths.
- Analytics event proof where applicable.
- Crash/error monitoring proof where applicable.
- User/pilot feedback proof where applicable.
- Known residual risks.
- Codex verdict.
- Claude verdict.
- Lead Engineer verdict.
- Agent/reviewer verdicts.

Pass format:

```md
## Signoff

- Codex: PASS, evidence reviewed at <path>, date <YYYY-MM-DD>
- Claude: PASS, evidence reviewed at <path>, date <YYYY-MM-DD>
- Lead Engineer: PASS, evidence reviewed at <path>, date <YYYY-MM-DD>
- Agents: PASS, reviewers <names>, date <YYYY-MM-DD>
```

## Skill Routing Matrix

Use skills deliberately. Loading every skill for every task creates noise; selecting the right skill is part of the gate.

Always relevant:

- `$superpowers:using-superpowers`
- `$superpowers:executing-plans`
- `$superpowers:verification-before-completion`
- `$superpowers:systematic-debugging`
- `$superpowers:test-driven-development` when behavior changes
- `$source-command-gotcha-sweep` before closeout of major plans

Planning and review:

- `$superpowers:brainstorming`
- `$utility-gate`
- `$second-opinion`
- `$adversarial-review-panel`
- `$parallel-tournament`

Parallel work:

- `$superpowers:dispatching-parallel-agents`
- `$superpowers:subagent-driven-development`
- `$parallel-dispatch`
- `$overnight-execute`

iOS and app shipping:

- `$build-ios-apps`
- `$build-ios-apps:swiftui-ui-patterns`
- `$build-ios-apps:ios-app-intents`
- `$build-ios-apps:ios-debugger-agent`
- `$build-ios-apps:ios-ettrace-performance`
- `$build-ios-apps:ios-memgraph-leaks`

Design:

- `$frontend-design:frontend-design`
- `$figma:figma-create-design-system-rules`
- `$figma:figma-generate-design`
- `$figma:figma-generate-library`
- `$figma:figma-implement-design`
- `$figma:figma-code-connect`
- `$imagegen`

Backend, auth, and agent services:

- `$atomic-agents`
- `$atomic-agents:new-app`
- `$auth0:auth0-cli` only if Auth0 becomes the chosen auth provider

## Phase M0: State Reconciliation

Goal: Establish runtime truth before deciding what is actually blocking TestFlight.

Objective endpoints:

- Current app state is reconciled against repo docs, dirty worktree, tests, TypeScript, simulator/device status, analytics, crash reporting, backend, and launch blockers.
- Stale docs are identified.
- Open blockers are ranked by ship impact.

Tasks:

1. Read `AGENTS.md`, `CLAUDE.md`, `.planning/STATE.md`, `.planning/ROADMAP.md`, `SHIPPING.md`, `tasks/todo.md`, launch docs, design audit, and current git status.
2. Run repo quality checks.
3. Verify Expo/iOS build prerequisites.
4. Verify Sentry, PostHog, Supabase, RevenueCat, and HealthKit integration state.
5. Confirm external blockers: Apple Developer account, LLC/legal name, App Store metadata, trademark posture.
6. Produce `docs/dev/evidence/M0-state-reconciliation-YYYY-MM-DD.md`.

Acceptance criteria:

- `git status --short` is documented and unrelated dirty work is classified.
- `npm test -- --runInBand` result is documented.
- `./node_modules/.bin/tsc --noEmit --pretty false` result is documented.
- Expo/EAS readiness command result is documented when available.
- Missing launch docs or stale pointers are listed.
- Runtime blockers are ranked P0/P1/P2.
- Lead Engineer confirms the next executable phase.

Required evidence:

- Command output snippets.
- Linked evidence file.
- Reviewer signoff.

## Phase M1: TestFlight MVP Cut

Goal: Produce a stable, reviewable iOS build that can be distributed to internal and external testers.

Objective endpoints:

- App builds for iOS.
- Core onboarding and Today flow work on simulator and at least one real device when available.
- Crash reporting and analytics initialize without blocking use.
- Critical user flows have screenshots or video proof.

Tasks:

1. Freeze MVP feature scope.
2. Fix P0 build, TypeScript, and test blockers.
3. Verify onboarding, schedule setup, plan generation, Today screen, feedback capture, and settings.
4. Verify permission flows for notifications and Apple Health.
5. Verify Sentry initialization and one controlled test event.
6. Verify PostHog event capture for activation, plan generated, feedback submitted, paywall viewed, and subscription result.
7. Verify Supabase functions needed by MVP.
8. Verify RevenueCat sandbox purchase and restore when paywall is enabled.
9. Build through EAS.
10. Submit to TestFlight through EAS Submit or App Store Connect.

Acceptance criteria:

- All P0 Jest tests pass.
- TypeScript has no new app-scope blocker introduced by this phase.
- iOS build artifact exists.
- TestFlight build appears in App Store Connect.
- At least one tester can install the app.
- Evidence bundle includes screenshots/video for the core path.
- Analytics and crash proof are documented.

Required evidence:

- EAS build URL or build artifact path.
- App Store Connect/TestFlight proof.
- Sentry event ID.
- PostHog event proof.
- Supabase smoke output.
- RevenueCat sandbox proof if subscriptions are included.

## Phase M2: Pilot Readiness And UAT

Goal: Make the app safe and useful for a small pilot cohort.

Objective endpoints:

- Pilot instructions are clear.
- Feedback intake is structured.
- Support and bug triage process exists.
- Privacy and expectation language is accurate.

Tasks:

1. Define pilot cohort, inclusion criteria, and exclusion criteria.
2. Write pilot onboarding message and support workflow.
3. Create feedback taxonomy.
4. Add in-app or linked feedback capture.
5. Verify that user deletion/cancel flows are understandable.
6. Run internal UAT with at least three schedule archetypes: day-to-night flip, rotating schedule, and post-night recovery.
7. Create pilot evidence bundle.

Acceptance criteria:

- Pilot guide exists.
- Feedback capture creates reviewable records.
- UAT covers all required schedule archetypes.
- No P0 UX confusion remains in onboarding or Today flow.
- Lead Engineer approves pilot start.

Required evidence:

- Pilot guide path.
- UAT checklist.
- Feedback artifacts.
- Screenshots/video for every tested archetype.

## Phase M3: Pilot Data Loop

Goal: Learn from real users without overfitting prematurely.

Objective endpoints:

- Pilot users install and use the app.
- Activation, retention, feedback, crash, and recommendation-trust data are collected.
- Bugs and UX friction are triaged into a ranked backlog.

Tasks:

1. Start pilot.
2. Monitor activation and crash-free sessions.
3. Collect structured feedback.
4. Review recommendation trust and adherence.
5. Run weekly bug and UX triage.
6. Update roadmap based on evidence.

Acceptance criteria:

- Minimum pilot sample size is defined before launch.
- Activation and retention events are visible in PostHog.
- Crashes are visible in Sentry or absence is documented.
- Feedback is categorized.
- Algorithm complaints are linked to input/output evidence.
- Weekly pilot readout exists.

Required evidence:

- PostHog cohort/event screenshots or exports.
- Sentry issue summary.
- Feedback export.
- Bug backlog.
- Weekly readout.

## Phase M4: Algorithm And Adaptive Validation

Goal: Prove the deterministic algorithm and adaptive layer are trustworthy enough to place AI in front of users.

Objective endpoints:

- Recommendation outputs are explainable, deterministic, and evidence-linked.
- Adaptive changes improve or appropriately preserve user outcomes.
- Bad recommendations are reproducible and triaged.

Tasks:

1. Build validation fixtures from pilot scenarios.
2. Compare algorithm recommendations against sleep knowledgebase claims.
3. Review adaptive feedback offsets and safety thresholds.
4. Test rerun behavior for new shifts, poor sleep, and user feedback.
5. Create algorithm validation report.

Acceptance criteria:

- Representative pilot scenarios exist as fixtures or documented cases.
- Deterministic algorithm output is reproducible from the same inputs.
- Adaptive changes stay inside documented bounds.
- Every failed or confusing recommendation has a triage outcome.
- Lead Engineer approves AI Gatekeeper entry.

Required evidence:

- Fixture paths.
- Test output.
- Validation report.
- Review signoff.

## Phase M5: AI Gatekeeper v0

Goal: Add a controlled AI validator between algorithm output and user display.

Objective endpoints:

- AI validates recommendations but does not own scheduling.
- AI can request deterministic reruns with reason codes.
- AI explanations are grounded in algorithm output and knowledgebase claims.
- AI failures degrade safely.

Tasks:

1. Define recommendation output schema.
2. Define AI validation schema.
3. Build local/offline test harness with golden cases.
4. Implement rerun request protocol.
5. Add provenance logging.
6. Add safety and confidence thresholds.
7. Run adversarial review panel and second-opinion review.
8. Pilot behind a feature flag.

Acceptance criteria:

- Schema tests pass.
- Golden cases pass.
- AI cannot bypass deterministic algorithm.
- Every rerun request logs input delta, reason code, algorithm version, and output hash.
- Low-confidence AI output fails closed or hides behind a plain deterministic explanation.
- Privacy review passes.

Required evidence:

- Schema files.
- Test output.
- Feature flag proof.
- Logs showing valid rerun request.
- Reviewer verdicts.

## Phase M6: Paid Conversion And Passive Income

Goal: Convert useful pilot value into a simple paid product.

Objective endpoints:

- Subscription purchase and restore work.
- Pricing and paywall claims are restrained and accurate.
- Conversion funnel is measurable.

Tasks:

1. Finalize first paid tier.
2. Verify RevenueCat products and entitlements.
3. Verify App Store subscription metadata.
4. Test sandbox purchase, restore, cancellation education, and entitlement refresh.
5. Instrument paywall events.
6. Run ethical copy review against brand principles.

Acceptance criteria:

- Purchase succeeds in sandbox.
- Restore succeeds in sandbox.
- Entitlement gates expected features.
- Paywall has no medical overclaiming or dark patterns.
- Funnel events are visible in PostHog.

Required evidence:

- RevenueCat sandbox proof.
- App Store Connect product proof.
- PostHog funnel proof.
- Copy review signoff.

## Phase M7: Public Growth And Brand

Goal: Grow with credible science-backed content without overclaiming.

Objective endpoints:

- Public message is consistent.
- Claims are citation-backed.
- Growth channels are measurable.

Tasks:

1. Build content claim library from sleep knowledgebase.
2. Create founder/physician credibility page.
3. Create social content calendar.
4. Prepare outreach list for podcasts, magazines, articles, and physician communities.
5. Draft Figs/influencer collaboration proposal.
6. Build analytics for acquisition source tracking.

Acceptance criteria:

- Every public claim maps to a citation or is clearly framed as opinion.
- No fake testimonials, fake urgency, or medical-treatment claims.
- Acquisition events are trackable.
- Lead Engineer approves publication.

Required evidence:

- Claim library.
- Draft content.
- Source/citation map.
- Analytics proof.

## Phase M8: Enterprise, Residency, And Hospital

Goal: Package ShiftWell as a serious fatigue and sleep support product for residency programs and hospitals.

Objective endpoints:

- Institutional pitch is evidence-based.
- Privacy/security posture is documented.
- Program outcomes are measurable.

Tasks:

1. Define residency program pilot package.
2. Define nursing department pilot package.
3. Create institutional one-pager and deck.
4. Create privacy/security summary.
5. Define outcome metrics.
6. Run legal/compliance review before claims escalate.

Acceptance criteria:

- Institutional materials cite actual pilot data or clearly mark assumptions.
- Security/privacy summary exists.
- Outcome metrics are measurable.
- Claims are reviewed before outreach.

Required evidence:

- Deck/path.
- One-pager/path.
- Privacy/security doc.
- Review signoff.

## Phase M9: Adjacent Verticals

Goal: Expand beyond medical shift work only when evidence supports adaptation.

Objective endpoints:

- Each new vertical has its own user research, evidence map, and algorithm assumption review.

Tasks:

1. Select one vertical at a time: pilots, travel/jet lag, frequent travelers, parents/family chaos, or other shift work.
2. Run user interviews.
3. Review domain-specific fatigue/sleep evidence.
4. Identify algorithm changes needed.
5. Prototype only after gates pass.

Acceptance criteria:

- Vertical user problem is documented.
- Evidence map exists.
- Algorithm assumptions are reviewed.
- Business case is credible.
- Lead Engineer approves new roadmap entry.

Required evidence:

- Interview notes.
- Evidence map.
- Algorithm review.
- Business case.

## Closeout Checklist For Every Phase

- Evidence file exists.
- Commands and artifacts are linked.
- Acceptance criteria are checked one by one.
- Known risks are documented.
- Codex confirms.
- Claude confirms.
- Lead Engineer confirms.
- Coding/reviewer agents confirm when used.
- Status breadcrumb is added.
- Next phase entry criteria are met.

