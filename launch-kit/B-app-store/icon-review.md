# ShiftWell — App Icon Review & Recommendations

> Assessment of current icon asset and recommendations for App Store submission.

---

## Current Icon Status

**File:** `assets/images/icon.png`
**Size:** 1024 × 1024 px (correct for App Store)
**Format:** PNG, RGB, non-interlaced (correct — no alpha channel issues detected)

### CRITICAL FINDING: Current icon is the Expo default template

The current icon.png is the **Expo framework default icon** — a blue "A" shape with construction guide circles on a light background. This is NOT a ShiftWell icon. It is placeholder art that ships with every new Expo project.

**This must be replaced before App Store submission.** Apple will not reject it technically (it meets pixel specs), but it will:
- Destroy credibility instantly — users and reviewers will recognize it as a template
- Signal "unfinished app" to potential downloaders
- Make the app invisible in search results (no visual identity)
- Conflict with the dark-mode-first brand identity (current icon is light blue on white)

---

## App Store Icon Requirements

| Requirement | Status |
|-------------|--------|
| 1024 × 1024 px | ✅ Current file is correct size |
| PNG format | ✅ Correct |
| No transparency/alpha channel | ✅ RGB, no alpha |
| No rounded corners (Apple applies them) | ✅ Square file — Apple masks it |
| sRGB or Display P3 color space | ⚠️ Verify — should be sRGB for broadest compatibility |
| No text in icon | Recommendation — see below |
| Looks good at 16×16 px (Spotlight) | ❌ Current icon fails (indistinguishable at small size) |

---

## Icon Design Recommendations

### Brand Identity Alignment

The icon should reflect ShiftWell's core identity: **dark-mode-first, circadian science, shift work, calm authority.**

| Element | Recommendation | Rationale |
|---------|---------------|-----------|
| Background | Deep navy/dark (#0A0E1A to #141832 gradient) | Matches app splash screen, signals "night shift app," stands out in light-mode App Store browse |
| Primary shape | Crescent moon + clock/cycle motif | Instantly communicates "night + schedule" — the two core concepts |
| Color accent | Warm gold (#C8A84B) or purple-blue (#6366F1) | Gold = premium, trusted. Purple = circadian, sleep. Choose one. |
| Style | Clean, geometric, slightly rounded | Matches modern iOS icon trends (2025-26). Avoid photorealism. |
| Text | None | Apple discourages text in icons. "ShiftWell" appears below the icon on the Home Screen already. |

### Specific Design Concepts (ranked)

**Concept A — "Night Cycle" (Recommended)**
A stylized crescent moon formed by two overlapping circles (representing the Two-Process Model / circadian cycle). Dark navy background. Moon in warm gold or soft purple gradient. Clean, minimal, geometric.

- ✅ Reads at 16px (simple silhouette)
- ✅ Communicates "night + science" without text
- ✅ Unique in the Health & Fitness category
- ✅ Works on both light and dark home screens (dark bg provides its own contrast)

**Concept B — "Sleep Wave"**
An abstract sine wave (representing circadian rhythm) flowing across the icon. Dark background. Wave in gradient purple → gold. Subtle clock markings along the wave.

- ✅ Science-forward
- ⚠️ May be too abstract at small sizes
- ⚠️ Similar visual language to some meditation apps

**Concept C — "Shield + Moon"**
A shield shape (protection/safety) with a crescent moon inside. Dark background. Shield in muted blue, moon in gold.

- ✅ Communicates "protection" (safety angle for shift workers)
- ⚠️ Shield icons are overused in VPN/security apps
- ⚠️ Slightly complex for 16px rendering

### Competitor Icon Analysis

| App | Icon Style | Colors | What ShiftWell Can Learn |
|-----|-----------|--------|------------------------|
| Timeshifter | Abstract circular gradient | Purple/blue | Clean, recognizable. But generic — could be any wellness app |
| RISE | Sunrise gradient | Orange/yellow | Bright, optimistic. Wrong mood for night-shift audience |
| OffShift | Moon + horizontal lines | Dark blue/white | Closest to ShiftWell's target aesthetic. Need to differentiate |
| AutoSleep | Watch face | Blue/teal | Too literal (watch app) |
| SleepWatch | Moon with "ZZZ" | Purple/dark | Too playful for clinical audience |

**Key differentiator:** ShiftWell should be the ONLY icon in the shift-work space that uses **warm gold on dark navy**. Every competitor uses blue/purple/teal. Gold signals premium and creates instant visual recognition in search results.

---

## Production Path

| Option | Cost | Timeline | Quality |
|--------|------|----------|---------|
| AI-generated (Midjourney/DALL-E) + manual cleanup | $0-20 | 1-2 hours | Good for v1, may need refinement |
| Fiverr icon designer | $50-150 | 2-5 days | Professional, multiple revisions |
| 99designs contest | $299+ | 5-7 days | Multiple designers competing |
| Professional brand designer | $500-2,000 | 1-2 weeks | Best quality, full brand package |

**Recommendation for v1:** Fiverr ($50-100 range, look for designers with iOS app icon portfolios). Provide this spec doc as the brief. Get 3 concepts, choose one. Upgrade to a professional designer post-launch when revenue justifies it.

**Alternatively:** If you want to move fast, use Midjourney with a prompt like:
> "iOS app icon, dark navy background, minimalist crescent moon formed by two overlapping geometric circles, warm gold gradient accent, clean modern design, no text, 1024x1024, professional, Apple design guidelines"

Then clean up in Figma to ensure it meets Apple's corner radius and safe zone specs.

---

## Immediate Action Items

1. **BLOCKER:** Replace `assets/images/icon.png` with a custom ShiftWell icon before any TestFlight build
2. Also replace `assets/images/splash-icon.png` (likely also Expo default)
3. Update `assets/images/android-icon-foreground.png` and `android-icon-background.png`
4. Update `assets/images/favicon.png` for web builds
5. Test the final icon at these sizes: 1024px (App Store), 180px (Home Screen @3x), 120px (Home Screen @2x), 60px (Settings @3x), 40px (Spotlight @2x), 16px (smallest rendered size)
6. Verify no alpha channel in the final PNG (App Store Connect will reject transparent icons)

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: New file. Current icon identified as Expo default template — must be replaced. Three design concepts provided with competitive analysis. Production options from $0 (AI-generated) to $2,000 (professional). Warm gold on dark navy recommended as the differentiating color scheme.
