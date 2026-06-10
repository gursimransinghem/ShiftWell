# ShiftWell Phase 1 Sprint Plan — Beta Polish

> 3 sprints over 6 weeks. Transforms ShiftWell from "tests pass" to "real humans use it daily."
> Solo founder (Sim), ER physician, ~15-20 hrs/week available for dev work.
> All hour estimates assume AI-assisted development (Claude Code + Cowork).

---

## Resource Assumptions

| Constraint | Value |
|-----------|-------|
| Available dev hours/week | 15-20 (varies with shift schedule) |
| Sprint duration | 2 weeks each |
| Total Phase 1 budget | ~90-100 hours |
| Parallel workstreams | Max 2 (engineering + business/admin tasks) |
| Critical blockers | LLC filing → D-U-N-S (5-week lead time), Apple Developer enrollment |

---

## Sprint 1: Critical Fixes (Weeks 1-2 — Apr 18 – May 2)

### Sprint Goal
Remove every technical blocker preventing a TestFlight build. Secure the API key, implement onboarding, set up CI/CD. By end of Sprint 1, the app installs on a real device via TestFlight.

### Tasks

#### 1.1 API Key Migration — Route Claude API Through Supabase Edge Function
**Priority:** P0 (security — CTO audit finding)
**Est. Hours:** 6
**Spec:** `docs/security/api-key-migration-spec-2026-04-18.md`

**What:**
- Create Supabase Edge Function `generate-brief` (proxy to Anthropic API)
- Create `ai_request_log` table via migration (rate limiting + usage tracking)
- Create shared CORS helper (`supabase/functions/_shared/cors.ts`)
- Update `src/lib/ai/claude-client.ts` to call Edge Function instead of Anthropic directly
- Remove `EXPO_PUBLIC_ANTHROPIC_API_KEY` and `EXPO_PUBLIC_CLAUDE_API_KEY` from `.env`
- Add CI guard: fail build if any `EXPO_PUBLIC_` var references secret patterns
- Standardize both endpoints on `claude-haiku-4-5` (currently inconsistent)
- Smoke test via `curl` with Supabase JWT
- Bundle verification: `grep -r 'sk-ant-'` on built .ipa confirms no key leakage

**Dependencies:** Supabase project access, Anthropic API key
**Risks:** Edge Function cold start latency (~200-500ms added). Mitigation: client already has 15-second timeout + fallback brief.

**Definition of Done:**
- [ ] Edge Function deployed, responding to authenticated requests
- [ ] Rate limiting works (3/hour, 5/day per user)
- [ ] `ai_request_log` table populating with usage data
- [ ] All references to `EXPO_PUBLIC_ANTHROPIC_API_KEY` removed from codebase
- [ ] CI secret guard passing
- [ ] All existing tests pass (`npm test`)
- [ ] Bundle inspection confirms zero API keys in compiled JS

---

#### 1.2 Test Suite Coverage Audit
**Priority:** P0
**Est. Hours:** 3

**What:**
- Run full suite (1,343 tests, 71 suites) — confirm all pass
- Audit coverage gaps in critical paths: onboarding flow, calendar import, plan generation, plan export
- Add missing tests for: Edge Function client (new from 1.1), error/fallback paths, rate limit handling
- Add `maxWorkers: '50%'` to `jest.config.js` (per roadmap item 1.9 — prevents CI memory issues)

**Dependencies:** Task 1.1 complete (new Edge Function client needs tests)

**Definition of Done:**
- [ ] All 1,343+ tests passing
- [ ] New tests added for Edge Function client (auth, rate limit, fallback)
- [ ] `maxWorkers: '50%'` configured
- [ ] Coverage report generated — no critical path below 70%

---

#### 1.3 Onboarding Flow Implementation (6 Screens)
**Priority:** P0 (activation gate — without this, users bounce)
**Est. Hours:** 14
**Spec:** `launch-kit/onboarding-flow-spec.md`

**What:**
Implement the complete 6-screen onboarding flow, consolidated from the current 8-screen flow:

