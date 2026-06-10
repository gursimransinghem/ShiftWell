# ShiftWell — App Store Screenshot Specifications v2

> Submission-ready screenshot specs for iPhone 6.7" (required) + iPad (optional).
> Optimized for shift worker conversion with 6-frame narrative arc.
> Apple indexes screenshot caption text for search ranking (June 2025 update) — every caption contains target keywords.

---

## Device Specifications

### iPhone (Required)

| Device Class | Resolution | Display | Status |
|-------------|-----------|---------|--------|
| iPhone 16 Pro Max | 1320 x 2868 px | 6.7" Super Retina XDR | **Master** — design here first |
| iPhone 16 Pro | 1206 x 2622 px | 6.1" | Scale from master |
| iPhone 8 Plus | 1242 x 2208 px | 5.5" | Scale from master |

### iPad (Optional — Recommended)

| Device Class | Resolution | Display |
|-------------|-----------|---------|
| iPad Pro 13" (M4) | 2064 x 2752 px | 13" Liquid Retina XDR |
| iPad Pro 11" (M4) | 1668 x 2388 px | 11" |
| iPad 10th gen | 1640 x 2360 px | 10.9" |

**iPad note:** Use same 6-frame narrative. Adjust device frame to iPad. Expand UI to show more timeline/calendar content in the extra space — this sells the "planning dashboard" angle harder.

---

## Global Design Language

All screenshots share these visual rules:

