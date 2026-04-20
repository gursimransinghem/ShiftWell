# ShiftWell — Design Audit, Critique & Revamp Proposal

> **Date:** 2026-04-18
> **Author:** Head of Design & VP Marketing (AI)
> **Status:** Complete — Ready for Founder Review

---

## Part 1: Current Design Audit

### Color System
The current palette is well-structured and dark-first — the right call for a night-shift app.

| Token | Value | Usage |
|-------|-------|-------|
| Background Primary | `#080B14` | App-level background (deep navy) |
| Background Surface | `#131726` | Cards, sheets, modals |
| Background Elevated | `#1A1F35` | FABs, floating elements |
| Purple (Interactive) | `#7B61FF` | Buttons, active states, progress rings |
| Gold (Data) | `#C8A84B` | Scores, labels, data highlights |
| Text Primary | `#FFFFFF` | Main text |
| Text Secondary | `#9CA3AF` | Supporting text |
| Text Tertiary | `#6B7280` | Muted, labels |

**Block Colors:** Sleep purple `#7B61FF`, Nap lavender `#B794F6`, Night shift orange `#FF9F43`, Meal green `#34D399`, Caffeine red `#FF6B6B`, Light yellow `#FCD34D`, Wind-down indigo `#818CF8`.

**Semantic:** Success `#34D399`, Warning `#FBBF24`, Error `#FF6B6B`, Info `#4A90D9`.

### Typography
System fonts (SF Pro on iOS, Roboto on Android) with a well-defined scale from 8px to 36px. V6 design adds specialized styles: heroNumber (36px), screenHeading (28px), countdownValue (22px), cardTitle (14px), timestamp (9px tabular-nums).

For web/marketing: Inter (headings) + DM Sans (body) — good pairing documented in DESIGN_ASSETS_GUIDE.

### Icon System
Hybrid approach: Ionicons for navigation + emoji for contextual status. This is functional but creates a slight inconsistency in visual language.

### Component Library
Well-built with: Button (3 variants, 3 sizes), Card, ProgressBar, OptionCard (animated selection), GradientMeshBackground, FloatingTabBar (glassmorphic), StatusPill (3 states with glow), HeroScore (animated ring), CountdownRow (3-cell), TimelineEvent (3-column with accent bars).

### Design Maturity
V6 is locked with 7 "elevate" features including adaptive color temperature, living score ring, haptic storytelling, and night sky metamorphosis. This is surprisingly mature for a pre-launch app.

---

## Part 2: Design Critique

### What's Working Well

1. **Dark-mode-first is correct.** `#080B14` as the base is dark enough to be genuinely comfortable at 3am without being pure black (which causes halation on OLED screens). Good decision.

2. **State-driven UI is brilliant.** The 5 daily states (empty, recovery, on-shift, wind-down, night sky) mean the user always sees what's relevant. A tired nurse at 3am doesn't need to navigate — the app shows what matters *right now*.

3. **Countdown Row is high-value.** Caffeine cutoff, wind-down, and sleep times are the three things a shift worker checks most. Having them front-and-center is correct.

4. **Glassmorphic tab bar is polished.** Blur + transparency + subtle purple glow reads as premium without being distracting.

5. **Progressive disclosure in timeline.** Collapsed past events, expanded future — respects the user's attention.

### What Needs Improvement

#### Critical Issues

1. **Too many cards on the dashboard.** The recovery day state shows 12+ components in a single scroll. A tired user at 3am needs 3 things: when to sleep, when to stop caffeine, and their score. Everything else should be secondary. Recommendation: collapse into 3 tiers — hero (score + countdowns), plan (timeline), insights (expandable).

2. **Information overload on first load.** AdaptiveInsightCard, PatternAlertCard, SleepDebtCard, CircadianForecastCard, ScoreBreakdownCard, BehavioralChecklist, ScienceInsightCard — this is a dashboard for a data analyst, not a fatigued nurse. Prioritize ruthlessly.

