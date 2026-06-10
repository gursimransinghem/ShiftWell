# ShiftWell Design System

## Design System Audit & Standardization Proposal

**Components reviewed:** 65 | **Issues found:** 836 | **Score:** 42/100

The design system has strong foundations — a well-structured token file, a 4pt grid, semantic color naming, and a dark-first palette designed for shift workers. The problem is adoption: 70%+ of the codebase bypasses these tokens entirely, hardcoding colors, font sizes, and spacing inline. This document captures the current state, identifies every inconsistency, and proposes a standardized system.

---

## 1. Current Design Tokens

All tokens live in `src/theme/`. The definitions are solid; the issue is underutilization.

### 1.1 Color Palette

**Source:** `src/theme/colors.ts`

#### Backgrounds

| Token | Hex | Usage |
|-------|-----|-------|
| `background.primary` | `#080B14` | App background (deep space navy) |
| `background.surface` | `#131726` | Cards, sheets, modals |
| `background.elevated` | `#1A1F35` | Floating buttons, elevated surfaces |

#### Text

| Token | Hex | Usage |
|-------|-----|-------|
| `text.primary` | `#FFFFFF` | Primary body text |
| `text.secondary` | `#9CA3AF` | Supporting text |
| `text.secondaryBright` | `#D1D5DB` | Emphasized secondary text |
| `text.tertiary` | `#6B7280` | Muted labels |
| `text.dim` | `#4B5563` | Collapsed items, section headers |
| `text.muted` | `#6B7280` | Alias for tertiary |
| `text.onAccent` | `#FFFFFF` | Text on accent-colored backgrounds |
| `text.inverse` | `#0A0E1A` | Text on light backgrounds |

#### Borders

| Token | Hex | Usage |
|-------|-----|-------|
| `border.default` | `#1F2937` | Standard card/component borders |
| `border.subtle` | `#171D2E` | Low-contrast dividers |
| `border.strong` | `#374151` | Emphasized borders |

#### Brand / Accent

| Token | Value | Usage |
|-------|-------|-------|
| `accent.primary` (Gold) | `#C8A84B` | Score highlights, premium labels, CTA text |
| `accent.primaryMuted` | `#8B6914` | Muted gold for backgrounds |
| `accent.highlight` | `#F59E0B` | Positive state accents |
| `accent.purple` | `#7B61FF` | Interactive elements, buttons, active states, progress rings |
| `accent.purpleMuted` | `rgba(123,97,255,0.15)` | Purple tint backgrounds |
| `accent.purpleGlow` | `rgba(123,97,255,0.35)` | Ambient glow/shadow tint |
| `accent.blue` (Legacy) | `#4A90D9` | Calendar block colors only |
| `accent.blueMuted` | `#3468A3` | Muted blue backgrounds |
| `gradient.purple` | `#7B61FF` | Gradient start |
| `gradient.gold` | `#C8A84B` | Gradient end |

#### Block / Timeline Colors (Calendar)

| Token | Hex | Meaning |
|-------|-----|---------|
| `block.sleep` | `#7B61FF` | Sleep blocks (purple) |
| `block.nap` | `#B794F6` | Nap blocks (light purple) |
| `block.shiftDay` | `#4A90D9` | Day shift (blue) |
| `block.shiftNight` | `#FF9F43` | Night shift (orange) |
| `block.shiftEvening` | `#FBBF24` | Evening shift (amber) |
| `block.meal` | `#34D399` | Meal windows (green) |
| `block.caffeineCutoff` | `#FF6B6B` | Caffeine cutoff (red) |
| `block.lightProtocol` | `#FCD34D` | Light exposure (yellow) |
| `block.windDown` | `#818CF8` | Wind-down period (indigo) |

#### Semantic / Feedback

