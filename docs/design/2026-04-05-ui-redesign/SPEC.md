# ShiftWell UI Redesign — Design Spec

**Date:** 2026-04-05
**Status:** Approved
**Scope:** Full UI redesign of all screens — Today (5 states), Schedule, Profile, Onboarding, Night Sky
**Approach:** Premium Hybrid (V6 Final) — combines Path A structure with Path B elements + premium refinements + 7 elevate features

---

## Context

ShiftWell has 5 of 6 phases complete with 172 passing tests, approaching TestFlight. The existing UI was functional but built incrementally across phases without a cohesive premium design pass. This redesign applies a unified premium visual language across all screens before the v1.0 launch.

The founder reviewed 6 design iterations (V1 Original → V2 Polish → V3 Hybrid → V4 Premium Refined → V5 Final → V6 Definitive) and selected V6, which combines the best elements from each version plus 7 "elevate" features that set new premium standards.

---

## Design Principles

1. **One Hero Per Screen** — Every screen has ONE clear focal point. Everything else is supporting cast.
2. **Whitespace = Luxury** — Extra padding between sections signals quality. Don't cram.
3. **Progressive Disclosure** — Show only what matters NOW. Past events collapse. Details expand on tap.
4. **Color Restraint** — Max 2 accent colors per screen: gold for actions + one semantic color for context.
5. **Typography Does The Work** — Size contrast (36px numbers next to 10px labels) creates hierarchy without decorative chrome.

---

## Color System

