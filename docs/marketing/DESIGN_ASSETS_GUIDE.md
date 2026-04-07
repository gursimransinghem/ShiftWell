# ShiftWell — Design Assets Guide

> A step-by-step guide for creating professional design assets using AI tools and free resources.
> No design experience needed. Everything here can be completed in one afternoon.

---

## Table of Contents

1. [Brand Identity](#1-brand-identity)
2. [Logo Creation](#2-logo-creation)
3. [App Store Screenshots](#3-app-store-screenshots)
4. [Social Media Graphics](#4-social-media-graphics)
5. [Quick-Start Checklist](#5-quick-start-checklist)

---

## 1. Brand Identity

### Color Palette

| Role | Hex | Preview | Usage |
|------|-----|---------|-------|
| **Primary** | `#6C63FF` | Purple | Buttons, links, active states, brand accent |
| **Background** | `#0A0E1A` | Deep navy | App background, marketing backgrounds |
| **Cards** | `#1A1F35` | Dark blue-gray | Card surfaces, input fields, containers |
| **Success** | `#4CAF50` | Green | Sleep blocks, positive metrics, confirmations |
| **Alert** | `#FF6B6B` | Coral red | Warnings, missed sleep, overdue items |
| **Warning** | `#FFD93D` | Amber | Caffeine cutoffs, caution states |
| **Text** | `#EAEAEA` | Light gray | Body text, labels, descriptions |

#### Accent Colors for Marketing

These complement the core palette and add visual variety to social media and landing pages:

| Role | Hex | Usage |
|------|-----|-------|
| **Accent 1 — Teal** | `#36D6C3` | Charts, data visualizations, secondary CTAs |
| **Accent 2 — Soft Lavender** | `#A78BFA` | Gradients paired with primary purple, hover states |
| **Accent 3 — Warm Gold** | `#F5B041` | Premium badges, testimonial highlights, star ratings |

#### How to Use These Colors

- **Backgrounds:** Always start with `#0A0E1A`. Never use pure black (`#000000`) — it looks harsh.
- **Text on dark backgrounds:** Use `#EAEAEA` for body text, `#FFFFFF` for headlines.
- **Gradients:** Blend `#6C63FF` to `#A78BFA` for buttons and hero sections. Direction: left-to-right or top-to-bottom.
- **Contrast rule:** Never place `#6C63FF` text on `#0A0E1A` background — it fails accessibility. Use it for filled buttons, icons, and accents instead.

### Typography

#### In-App

- **iOS:** San Francisco (system default) — no setup needed, Expo uses it automatically.
- **Heading weight:** Bold (700) for screen titles, Semibold (600) for section headers.
- **Body weight:** Regular (400) for descriptions, Medium (500) for labels.

#### Marketing Materials (Free Google Fonts)

**Pairing 1 — Clean and Modern (Recommended)**
- Headlines: **Inter** (Bold 700) — [fonts.google.com/specimen/Inter](https://fonts.google.com/specimen/Inter)
- Body: **DM Sans** (Regular 400) — [fonts.google.com/specimen/DM+Sans](https://fonts.google.com/specimen/DM+Sans)
- Why: Inter is highly legible, neutral, and professional. DM Sans is warm and friendly. Together they feel medical-trustworthy without being cold.

**Pairing 2 — Bold and Techy**
- Headlines: **Space Grotesk** (Bold 700) — [fonts.google.com/specimen/Space+Grotesk](https://fonts.google.com/specimen/Space+Grotesk)
- Body: **Inter** (Regular 400)
- Why: Space Grotesk has a modern, slightly futuristic feel that works well for health-tech.

**Pairing 3 — Warm and Approachable**
- Headlines: **Plus Jakarta Sans** (Bold 700) — [fonts.google.com/specimen/Plus+Jakarta+Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
- Body: **Source Sans 3** (Regular 400) — [fonts.google.com/specimen/Source+Sans+3](https://fonts.google.com/specimen/Source+Sans+3)
- Why: Rounded letterforms feel approachable and human — good for marketing to exhausted shift workers who need reassurance, not another clinical tool.

**How to use in Canva:** When editing any Canva design, click on text, then click the font name dropdown. Search for any of these font names — they are all available in Canva for free.

### Brand Voice

| Do | Don't |
|----|-------|
| "Backed by circadian science research" | "AI-powered revolutionary breakthrough" |
| "Built by an ER physician who works nights" | "Created by medical experts" (vague) |
| "Helps you sleep better between shifts" | "Optimizes your circadian oscillation patterns" |
| "Your personalized sleep plan" | "Our proprietary algorithm" |
| "Join 50+ nurses already sleeping better" | "Download now!" (generic) |

**Core messaging pillars:**
1. **Credibility:** "Built by an ER doctor who works nights — because generic sleep advice doesn't cut it for shift workers."
2. **Simplicity:** "Import your schedule. Get your plan. Sleep better."
3. **Evidence:** "Every recommendation traces to published sleep research."

---

## 2. Logo Creation

### AI Logo Generator Prompts

Copy-paste these prompts exactly. Each is optimized for its specific tool.

---

**Prompt 1 — Midjourney: Minimal App Icon**

```
Minimal app icon for a sleep and circadian rhythm app called ShiftWell. Simple geometric design combining a crescent moon and a subtle clock element. Primary color #6C63FF purple on a #0A0E1A deep navy background. Clean flat design, no gradients, no text, rounded corners suitable for iOS app icon. Professional medical app aesthetic, calm and trustworthy. --ar 1:1 --s 250 --v 6.1
```

**Prompt 2 — Midjourney: Medical/Health Brand**

```
Professional healthcare brand logo mark for a shift worker sleep optimization app. Abstract design merging a wave pattern (representing circadian rhythm) with a shield or cross element (representing medical credibility). Color palette: #6C63FF purple and #36D6C3 teal on #0A0E1A dark background. Minimal, modern, Silicon Valley health-tech startup aesthetic. No text, no clip art, no generic heartbeat lines. --ar 1:1 --s 200 --v 6.1
```

**Prompt 3 — DALL-E (ChatGPT): Clean Modern Logo**

```
Design a clean, modern logo mark for "ShiftWell," a circadian rhythm optimization app for shift workers. The logo should be a simple, memorable symbol that subtly combines a crescent moon shape with a gentle wave or arc representing a circadian rhythm cycle. Use #6C63FF purple as the primary color on a #0A0E1A deep navy background. Style: flat design, minimal, professional, suitable for a medical/health app. Mood: calm, trustworthy, scientific. Avoid: clip art, busy details, generic health symbols like hearts or stethoscopes, stock icon look. The mark should work at small sizes (32px) and large sizes (1024px).
```

**Prompt 4 — DALL-E (ChatGPT): Icon-Focused Design**

```
Create a simple app icon for a sleep health app. The icon should feature an abstract representation of a clock face where the hour markers transition from a sun symbol to a moon symbol, suggesting the shift from day to night. Rendered in #6C63FF purple with subtle #A78BFA lavender accents on a #0A0E1A dark background. Flat vector style, ultra-minimal, no text, no gradients. Should be instantly recognizable at 60x60 pixels on a phone screen. Professional medical technology aesthetic.
```

**Prompt 5 — Ideogram: Logo with "ShiftWell" Text**

```
A professional logo for "ShiftWell" — a health app for shift workers. The word "ShiftWell" in clean, modern sans-serif typography. The letters "ft" in "Shift" transition into a subtle crescent moon shape. Color: #6C63FF purple text on #0A0E1A dark navy background. Minimal, elegant, medical-tech startup feel. No clip art, no icons above the text, no tagline. The typography IS the logo. Style: flat, vector, professional.
```

---

### Post-Generation Refinement

After generating options with AI, you will need to clean them up:

1. **Pick your favorite** from the AI outputs.
2. **Remove the background** using [remove.bg](https://www.remove.bg/) (free, instant).
3. **Resize to exact specs** using [Squoosh](https://squoosh.app/) (free, by Google).
4. **Touch up colors** if the AI drifted from your palette — use Canva's color picker to match `#6C63FF` exactly.

### Free Logo Tools (If AI Generation Is Not Enough)

**Canva (Recommended — Free Tier)**

1. Go to [canva.com](https://www.canva.com/) and sign up (free).
2. Click "Create a design" and choose "Logo" (500x500).
3. In the left panel, click "Elements" and search for "crescent moon" or "wave."
4. Pick a simple, clean icon element. Drag it to the canvas.
5. Click the element, then click the color swatch. Enter `#6C63FF`.
6. Click "Text" in the left panel. Add "ShiftWell" in Inter Bold.
7. Set text color to `#EAEAEA`.
8. Set background color to `#0A0E1A`.
9. Download as PNG (transparent background).
10. Use the "Resize" feature (Canva Pro, or use Squoosh instead) to export at all needed sizes.

**Looka** — [looka.com](https://www.looka.com/)
- AI-powered logo generator. Enter "ShiftWell," select healthcare/wellness industry, pick purple as your color, choose minimal styles. Free to browse designs; $20 one-time to download files.

**Hatchful by Shopify** — [hatchful.shopify.com](https://hatchful.shopify.com/)
- Completely free. Select "Health & Wellness," pick a style, enter "ShiftWell." Generates logo packages with social media sizes included. Quality is decent for MVP.

### Logo Specs Needed

| Asset | Size | Format | Notes |
|-------|------|--------|-------|
| **App icon** | 1024x1024 px | PNG | No transparency. No rounded corners (Apple adds them automatically). Fill the entire square. |
| **Social media profile** | 400x400 px | PNG | Works for Twitter, Instagram, LinkedIn, Product Hunt. Transparent or branded background. |
| **Wide logo (landing page)** | 800x200 px | PNG | Transparent background. Logo mark + "ShiftWell" text side by side. |
| **Favicon** | 32x32 px and 16x16 px | PNG or ICO | For your landing page browser tab. Use [favicon.io](https://favicon.io/) to convert from your 1024x1024 icon. |

---

## 3. App Store Screenshots

### Screenshot Requirements

Apple requires screenshots for each device size you support. Since ShiftWell is iPhone-only (no iPad), you need:

| Display | Resolution | Required For |
|---------|-----------|--------------|
| **6.7" display** | 1290 x 2796 px | iPhone 15 Pro Max, 14 Pro Max |
| **6.5" display** | 1242 x 2688 px | iPhone 11 Pro Max, XS Max |

- **Minimum:** 3 screenshots per device size.
- **Recommended:** 5-8 screenshots. The first 3 are visible without scrolling — make them count.
- **Format:** PNG or JPEG, RGB color space, no alpha/transparency.

### Screenshot Concepts (5 Screens)

Design each screenshot with a **headline at the top** (large, bold text summarizing the benefit), the **app screen in the center** (in a device mockup), and a **solid or gradient background** in brand colors.

---

**Screen 1 — Hero Shot**
- Headline: **"Your Shift. Your Plan. Your Sleep."**
- Subtext: "Built by an ER physician for shift workers"
- App screen shown: The Today screen with a sleep timeline, countdown cards ("Sleep in 2h 15m"), and an insight banner
- Background: Gradient from `#0A0E1A` to `#1A1F35`
- Goal: Immediately communicate what the app does and who it is for

**Screen 2 — Schedule Import**
- Headline: **"Import Your Shifts in Seconds"**
- Subtext: "Works with any .ics calendar file"
- App screen shown: The 3-step import flow — file picker with a calendar file selected, shift review list with checkboxes
- Background: Solid `#0A0E1A`
- Goal: Show how easy it is to get started — no manual entry needed

**Screen 3 — Personalized Sleep Plan**
- Headline: **"Personalized Sleep Windows"**
- Subtext: "Optimized for YOUR schedule, not generic advice"
- App screen shown: The calendar view with color-coded blocks — purple for sleep, green for naps, amber for caffeine cutoff, teal for light exposure
- Background: Gradient from `#0A0E1A` to deep purple (`#1A1040`)
- Goal: Show the core value proposition — a visual, personalized plan

**Screen 4 — Evidence-Based**
- Headline: **"Evidence-Based Recommendations"**
- Subtext: "Every tip backed by published sleep research"
- App screen shown: A sleep tip card with a scientific reference, plus the daily insight banner
- Background: Solid `#0A0E1A`
- Goal: Differentiate from generic sleep apps — this is science, not guesswork

**Screen 5 — Calendar Export**
- Headline: **"Sync to Your Calendar"**
- Subtext: "Sleep plan exports to Apple Calendar, Google Calendar, or Outlook"
- App screen shown: The export flow — settings screen with export button, then the iOS share sheet showing calendar apps
- Background: Solid `#0A0E1A`
- Goal: Show the output — your plan lives in the tools you already use

### Tools for Creating Screenshots

**Option A — Canva (Free, Easiest, Recommended)**

Step-by-step:

1. Go to [canva.com](https://www.canva.com/). Click "Create a design." Choose "Custom size." Enter **1290 x 2796** pixels.
2. Set the background color to `#0A0E1A`.
3. **Add the headline:** Click "Text," choose a heading. Type your headline (e.g., "Your Shift. Your Plan. Your Sleep."). Set font to Inter Bold, size 96, color `#FFFFFF`. Center it near the top with about 200px padding from the top edge.
4. **Add the subtext:** Add another text element below. Font: DM Sans Regular, size 48, color `#EAEAEA`. Center it below the headline.
5. **Add the device mockup:**
   - Take a screenshot of the relevant screen on your iPhone (or use the iOS Simulator: `Cmd+S` to save a screenshot).
   - In Canva, click "Elements," search for "iPhone mockup" or "phone frame."
   - Drag a mockup onto the canvas. Position it center-bottom.
   - Double-click the mockup and upload your screenshot to fill it.
6. **Optional accent:** Add a subtle purple glow behind the phone. Click "Elements," search for "blur" or "glow." Place a `#6C63FF` circle at 20% opacity behind the device.
7. **Duplicate the page** (right-click the page thumbnail on the left, "Duplicate page") to create screens 2-5. Just swap the headline text and phone screenshot for each.
8. **Download:** Click "Share" then "Download." Choose PNG. Download all pages. Rename them `screenshot_01.png` through `screenshot_05.png`.
9. **Repeat for 6.5" size:** Create a new design at 1242 x 2688 px and repeat, or resize your existing designs.

**Option B — Rotato (Free Trial, Best 3D Mockups)**

- [rotato.app](https://rotato.app/) — Mac only.
- Drag your screenshots onto 3D iPhone models. Choose angles, add backgrounds.
- Free trial gives you 5 exports — enough for your initial set.
- Best for premium-looking, angled device shots.

**Option C — Screenshots.pro**

- [screenshots.pro](https://screenshots.pro/) — Browser-based.
- Specifically designed for App Store screenshots.
- Upload screenshots, pick device frames, add text overlays.
- Free tier has watermarks; paid removes them ($9 one-time).

**Option D — LaunchMatic (AI-Generated)**

- [launchmatic.app](https://launchmatic.app/) — Generates App Store screenshots using AI.
- Upload your app screenshots and describe your app. AI creates professional layouts.
- Useful if you want polished results fast without design decisions.

---

## 4. Social Media Graphics

### Template Sizes

| Platform | Asset | Size | Notes |
|----------|-------|------|-------|
| **Twitter/X** | Header/banner | 1500 x 500 px | Displays behind your profile photo |
| **Instagram** | Feed post | 1080 x 1080 px | Square format |
| **Instagram** | Story | 1080 x 1920 px | Full-screen vertical |
| **LinkedIn** | Banner | 1584 x 396 px | Wide and short |
| **Product Hunt** | Thumbnail | 240 x 240 px | Small — keep it simple, just the logo |

### Canva Template Instructions

#### Twitter/X Header (1500 x 500 px)

1. Canva: "Create a design" then "Custom size" then 1500 x 500.
2. Background: `#0A0E1A`.
3. Left side: Add your ShiftWell logo (wide version). Resize to about 300px wide.
4. Center: Add text — "Sleep better between shifts." Font: Inter Bold, 48px, `#FFFFFF`.
5. Right side: Add a subtle decorative element — search "wave line" in Elements, color it `#6C63FF`, set opacity to 40%.
6. Optional: Add a thin gradient bar across the bottom in `#6C63FF` to `#A78BFA` (3px tall).
7. Download as PNG.

#### Instagram Post (1080 x 1080 px)

1. Canva: Custom size 1080 x 1080.
2. Background: `#0A0E1A`.
3. Top 40%: Large headline text. Example: "Night shift tonight?" Font: Inter Bold, 72px, `#FFFFFF`.
4. Bottom 60%: Phone mockup showing the Today screen, slightly angled.
5. Bottom-left corner: ShiftWell logo, small (about 120px wide).
6. Add a thin `#6C63FF` line (2px) as a divider between the text and phone areas.
7. Download as PNG.

#### Instagram Story (1080 x 1920 px)

1. Canva: Custom size 1080 x 1920.
2. Background: Gradient from `#0A0E1A` (top) to `#1A1040` (bottom).
3. Top quarter: "Did you know?" in DM Sans Regular, 36px, `#A78BFA`.
4. Center: A stat or fact in large text. Example: "Shift workers get 2-3 fewer hours of sleep per day" in Inter Bold, 56px, `#FFFFFF`.
5. Below: "ShiftWell helps you reclaim your sleep." in DM Sans Regular, 36px, `#EAEAEA`.
6. Bottom: "Link in bio" with a subtle upward arrow icon. Color: `#6C63FF`.
7. Download as PNG.

#### LinkedIn Banner (1584 x 396 px)

1. Canva: Custom size 1584 x 396.
2. Background: `#0A0E1A`.
3. Left third: ShiftWell logo (wide version).
4. Center: Tagline — "Circadian-optimized sleep plans for shift workers" in Inter Regular, 32px, `#EAEAEA`.
5. Right third: "Built by an ER physician" in DM Sans Medium, 24px, `#A78BFA`.
6. Add a thin horizontal line in `#6C63FF` at 30% opacity spanning the full width, positioned at the bottom.
7. Download as PNG.

#### Product Hunt Thumbnail (240 x 240 px)

1. Canva: Custom size 240 x 240.
2. Background: `#6C63FF` (solid purple — stands out in Product Hunt's feed).
3. Center: Your logo icon in `#FFFFFF` (white). Resize to about 160x160.
4. No text — it is too small to be legible at this size.
5. Download as PNG.

### AI Image Generation Prompts for Marketing

Use these in Midjourney, DALL-E, or Stable Diffusion to create imagery for social media posts, landing pages, and blog headers.

---

**Prompt 1 — "Shift Worker Peacefully Sleeping" (Social Posts)**

```
A night shift nurse peacefully sleeping in a darkened bedroom during the daytime. Blackout curtains block warm sunlight at the edges. Soft purple ambient light from a bedside device. Photorealistic, warm tones, calm atmosphere. The scene feels restful and hopeful, not clinical. No visible brand logos. Shot on 35mm lens, shallow depth of field. --ar 1:1 --v 6.1
```
Use for: Instagram posts, "Why ShiftWell?" content, testimonial backgrounds.

---

**Prompt 2 — "Phone Showing Sleep Schedule App" (Feature Highlights)**

```
Close-up of a person's hand holding an iPhone showing a dark-themed health app with a colorful sleep schedule timeline. Purple, green, and teal colored time blocks on a dark navy interface. The phone screen is the focal point. Background is a softly blurred modern apartment at dusk. Photorealistic, tech product photography style. Clean, minimal, premium feel. --ar 4:5 --v 6.1
```
Use for: Feature highlight posts, "How it works" content, landing page hero images.

---

**Prompt 3 — "Hospital Corridor at Night, Calm" (Mood/Atmosphere)**

```
A modern hospital corridor at night, softly lit with cool blue and purple ambient lighting. The hallway is quiet and calm — no people visible. Reflective floor tiles. A window at the end shows a dark sky with a crescent moon. Cinematic, atmospheric, moody. Conveys the quiet intensity of night shift work. No text, no logos. --ar 16:9 --v 6.1
```
Use for: Twitter header background, blog post headers, "About" page imagery.

---

**Prompt 4 — "Before/After Sleep Quality" (Testimonials)**

```
Split image concept. Left side: a tired, fatigued person in scrubs holding coffee, harsh fluorescent lighting, gray/desaturated tones. Right side: the same person well-rested, natural morning light, warm and vibrant tones, genuine smile. Professional portrait photography, editorial style. Subtle and tasteful, not exaggerated or stock-photo-looking. --ar 1:1 --v 6.1
```
Use for: Testimonial cards, "Results" section, before/after social media posts.

---

**Prompt 5 — "Doctor Using Phone App" (Credibility)**

```
An emergency physician in navy scrubs checking a health app on their iPhone during a quiet moment in a modern emergency department. The phone screen glows with a purple-themed interface. Shot from over the shoulder, focusing on the phone. Background is softly blurred medical environment. Professional, authentic, not posed or stock-photo-feeling. Natural lighting. --ar 4:5 --v 6.1
```
Use for: "Built by a physician" content, credibility messaging, App Store promotional images.

---

### Tips for Using AI-Generated Marketing Images

- **Run each prompt 3-4 times** and pick the best output. AI image generation is variable.
- **Avoid using AI faces** in final marketing materials if possible — they can look uncanny and raise trust issues. Crop to show hands, silhouettes, or over-the-shoulder angles instead.
- **Add your brand overlay in Canva:** Open the AI image in Canva, place your logo in a corner, add a color overlay at 10-15% opacity in `#6C63FF` to tie it to your brand palette.
- **Check licensing:** Midjourney and DALL-E both allow commercial use of generated images. Keep your generation history as a record.

---

## 5. Quick-Start Checklist

The minimum viable design assets to launch, in priority order. Estimated times assume using AI tools and Canva.

| # | Asset | Tool | Time | Status |
|---|-------|------|------|--------|
| 1 | **App icon (1024x1024)** | DALL-E or Midjourney + Squoosh | 30 min | Required for App Store |
| 2 | **3 App Store screenshots (6.7")** | Canva + iPhone screenshots | 45 min | Required for App Store |
| 3 | **3 App Store screenshots (6.5")** | Resize from 6.7" in Canva | 15 min | Required for App Store |
| 4 | **Social media profile pic (400x400)** | Crop from app icon | 5 min | Needed for any social presence |
| 5 | **Favicon (32x32 + 16x16)** | favicon.io (auto-generate from icon) | 5 min | Needed for landing page |
| 6 | **Twitter/X header (1500x500)** | Canva | 15 min | Needed if promoting on Twitter |
| 7 | **2 more App Store screenshots** | Canva (duplicate and edit) | 20 min | Recommended (5 total) |
| 8 | **Wide logo for landing page (800x200)** | Canva | 15 min | Needed for landing page |
| 9 | **3 Instagram posts** | Canva + AI images | 30 min | Nice to have for launch |
| 10 | **LinkedIn banner** | Canva | 10 min | Nice to have for personal profile |
| 11 | **Product Hunt thumbnail (240x240)** | Canva (crop from icon) | 5 min | Needed only for Product Hunt launch |

**Total time for items 1-6 (launch essentials): ~2 hours**
**Total time for all 11 items: ~3.5 hours**

### Recommended Order of Operations

1. **Generate the logo first** (items 1, 4, 5, 11 all derive from it). Run 3-4 AI prompts, pick the best, clean up in Canva/Squoosh.
2. **Take app screenshots** on your iPhone or iOS Simulator. You need these before you can make App Store screenshots.
3. **Build App Store screenshots** in Canva (items 2, 3, 7). Create one template, duplicate it for each screen.
4. **Create the wide logo** (item 8) by placing your icon + "ShiftWell" text in a 800x200 Canva canvas.
5. **Build social headers** (items 6, 10) — these are simple text + logo layouts.
6. **Generate marketing images** with AI prompts and assemble Instagram posts (item 9) last — these are nice-to-have, not blockers.

### File Organization

Save all final assets in your project:

```
nightshift/
  assets/
    icon/
      app-icon-1024.png       (App Store submission)
    screenshots/
      6.7/
        screenshot_01.png      (Hero shot)
        screenshot_02.png      (Schedule import)
        screenshot_03.png      (Sleep plan)
        screenshot_04.png      (Evidence-based)
        screenshot_05.png      (Calendar export)
      6.5/
        screenshot_01.png
        screenshot_02.png
        screenshot_03.png
        screenshot_04.png
        screenshot_05.png
    social/
      profile-400.png          (Social media profile pic)
      twitter-header.png
      linkedin-banner.png
      producthunt-thumb.png
    web/
      logo-wide-800x200.png    (Landing page)
      favicon-32.png
      favicon-16.png
```

---

*Last updated: 2026-03-14*

---
Created: 2026-03-24
Last Reviewed: 2026-03-24
Last Edited: 2026-03-24
Review Notes: Freshness footer added during comprehensive audit.
