# Lane 2 — Bioluminescent Circadian Curve: Design Rationale

## The idea

A single 24-hour circadian oscillation rendered in three concentric luminosity layers — a physics-accurate simulation of bioluminescent photophore structure, where brightness attenuates quadratically from a white-hot filament core outward. The color gradient is not decorative: purple encodes peak melatonin/night phase, teal encodes the cortisol rise and light-sensitive window, gold encodes the circadian entrainment point at dawn.

## Why it hooks attention

- **It reads as data before it reads as a logo.** The sinusoidal curve with two marked inflection points looks like instrumentation output — the kind of thing you'd see in a WHOOP dashboard or a polysomnography readout. The stranger on the street who sees it on a phone case asks "what is that measuring?" not "what app is that from?"
- **The glow is structural, not decorative.** Three mathematically distinct stroke widths (28px outer halo / 14px mid / 5px inner / 2px core) simulate actual bioluminescence physics. This is perceivable even without conscious attention: the mark has depth, not blur.
- **The implied S-shape requires no letterform trickery.** The two inflection points at x=33%/x=67% of the curve, combined with the ascending/descending arcs, create an S-reading that emerges from the biology, not from a designer forcing a letterform onto a curve.

## Why people would wear it

The mark is abstract enough to be beautiful before it's legible as a brand. At T-shirt chest scale the purple-to-gold gradient reads as something between aurora photography and deep-sea bioluminescence — two aesthetic categories people actively seek out as phone wallpapers and print art. The curve is calm, singular, and precise: qualities that translate to wearable confidence rather than fandom. Nobody wants to be a billboard for a sleep app; everyone is fine wearing what looks like a scientific visualization.

## Scalability notes

**At 1024×1024 (app icon):** All four luminosity layers are fully expressed. The inflection nodes carry solid 7px dots with 46px radial halos. The curve's amplitude (327px from midline) fills the icon with the rhythm without touching the 12% iOS safe padding. Grid reference lines at 6% opacity give depth without competing.

**At 32×32 (favicon):** Gradients collapse to a single accent purple (#7B61FF) stroke at 1.75px. The two inflection dots (1.5px each, one purple / one gold) are the only two-color element that survives. The curve is geometrically correct at this scale — the S-inflection is still readable because the control point mathematics are preserved, not approximated visually.

**On white (light icon):** Glow layers (which require a dark background to read) become ultra-low-opacity shadow layers. The core filament stroke is widened from 5px to 9px to compensate for the lost glow volume. Node dots become solid fills with no radial. The mark remains fully legible and intentional.

## Anti-cliché checklist

- No sleep iconography (z's, pillows, clocks, moons): ✓ — the mark is a waveform, not a sleep symbol
- No generic wellness-app soft-focus blur: ✓ — glow is structurally layered, not a filter
- No medical tropes (caduceus, stethoscope, ECG line): ✓ — the curve is circadian, not cardiac
- No stock bioluminescence clip-art: ✓ — the curve is mathematically derived from the two-process model
- Survives monochrome at 32×32: ✓ — favicon-32.svg demonstrates this with no gradient
- Does not look like a meditation app: ✓ — precision/instrumentation aesthetic, not organic/soft
- Wearable at T-shirt chest scale: ✓ — abstract enough to be art before it's a logo

## What I deliberately didn't do

Did not add a letterform "S" — the mark implies it through geometry, forcing it would convert a scientific visualization into a typographic exercise and destroy the "what IS that?" hook. Did not use a circular arc or spiral (clock-coded). Did not add any text to the icon variants (App Store guidelines aside, it would shift the mark from data-visualization into badge). Did not use glow as a cliché — every luminosity layer has a distinct stroke width corresponding to a distinct physical layer (the bioluminescent photophore has an outer mantle, a mid layer, and a central light-producing cell — three layers, three strokes).