| Element | Specification |
|---------|--------------|
| **Background gradient** | `#0A0E1A` → `#1A1040` (night sky, matches app splash) |
| **Caption font** | SF Pro Display Bold, 56pt minimum (6.7"), `#FFFFFF` |
| **Caption position** | Top 20% of frame, left-aligned, 48px left padding |
| **Sub-caption font** | SF Pro Display Regular, 32pt, `#9CA3AF` (text.secondary) |
| **Device frame** | iPhone 16 Pro Max, Space Black titanium, 5deg right tilt |
| **Device placement** | Center-bottom, top 30% of phone visible above fold |
| **App UI** | Real screenshots from app in dark mode, populated with realistic shift worker data |
| **Accent highlights** | Gold `#C8A84B` for badges/callouts, Purple `#7B61FF` for interactive elements |
| **Caption max length** | 30 characters / 6 words (exception: frame 1 hero can be 8 words) |
| **Background accents** | Subtle radial glow behind device using `rgba(123,97,255,0.08)` — adds depth without distraction |

### Color Reference (from Design System)

| Role | Hex | Usage in Screenshots |
|------|-----|---------------------|
| Background primary | `#080B14` | App UI background |
| Background surface | `#131726` | Cards, modals in app UI |
| Accent purple | `#7B61FF` | Sleep blocks, buttons, progress rings |
| Accent gold | `#C8A84B` | Score highlights, premium badges, CTA callouts |
| Block sleep | `#7B61FF` | Sleep window blocks on calendar |
| Block nap | `#B794F6` | Nap blocks (lighter purple) |
| Block shift night | `#FF9F43` | Night shift blocks (orange) |
| Block shift day | `#4A90D9` | Day shift blocks (blue) |
| Block meal | `#34D399` | Meal timing windows (green) |
| Block caffeine cutoff | `#FF6B6B` | Caffeine cutoff markers (red) |
| Semantic success | `#34D399` | Positive outcomes, improvement indicators |
| Text primary | `#FFFFFF` | Headlines, primary body |
| Text secondary | `#9CA3AF` | Sub-captions, supporting text |

---

## The 6-Frame Narrative

The carousel tells a story in 3 seconds of scrolling: **problem → solution → proof**.

Frames 1-2: "This app understands my life" (identity + science)
Frames 3-4: "It does something no other app does" (personalization + gamification)
Frames 5-6: "It actually works" (integration + results)

---

## Screenshot 1 — Sleep Schedule with Shift Overlay

**The hook. Must convert in 1.5 seconds at App Store browse size.**

### Caption
```
Your Shift Sleep Plan
```
_(20 chars)_

### Sub-caption
```
Built by an ER doctor who works nights
```

### Which Screen to Capture
**Today view** — the app's home dashboard in its fully populated state.

### Visual Composition
- Device frame: iPhone 16 Pro Max, Space Black, straight-on (0deg tilt for hero)
- Background: Night sky gradient `#0A0E1A` → `#1A1040` with a single soft radial glow of `rgba(123,97,255,0.12)` behind the phone
- Caption: top-left, 56pt SF Pro Display Bold, white
- Sub-caption: directly below, 32pt, `#9CA3AF`
- Gold badge bottom-right of device frame: "Science-Backed" in `#C8A84B` text on `rgba(200,168,75,0.15)` pill background
- Phone occupies bottom 70% of frame, centered

### Key Elements Visible on Screen
- **Status pill** at top: "Recovery" in green (`#34D399`)
- **Recovery Score ring**: 82/100, purple ring with gold score number
- **Countdown row**: "Night shift in 9h 23m" with orange shift icon
- **Timeline preview**: Sleep block 08:00–15:30 (purple), Pre-shift nap 19:00–19:45 (light purple), Caffeine cutoff badge "Last caffeine by 3:00 AM" (red)
- **Dark mode UI** with the deep navy background

### Why This Screenshot
Immediate identity match. A shift worker scrolling the App Store sees their exact life: night shifts, weird sleep windows, countdowns. The recovery score creates a "I want to know mine" impulse. "Built by an ER doctor" is the #1 trust differentiator — no competitor has a physician founder. This frame alone should explain what the app does.

### Keywords Indexed
shift, sleep, plan, ER, doctor, nights

---

## Screenshot 2 — Circadian Rhythm Visualization

**Science credibility. Separates ShiftWell from generic sleep trackers.**

### Caption
```
Circadian Science, Not Guesswork
```
_(30 chars)_

### Sub-caption
```
Based on 15+ peer-reviewed studies
```

### Which Screen to Capture
**Circadian detail view** — the screen showing the user's circadian phase, sleep pressure curve, and adaptive recommendations.

### Visual Composition
- Device frame: 5deg right tilt
- Background: Same night sky gradient, subtle gold radial glow `rgba(200,168,75,0.06)` at top-right corner
- Caption: top-left, standard positioning
- Small citation badge below sub-caption: "Borbely 1982 · AASM 2023 · Harvard" in `#6B7280` text, 24pt

### Key Elements Visible on Screen
- **Circadian phase visualization**: Circular or arc diagram showing the user's current position in their circadian cycle, rendered in purple-to-gold gradient
- **Sleep pressure curve**: Visual showing rising sleep pressure with the optimal sleep window highlighted
- **Adaptive insight card**: "Bedtime moved to 08:30 — 3-night stretch starts Thursday" with a "Why?" expand indicator
- **Sleep debt gauge**: "1.2 hrs" with a subtle progress bar
- **Citation footer**: Small text referencing the Two-Process Model

### Why This Screenshot
This is what makes a nurse or doctor stop scrolling. Generic sleep apps say "go to bed at 10 PM." ShiftWell shows the math. The circadian visualization communicates "this app is built on real science" in a single glance. The adaptive explanation ("bedtime moved because...") shows the algorithm actually thinks about your schedule, not just your sleep.

### Keywords Indexed
circadian, science, guesswork, peer-reviewed, studies

---

## Screenshot 3 — AI Sleep Coach Conversation

**Personalization. Shows the app adapts to your specific situation.**

### Caption
```
Your Personal Sleep Coach
```
_(25 chars)_

### Sub-caption
```
Plans adapt to your chronotype
```

### Which Screen to Capture
**Chronotype result + personalized recommendation screen** — showing the quiz outcome and how the plan adjusted.

### Visual Composition
- Device frame: 5deg left tilt (alternating direction creates visual rhythm in carousel)
- Background: Night sky gradient with subtle purple glow at center
- Caption: top-left, standard positioning
- Callout arrow (thin, gold `#C8A84B`, 2px) pointing from sub-caption to the chronotype result on screen

### Key Elements Visible on Screen
- **Chronotype result card**: "Moderate Evening Type" with an icon/graphic of the user's natural sleep window
- **Comparison visual**: Side-by-side or overlay showing "Your natural window" vs. "Your shift schedule" — the gap between them is the problem ShiftWell solves
- **Adjustment confirmation**: "Your plan has been adjusted" with checkmark in `#34D399`
- **Personalized recommendation preview**: "Anchor sleep: 08:00–14:30 · Pre-shift nap: 19:00–19:45" showing the plan adapted to their chronotype
- **"Retake Quiz" option** visible (signals this isn't a one-time thing)

### Why This Screenshot
Personalization converts. When a user sees that the app asks about their biology and adjusts accordingly, it signals sophistication beyond a simple schedule calculator. The chronotype result creates curiosity ("what's MY type?") — a proven conversion driver for health apps. The before/after of natural window vs. shift schedule makes the problem visceral and the solution obvious.

### Keywords Indexed
personal, sleep, coach, chronotype, plans

---

## Screenshot 4 — Sleep Score Dashboard

**Gamification and tracking. Creates the "I want to improve my number" loop.**

### Caption
```
Track Your Sleep Recovery
```
_(24 chars)_

### Sub-caption
```
See real progress over time
```

### Which Screen to Capture
**Recovery/outcomes dashboard** — the screen showing score trends, plan adherence, and week-over-week improvement.

### Visual Composition
- Device frame: straight-on (0deg), slightly smaller than frame 1 to show more background
- Background: Night sky gradient with a subtle ascending line motif (abstract, decorative) echoing the trend chart — in `rgba(52,211,153,0.06)` (success green, very faint)
- Caption: top-left, standard positioning
- Metric callout: floating pill to the right of the device showing "+12%" in `#34D399` with a small up-arrow

### Key Elements Visible on Screen
- **Recovery Score**: Large hero number "76" with `/100` suffix, purple progress ring
- **7-day trend chart**: Ascending line from ~60 to 82, rendered in `#34D399` (success green) with the area below the line filled at 10% opacity
- **Plan adherence stat**: "85%" with a label "Plan Adherence" and a mini bar chart
- **Week-over-week delta**: "+12% from last week" in green text
- **Streak indicator**: "5-day streak" or similar engagement metric
- **Section below**: Individual night scores as small cards/dots, most recent highlighted

### Why This Screenshot
Gamification drives retention and word-of-mouth. Shift workers share scores with coworkers ("I got an 82 this week"). The ascending trend line is visual proof the app works. Plan adherence shows it's not just passive tracking — the app gives you a plan and measures how well you followed it. This is the screenshot that converts someone from "interesting" to "I'll try it."

### Keywords Indexed
track, sleep, recovery, progress, time

---

## Screenshot 5 — Calendar Integration

**The killer differentiator. No competitor does this.**

### Caption
```
Sleep Plan on Your Calendar
```
_(26 chars)_

### Sub-caption
```
Real events, not just suggestions
```

### Which Screen to Capture
**Calendar/schedule view** — the weekly planner showing color-coded blocks for shifts, sleep, naps, meals, and caffeine cutoffs, with the "Export to Calendar" action visible.

### Visual Composition
- Device frame: 5deg right tilt
- Background: Night sky gradient with faint calendar grid lines in `rgba(255,255,255,0.02)` as abstract background texture
- Caption: top-left, standard positioning
- Floating badge below device: "Works with Apple Calendar & Google Calendar" in `#9CA3AF`, 24pt, with small Apple Calendar and Google Calendar icons

### Key Elements Visible on Screen
- **Weekly calendar grid**: 3-4 days visible, packed with color-coded blocks:
  - Purple (`#7B61FF`): Main sleep windows (e.g., 08:00–15:00)
  - Light purple (`#B794F6`): Nap blocks (e.g., 19:00–19:45)
  - Orange (`#FF9F43`): Night shift blocks (e.g., 19:00–07:00)
  - Blue (`#4A90D9`): Day shift blocks
  - Green (`#34D399`): Meal windows
  - Red (`#FF6B6B`): Caffeine cutoff markers
- **Export CTA button**: "Add to Apple Calendar" in purple (`#7B61FF`) — prominent, clearly tappable
- **Legend strip**: Small color key at bottom of calendar view
- **At least one "transition day"** visible (day off between night and day shifts) showing the recovery sleep strategy

### Why This Screenshot
This is ShiftWell's biggest differentiator and it needs its own frame. Every competitor shows you when to sleep as an overlay or recommendation. ShiftWell writes actual calendar events — sleep blocks, naps, meal windows — directly to Apple Calendar or Google Calendar. One tap. The color-coded weekly view is visually striking and immediately communicates "this app plans your entire week." The transition day is critical: it shows the algorithm handles the hardest part of shift work (switching between day and night).

### Keywords Indexed
sleep, plan, calendar, events, suggestions

---

## Screenshot 6 — Before/After Sleep Improvement

**Social proof and results. The closer that pushes "Get" button.**

### Caption
```
Better Sleep Starts Tonight
```
_(27 chars)_

### Sub-caption
```
Join 700M shift workers who deserve rest
```

### Which Screen to Capture
**Outcomes/comparison view** — showing measurable improvement data plus the occupation selector that signals "built for you."

### Visual Composition
- Device frame: straight-on (0deg), centered
- Background: Night sky gradient transitioning to a slightly warmer tone at the bottom (`#1A1040` → `#1A1520`) — subtle warmth signals "resolution" in the narrative arc
- Caption: top-left, standard positioning
- Testimonial overlay: Floating card above-right of device, frosted glass style (`rgba(255,255,255,0.08)` background, 1px `#1F2937` border), containing a pull quote

### Key Elements Visible on Screen
- **Before/after comparison card**:
  - "Before ShiftWell": Sleep duration 5.2h, fragmented, no plan adherence
  - "After 2 weeks": Sleep duration 7.1h, consolidated, 85% plan adherence
  - Visual: Two mini bar charts or ring comparisons side by side
  - Delta callout: "+1.9 hours per night" in `#34D399`
- **Occupation tags**: Visible row showing "Healthcare · Emergency · Transportation · Manufacturing" — signals the app serves all shift workers, not just nurses
- **CTA area**: "Start Free — No Account Needed" or similar low-friction messaging visible at bottom of screen
- **Privacy badge**: Small shield icon with "All data on-device" text

### Testimonial Overlay Content
```
"Finally, an app that gets my schedule."
— ICU Nurse, night shift
```
Rendered in italic 28pt SF Pro Display, `#FFFFFF`, with attribution in `#9CA3AF`.

### Why This Screenshot
The closing frame must answer "does this actually work?" with data. The before/after comparison is the most persuasive format for health apps — it's concrete, measurable, and personal. The occupation tags reinforce "this was built for people like me." The testimonial adds social proof. The "No Account Needed" messaging removes the last friction barrier. This is the frame someone sees right before tapping "Get."

### Keywords Indexed
better, sleep, tonight, shift, workers, rest

---

## Screenshot Caption Keyword Coverage

| Keyword | Frames | Also Indexed Via |
|---------|--------|-----------------|
| sleep | 1, 2, 3, 4, 5, 6 | App subtitle |
| shift | 1, 6 | App name |
| plan | 1, 3, 5 | Keywords field |
| calendar | 5 | Keywords field |
| circadian | 2 | Keywords field |
| science | 2 | — |
| coach | 3 | — |
| chronotype | 3 | — |
| recovery | 4 | App subtitle |
| track | 4 | — |
| progress | 4 | — |
| doctor/ER | 1 | — |
| tonight | 6 | — |
| workers | 6 | — |
| personal | 3 | — |
| guesswork | 2 | — |

**Net new keywords from captions** (not in name/subtitle/keyword field): science, coach, chronotype, guesswork, personal, track, progress, tonight, better, peer-reviewed, events, suggestions.

---

## iPad Screenshot Adaptations

Use the same 6-frame narrative. Adjust these elements for iPad:

| Element | iPhone | iPad |
|---------|--------|------|
| Device frame | iPhone 16 Pro Max, portrait | iPad Pro 13", portrait |
| Caption font size | 56pt | 64pt |
| Sub-caption font size | 32pt | 36pt |
| App UI | Standard phone layout | Expanded layout — wider cards, more calendar columns visible, larger circadian visualization |
| Calendar view (Frame 5) | 3-4 days visible | Full 7-day week visible — this is the iPad's strongest selling frame |
| Device placement | Bottom 70%, centered | Bottom 65%, centered (iPad frame is wider, needs more horizontal room) |

### iPad-Specific Opportunities
- **Frame 5 (Calendar)**: Show a full 7-day week with all block types visible. This is dramatically more impactful on iPad — the "planning dashboard" feeling is strongest here.
- **Frame 4 (Score Dashboard)**: Show the trend chart at larger scale with more data points. Include a 30-day view instead of 7-day.
- **Frame 2 (Circadian)**: The circadian arc visualization benefits enormously from iPad screen real estate. Make it the hero element.

---

## App Preview Video Storyboard (15-30 seconds)

**Format:** 1320 x 2868 px (6.7"), H.264, 30fps, no letterboxing. Audio optional but recommended (instrumental only, no voiceover per Apple guidelines for auto-play).

### Audio Track
Ambient, low-tempo electronic music. Think: calm nighttime energy. No lyrics. Fade in at 0s, fade out at final frame. Reference: similar vibe to Endel or Calm app preview audio — atmospheric, not distracting.

### Frame-by-Frame Storyboard

| Time | Duration | Scene | Screen Shown | Motion | Text Overlay |
|------|----------|-------|-------------|--------|-------------|
| 0:00 | 2s | **Cold open** | Black → app icon appears center-screen with subtle purple glow pulse | Fade in, icon scales from 0.8 to 1.0 | — |
| 0:02 | 3s | **The problem** | Text on dark background, no app UI | Text types in letter-by-letter | "You work nights. Your sleep app doesn't." |
| 0:05 | 4s | **Import shifts** | Import screen: user taps "Import ICS" → file picker → "12 shifts found" confirmation | Screen recording with touch indicators | "Import your schedule" (top, 40pt) |
| 0:09 | 4s | **Plan generates** | Loading animation → Today view populates with sleep blocks, naps, countdown | Fast-forward animation of plan building, then real-time settle | "Get your plan" (top, 40pt) |
| 0:13 | 3s | **Calendar export** | User taps "Add to Calendar" → success animation → cut to Apple Calendar showing ShiftWell events | Tap → ripple → calendar app transition | "It's on your calendar" (top, 40pt) |
| 0:16 | 3s | **Circadian detail** | Slow pan across circadian visualization → zoom into adaptive insight card | Pan left-to-right, slight parallax on card layers | "Powered by circadian science" (top, 40pt) |
| 0:19 | 3s | **Score tracking** | Recovery dashboard with trend chart animating upward, score counting from 0 to 82 | Chart line draws in, number increments | "Track your recovery" (top, 40pt) |
| 0:22 | 2s | **Chronotype result** | Quick cut: chronotype quiz result card with "Plan adjusted" confirmation | Card slides in from bottom | "Personalized to you" (top, 40pt) |
| 0:24 | 3s | **Closer** | App icon + name centered, tagline below, App Store badge | Elements fade in sequentially: icon → name → tagline → badge | "ShiftWell" (48pt, bold) / "Shift Work Sleep & Recovery" (28pt) / "Download Free" (24pt, gold `#C8A84B`) |
| 0:27 | 3s | **Hold** | Same as above, static | No motion — Apple requires last frame to be static for 3s minimum for poster frame | Same |

**Total runtime:** 30 seconds

### Video Production Notes

- **Touch indicators:** Use standard iOS-style touch dots (white circle, 60% opacity, 44px diameter) for all taps. Apple requires visible touch interactions.
- **Transitions:** Cross-dissolve between scenes (0.3s). No wipes, no slide transitions — they feel dated.
- **Pacing:** Front-load the value prop. The App Store auto-plays the first 3 seconds in browse view. "You work nights. Your sleep app doesn't." must land in that window.
- **No voiceover:** Apple auto-plays videos muted. All communication through on-screen text + UI. Text overlays must be legible without audio.
- **Poster frame:** Frame at 0:24 (app icon + name + tagline). This is what shows when video isn't playing.
- **Data shown:** Use realistic but fictional data. Shift patterns should reflect a 3-on/4-off night shift rotation (most common in nursing). Recovery score should show improvement trend.
- **Dark mode throughout:** Never show a light-mode frame. The dark UI is a feature, not a limitation — it signals "built for nighttime use."

---

## Production Checklist

- [ ] Design 6.7" iPhone master screenshots in Figma (1320 x 2868 px)
- [ ] Use actual app screenshots with realistic shift worker data — Apple rejects obvious mockups
- [ ] Verify all caption text legible at 50% zoom (App Store browse thumbnail size)
- [ ] Export at correct resolution for each device size (no @2x/@3x — App Store uses points)
- [ ] Scale masters to 6.1" (1206 x 2622) and 5.5" (1242 x 2208)
- [ ] Create iPad variants for 13" (2064 x 2752), 11" (1668 x 2388), and 10.9" (1640 x 2360)
- [ ] Test carousel narrative: can someone understand the app from screenshots alone?
- [ ] Run OCR on final PNGs to verify Apple can extract caption keywords
- [ ] Record App Preview video at 1320 x 2868, H.264, 30fps, 15-30 seconds
- [ ] A/B test Screenshot 1 hero in App Store Connect (supports up to 3 variants)
- [ ] Verify device frames match current-gen hardware (iPhone 16 Pro Max, not 15)
- [ ] Check that no screenshot shows placeholder text, debug UI, or dev-mode indicators
- [ ] Confirm all color values match design system tokens (cross-reference design-system-2026-04-18.md)

---

## Relationship to Other Launch Kit Files

| File | Relationship |
|------|-------------|
| `app-store-listing.md` | Listing copy — captions here align with subtitle/keyword strategy there |
| `screenshot-specs.md` | Previous 10-frame spec (v1) — this file supersedes it with focused 6-frame approach |
| `video-script.md` | Previous video concept — storyboard in this file supersedes it |
| `docs/design/design-system-2026-04-18.md` | Authoritative color/typography source — all hex values here trace to tokens there |

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: New file. Focused 6-frame carousel (down from v1's 10 frames) optimized for shift worker conversion. Order: hook → science → personalization → gamification → differentiator → results. Added iPad specifications, 30-second App Preview video storyboard, keyword coverage table, and production checklist. All colors reference design-system-2026-04-18.md tokens.
