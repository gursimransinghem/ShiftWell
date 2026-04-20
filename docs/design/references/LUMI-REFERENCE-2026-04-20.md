# Lumi Design Reference — Distillation for ShiftWell

> **Date:** 2026-04-20
> **Source:** Instagram carousel by @airesearches — "7/ Build UI in one shot," posted 2026-04-19 (~9h before this file was created)
> **Artifact:** `Lumi` — a 4-theme iOS prototype built in a single Claude Code session from a clean screen-inventory brief
> **Purpose:** Structural reference for the ShiftWell premium-tier revamp. We borrow composition patterns, typographic rhythm, and system ideas — **not** voice, aesthetic, or category.

Screenshots (≈30) live in `./lumi-screenshots/` once Sim drops them in. That folder is gitignored.

---

## What Lumi is

A mindfulness / manifestation / journal prototype. 5-tab app: **Today · Journal · Manifest · Insights · You**. Built around "rituals" (morning journal, gratitude, manifestation). Features: mood tracker, guided journaling, manifestation list with progress, insights dashboard with mood chart + moon-phase correlation + word cloud, profile with streaks.

Ships with a **Tweaks** panel — a dev/settings side panel with 4 themes: **Sunrise** (light warm peach), **Twilight** (light cool lavender), **Midnight** (dark), **Forest** (light earth). State persists to `localStorage`. A dev-jumper corner hops between any screen.

The whole thing — onboarding, home, 4-mode journal, manifest list + creation flow, insights, profile, 4 themes — was built in **one shot** from a screen-by-screen brief. That's the operational model we're adopting for ShiftWell's website revamp and Welcome-screen work.

---

## What ShiftWell borrows (STRUCTURE, not voice)

### 1. Serif + italic-emphasis headline pattern

Lumi uses a serif display face with one italic word per headline to create rhythm. Examples:

- "Tell me *who you are.*"
- "Why are you *here?*"
- "When shall we *whisper?*"
- "The pattern *of your month.*"
- "Send your intentions *to the universe.*"
- "Create your *own ritual.*"

Every screen has this structure: Line 1 upright serif → Line 2 italic serif fragment. The italic word is where the emotional emphasis lives.

**ShiftWell translation** (physician-voice, not spiritual):
- Tagline lockup: `Work. Life. Sleep. *Rebalanced.*` (the "Rebalanced" is italic serif)
- Insights headline: "Where did *your sleep* go?"
- Brief screen: "What *shift's* next?"
- Debt card: "You're *in debt.*" (followed by "4.2 hrs over 7 days")
- Welcome: "Your life doesn't stop. *Your sleep shouldn't either.*"

### 2. Question-based screen headers

Lumi doesn't label screens ("Settings", "Journal"). It asks questions: "Why are you here?", "What's inside you today?", "When shall we whisper?" Gives every screen a conversational entry point.

**ShiftWell translation** — applied sparingly to surfaces where it matches the voice (not in data dashboards):
- Fast-path onboarding Screen 1: "What's your chronotype?" (already in place)
- Fast-path onboarding Screen 2: "Show us your schedule."
- Paywall: "Ready to sleep on purpose?" (as section break, not headline)

Skip for Today dashboard, Schedule, Insights — those stay label-based because fatigued users at 3am don't want to parse questions.

### 3. All-caps tracked labels

Lumi pairs the serif headlines with tiny all-caps tracked sans labels that act as eyebrow tags:

- "TODAY'S INTENTION" · "TODAY'S RITUALS" · "THIS WEEK'S MOTTO"
- "MOOD · THIS WEEK" · "YOUR MONTH IN WORDS" · "MOON · MOOD CORRELATION"
- "MANIFESTED" · "LONGEST STREAK" · "SETTINGS"

These labels do the navigation work while the serif does the emotional work.

**ShiftWell translation:**
- "TONIGHT'S PLAN" (above timeline)
- "DEBT · 7 DAYS" (above debt card)
- "THIS WEEK'S PATTERN" (above pattern alert)
- "NEXT SHIFT · STARTS IN 4H 12M" (countdown eyebrow)

