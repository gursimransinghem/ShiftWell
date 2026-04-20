# Lane 1 — Celestial Arc: Rationale

## One-Line Pitch
A single tapered arc — thick at its grounded base, dissolving at its apex — traces the ascent of light across a 210-degree sweep, encoding the circadian day/night cycle without borrowing a single sleep cliché.

## Why This Direction Fits Shift Workers Specifically
Shift workers do not experience the day as a horizon-to-horizon arc — they live sideways to it. This glyph captures that oblique relationship: the arc is asymmetric, planted firmly in the lower-left (the graveyard-shift hours) and rising toward but never completing the circle. The anchor disc at the base is not a sun rising over a hill — it is the moment of intervention: the precise phase the algorithm targets. The incomplete arc signals that ShiftWell does not promise normal sleep; it promises optimization within real constraints. That honesty is the brand.

## Monochrome Behavior at 20px
The glyph collapses to a small filled disc (the anchor circle) with a curved tail ascending to the right. This is legible as a distinct, asymmetric shape against any background — it does not flatten into a blob or read as a generic circle. The taper mask ensures the tail fades naturally rather than cutting off abruptly. The horizon rule disappears entirely at 20px, which is correct: it is an embellishment, not structure.

## Self-Score Against the 7 Brand Principles

| # | Principle | Score | Justification |
|---|-----------|-------|---------------|
| 1 | Citations visible, algorithm transparent | 8/10 | Icon makes no claim, so no citation is needed here; the geometric construction itself references the Two-Process Model's time-of-day axis implicitly. No trust-laundering. |
| 2 | No urgency theater | 10/10 | A static glyph contains no urgency mechanics by definition. |
| 3 | No fake social proof | 10/10 | No social proof element in an app icon. |
| 4 | Cancellation louder than conversion | 10/10 | Not applicable to icon layer; no conversion mechanism present. |
| 5 | Physician credibility factual, not hyped | 9/10 | The premium, instrument-like aesthetic (Oura-register, not wellness-kitsch) supports the physician founder's credibility without overclaiming it. |
| 6 | Every hero claim cites a named study | 10/10 | No text claims in icon; not applicable. |
| 7 | Mission-first framing | 9/10 | The glyph encodes the problem (the disrupted arc of light-dark exposure for shift workers) rather than a product feature or brand aspiration. The incompleteness is honest. |

**Composite: 66/70**

## Weakness I Would Call Out
The taper is gradient-mask driven, which means it is invisible at true monochrome (e.g., stamped on physical merchandise or 1-bit favicon). In a strict monochrome context the arc becomes a uniform-width band, which is less distinctive and could be mistaken for a generic dial or progress indicator. A future revision could replace the gradient taper with a path-level geometric taper using a quadratic bezier for the inner edge — giving a true silhouette taper that survives 1-bit reproduction.
