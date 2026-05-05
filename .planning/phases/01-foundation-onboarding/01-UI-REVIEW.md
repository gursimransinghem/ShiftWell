# Phase 01 — UI Review

**Audited:** 2026-05-05
**Baseline:** Abstract 6-pillar standards (no UI-SPEC.md for this phase)
**Screenshots:** Not captured — React Native app; code-only audit

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Strong headlines and microcopy; "Continue" / "Next" CTAs are generic on most screens |
| 2. Visuals | 2/4 | Star field and stagger animations are premium; 7 orphan screen files not wired to the live layout |
| 3. Color | 2/4 | Token system is solid; dual-accent (gold + purple) with no declared hierarchy; 11 hardcoded hex regressions |
| 4. Typography | 2/4 | TYPOGRAPHY token set defined; 12+ ad-hoc `fontSize` values bypass the scale in active screens |
| 5. Spacing | 3/4 | 4-pt SPACING tokens used consistently; 6 minor non-token pixel values in micro-adjustments |
| 6. Experience Design | 2/4 | Back nav missing on 8 of 12 screens; `gestureEnabled: false` traps users; step counter math broken on orphan screens |

**Overall: 14/24**

---

## Top 3 Priority Fixes

1. **Orphan screen files with broken step counters** — `app/(onboarding)/_layout.tsx` registers 6 screens but 7 `.tsx` files on disk define a separate 8-screen nav chain (preferences → am-routine → pm-routine → addresses → healthkit → calendar and their routes). `ONBOARDING_STEPS.healthkit = 8` and `ONBOARDING_STEPS.addresses = 7` against `ONBOARDING_TOTAL_STEPS = 6` would render "Step 8 of 6" or "Step 7 of 6" on those screens. The constants file itself labels these "Legacy keys." Impact: user confusion and potential navigation crash if any code path still pushes to these screens. Fix: delete `app/(onboarding)/preferences.tsx`, `am-routine.tsx`, `pm-routine.tsx`, `addresses.tsx`, `healthkit.tsx`, `calendar.tsx` and remove the legacy keys `preferences`, `amRoutine`, `pmRoutine`, `addresses`, `healthkit` from `src/constants/onboarding.ts` lines 18-22; OR deliberately restore the 8-screen flow to the Stack navigator.

2. **Accent identity drift — undefined gold vs. purple hierarchy** — Phase 1 was architected around warm gold (`#C8A84B`) as the primary accent. In the live 6-screen flow, purple (`#7B61FF` / `PURPLE`) owns the primary interactive surface (sleep-and-naps stepper value via `PURPLE` at line 255, trust badge text and borders in welcome via hardcoded `#7B61FF` at lines 335-345, household chip active state via hardcoded `#7B61FF` at lines 198 and 212). Gold appears only in textual data labels (welcome headline, stat numbers) and the ProgressBar fill. Impact: first-time user experiences two competing accent colors with no clear rule; the brand identity read from the code is inconsistent. Fix: declare which token owns CTAs/interactive vs. data labels. If purple is now primary-interactive, change `ACCENT.primary` to `ACCENT.purple` and update Button/ProgressBar. If gold stays primary, replace `#7B61FF` inline instances in `welcome.tsx` lines 335-345 and `household.tsx` lines 198/212 with `COLORS.accent.primary`.

