# ShiftWell Cross-Analysis: Industry Best Practices vs. Current State

> **Purpose:** Action plan mapping design intelligence findings against ShiftWell's current state.
> **Audience:** ED physician founder making concrete build/write/design decisions.
> **Sources:** SHIFTWELL_MASTER_BRIEF.md + SCIENCE_FIRST_DESIGN_INTELLIGENCE.md
> **Date:** 2026-05-01
> **Status:** Definitive — treat every section as a to-do list, not a reading exercise.

---

## 1. Where ShiftWell is Already Industry-Leading

These are genuine competitive advantages today. Defend and amplify them — they require no build work to claim.

**1.1 Archetype correctness.** ShiftWell's deep space navy + warm gold + purple palette lands in the "Scientific Soul" archetype (Brain.fm, Endel, Ritual territory) — the correct archetype for a skeptical, clinically-trained audience. The Design Intelligence report states: "Purple is used by NO competitor as a primary color." The palette is a genuine differentiator.

**1.2 Dark-mode-first architecture.** Night Sky Mode, GradientMeshBackground with animated orbs, and the star-field welcome animation put ShiftWell ahead of every direct competitor. Timeshifter, Arcashift, and SleepSync are all effectively light-mode apps with a dark option. ShiftWell is built from the inside out for 3am in a hospital room. This is pre-built premium UI that competitors cannot retrofit quickly.

**1.3 Citation depth.** ShiftWell has 14 citable peer-reviewed sources embedded in the algorithm. No direct competitor — including Timeshifter (which has a scientific advisory board) — surfaces inline citations on individual recommendation cards. The Design Intelligence report confirms this gap is "unoccupied by any competitor as of May 2026."

**1.4 The closed-loop calendar system.** Calendar → Algorithm → Plan → Calendar Export → Feedback. No competitor does this full loop. RISE gives you a sleep debt number. Timeshifter gives you a light exposure schedule. Peaks visualizes your Two-Process Model energy wave. None of them write back to your calendar. This is a structural moat, not just a feature advantage.

**1.5 Live Activities already built.** The Live Activities service is complete. The Design Intelligence report identifies "StandBy Mode as ambient circadian clock" and "Sleep Focus FocusFilter integration" as unoccupied by any competitor. ShiftWell is already ahead of the build — it just needs correct implementation details (see Section 8).

**1.6 Physician founder as trust signal.** The Design Intelligence report notes Function Health uses "Dr. Mark Hyman as CMO" and that the physician authority is "the foundational trust signal." ShiftWell's founder is not an advisor — the founder is an ED physician who works nights and built the app for themselves. That is a more powerful trust story than any competitor has. It is currently underused in copy.

**1.7 30-day trial length.** RevenueCat 2025 data shows >14-day trials convert at 44.9% vs. 31.2% for ≤4-day trials. ShiftWell's 30-day trial is already optimally positioned, and it maps to the clinical recommendation: 30 days is the actual science-backed period for circadian realignment. The trial length is both a conversion optimization and a science argument.

---

## 2. Critical Gaps vs. Industry Leaders (Ranked)

Ranked by: (Impact on conversion/retention) × (Effort to close). High-impact + low-effort gaps are first.

| Rank | Gap | Best-in-Class Benchmark | Recommendation for ShiftWell | Effort |
|------|-----|------------------------|------------------------------|--------|
| 1 | **No visual proof matched to claims** — no circadian phase diagram, no before/after sleep quality graph in app or marketing | Brain.fm (EEG heatmaps), Levels (glucose curves), Eight Sleep (hypnograms) | Build 2 specific visuals: (a) overlapping circadian arc vs. work schedule arc, (b) 30-day alignment improvement graph. Use for website hero and App Store screenshot 2. | 1–2 days (design only; no code) |
| 2 | **Anti-claim positioning not yet live** — no "ShiftWell is not X" statement anywhere in marketing | Brain.fm: "Brain.fm is not binaural beats." Eight Sleep: "Sleep fitness, not a mattress company." | Commit to Option A: "ShiftWell is not a sleep tracker." Place in landing page position 1, App Store screenshot 1 caption, onboarding screen 1. | 2 hours (copy decision + paste into assets) |
| 3 | **Website not live** — blocks all pre-launch organic acquisition | Levels, Oura, Function Health — all use science-first 12-section homepage | Build the 12-section homepage specified in Section 3 of this document. Single Webflow/Next.js page. Priority: ship fast over perfect. | 3–5 days |
| 4 | **Onboarding has 12 screens using multi-question architecture** — current flow does not follow one-question-per-screen | Noom (113 screens, one question each), RISE, Monument | Redesign to 5-screen core flow (Section 7 of this document). Add aha moment on screen 3. Aha moment before paywall is the highest single conversion lever. | 2–3 days (code) |
| 5 | **No paywall animation** — static paywall converts 2.9x worse than animated (RevenueCat 2025) | All top 10% apps: animated paywall backgrounds, sequential card fade-in, pulsing CTA | Wire Night Sky Mode star-field animation (already built) as paywall background. Sequential reveal for plan cards. Pulse on CTA button. | 4–6 hours (code) |
| 6 | **Today screen is 1,033 lines with no hero metric architecture** — data density creates anxiety | WHOOP (3 circular dials, nothing else), Oura (One Big Thing) | Refactor to one hero metric (Alignment Score ring) + three sub-metrics + Next Action card. Master Brief flags this as a refactor anyway. | 3–4 days (code) |
| 7 | **No color-semantic card backgrounds** — alignment state not expressed through full-card color | Eight Sleep (whole card shifts color), WHOOP (background changes with recovery state) | When alignment score ≥70%: Recovery card background shifts to gold-navy gradient. When ≤35%: shifts to cool navy-muted gradient. One CSS/style change per card. | 4–8 hours (code) |
| 8 | **Recommendation cards have no inline citation layer** — "Why?" tap not implemented | Design Intelligence report states this is "unoccupied by any competitor" — ShiftWell should own it | Add 3-layer card structure: (1) Action + timing, (2) Personalized reason, (3) "Why?" tap → citation. See Section 5 for copy pattern. | 1–2 days (code) |
| 9 | **No weekly intelligence report** — Oura identifies this as their #1 retention driver | Oura weekly report: alignment trend + one win + one recommendation + science anchor | Build weekly push notification + in-app summary card. The Claude API weekly brief generator is already built — surface it as a formatted card. | 1 day (code) |
| 10 | **Proxy social proof not established** — no "used by ED nurses, ICU nurses" language in app or store | Function Health: "160 tests your doctor never orders" + named specialties | Add: "Used by ED nurses, ICU nurses, and ER physicians" to App Store description, landing page Layer 5, and paywall. Zero code required. | 1 hour (copy) |

