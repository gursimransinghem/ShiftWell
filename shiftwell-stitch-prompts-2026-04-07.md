# ShiftWell — Google Stitch Design Prompts

**Use alongside [stitch.withgoogle.com](https://stitch.withgoogle.com)**
Work through each screen sequentially. Paste the Stitch prompt, review the output, then iterate with the refinement notes. Start with the Vibe Design prompt to establish the overall direction, then generate individual screens.

---

## Global Design Language

**App name:** ShiftWell
**Platform:** iOS mobile (375pt width)
**Primary mode:** Dark
**Target user:** Healthcare shift workers (nurses, doctors, paramedics) doing rotating day/night shifts
**Typeface direction:** Clean sans-serif (Inter, SF Pro, or similar)
**Icon style:** Rounded, minimal line icons

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#0D1117` | Main app background |
| Surface | `#161B22` | Cards, bottom sheets |
| Surface Elevated | `#1C2128` | Modals, elevated cards |
| Primary | `#58A6FF` | CTAs, active states, links |
| Primary Soft | `#1F3A5F` | Primary tint backgrounds |
| Accent Warm | `#F0883E` | Night shift indicators, warnings |
| Accent Green | `#3FB950` | Good scores, recovery, day shifts |
| Accent Purple | `#BC8CFF` | Circadian rhythm, sleep phases |
| Text Primary | `#F0F6FC` | Headlines, primary text |
| Text Secondary | `#8B949E` | Labels, supporting text |
| Text Muted | `#484F58` | Disabled, tertiary |
| Border | `#21262D` | Dividers, card borders |

### Mood Keywords

Calming, clinical-but-warm, nocturnal, trustworthy, restful, precise

---

## 0. Vibe Design Prompt

> Paste this into Stitch's Vibe Design feature to generate multiple design directions before building individual screens.

### Stitch Prompt

```
ShiftWell is a sleep optimization app built by an emergency medicine physician for healthcare workers who rotate between day and night shifts. The core problem: shift workers destroy their circadian rhythm switching between days and nights, and no existing app understands their schedule well enough to give useful sleep advice.

The app should feel like a calm control room at 3am — focused, precise, but not cold. Think of the blue glow of monitoring equipment in a quiet hospital. It needs to feel trustworthy enough that a tired nurse finishing a 12-hour night shift would trust its recommendation for when to sleep.

Dark mode is primary — most users open this app in a dark bedroom or during a night shift. Colors should be muted and easy on tired eyes, with strategic pops of warm amber (night shifts) and cool blue (recommendations). Green means recovery/good, purple represents sleep/circadian phases.

The design should balance clinical precision (scores, metrics, data) with emotional warmth (you're going to be okay, here's what to do next). No gamification. No streaks. This isn't a fitness app — it's a medical tool that happens to look beautiful.

Typography should be clean and highly legible at arm's length (phone on nightstand). Cards and surfaces should have subtle depth — layered dark grays, not flat black. Rounded corners, generous spacing, breathing room.

Target: iOS mobile, 375pt width.
```

---

## 1. Onboarding Flow

Four screens that collect the minimum viable info to generate the first sleep recommendation.

---

### 1A. Welcome Screen

#### Stitch Prompt

```
Mobile app welcome screen (375pt wide, iOS, dark mode) for "ShiftWell" — a sleep optimization app for shift workers.

Center of screen: app logo — a minimal crescent moon shape merged with a subtle pulse/heartbeat line, rendered in soft blue (#58A6FF) against the dark background (#0D1117).

Below the logo: app name "ShiftWell" in clean white sans-serif, 28pt weight.

Tagline beneath: "Sleep smarter between shifts." in muted gray (#8B949E), 16pt.

A single illustration or abstract graphic in the middle zone — something like layered concentric arcs suggesting a circadian cycle, using purple (#BC8CFF) and blue (#58A6FF) gradients against the dark background. Subtle, not cartoonish.

Bottom section: large rounded primary button "Get Started" in blue (#58A6FF) with white text. Below it, a smaller text link "I already have an account" in gray.

No status bar clutter. Generous vertical spacing. The screen should feel like opening your eyes in a calm, dark room.
```

#### Key UI Elements
- App logo (moon + pulse motif)
- App name + tagline
- Abstract circadian illustration
- "Get Started" primary CTA
- "I already have an account" secondary link

#### Interaction Notes
- "Get Started" → advances to screen 1B
- "I already have an account" → login screen (email + password)

---

### 1B. Shift Schedule Setup

#### Stitch Prompt

```
Mobile onboarding screen (375pt, iOS, dark mode, background #0D1117) for ShiftWell — step 1 of 3 setup.

Top: small progress indicator — 3 dots, first one filled blue (#58A6FF), others outlined gray.

Headline: "What's your shift pattern?" in white, 22pt, left-aligned with generous top margin.

Subtext: "We'll use this to calculate your optimal sleep windows." in gray (#8B949E).

Below: three large selectable cards stacked vertically on surface color (#161B22) with subtle border (#21262D) and rounded corners (16pt radius). Each card has:
- Left icon in a soft colored circle
- Title text in white
- Description in gray

Card 1: Sun icon in green circle (#3FB950). Title: "Day shifts only". Desc: "Consistent daytime schedule"
Card 2: Moon icon in amber circle (#F0883E). Title: "Night shifts only". Desc: "Consistent overnight schedule"
Card 3: Rotate arrows icon in purple circle (#BC8CFF). Title: "Rotating days & nights". Desc: "The hardest pattern — we'll help the most here"

The third card should appear subtly highlighted or recommended — maybe a thin purple left border or a small "Most common" badge.

Below the cards: a text link "I'll connect my schedule later" in gray.

Bottom: "Continue" button, full width, blue (#58A6FF), rounded. Disabled/dimmed until a card is selected.
```

#### Key UI Elements
- Progress dots (1/3)
- Three shift pattern cards (day/night/rotating)
- "Most common" badge on rotating option
- Skip link
- Continue button (disabled until selection)

#### Interaction Notes
- Tapping a card adds a blue border/checkmark, enables Continue
- "Rotating" selection triggers additional questions in the flow (shift length, rotation frequency)
- Skip link → goes to home with defaults, prompts setup later

---

### 1C. Sleep Preferences

#### Stitch Prompt

```
Mobile onboarding screen (375pt, iOS, dark mode, background #0D1117) for ShiftWell — step 2 of 3.

Progress dots at top: second dot filled blue.

Headline: "Tell us about your sleep." White, 22pt.

Subtext: "No judgment — shift work sleep is hard. We just need a baseline." Gray (#8B949E).

Two input sections stacked vertically:

Section 1 — "Typical sleep duration"
A horizontal slider on a surface card (#161B22). Slider track is dark gray with the filled portion in purple (#BC8CFF). Thumb is a white circle. Range: 3h to 10h. Current value displayed large above the slider: "6.5 hours" in white. Labels "3h" and "10h" at ends in muted gray.

Section 2 — "Biggest sleep challenge"
Four pill-shaped toggle buttons arranged in a 2x2 grid. Each pill is surface-colored (#161B22) with gray text when unselected, blue border and blue text when selected. Options:
- "Falling asleep"
- "Staying asleep"
- "Waking up"
- "Day sleeping"
Multiple selections allowed — show 1-2 selected as example.

Bottom: "Continue" button, full width, blue, rounded.
```

#### Key UI Elements
- Progress dots (2/3)
- Sleep duration slider (3h–10h)
- Large current value display
- Multi-select pill buttons for sleep challenges
- Continue button

#### Interaction Notes
- Slider updates value in real-time
- Pills toggle on/off independently
- Data feeds the recommendation algorithm

---

### 1D. Notification Permissions

#### Stitch Prompt

```
Mobile onboarding screen (375pt, iOS, dark mode, background #0D1117) for ShiftWell — step 3 of 3, notification permissions.

Progress dots: third dot filled blue.

Center of screen: a large, elegant illustration — a phone with a gentle notification bell, surrounded by soft concentric rings suggesting a gentle alarm. Use blue (#58A6FF) and purple (#BC8CFF) tones. The illustration should feel calming, not urgent.

Below illustration:
Headline: "Stay on rhythm" in white, 22pt, centered.
Body text centered in gray (#8B949E): "We'll remind you when it's time to start winding down, and wake you at the right moment in your sleep cycle. No spam — only signals that matter."

Three small feature bullets below, each with a small icon and single line:
- Moon icon: "Sleep window reminders"
- Sun icon: "Wake optimization alerts"
- Calendar icon: "Shift prep notifications"

Bottom: two buttons stacked.
Primary: "Enable Notifications" — full width, blue (#58A6FF), rounded.
Secondary: "Maybe Later" — text-only link in gray below.
```

#### Key UI Elements
- Progress dots (3/3)
- Centered illustration (phone + notification bell)
- Headline + body copy
- Three feature bullets with icons
- Primary CTA + skip option

#### Interaction Notes
- "Enable Notifications" → triggers iOS permission dialog, then navigates to Home Dashboard
- "Maybe Later" → skips, navigates to Home Dashboard, app will prompt again later

---

## 2. Home Dashboard

The main screen. Shows everything the user needs at a glance.

#### Stitch Prompt

```
Mobile home dashboard screen (375pt, iOS, dark mode, background #0D1117) for ShiftWell, a sleep optimization app for shift workers.

Top bar: left-aligned greeting "Good evening, Sim" in white 18pt. Right side: small circular profile avatar placeholder and a settings gear icon in gray (#8B949E).

Below the greeting: a contextual status line in gray, like "Night shift tomorrow at 7:00 PM"

Main content area — scrollable, three card sections:

CARD 1 — Sleep Score (hero card, tallest)
Large surface card (#161B22) with 16pt rounded corners. Contains:
- A large circular progress ring in the center, stroke width ~8pt. The ring uses a gradient from purple (#BC8CFF) to blue (#58A6FF). Inside the ring: large "78" in white bold 48pt, with "/ 100" in gray 16pt below. Below the score: "Last night: 6h 12m" in gray.
- Under the ring, a horizontal row of three small stat pills:
  - "Deep: 1h 22m" with a small purple dot
  - "REM: 1h 48m" with a small blue dot
  - "Light: 3h 02m" with a small gray dot

CARD 2 — Next Sleep Window (recommended action card)
Surface card with a subtle blue-purple gradient left border (3pt wide). Inside:
- Small label "RECOMMENDED" in uppercase blue (#58A6FF) 11pt tracking wide
- Main text: "Sleep window opens in 2h 15m" in white 16pt
- Subtext: "10:30 PM — 5:00 AM (6.5 hours)" in gray
- A small horizontal timeline bar showing the recommended window as a purple filled segment against a dark track, with "now" marker indicated
- Right side: a small chevron arrow suggesting tap-for-details

CARD 3 — Upcoming Shifts
Surface card showing next 3 shifts in a compact list:
- Each row: colored dot (green for day, amber for night), date ("Wed Apr 8"), shift time ("7a - 7p" or "7p - 7a"), and a small sleep icon if a sleep recommendation exists for that shift
- Subtle dividers between rows
- Bottom of card: "View full calendar →" link text in blue

Bottom navigation bar — 5 icons with labels, surface-colored (#161B22) bar:
- Home (filled/active, blue)
- Sleep Log (outline, gray)
- Rhythm (outline, gray) — circadian icon
- Calendar (outline, gray)
- Reports (outline, gray)

The overall feel: like a mission control for your body. Data-rich but not overwhelming. Everything scannable in 5 seconds.
```

#### Key UI Elements
- Greeting + contextual shift status
- Sleep Score ring (gradient, large number)
- Sleep phase breakdown (deep/REM/light)
- Next Sleep Window card with timeline
- Upcoming shifts list (3 items)
- Bottom tab navigation (5 tabs)

#### Interaction Notes
- Tap Sleep Score card → expands to detailed sleep breakdown
- Tap Sleep Window card → full recommendations screen
- Tap a shift row → opens that day in calendar view
- Tap "View full calendar" → Calendar tab
- Bottom nav switches between main sections
- Pull-to-refresh updates data

---

## 3. Sleep Log

Daily sleep entries with the ability to log manually or review auto-tracked data.

#### Stitch Prompt

```
Mobile sleep log screen (375pt, iOS, dark mode, background #0D1117) for ShiftWell.

Top: "Sleep Log" title in white 20pt, left-aligned. Right side: a "+" icon button in blue (#58A6FF) for manual entry.

Below title: horizontal scrollable date selector — 7 days visible as small circular date pills. Today's date is filled blue, past dates are surface-colored with white text, future dates are dimmed. Each pill shows day abbreviation on top ("Tu") and date number below ("7").

Main content — vertical scrollable list of sleep entries, each as a card:

SLEEP ENTRY CARD (expanded/today):
Surface card (#161B22), rounded corners. Top section:
- Left: large "6h 12m" duration in white bold 22pt
- Right: quality badge — rounded pill showing "Good" in green (#3FB950) with a subtle green background tint
- Below duration: "11:14 PM — 5:26 AM" time range in gray

Middle section: a compact horizontal bar chart showing sleep stages as colored segments in a single row:
- Purple (#BC8CFF) = Deep
- Blue (#58A6FF) = REM
- Gray (#484F58) = Light
- Dark gap = Awake
With tiny labels below each color in the legend

Bottom section: optional notes area — shows user note in italic gray: "Took melatonin 3mg. Room was cold." with a small edit pencil icon.

SLEEP ENTRY CARD (collapsed/past day):
Narrower card showing just: date, duration, quality badge, and the stage bar — all in one compact row.

Show 3-4 cards stacked with today expanded and previous days collapsed.

Bottom: the standard 5-tab navigation bar with "Sleep Log" tab now active/blue.
```

#### Key UI Elements
- Screen title + add entry button
- Horizontal scrollable date picker (7 days)
- Expanded entry card (today): duration, quality, time range, stage bar, notes
- Collapsed entry cards (past days): compact single row
- Bottom navigation (Sleep Log active)

#### Interaction Notes
- Tap "+" → opens manual sleep entry form (time in, time out, quality rating, notes)
- Tap a collapsed card → expands it
- Tap the stage bar → navigates to detailed sleep breakdown with full hypnogram
- Tap edit pencil on notes → inline edit
- Swipe date pills to scroll through the week
- Tap a date pill → scrolls to that day's entry

---

## 4. Circadian Rhythm View

The signature differentiator screen — visualizes how shifts interact with your body's natural clock.

#### Stitch Prompt

```
Mobile circadian rhythm visualization screen (375pt, iOS, dark mode, background #0D1117) for ShiftWell.

Top: "Your Rhythm" title in white 20pt, left-aligned. Small info (i) icon in gray to the right.

Hero visualization — takes up ~60% of the screen:
A 24-hour circular clock diagram centered on screen. The circle is large (roughly 280pt diameter). Think of it like a radar display or a 24-hour clock face.

The outer ring shows hours (12am at top, 6am right, 12pm bottom, 6pm left) with subtle gray tick marks and hour labels in muted text.

Inside the ring, colored arcs show different zones:
- A purple (#BC8CFF) arc spanning roughly 11pm-6am labeled "Optimal Sleep" — this is the body's natural sleep window
- A green (#3FB950) arc spanning roughly 6am-10am labeled "Peak Alertness"
- A warm amber (#F0883E) arc for the upcoming night shift hours (7pm-7am), showing where the shift overlaps with the sleep zone
- A blue (#58A6FF) arc showing the recommended sleep window that accounts for the shift

At the current time position on the ring: a bright white dot with a subtle glow, like a clock hand tip. Label: "Now" in small white text.

The overlap between the shift (amber) and natural sleep (purple) should be visually highlighted — this is the "conflict zone" that the app helps resolve.

Below the circular visualization:

A summary card (#161B22):
- "Circadian Phase" label in gray
- "Moderate Disruption" in amber (#F0883E) with a small warning-style indicator
- Body text in gray: "Your night shift tomorrow conflicts with 4 hours of your natural sleep window. Follow tonight's adjusted sleep recommendation to minimize impact."

Below that: a small "Adjustment Tips" link in blue.

Bottom: standard 5-tab navigation with "Rhythm" tab active.
```

#### Key UI Elements
- 24-hour circular clock visualization
- Colored arcs: natural sleep (purple), alertness (green), shift (amber), recommended sleep (blue)
- Current time indicator (glowing dot)
- Conflict zone highlighting
- Phase summary card with disruption level
- Adjustment tips link
- Bottom navigation (Rhythm active)

#### Interaction Notes
- Tap info icon → bottom sheet explaining how to read the diagram
- Tap any arc segment → tooltip with details
- Tap "Adjustment Tips" → navigates to Sleep Recommendations screen
- Pinch to zoom the circular diagram (stretch goal)
- The visualization updates in real-time as the "now" indicator moves

---

## 5. Shift Calendar

Monthly calendar synced from QGenda with sleep window overlays.

#### Stitch Prompt

```
Mobile shift calendar screen (375pt, iOS, dark mode, background #0D1117) for ShiftWell.

Top: "April 2026" in white 18pt, centered, with left/right chevron arrows to navigate months. Below that: a small "Synced from QGenda" label in gray (#8B949E) with a green dot indicating connection status.

Day-of-week headers: S M T W T F S in muted gray, evenly spaced.

Calendar grid — standard monthly layout. Each day cell is roughly 48pt tall:
- Day number in top-left of cell in white
- Day shifts shown as a small green (#3FB950) horizontal bar at the bottom of the cell
- Night shifts shown as a small amber (#F0883E) horizontal bar
- Days off have no bar
- Today's cell has a blue (#58A6FF) circle behind the date number
- Days with a sleep recommendation have a tiny purple (#BC8CFF) dot indicator in the top-right corner

Show a realistic April 2026 calendar with a mix of shifts: some day shifts, some night shifts, some off days, a cluster of night shifts mid-month.

Below the calendar grid — selected day detail card:
Surface card (#161B22) showing the selected day's info:
- Date: "Wednesday, April 8" in white 16pt
- Shift: amber dot + "Night Shift: 7:00 PM — 7:00 AM" in white
- Recommended Sleep: purple dot + "Pre-shift sleep: 10:00 AM — 4:00 PM" in purple (#BC8CFF)
- Post-shift: purple dot + "Post-shift sleep: 8:00 AM — 2:00 PM (Apr 9)" in lighter purple
- A small "View recommendations →" link in blue

Bottom: standard 5-tab navigation with "Calendar" tab active.
```

#### Key UI Elements
- Month/year header with navigation arrows
- QGenda sync status indicator
- Monthly calendar grid with colored shift bars
- Today indicator (blue circle)
- Sleep recommendation dots
- Selected day detail card
- Bottom navigation (Calendar active)

#### Interaction Notes
- Tap a day cell → updates the detail card below
- Swipe left/right → navigate months
- Tap "View recommendations" → opens Recommendations screen for that shift
- Tap QGenda sync label → opens settings/connection management
- Long-press a day → option to manually add/edit a shift

---

## 6. Sleep Recommendations

Personalized, context-aware advice based on the upcoming shift pattern.

#### Stitch Prompt

```
Mobile sleep recommendations screen (375pt, iOS, dark mode, background #0D1117) for ShiftWell.

Top: back arrow + "Sleep Plan" title in white 18pt.

Context banner at top — a wide card with a subtle gradient background (dark purple to dark blue). Contains:
- "Preparing for Night Shift" in white bold 16pt
- "Wednesday, April 8 — 7:00 PM start" in gray
- A small countdown: "Shift starts in 22 hours" in blue (#58A6FF)

Main content — vertical scrollable timeline of recommendation cards. Each card represents a time block. Use a vertical timeline line (thin, purple #BC8CFF) running down the left edge connecting the cards, with small dots at each card's time marker.

TIMELINE CARD 1 — "Tonight"
Time marker: "10:30 PM" in blue on the left timeline
Surface card:
- Icon: moon in purple circle
- Title: "Go to sleep now" in white
- Body: "Full night's rest before your transition day. Aim for 7 hours." in gray
- Tag pill: "Priority: High" in small green pill

TIMELINE CARD 2 — "Tomorrow Morning"
Time marker: "9:00 AM"
Surface card:
- Icon: sun with down arrow in amber circle
- Title: "Blackout nap" in white
- Body: "Sleep 10:00 AM — 4:00 PM. Use blackout curtains, earplugs, and set your room to 65-68°F. This pre-loads sleep before your night shift." in gray
- Tag pill: "Duration: 6 hours" in purple pill

TIMELINE CARD 3 — "Pre-Shift"
Time marker: "5:30 PM"
Surface card:
- Icon: coffee cup in blue circle
- Title: "Light meal + caffeine cutoff" in white
- Body: "Eat a balanced meal. Last caffeine by 6 PM — you'll want to sleep after your shift." in gray

TIMELINE CARD 4 — "During Shift"
Time marker: "7:00 PM — 7:00 AM"
Surface card:
- Icon: briefcase in amber circle
- Title: "Night shift active" in white
- Body: "Bright light exposure first 6 hours. Wear blue-light glasses last 2 hours if possible." in gray
- Tag pill: "Shift duration: 12h" in amber pill

TIMELINE CARD 5 — "Post-Shift"
Time marker: "7:30 AM (Apr 9)"
Surface card:
- Icon: bed in purple circle
- Title: "Recovery sleep" in white
- Body: "Go directly to sleep. Avoid sunlight on the drive home — wear dark sunglasses. Target 7-8 hours." in gray
- Tag pill: "Priority: Critical" in red-tinted pill

Bottom of timeline: "Adjust plan" button in outlined blue style.

No bottom tab bar on this screen — it's a detail view accessed from Home or Calendar.
```

#### Key UI Elements
- Context banner (shift type, date, countdown)
- Vertical timeline with connected dots
- 5 recommendation cards with icons, titles, descriptions, priority tags
- "Adjust plan" button at bottom
- Back navigation (no bottom tabs — detail view)

#### Interaction Notes
- Tap a card → expands with more detail (e.g., science behind the recommendation)
- Tap "Adjust plan" → allows moving sleep windows (e.g., "I can't sleep until 11 AM")
- Cards can be checked off/dismissed as completed
- Swipe right on a card → marks as "done"

---

## 7. Weekly Report

Summary card with trends and week-over-week comparison.

#### Stitch Prompt

```
Mobile weekly report screen (375pt, iOS, dark mode, background #0D1117) for ShiftWell.

Top: "Weekly Report" in white 20pt, left-aligned. Right side: share icon in gray. Below: "Mar 31 — Apr 6, 2026" date range in gray with left/right arrows to navigate weeks.

SECTION 1 — Overall Score Card
Full-width hero card (#161B22). Center: large "72" in white bold 40pt with "/100" in gray. Below: "Weekly Sleep Score" label. Under that: a comparison line: "↑ 8 points from last week" in green (#3FB950) with a small up-arrow icon.

SECTION 2 — Key Metrics Row
Three equal-width metric boxes in a horizontal row, each on surface (#161B22):
- Box 1: "Avg Duration" label in gray, "6h 24m" value in white bold, "↑ 18m" in green
- Box 2: "Avg Quality" label in gray, "Good" value in green, "→ same" in gray
- Box 3: "Recovery" label in gray, "68%" value in amber (#F0883E), "↓ 4%" in amber

SECTION 3 — Sleep Duration Chart
A bar chart showing 7 days (Mon-Sun). Each bar is vertical, filled with purple (#BC8CFF). A horizontal dashed line at the recommended 7h mark in blue (#58A6FF). Bars below the line are tinted slightly red/amber. X-axis: day abbreviations. Y-axis: hours (0-10). The bars should show realistic variation — some 4h bars (post-night-shift), some 7-8h bars (days off).

SECTION 4 — Insights Card
Surface card with a lightbulb icon in blue. Contains:
- "This week's insight" label in blue
- Body: "Your sleep dropped below 5 hours twice this week, both after night shifts. Your post-shift sleep routine is the biggest opportunity for improvement." in white/gray text.
- A "See recommendations →" link in blue.

SECTION 5 — Shift Impact Summary
Compact card showing:
- "Shifts worked: 4" (2 green dots for day, 2 amber dots for night)
- "Circadian disruption events: 2" in amber
- "Best sleep night: Thursday (8h 12m)" in green

Bottom: standard 5-tab navigation with "Reports" tab active.
```

#### Key UI Elements
- Week navigation with date range
- Overall weekly score with trend arrow
- Three key metric boxes
- 7-day bar chart with target line
- AI insight card
- Shift impact summary
- Bottom navigation (Reports active)

#### Interaction Notes
- Tap overall score → breakdown of how the score is calculated
- Tap a bar in the chart → tooltip with that day's details
- Tap "See recommendations" → Sleep Recommendations screen
- Share icon → generates a screenshot/summary to share
- Swipe left/right → navigate between weeks

---

## 8. Settings

Profile, preferences, connections, and subscription management.

#### Stitch Prompt

```
Mobile settings screen (375pt, iOS, dark mode, background #0D1117) for ShiftWell.

Top: "Settings" title in white 20pt, left-aligned.

Profile section at top:
A horizontal card (#161B22) with:
- Left: circular avatar placeholder (gray with user icon silhouette)
- Middle: "Dr. Sim Singh" name in white 16pt, "sim@email.com" in gray below
- Right: blue "Edit" text link

Below: grouped settings sections with section headers in uppercase gray (#8B949E) 11pt tracking wide.

SECTION: "SCHEDULE"
- Row: "Shift Source" — left label in white, right value "QGenda" in gray with green connected dot, chevron
- Row: "Default Shift Length" — "12 hours" in gray, chevron
- Row: "Typical Rotation" — "Rotating D/N" in gray, chevron

SECTION: "SLEEP"
- Row: "Target Sleep Duration" — "7 hours" in gray, chevron
- Row: "Sleep Tracking" — toggle switch (on, blue) on the right
- Row: "Wind-down Reminder" — "30 min before" in gray, chevron
- Row: "Smart Wake Window" — toggle switch (on, blue)

SECTION: "NOTIFICATIONS"
- Row: "Sleep Reminders" — toggle (on)
- Row: "Shift Prep Alerts" — toggle (on)
- Row: "Weekly Report" — toggle (on)
- Row: "Quiet Hours" — "11 PM — 6 AM" in gray, chevron

SECTION: "ACCOUNT"
- Row: "Subscription" — "Premium (Annual)" in green, chevron
- Row: "Data Export" — chevron
- Row: "Privacy Policy" — chevron
- Row: "Help & Support" — chevron
- Row: "Sign Out" — text in red (#F85149)

Each row is on surface color (#161B22), separated by thin borders (#21262D). Rows have consistent height (~48pt) with left-aligned labels and right-aligned values/controls.

Standard 5-tab navigation at bottom — no tab active (settings accessed from gear icon on home).
```

#### Key UI Elements
- Profile card (avatar, name, email, edit)
- Grouped settings rows with section headers
- Toggle switches (blue when on)
- Value displays with chevrons for drill-down
- QGenda connection status
- Sign out in red
- No active tab in bottom nav (accessed via gear icon)

#### Interaction Notes
- Tap "Edit" on profile → editable profile fields
- Tap "Shift Source" → QGenda connection flow / calendar picker
- Toggles switch instantly with haptic feedback
- Tap "Subscription" → subscription management screen
- Tap "Data Export" → export options (CSV, Apple Health)
- Tap "Sign Out" → confirmation dialog

---

## 9. Paywall / Premium Upsell

What free users see when they hit a premium feature, or via Settings > Subscription.

#### Stitch Prompt

```
Mobile paywall/premium upsell screen (375pt, iOS, dark mode, background #0D1117) for ShiftWell.

Top: "X" close button in top-left corner, gray. No other navigation.

Hero section: a subtle gradient background at the top of the screen, dark purple (#1F1530) fading to the standard background. Inside: the ShiftWell logo small, with "Premium" text next to it in a gold/warm tone (#F0883E).

Headline: "Sleep better between every shift." in white 24pt bold, centered.

Feature comparison — two columns:

Left column header: "Free" in gray with a simple circle icon
Right column header: "Premium" in amber (#F0883E) with a star icon

Comparison rows (alternating subtle surface backgrounds):
- "Sleep tracking" — checkmark (both)
- "Basic sleep score" — checkmark (both)
- "Circadian rhythm view" — lock icon (free) / checkmark (premium)
- "Smart sleep windows" — lock icon / checkmark
- "Shift-aware recommendations" — lock icon / checkmark
- "Weekly reports & trends" — lock icon / checkmark
- "QGenda integration" — lock icon / checkmark
- "Recovery scoring" — lock icon / checkmark

Checkmarks in green (#3FB950). Lock icons in muted gray (#484F58).

Pricing card below the comparison:
Surface card (#161B22) centered. Shows:
- "$29.99 / year" in white bold 28pt
- "That's $2.50/month" in gray below
- "7-day free trial" badge in a small blue (#58A6FF) pill above the price

CTA button: "Start Free Trial" — full width, rounded, filled with a warm gradient (blue #58A6FF to purple #BC8CFF), white bold text.

Below button: "Cancel anytime. No charge for 7 days." in small gray text, centered.

At very bottom: small "Restore Purchase" text link in gray.
```

#### Key UI Elements
- Close (X) button
- Premium branding (logo + "Premium")
- Headline
- Free vs Premium feature comparison grid
- Price display ($29.99/yr with monthly breakdown)
- 7-day trial badge
- Gradient CTA button
- Cancellation reassurance text
- Restore purchase link

#### Interaction Notes
- "X" → dismisses back to previous screen
- "Start Free Trial" → Apple subscription flow
- "Restore Purchase" → checks App Store for existing subscription
- Screen can be triggered from locked features or from Settings

---

## 10. Notification Examples

Not a screen in Stitch — but notification copy for the push notification previews. Generate these as a notification preview mockup.

#### Stitch Prompt

```
Mobile push notification preview mockup (375pt, iOS) showing 5 stacked notification banners from the "ShiftWell" app on a blurred dark lock screen background.

Each notification shows the standard iOS notification format: app icon (small ShiftWell logo — crescent moon/pulse), "SHIFTWELL" app name in small caps, timestamp on the right, and notification body text below.

Notification 1 (sleep reminder):
Time: "9:45 PM"
Body: "Your sleep window opens in 45 minutes. Start winding down — dim lights, avoid screens."

Notification 2 (shift prep):
Time: "2:00 PM"
Body: "Night shift in 5 hours. Take your pre-shift nap now if you haven't already. Blackout curtains + 65°F."

Notification 3 (wake optimization):
Time: "5:15 AM"
Body: "Light sleep phase detected. Good time to wake up naturally — you've banked 6h 40m."

Notification 4 (weekly report):
Time: "Sunday 9:00 AM"
Body: "Your weekly sleep report is ready. Score: 74/100 (↑6 from last week). Tap to review."

Notification 5 (circadian alert):
Time: "6:30 PM"
Body: "Transition alert: You switch from days to nights tomorrow. Tonight's adjusted sleep plan is ready."

The notifications should look like real iOS notifications — frosted glass effect, proper typography, subtle shadows. The lock screen wallpaper behind should be dark and abstract.
```

#### Key UI Elements
- 5 realistic iOS notification banners
- App icon on each
- Timestamp on each
- Body text with actionable, specific copy
- Blurred dark lock screen background

#### Interaction Notes
- These are reference designs for the notification copy, not interactive screens
- Each notification deep-links to the relevant screen when tapped

---

## Stitch Workflow Tips

**Recommended order:**
1. Run the Vibe Design prompt first — pick your favorite direction
2. Generate the Home Dashboard — this sets the component language
3. Do Onboarding next (establishes the typography/spacing system)
4. Build remaining screens referencing the Home Dashboard style
5. Save the Paywall for last (it needs to feel premium relative to everything else)

**Iteration tips:**
- If a screen is close but the colors are off: "Keep this layout exactly but change the purple to #BC8CFF and the blue to #58A6FF"
- If spacing feels cramped: "Add 50% more vertical spacing between all cards"
- If it's too busy: "Remove the [element] and simplify to just [elements you want]"
- Export to Figma after each screen to build a complete design file

**Creating a DESIGN.md:**
Once you have 2-3 screens you like, use Stitch's design system extraction feature to create a DESIGN.md file. This locks in your colors, typography, spacing, and component styles so all subsequent screens stay consistent.

---

*Created: 2026-04-07*
*Last Reviewed: 2026-04-07*
*Last Edited: 2026-04-07*
*Review Notes: Initial creation. All 10 screen categories covered with detailed Stitch prompts, color specs, UI elements, and interaction notes.*