3. **Missing back navigation on 8 of 12 screens** — `_layout.tsx` sets `gestureEnabled: false`, which disables swipe-back on all Stack screens. Of the 12 user-facing screens, only chronotype, household, sleep-and-naps, and shifts implement an explicit back button. The remaining 8 screens (welcome, plan-ready, am-routine, pm-routine, preferences, addresses, healthkit, calendar) have no back affordance. Impact: a user who taps "Let's get started" on welcome cannot recover if they tapped by accident; a user on the addresses screen cannot go back to fix a routine. Fix: add a `Pressable` back button header row to `app/(onboarding)/am-routine.tsx`, `pm-routine.tsx`, `addresses.tsx`, `plan-ready.tsx`, `preferences.tsx`, `healthkit.tsx`, and `calendar.tsx` matching the existing pattern in `chronotype.tsx` lines 74-81 (`router.back()`). For welcome, this is intentional (no prior screen) but the skip arrow at top-right only calls `completeOnboarding()` which is a non-recoverable jump to tabs — consider a cancel-guard or at minimum remove `completeOnboarding()` from the skip path on welcome.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**Strengths:**
- Welcome headline "Your sleep fights back." is punchy and differentiated for a sleep app — avoids the typical wellness-app warmth cliche.
- The 3% stat block (`welcome.tsx` lines 153-170) is concrete, memorable, and positions ShiftWell well against competitors.
- Trust badges (ER Physician, Circadian Science, 700M Workers) convey credibility without wordiness.
- Permission microcopy on healthkit is clear: "ShiftWell can read your sleep data to show how well your actual sleep matches the plan." No dark patterns.
- Skip links consistently use "Skip" with an arrow or "Skip — I'll set this up later" — never just an X, which is honest about what skipping means.
- Medical disclaimer at welcome screen bottom is appropriately brief without being dismissive.

**Issues:**
- CTAs on most screens are generic. "Continue" (household, sleep-and-naps), "Next" (am-routine, pm-routine, preferences, addresses), "Go to my dashboard" (plan-ready) — only "Let's get started" and the shifts screen options are screen-specific. A shift to outcome-focused labels ("Lock in my routine", "Save sleep preferences") would increase perceived value at each step.
- The shifts screen subtitle "This is where it gets good." (`shifts.tsx` line 129) is conversational but vague — it does not tell the user why entering shifts is valuable.
- `plan-ready.tsx` asks "Want reminders before your sleep windows?" then immediately shows the notification button with a bell emoji in the title (`"\u{1F514}  Yes, remind me"`) — the emoji is inside the button title string, which may render differently across platforms and screen readers may read the codepoint name.
- The calendar screen title "Connect Your Calendar" (`calendar.tsx` line 249) should qualify purpose: "Connect Calendar to Import Shifts" — users connecting calendar for the first time may not understand it is for shift import, not sleep plan export.
- `addresses.tsx` result note reads "This is a rough estimate based on distance." — framing it as rough before the user has seen the value may pre-undermine trust. Prefer: "Estimate based on straight-line distance — refine in Settings."

---

### Pillar 2: Visuals (2/4)

Note: no screenshots were captured — this is a code-only audit. Visual quality on device and animation frame rates cannot be confirmed.

**Strengths:**
- Star field background on welcome (`welcome.tsx` lines 24-85) with per-star `withRepeat/withSequence` Reanimated 4 animations is a strong opening visual for a sleep app.
- `AnimatedTransition` stagger is implemented on all content-heavy screens with appropriate 80-150ms delays.
- The plan-ready preview card (chronotype-personalized sleep/nap/light/meal/caffeine times) is a compelling value demonstration at the end of flow.
- ProgressBar is consistently placed at the top of content area on all active screens.

**Issues — Orphan screen architecture (critical structural issue):**
- 7 screen files exist on disk but are not registered in `_layout.tsx`: `preferences.tsx`, `am-routine.tsx`, `pm-routine.tsx`, `addresses.tsx`, `healthkit.tsx`, `calendar.tsx`. The live 6-screen flow does not include any routine builder, address entry, or HealthKit screens. These represent significant visual work (stagger animations, activity cards, keyboard avoidance patterns) that users will never see unless a path to these screens exists outside the Stack.
- The `shifts.tsx` calendar import path pushes `/import` then immediately pushes `/(onboarding)/plan-ready` (`shifts.tsx` lines 82-86). The comment acknowledges this as a workaround. The visual glitch (push-push in one frame) may cause a double-transition artifact.