| Token | Hex | Usage |
|-------|-----|-------|
| `semantic.success` | `#34D399` | Positive outcomes, checkmarks |
| `semantic.successMuted` | `#064E3B` | Success background tint |
| `semantic.warning` | `#FBBF24` | Caution states |
| `semantic.warningMuted` | `#78350F` | Warning background tint |
| `semantic.error` | `#FF6B6B` | Errors, alerts |
| `semantic.errorMuted` | `#7F1D1D` | Error background tint |
| `semantic.info` | `#4A90D9` | Informational states |
| `semantic.infoMuted` | `#1E3A5F` | Info background tint |

#### Status Pill Colors (Dynamic)

| State | Color | Token |
|-------|-------|-------|
| Recovery | `#34D399` | Maps to `semantic.success` |
| On-Shift | `#FF9F43` | Maps to `block.shiftNight` |
| Wind-Down | `#818CF8` | Maps to `block.windDown` |

### 1.2 Typography

**Source:** `src/theme/typography.ts`

#### Font Families

| Platform | Family |
|----------|--------|
| iOS | System (San Francisco) |
| Android | Roboto |

No custom fonts loaded — system fonts only.

#### Font Size Scale

| Token | px |
|-------|----|
| `2xs` | 8 |
| `3xs` | 9 |
| `xxs` | 10 |
| `xs` | 11 |
| `sm` | 13 |
| `base` | 15 |
| `lg` | 17 |
| `xl` | 20 |
| `2xl` | 24 |
| `3xl` | 30 |
| `4xl` | 36 |

#### Font Weights

| Token | Value |
|-------|-------|
| `regular` | 400 |
| `medium` | 500 |
| `semibold` | 600 |
| `bold` | 700 |

#### Line Heights

Calculated as `Math.round(fontSize * 1.4)`:

| Size | Line Height |
|------|-------------|
| 8px | 12 |
| 9px | 13 |
| 10px | 14 |
| 11px | 15 |
| 13px | 18 |
| 15px | 21 |
| 17px | 24 |
| 20px | 28 |
| 24px | 34 |
| 30px | 42 |
| 36px | 50 |

#### Pre-built Text Styles

| Style | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|-------------|----------------|
| `heading1` | 36 (4xl) | 700 | 50 | — |
| `heading2` | 30 (3xl) | 700 | 42 | — |
| `heading3` | 24 (2xl) | 600 | 34 | — |
| `body` | 15 (base) | 400 | 21 | — |
| `bodySmall` | 13 (sm) | 400 | 18 | — |
| `caption` | 11 (xs) | 400 | 15 | — |
| `label` | 13 (sm) | 500 | 18 | 0.3 |

#### V6 Additions

| Style | Size | Weight | Letter Spacing | Notes |
|-------|------|--------|----------------|-------|
| `heroNumber` | 36 | 700 | — | — |
| `screenHeading` | 28 | 700 | -0.5 | — |
| `countdownValue` | 22 | 700 | -0.5 | — |
| `cardTitle` | 14 | 600 | — | — |
| `meta` | 11 | 500 | — | — |
| `sectionLabel` | 10 | 600 | 1 | uppercase |
| `timestamp` | 9 | 500 | -0.3 | — |
| `captionSmall` | 8 | 500 | — | — |

### 1.3 Spacing Scale

**Source:** `src/theme/spacing.ts`

4pt base grid:

| Token | px |
|-------|----|
| `xs` | 4 |
| `sm` | 8 |
| `md` | 12 |
| `lg` | 16 |
| `xl` | 20 |
| `2xl` | 24 |
| `3xl` | 32 |
| `4xl` | 40 |

### 1.4 Border Radius

| Token | px | Usage |
|-------|----|-------|
| `sm` | 6 | Small chips, badges |
| `md` | 10 | Input fields |
| `lg` | 14 | Cards, standard components |
| `xl` | 20 | Large cards, modals |
| `full` | 9999 | Pills, circular elements |

#### V6 Radius Additions

| Token | px | Usage |
|-------|----|-------|
| `pill` | 14 | Status pills |
| `countdown` | 18 | Countdown cards |
| `tabBar` | 22 | Floating tab bar |
| `timelineCard` | 12 | Timeline event cards |

### 1.5 Shadow / Elevation

