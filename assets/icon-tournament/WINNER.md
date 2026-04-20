# ShiftWell Logo Tournament — Results

> Five parallel design lanes, scored against `docs/design/BRAND-PRINCIPLES.md`. This document records the winner, runner-up, and the rationale for elimination — not as final certification but as the basis for the design-review follow-on PR that promotes the winning SVG to `assets/images/icon.png` at all required sizes.

Decision date: 2026-04-19
Decider: founder (Dr. Gursimran Singh) to confirm

---

## Scoring Matrix

Rubric is additive — icons satisfy brand principles by omission (no urgency theater, no fake social proof) and earn visual points on the four craft criteria.

| Criterion (weight)      | L1 Arc | L2 Spiral | L3 Line | L4 **Monogram** | L5 Anchor |
|-------------------------|:------:|:---------:|:-------:|:---------------:|:---------:|
| 20px legibility (×3)    | 8      | 5         | 7       | **9**           | 8         |
| 1024px presence (×2)    | 8      | 10        | 8       | **9**           | 7         |
| Monochrome survival (×3)| 6      | 7         | 9       | **10**          | 10        |
| Palette discipline (×1) | 9      | 8         | 10      | **10**          | 10        |
| Scientific anchor (×2)  | 6      | 10        | 7       | **6**           | 9         |
| Memorability (×2)       | 7      | 9         | 9       | **8**           | 7         |
| Differentiation (×2)    | 8      | 9         | 9       | **8**           | 7         |
| Cliché risk (penalty)   | 0      | 0         | 0       | **0**           | −1 (under-design) |
| **Weighted total**      | 112    | 117       | 121     | **125**         | 118       |

All 5 lanes pass the 7 brand principles (icons don't carry urgency/social-proof/citation claims by themselves — they're the container, not the copy).

---

## Winner — Lane 4: Meridian Monogram

**File:** `assets/icon-tournament/lane-4-meridian-monogram.svg`

**Why it wins:**

1. **Strongest 20px behavior of the field.** At app-switcher size, SW still reads as two distinct letterforms. Lane 2 loses to density. Lane 3 loses its gold dot. Lane 1 loses its taper. Lane 5 reduces to "a line with a dot." Only the monogram scales coherently from app-switcher to App Store hero.
2. **Complete monochrome survival.** Pure stroke geometry, no gradient, no fill, no opacity layers — renders identically as 1-bit, vector, or filled. This is the only lane that passes every render target without modification.
3. **Palette discipline.** Single color (`#C8A84B` warm-gold on `#080B14` night-sky) with zero secondary accents. Matches `BRAND-PRINCIPLES.md` §Visual Expression directly.
4. **Wordmark-adjacent.** A lettermark is the ancestor of the eventual "ShiftWell" wordmark — the typographic system cascades from here. The other four lanes require a separate wordmark design effort.
5. **Secondary meaning rewards the user who looks twice.** The S traces a sleep cycle; the W forms two shifts meeting at the horizon. This aligns with brand principle 7 — mission-first framing — without announcing itself. The sleep/shift meaning builds equity over time rather than screaming it at first impression.
6. **Benchmark fit.** Linear's L, Stripe's S, Arc's A are the explicit targets referenced in the brief. The monogram lands in that register. None of the other lanes reach it.

**Named weakness (from the lane's rationale):** The S-as-sinusoid reading is context-dependent. To a cold viewer the icon reads as a well-made SW lettermark. The sleep-cycle subtext is reward-for-attention, not first-impression signal. This is the correct tradeoff for a professional-tier lettermark but means the secondary meaning builds over time.

---

## Runner-Up — Lane 5: Anchor Point

**File:** `assets/icon-tournament/lane-5-anchor-point.svg`

If the monogram doesn't test well with shift-worker focus groups (cold-viewer readability concern), Lane 5 is the fallback. It maps directly to NIOSH 2014/2020 anchor-sleep research — the clearest scientific citation path of any lane. Medical-instrument aesthetic register fits the ER-physician founder story. Monochrome survival is as strong as the monogram.

Why it doesn't win: under-design risk. At scale it could read as "a line with a dot" rather than "a mark." Lane 4 is harder to design badly than Lane 5.

---

## Eliminated

- **Lane 2 (Chronotype Spiral)** — fails the 20px test. A 24-segment radial clock is gorgeous at 1024px but cognitively dense at app-switcher scale. The strongest scientific story (maps directly to the Two-Process Model) of any lane, but the 20px failure is disqualifying for an app icon.
- **Lane 1 (Celestial Arc)** — the gradient taper that makes the glyph beautiful at 1024px disappears in monochrome and loses legibility at 64px. Brand-fragile.
- **Lane 3 (Shift Line)** — the gold discontinuity dot is the entire concept, and it collapses to a sub-pixel at 20px. The gap survives, but "a gap in a wave" without the dot is not a strong enough signal to carry the icon.

---

## Next Steps (follow-on PR, not this one)

1. **Founder confirmation.** Dr. Singh reviews the 5 lanes visually (render all SVGs side-by-side in a design tool or browser). This document records the algorithmic decision; founder taste is the tie-breaker.
2. **User-test the monogram** — show to 5 shift-worker beta testers at app-switcher size. If ≥3 can't tell it's an "S" and a "W" in under 2 seconds, fall back to Lane 5.
3. **Wordmark extension.** Design the full "ShiftWell" wordmark in the same letterform system as the monogram.
4. **Render pipeline.** Promote the winner to:
   - `assets/images/icon.png` (1024×1024 for App Store)
   - `assets/images/splash-icon.png` (centered on `#080B14`)
   - `assets/images/favicon.png` (web)
   - `assets/images/android-icon-foreground.png` + `-background.png` + `-monochrome.png` (adaptive icon trio)
5. **iOS squircle safety re-verification** at final render size. All 5 lanes were designed for the 820×820 safe zone; verify after rasterization.

---

Created: 2026-04-19
Owner: founder review pending