**Iconography:**
- Welcome trust badges use a purple background (`rgba(123,97,255,0.1)`) with gold headline and white stars — three simultaneous accent surfaces on the first screen. On a dark navy background this could read as visually noisy.
- The shifts screen uses large tile emojis (28px) as the primary visual affordance — this is consistent and effective on that single screen but does not scale as a pattern.
- No consistent use of illustrations or iconography system beyond emoji. For a "premium, confident" identity this is acceptable but worth noting as a Phase 3+ gap.

---

### Pillar 3: Color (2/4)

**Token system:**
- `src/theme/colors.ts` has a clean architecture: BACKGROUND (3 levels), TEXT (8 levels), BORDER (3 levels), ACCENT, BLOCK_COLORS, SEMANTIC. All UI components verified to use theme tokens (Plan 01 work is intact).

**Critical drift — hardcoded hex in active screens:**

| File | Line | Value | Should Be |
|------|------|-------|-----------|
| `welcome.tsx` | 231 | `backgroundColor: '#FFFFFF'` (star fill) | `COLORS.text.primary` |
| `welcome.tsx` | 267 | `color: '#C8A84B'` (headline) | `COLORS.accent.primary` |
| `welcome.tsx` | 298 | `color: '#C8A84B'` (stat number) | `COLORS.accent.primary` |
| `welcome.tsx` | 317 | `color: '#C8A84B'` (stat headline) | `COLORS.accent.primary` |
| `welcome.tsx` | 345 | `color: '#7B61FF'` (badge text) | `PURPLE` or `COLORS.accent.purple` |
| `household.tsx` | 198 | `borderColor: '#7B61FF'` (chip active) | `PURPLE` or `COLORS.accent.purple` |
| `household.tsx` | 212 | `color: '#7B61FF'` (chip label active) | `PURPLE` or `COLORS.accent.purple` |
| `plan-ready.tsx` | 162 | `color="#fff"` (ActivityIndicator) | `COLORS.text.primary` |
| `plan-ready.tsx` | 221 | `color: '#FFFFFF'` (checkmark text) | `COLORS.text.primary` |
| `calendar.tsx` | 453 | `color: '#EF4444'` (errorText) | `COLORS.semantic.error` |
| `calendar.tsx` | 458 | `color: '#EF4444'` (errorLink) | `COLORS.semantic.error` |

Note: `calendar.tsx` uses `#EF4444` (Tailwind red-500) while the theme's semantic error is `#FF6B6B` — these are visually different reds creating an inconsistency if both screens appear.

**Accent identity:**
- Two functional accent tokens exist: gold `#C8A84B` (data/label layer) and purple `#7B61FF` (interactive layer). The theme exports both. The visual hierarchy in the live flow has purple as primary interactive (sleep-and-naps stepper dominant number, household chip selected state, welcome badge backgrounds) and gold as secondary (progress bar fill via ProgressBar component, label accents). This is a defensible "Path B" design direction but is not documented as such — the original plan and VERIFICATION.md describe a gold-primary system. The dual-accent split should be declared explicitly to avoid future drift.

**60/30/10 assessment:**
- 60% BACKGROUND.primary / surface (dark navy — consistent and correct for a sleep app)
- 30% TEXT.primary / secondary / tertiary (white and grays — correct)
- 10% accent — split between gold and purple with no single dominant accent. Total accent real-estate exceeds 10% on the welcome screen where gold, purple, and white tints all appear prominently.

---

### Pillar 4: Typography (2/4)

**Scale definition:**
`src/theme/typography.ts` defines a well-structured scale: xs(11) / sm(13) / base(15) / lg(17) / xl(20) / 2xl(24) / 3xl(30) / 4xl(36) with a `lh = size * 1.4` line-height helper. Seven pre-built styles: `heading1` through `caption` plus `label`. Additional V6 styles added: `heroNumber`, `screenHeading`, `cardTitle`, `meta`, `sectionLabel`, `timestamp`, `captionSmall`.