3. **Emoji as icons creates inconsistency.** StatusPill uses 🌿/🏥/🌙, timeline uses text labels, nav uses Ionicons. Pick one system. Recommendation: move to a single icon library (Lucide or Phosphor) for UI elements, keep emoji only for personality moments (onboarding, empty states).

#### Moderate Issues

4. **9px timestamp text is too small.** Even for secondary info, 9px is below the WCAG minimum for readability. Bump to 11px minimum. Night-shift workers have fatigued eyes and may have dilated pupils in dim environments.

5. **Missing haptic hierarchy.** The code references haptic feedback on tab navigation, but the haptic patterns for different alert severities (caffeine warning vs. sleep time approaching) aren't differentiated. Haptics should escalate: light → medium → heavy as urgency increases.

6. **Onboarding is 8 steps.** That's a lot before someone sees value. Consider: 3-step fast path (chronotype → shift import → plan generated), then progressive collection of household, routines, HealthKit over the first week.

7. **No light mode exists.** While dark-first is correct, some users will want light mode during daytime recovery. The adaptive color temperature system exists but doesn't extend to a full light theme.

#### Minor Issues

8. **Gold accent (`#C8A84B`) on dark backgrounds** has a contrast ratio of ~4.2:1 against `#080B14`. Passes AA for large text but fails for body text. Use `#D4B85C` (slightly brighter) for small text instances.

9. **The "Brief" tab only shows 7 days before transition** — meaning most of the time there's a hidden tab. This is clever but could confuse users who saw it once and can't find it again.

10. **Settings screen has a merge conflict in source.** Fix before TestFlight.

---

## Part 3: Design Revamp Proposal

### Updated Color Palette

#### Dark Mode (Primary)

| Token | Current | Proposed | Rationale |
|-------|---------|----------|-----------|
| bg.primary | `#080B14` | `#080B14` | Keep — dark enough, not pure black |
| bg.surface | `#131726` | `#111827` | Slightly cooler — better card distinction |
| bg.elevated | `#1A1F35` | `#1E2640` | Warmer elevation — feels more inviting |
| accent.primary | `#7B61FF` | `#7B68EE` | Medium slate blue — slightly warmer, more approachable |
| accent.secondary | `#C8A84B` | `#E2B340` | Brighter gold — better contrast, more energetic |
| text.primary | `#FFFFFF` | `#F0F2F5` | Slightly off-white — reduces eye strain |
| text.secondary | `#9CA3AF` | `#A0AEC0` | Warmer gray — more comfortable to read |

#### Light Mode (New — For Daytime)

| Token | Value | Note |
|-------|-------|------|
| bg.primary | `#F7F8FA` | Warm white |
| bg.surface | `#FFFFFF` | Pure white cards |
| bg.elevated | `#EDF0F5` | Subtle elevation |
| accent.primary | `#6C5CE7` | Slightly deeper purple for light bg |
| text.primary | `#1A1B2E` | Near-black |
| text.secondary | `#64748B` | Cool gray |

### Typography Scale (Revised)

Minimum text size raised from 8px to 11px. Key changes:

| Style | Current | Proposed | Rationale |
|-------|---------|----------|-----------|
| timestamp | 9px | 11px | Readability for fatigued eyes |
| captionSmall | 8px | 11px | Accessibility minimum |
| sectionLabel | 10px | 11px | Consistency with minimum |
| body | 15px | 16px | Slightly larger for tired users |
| screenHeading | 28px | 28px | Keep |
| heroNumber | 36px | 40px | More impact |

Font stack stays system (SF Pro / Roboto) for native, Inter + DM Sans for web/marketing.

### Component Library Updates

#### Button Redesign
- Add a `danger` variant for destructive actions (red tint)
- Add `icon-only` variant for compact layouts
- Increase minimum height from 44px to 48px on small size
- Add loading skeleton state (not just spinner)

#### Card Refinement
- Add `card-glass` variant with backdrop blur for overlay contexts
- Add `card-highlighted` with subtle gradient left border for important items
- Reduce default border from 1px to 0.5px — lighter visual weight

