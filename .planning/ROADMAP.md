# Roadmap: ShiftWell

## Milestones

- ✅ **v1.0 TestFlight** — Phases 1-6 (code shipped 2026-04-06, legal blocking distribution)
- 🚧 **v1.1 TestFlight Launch & Adaptive Brain** — Phases 7-12 (in progress)

## Phases

<details>
<summary>✅ v1.0 TestFlight (Phases 1-6) — CODE SHIPPED 2026-04-06</summary>

**Note:** Phase 6 partially shipped outside GSD framework. Critical gaps documented in `milestones/v1.0-MILESTONE-AUDIT.md` — move to Milestone 2.

- [x] **Phase 1: Foundation & Onboarding** — Design system + 8-screen onboarding (completed 2026-04-02)
- [x] **Phase 2: Calendar Sync** — Apple + Google Calendar read/write (completed 2026-04-02)
- [x] **Phase 3: Sleep Plan Generation** — Algorithm-to-calendar pipeline (completed 2026-04-02)
- [x] **Phase 4: Night Sky Mode & Notifications** — Bedtime UI + push notifications (completed 2026-04-02)
- [x] **Phase 5: Live Activities & Recovery Score** — Dynamic Island stub + adherence score (completed 2026-04-02)
- [~] **Phase 6: Premium, Settings & Polish** — Partially shipped outside GSD; 9 gaps move to Milestone 2

Full archive: `.planning/milestones/v1.0-ROADMAP.md`

</details>

### 🚧 v1.1 TestFlight Launch & Adaptive Brain (In Progress)

**Goal:** Fix broken pipes, deliver Adaptive Brain core, ship to TestFlight, prepare App Store submission path.

- [x] **Phase 7: Critical Bug Fixes** — 3 broken integration pipes + TypeScript errors blocking all real-user testing (completed 2026-04-07)
- [ ] **Phase 8: Adaptive Brain Core** — Morning trigger, sleep debt engine, AdaptiveInsightCard, change logger
- [ ] **Phase 9: Circadian Protocols** — 5 transition types + SleepDebtCard visualization
- [ ] **Phase 10: TestFlight Prep** — Privacy manifest, entitlements, app icon, EAS config, installedAt timestamp
- [ ] **Phase 11: App Store Prep** — Account deletion, medical disclaimer, screenshots, privacy labels, review notes
- [ ] **Phase 12: ActivityKit Integration** — Real Dynamic Island transitions (gated on Apple Developer enrollment)

## Phase Details

### Phase 7: Critical Bug Fixes
**Goal**: All three integration pipes (trial, score, downgrade) are functional and TypeScript compiles clean — real users can install the app without hitting broken flows.
**Depends on**: Nothing (prerequisite for all v1.1 phases)
**Requirements**: BUG-01, BUG-02, BUG-03, BUG-04, BUG-05, BUG-06
**Success Criteria** (what must be TRUE):
  1. First-launch user automatically starts a 7-day trial without any manual seed call
  2. Recovery Score accumulates data correctly across background/foreground transitions each day
  3. User whose trial expires sees a downgrade screen with a re-subscribe CTA, not a crash or blank screen
  4. EAS build completes with zero TypeScript errors
  5. AdaptiveInsightCard shows distinct before/after plan snapshots when a change occurs
  6. Morning Dynamic Island transition includes today's recovery score
**Plans:** 2/2 plans complete
Plans:
- [x] 07-01-PLAN.md — App lifecycle fixes: trial auto-start, score finalization, downgrade screen
- [x] 07-02-PLAN.md — TypeScript errors, adaptive delta fix, Dynamic Island morning score
**Rationale**: Broken pipes in trial start, score finalization, and downgrade flow poison all real-user testing. Must be resolved before any feature work is verifiable.

### Phase 8: Adaptive Brain Core
**Goal**: The Adaptive Brain runs once each morning on app foreground, calculates sleep debt over a 14-night rolling window, and surfaces a human-readable explanation of any plan changes on the Today screen.
**Depends on**: Phase 7 (BUG-02 score fix is prerequisite for debt calculation)
**Requirements**: BRAIN-01, BRAIN-02, BRAIN-04, BRAIN-06
**Success Criteria** (what must be TRUE):
  1. App recalculates the sleep plan exactly once per day when brought to foreground (debounced — does not re-run on every app switch)
  2. Sleep debt balance is visible and reflects the prior 14 nights of adherence data
  3. When the plan changes, AdaptiveInsightCard appears on the Today screen showing what changed and which factor drove it
  4. Plan change card includes an undo action that reverts to the previous plan
  5. A human-readable log entry is written for every plan change (e.g., "Bedtime moved earlier because next shift starts at 6am and debt is high")
**Plans**: TBD
**Rationale**: Core Adaptive Brain wiring must be established before adding the complexity of 5 circadian transition protocols in Phase 9. Phase 7's score fix (BUG-02) is a direct prerequisite for the debt engine.
**UI hint**: yes