**TYPOGRAPHY token usage:**
Most screens use `...TYPOGRAPHY.heading2`, `...TYPOGRAPHY.body`, `...TYPOGRAPHY.bodySmall` spread into StyleSheet — correct pattern.

**Scale bypass — 12+ ad-hoc fontSize values in active screens:**

| File | Ad-hoc sizes |
|------|-------------|
| `welcome.tsx` | 44 (moon emoji), 30 (headline), 36 (stat number), 13 (stat headline), 11 (stat body), 12 (badge text), 9 (disclaimer label, legal text) |
| `sleep-and-naps.tsx` | 44 (stepper value), 24 (stepper button) |
| `shifts.tsx` | 28 (tile emoji), 20 (tile chevron) |
| `plan-ready.tsx` | 16 (checkmark font size), 18 (plan icon) |
| `household.tsx` | 18 (chip emoji) |

Many of these are emoji display sizes or decorative elements where a token is impractical (44px stepper number, 28px tile emoji). However, the welcome screen uses 9px disclaimer text which is not in the scale and falls below WCAG minimum recommended text size. The heading (`fontSize: 30`) is close to the `FONT_SIZE['3xl'] = 30` token value but is not using the token (`TYPOGRAPHY.heading2` already has this) — it's being re-declared inline with a custom `fontWeight: '800'` that deviates from `FONT_WEIGHT.bold = '700'`.

**Font weight discipline:**
- Authorized weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold).
- `welcome.tsx` uses `fontWeight: '800'` (line 266) which is outside the token scale.
- `sleep-and-naps.tsx` also uses `fontWeight: '800'` (line 242) for the stepper value.
- `800` is only available on iOS San Francisco — on Android Roboto `800` renders as `700`. This is a cross-platform inconsistency risk even though the app is iOS-first.

**Line height:**
- The `lh()` helper in typography.ts correctly uses 1.4x multiplier. Most screens using TYPOGRAPHY tokens inherit this. Custom font sizes inline do not get line-height treatment — the legal disclaimer at `welcome.tsx` line 373 has `lineHeight: 14` manually set (consistent with the pattern), but the stat body at line 322 has `lineHeight: 16` for `fontSize: 11` (ratio 1.45, acceptable).

---

### Pillar 5: Spacing (3/4)

**Scale:** 4-pt grid — xs(4) / sm(8) / md(12) / lg(16) / xl(20) / 2xl(24) / 3xl(32) / 4xl(40). Clean and sufficient for a mobile layout.

**Token usage:** SPACING tokens are consistently applied across all 12 screens for `paddingHorizontal`, `marginBottom`, `gap`, `paddingVertical`. The pattern `SPACING.lg` for screen horizontal padding and `SPACING['3xl']` for section separators is uniform. This is the strongest-scoring pillar.

**Non-token pixel values found:**

| File | Line | Value | Context |
|------|------|-------|---------|
| `welcome.tsx` | 293 | `paddingTop: 2` | stat left column offset |
| `welcome.tsx` | 306 | `marginTop: 6` | stat divider bar |
| `welcome.tsx` | 312 | `gap: 6` | stat right column |
| `welcome.tsx` | 367 | `marginBottom: 4` | disclaimer label to body |
| `shifts.tsx` | 228 | `marginBottom: 3` | tile title to subtitle |
| `sleep-and-naps.tsx` | 262 | `marginTop: 2` | stepper unit offset |

All 6 are micro-adjustments (2-6px) used for fine optical alignment — these do not represent systemic spacing violations. The appropriate fix is to either add `micro: 2` and `nano: 3` to SPACING or accept them as layout-specific overrides. Not blocking.

**Vertical rhythm:**
- The pattern of `paddingBottom: SPACING['3xl']` (32px) at scroll content bottom is consistent across all screens.
- The `header` margin pattern — `marginTop: SPACING.lg` (16px), `marginBottom: SPACING['3xl']` (32px) between progress bar and first content — is consistent across the 6 active screens.
- `footer: { marginTop: 'auto' }` is used consistently to push CTAs to the bottom on shorter content screens.

