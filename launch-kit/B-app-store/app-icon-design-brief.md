# ShiftWell App Icon Design Brief

## 1. Brand Identity Summary

**App Name:** ShiftWell
**Tagline:** "Sleep smarter between shifts"
**Mission:** Give the world back its time and health.
**One-liner:** Stop thinking about sleep. ShiftWell thinks for you.

**Core Values:**
Science-backed (every recommendation traces to peer-reviewed research), shift-worker-focused (built by an ED physician who lives the problem), calm but not soft (professional, not lullaby-ish). The tone is "a friend who happens to be a sleep scientist" — warm, confident, never clinical or nagging. Premium over desperate — no dark patterns, no guilt trips.

**Color Palette** (from `src/theme/colors.ts`):

| Role | Hex | Usage |
|------|-----|-------|
| Deep Navy Background | `#080B14` | App primary background |
| Icon/Splash Background | `#0A0E1A` | Splash screen, icon base |
| Surface | `#131726` | Cards, sheets |
| Elevated | `#1A1F35` | Floating elements |
| **Primary Purple** | **`#7B61FF`** | Core brand accent, sleep blocks |
| Purple Glow | `rgba(123,97,255,0.35)` | Glow/halo effects |
| Lighter Purple | `#B794F6` | Nap blocks, secondary purple |
| Wind Down Purple | `#818CF8` | Gentle purple variant |
| **Warm Gold** | **`#C8A84B`** | Secondary accent, premium feel |
| Gold Highlight | `#F59E0B` | Soft highlight accents |
| Blue (Calendar) | `#4A90D9` | Calendar/shift day blocks |
| Night Shift Orange | `#FF9F43` | Night shift indicator |
| Success Green | `#34D399` | Meal blocks, positive states |
| Error Red | `#FF6B6B` | Caffeine cutoff, warnings |
| White | `#FFFFFF` | Primary text |
| Muted Gray | `#9CA3AF` | Secondary text |

**Brand Gradient:** `#7B61FF` (purple) to `#C8A84B` (gold) — this is the signature ShiftWell gradient, used in the accent system throughout the app.

**Target Users:** Exhausted healthcare workers pulling 12-hour shifts, firefighters on 24/48 rotations, factory workers on rotating schedules, paramedics, police officers. These people are tired, skeptical of gimmicks, and need something that just works. The icon must convey professionalism and trustworthiness — not another meditation app.


## 2. Icon Concepts

### Concept A: Moon/Clock Hybrid (Recommended)

**Visual Description:** A crescent moon shape that subtly incorporates clock elements. The moon is rendered in the signature purple (`#7B61FF`) with a soft glow halo, sitting on the deep navy background (`#0A0E1A`). The inner curve of the crescent contains two minimal clock hands (hour and minute) formed from thin white lines, suggesting a clock face without drawing an explicit circle. A single small gold dot (`#C8A84B`) marks the 12 o'clock position, doubling as a star. The overall shape is organic and asymmetric — the moon takes up roughly 60% of the icon area, positioned slightly off-center toward the upper right.

**Color Treatment:** Navy base → purple crescent with radial gradient (lighter `#9B7DFF` at the inner edge, deeper `#7B61FF` at the outer edge) → subtle purple glow bleeding 10-15% beyond the moon's edge → white clock hands → gold accent dot. No more than 4 colors total.

**At 29x29px:** The crescent reads as a clear moon shape. Clock hands collapse into a simple angular mark inside the curve. The gold dot remains visible as a warm accent point. The purple-on-navy contrast holds strong even at thumbnail size. The glow effect disappears at this size, but the core shape remains distinctive.

**Why This Works:** Moon = sleep (instant recognition). Clock = time/shifts (the core problem). The hybrid says "we manage your sleep around your schedule" without a single word. It's unique — no major competitor uses a moon/clock combo. The purple distinguishes it from Timeshifter's clock-centric approach.

### Concept B: Abstract Wave/Rhythm Pattern