No centralized shadow token file exists. Shadows are defined inline per component:

| Component | shadowColor | shadowRadius | shadowOpacity | elevation (Android) |
|-----------|-------------|-------------|---------------|---------------------|
| Timeline Active Dot | `#FFFFFF` | 6 | 0.4 | 6 |
| Timeline Next Dot | `#FFFFFF` | 8 | 0.3 | 4 |
| Status Pill | Dynamic (state color) | 12 | 0.06–0.14 (animated) | 4 |
| Firefly Particle | `#C8A84B` | 2 | 0.8 | — |
| Recharge Arc | `#7B61FF` | 8 | 0.5 | — |

**Gap:** No `SHADOWS` token object. Every shadow is hardcoded per component.

### 1.6 Animation Durations & Easing

No centralized animation token file. Values scattered across components:

| Duration | Usage | Component |
|----------|-------|-----------|
| 100ms | Quick feedback | OptionCard, MonthView |
| 200ms | Scale/layout transitions | OptionCard, MonthView |
| 250ms | Default fade-in + slide-up | AnimatedTransition |
| 300ms | Progress bar fill | ProgressBar |
| 700ms | Opacity pulse | ShiftReviewList |
| 800ms | Opacity fade | LightProtocolArc |
| 1200ms | Breathing dot | TimelineEvent (next) |
| 1500ms | Breathing glow | TimelineEvent, StatusPill, RechargeArc |
| 2000ms | Ambient breathing | HeroScore, StatusPill, RechargeArc |
| 7000–10000ms | Particle drift | FireflyParticle |
| 20000–28000ms | Background orb drift | Ambient orbs |
| 60000ms | Full 360° rotation | RechargeArc |

#### Easing Functions Used

| Easing | Usage |
|--------|-------|
| `Easing.inOut(Easing.sin)` | Smooth sinusoidal for ambient motion |
| `Easing.linear` | Continuous rotation |
| Spring (damping: 20, stiffness: 400) | Button press feedback |

**Gap:** No `ANIMATION` or `MOTION` token object. All durations and easings are inline constants.

---

## 2. Component Inventory

### 2.1 Shared / Reusable Components

**`src/components/ui/`** — 9 components, exported via `index.ts`:

| Component | Description | Variants/States |
|-----------|-------------|-----------------|
| `Button` | Primary CTA with spring animation | primary, secondary, ghost / sm, md, lg / loading, disabled |
| `Card` | Theme-aware container | padding toggle |
| `ProgressBar` | Determinate progress indicator | — |
| `OptionCard` | Selectable option with press animation | selected/unselected |
| `TimeRangePicker` | Hour/minute picker | — |
| `GradientMeshBackground` | Animated ambient background | — |
| `SkeletonLoader` | Loading placeholders | Hero, Countdown, Timeline, Insight variants |
| `ReferralCard` | Referral/sharing prompt | — |
| `AnimatedTransition` | Generic fade-in + slide wrapper | configurable duration |

### 2.2 Domain Components

**`src/components/calendar/`** — 6 components:
MonthView, DayDetail, CalendarToggleList, CalendarSettingsSection, CalendarProviderCard, ShiftReviewList

**`src/components/circadian/`** — 2 components:
LightProtocolArc, LightProtocolStrip

**`src/components/navigation/`** — 1 component:
FloatingTabBar

**`src/components/night-sky/`** — 6 components:
NightSkyOverlay, NightSkyTransition, RechargeArc, StarParticles, FireflyParticle, BedtimeTipCycler

**`src/components/outcomes/`** — 1 component:
OutcomeDashboard

**`src/components/recovery/`** — 3 components:
RecoveryScoreCard, SleepComparisonCard, WeeklyTrendChart

**`src/components/today/`** — 23 components:
TimelineEvent, CountdownCard, CountdownRow, TipCard, InsightBanner, SchedulePreview, StatusPill, HeroScore, InsightLine, NapCalculatorModal, OutcomeDashboardCard, PatternAlertCard, AdaptiveInsightCard, WeeklyBriefCard, CircadianForecastCard, BehavioralChecklist, HRVCalibrationBanner, ScienceInsightCard, ScoreBreakdownCard, SleepDebtCard, WellnessCard, WindDownView, CollapsedPast