| Screen | Purpose | Data Collected | Time Target |
|--------|---------|---------------|-------------|
| 1. Welcome | Emotional hook, trust signal | None | 3 sec |
| 2. Chronotype | Most impactful algorithm input | `chronotype` (early/intermediate/late) | 5 sec |
| 3. Sleep Need & Naps | Duration target + nap willingness | `sleepNeed`, `napPreference` | 8 sec |
| 4. Household & Routine | Environmental constraints (consolidated from 4 old screens) | `hasYoungChildren`, `hasPets`, `commuteDuration` | 5 sec |
| 5. Add Shifts | Calendar import OR manual entry OR demo mode | `ShiftEvent[]` array | 15-60 sec |
| 6. Plan Ready | First value moment + push notification ask | Notification permission | 10 sec |

**Implementation details:**
- Update `src/constants/onboarding.ts`: `ONBOARDING_TOTAL_STEPS = 6`, new step enum
- Build 6 screen components with progress bar, back/skip navigation
- Screen 5: calendar import path (triggers iOS permission in context), manual entry path, demo data path (`demoMode: true` flag + persistent banner)
- Screen 6: run algorithm on collected data, display first plan, contextual push notification request
- Skip logic: Screen 1 "I already know what I'm doing" → jump to shift entry with all defaults
- Fast-track detection: if screens 2-4 completed in <20 seconds, skip celebration on Screen 6
- Instrument analytics events per spec: `onboarding_screen_viewed`, `onboarding_screen_completed`, `onboarding_screen_skipped`, `shift_import_method`, `notification_permission_response`
- Defer AM/PM routines, addresses, HealthKit to post-onboarding (per spec — biggest dropout screens)

**Dependencies:** Algorithm must generate plans from collected inputs (already working). Calendar import existing functionality.
**Risks:** Calendar import reliability across iOS versions. Mitigation: demo mode fallback is always available. Manual entry as second path.

**Definition of Done:**
- [ ] All 6 screens implemented with correct data collection
- [ ] Progress bar visible and accurate
- [ ] Skip/back navigation works on every screen
- [ ] Default values applied correctly when screens are skipped
- [ ] Demo mode loads sample night rotation with persistent banner
- [ ] Algorithm generates plan from onboarding data on Screen 6
- [ ] Push notification permission requested in context on Screen 6
- [ ] Analytics events firing for all screen transitions
- [ ] Total flow completable in ≤90 seconds (target metric)
- [ ] Tests added for onboarding state machine and data collection

---

#### 1.4 CI/CD Pipeline Setup (GitHub Actions)
**Priority:** P1
**Est. Hours:** 5

**What:**
- Create `.github/workflows/ci.yml`: TypeScript check (`tsc`) → Jest (`npm test`) → `expo-doctor`
- Add secret guard workflow (`.github/workflows/secret-guard.yml` — per API migration spec)
- Configure to run on push and PR to `main`
- Ensure CI passes before any merge

**Dependencies:** GitHub repo access
**Risks:** CI environment differences (Node version, Expo CLI). Mitigation: pin Node version in workflow, use `npx expo` instead of global install.

**Definition of Done:**
- [ ] CI runs on every push/PR
- [ ] Pipeline: `tsc` → `jest` → `expo-doctor` → secret guard
- [ ] All steps green on current codebase
- [ ] Branch protection enabled on `main` (require CI pass)

---

#### 1.5 App Icon Replacement
**Priority:** P1 (blocks TestFlight — placeholder icon signals "unfinished")
**Est. Hours:** 4

**What:**
- Commission or AI-generate production app icon per design brief
- Generate all required sizes for iOS (1024x1024 App Store, plus @1x/@2x/@3x variants)
- Update `app.json` icon configuration
- Verify icon renders correctly on home screen, Settings, and App Store Connect

**Dependencies:** Design brief finalized
**Risks:** Design iteration time if using a designer (1-3 day turnaround). Mitigation: AI-generated icon as interim, replace later if needed.

**Definition of Done:**
- [ ] Production icon in all required sizes
- [ ] `app.json` updated
- [ ] Icon visible and sharp on iOS simulator and device

---

#### 1.6 Admin & Business Tasks (Parallel Track)
**Priority:** P0 (critical path — blocks App Store long-term)
**Est. Hours:** 2.5

