# Active Tasks

## P0: Final Ship Sprint — Core Loop First (2026-04-29)
- [ ] Use `docs/dev/2026-04-29-final-ship-sprint-plan.md` as the active execution plan until TestFlight.
- [ ] Invoke `docs/superpowers/skills/deep-product-ship-review.md` for periodic honest product/ship-readiness reviews.
- [ ] Freeze new feature work unless it directly improves the core loop: onboard -> import/add shifts -> generate plan -> Today guidance -> export/notify -> feedback.
- [ ] Hide, disable, or de-emphasize half-baked surfaces that do not support the TestFlight core loop.
- [ ] Run a full fresh-install iPhone walkthrough and record every friction point before adding new functionality.

> Refreshed 2026-04-19. Reflects remote-visible branch state only — items from the local working tree (audit artifacts, website/, shiftwell-dashboard/) are tracked separately under "Local → Remote sync" below.

## Recently Merged (context)

- **PR #7** — Onboarding v2 (6 routed screens). Verify: `app/(onboarding)/_layout.tsx`.
- **PR #6** — PostHog analytics.
- **PR #4** — Sentry error monitoring.
- **PR #5** — API-key migration / secrets hygiene.
- **PR #3** — Themed component set.
- **PR #2** — Supabase migrations 002-006 (updated_at, delete_user RPC, audit logs, RLS delete policies, perf indexes).
- **This branch** — pricing SoT, paywall/App-Store honesty, WCAG fixes, brand principles, logo tournament.

## P0 — Unblockers for TestFlight

- [ ] **Local → Remote sync.** User has 2026-04-18 audit artifacts, `website/`, and sibling `shiftwell-dashboard/` only in local working tree. Push relevant pieces to feature branches (audits → `docs/audits/2026-04-18/`; website → decide target: `website/` or merge into `LANDING_PAGE.html`).
- [ ] **npm audit** — 6 vulnerabilities reported last session. Triage: `npm audit --omit=dev` → upgrade or document each.
- [ ] **Tagline lock.** Confirm App Store subtitle: "Circadian Sleep Plans for Shift Workers" (28 chars). Surfaces into marketing site + Store listing + first-run.

## P1 — Live Device QA (needs iPhone or TestFlight build)

- [ ] `GradientMeshBackground` 3-orb animation — verify on real device (simulator shows stutter).
- [ ] Wind-down state — time-dependent, test ~9pm local.
- [ ] Real HealthKit data flow — `getSleepHistory()`, `computeRecoveryScore()` with Apple Watch data.
- [ ] Score store wiring — HealthKit → real adherence scores (currently mock-backed).
- [ ] SET-03 DND / Sleep Focus mode — needs entitlements + live device.
- [ ] Paywall on real device — trial countdown displays, one-tap cancel path works from iOS Settings.

## P1 — Premium Revamp Follow-On PRs (each its own plan)

These are **intentionally deferred** from the current PR to keep review surface small:

- [ ] **Logo tournament finalize** — once 5 lanes complete in this PR, run the scoring rubric against `docs/design/BRAND-PRINCIPLES.md`, pick winner, promote to `assets/images/icon.png` at all required sizes.
- [ ] **Website revamp** — target file decision (new `website/index.html` from local OR existing `LANDING_PAGE.html`). Apply brand principles. Kill any placeholder testimonials.
- [ ] **Fast-path onboarding** — skip-to-shift-entry for returning-skeptic audience; 2-screen path vs current 6.
- [ ] **Today-tier refactor** — restructure `app/(tabs)/index.tsx` (1,033 lines) into composed sections by tier (free vs pro).
- [ ] **Screenshot capture (6)** — blocked on logo winner + fast-path + seeded demo data.

## P2 — External Blockers

- [ ] LLC filing — decide: Circadian Labs vs Vigil Health.
- [ ] Apple Developer enrollment (requires LLC + D-U-N-S).
- [ ] D-U-N-S number (~5 business days after LLC).
- [ ] ACLS/BLS/PALS renewal — expires 2026-05-31 (41 days).

## P3 — Adaptive Brain v2 (Post-Launch)

- [ ] Add HRV RMSSD to HealthKit auth (`heartRateVariabilitySDNN`).
- [ ] Integrate HRV into recovery formula (currently sleep-stage only).
- [ ] Shift-type baseline separation (post-night vs post-day HRV/RHR baselines).
- [ ] Research pipeline cron — periodic agent → new studies → `docs/science/`.
- [ ] 30-day learning-phase completion announcement UI.

## P4 — App Store Prep

- [ ] Sound design — 3 audio files for notification/confirmation stubs.
- [ ] App icon finalization (depends on logo tournament winner).
- [ ] Privacy policy + health disclaimers — review against `src/content/legal.ts` inline summaries.
- [ ] TestFlight build via EAS.
- [ ] App Store listing — final proofread (already aligned to pricing SoT in this PR).

## Post-Launch Backlog

- [ ] Light mode — opt-in, not default.
- [ ] Icon set consolidation — audit duplicate Ionicons usage across Today cards.
- [ ] Spanish localization audit — strings exist but not reviewed by native speaker.

---

Last Reviewed: 2026-04-19
Last Edited: 2026-04-19
Review Notes: Full rewrite. Dropped verified-complete items (LightProtocolStrip wired; app/index.tsx has no bypass to revert). Added pricing SoT reconciliation, logo tournament, and remote-sync items surfaced by this PR's audit. Recently-merged section added for onboarding context.