**`src/components/settings/`** — 1 component:
WeeklyBriefToggle

**`src/components/ai/`** — 1 component:
BriefFeedbackRow

**`src/components/providers/`** — 1 component:
AdaptiveColorProvider

**Root `src/components/`** — 1 component:
AutopilotActivationCard

### 2.3 Components That Should Be Shared But Aren't

These patterns are duplicated across screens and should be extracted to `src/components/ui/`:

| Pattern | Where It's Duplicated | Proposed Component |
|---------|----------------------|--------------------|
| Glass card (frosted surface) | `profile.tsx` (GlassCard), `paywall.tsx`, `settings.tsx` | `GlassCard` |
| Card row (icon + label + value) | `profile.tsx` (CardRow), `settings.tsx`, `outcomes.tsx` | `ListRow` |
| Card divider | `profile.tsx` (CardDivider), multiple screens | `Divider` |
| Section header (uppercase label) | 10+ screens, each with inline styling | `SectionHeader` |
| Icon button (icon-only pressable) | `brief.tsx`, `MonthView.tsx`, `NapCalculatorModal.tsx` | `IconButton` |
| Toggle row (label + switch) | `settings.tsx`, `WeeklyBriefToggle.tsx` | `ToggleRow` |
| Stat display (value + label) | `profile.tsx`, `OutcomeDashboard.tsx`, `RecoveryScoreCard.tsx` | `StatDisplay` |
| Empty state | Multiple screens, inconsistent patterns | `EmptyState` |
| Score color function | `circadian.tsx`, `brief.tsx`, `HeroScore.tsx` — duplicated `getScoreColor()` | Utility function in theme |

### 2.4 Missing Components

| Component | Need | Priority |
|-----------|------|----------|
| `Text` (themed) | Wraps RN Text with typography presets — would eliminate 334 inline fontSize declarations | Critical |
| `IconButton` | Standardize icon-only buttons with proper touch targets and a11y labels | High |
| `Divider` | Consistent visual separator | Medium |
| `SectionHeader` | Uppercase label with consistent spacing | Medium |
| `ListRow` | Icon + label + value/chevron pattern | Medium |
| `ToggleRow` | Label + switch with consistent layout | Medium |
| `Badge` / `Chip` | Status indicators, tags | Medium |
| `Modal` (base) | Consistent modal chrome (backdrop, close button, padding) | Medium |
| `EmptyState` | Consistent empty state with icon + message + action | Low |
| `Tooltip` | Contextual help for complex features | Low |

---

## 3. Consistency Audit

### 3.1 Hardcoded Colors — 321 instances

**Severity: HIGH**

Despite a comprehensive `colors.ts`, 321 hex/rgba values are hardcoded across components and screens instead of referencing tokens.

**Top offenders by color:**

| Color | Instances | Should Be |
|-------|-----------|-----------|
| `#C8A84B` | ~20 | `COLORS.accent.primary` |
| `rgba(255,255,255,*)` | ~18 | Needs new `COLORS.overlay.white*` tokens |
| `#7B61FF` | ~15 | `COLORS.accent.purple` |
| `#34D399` | ~12 | `COLORS.semantic.success` |
| `#FF6B6B` | ~8 | `COLORS.semantic.error` |
| `#FB923C` | ~8 | `COLORS.semantic.warning` |
| `#22C55E` | ~5 | Not in token set — add or map to success |
| `#EAB308` | ~4 | Not in token set — add or map to warning |
| `#EF4444` | ~3 | Not in token set — add or map to error |

**Top offenders by file:**

| File | Hardcoded Colors |
|------|-----------------|
| `app/(tabs)/brief.tsx` | 20+ |
| `app/(tabs)/circadian.tsx` | 15+ |
| `app/(tabs)/index.tsx` | 14+ |
| `app/(tabs)/profile.tsx` | 12+ |
| `app/(tabs)/schedule.tsx` | 10+ |
| `src/components/circadian/LightProtocolArc.tsx` | 6 |