#### New Component: QuickAction Bar
A horizontal scrollable row of pill-shaped actions for the dashboard, replacing the current scattered card approach. Contains: "Log Nap", "Start Wind Down", "Skip Caffeine", "View Plan".

### Key Screen Redesigns

#### Dashboard (Today Screen) — Simplified
Current state shows 12+ components. Proposed 3-tier architecture:

**Tier 1 — Glanceable (always visible, no scroll):**
- Status pill (recovery / on-shift / wind-down)
- Score ring (larger — 120px) with trend arrow
- Countdown row (3 cells: caffeine, wind-down, sleep)

**Tier 2 — Today's Plan (one scroll):**
- Timeline (compact, no cards — just accent bars + times + labels)
- QuickAction bar

**Tier 3 — Insights (pull to expand):**
- Sleep debt (if elevated)
- Pattern alert (if detected)
- Science insight (rotating)
- Weekly brief (Mondays only)

This reduces cognitive load from "scan 12 cards" to "glance at 3 numbers."

#### Onboarding — Fast Path
Current: 8 sequential screens. Proposed: 3 + deferred.

**Immediate (required):**
1. Welcome + value prop (10 seconds)
2. Chronotype quiz (3 questions, not 5 — accuracy difference is minimal)
3. Import shifts (calendar connect OR manual add)
→ Show generated plan immediately. User sees value in under 90 seconds.

**Deferred (collected over first week via gentle prompts):**
- Household configuration
- AM/PM routines
- Address (commute)
- HealthKit connection

### Logo Concepts

#### Concept A: "The Crescent Shield"
A crescent moon enclosed in a shield/badge shape. The crescent represents night work; the shield communicates protection and safety — a medical credibility signal. Color: purple-to-gold gradient on dark background.
**Rationale:** Conveys "we protect your sleep" and "medical grade." Works well at small sizes (app icon). The shield differentiates from generic sleep apps that all use crescent moons alone.

#### Concept B: "The Circadian Wave"
An abstract sine wave that transitions from deep blue (night) through purple (transition) to gold (day). The wave doubles as a heartbeat/pulse line — connecting to health monitoring. Wordmark in Inter Bold below.
**Rationale:** Communicates the core science (circadian rhythm) visually. The gradient tells the shift-work story. More modern and tech-forward than Concept A. Works well on both dark and light backgrounds.

#### Concept C: "The Adaptive Clock"
A minimalist clock face where the hour markers are replaced by dots that glow/dim based on position — bright at the "shift" hours, dim at "sleep" hours. The clock hands are replaced by a single arc that represents the current sleep window. Circle rendered with a subtle purple glow.
**Rationale:** Directly communicates the product's function — time optimization. The glowing markers tell the shift-work story without needing explanation. Most unique of the three; least conventional. Requires careful execution to avoid looking like a generic clock icon.

**Recommendation:** Concept B (Circadian Wave) for primary brand mark. It's the most versatile across contexts (app icon, website, social, merch) and most clearly communicates what ShiftWell does without explanation. Use Concept A (Crescent Shield) as the app icon specifically, since shields render well at 1024×1024 and communicate trust at a glance.

---

## Part 4: Implementation Priority

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| P0 | Dashboard simplification (3-tier) | Medium | High — reduces cognitive load dramatically |
| P0 | Minimum text size to 11px | Low | High — accessibility compliance |
| P1 | Onboarding fast path (3 steps) | Medium | High — faster time-to-value |
| P1 | Logo design (hire designer with Concept B brief) | External | High — brand identity |
| P1 | Light mode theme | Medium | Medium — daytime usability |
| P2 | Icon system consolidation | Medium | Medium — visual consistency |
| P2 | Gold contrast fix | Low | Low — small text only |
| P3 | Haptic hierarchy | Low | Low — polish |

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial creation. Complete design audit, critique (10 findings), revamp proposal (colors, typography, components, screens, 3 logo concepts), and prioritized implementation plan.
