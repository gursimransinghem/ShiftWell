# Active Tasks

> Last Reviewed: 2026-04-20 · Last Edited: 2026-04-20
> Milestone: v1.1 code-complete (19/19 reqs ✓), external gates pending. Pre-TestFlight.

## Quick links
- [v1.1 Milestone Audit](../.planning/v1.1-MILESTONE-AUDIT.md) — 19/19 code reqs, 5 external blockers
- [v1.1 UAT Audit](../.planning/v1.1-UAT-AUDIT.md) — 29 UAT items (12 simulator / 10 device / 7 external-blocked)
- [QA Report 2026-04-18](../QA-REPORT-2026-04-18.md) — 1,059 tests ✓, 6 npm vulns to fix
- [CTO Audit 2026-04-18](../CTO-AUDIT-2026-04-18.md) — 2 CRITICAL + 4 HIGH blockers (all resolved)
- [COO Assessment 2026-04-18](../COO-ASSESSMENT-2026-04-18.md) — CEO Loop review
- [Scientific Audit 2026-04-18](../docs/research/SCIENTIFIC-AUDIT-REPORT-2026-04-18.md) — algorithm B+ grade
- [Design Audit 2026-04-18](../docs/design/DESIGN-AUDIT-AND-REVAMP-2026-04-18.md) — 3-tier dashboard (P0), 11px min text (P0)
- [Lumi Visual Reference 2026-04-20](../docs/design/references/LUMI-REFERENCE-2026-04-20.md) — structural reference for premium-tier revamp

---

## P0 — Premium-tier revamp (ACTIVE)

Plan: `~/.claude/plans/show-me-the-artifacts-replicated-badger.md`
Tagline locked: `Work. Life. Sleep. Rebalanced.` [fulcrum divider] `ShiftWell`

### P0.1 · Brand foundation
- [ ] `docs/design/BRAND-PRINCIPLES.md` — 7 anti-scam rules (no urgency, no fake testimonials, citations visible, one-click cancel, physician credibility, transparent algorithm, mission-first)
- [ ] Tagline lockup SVG with fulcrum-divider treatment — used on website, App Store, Welcome screen, social avatars
- [ ] Logo tournament — 5 parallel design lanes (Fulcrum / Bioluminescent curve / Astronomical / Möbius / Geometric wordmark). Output: `assets/brand/BRAND-TOURNAMENT-2026-04-20.md` + SVG variants for user pick
- [ ] Winner refinement → `assets/images/icon.png` (1024²), `splash-icon.png`, `website/logo-mark.svg`, `favicon.png`, `og-image.png`

### P0.2 · Website revamp (`website/index.html`)
- [ ] Hero: "Stop guessing when to sleep." + 3 cited stats (1-in-3 SWSD / 23% sentinel events / $136.4B fatigue cost)
- [ ] Problem framing section — Manifesto-derived copy, three columns
- [ ] Physician credibility section — "Built by an ED physician who works nights"
- [ ] Fix "halluccinates" typo
- [ ] DELETE placeholder testimonials (anti-scam rule), replace with waitlist panel
- [ ] De-urgency pricing: one-click cancel callout, no countdowns
- [ ] Create `privacy.html` + `disclaimers.html`
- [ ] Generate `og-image.png` from logo + tagline
- [ ] Verify via Tailscale on iPhone (not localhost)
- [ ] Lighthouse >90 on all 4 axes

### P0.3 · App Store listing + 6 screenshots
- [ ] Sharpen `docs/launch/APP_STORE_LISTING.md` hero description
- [ ] Capture 6 screenshots @ 1290×2796 from iOS simulator with real seed data
- [ ] Overlay text per plan table (Today hero / Schedule / Science / Adaptive / Calendar export / Physician quote)

### P0.4 · First-run app experience
- [ ] `app.json` splash bg fix: `#0A0E1A` → `#080B14`
- [ ] `src/theme/themes.ts` — 4 themes (Midnight / Twilight / Sunrise / Aurora)
- [ ] `src/theme/ThemeProvider.tsx` + AsyncStorage persistence
- [ ] `src/components/settings/ThemeSheet.tsx` — 4-option picker with live preview
- [ ] Profile tab: Theme row
- [ ] Fast-path onboarding: `app/(onboarding)/fast/` — 3 screens (welcome / shifts / plan)
- [ ] Feature flag `fast_onboarding` via `src/lib/premium/feature-gate.ts`
- [ ] `<DeferredOnboardingNudge>` — Today screen prompts for deferred collection
- [ ] Today 3-tier refactor: Tier 1 (glanceable) / Tier 2 (plan) / Tier 3 (insights accordion)
- [ ] `src/theme/typography.ts`: 9px → 11px (WCAG fix)
- [ ] Paywall outcome reframe + "Cancel anytime in one tap" copy
- [ ] `app/_dev/jumper.tsx` + `DevJumperButton.tsx` — `__DEV__`-gated screen jumper