---

### Pillar 6: Experience Design (2/4)

**Flow length assessment:**
The live flow is 6 screens: welcome → chronotype → sleep-and-naps → household → shifts → plan-ready. This is an appropriate length for shift worker onboarding — each screen collects distinct, non-redundant data. The addition of the plan-ready personalized preview makes the length feel justified. Score: positive.

**Back navigation gap (critical):**
`_layout.tsx` sets `gestureEnabled: false` — correct for onboarding to prevent accidental back-swipes mid-flow. However only 4 of the 12 screen files (chronotype, household, sleep-and-naps, shifts) implement explicit back buttons. The remaining 8 screens including am-routine, pm-routine, addresses, preferences, healthkit, and calendar have no escape path. Even if those are orphans, the active screens welcome and plan-ready have no back button. Welcome intentionally has no back screen, but plan-ready is reachable from shifts and a user may want to return to change their shift entry method.

**Skip availability:**
- chronotype: has Skip (defaults to 'intermediate') — correct
- sleep-and-naps: has Skip (defaults to SLEEP_DEFAULT=7.5, napPreference=true) — correct
- household: has Skip (defaults to no children, no pets, 30min commute) — correct
- shifts: has "I'll do this later" option loading demo data — acceptable
- plan-ready: has "Not right now" for notifications — correct
- welcome: has Skip that calls `completeOnboarding()` and `router.replace('/(tabs)')` — this skips the entire onboarding flow, which is extreme for a first-run user who may have tapped accidentally. No confirmation.

**State handling:**
- Loading states: `healthkit.tsx` has `checking`, `connecting`, `connected` states. `calendar.tsx` has `appleLoading`, `googleLoading`, `reviewLoading`. `addresses.tsx` has `calculating` with button disabled during calculation. `plan-ready.tsx` has `notifLoading`. Loading states are well-handled across all screens that make async calls.
- Error states: `healthkit.tsx` and `calendar.tsx` surface error messages inline. `addresses.tsx` does not surface geocoding errors — `estimateCommuteDuration` returns the default 30 minutes silently on failure, so the user sees an estimate that may not reflect an error condition. The result card text "This is a rough estimate based on distance" partially covers this but does not distinguish between a successful geocode and a fallback.
- Empty states: `shifts.tsx` demo mode loads 3 demo night shifts — the empty state for "no shifts imported" at plan-ready is not handled (plan-ready renders the same preview regardless of whether shifts exist).

**Navigation bug in shifts.tsx:**
`handleCalendarImport()` (lines 82-86) fires two sequential `router.push` calls:
```
router.push('/import');
router.push('/(onboarding)/plan-ready');
```
The comment says "we also push plan-ready here so the back stack is: shifts → plan-ready" but this will fire before the import modal resolves — plan-ready will appear instantly behind the modal rather than after completion. This is a race condition that likely produces an incorrect flow.

**Progress indicator:**
- Active screens use `ONBOARDING_TOTAL_STEPS = 6` correctly. All 6 registered screens display a ProgressBar with their correct step number (verified: welcome=1, chronotype=2, sleepAndNaps=3, household=4, shifts=5, planReady=6).
- Orphan screens `am-routine` / `pm-routine` / `preferences` / `addresses` use `ONBOARDING_STEPS.amRoutine=5`, `pmRoutine=6`, `preferences=4`, `addresses=7` against `ONBOARDING_TOTAL_STEPS=6` — if navigated to, renders "Step 5 of 6" (duplicate with shifts), "Step 6 of 6" (duplicate with plan-ready), and "Step 7 of 6", "Step 8 of 6" (out-of-bounds).
- `calendar.tsx` hardcodes `currentStep={6} totalSteps={6}` directly (lines 246, 323, 367) — bypasses the constant.