### 4. Narrative insights over bare numbers

Lumi doesn't say "18 entries, 65% positive sentiment." It says:

> *"You wrote 18 entries this month — 65% touched by softness."*

The numbers are bold (serif), the narrative wraps them. Same data, 10× more memorable.

**ShiftWell translation** (citation-anchored, not feelings):
- *"You slept 4.2 hrs less this week — 2 nights in red recovery."*
- *"Your last 3 night shifts: recovery averaged 58. Two bad nights, one decent."*
- *"You're running a 12-hour sleep debt. Belenky tier 3. Expect reaction time +45%."* (with citation tooltip)

Voice is pragmatic-clinical, not soft. But the narrative-wrapping-numbers pattern applies.

### 5. Word cloud for patterns

Lumi's Insights screen has a "YOUR MONTH IN WORDS" section:

> peace · *soft* · home · *morning* · love · *quiet* · breath · *light* · return · slow · open · *becoming*

Varying weight/italic/size creates visual rhythm without a chart. Each word is extracted from the user's journal entries.

**ShiftWell translation** — "THIS WEEK IN SIGNALS" word cloud on Insights screen:
- sleep · *recovery* · nap · *light* · wind-down · *2am* · debt · *missed* · bright · *cutoff* · shift · rebound

Words pulled from the user's actual plan: block types, alert tags, state labels. Varying size by frequency, italic for the "hot" signals (debt, missed, cutoff).

### 6. Large serif number + sans label stat cards

Lumi's Profile stats row: three flat cards, each with a huge serif number and a tiny sans label beneath.

- **24** Entries · **12** Streak · **3** Wishes

**ShiftWell translation** — Profile stats row:
- **78** Avg score · **12h** Debt · **3d** Streak

### 7. Gradient-mesh card backgrounds

Lumi's Manifest cards and Ritual tiles use soft radial gradient meshes (lavender→peach→purple) as the full card background. No illustration, no photo — just colored light.

**ShiftWell translation** — replace the current flat card backgrounds on Plan tiles with subtle gradient meshes:
- Tonight's sleep block: purple → gold (dusk→dawn)
- Caffeine cutoff: red-soft → dark (warning, not alarm)
- Nap window: lavender → peach (rest)

### 8. 5-tab floating bottom bar

Lumi: Today · Journal · Manifest · Insights · You. Icon + small label, outline style, glassmorphic background, active tab filled.

**ShiftWell current:** 3-tab (Today / Schedule / Profile) per V6 audit.
**ShiftWell translation (per plan C4):** 5-tab for premium feel — Today · Schedule · Brief · Insights · You. Only show Brief when ≤7 days out from next shift.

### 9. Single-purpose screens, generous whitespace

Every Lumi screen has one action. No card stacking, no competing CTAs. The "Why are you here?" screen is a full viewport with 6 chips and a Continue button — half the screen is negative space.

**ShiftWell translation:**
- Fast-path onboarding applies this exactly (per plan C4.2)
- Paywall: reduce visual density, give each pricing tier room to breathe
- Empty states: single illustration + one-line copy + one CTA

### 10. First-person greeting personalization

"Good night, *Kray.*" The serif makes it feel hand-written. The first name is italic.

**ShiftWell translation:**
- "Good morning, *Sim.* You're 2h short." (time-of-day aware, status-aware)
- "Tonight's plan, *Sim.*" (at bedtime)
- "Welcome back, *Sim.* Your next shift starts in 6h."

### 11. Restraint as the premium signal

Nothing about Lumi screams. There's no "Get Premium!" banner, no countdown timer, no flashing red badge. It earns attention by refusing to demand it. The premium feel is the *absence* of desperation.

**ShiftWell translation:**
- Today dashboard 3-tier architecture (per plan C4.3) applies this
- Paywall de-urgency (per plan C4.4) applies this
- No badges, no exclamation-mark copy, no gradient CTAs with glow animations beyond the subtle purple accent
- Hero score ring pulses slowly, doesn't shimmer