| Task | Hours | Notes |
|------|-------|-------|
| File ShiftWell LLC (Florida) | 0.5 | **[CRITICAL PATH]** — starts D-U-N-S clock |
| Apply for D-U-N-S number | 0.5 | **[CRITICAL PATH]** — ~5 weeks to receive |
| Enroll Apple Developer (Individual, $99) | 0.25 | Enables TestFlight internal distribution |
| Set up Google OAuth client ID in `app.json` | 0.25 | Required for Google Calendar sync |
| Run `npm audit fix` (node-forge + picomatch) | 0.25 | Clear known vulnerabilities |
| Set up shiftwell.app domain + email | 0.75 | sim@shiftwell.app, support@shiftwell.app, beta@shiftwell.app |

**Dependencies:** Company name decision (for LLC). Google Cloud Console access (for OAuth).

**Definition of Done:**
- [ ] LLC filing submitted
- [ ] D-U-N-S application submitted (receipt saved)
- [ ] Apple Developer Individual account active
- [ ] Google OAuth client ID configured
- [ ] `npm audit` clean (0 high/critical vulnerabilities)
- [ ] Domain purchased, email aliases active

---

#### 1.7 First TestFlight Build
**Priority:** P0 (Sprint 1 exit gate)
**Est. Hours:** 2

**What:**
- Run `eas build --platform ios` for TestFlight
- Upload to App Store Connect
- Distribute to internal TestFlight group (Sim + Jess + 3-4 dev friends)
- Verify: app installs, launches, completes onboarding, generates plan

**Dependencies:** Tasks 1.1 (API key secured), 1.3 (onboarding), 1.5 (icon), 1.6 (Apple Developer enrollment)

**Definition of Done:**
- [ ] TestFlight build installs and runs on physical device
- [ ] Onboarding flow completes end-to-end
- [ ] Algorithm generates a sleep plan
- [ ] No crash on launch or during core flow
- [ ] API key NOT present in bundle (verified)

---

### Sprint 1 Summary

| Task | Hours | Priority | Dependency |
|------|-------|----------|------------|
| 1.1 API Key Migration | 6 | P0 | None |
| 1.2 Test Suite Audit | 3 | P0 | 1.1 |
| 1.3 Onboarding (6 screens) | 14 | P0 | None |
| 1.4 CI/CD Setup | 5 | P1 | None |
| 1.5 App Icon | 4 | P1 | Design brief |
| 1.6 Admin/Business Tasks | 2.5 | P0 | Company name |
| 1.7 TestFlight Build | 2 | P0 | 1.1, 1.3, 1.5, 1.6 |
| **Sprint 1 Total** | **36.5** | | |

**Capacity check:** 36.5 hours / 2 weeks = 18.25 hrs/week. Tight but achievable if shifts cooperate. If not, push 1.4 (CI/CD) to Sprint 2 start — it's important but won't block TestFlight.

**Sprint 1 Exit Criteria (Decision Gate):**
- [ ] LLC filed and D-U-N-S application submitted?
- [ ] TestFlight build installs and runs on device?
- [ ] Icon replaced, API key secured?
- [ ] Onboarding completes in ≤90 seconds?
- [ ] All tests passing?
- **GO/NO-GO for Phase 0 beta (internal testing)**

---

## Sprint 2: Beta Readiness (Weeks 3-4 — May 3 – May 16)

### Sprint Goal
Ship the infrastructure needed to run an effective beta: crash monitoring, user feedback collection, analytics, and survey deployment. Begin Phase 0 internal testing (5 people) and Phase 1 F&F testing (15 EM colleagues).

### Tasks