**Accessibility:**
- All interactive `Pressable` elements on active screens have `accessibilityRole="button"`.
- `household.tsx` checkbox chips have `accessibilityState={{ checked: active }}` — correct.
- `sleep-and-naps.tsx` stepper buttons have `accessibilityLabel="Decrease sleep hours"` / `"Increase sleep hours"` — correct.
- `addresses.tsx` TextInputs have `accessibilityLabel="Work address"` and `"Home address"` — correct.
- `plan-ready.tsx` "Not right now" Pressable has `accessibilityRole="button"` — correct.
- Missing: the `welcome.tsx` Skip button is `accessibilityRole="button"` but has no `accessibilityLabel`. Screen reader would read "Skip →" including the Unicode arrow, which reads as "Skip right-pointing arrow" or similar. Fix: add `accessibilityLabel="Skip onboarding"`.
- Missing: `shifts.tsx` `OptionTile` `onPress` Pressable has `accessibilityRole="button"` (line 56) but no `accessibilityLabel` — the title text ("Import from Calendar") is a child `Text`, and React Native accessibility should pick it up, but explicit labeling is safer.
- Safe-area: all active screens use `react-native-safe-area-context SafeAreaView` — correct.
- Keyboard avoidance: `addresses.tsx` wraps in `KeyboardAvoidingView behavior='padding'` on iOS — correct for that screen. Other screens with no text input do not need it.

---

## Registry Safety

Registry audit: `components.json` not found — shadcn not initialized. Registry audit skipped.

---

## Files Audited

**Active (in Stack navigator):**
- `/Users/sima/Projects/ShiftWell/app/(onboarding)/_layout.tsx`
- `/Users/sima/Projects/ShiftWell/app/(onboarding)/welcome.tsx`
- `/Users/sima/Projects/ShiftWell/app/(onboarding)/chronotype.tsx`
- `/Users/sima/Projects/ShiftWell/app/(onboarding)/sleep-and-naps.tsx`
- `/Users/sima/Projects/ShiftWell/app/(onboarding)/household.tsx`
- `/Users/sima/Projects/ShiftWell/app/(onboarding)/shifts.tsx`
- `/Users/sima/Projects/ShiftWell/app/(onboarding)/plan-ready.tsx`

**Orphan (on disk, not in Stack navigator):**
- `/Users/sima/Projects/ShiftWell/app/(onboarding)/am-routine.tsx`
- `/Users/sima/Projects/ShiftWell/app/(onboarding)/pm-routine.tsx`
- `/Users/sima/Projects/ShiftWell/app/(onboarding)/addresses.tsx`
- `/Users/sima/Projects/ShiftWell/app/(onboarding)/preferences.tsx`
- `/Users/sima/Projects/ShiftWell/app/(onboarding)/healthkit.tsx`
- `/Users/sima/Projects/ShiftWell/app/(onboarding)/calendar.tsx`

**Theme and constants:**
- `/Users/sima/Projects/ShiftWell/src/theme/colors.ts`
- `/Users/sima/Projects/ShiftWell/src/theme/typography.ts`
- `/Users/sima/Projects/ShiftWell/src/theme/spacing.ts`
- `/Users/sima/Projects/ShiftWell/src/theme/index.ts`
- `/Users/sima/Projects/ShiftWell/src/constants/onboarding.ts`

**Planning artifacts (context only):**
- `/Users/sima/Projects/ShiftWell/.planning/phases/01-foundation-onboarding/01-01-PLAN.md` through `01-04-PLAN.md`
- `/Users/sima/Projects/ShiftWell/.planning/phases/01-foundation-onboarding/01-01-SUMMARY.md` through `01-04-SUMMARY.md`
- `/Users/sima/Projects/ShiftWell/.planning/phases/01-foundation-onboarding/01-RESEARCH.md`
- `/Users/sima/Projects/ShiftWell/.planning/phases/01-foundation-onboarding/01-VERIFICATION.md`
- `/Users/sima/Projects/ShiftWell/CLAUDE.md`