---

## What ShiftWell REJECTS from Lumi (voice, not structure)

Lumi is a wellness/spiritual app. Its copy lives in language that would destroy ShiftWell's physician-credibility moat:

**Forbidden vocabulary:**
- "whisper," "ritual," "universe," "manifest," "stars," "intentions"
- "softness," "bloomed," "tending gently," "seed planter"
- "The ink is listening…" / "Begin wherever feels true…" / "A gentle nudge to return to yourself"
- "Energy rises as the moon fills" / "You bloom around the waxing gibbous"
- "Manifestation" as a feature concept — it's pseudoscience, violates anti-scam principles

**Forbidden aesthetic defaults:**
- Light-mode-primary — ShiftWell is dark-first (Midnight default), light theme is secondary
- Pastel-heavy gradients that signal "wellness app" — ShiftWell uses gradients sparingly, always with a data purpose
- Soft emotional illustrations — ShiftWell uses typography + real app screenshots

**Forbidden framing:**
- "Return to yourself" / "the self you're becoming" — ShiftWell is not a self-help app
- Emotional-state tracking as primary metric — ShiftWell's primary metrics are recovery score + sleep debt + adherence (data, not feelings)

**ShiftWell's voice stays:** physician-built, citation-anchored, pragmatic, mission-first. *"Lumi's composition. Manifesto's authority."*

---

## System patterns to replicate from Lumi's build

### 1. Tweaks panel = 4-theme system

Lumi ships Sunrise / Twilight / Midnight / Forest as first-class themes, not hidden settings. User picks their vibe, state persists.

**ShiftWell theme plan** (per plan C4.1):
- **Midnight** — current dark-first tokens, default for new users active on night shifts
- **Twilight** — soft dusk palette, wind-down state, evening use
- **Sunrise** — light-mode for daytime recovery use (closes the design-audit P1 gap)
- **Aurora** — alternate dark with deep blue + gradient accents, for users who want variety

Exposed in Profile → Theme. Sheet picker with live preview. AsyncStorage persistence via ThemeProvider.

### 2. Dev-jumper corner (internal only)

Lumi's prototype has a corner button that opens a list of every screen for instant navigation. Shipped because it's a prototype; we gate behind `__DEV__` so Metro strips it from release builds.

**ShiftWell implementation** (per plan C4.5):
- `app/_dev/jumper.tsx` — full screen list
- `src/components/common/DevJumperButton.tsx` — floating corner trigger
- Gated: `if (!__DEV__) return null;`
- Invaluable for App Store screenshot capture and one-shot UAT on specific states

### 3. One-shot build pattern

The entire Lumi prototype was built by handing Claude a screen-by-screen brief and letting it build the whole thing in one pass. No Figma, no scaffold, no incremental commits. Output: single-file HTML prototype with embedded state management, themes, and a Tweaks panel.

**ShiftWell application:**
- **Part C2 (website revamp):** Full rewrite of `website/index.html` in one pass from a section-by-section brief. Already a single file; keeps being one.
- **Part C4.2 (fast-path onboarding):** Build `app/(onboarding)/fast/welcome.tsx` + `shifts.tsx` + `plan.tsx` + `_layout.tsx` in one pass from a screen-by-screen brief.
- **Part C1 (logo tournament):** Five parallel Claude Design sessions, each building their lane's full output (SVG + 4 renderings + lockup) in one shot.

---

## Extended Claude Design capabilities (reference deck screens 9–12)

Screens 9, 10, 11, 12 of the @airesearches carousel show Claude Design isn't just UI — it ships:

### Screen 9 — Social media carousels
"Three posts. One beat." — 3-post cinematic video loops (1080×1080) with AI-rendered imagery + minimal serif text ("onwards." / "to the next one." / "looking ahead."). Drop directly into Instagram / LinkedIn / X.