**Example violations:**

```tsx
// brief.tsx — should use COLORS.semantic.success
<Ionicons name="checkmark" size={40} color="#22C55E" />

// circadian.tsx — duplicated score-color logic with hardcoded hex
if (score >= 85) return '#34D399';
if (score >= 70) return '#C8A84B';
if (score >= 55) return '#FB923C';
return '#FF6B6B';

// profile.tsx — should use COLORS.accent.primary
<Text style={[styles.planBadgeText, isPremium ? { color: '#C8A84B' } : ...]}>
```

### 3.2 Inconsistent Spacing — 31 instances

**Severity: LOW-MEDIUM**

Most spacing uses the 4pt grid correctly. 31 values break the grid:

| Value | Instances | Issue |
|-------|-----------|-------|
| 1px | 3 | Micro-adjustment, no token |
| 2px | 5 | Half of `xs` — no token |
| 5px | 2 | Not on grid |
| 6px | 3 | Not on grid |
| 11px | 1 | Not on grid |

Most violations are in `NapCalculatorModal.tsx`, `LightProtocolArc.tsx`, and `CountdownRow.tsx`. These are fine-tuning adjustments for visual alignment, but they indicate the spacing scale may need a `2xs` (2px) token.

### 3.3 Button Inconsistencies — 85% ad-hoc

**Severity: MEDIUM**

Of ~104 interactive elements across the app, only 15–20 use the shared `Button` component. The remaining 85 use raw `Pressable` or `TouchableOpacity` with custom styling.

| Approach | Count | % |
|----------|-------|---|
| Shared `Button` component | ~15–20 | 15–20% |
| Raw `Pressable` | ~60–70 | 60–70% |
| Raw `TouchableOpacity` | ~20–25 | 20–25% |

**Issues this creates:** inconsistent press feedback (some use opacity, some use scale, some use color change), inconsistent border radius, inconsistent padding, inconsistent disabled states, and missing accessibility attributes.

### 3.4 Typography Inconsistencies — 334 inline fontSize declarations

**Severity: MEDIUM**

The typography system defines 15 text presets. Approximately 70% of the codebase ignores them and hardcodes font sizes directly.

**Pattern observed:** Components import `FONT_SIZE` or `TEXT_STYLES` but then use numeric literals anyway:

```tsx
// Common anti-pattern (found in 70%+ of components)
fontSize: 14   // Should be TEXT_STYLES.cardTitle or FONT_SIZE.sm

// Correct pattern (found in ~30% of components)
...TEXT_STYLES.body
```

**Off-scale values found:** `fontSize: 12` (not in token set), `fontSize: 28` (not in preset set but close to `screenHeading`), `fontSize: 18` (between `lg` 17 and `xl` 20).

### 3.5 Audit Score Breakdown

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Token definitions (completeness) | 20% | 85/100 | 17 |
| Token adoption (usage rate) | 25% | 25/100 | 6.25 |
| Component reuse | 20% | 30/100 | 6 |
| Naming consistency | 10% | 70/100 | 7 |
| Accessibility | 15% | 40/100 | 6 |
| Documentation | 10% | 0/100 | 0 |
| **Total** | **100%** | — | **42.25** |

---

## 4. Proposed Design System

### 4.1 New Token Architecture

Consolidate all tokens into a single `src/theme/tokens.ts` file (or keep separate files but add missing shadow and animation tokens):

#### Proposed Shadow Tokens

```typescript
// src/theme/shadows.ts

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  glow: (color: string, opacity = 0.35) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: opacity,
    shadowRadius: 12,
    elevation: 4,
  }),
} as const;
```

#### Proposed Animation Tokens

```typescript
// src/theme/motion.ts

export const MOTION = {
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    breathing: 1500,
    ambientSlow: 2000,
    ambientDrift: 20000,
  },
  easing: {
    smooth: Easing.inOut(Easing.sin),
    linear: Easing.linear,
  },
  spring: {
    button: { damping: 20, stiffness: 400 },
    card: { damping: 15, stiffness: 200 },
  },
} as const;
```

