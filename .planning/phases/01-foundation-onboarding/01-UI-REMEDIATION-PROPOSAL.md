# Phase 01 — UI Remediation Proposal

**From:** `01-UI-REVIEW.md` (Overall 14/24, 2026-05-05)
**Status:** Proposal only — not committed to a phase plan
**Realistic ceiling:** 20–21/24 with the work below; 24/24 is diminishing returns and not what App Review cares about.

---

## What App Review actually cares about (do these — TestFlight blockers)

These are crash/inconsistency risks, not aesthetics. They MUST land before `/gsd:plan-phase 10-testflight-prep` execution.

| # | Risk | Files | Severity |
|---|---|---|---|
| 1 | `shifts.tsx:82-86` fires `router.push('/import')` then `router.push('/(onboarding)/plan-ready')` in the same frame — plan-ready renders behind the modal. Likely produces a stuck/double-transition. | `app/(onboarding)/shifts.tsx` | Bug |
| 2 | `fontWeight: '800'` only renders on iOS San Francisco; Android Roboto silently renders as `'700'`. Cross-platform inconsistency. | `welcome.tsx:266`, `sleep-and-naps.tsx:242` | Cross-platform |
| 3 | 7 orphan `.tsx` files reachable via constants (`ONBOARDING_STEPS.healthkit=8` vs `ONBOARDING_TOTAL_STEPS=6`) — any code path that pushes to them renders "Step 8 of 6". | `app/(onboarding)/{am-routine,pm-routine,addresses,preferences,healthkit,calendar}.tsx`, `src/constants/onboarding.ts:18-22` | Bug |
| 4 | `welcome.tsx` Skip button has no `accessibilityLabel` — VoiceOver reads "Skip right-pointing arrow." Apple a11y reviewers will flag. | `welcome.tsx` | a11y |
| 5 | `addresses.tsx` `estimateCommuteDuration` returns 30-min default silently on geocode failure — user sees a fake estimate with no error indication. | `app/(onboarding)/addresses.tsx` | Trust/UX |

**Estimated score after fixes 1–5:** 14 → 17/24 (Visuals 2→3, ED 2→3, +partial credit elsewhere).

---

## Phase A — Mechanical cleanup (~1 hour, no design decisions)

All work is purely "replace X with Y" — driven by the line-numbered audit tables.

| Pillar | Action | Files |
|---|---|---|
| Color | Replace 11 hardcoded hex values with `COLORS.*` tokens (full table in `01-UI-REVIEW.md` §Pillar 3) | `welcome.tsx`, `household.tsx`, `plan-ready.tsx`, `calendar.tsx` |
| Typography | Replace `fontWeight: '800'` → `'700'`. Remove `fontSize: 9` disclaimer (WCAG min ~11). Replace inline `fontSize: 30` headline with `TYPOGRAPHY.heading2` spread. | `welcome.tsx`, `sleep-and-naps.tsx` |
| Spacing | Either add `micro: 2` / `nano: 3` to `SPACING` or accept 6 micro-adjustments — pick one and move on. | `src/theme/spacing.ts` |
| ED | Delete 7 orphan files + remove legacy step keys from `src/constants/onboarding.ts:18-22`. | (file list above) |
| ED | Fix `shifts.tsx:82-86` router.push race — chain via `import.tsx` callback or pop+push. | `app/(onboarding)/shifts.tsx`, `app/import.tsx` |
| ED | Add `accessibilityLabel="Skip onboarding"` to `welcome.tsx` Skip button. Optional: same on `OptionTile`. | `welcome.tsx`, `shifts.tsx` |

**Estimated score after Phase A:** 14 → 18–19/24 (Color 2→3, Typography 2→3, ED 2→3, Spacing 3→4 if micro tokens added).

---

## Phase B — Accent decision + back-nav (~30 min + 1 design call)

Requires Sim to decide one thing.

**Decision (blocks the work):** Which token owns CTAs/interactive surfaces — gold (`#C8A84B`) or purple (`#7B61FF`)?

- Code reads as **purple-primary** today (sleep-and-naps stepper value, household chip active, welcome trust badge).
- Design intent in `01-RESEARCH.md` / `01-VERIFICATION.md` reads as **gold-primary**.
- Pick one. The other becomes a documented secondary/data-label accent.

**After the decision:**
- Update `ACCENT.primary` in `src/theme/colors.ts` to match.
- Sweep all `#C8A84B` and `#7B61FF` references; everything interactive maps to `COLORS.accent.primary`, everything decorative/data maps to `COLORS.accent.secondary` (or new token name).
- Add back button to `plan-ready.tsx` (only active screen reachable from `shifts` that lacks it). Welcome intentionally has no back; that's correct.
- Add a Settings entry letting users return to shift selection without re-onboarding.

**Estimated score after Phase B:** 18–19 → 20/24 (Color 3→4 if hierarchy declared; ED 3 holds).

---

## Phase C — Copywriting polish (~45 min, needs UX judgment)

Subjective. Skip if Sim doesn't care about the +1 here.

| Screen | Current | Suggested |
|---|---|---|
| household, sleep-and-naps | "Continue" | "Save my sleep preferences" / "Lock in routine" |
| shifts subtitle | "This is where it gets good." | concrete value statement |
| calendar title | "Connect Your Calendar" | "Connect Calendar to Import Shifts" |
| addresses note | "This is a rough estimate based on distance." | "Estimate based on straight-line distance — refine in Settings." |
| plan-ready notif title | `"\u{1F514}  Yes, remind me"` (emoji-in-string) | "Yes, remind me" with separate `<Bell/>` icon component |

**Estimated score after Phase C:** 20 → 21/24 (Copywriting 3→4).

---

## What I would NOT do

- **Don't chase 24/24.** Going from 21 → 24 requires brand work (illustration system, custom iconography, animation timing on real device) that doesn't move user metrics or affect App Review. Time better spent on `09-circadian-protocols` execution or pre-TestFlight QA.
- **Don't add screenshots to the audit retroactively.** Setting up RN device-screenshot CI is a separate phase if you want it; not worth blocking on for one audit.
- **Don't generate a UI-SPEC retroactively.** That's `/gsd:ui-phase` and only useful if you're planning new UI. Phase 01 is shipped — write specs for the next phase that needs them.
- **Don't restore the orphan screens** unless you specifically want a 12-screen flow. The 6-screen flow already collects sufficient data per the chronotype + sleep-and-naps + household + shifts pipeline.

---

## Recommended phasing

1. **Insert phase 01.1 — `01.1-ui-cleanup`** (or amend phase 01 in place since it's untracked work):
   - Bug fixes (1, 2, 3, 5 from Blockers table)
   - Phase A mechanical cleanup
   - Test: `npm test` (1059 tests must still pass per ShiftWell `CLAUDE.md`)
2. **Phase 01.2 — `01.2-accent-decision`:** sit with Sim 10 min, pick gold or purple, sweep refs, add back-button on plan-ready.
3. **Defer Phase C** until after TestFlight beta feedback — copy edits without user data are guesses.

---

## Execution order if you want to start now

1. Read `01-UI-REVIEW.md` tables (already in repo).
2. Create branch: `fix/01-ui-cleanup`.
3. Apply Phase A edits (the audit has every line number — surgical).
4. Run `npm test`.
5. Commit per ShiftWell convention.
6. Re-run `/gsd:ui-review 01` afterward — score should jump from 14 → 18–19.