**ShiftWell application:** The Tier-1 launch carousel described in `docs/marketing/SOCIAL-MEDIA-LAUNCH-PLAN-2026-04-18.md` is exactly this format. Produce the 3-post set directly in Claude Design instead of Canva/Figma.

### Screen 10 — Sprite-based video animation
A Nintendo trivia animation built from a single prompt, with a recorder button that exports to MP4.

**ShiftWell application:** Landing page hero loop (C2) — animate the "Import shifts → Get plan → Export to calendar" sequence as a short MP4 or Lottie. Same tool for the App Store preview video (C3).

### Screen 11 — Dark-mode data dashboard
"Used Claude Design and Opus 4.7 to design a personal dashboard." A dense, dark, multi-panel layout: calendar strip (13/14/15/16/17/**18**/19), timeline list (Studio deep work, Sync – Maya & Theo, Run – Prospect Park loop, Dinner w/ Eliza), email inbox panel, top-right stats (09:16 local time, 7,842 steps), circular progress rings (72/74 pulse, 54/18 battery), audio player with waveform ("Harvest Moon"), right-side project checklist with % progress.

**This is the ShiftWell v2.0 North Star.** Not v1.1 scope — but it proves the aesthetic endpoint is reachable. Full distillation in `LUMI-DASHBOARD-2026-04-20.md`.

### Screen 12 — Product motion replication
"Tested Claude Design motion using a past video with full inputs." ME vs CLAUDE side-by-side: recreated a Trade On The Go product film with full animation + typography. Result is indistinguishable.

**ShiftWell application:** 15-second App Store preview video showing Today-screen state transitions (Recovery → On-Shift → Wind-Down → Night Sky). Delivered via Claude Design, not After Effects.

---

## Revised C1 approach — Claude Design over Fiverr

Original plan proposed Fiverr/99designs vs DIY Figma for icon/logo. **Replace both** with a Claude Design tournament:

1. Spawn 5 parallel Claude Design sessions (one per creative lane: Fulcrum / Bioluminescent curve / Astronomical / Möbius / Geometric wordmark)
2. Each session produces SVG source + 4 renderings (app icon 1024², favicon 32², wordmark lockup, social avatar) + fulcrum-divider tagline mockup + rationale
3. Aggregate into `assets/brand/BRAND-TOURNAMENT-2026-04-20.md` for side-by-side review
4. Sim picks winner via AskUserQuestion with preview SVGs inline
5. Winner gets refined in a second Claude Design pass
6. Final exports land in `assets/images/icon.png`, `assets/images/splash-icon.png`, `website/logo-mark.svg`, `website/favicon.png`, `website/og-image.png`

**Budget:** $0. **Time:** hours, not weeks. **Ceiling:** proven by Lumi itself. If no concept earns "people want to wear this," fall back to external designer post-beta.

---

## Decision log

| Decision | Rationale |
|---|---|
| Borrow structure, reject voice | Lumi's composition works in dark-first, physician-voice translation. Its language does not — it's pseudo-spiritual. |
| Adopt 4-theme Tweaks panel | Closes design-audit P1 gap (no light mode), adds variety without adding feature debt. Midnight stays default. |
| Dev-jumper for QA + screenshots | Cuts App Store screenshot capture time by ~80%. Gated behind `__DEV__`, zero production cost. |
| One-shot build for website + fast-path onboarding | Matches Sim's "end-to-end, no splitting" workflow preference. Aligns with proven Lumi delivery pattern. |
| Claude Design over Fiverr for brand assets | $0 budget, hours not weeks, tournament explores the space before converging. |

---

## Source

- Instagram carousel: `@airesearches` — "7/ Build UI in one shot"
- Posted: 2026-04-19 (≈9h before this file, per Instagram timestamp)
- Screenshots (≈30) in `./lumi-screenshots/` — gitignored, PNGs from Sim's camera roll
- Referenced in: plan `/Users/sima/.claude/plans/show-me-the-artifacts-replicated-badger.md`
- Used as: structural reference only. ShiftWell voice stays physician-built / science-led.