#### Additional Color Tokens Needed

```typescript
// Add to colors.ts
overlay: {
  white10: 'rgba(255,255,255,0.10)',
  white20: 'rgba(255,255,255,0.20)',
  white40: 'rgba(255,255,255,0.40)',
  white60: 'rgba(255,255,255,0.60)',
  black40: 'rgba(0,0,0,0.40)',
  black60: 'rgba(0,0,0,0.60)',
},
```

#### Score Color Utility (eliminate duplication)

```typescript
// src/theme/utils.ts

export function getScoreColor(score: number): string {
  if (score >= 85) return COLORS.semantic.success;
  if (score >= 70) return COLORS.accent.primary;
  if (score >= 55) return COLORS.semantic.warning;
  return COLORS.semantic.error;
}
```

### 4.2 Themed Text Component

The single highest-impact change. Eliminates 334 inline fontSize declarations:

```typescript
// src/components/ui/Text.tsx

import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { TEXT_STYLES, COLORS } from '@/theme';

type TextVariant = keyof typeof TEXT_STYLES;

interface ThemedTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
}

export function Text({
  variant = 'body',
  color = COLORS.text.primary,
  style,
  ...props
}: ThemedTextProps) {
  return (
    <RNText
      style={[
        TEXT_STYLES[variant],
        { color },
        style,
      ]}
      {...props}
    />
  );
}
```

**Usage:**
```tsx
// Before (current)
<Text style={{ fontSize: 24, fontWeight: '600', color: '#FFFFFF' }}>Title</Text>
<Text style={{ fontSize: 13, color: '#9CA3AF' }}>Subtitle</Text>

// After (proposed)
<Text variant="heading3">Title</Text>
<Text variant="bodySmall" color={COLORS.text.secondary}>Subtitle</Text>
```

### 4.3 Component Naming Conventions

**Directory structure:**
```
src/components/
  ui/              # Shared primitives (Button, Card, Text, etc.)
  calendar/        # Calendar domain components
  circadian/       # Circadian visualization
  navigation/      # Nav components
  night-sky/       # Bedtime experience
  outcomes/        # Outcomes tracking
  recovery/        # Recovery/readiness
  today/           # Today dashboard cards
  settings/        # Settings-specific
  ai/              # AI-powered features
  providers/       # Context providers
```

**Naming rules:**
- PascalCase file names matching the default export: `Button.tsx`, `GlassCard.tsx`
- Domain prefix only when ambiguous: `CalendarToggleList` (not `ToggleList` which is generic)
- Suffix `Modal` for modals, `Card` for card-style components, `Row` for list items, `Banner` for dismissible banners
- Each directory has an `index.ts` barrel export

### 4.4 Screen Layout Templates

Four canonical layouts cover all 30 screens:

#### List Screen (Schedule, Settings)

```
┌─────────────────────────┐
│  Screen Heading (28px)  │
│  ← screenHeading style  │
├─────────────────────────┤
│  [Filter/Toggle Bar]    │  ← Optional
├─────────────────────────┤
│  ┌───────────────────┐  │
│  │  List Item        │  │  ← Card with SPACING.lg padding
│  └───────────────────┘  │
│  ┌───────────────────┐  │  ← SPACING.sm gap between items
│  │  List Item        │  │
│  └───────────────────┘  │
│         ...             │
├─────────────────────────┤
│     [Floating Tab Bar]  │  ← 22px radius, blur backdrop
└─────────────────────────┘
```

**Spacing:** `paddingHorizontal: SPACING.lg (16)`, `paddingTop: SPACING.lg (16)`, `gap: SPACING.sm (8)`

#### Detail Screen (Day Detail, Circadian Detail)

