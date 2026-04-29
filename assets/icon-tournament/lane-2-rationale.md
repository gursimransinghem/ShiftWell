# Lane 2 — Chronotype Spiral: Design Rationale

## One-Line Pitch
A 24-hour clock where the arc thickness IS the Two-Process Model — you can read the biology without a legend.

## Why This Direction Fits Shift Workers

The icon encodes meaning that a nurse finishing a 12-hour night shift would recognize intuitively: time is not uniform. The outer ring's 24 arc segments get visibly thicker from sleep nadir (H03, 3am, thinnest arc, 12px) through peak alertness (H09-10, 9-10am, widest arc, 48px) and the warm-gold afternoon phase (H17-18, 5-6pm). This is not decoration — it is a direct visual rendering of the Two-Process Model's Process C curve (Borbely, 1982). The inner middle ring replicates Process S: homeostatic sleep pressure builds across the wake-zone arcs (thickening from purple to gold going left), then dissipates during sleep zone arcs (thin, compressed, near-invisible). Anyone who has read the canonical Borbely diagram will see it immediately. Anyone who hasn't will feel the asymmetry as *information* — this clock is not neutral, it is a biological clock.

The midnight-at-top orientation places the sleep zone in the "dead quiet" upper-right quadrant, far from the warm brightness concentrated in the lower-left and left. For a shift worker, that spatial weight matches how those hours feel.

## Monochrome Behavior (20px Test)

At 20px, the icon reduces to a clock-face: a bright center disk (gold → gray), a faint ring, and a visible asymmetry between the quiet upper-right arc cluster and the heavier lower-left arc mass. The 12 spine marks at varying lengths survive as a recognizable radial pattern even at 1px density. At 20px there is no gradient differentiation — only shape contrast — and the thick/thin arc asymmetry reads as a crescent-like mass, which is distinctive and not confused with a standard clock icon.

## Self-Score Against 7 Brand Principles

| # | Principle | Score | Justification |
|---|-----------|-------|---------------|
| 1 | Citations visible / algorithm transparent | 8/10 | The icon IS the Two-Process Model diagram — no words needed. Any copy alongside can point to Borbely 1982. The icon doesn't obscure, it diagrams. |
| 2 | No urgency theater | 10/10 | Zero urgency signals. Static, precise, scientific. |
| 3 | No fake social proof | 10/10 | Not applicable to icon. No implied popularity. |
| 4 | Cancellation is louder than conversion | 10/10 | Not applicable to icon. |
| 5 | Physician credibility factual, not hyped | 9/10 | Geometric precision communicates clinical rigor without "doctor stamp" clichés. |
| 6 | Every hero claim cites a named study | 9/10 | The diagram structure is the citation — implemented, not implied. Adjacent copy can surface Borbely 1982 explicitly. |
| 7 | Mission-first framing | 9/10 | Problem (asymmetric time, circadian disruption) is the visual premise. The shift worker's reality is encoded in the weight distribution. |

**Overall: 65/70**

## Weakness I Would Call Out

The icon is cognitively dense at mid-sizes (64–128px). The three concentric layers — outer 24-segment ring, middle 6-arc ring, inner spines — compete at 128px where no single element dominates. A simpler version with only the outer ring and core would be cleaner for notification tray use. The current design is optimized for the App Store 1024px hero and the home-screen 60px (where the crescent shape reads); the 20–40px range requires a separate single-layer glyph variant.