#### 2.1 Sentry Error Monitoring Setup
**Priority:** P0 (can't run beta without crash visibility)
**Est. Hours:** 3

**What:**
- Install `@sentry/react-native` SDK
- Configure Sentry project for ShiftWell (iOS)
- Add Sentry initialization to app entry point with environment tags (beta/production)
- Configure source map uploads in EAS build pipeline
- Set up alert rules: notify on first occurrence of new error, notify if crash rate >0.5%
- Test: trigger a test error, verify it appears in Sentry dashboard with full stack trace

**Dependencies:** Sentry account (free tier sufficient for beta)

**Definition of Done:**
- [ ] Sentry SDK integrated, reporting crashes with source maps
- [ ] Alert rules configured (email to sim@shiftwell.app)
- [ ] Test crash visible in dashboard with readable stack trace
- [ ] No performance impact >50ms on app startup

---

#### 2.2 Shake-to-Report Feedback Mechanism
**Priority:** P0 (primary beta feedback channel)
**Est. Hours:** 10
**Spec:** `launch-kit/F-beta-program/feedback-mechanism.md`

**What:**
- Install `react-native-shake` dependency
- Create Supabase `beta_feedback` table (bug/feature/general categories, severity for bugs, device context, optional screenshot)
- Create Supabase Storage bucket `beta-feedback-screenshots`
- Build `FeedbackModal.tsx`: category picker, severity selector (bugs only), description input, optional screenshot
- Build `feedbackService.ts`: Supabase insert + screenshot upload + device context collection
- Build `useFeedback.ts` hook: shake listener + modal state
- Build `deviceContext.ts`: app version, device model, OS version, current screen name
- Create Edge Function `notify-feedback`: sends email to beta@shiftwell.app via Resend on every new feedback row
- Add "Send Feedback" button to Settings screen
- Wrap AppContainer with shake listener
- Sign up for Resend (free tier — 100 emails/day, plenty for beta)
- Write 6 unit tests per spec

**Dependencies:** Domain email (beta@shiftwell.app from Sprint 1), Supabase project, Resend API key

**Definition of Done:**
- [ ] Shake device → feedback modal opens
- [ ] Settings → "Send Feedback" → same modal
- [ ] Bug reports require severity; feature requests don't
- [ ] Device context auto-collected (version, model, OS, screen)
- [ ] Screenshot upload works to Supabase Storage
- [ ] Email notification arrives at beta@shiftwell.app within 10 seconds
- [ ] Feedback rows visible in Supabase `beta_feedback` table
- [ ] 6 unit tests passing
- [ ] Privacy: anonymous user hash (SHA256 of device ID), no PII stored

---

#### 2.3 Analytics/Telemetry Instrumentation
**Priority:** P1
**Est. Hours:** 6

**What:**
- Evaluate and integrate PostHog (recommended — open source, generous free tier, React Native SDK) or Amplitude
- Instrument core events:
  - Onboarding funnel: each screen viewed/completed/skipped + time-on-screen
  - `shift_import_method` (calendar/manual/demo)
  - `notification_permission_response` (granted/denied/deferred)
  - `plan_generated` (with shift type, chronotype)
  - `plan_exported` (to calendar)
  - `sleep_logged` (manual entry)
  - `app_opened` (session start, with day count since install)
  - `weekly_brief_viewed`
  - `premium_trial_started`, `premium_converted`, `premium_churned`
- Set up user properties: chronotype, shift type, nap preference, install date, beta phase
- Create dashboard: onboarding funnel, DAU, retention (D1/D3/D7), feature adoption

**Dependencies:** None (can run parallel with 2.1 and 2.2)

**Definition of Done:**
- [ ] Analytics SDK integrated, events firing in dev
- [ ] All core events instrumented per list above
- [ ] Dashboard showing onboarding funnel and DAU
- [ ] No measurable impact on app startup time
- [ ] Events verified in analytics dashboard from simulator testing

---

#### 2.4 Survey Deployment (Day 1 + Week 1)
**Priority:** P1
**Est. Hours:** 3
**Spec:** `launch-kit/F-beta-program/surveys.md`

**What:**
- Create Day 1 survey (Typeform or similar — 4 questions, 2-minute target):
  1. Any crashes? (yes/no)
  2. Did you complete your sleep plan? (yes/no)
  3. One word: how confusing was the chronotype quiz? (very/somewhat/not at all)
  4. Would you recommend to a coworker? (yes/maybe/no)
- Create Week 1 survey (5 questions, 3-minute target):
  1. Which feature most helpful? (plan/calendar/nap/tracking/light)
  2. Have you exported to calendar? Why/why not?
  3. Any confusion on what to do next?
  4. Rate plan accuracy for your shifts (1-5)
  5. Open: what's the #1 improvement?
- Configure delivery: in-app prompt + email at correct timing
- Set up response collection in a format Sim can quickly scan

**Dependencies:** Email aliases active (Sprint 1)

**Definition of Done:**
- [ ] Day 1 survey live, accessible via link
- [ ] Week 1 survey live, accessible via link
- [ ] Delivery mechanism configured (in-app prompt + email)
- [ ] Sim can view aggregated responses

---

#### 2.5 Phase 0 Internal Testing Launch
**Priority:** P0
**Est. Hours:** 3

**What:**
- Distribute TestFlight build to Phase 0 group (Sim + Jess + 3-4 dev friends, 5-10 total)
- Set up communication channel (#internal-testflight Slack or group text)
- Run through full flow yourself 5+ times daily; log crashes with timestamps
- Schedule 15-min debrief calls with each tester
- Build cadence: 2-3 builds/week (Mon, Wed, Fri) during Phase 0

**Phase 0 success criteria (must hit before Phase 1 launch):**
- 0 P0/P1 crashes across all testers
- Onboarding completion >90%
- Time to plan <5 minutes
- Calendar sync success >95%

**Dependencies:** TestFlight build (Sprint 1), Sentry (2.1)

**Definition of Done:**
- [ ] 5+ testers on TestFlight
- [ ] Communication channel active
- [ ] All Phase 0 success criteria met
- [ ] Bug backlog created from internal feedback

---

#### 2.6 Phase 1 Friends & Family Launch
**Priority:** P1 (starts late Week 4, runs into Sprint 3)
**Est. Hours:** 4

**What:**
- Recruit 10-15 EM colleagues from HCA Florida Trinity Hospital
- Send personal SMS/group text with TestFlight link (template in testflight-plan.md)
- Set up Phase 1 TestFlight group in App Store Connect
- Deploy Day 1 survey to F&F cohort
- Switch to weekly build cadence (Monday AM)
- Hotfix SLA: 48h for blocking issues

**Phase 1 success criteria:**
- >80% run algorithm at least once
- >50% complete at least one nap recommendation
- NPS >40
- 0 blocking crashes

**Dependencies:** Phase 0 passes all criteria (2.5)

**Definition of Done:**
- [ ] 10-15 F&F testers on TestFlight
- [ ] Day 1 survey sent to cohort
- [ ] Weekly build cadence established
- [ ] Feedback flowing through shake-to-report or Slack

---

### Sprint 2 Summary

| Task | Hours | Priority | Dependency |
|------|-------|----------|------------|
| 2.1 Sentry Setup | 3 | P0 | None |
| 2.2 Feedback Mechanism | 10 | P0 | Domain email |
| 2.3 Analytics Instrumentation | 6 | P1 | None |
| 2.4 Survey Deployment | 3 | P1 | Email aliases |
| 2.5 Phase 0 Internal Testing | 3 | P0 | TestFlight build |
| 2.6 Phase 1 F&F Launch | 4 | P1 | Phase 0 passes |
| **Sprint 2 Total** | **29** | | |

**Capacity check:** 29 hours / 2 weeks = 14.5 hrs/week. Comfortable. Buffer for Phase 0 bug fixes (~5-8 hours likely).

**Sprint 2 Exit Criteria:**
- [ ] Sentry reporting crashes with source maps?
- [ ] Feedback mechanism working (shake + settings button)?
- [ ] Analytics dashboard showing onboarding funnel?
- [ ] Phase 0 passed all criteria (0 crashes, >90% onboarding)?
- [ ] Phase 1 F&F testers onboarded?
- **GO/NO-GO for Sprint 3 (polish + wider beta)**

---

## Sprint 3: Polish + Soft Launch (Weeks 5-6 — May 17 – May 30)

### Sprint Goal
Fix top friction points from F&F feedback. Polish the UI. Optimize performance. Begin recruiting the 50-person healthcare cohort. By end of Sprint 3, the app is stable enough for strangers to use unsupervised.

### Tasks

#### 3.1 Top Bug Fix Sprint (F&F Feedback)
**Priority:** P0
**Est. Hours:** 10

**What:**
- Triage all feedback from Phase 0 + Phase 1 (Sentry crashes, shake-to-report bugs, survey responses)
- Fix top 5 bugs by severity and frequency
- Likely areas based on spec review:
  - Calendar import edge cases (different calendar formats, timezone handling)
  - Shift schedule entry validation (24h on-call, continental rotations, split shifts)
  - Sleep plan generation edge cases (very short sleep windows, back-to-back shifts)
  - Push notification timing mismatches
  - Dark mode rendering inconsistencies
- Run full test suite after each fix

**Dependencies:** Feedback data from Sprint 2 beta phases

**Definition of Done:**
- [ ] Top 5 bugs resolved and verified
- [ ] Crash rate <0.5% across all testers
- [ ] All 1,343+ tests passing
- [ ] No regression in onboarding completion rate

---

#### 3.2 Design System Cleanup
**Priority:** P1
**Est. Hours:** 6

**What:**
- Audit dark-mode-first UI for consistency (colors, spacing, typography, component styles)
- Standardize component library: buttons, cards, inputs, modals, navigation elements
- Fix any rendering inconsistencies surfaced during beta (different iPhone sizes, Dynamic Type)
- Ensure all screens meet WCAG AA contrast ratios (especially important for night-shift users in dark environments)
- Verify app icon, splash screen, and all branding elements are production-quality

**Dependencies:** Beta feedback on UI issues

**Definition of Done:**
- [ ] Consistent color palette across all screens
- [ ] Typography scale standardized (heading, body, caption sizes)
- [ ] All interactive elements have proper tap targets (≥44pt)
- [ ] Dark mode renders correctly on all tested devices
- [ ] No visual regressions from Sprint 1-2 changes

---

#### 3.3 Performance Optimization Pass
**Priority:** P1
**Est. Hours:** 5

**What:**
- Profile app startup time (target: <2 seconds to interactive on iPhone 13)
- Identify and fix unnecessary re-renders (React DevTools profiler)
- Optimize heavy screens: plan view (if rendering many calendar blocks), sleep log history
- Check bundle size — remove unused dependencies, verify tree shaking
- Verify Supabase queries are indexed and efficient (especially `ai_request_log` and `beta_feedback`)
- Test offline behavior: app should degrade gracefully without network (cached plan, fallback brief)
- Battery impact assessment: target <3% per day during normal usage

**Dependencies:** Analytics data showing session lengths and screen performance

**Definition of Done:**
- [ ] App startup <2 seconds (cold start, iPhone 13+)
- [ ] No screen transitions >300ms
- [ ] Bundle size documented and reasonable (<50MB)
- [ ] Offline mode: cached plan displays, no crash
- [ ] Battery impact verified <3%/day in normal usage

---

#### 3.4 Week 1 Survey Analysis + Iteration
**Priority:** P1
**Est. Hours:** 3

**What:**
- Compile Week 1 survey results from F&F cohort
- Identify: plan accuracy rating distribution, calendar export adoption, top requested feature
- Cross-reference with analytics: onboarding funnel drop-off, feature adoption rates
- Create triage doc: ship (Sprint 3), hold (Phase 2), won't-fix
- Implement 1-2 quick wins from feedback if time allows

**Dependencies:** Week 1 survey responses (collected end of Week 4)

**Definition of Done:**
- [ ] Survey results compiled and summarized
- [ ] Triage doc created with ship/hold/won't-fix categories
- [ ] 1-2 quick wins implemented
- [ ] Findings shared with any advisors/stakeholders

---

#### 3.5 Healthcare Cohort Recruitment Prep (Phase 2 Beta)
**Priority:** P1
**Est. Hours:** 5

**What:**
- Prepare recruitment posts for target channels:
  - Reddit: r/nursing (525k), r/nightshift (145k), r/StudentNurse (75k), r/ems, r/emergencymedicine
  - Facebook: Night Shift Nurses (~18k), Night Shift Workers Support (~12k)
  - Medical school alumni email lists
  - Medical Twitter/X (#MedTwitter, #ResidencyTwitter)
- Finalize recruitment messaging (templates in testflight-plan.md — review and customize)
- Set up Phase 2 TestFlight group in App Store Connect (capacity: 50)
- Prepare Slack workspace with channels: #general, #bugs, #feature-ideas, #phase2-healthcare
- Draft weekly email update template for beta communication
- Target: 50 healthcare workers recruited, diverse shift patterns (12h, 8h, 24h, rotating, on-call)

**Dependencies:** Phase 1 passing success criteria (NPS >40, 0 blocking crashes)

**Definition of Done:**
- [ ] Recruitment posts drafted and reviewed
- [ ] TestFlight Phase 2 group configured in App Store Connect
- [ ] Slack workspace ready with channels
- [ ] Email template drafted
- [ ] Recruitment ready to launch Week 7 (start of master roadmap Phase 2)

---

#### 3.6 Weekly Build Cadence + Release Process
**Priority:** P2
**Est. Hours:** 2

**What:**
- Formalize Monday AM build cadence:
  1. Monday 9 AM ET: EAS build submitted to TestFlight
  2. Monday 2 PM ET: available for Phase 0 (internal validation)
  3. Tuesday 9 AM ET: promoted to Phase 1 (after Phase 0 sign-off)
- Create release notes template (per testflight-plan.md)
- Document hotfix protocol: P0/P1 → 24h fix, P2/P3 → next weekly build
- Version management: 0.2.x (Phase 0), 0.3.x (Phase 1), 0.4.x (Phase 2)

**Dependencies:** CI/CD pipeline (Sprint 1, task 1.4)

**Definition of Done:**
- [ ] Build cadence documented and followed for 2+ consecutive weeks
- [ ] Release notes template in use
- [ ] Hotfix protocol documented
- [ ] Version numbering consistent

---

### Sprint 3 Summary

| Task | Hours | Priority | Dependency |
|------|-------|----------|------------|
| 3.1 Top Bug Fix Sprint | 10 | P0 | Beta feedback |
| 3.2 Design System Cleanup | 6 | P1 | Beta feedback |
| 3.3 Performance Optimization | 5 | P1 | Analytics data |
| 3.4 Survey Analysis + Iteration | 3 | P1 | Week 1 responses |
| 3.5 Healthcare Cohort Recruitment Prep | 5 | P1 | Phase 1 success |
| 3.6 Build Cadence + Release Process | 2 | P2 | CI/CD |
| **Sprint 3 Total** | **31** | | |

**Capacity check:** 31 hours / 2 weeks = 15.5 hrs/week. Comfortable with buffer for unexpected bug fixes.

**Sprint 3 Exit Criteria:**
- [ ] Crash rate <0.5% across all beta testers?
- [ ] Phase 1 NPS >40?
- [ ] Onboarding completion >80%?
- [ ] D7 retention >70% for F&F cohort?
- [ ] Top 5 bugs resolved?
- [ ] Healthcare cohort recruitment ready to launch?
- **GO/NO-GO for Phase 2 healthcare beta (50 testers)**

---

## Phase 1 Totals

| Sprint | Hours | Weeks | Hrs/Week |
|--------|-------|-------|----------|
| Sprint 1: Critical Fixes | 36.5 | 2 | 18.25 |
| Sprint 2: Beta Readiness | 29 | 2 | 14.5 |
| Sprint 3: Polish + Soft Launch | 31 | 2 | 15.5 |
| **Phase 1 Total** | **96.5** | **6** | **16.1 avg** |

**Budget vs. capacity:** 96.5 hours over 6 weeks at 15-20 hrs/week = 90-120 available hours. Fits within range, with Sprint 1 being the tightest week. If shifts stack unfavorably during Sprint 1, push CI/CD (task 1.4, 5 hrs) to Sprint 2 start.

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Shift schedule limits dev time below 15 hrs/week** | Medium | High | Sprint 1 has identified deferral candidate (1.4 CI/CD). Sprint 2-3 have built-in buffer. |
| **Supabase Edge Function cold starts degrade UX** | Low | Medium | 15-second timeout + fallback brief already implemented. Monitor latency via `ai_request_log`. |
| **Onboarding flow takes longer than 14 hours** | Medium | Medium | Spec is detailed — reduces ambiguity. Calendar import reuses existing code. Defer fast-track detection if needed. |
| **D-U-N-S number delayed beyond 5 weeks** | Low | High | Doesn't block TestFlight internal/F&F beta (Individual account sufficient). Only blocks App Store submission (Phase 3). |
| **F&F cohort too small or unresponsive** | Low | Medium | Sim has direct relationships at HCA Trinity. Backup: expand to med school alumni earlier. |
| **Critical crash discovered in Phase 0** | Medium | Medium | Expected — that's why Phase 0 exists. 24h hotfix SLA. 2-3 builds/week during Phase 0. |
| **Calendar import fails for common calendar formats** | Medium | High | Demo mode always available as fallback. Manual entry as second path. Prioritize Google Calendar (most common). |

---

## Dependency Graph

```
Week 1-2 (Sprint 1):
  ┌─ 1.1 API Key Migration ──────────┐
  │                                    │
  ├─ 1.3 Onboarding (6 screens) ──────┼──→ 1.7 TestFlight Build
  │                                    │
  ├─ 1.5 App Icon ────────────────────┘
  │
  ├─ 1.6 Admin (LLC, D-U-N-S, Apple Dev) ──→ 1.7 TestFlight Build
  │
  ├─ 1.4 CI/CD Setup (parallel, no blockers)
  │
  └─ 1.2 Test Suite Audit (after 1.1)

Week 3-4 (Sprint 2):
  ┌─ 2.1 Sentry ──────────────────────┐
  │                                    │
  ├─ 2.2 Feedback Mechanism ───────────┼──→ 2.5 Phase 0 Launch ──→ 2.6 Phase 1 Launch
  │                                    │
  ├─ 2.3 Analytics (parallel) ─────────┘
  │
  └─ 2.4 Surveys (parallel)

Week 5-6 (Sprint 3):
  ┌─ 3.1 Bug Fix Sprint (from beta feedback)
  │
  ├─ 3.2 Design Cleanup (from beta feedback)
  │
  ├─ 3.3 Performance Optimization
  │
  ├─ 3.4 Survey Analysis
  │
  └─ 3.5 Healthcare Recruitment Prep ──→ Phase 2 Launch (Week 7+)
```

---

## What Happens After Phase 1

Phase 1 exits into the master roadmap's Phase 2 (Beta, Weeks 7-14):
- **Week 7-9:** Phase 2 healthcare cohort (50 testers) — 3 weeks of testing
- **Week 9-10:** Phase 3 public beta (200 testers) — 2 weeks
- **Week 10:** D-U-N-S should arrive → Apple Org enrollment → app transfer
- **Week 11:** 8-week retrospective + go/no-go for App Store submission

Kill criteria and success thresholds for the beta program are defined in `MASTER-ROADMAP-2026-04-18.md` and `launch-kit/F-beta-program/testflight-plan.md`.

---

## Key Reference Documents

| Document | Path | Used For |
|----------|------|----------|
| Master Roadmap | `MASTER-ROADMAP-2026-04-18.md` | Phase structure, deliverables, decision gates |
| API Key Migration Spec | `docs/security/api-key-migration-spec-2026-04-18.md` | Sprint 1 task 1.1 implementation details |
| Onboarding Flow Spec | `launch-kit/onboarding-flow-spec.md` | Sprint 1 task 1.3 screen-by-screen requirements |
| TestFlight Beta Plan | `launch-kit/F-beta-program/testflight-plan.md` | Sprint 2-3 beta phases, recruitment messaging |
| Beta Weekly Plan | `launch-kit/F-beta-program/weekly-plan.md` | Sprint 2-3 week-by-week operations |
| Feedback Mechanism Spec | `launch-kit/F-beta-program/feedback-mechanism.md` | Sprint 2 task 2.2 implementation details |
| Beta Surveys | `launch-kit/F-beta-program/surveys.md` | Sprint 2 task 2.4 survey content |
| Beta Success Metrics | `launch-kit/F-beta-program/success-metrics.md` | Exit criteria for each phase |

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial creation. Sprint plan derived from master roadmap (5-phase, 12-month) and 7 supporting spec documents. Hour estimates calibrated for solo founder with AI-assisted development. All task dependencies verified against spec prerequisites.