```
┌─────────────────────────┐
│  ← Back    Title        │  ← Header with navigation
├─────────────────────────┤
│  ┌───────────────────┐  │
│  │  Hero Visualization│  │  ← Full-width, prominent
│  └───────────────────┘  │
├─────────────────────────┤
│  Section Label          │  ← sectionLabel style (10px, uppercase, ls: 1)
│  ┌───────────────────┐  │
│  │  Content Card     │  │  ← Standard card (14px radius, 1px border)
│  └───────────────────┘  │
│  Section Label          │
│  ┌───────────────────┐  │
│  │  Content Card     │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

#### Dashboard Screen (Today, Profile)

```
┌─────────────────────────┐
│  Status Pill            │  ← Animated, top-center
│  Hero Score / Avatar    │  ← Large, animated
│  Countdown Row          │  ← 3-cell horizontal strip
├─────────────────────────┤
│  Timeline / Cards       │  ← ScrollView with card stack
│  ┌───────────────────┐  │
│  │  Card 1           │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │  Card 2           │  │
│  └───────────────────┘  │
├─────────────────────────┤
│     [Floating Tab Bar]  │
└─────────────────────────┘
```

**V6 layout spacing:** `headerToStatus: 16`, `statusToHero: 20`, `heroToCountdown: 16`, `countdownToTimeline: 16`

#### Onboarding Screen (8 steps)

```
┌─────────────────────────┐
│  Progress (step X of 8) │  ← ProgressBar component
├─────────────────────────┤
│                         │
│  Heading (heading2)     │
│  Subheading (body)      │
│                         │
│  [Input / Selection]    │  ← OptionCard grid or form
│                         │
├─────────────────────────┤
│  [Primary Button]       │  ← Full-width, lg size, bottom-pinned
│  [Skip / Back]          │  ← Ghost button, optional
└─────────────────────────┘
```

### 4.5 Dark Mode Considerations

ShiftWell is dark-mode-only (forced via `app.json` → `userInterfaceStyle: "dark"`). Design decisions for a shift worker audience:

**Color rationale:** The palette deliberately avoids bright blues at night. Primary accent is warm gold (`#C8A84B`) and purple (`#7B61FF`) — lower melanopic lux impact than blue-white light. Background is deep navy (`#080B14`) rather than pure black, which reduces OLED pixel strain and feels less harsh.