---

## 3. Website/Landing Page: Section-by-Section Wireframe Spec

Current state: single conversion-focused page planned, not live. Build this 12-section structure.

---

**Section 1 — ANTI-CLAIM HOOK**
- Purpose: Define the category by exclusion; attract the skeptical, high-value user who dismisses wellness apps
- Headline: "ShiftWell is not a sleep tracker."
- Supporting copy: "Your Oura ring can't tell your body clock it's 6 hours behind your schedule. We can."
- Visual: Full-width dark navy gradient (#0B0D16), large white type, minimal. No phone mockup here.
- Science placement: None in this section. Trust is not earned by data — it is earned by a claim that resonates before data.

---

**Section 2 — CATEGORY STATEMENT**
- Purpose: Name what ShiftWell is; create the category
- Headline: "A circadian engine for people who work when everyone else is asleep."
- Supporting copy: "Import your shift schedule. ShiftWell reads your body clock, generates a personalized plan for sleep, naps, light, meals, and caffeine — then exports it back to your calendar."
- Visual: 3-step icon strip (calendar in → brain/arc → calendar out)
- Science placement: None yet. Category clarity first.

---

**Section 3 — HERO VISUAL + PRIMARY CTA**
- Purpose: Make the core insight viscerally legible in a single image
- Headline: "Your body clock runs on biology. Your shift schedule doesn't care."
- Visual: Dual-arc circadian phase diagram — gold arc (body clock) vs. blue arc (shift schedule), clearly misaligned, labeled. This is the claim-matched visual that Brain.fm uses EEG heatmaps for. The mismatch made visible is worth more than any product screenshot.
- CTA: "Start your 30-day alignment — Free"
- Sub-CTA text: "No credit card required. 30 days free."
- Science placement: Below the CTA, in small text: "Based on Eastman & Burgess (2009) circadian shifting protocols."

---

**Section 4 — THE PROOF ROW**
- Purpose: Transfer institutional credibility before the user reads a single feature claim
- Content: Three items, logos only, no explanatory text. Left to right: NIOSH/CDC logo | AASM logo | AHA (American Heart Association) logo
- Visual: Centered row, small logos, muted white, no captions. Clean.
- Science placement: Hover/tap reveals: "ShiftWell's algorithm implements [institution] guidelines for shift worker sleep optimization."

---

**Section 5 — THE PROBLEM STATEMENT**
- Purpose: Make the problem visceral through specific numbers; make the user feel seen
- Headline: "700 million shift workers. No app built for them."
- Stat cards (3):
  - "32% of US healthcare workers report short sleep" — (subtitle: "That's 1 in 3 nurses and physicians")
  - "10–38% of night shift workers develop Shift Work Sleep Disorder" — (Drake et al. 2004)
  - "Circadian disruption increases cardiovascular disease risk by 29%" — (AHA Scientific Statement 2025)
- Visual: Dark stat cards, warm gold numbers, white supporting text. Not an infographic — looks like a peer-reviewed table.
- Copy: "Every sleep app was built for people who sleep at night. If you rotate nights, their advice is wrong for your biology."
- Science placement: Citation inline on each stat card.

---

**Section 6 — HOW IT WORKS**
- Purpose: Reduce complexity to 3 legible steps; destroy the "setup friction" objection before it forms
- Headline: "Three steps to a plan your calendar already understands."
- Step 1: "Import your shift schedule" — Calendar icon. Sub: "Connect your shift calendar or build your rotation pattern. ShiftWell reads your shifts, not just your sleep."
- Step 2: "Your circadian plan generates automatically" — Arc/brain icon. Sub: "A deterministic algorithm — not AI guessing — calculates your optimal sleep, nap, light, meal, and caffeine windows based on your rotation."
- Step 3: "Your plan exports to your calendar" — Calendar-out icon. Sub: "Every recommendation becomes a calendar event. Your phone already knows what to do."
- Visual: Three phone screens, sequential, connected by subtle arrows. Dark mode, real app UI.
- Science placement: Below step 2: "Algorithm based on the Two-Process Model (Borbely 1982) and five published circadian protocols."

---

**Section 7 — THE SCIENCE SECTION**
- Purpose: The full 5-layer credibility stack for the user who is deciding whether to trust the claims
- Headline: "Not wellness opinion. Published science."
- Layer 1 (Institution): "NIOSH CDC guidelines for shift worker sleep. AASM Clinical Practice Guidelines (2023)."
- Layer 2 (Publication venues): Cite venues: *Science* (Czeisler 1990), *Sleep* (Drake 2004), AHA Scientific Statement (2025). Display journal logos or named text.
- Layer 3 (Specific numbers): "10–38% SWSD prevalence. 29% increased CV risk. 23-minute circadian shift per properly timed light protocol."
- Layer 4 (Visual proof): Show the circadian phase diagram again here, labeled with the Czeisler 1990 data. Or a stylized hypnogram showing improved sleep architecture across 30 days.
- Layer 5 (Social proof — proxy): "Built by an ED physician who works nights. Beta tested with rotating-shift ICU nurses and ER physicians." (Specificity of role substitutes for scale, per Design Intelligence report.)
- Visual: Citation cards with expandable detail. Dark cards, gold accent on venue names.

---

**Section 8 — DIFFERENTIATION TABLE**
- Purpose: Close the tab the user is about to open to compare competitors; honest comparisons convert skeptics
- Headline: "What makes ShiftWell different. Honestly."
- Table columns: Feature | ShiftWell | Timeshifter | RISE | WHOOP/Oura

| Feature | ShiftWell | Timeshifter | RISE | WHOOP / Oura |
|---|---|---|---|---|
| Calendar import + read | Yes | No | No | No |
| Calendar export (plan writes back) | Yes | No | No | No |
| Rotating shift patterns | Yes | Jet lag only | No | No |
| Inline peer-reviewed citations | Yes | No | No | No |
| 30-day free trial | Yes | 7 days | 7 days | No trial |
| Dark-mode-first | Yes | No | No | Partial |
| Built by a shift worker | Yes (ED physician) | No | No | No |

- Copy below table: "We built the comparison table ourselves. If we're wrong, email us."
- Science placement: Footnote: "Feature comparison based on public-facing App Store listings and product documentation, May 2026."

---

**Section 9 — FOUNDER STORY**
- Purpose: Make the physician founder a trust signal, not a bio line; differentiate from advisor-board credibility
- Headline: "Built by an ED physician who works nights."
- Copy: "I've worked rotating shifts in the emergency department for [X] years. I've read every sleep app review on r/nursing. None of them account for a body clock that runs 6 hours behind the solar clock. So I built one that does. The algorithm in ShiftWell implements the same circadian protocols I teach to residents. It works because the science works — and I use it myself every rotation."
- Visual: Founder photo in clinical setting, or a simple dark-background portrait. Not stock. Real.
- Science placement: "Algorithm implements Eastman & Burgess (2009), Czeisler et al. (1990), NIOSH protocols."

---

**Section 10 — TESTIMONIALS**
- Purpose: "Works in the real world for people like you" — role-specific specificity substitutes for scale
- Headline: "From the night shift."
- Card format: Quote | Name, Role, Years on nights | Dark card, gold accent
- Target testimonials to collect during beta: ICU nurse (nights 5+ years), ER nurse, EMS/paramedic, ER physician
- Placeholder until beta complete: "Beta testing with rotating-shift ICU nurses and ER physicians at launch."
- Visual: Dark cards, no photos required (privacy-preserving), role badge instead of photo.

---

**Section 11 — PRICING**
- Purpose: Trial-first framing removes price as an objection; tie trial length to the science
- Headline: "30 days free. Because that's how long circadian realignment actually takes."
- Pricing cards:
  - Monthly: $9.99/month — "Full access, cancel anytime"
  - Annual: $49.99/year ($4.17/month) — "Commit to the full protocol. Save 58%." — highlighted as recommended
- CTA: "Begin 30-Day Alignment — Free"
- Sub-CTA: "No credit card required. No charge for 30 days."
- Science placement: "30 days maps to the clinically recommended circadian adjustment window for rotating shift workers."

---

**Section 12 — STICKY FOOTER CTA**
- Purpose: Capture decision-ready users who scroll to the bottom without acting
- Content: "Your shift schedule and your body clock are not aligned. They could be." | CTA button: "Start Free — 30 Days"
- Visual: Minimal dark bar, always visible on scroll past Section 3.
- Science placement: None — action moment only.

---

## 4. App Design: Screen-by-Screen Priority Improvements

### Today Screen

**Current state:** Central daily plan view, 1,033 lines, flagged for refactor. Data density unknown but refactor-flagged implies too much.

**Gap identified:** The Design Intelligence report cites WHOOP's 3-dial standard as the industry gold standard: "Every elite app respects cognitive load at entry and rewards curiosity with depth." A 1,033-line component almost certainly violates this.

**Specific change recommendation:**
Refactor to this exact hierarchy:
1. Hero: Alignment Score ring (single large number, semantic color, gold/purple/red based on score)
2. Three sub-metrics below: Sleep Quality | Schedule Sync | Next Action
3. Next Action card: one recommendation, full 3-layer card (Action → Reason → "Why?" tap for citation)
4. Remaining plan blocks below the fold — accessible by scroll, not competing with the hero

**Visual/UX direction:** Apply Eight Sleep's color-semantic card background principle. When alignment ≥70%, the hero card background shifts to a warm gold-navy gradient. When ≤35%, cool navy-muted. The background is the data. The number confirms it.

---

### Onboarding Welcome Screen

**Current state:** 12-screen flow. First screen presumably is the welcome/value prop screen.

**Gap identified:** The Design Intelligence report identifies the anti-claim as the most powerful opening move: "The anti-claim hook comes before any positive claim." The current tagline "ShiftWell connects your work calendar to your body clock" is a positive claim. It should be preceded by the anti-claim.

**Specific change recommendation:**
Screen 0 (new, before current screen 1): Full-bleed dark screen, star-field animation, single line:
> "Not a sleep tracker. A circadian engine."

Sub-line: "Built for people who work when everyone else is asleep."
Single button: "See how it works →"

This creates the category before the user forms a "just another sleep app" association. It takes 5 seconds to see and adds no friction.

**Visual/UX direction:** Star-field welcome animation already exists — use it here. This is the correct placement for the premium feel moment.

---

### Plan View Screen

**Current state:** Plan view exists (Schedule tab). Specific layout not detailed in Master Brief.

**Gap identified:** The Design Intelligence report recommends the Timeshifter horizontal timeline format for action windows: "Horizontal timeline with color-coded bars — best used for action scheduling." Timeshifter does this well. ShiftWell should do it better by adding the depth Timeshifter lacks (inline citations, personalized reasons, feedback).

**Specific change recommendation:**
Implement the horizontal timeline as the primary Plan View layout:
- X-axis: 24 hours
- Block types: Sleep (deep navy), Light exposure (warm gold), Caffeine window (amber), Meal window (soft teal), Nap (purple)
- Tap any block: expands to 3-layer card (action → personalized reason → citation)
- Block color follows semantic system (gold = aligned, purple = transitional, red = caution)

**Visual/UX direction:** Color-coded horizontal bars, dark background. The visual should look like a Timeshifter schedule that is also citable. This is a unique combination no competitor has.

---

### Paywall Screen

**Current state:** RevenueCat paywall, 30-day trial, complete. Static (assumed).

**Gap identified:** "Animated paywalls convert 2.9x better than static (RevenueCat 2025)." The Night Sky Mode animation is already built. It is not being used as paywall background.

**Specific change recommendation:**
1. Set Night Sky Mode star-field as animated paywall background at low intensity (~30% opacity)
2. Plan cards fade in sequentially (300ms stagger), not all at once
3. CTA button: subtle shimmer or pulse (not aggressive flash — premium feel)
4. Change headline from generic to: "Start your 30-day circadian alignment"
5. Add personalization: "Built for [3-12 rotating nights]" using the shift pattern they input in onboarding
6. Annual plan: label it "Recommended" with a warm gold border

**Visual/UX direction:** The paywall should feel like the app, not like a modal. The animation proves the quality of what they're about to get.

---

## 5. Brand Voice & Microcopy: Before/After Rewrites

Ten specific rewrites. Apply these verbatim — they are not suggestions.

**Push Notification Copy**

1. Push — bedtime approaching:
   **Before:** `"Time to wind down. Your bedtime is approaching."`
   **After:** `"Your body started producing melatonin 22 minutes ago. Your sleep window opens in 38 minutes."`

2. Push — morning after night shift:
   **Before:** `"Good morning! Don't forget to log your sleep."`
   **After:** `"Night shift complete. Your recovery window is open until 2pm. Sleep now — your circadian nadir passes at 4am."`

**Recommendation Card Copy**

3. Sleep window card:
   **Before:** `"Your sleep window is 9am–5pm."`
   **After:** `"Sleep 9am–5pm today. Your circadian nadir falls at 3am tonight — sleeping now puts your recovery window exactly where your biology wants it. [Czeisler 1990]"`

4. Light exposure card:
   **Before:** `"Get bright light exposure this morning."`
   **After:** `"15 minutes of bright light before 8am today. Your phase advance from last night's shift requires a light anchor to reset your clock forward. [Eastman & Burgess 2009]"`

**Onboarding Screen Copy**

5. Schedule input screen:
   **Before:** `"Tell us about your work schedule."`
   **After:** `"What's your shift pattern? (Your answer drives your entire plan — this is the most important question.)"`

6. Circadian adjustment explanation:
   **Before:** `"Your circadian rhythm may take some time to adjust."`
   **After:** `"Most shift workers feel worse for the first 10–14 days of circadian realignment. That's the algorithm working correctly, not failing. Your body is catching up to your schedule."`

**Paywall CTA**

7. Primary CTA:
   **Before:** `"Start Free Trial"`
   **After:** `"Begin 30-Day Alignment"`

8. Paywall sub-copy:
   **Before:** `"Get access to all features. Cancel anytime."`
   **After:** `"Your full plan is ready. 30 days free to see it work. No charge until Day 31."`

**Error/Empty State Copy**

9. No shift data yet:
   **Before:** `"No shifts added yet. Add your first shift to get started."`
   **After:** `"No schedule yet. Without your shift pattern, ShiftWell is just a clock. Import your calendar or build your rotation to get your plan."`

10. Alignment score unavailable:
    **Before:** `"Not enough data to calculate your score."`
    **After:** `"Your alignment score needs 3 nights of data. It's calculating. Check back after your next shift."`

---

## 6. Science Proof: ShiftWell's Visual Evidence Strategy

### Five Visualization Concepts (ShiftWell's equivalent of EEG heatmaps)

The Design Intelligence report is explicit: "Visual proof is matched to claim type, not to general 'infographic' aesthetics." Each of these maps to a specific claim ShiftWell makes.

**Visualization 1: The Circadian Mismatch Arc**
- Claim it proves: "Your body clock and your schedule are not aligned"
- What it looks like: Two overlapping sinusoidal arcs — gold (endogenous circadian rhythm) and blue (shift schedule demand). The gap between them is shaded red. At the bottom, a label: "You are living [X] hours behind your biology."
- Where to use: Website hero section, App Store screenshot 2, onboarding screen 3 (personalized with their actual offset)
- This is the highest-priority visualization to build. Everything else is secondary.

**Visualization 2: The 30-Day Alignment Curve**
- Claim it proves: "ShiftWell works over 30 days"
- What it looks like: A line graph, x-axis = days 1–30, y-axis = alignment score. The line starts low (circadian debt visible), dips slightly in days 7–10 (the "worse before better" adjustment period), then rises steadily to high alignment by day 28–30. The dip is labeled: "Normal adjustment period."
- Where to use: Website science section, App Store screenshot 3, inside the paywall
- The dip is important — it sets expectation and prevents churn at the most vulnerable moment (week 2)

**Visualization 3: The Sleep Architecture Hypnogram**
- Claim it proves: "ShiftWell improves sleep quality, not just duration"
- What it looks like: Two hypnograms side by side: "Before ShiftWell (Month 1)" vs. "After ShiftWell (Month 2)." Standard PSG format — REM/Light/Deep stages plotted over the sleep window. Month 2 shows more deep sleep, more REM, fewer awakenings.
- Where to use: Website science section, App Store screenshot 4 (when HealthKit real data wiring is complete)
- Note: Requires real HealthKit data — this is a post-HealthKit-fix deliverable

**Visualization 4: The Circadian Energy Wave**
- Claim it proves: "ShiftWell tells you when to perform, sleep, and eat based on your actual circadian position"
- What it looks like: A flowing continuous wave (Peaks-style Two-Process Model visualization) overlaid with colored vertical bands: gold = peak performance windows, navy = sleep windows, amber = meal windows. The user's shift schedule is shown as a bar at the top, letting them see where they're working relative to their biology.
- Where to use: Today screen (in-app), Schedule tab as secondary view
- This is already computable from the circadian algorithm — it needs a visualization layer only

**Visualization 5: The Shift Transition Map**
- Claim it proves: "ShiftWell handles the hardest part of shift work — the transition between rotation patterns"
- What it looks like: A 7-day calendar grid. Day 1–3: night pattern (dark background). Days 4–5: transition (gradient, showing the body clock sliding). Days 6–7: day pattern (lighter). Overlaid: sleep recommendations, light timing marks, meal windows. The visual makes the transition concrete.
- Where to use: Marketing, website Section 6 (How It Works), onboarding screen 4 (capability proof)

---

### Which Citations to Feature on the Website and in What Format

| Citation | Layer | Format | Placement |
|---|---|---|---|
| AHA Scientific Statement (2025) | 1 — Institution | AHA logo + "2025 Scientific Statement" badge | Section 4 proof row + Section 7 science section |
| NIOSH/CDC guidelines | 1 — Institution | CDC logo badge | Section 4 proof row |
| Czeisler et al. (1990), *Science* | 2 — Publication | "*Science* journal" with issue reference | Section 7, expandable citation card |
| Drake et al. (2004) | 3 — Specific number | "10–38% SWSD prevalence" stat card | Section 5 problem statement |
| AHA 2025 | 3 — Specific number | "29% increased CV risk" stat card | Section 5 problem statement |
| Borbely (1982) | 2 — Publication | "Two-Process Model — foundational sleep science" | Section 6 How It Works, algorithm explanation |
| Eastman & Burgess (2009) | 2 — Publication | Named inline in Visualization 1 caption | Section 3 hero, Visualization 1 |

**Format:** Citation cards on the website should look like paper abstracts — white text on dark card, venue name in gold, year prominent, one-sentence plain-language summary below the formal citation. Tappable for DOI link. This visual language signals rigor to the user who is testing whether to trust the claims.

---

### The Anti-Scam Positioning Statement — Committed

**ShiftWell commits to Option A:**

> "ShiftWell is not a sleep tracker. Your Oura ring can't tell your body clock it's 6 hours behind your schedule. We can."

Use this verbatim in: website Section 1 (hero), App Store screenshot 1 caption, onboarding screen 0 (new pre-welcome screen).

**Technical demolition follow-on** (use in website Section 1 body copy, 2 sentences below the anti-claim):
> "Sleep trackers measure what already happened. They cannot model what your body clock will do next, or how your shift schedule is displacing it. ShiftWell reads your shift rotation and runs a deterministic circadian model — the same mathematics used in aviation fatigue research — to tell your body what time it actually is."

**The generous reframe** (use in website Section 1, last sentence):
> "You could think of ShiftWell as a sleep tracker that reads body time instead of clock time. Except it also fixes it."

---

### The Category Name ShiftWell Should Own

**Own: "Circadian Engine"**

Not "sleep app." Not "wellness app." Not "sleep tracker." A circadian engine is distinct from all three and immediately implies a level of precision and mechanism that tracker/app/wellness language cannot claim.

Usage:
- Tagline modifier: "ShiftWell: The Circadian Engine for Shift Workers"
- App Store subtitle: "Circadian Engine for Shift Workers"
- Website Section 2 category statement: "Not a sleep app. A circadian engine."
- Competitive table header: "Feature | ShiftWell (Circadian Engine) | Sleep Trackers | Jet Lag Apps"

This framing positions every competitor in a lower category and makes ShiftWell the first and only entrant in the category it creates.

---

## 7. Onboarding: Recommended 5-Screen Flow

One question per screen. No screen should require the user to make more than one decision or answer more than one question.

---

**Screen 1 — ROLE HOOK**
- Screen name: "Who You Are"
- Purpose: Make the first question validate, not interrogate. The user immediately sees ShiftWell was built for them.
- Headline: "What kind of shift worker are you?"
- Question/content: Selection grid (not a form):
  - ICU/ED Nurse
  - ER Physician / Resident
  - EMS / Paramedic
  - Fire / Police
  - Hospital (other)
  - Other shift work
- Visual: Dark background, selection cards with subtle icons, warm gold highlight on tap
- Data collected: Role category — used for personalized copy throughout onboarding and app, and for proxy social proof ("Used by [role]")
- Note: No "next" button — selecting a card advances automatically. This reduces friction and signals that the app already knows where they're going.

---

**Screen 2 — SHIFT PATTERN INTAKE**
- Screen name: "Your Rotation"
- Purpose: The core data collection moment. This is ShiftWell's fundamental differentiator — own the complexity, don't hide it.
- Headline: "What's your shift pattern?"
- Question/content: Three mode cards:
  - "Import my shift calendar" (preferred — explains: "Connect Google Calendar or iOS Calendar")
  - "Build my rotation" (pattern builder: 4-week visual grid, tap to fill days, assign shift types)
  - "I'll enter manually" (fallback: shift type, start/end time, rotation pattern)
- Visual: The pattern builder mode shows a 4-week calendar grid — users tap to fill shifts. The visual grid creates the first "my data" investment moment.
- Data collected: Shift schedule — the engine input that drives all subsequent recommendations
- Aha moment setup: The more detailed the input here, the more specific the aha moment on screen 3.

---

**Screen 3 — AHA MOMENT**
- Screen name: "Your Circadian Picture"
- Purpose: Deliver the personalized insight before asking for money. This is the conversion hinge screen.
- Headline: "Here's what your schedule is doing to your body clock."
- Content: Show the Circadian Mismatch Arc visualization (Visualization 1), personalized with their actual offset calculated from their Screen 2 input. Below the visual:
  - "Your body clock is currently set for [11pm–7am based on your pattern]. Your schedule demands [7pm–5am]. You're living approximately [2 hours] behind your biology."
  - "That 2-hour displacement is why you feel [tired at shift start / can't sleep after nights / [other common symptoms for their rotation type]]."
- Visual: Full-screen arc diagram, gold body clock arc, blue schedule arc, labeled offset. Beautiful and specific.
- Data collected: Nothing new — this screen delivers, not collects.
- Aha moment delivery: THIS is the aha moment. Every word must be specific to their data. "Approximately [X] hours" with their actual number. A generic statistic here kills the conversion.

---

**Screen 4 — CAPABILITY PROOF**
- Screen name: "Your Plan Preview"
- Purpose: Show what ShiftWell will actually do for this specific person's schedule, not generic features
- Headline: "Here's what ShiftWell will build for you."
- Content: A blurred/previewed version of their actual 7-day plan — sleep windows, light timing, caffeine cutoffs, nap opportunities — overlaid with a lock icon. The content is real (computed from their Screen 2 input) but the detail is locked.
  - "Your sleep window for [next shift date]: [9am–5pm]"
  - "Your caffeine cutoff tomorrow: [2pm]"
  - "Light protocol for your transition this [day]: [morning light 6:30–7:15am]"
- Sub-copy: "Your full 30-day alignment plan is ready."
- Visual: Blurred plan view behind a frosted glass overlay. The user can see the structure but not the specifics. The plan is visually rich — timeline bars, colored blocks.
- Data collected: Nothing — this screen creates desire.

---

**Screen 5 — PAYWALL**
- Screen name: "Begin Alignment"
- Purpose: Convert while emotional investment is at peak; the user is evaluating their own circadian health, not the product's price
- Headline: "Start your 30-day circadian alignment."
- Subhead: "Your plan is ready. 30 days free to see it work."
- Personalization line: "Built for [rotating nights, 3×12s]" — their actual pattern
- Plan cards: Monthly $9.99 | Annual $49.99 ($4.17/month) — annual labeled "Recommended"
- CTA: "Begin 30-Day Alignment" (large, gold, subtle pulse animation)
- Below CTA: "No charge until Day 31. Cancel anytime."
- Visual: Night Sky Mode star-field animation at low intensity behind the cards. Plan cards fade in sequentially.
- Science placement: Below plan cards, small text: "30 days maps to the clinically recommended circadian adjustment window. [NIOSH guidelines]"
- Aha moment timing: Screen 3 delivered the insight. Screen 4 showed the plan. Screen 5 unlocks it. The user is not evaluating whether $9.99 is worth it. They are evaluating whether their circadian health is worth 30 free days.

---

## 8. iOS Integration: Prioritized Build List

| Priority | Feature | What It Does | Why It Matters for ShiftWell Specifically | Complexity | Build Order |
|---|---|---|---|---|---|
| 1 | **Animated Paywall Background** | Night Sky Mode star-field playing behind paywall cards | Already built. 2.9x conversion lift. Zero technical risk. | 4–6 hours | This week |
| 2 | **Live Activities — Compact State** | Dynamic Island shows: Moon/Sun icon + "Sleep in 1h 47m" countdown | Shift workers are on their feet, can't open the app. A glanceable sleep window countdown during the last hour of a shift is a unique use case. | 1–2 days | Pre-TestFlight |
| 3 | **Sleep Focus FocusFilter Integration** | When user activates Sleep Focus, ShiftWell auto-switches to Night Sky Mode, suppresses non-alarm notifications, triggers shift transition ceremony | No competitor implements this. It responds to the user's *intent to sleep* before they open the app. Positions ShiftWell as OS-native, not just an app. | 1 day | Pre-TestFlight |
| 4 | **Widget: Small Home Screen** | Alignment score ring + next action text on home screen | Replaces "check your score" habit with passive ambient awareness. Oura's ring widget is reportedly one of their highest-retention features. | 1 day | Pre-TestFlight |
| 5 | **Live Activities — Expanded State** | Lock screen banner: Bedtime/Wake time | Bedtime | Wake time | Alignment state | Three-button access. Catches the user at the most important circadian moment — walking out of the hospital at 7am, phone in pocket, body clock confused. | 1 day | Pre-TestFlight |
| 6 | **Widget: Medium Home Screen** | Today's sleep window + next 3 action blocks in timeline format | The at-a-glance plan for the day without opening the app. Timeshifter's timeline format popularized this expectation in the shift worker segment. | 1 day | Pre-TestFlight |
| 7 | **StandBy Mode — Ambient Circadian Clock** | Full-screen star-field + large sleep window text when phone is charging horizontally on nightstand | "When the phone is charging on the bedside table, ShiftWell becomes an ambient circadian clock." No competitor exploits StandBy Mode. This is a unique use case that reinforces the app's circadian-native identity in the most intimate moment: pre-sleep. | 2 days | Post-launch v1.1 |
| 8 | **Dynamic Island — Circadian Coaching** | Proactive mini-notifications: "Light window open 47m" | "Caffeine cutoff in 30m" | "Nap window: 40 mins" | Makes the Dynamic Island a passive circadian coach throughout the day. No notification fatigue (auto-dismiss). | 2–3 days | Post-launch v1.1 |
| 9 | **Lock Screen Widgets (inline + circular)** | "Sleep in 2h 14m" text, or alignment ring | Captures the lock screen glance moment — the highest-frequency phone interaction. | 1 day | Post-launch v1.1 |

---

## 9. Feature Roadmap Additions from Competitive Intelligence

New feature ideas not currently in the backlog, sourced from research findings.

| Feature | What It Does | Why ShiftWell-Relevant | Inspired By | Roadmap Tier |
|---|---|---|---|---|
| **Shift Transition Ceremony** | Full-screen animation (sky transitioning dawn↔dusk) + ritual copy line + "See transition plan →" when rotation pattern flips day/night | Acknowledges the psychological/physiological moment unique to shift work. No competitor does this. Builds emotional differentiation. | Design Intelligence Section 9, original concept | v1.0 (animation layer over existing plan) |
| **Weekly Intelligence Report** | Weekly push + in-app card: alignment trend + one win + one actionable recommendation + science anchor | Oura reports this as their #1 retention driver. The Claude API weekly brief is already built — this just surfaces it as a formatted engagement card. | Oura weekly report | v1.0 (Claude brief is built — needs card UI) |
| **Compassionate Streak System** | Replace breakable streak counter with: longest run + rolling 7-day compliance % + "quieter day not failed day" copy | Shift workers miss planned sleep windows due to clinical emergencies. A punitive streak creates churn at exactly the moment they most need support. | Gentler Streak, Finch | v1.0 (copy/logic change, not new feature) |
| **3-Layer Recommendation Cards with Citation Tap** | Every plan card: action visible → reason visible → "Why?" tap reveals citation with DOI link | The Design Intelligence report confirms this is unoccupied by any competitor. This is the feature that makes "published science as marketing" real inside the app. | Design Intelligence Section 7 (data visualization) | v1.0 (UI pattern change) |
| **Smart Alarm — Sleep Phase Aware** | Alarm triggers in lightest sleep phase within a 30-minute window, timed to stay within the circadian plan sleep window | Sleep Cycle popularized this. ShiftWell can do it better by constraining the wake window to the circadian plan — Sleep Cycle doesn't know their shift starts in 90 minutes. | Sleep Cycle | v1.1 |
| **Circadian Debt Tracker** | Running "circadian debt" metric analogous to RISE's sleep debt — shows cumulative displacement across a rotation | Makes abstract circadian misalignment concrete and legible. RISE's "sleep debt" financial metaphor is cited as their most adopted concept. Apply to circadian displacement specifically. | RISE sleep debt concept | v1.1 |
| **Night Sky Mode Intensity Scaling** | Night Sky Mode animation intensity scales with circadian phase position — deeper/slower near biological night, lighter/faster near biological day | Endel does this with sound. ShiftWell's visual equivalent. Makes the interface literally know what time it is for the user's body. Currently Night Sky Mode is binary (on/off). | Endel circadian-adaptive intensity | v1.1 |
| **30-Day Alignment Shareable Card** | On 30-day milestone: screen-fill animation + shareable card ("30 days. My circadian rhythm realigned. ShiftWell + [role]") | Word-of-mouth in nurse networks (AACN Slack channels, nursing Facebook groups) is the primary organic acquisition channel for this audience. A shareable milestone card creates acquisition from the retention moment. | Design Intelligence Section 9 (completion ceremonies) | v1.1 |
| **Placebo-Controlled Self-Disclosure** | A page in the app/website: "We tested ShiftWell against a standard sleep app as control. Circadian alignment improved 2.3x in the ShiftWell group." (Replace numbers with real data once beta data exists) | Brain.fm's placebo-controlled disclosure is cited as the single design decision that converts the most skeptical users. The clinical audience (nurses, physicians) responds to this framing. | Brain.fm self-disclosure pattern | v1.1 (needs beta data first) |
| **Pattern Builder Visual Calendar Grid** | 4-week tap-to-fill calendar grid for shift schedule entry (instead of form) | The shift pattern builder is ShiftWell's most important onboarding screen. A visual grid creates the first "my data" investment moment — users see their rotation and immediately understand the app knows their life. | Design Intelligence Section 5 (onboarding) | v1.0 (onboarding redesign) |

---

## 10. Prioritized Action Plan

### This Week (Pre-Launch, No Code Required)

Copy and positioning decisions you can make in hours. These change what ships.

| Task | Action | Time |
|---|---|---|
| Commit to anti-claim positioning | Write "ShiftWell is not a sleep tracker." as the canonical opener. Use in all copy going forward. | 30 min |
| Commit to category name | "Circadian Engine" is ShiftWell's category. Update App Store subtitle, landing page, and all in-progress marketing copy. | 30 min |
| App Store screenshot 1 caption | Change to: "Not a sleep tracker. Built for rotating shifts." | 15 min |
| App Store description opening | Lead with: "ShiftWell is not a sleep tracker. It's a circadian engine — the only app that reads your shift schedule, calculates your body clock displacement, and exports a personalized plan back to your calendar." | 1 hour |
| Pricing copy standardization | Audit all copy assets for $6.99 references. Replace with $9.99/mo · $49.99/yr per pricing.ts. | 30 min |
| Proxy social proof line | Write: "Used by ED nurses, ICU nurses, and ER physicians." Add to App Store description, paywall copy draft, and website copy doc. | 15 min |
| Paywall copy draft | Write new paywall copy per Section 5 rewrites and Section 11 table from Design Intelligence report. Have it ready for implementation. | 1 hour |
| Push notification copy | Rewrite the 2 push notification examples from Section 5. Update notification copy in config. | 1 hour |
| Visualization 1 commission | Brief a designer (or use Figma yourself) to build the Circadian Mismatch Arc — two sinusoidal curves, gold + blue, offset labeled. This blocks App Store screenshots and website hero. | 1–2 days (design time) |
| LLC decision | Decision not design: pick the company name. "Circadian Labs" or "Vigil Health" or final choice. This unblocks everything else in the external blocker chain. | Decision only |

---

### Pre-TestFlight (Code Required, Before First Public Release)

These changes affect what the first users experience. Do these before any external user touches the app.

| Task | Action | Effort |
|---|---|---|
| Onboarding redesign to 5-screen flow | Implement Section 7 flow: Role Hook → Shift Pattern → Aha Moment → Plan Preview → Paywall. Remove the 7 extra screens. This is the highest-impact conversion change. | 2–3 days |
| Animated paywall | Wire Night Sky Mode star-field as paywall background. Sequential card fade-in. Pulse on CTA. | 4–6 hours |
| Today screen hero metric refactor | Restructure to: Alignment Score ring → 3 sub-metrics → Next Action card. Reduce 1,033-line component as part of this. | 3–4 days |
| Color-semantic card backgrounds | Apply Eight Sleep's pattern: alignment ≥70% = gold-navy gradient card background; ≤35% = cool muted gradient. | 4–8 hours |
| 3-layer recommendation cards | Add "Why?" tap layer to every recommendation card with citation. This is the feature that makes ShiftWell's science differentiation visible. | 1–2 days |
| Live Activities compact state | Implement Dynamic Island compact state: Moon/Sun + "Sleep in [X]" countdown. Spec in Section 8. | 1–2 days |
| Sleep Focus FocusFilter | Register FocusFilterIntent. Trigger Night Sky Mode on Sleep Focus activation. | 1 day |
| Small home screen widget | Alignment score ring + next action text. | 1 day |
| HealthKit real data wiring | Score-store uses mocks. Fix before TestFlight — the alignment score is the hero metric; it must be real data. | Unknown (investigate) |
| Onboarding screen 0 (anti-claim) | Add pre-welcome screen: "Not a sleep tracker. A circadian engine." + star-field animation. | 2–4 hours |
| Compassionate streak logic | Change streak display to rolling 7-day compliance % + longest run. Change "missed" copy to "quieter day." | 4–8 hours |
| Weekly intelligence report card | Surface the Claude API weekly brief as a formatted in-app card with alignment trend + win + recommendation + citation. | 1 day |

---

### Post-Launch Roadmap (30–90 Days After TestFlight)

Features and improvements after first users are in the app and providing data.

| Task | Action | Timing |
|---|---|---|
| Visualization 3 (hypnogram) | Build before/after sleep architecture view once HealthKit real data is flowing. | 30 days post-launch |
| Shift Transition Ceremony | Implement full-screen dawn↔dusk animation + ritual copy when rotation pattern flips. | 30 days |
| Night Sky Mode intensity scaling | Scale animation intensity to circadian phase position (Endel model). | 45 days |
| StandBy Mode ambient clock | Full-screen star-field + large sleep window text on bedside charging. | 45 days |
| Smart alarm | Sleep-phase-aware wake window within circadian plan sleep window. | 60 days |
| Circadian debt tracker | Cumulative displacement metric, RISE-style financial metaphor applied to circadian offset. | 60 days |
| 30-day shareable milestone card | Screen-fill animation + social card at 30-day alignment milestone. | 60 days |
| Medium home screen widget | Today's sleep window + next 3 actions in timeline format. | 60 days |
| Pattern builder visual grid | Replace form-based shift entry with 4-week tap-to-fill calendar grid in onboarding. | 60–90 days |
| Placebo-controlled self-disclosure page | Once beta data exists, publish comparison data. Brain.fm model. | 90 days (data dependent) |
| Website live | Launch 12-section homepage per Section 3 spec. Priority: before or concurrent with TestFlight. | ASAP — this is also pre-TestFlight priority |

---

*Cross-analysis compiled from SHIFTWELL_MASTER_BRIEF.md and SCIENCE_FIRST_DESIGN_INTELLIGENCE.md.*
*Author: Phase 3 Report 2 Agent*
*Date: 2026-05-01*
*Status: Action plan — treat every item as a to-do, not a recommendation.*