### Phase 9: Circadian Protocols
**Goal**: The algorithm routes shift transitions to one of five circadian protocol types, and users see a dual-meter debt/credit visualization on the Today screen.
**Depends on**: Phase 8 (transition routing depends on Adaptive Brain infrastructure)
**Requirements**: BRAIN-03, BRAIN-05
**Success Criteria** (what must be TRUE):
  1. A pre-shift transition routes to the pre-shift protocol and adjusts bedtime accordingly
  2. A post-shift transition routes to the post-shift protocol with appropriate recovery window
  3. Rotating, recovery, and off-sequence transitions each route to their correct handler
  4. SleepDebtCard is visible on the Today screen showing current debt (minutes) and banked credit on a single gauge
  5. Banking protocol correctly reduces upcoming debt when extra sleep is logged on off-days
**Plans**: TBD
**Rationale**: Depends on Phase 8 infrastructure. Transition routing logic and the SleepDebtCard visualization are bundled here because both require the debt engine to be operational.
**UI hint**: yes

### Phase 10: TestFlight Prep
**Goal**: A production EAS build can be submitted to TestFlight — privacy manifest declared, entitlements configured, app icon and splash set, bundle ID matched, and installedAt timestamp written.
**Depends on**: Phase 7 (TypeScript must compile clean for EAS build to succeed)
**Requirements**: TF-01, TF-02, TF-03, TF-04, TF-05
**Success Criteria** (what must be TRUE):
  1. EAS production build completes without ITMS-91061 rejection (privacy manifest declares all 4 required API categories)
  2. HealthKit data is accessible in the production build (both entitlements declared)
  3. App icon (1024×1024) and splash screen appear in the installed build — no default Expo assets visible
  4. Bundle ID in `eas.json` production profile matches the App Store Connect record
  5. An ISO timestamp is written to AsyncStorage and Supabase when onboarding completes
**Plans**: TBD
**Rationale**: Config-heavy phase independent of feature code. Can begin in parallel with Phase 8/9, but TypeScript must be clean (Phase 7) for EAS to build. installedAt timestamp is included here because it is EAS build infrastructure, not UI.

### Phase 11: App Store Prep
**Goal**: The app satisfies all Apple-required and legally-required elements for App Store submission — account deletion, medical disclaimer, screenshots, privacy nutrition labels, and review notes ready.
**Depends on**: Phase 10 (TestFlight validation required before submission)
**Requirements**: APP-01, APP-02, APP-03, APP-04, APP-05
**Success Criteria** (what must be TRUE):
  1. Settings screen includes a "Delete Account" flow that removes the Supabase auth record and revokes HealthKit consent
  2. Medical disclaimer ("Not a substitute for medical advice. Consult your physician.") appears in onboarding and Settings
  3. App Store screenshots exist in 1290×2796 (iPhone 16 Pro Max 6.9-inch) — the current required dimensions
  4. App Privacy nutrition labels are completed in App Store Connect with all HealthKit data types, usage purpose, and linkage declared
  5. App Review notes document demo account credentials, HealthKit permission rationale, and Live Activity explanation
**Plans**: TBD
**Rationale**: Requires TestFlight validation to confirm UI flows work before generating screenshots. Account deletion is Apple-mandated since 2022 and blocks submission if absent.
**UI hint**: yes

### Phase 12: ActivityKit Integration
**Goal**: Real Dynamic Island transitions replace the notification stub — wind-down, sleep start, and morning transitions use native ActivityKit.
**Depends on**: Phase 10 (EAS production build required for native module testing), Phase 7 (BUG-06 score fix needed for morning transition)
**Requirements**: LIVE-04, LIVE-05
**Success Criteria** (what must be TRUE):
  1. `expo-live-activity@0.4.2` is installed and the config plugin is wired in `app.json`
  2. Wind-down transition appears in the Dynamic Island at the correct time before bedtime
  3. Sleep start transition updates the Dynamic Island when the sleep window begins
  4. Morning transition shows the recovery score in the Dynamic Island when the user wakes
  5. All three transitions work in a production EAS build (not just simulator)
**Plans**: TBD
**Rationale**: Externally gated on Apple Developer enrollment (D-U-N-S number, ~5 weeks). Stub from Phase 5 is functional for all earlier phases. Pin exact version — Software Mansion introduces breaking changes in minor releases.
**UI hint**: yes

## Progress

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 1. Foundation & Onboarding | v1.0 | 4/4 | Complete | 2026-04-02 |
| 2. Calendar Sync | v1.0 | 4/4 | Complete | 2026-04-02 |
| 3. Sleep Plan Generation | v1.0 | 3/3 | Complete | 2026-04-02 |
| 4. Night Sky Mode & Notifications | v1.0 | 4/4 | Complete | 2026-04-02 |
| 5. Live Activities & Recovery Score | v1.0 | 3/3 | Complete | 2026-04-02 |
| 6. Premium, Settings & Polish | v1.0 | 0/4 (partial, outside GSD) | Gaps to v1.1 | - |
| 7. Critical Bug Fixes | v1.1 | 2/2 | Complete   | 2026-04-07 |
| 8. Adaptive Brain Core | v1.1 | TBD | Not started | - |
| 9. Circadian Protocols | v1.1 | TBD | Not started | - |
| 10. TestFlight Prep | v1.1 | TBD | Not started | - |
| 11. App Store Prep | v1.1 | TBD | Not started | - |
| 12. ActivityKit Integration | v1.1 | TBD | Not started | - |