**Contrast targets:**
- Primary text (#FFFFFF) on primary bg (#080B14): 19.2:1 (AAA)
- Secondary text (#9CA3AF) on primary bg (#080B14): 7.3:1 (AA)
- Tertiary text (#6B7280) on primary bg (#080B14): 4.1:1 (AA for large text only)
- Gold accent (#C8A84B) on primary bg (#080B14): 7.6:1 (AA)
- Purple accent (#7B61FF) on primary bg (#080B14): 4.8:1 (AA for large text, fails for small)

**Action item:** Purple accent on dark background fails WCAG AA for small text (4.5:1 required). Either lighten the purple to `#9B8AFF` (~5.5:1) or restrict purple to large text / non-text indicators only.

---

## 5. Accessibility Baseline

### 5.1 Current State

| Metric | Count | Coverage |
|--------|-------|----------|
| Interactive elements | ~104 | — |
| `accessibilityRole` | 33 | 32% |
| `accessibilityLabel` | 30 | 29% |
| `accessibilityHint` | 4 | 4% |
| `accessible` prop | 0 | 0% |
| `importantForAccessibility` | 0 | 0% |
| `testID` | 0 | 0% |

### 5.2 What's Working

The `Button` component and `MonthView` calendar have proper accessibility attributes:

```tsx
// Button.tsx — good pattern
<Pressable
  accessibilityRole="button"
  accessibilityState={{ disabled: isDisabled }}
  ...
>

// MonthView.tsx — good pattern
<Pressable
  accessibilityRole="button"
  accessibilityLabel={format(day, 'EEEE, MMMM d')}
  ...
>
```

Tab navigation is ~80% accessible. Calendar interactions are ~60%.

### 5.3 WCAG 2.1 AA Gaps

**Contrast failures:**
- Purple accent (`#7B61FF`) on dark bg (`#080B14`): 4.8:1 — fails AA for small text (requires 4.5:1, but uncomfortably close; fails AAA at 7:1)
- Tertiary text (`#6B7280`) on surface bg (`#131726`): ~3.5:1 — fails AA for normal text
- Dim text (`#4B5563`) on primary bg: ~2.8:1 — fails AA entirely; should only be decorative

**Touch targets:**
- Minimum touch target defined as 44px (correct per WCAG 2.5.8)
- Some icon-only buttons use `hitSlop` to expand touch area, but the visual target is smaller than 44px
- `MonthView` date cells may be undersized on smaller devices

**Missing screen reader support:**
- 40+ interactive elements lack `accessibilityLabel`
- Icon-only buttons (close, dismiss, nav arrows) have no text alternative
- Complex visualizations (LightProtocolArc, HeroScore, WeeklyTrendChart) lack `accessibilityValue` or descriptive labels
- No `accessibilityLiveRegion` for dynamic content (countdown updates, score changes)

**Keyboard/focus:**
- No explicit `focusable` management
- No skip-navigation or focus trapping in modals
- Tab order not explicitly managed

**Motion:**
- No `reduceMotion` / `accessibilityReduceMotionEnabled` checks
- Multiple breathing/pulsing/drifting animations run continuously with no way to disable
- Should use `useReducedMotion()` from react-native-reanimated to conditionally disable

### 5.4 Priority Accessibility Fixes

| Fix | Impact | Effort |
|-----|--------|--------|
| Add `accessibilityLabel` to all 40+ unlabeled interactive elements | High | Low |
| Add `useReducedMotion()` check to all ambient animations | High | Medium |
| Fix purple-on-dark contrast for small text usage | Medium | Low |
| Add `accessibilityValue` to score/progress indicators | Medium | Low |
| Add `accessibilityLiveRegion="polite"` to countdown/status updates | Medium | Low |
| Add `testID` to all interactive elements for automation | Medium | Medium |
| Add focus management to modals (NapCalculatorModal, etc.) | Medium | Medium |
| Remove dim text (`#4B5563`) from any informational context; restrict to purely decorative use | Low | Low |

---

## 6. Implementation Roadmap

### Phase 1 — Token Completion (1–2 hours)

Create `src/theme/shadows.ts` and `src/theme/motion.ts`. Add overlay color tokens and `getScoreColor()` utility. Update `src/theme/index.ts` barrel export.

### Phase 2 — Themed Text Component (2–3 hours)

Build `Text` component in `src/components/ui/Text.tsx`. Migrate the 10 most-used screens from inline fontSize to `<Text variant="...">`. This alone eliminates ~200 of the 334 typography violations.

### Phase 3 — Extract Missing Shared Components (3–4 hours)

Extract `GlassCard`, `IconButton`, `Divider`, `SectionHeader`, `ListRow`, `ToggleRow` from screen files into `src/components/ui/`.

### Phase 4 — Color Token Adoption (3–4 hours)

Systematic find-and-replace: swap all 321 hardcoded hex values for token references. Start with the 5 worst-offender files (brief, circadian, index, profile, schedule).

### Phase 5 — Accessibility Pass (2–3 hours)

Add labels to all 40+ unlabeled elements. Add `useReducedMotion()` guards. Fix contrast issues. Add `testID` props.

### Phase 6 — Button Standardization (2–3 hours)

Audit all 85 ad-hoc Pressable/TouchableOpacity buttons. Migrate to shared `Button` or new `IconButton` where appropriate. Accept that some (tab bar items, calendar cells) are legitimately custom but should still follow consistent press feedback patterns.

**Estimated total:** 13–19 hours across 6 phases. Phases 1–2 deliver the most impact per hour.

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial creation. Tokens extracted from src/theme/colors.ts, typography.ts, spacing.ts. Component inventory from full src/components/ scan (65 components). Consistency audit found 321 hardcoded colors, 334 inline font sizes, 31 off-grid spacing values, 85% ad-hoc buttons, 62% a11y coverage. Score: 42/100.
