# Tagline Lockup Assets

The fulcrum-divider tagline lockup. Used on: website hero, App Store hero screenshot, Welcome screen in the app, social avatars, deck slides, email footer.

## Files

| File | Mode | Use |
|---|---|---|
| `tagline-lockup-dark.svg` | Dark (Midnight, Aurora themes) | Default. Dark canvas surfaces. |
| `tagline-lockup-light.svg` | Light (Sunrise, Twilight themes) | Warm/cream canvas surfaces. |

## Anatomy

```
       Work. Life. Sleep. *Rebalanced.*     ← serif, italic-emphasis last word
  ─────────•─────────   ← fulcrum (horizontal rule + balance weights + center pivot triangle)
                 ShiftWell                  ← sans wordmark, tracked letter-spacing
```

The fulcrum is not decorative — it IS the tagline's meaning. The top line is what's being balanced; the pivot point below is ShiftWell.

## Fonts

- **Headline (serif):** Inter 700, Italic 600 for "Rebalanced." Fallback: Georgia → Times New Roman → system serif
- **Wordmark (sans):** Inter 600, 2.4px letter-spacing. Fallback: system sans

Inter is already loaded on the website (`index.html` lines 34–36) and planned for the app's Welcome screen hero (per plan C1).

## Color

| Token | Dark SVG | Light SVG |
|---|---|---|
| Primary ink (headline + wordmark) | `#FFFFFF` | `#1F2133` |
| Accent (italic "Rebalanced", fulcrum) | `#C8A84B` (gold) | `#7B61FF` (purple) |

**Why different accents for light vs dark:** gold (`#C8A84B`) has a 4.2:1 contrast ratio against dark navy — passes WCAG AA for large text. Against warm cream backgrounds gold fails contrast, so light-mode uses purple (`#7B61FF`) which hits >5:1 on all approved light surfaces.

## Rendering at sizes

Tested legibility ranges:

- **Hero (≥480px wide):** full lockup works perfectly
- **Social avatar (≥256px):** lockup works; consider cropping to wordmark-only for circular crops
- **Favicon (≤64px):** DO NOT use lockup. Use icon-only mark (delivered by logo tournament).
- **Between 64–256px:** use a compact variant (tagline line only, no wordmark) — TBD post-tournament.

## Integration examples

### HTML (inline, for website)

```html
<img src="/assets/brand/lockup/tagline-lockup-dark.svg"
     alt="Work. Life. Sleep. Rebalanced by ShiftWell."
     width="720" height="200">
```

### React Native (Expo)

```tsx
import { SvgXml } from 'react-native-svg';
import taglineDark from '@/assets/brand/lockup/tagline-lockup-dark.svg';
// ... or use react-native-svg-transformer for direct <Tagline /> component
```

### Figma / Design Tools

Drop the SVG directly into Figma. It will parse cleanly (no raster fallbacks).

## Source of truth

Canonical palette and typography are mirrored from:
- `src/theme/colors.ts` (app)
- `website/index.html` CSS tokens (lines 42–105)

If tokens change, these SVGs must be regenerated.