### P0 carryover from 2026-04-06
- [ ] Revert `app/index.tsx` onboarding bypass before production
- [ ] Verify `AdaptiveInsightCard` renders with seeded Day→Night transition 3 days out

---

## P1 — Quality + Device QA

- [ ] Fix 6 npm vulnerabilities (QA-REPORT §5)
- [ ] Wire `LightProtocolStrip` into Today screen transition-day states
- [ ] GradientMeshBackground 3-orb animation — verify on live device
- [ ] Wind-down state — time-dependent, test ~9pm
- [ ] Real HealthKit data flow — `getSleepHistory()`, `computeRecoveryScore()` with Apple Watch data
- [ ] Score store wiring — HealthKit → real adherence scores
- [ ] SET-03: DND/Sleep Focus mode — entitlements + live device

---

## P2 — External blockers

- [ ] LLC filing — decide: Circadian Labs vs Vigil Health
- [ ] Apple Developer enrollment (requires LLC + D-U-N-S)
- [ ] D-U-N-S number (~5 business days after LLC)
- [ ] Final App Store copy review after listing sharpen

---

## P3 — Post-launch backlog

### Adaptive Brain v2
- [ ] HealthKit HRV RMSSD authorization (`heartRateVariabilitySDNN`)
- [ ] Integrate HRV into recovery formula (currently sleep-stage only)
- [ ] Shift-type baseline separation (post-night vs post-day HRV/RHR baselines)
- [ ] Research pipeline cron — periodic agent → new studies → `docs/research/`
- [ ] 30-day learning phase completion UI

### Design polish (post-beta)
- [ ] Light mode (partial: Sunrise theme in P0.4 covers ambient; full theme audit after beta)
- [ ] Icon consolidation — Lucide or Phosphor, drop hybrid Ionicons+emoji
- [ ] 3-post cinematic social carousel via Claude Design (Tier-1 launch)
- [ ] App Store preview video via Claude Design (15s Today state transitions)

### v2.0 North Star
- [ ] Single-viewport integrated dashboard — see `docs/design/references/LUMI-DASHBOARD-2026-04-20.md`. Post-v1.1 milestone.

---

## ✓ Done since last edit (2026-04-06 → 2026-04-20)

### PRs merged
- PR #2: Supabase migrations 002–006 — RLS, audit logs, perf indexes
- PR #3: Themed UI components — 0 hardcoded hex
- PR #4: Sentry error tracking + crash reporting
- PR #5: Claude API key migration to Supabase Edge Function (security)
- PR #6: PostHog analytics instrumentation
- PR #7: Onboarding flow v2 (12 screens — doc discrepancy flagged, plan C4.2 compresses to 3 fast-path)

### 2026-04-18 audit round
- QA: 1,059 tests passing, TypeScript clean, Expo doctor 16/17, 8 blocking issues fixed
- CTO: architecture audit, 2 CRITICAL + 4 HIGH resolved
- COO: CEO Loop review — recommends 1×/day cadence (down from 4×)
- Science: circadian algorithm B+ grade, 7 gaps flagged
- Design: V6 audit, 3-tier dashboard + 11px min text + 3-step fast path recommended
- v1.1 milestone: 19/19 code reqs satisfied ✓

### 2026-04-20 (this session)
- 5 atomic commits shipped (config + audits + validation + design+launch + website)
- Sibling `shiftwell-dashboard/` gitignored, noted in CLAUDE.md
- `.planning/scratch/` created for scratch HTML preservation
- Lumi visual reference (30-screenshot deck) distilled to `docs/design/references/LUMI-REFERENCE-2026-04-20.md`
- `tasks/todo.md` rewritten (this file)

### From 2026-04-06 session (Adaptive Brain phase)
- [x] Adaptive Brain complete — 354 tests passing
- [x] V6 UI visual QA — Hero Score ring, Countdown Row, FAB, Timeline cards
- [x] Sleep debt engine (14-night ledger, Belenky tiers)
- [x] Circadian protocol engine (5 transition types)
- [x] Recovery calculator (Apple Watch composite, −43min correction)
- [x] Context builder + change logger
- [x] AdaptiveInsightCard, LightProtocolArc, SleepDebtCard dual meter
- [x] Pre-Shift Brief tab (brief.tsx, 5-part coaching)
- [x] Research pipeline (docs/research/ + PostToolUse auto-file hook)
- [x] Paywall + Welcome Marketing — "3%" stat, "Eat with your clock" card, THE RESEARCH section
- [x] Phase 6 Features 1-6 — SleepDebtCard, NapCalculatorModal, ScienceInsightCard, on-shift polish, ScoreBreakdownCard, PatternAlertCard