**Visual Description:** Two overlapping sine-wave curves that represent circadian rhythm and sleep cycles. The top wave is rendered in purple (`#7B61FF`), the bottom wave in gold (`#C8A84B`), and they intersect at a central point where the colors blend. The waves flow from lower-left to upper-right, suggesting upward momentum and cyclical rhythm. The background is the deep navy (`#0A0E1A`). The intersection point has a subtle white glow, representing the optimal sleep window. The waves have soft, rounded peaks — not sharp or clinical-looking.

**Color Treatment:** Navy base → purple wave (top, with slight gradient from `#818CF8` to `#7B61FF`) → gold wave (bottom, gradient from `#F59E0B` to `#C8A84B`) → white glow at intersection → overall effect is warm and scientific without being sterile.

**At 29x29px:** The two-wave pattern simplifies to two crossing curved lines — one purple, one gold — with a bright center point. The color contrast between purple, gold, and navy keeps it legible. At this size it reads as an abstract mark rather than literal waves, which is fine — it's distinctive and memorable.

**Why This Works:** Waves = rhythm = circadian science (the algorithm's foundation). The two-color interplay suggests the balance between work and rest. It's abstract enough to be timeless and doesn't box the brand into a single metaphor. Stands out from the literal imagery most health apps use.

### Concept C: Shield with Circadian Arc

**Visual Description:** A shield/badge shape — not a medieval shield, but a modern rounded-bottom badge (think: quality seal). The shield outline is rendered in a thin gold stroke (`#C8A84B`). Inside the shield, a half-circle arc in purple (`#7B61FF`) represents the circadian cycle, sweeping from 7 o'clock to 5 o'clock position. A small white dot sits at the peak of the arc (noon/midnight marker). Below the arc, three short horizontal lines in muted purple (`#B794F6`) suggest a schedule or plan. Background is deep navy (`#0A0E1A`). The overall message: "your sleep schedule, protected."

**Color Treatment:** Navy base → gold shield outline (2-3px stroke weight at 1024px) → purple circadian arc (solid, with slight inner glow) → white peak dot → muted purple schedule lines → clean, badge-like hierarchy.

**At 29x29px:** The shield shape reads clearly as a contained, badge-like mark. The internal details (arc, lines) simplify to a colored shape inside a gold border. The gold outline provides strong definition against the navy background even at this tiny size. The white dot remains visible as a focal point.

**Why This Works:** The shield communicates protection and trust — critical for healthcare workers who are skeptical of wellness apps. The circadian arc adds scientific credibility. The schedule lines hint at the core feature (calendar-aware planning). It reads as "professional tool" not "sleep sounds app." However, it's the most complex of the three and risks looking busy at small sizes.


## 3. Technical Requirements

### iOS Icon Sizes

All sizes derive from a single **1024x1024px** master file.

| Size (pt) | Scale | Pixels | Usage |
|-----------|-------|--------|-------|
| 20 | 2x | 40x40 | Notification (iPhone) |
| 20 | 3x | 60x60 | Notification (iPhone) |
| 29 | 2x | 58x58 | Settings (iPhone) |
| 29 | 3x | 87x87 | Settings (iPhone) |
| 40 | 2x | 80x80 | Spotlight (iPhone) |
| 40 | 3x | 120x120 | Spotlight (iPhone) |
| 60 | 2x | 120x120 | Home screen (iPhone) |
| 60 | 3x | 180x180 | Home screen (iPhone) |
| 76 | 2x | 152x152 | Home screen (iPad) |
| 83.5 | 2x | 167x167 | Home screen (iPad Pro) |
| 1024 | 1x | 1024x1024 | App Store listing |

**iOS Rules:**
- No transparency — fully opaque, every pixel filled
- No rounded corners — iOS applies the superellipse mask automatically
- Square canvas only — no circular crops
- sRGB color space
- PNG format
- No embedded alpha channel

### Android Adaptive Icon

Android uses a two-layer system with a **108x108dp** safe zone (72dp visible area).

| Asset | Size | Notes |
|-------|------|-------|
| Foreground | 432x432px | Icon artwork centered in 288x288 safe zone |
| Background | 432x432px | Solid color or pattern layer |
| Legacy fallback | 512x512px | For older launchers, full icon with background |
| Play Store | 512x512px | Google Play listing |

**Android Rules:**
- Foreground: transparent background, artwork within center 66% (288x288px safe area)
- Background: can be solid color (`#0A0E1A`) or gradient
- System applies various masks (circle, squircle, rounded square) — design for all
- No critical content in outer 18dp on any side
- PNG format, 32-bit color with alpha for foreground

### Expo Configuration

The icon is configured in `app.json` (current config):

```json
{
  "expo": {
    "icon": "./assets/images/icon.png",
    "ios": {
      "icon": {
        "source": "./assets/images/icon.png"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "backgroundColor": "#0A0E1A"
      }
    }
  }
}
```

**Files to deliver:**

| File | Size | Purpose |
|------|------|---------|
| `assets/images/icon.png` | 1024x1024 | iOS master + Expo default |
| `assets/images/android-icon-foreground.png` | 432x432 | Android adaptive foreground |
| `assets/images/android-icon-background.png` | 432x432 | Android adaptive background |
| `assets/images/splash-icon.png` | Update to match | Splash screen icon |
| `assets/images/favicon.png` | 48x48 | Web favicon |

No config changes needed — just replace the image files. Expo/EAS handles all size generation automatically from the master files.


## 4. Competitive Icon Analysis

### Sleep Cycle
**Visual:** Serene, night-themed gradient with dreamy blue/teal palette. Emphasizes a calming, sleep-oriented aesthetic with clean typography elements.
**Works:** 15 years of brand recognition. Gradient creates visual depth. Cohesive identity across all touchpoints.
**Doesn't Work:** Gradient-heavy designs can lose definition at small sizes in App Store search results. The calming aesthetic blends into the sea of meditation/sleep apps.

### Timeshifter
**Visual:** Clock/time-centric iconography with symbolic elements (sun, coffee) woven into the design. Science-forward, travel-oriented aesthetic.
**Works:** Direct visual metaphor — you instantly understand it's about time management. Clean, recognizable at small sizes.
**Doesn't Work:** Clock icons are overused across travel and scheduling categories. Can feel clinical rather than inviting.

### RISE Science
**Visual:** Sunrise-themed orange/yellow palette designed by Michael Flarup (noted icon designer). Warm tones suggest morning energy and sleep debt recovery.
**Works:** Warm color psychology perfectly aligns with "energy" and "wake up" positioning. Sunrise is universally understood. Professionally crafted.
**Doesn't Work:** Orange/yellow already dominates the fitness category. Risks blending in with workout and nutrition apps rather than standing out as a sleep tool.

### WHOOP
**Visual:** Ultra-minimalist white circle on dark background, reflecting the wearable's screenless design philosophy.
**Works:** Premium, clean, professional. Strong brand consistency between hardware and software. Stands out through restraint in a category full of busy icons.
**Doesn't Work:** So minimal it can appear generic to users who don't already know the brand. No visual hint of what the app does. Relies entirely on brand awareness.

### Oura Ring
**Visual:** Gold circular ring motif directly mirroring the physical product. Luxury positioning with metallic tones.
**Works:** Instant hardware-to-app recognition for existing users. Gold conveys premium quality and precision. Distinctive shape in the category.
**Doesn't Work:** Hardware-dependent design — new users unfamiliar with the ring won't understand what the app does from the icon alone.

### How ShiftWell Stands Out

**Color gap:** No major competitor in sleep/health uses purple + gold on dark navy. Sleep Cycle owns blue/teal, RISE owns orange/yellow, Oura owns gold-on-dark. ShiftWell's purple is distinctive and unclaimed territory.

**Concept gap:** No competitor combines time (clock/schedule) with sleep (moon/night) in their icon. This is ShiftWell's exact value proposition — schedule-aware sleep optimization — and it should be visible at the icon level.

**Tone gap:** Most sleep app icons lean either clinical (Timeshifter) or dreamy (Sleep Cycle). ShiftWell's icon should split the difference — professional enough for a nurse checking her phone at 3 AM, warm enough to not feel like medical software.

**Category positioning:** Health & Fitness icons that stand out share these traits: (1) high contrast against both light and dark App Store backgrounds, (2) one dominant color that becomes the brand's "flag," (3) a single focal element rather than a busy composition, and (4) designs that remain legible at 40x40px in search results. ShiftWell's deep navy background with bright purple accent checks all four boxes.


## 5. DIY Options (Budget: $0)

### Figma Templates

**Recommended approach — highest quality free option:**

1. **iOS & Android App Icon Template by Michael Flarup** — The industry standard. Free on Figma Community. Includes all iOS/Android sizes, adaptive icon safe zones, live previews showing your icon on device mockups. Search "App Icon Template" on figma.com/community. Flarup designed RISE's icon, so the template is battle-tested.

2. **Figma's built-in iOS design kit** — Includes icon grid overlays and the Apple superellipse mask shape. Useful for checking how corners will be clipped.

3. **Workflow:** Start with 1024x1024 frame → use the ShiftWell colors from Section 1 → design the icon → export at all required sizes using the template's built-in export presets → drop files into `assets/images/`.

### AI Image Generation Prompts

**For DALL-E 3 / GPT-4o image generation:**

Concept A (Moon/Clock):
```
App icon design, 1024x1024, square with no rounded corners. 
A crescent moon in vivid purple (#7B61FF) with a subtle glow, 
positioned on a deep navy (#0A0E1A) background. Inside the 
crescent curve, two thin white clock hands suggest time. A small 
gold (#C8A84B) dot at 12 o'clock position acts as a star. 
Minimal, modern, professional. No text. Flat design with subtle 
gradients. Style: premium app icon for a health app.
```

Concept B (Waves):
```
App icon design, 1024x1024, square with no rounded corners. 
Two overlapping sine waves on deep navy (#0A0E1A) background. 
Top wave in purple (#7B61FF), bottom wave in warm gold (#C8A84B). 
They intersect in the center with a white glow point. Waves flow 
from lower-left to upper-right. Smooth, organic curves. Minimal, 
modern, scientific aesthetic. No text. Style: premium health 
tech app icon.
```

**For Midjourney v6:**
```
app icon, iOS style, flat design, crescent moon with clock hands 
inside, purple #7B61FF on dark navy #0A0E1A, gold accent dot, 
subtle glow, no text, no rounded corners, professional health app, 
minimal --ar 1:1 --s 250 --style raw
```

**Important:** AI-generated icons will need cleanup in Figma or a raster editor. They often add unwanted rounded corners, text, or extra elements. Generate several variations and composite the best parts.

### Free Icon Generation Tools

| Tool | Best For | Link |
|------|----------|------|
| **Figma** (free tier) | Full icon design with templates | figma.com |
| **Icon Kitchen** | Quick adaptive icon preview | icon.kitchen |
| **Canva** (free tier) | Simple icon layouts | canva.com |
| **Vectornator / Linearity Curve** | Free vector editor (Mac) | linearity.io |
| **GIMP** | Raster editing / final export | gimp.org |
| **Expo Icon Generator** | Resize 1024px master to all iOS/Android sizes | github.com/nicklockwood/iVersion (or use EAS) |

**Recommended $0 Workflow:**
1. Generate 5-10 concept variations using DALL-E/Midjourney with the prompts above
2. Pick the strongest direction
3. Recreate it cleanly in Figma using the Flarup template (AI output is a reference, not the final asset)
4. Export all sizes from the template
5. Drop into `assets/images/`, run `npx expo start` to verify on device
6. Submit to TestFlight

**Paid Option Worth Mentioning:** Fiverr app icon designers run $50-150 for a professional icon with all sizes. If the AI/Figma route produces something that feels 80% but not 100%, this is a fast path to polish.

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial creation. Colors extracted from src/theme/colors.ts. Brand language from docs/vision/MANIFESTO.md. Competitive analysis via web research (April 2026). Technical specs verified against current app.json config.