### Background (warmed from original)
| Token | Hex | Usage |
|-------|-----|-------|
| background.primary | `#0B0D16` | App background (warmed from #0A0E1A) |
| background.surface | `#151A2A` | Cards, sheets (warmed from #141929) |
| background.elevated | `#1C2137` | Modals, popovers |

### Accent
| Token | Hex | Usage |
|-------|-----|-------|
| accent.gold | `#C8A84B` | CTAs, primary buttons, active tab glow |
| accent.goldMuted | `#8B6914` | Toggle track (on state) |

### Semantic
| Token | Hex | Usage |
|-------|-----|-------|
| sleep | `#7B61FF` | Sleep blocks, sleep countdown |
| nap | `#B794F6` | Nap blocks, sleep window text |
| shiftDay | `#4A90D9` | Day shift indicators |
| shiftNight | `#FF9F43` | Night shift indicators, on-shift state |
| meal | `#34D399` | Meals, recovery score, success |
| caffeine | `#FF6B6B` | Caffeine cutoff, danger, errors |
| winddown | `#818CF8` | Wind-down blocks, indigo state |
| light | `#FCD34D` | Light protocol blocks |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| text.primary | `#FFFFFF` | Headings, primary content |
| text.secondary | `#D1D5DB` | Body text, card content |
| text.tertiary | `#9CA3AF` | Supporting text, labels |
| text.muted | `#6B7280` | Timestamps, captions |
| text.dim | `#4B5563` | Section headers, collapsed items |

### Borders
| Token | Hex | Usage |
|-------|-----|-------|
| border.default | `#1F2937` | Card borders, spine lines |
| border.subtle | `rgba(255,255,255,0.06)` | Timeline cards, glass elements |
| border.strong | `#374151` | Emphasis borders |

### Screen-Level Color Discipline
Any single screen uses gold + ONE semantic color + grays:
- Recovery screen: gold + green
- Night shift screen: gold + orange
- Wind-down: gold + indigo
- Timeline dots are exempt (small enough to mix colors without visual noise)

---

## Typography

System fonts (SF Pro on iOS, Roboto on Android). All countdown numbers use `font-variant-numeric: tabular-nums`.

| Style | Size | Weight | Usage |
|-------|------|--------|-------|
| Hero number | 36px | 700 | Recovery score in ring |
| Screen heading | 28px | 700, -0.5 tracking | Date ("Saturday, Apr 5") |
| Countdown value | 22px | 700, -0.5 tracking | Countdown row numbers |
| Card title | 14px | 600 | Timeline event names |
| Body | 13px | 400 | Status line, insight text |
| Meta | 11px | 500 | Timeline time ranges, card subtitles |
| Label | 10px | 600, 1px tracking | Section headers ("TODAY'S PLAN") |
| Timestamp | 9px | 500, tabular-nums | Timeline time column (2:00p, 9:00p) |
| Caption | 8px | 500 | Collapsed past count |

---

## Spacing

8px grid. All vertical margins snap to multiples of 8.

| Between | Spacing |
|---------|---------|
| Header → Status pill | 16px |
| Status pill → Hero score | 20px |
| Hero score → Countdown row | 14px |
| Countdown row → Timeline label | 16px |
| Timeline events | 4px (card margin-bottom) |
| Screen bottom → Tab bar | 12px |

---

## Today Screen — Layout Spec

### Header
- Greeting: "Good morning, Sim" — 14px, `text.muted`, weight 400
- Date: "Saturday, Apr 5" — 28px, `text.primary`, weight 700, -0.5 tracking
- No avatar (moved to Profile tab)

### Status Pill (V3 boxed style)
- Container: flex row, 12px vert / 16px horiz padding, border-radius 14px
- Background: `linear-gradient(135deg, rgba(stateColor, 0.1), rgba(stateColor, 0.03))`
- Border: 1px `rgba(stateColor, 0.18)`
- Animation: subtle box-shadow glow pulse (4s loop, `rgba(stateColor, 0.06)`)
- Icon container: 38px square, border-radius 12px, `rgba(stateColor, 0.12)` background, emoji 18px
- Primary text: 15px, weight 600 (state name)
- Secondary text: 12px, `text.tertiary` (context)
- State variants:
  - Recovery: 🌿 icon, green tint, "Recovery Day" / "Day shift tomorrow · 12h recovery window"
  - On Shift: 🏥 icon, orange tint, "Night Shift Active" / "Plan your recovery"
  - Wind-down: 🌙 icon, indigo tint, "Wind-down Active" / "Sleep window at 10:00 PM"

### Hero Score (centered)
- Container: centered, 16px top/20px bottom padding
- Ring: 96px diameter, 3px border `rgba(34,211,153,0.12)`
- Ring arc: SVG `stroke-dasharray` proportional to score (78% = 281deg). Color: `#34D399`. `drop-shadow(0 0 6px rgba(52,211,153,0.3))`
- Ambient glow: 130px radial gradient behind ring, `rgba(52,211,153,0.1)`, 4s ease-in-out pulse animation
- Score number: 36px, weight 700, centered in ring
- Sparkline: 7 bars (4px wide, 3px gap, border-radius 2px), heights represent last 7 days. Today's bar uses `#34D399`, others `rgba(52,211,153,0.25)`. 10px margin-top.
- Label: "Recovery Score · 7.2h of 7.5h" — 12px, `text.muted`
- Trend: "↑ 6 pts from yesterday" — 13px, `#34D399`, weight 600

### Countdown Row
- Container: flex row, no gap, border-radius 16px, border `rgba(255,255,255,0.05)`, overflow hidden
- 3 cells, each `flex: 1`, separated by 1px left border `rgba(255,255,255,0.04)`
- Cell padding: 14px vertical, 8px horizontal, centered
- Cell content (stacked): Emoji (16px) → Value (22px, weight 700, tabular-nums) → Label (10px, `text.muted`)
- Active cell (caffeine approaching): `background: linear-gradient(180deg, rgba(255,107,107,0.08), rgba(255,107,107,0.02))`
- Value colors: Caffeine `#FF6B6B`, Wind-down `#818CF8`, Sleep `#B794F6`

### Insight Line (bottom position, V4 style)
- Position: below timeline, not between countdown and timeline
- Container: flex row, 10px vert / 4px horiz padding, border-top `rgba(255,255,255,0.04)`
- Icon: 💡 emoji, 14px, flex-shrink 0
- Text: 13px, `text.tertiary`, line-height 1.4
- Tap action: expands to show 2-3 additional insights (slide-down animation, 300ms)
- Insight text adapts per state (recovery advice, shift warnings, wind-down tips)

### Timeline
**Section label:** "TODAY'S PLAN" — 10px, `text.dim`, weight 600, 1px letter-spacing, uppercase

**Collapsed past events:**
- Flex row: empty time column (28px) + spine column (16px) + content
- Content: colored dots (5px, 40% opacity, one per completed event) + "2 completed" text (11px, `text.dim`) + chevron ▼
- Tap to expand: shows full past events at 35% opacity

**Timeline events (3-column layout):**
- **Time column:** 28px wide, right-aligned, 9px font, `text.muted`, tabular-nums, -0.3 tracking. Padding-right 4px, padding-top 11px to align with card content.
- **Spine column:** 16px wide, centered. Line: 1.5px, `border.default`. Dots: 8px (10px when glowing).
- **Card:** flex: 1, border-radius 10px, margin-bottom 4px
  - Accent bar: 3px wide, left side, border-radius 3px 0 0 3px, color matches event type
  - Content: 9px vert / 12px horiz padding, flex space-between
  - Name: 14px, weight 600, with emoji prefix
  - Meta: 11px, `text.muted`
  - Countdown: 14px, weight 700, right-aligned, colored per type

**Card states:**
- Default: background `rgba(255,255,255,0.025)`, border `rgba(255,255,255,0.05)`
- Active (NOW): border `rgba(eventColor, 0.3)`, background `linear-gradient(90deg, rgba(eventColor, 0.06), transparent 50%)`
- Next: border `rgba(eventColor, 0.2)`
- Past: 35% opacity (when expanded from collapsed)

**Active dot animation:** box-shadow pulses between 4px and 12px blur, 1.5s ease-in-out infinite

### Floating Tab Bar
- Position: absolute, bottom 12px, left/right 14px
- Background: `rgba(11,13,22,0.9)`, backdrop-filter blur 14px
- Border-radius: 20px, border `rgba(255,255,255,0.05)`, box-shadow `0 -4px 20px rgba(0,0,0,0.3)`
- 3 tabs: Today / Schedule / Profile
- Tab text: 10px, `text.dim` (inactive), `text.secondary` (active)
- Tab icon: 18px. Active icon gets `drop-shadow(0 0 6px rgba(200,168,75,0.3))`
- Icons: SF Symbols (sparkles, calendar, person.circle) — NOT emoji

---

## Today Screen — 5 Dynamic States

### 1. Empty (No Shifts)
- Header only (no status line)
- Centered empty state: 🚀 emoji (40px), "Let's Get Started" heading (20px), description (13px, `text.tertiary`)
- Gradient CTA button: "Add Your Shifts" (`linear-gradient(135deg, #7B61FF, #C8A84B)`)
- Below: "Import from calendar" link (12px, `text.muted`, underlined)

### 2. Recovery Day (Off Day)
- Status: 🌿 Recovery Day
- Full layout: hero score + countdown row + insight + timeline
- Green-tinted score ring and glow

### 3. On Shift (Night)
- Status: 🏥 Night Shift Active
- No hero score — replaced by shift-focused countdown row (Shift ends / Sleep window / Target sleep)
- Orange-tinted insight with safety warning (sunglasses, light avoidance)
- Timeline shows "After Shift" events

### 4. Wind-down (Pre-bedtime)
- Status: 🌙 Wind-down Active
- Large centered countdown: 52px, `#818CF8`, `text-shadow: 0 0 30px rgba(129,140,248,0.2)`
- Interactive checklist (dim lights, screens off, set alarm, cool room) with ✅/⬜ toggles
- Background: `linear-gradient(180deg, #0B0D16, #0D0F22)` — darkens as bedtime approaches
- Insight: indigo-tinted with sleep target reminder

### 5. Night Sky (Sleeping)
- Full-screen overlay, triggered at bedtime
- Background: `radial-gradient(ellipse at 50% 25%, #0D1025, #060811)`
- Dismiss: × button, top-right, 28px circle with `rgba(255,255,255,0.06)` border
- Stars: 16+ positioned absolutely, 3 animation speeds (2s, 3s, 5s), opacity + scale variation
- Fireflies: 3-4 warm gold (#C8A84B) particles, 7-10s float animations, staggered delays, 1px blur
- Recharge Arc: 180px ring, 4px border `rgba(123,97,255,0.12)`, progress arc `#7B61FF` with `drop-shadow(0 0 8px rgba(123,97,255,0.5))`, slow 60s rotation, ambient 180px radial glow (4s pulse)
- Score: 44px (% in 20px, `text.muted`), "recharging" label below
- Alarm info: "⏰ 6:00 AM" (20px, weight 600), "Latest wake: 6:30 AM · 5h 45m left" (12px, `text.muted`)
- Tomorrow card: glass card with gold "TOMORROW" header, 4 rows (emoji + name + time)
- Bedtime tip: gold-bordered card with 💡 + contextual sleep tip

---

## Schedule Screen

- **Header:** "April 2026" with ◀ ▶ navigation arrows
- **Week strip:** 7 day columns (swipeable), today highlighted with gold border + background. Colored dots below dates indicate shift types.
- **Day detail:** Section label ("SATURDAY, APRIL 5"), then icon shift cards
- **Shift cards:** Glass cards with 40px emoji icon (colored background), name + time range, duration on right
- **FAB:** 48px, gradient `linear-gradient(135deg, #7B61FF, #C8A84B)`, border-radius 14px, shadow `0 4px 12px rgba(123,97,255,0.3)`, "+" icon
- **Tab bar:** Floating, Schedule tab active

---

## Profile Screen (replaces Settings)

- **Avatar header:** 56px gradient circle (purple→gold), name (17px bold), chronotype + sleep need (11px, `text.muted`), plan badge pill
- **Stats row:** 3-cell grid showing Avg Score (green), Day Streak, Avg Sleep (purple)
- **Preferences section:** Glass card with notifications count, nap preference, caffeine half-life
- **Data section:** Export schedule, Import shifts, HealthKit status (green "Connected")
- **Account section:** Upgrade to Premium (gold text + arrow), Sign Out (red text)
- **Tab bar:** Floating, Profile tab active

---

## Onboarding

- **Navigation:** Dot indicators (swipeable, 4-5 screens). Active dot: #7B61FF, 20px wide pill. Inactive: 7px circle, `#1F2937`.
- **Welcome hero:** Moon emoji (44px), gradient headline ("Sleep on Autopilot" — `linear-gradient(135deg, #fff 30%, #C8A84B)`), description (13px)
- **Feature cards:** Glass cards with 40px emoji icons (colored backgrounds), title (13px bold) + description (11px)
- **CTA:** Full-width gradient button, 14px radius, 15px font
- **Legal:** 9px centered text, `text.dim`

---

## Animation Spec (16 animations)

### Core Animations (12)
| # | Animation | Where | Duration | Details |
|---|-----------|-------|----------|---------|
| 1 | Breathing dots | Timeline active event | 1.5s loop | box-shadow 4px→12px blur |
| 2 | Pill glow | Status pill | 4s loop | box-shadow glow with state color |
| 3 | Hero glow | Score ring | 4s loop | radial opacity 0.4→1 (synchronized with ring breathing) |
| 4 | Card press | All interactive cards | 80ms spring | scale 0.97 on press |
| 5 | Insight slide-in | Insight expand on tap | 300ms ease-out | max-height 0→300px + opacity |
| 6 | Staggered load | Screen sections | 100ms intervals | fade + slide sequentially |
| 7 | Fireflies | Night Sky background | 7-10s per particle | float upward + fade |
| 8 | Star twinkle | Night Sky (3 speeds) | 2s/3s/5s | opacity + scale variation |
| 9 | Arc glow + spin | Night Sky recharge ring | 4s glow, 60s rotation | ambient pulse + slow spin |
| 10 | Background shift | Wind-down transition | Continuous | gradient darkens toward bedtime |
| 11 | Countdown tick | Wind-down large number | On minute change | subtle scale bounce |
| 12 | Tab glow | Active tab icon | 200ms transition | drop-shadow on/off |

### Elevate Animations (4)
| # | Animation | Where | Duration | Details |
|---|-----------|-------|----------|---------|
| 13 | Gradient mesh drift | App background | 20s loop | 3 radial gradients shift anchor points |
| 14 | Night Sky metamorphosis | Wind-down → Night Sky | 3-5s transition | Stars fade in, ring morphs to arc, cards dissolve |
| 15 | Scroll parallax | Hero score on scroll | Continuous | translateY at 0.6x, scale 1→0.4, compact header |
| 16 | Color temperature shift | Text white point | Continuous | Cool (#F8FAFF) to warm (#FFF5E6) based on time of day |

---

## Premium UX Features (implementation priority)

### Must-have for v1.0
- Haptic feedback on all interactions (light tap on press, success on checklist complete)
- Skeleton loading states (shimmer placeholders instead of spinners)
- SF Symbols for tab bar icons
- Tabular numerals on all countdown numbers
- Animated gradient mesh background (see Ambient Background System)

### Should-have for v1.0
- Pull-to-refresh gold shimmer animation
- Celebration moments (confetti at 90+ score, shimmer at streak milestones)
- Scroll-linked header (shrinks on scroll)

### Nice-to-have (v1.1+)
- Swipe between days on Today screen
- Long-press quick actions on timeline events
- iOS home screen widget

---

## Elevate Features (7 Standard-Setting Additions)

These go beyond premium benchmarks to set new standards for sleep/health apps.

### 1. Signature Transition: Night Sky Metamorphosis
As bedtime approaches, the Today screen **gradually transforms** — background darkens over 30 minutes, stars fade in one by one, the score ring morphs into the recharge arc, timeline cards dissolve. When the user opens the app during wind-down, a 3-5 second cinematic transition plays. This is the "show your friend" moment.
- **Implementation:** `useSharedValue` for background `interpolateColor`, staggered opacity animations on star components, layout animation on ring resize. Triggered by wind-down state activation.

### 2. Adaptive Color Temperature
The app's white point shifts throughout the day. Morning = slightly cool/bright whites (#F8FAFF). Evening = warmer, amber-shifted whites (#FFF5E6). Night = deep warm tones. This mirrors circadian biology — the app practices what it preaches. No other sleep app does this.
- **Implementation:** Time-based interpolation on `text.primary` token using `interpolateColor` based on current hour. Subtle but perceptible shift between 6 AM (cool) and 10 PM (warm).

### 3. Living Score Ring
The hero ring **breathes** — the glow expands and contracts on a 4-second cycle, synchronized with a calm breathing pace. Subconsciously, users slow their breathing to match. This is biofeedback through UI design.
- **Implementation:** Ring border opacity + glow radius oscillate on 4s `useSharedValue` cycle. Already partially implemented via `heroGlow` animation — enhance with ring border synchronization.

### 4. Haptic Storytelling
Not just tap feedback — **narrative haptics**: a gentle heartbeat pattern when viewing your sleep score, a triumphant double-tap when you hit 90+, a soft descending pattern when wind-down starts. The phone becomes a sensory extension of the app.
- **Implementation:** Custom haptic patterns via `expo-haptics`. Map patterns to state transitions: `Haptics.notificationAsync(Success)` for milestones, custom `impactAsync` sequences for state changes.
- Patterns:
  - Score view: single gentle tap
  - 90+ score: double success haptic + confetti
  - Wind-down start: 3 descending-intensity taps (heavy → medium → light)
  - Checklist complete: light success tap
  - Countdown zero: strong impact

### 5. Scroll Parallax: Score Floats Above
As the user scrolls the timeline, the hero score ring moves at 60% scroll speed — it "floats" above the content. When you scroll far enough, the ring smoothly shrinks into a compact status bar element showing just "78" in a tiny ring.
- **Implementation:** `Animated.ScrollView` + `interpolate` for `translateY` (0.6x multiplier), `scale` (1→0.4), and `opacity` (1→0) as scroll offset increases. Compact ring appears in header via `interpolate` on same scroll value.

### 6. Zero-State Excellence
Premium apps are perfect at EVERY state. Custom shimmer skeletons that match each section's exact dimensions (not generic gray bars). Error states with personality ("Hmm, we lost your schedule. Tap to reconnect."). Empty timeline days show a subtle moon illustration. Loading → content transition is seamless with matched layout animations.
- **Implementation:** Create `SkeletonLoader` variants for each section (HeroSkeleton, CountdownSkeleton, TimelineSkeleton). Custom error component with emoji + friendly copy. Layout animation (`LayoutAnimation.configureNext`) for skeleton→content swap.

### 7. Sound Design
Three custom sounds that reinforce the brand: (1) a warm chime when a countdown completes, (2) a soft completion tone on checklist items, (3) a gentle ambient fade-in when Night Sky activates. Optional and toggleable via notification preferences.
- **Implementation:** `expo-av` with 3 short audio files (<1s each). Gated behind a "Sound effects" toggle in Profile preferences. Files: `countdown-complete.mp3`, `checklist-done.mp3`, `night-sky-enter.mp3`.

---

## Ambient Background System

### Animated Gradient Mesh
Three color-matched radial gradients that slowly drift across the screen on a 20-second cycle:
- Purple orb: `rgba(123,97,255,0.06)` — sleep color family
- Gold orb: `rgba(200,168,75,0.04)` — accent color
- Green orb: `rgba(52,211,153,0.03)` — recovery color

Each orb is an ellipse (500-600px) positioned at different anchor points. Over 20s, the anchor points shift creating a gentle, living surface. Applied via `::after` pseudo-element with `animation: meshDrift 20s ease-in-out infinite`.

### Noise Texture
2.5% opacity fractal noise SVG overlay on all screen backgrounds. Applied as a pseudo-element (`::before`) on the root container, layered above the gradient mesh. Creates premium tactile depth.

Combined, the gradient mesh + noise texture make the background feel like a living, textured surface — not a flat dark rectangle.

---

## Technical Notes

### Existing code to modify
- `src/theme/` — Update color tokens (warmer backgrounds)
- `src/components/today/` — Refactor Today screen components
- `src/components/night-sky/` — Enhance with firefly particles
- `src/components/ui/Button.tsx` — Add press scale animation
- `app/(tabs)/index.tsx` — Today screen layout
- `app/(tabs)/settings.tsx` — Rename to Profile, restructure

### New components needed
- `HeroScore` — centered ring with sparkline + breathing glow + scroll parallax
- `StatusPill` — V3 boxed pill with icon + state-colored gradient
- `CountdownRow` — unified 3-cell countdown
- `InsightLine` — bottom-positioned expandable insight
- `TimelineEvent` — refactored with narrow timestamp + accent bar
- `FloatingTabBar` — glassmorphic bottom nav
- `FireflyParticle` — animated gold particle for Night Sky
- `SkeletonLoader` — shimmer placeholder (variants per section)
- `GradientMeshBackground` — animated 3-orb ambient background
- `NightSkyTransition` — cinematic metamorphosis from Today → Night Sky
- `AdaptiveColorProvider` — time-based white point shift context provider

### Dependencies
- `react-native-reanimated` (already installed) — for all animations
- `expo-haptics` — for haptic storytelling patterns
- `expo-av` — for sound design (3 audio files)

---

## Verification Plan

1. **Visual match:** Each screen matches the approved mockups in `.superpowers/brainstorm/` (master-gallery.html, final-today-locked.html)
2. **All 5 Today states:** Render correctly with appropriate status lines, colors, and content
3. **Animations:** All 12 animations run smoothly at 60fps on iPhone 12+
4. **Night Sky:** Stars twinkle at 3 speeds, fireflies float, arc glows and slowly rotates
5. **Tab bar:** Glassmorphic blur works on iOS, correct active state glow
6. **Typography:** Tabular numerals on countdowns, consistent weight hierarchy
7. **Dark mode:** All surfaces use the warmed background colors, no hardcoded values
8. **Tests:** All 172 existing tests still pass — no functional regressions
9. **Performance:** No jank on scroll, animations don't block main thread

---

## Mockup References

All approved mockups are in `.superpowers/brainstorm/24358-1775416141/content/`:
- **`final-definitive-v6.html`** — V6 definitive build target (Recovery Day pill, animated mesh background, insight at bottom)
- `definitive-composite.html` — Component composite with source annotations
- `all-versions-full.html` — V1-V6 evolution tracker
- `master-gallery.html` — All 8 screens (update to V6 during implementation)
- `timeline-fix-and-colors.html` — Timeline fix + color palette comparison
- `premium-refinements.html` — Premium design principles and before/after
- `final-premium-details.html` — Insight drawer + premium UX features + color review
