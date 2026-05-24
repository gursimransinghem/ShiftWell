# Google Stitch — ShiftWell App Design Prompt

> **Date:** 2026-04-20
> **For:** `stitch.withgoogle.com`
> **Purpose:** Generate multi-screen ShiftWell app mockups that pass all 7 Brand Principles gates.
> **How to use:** Paste the **Primary Prompt** to kick off. Use Follow-up Prompts A / B / C to iterate on specific screens after the first generation.

---

## Primary Prompt

Paste everything inside the fence, as-is, into Stitch.

```
Design a premium, dark-mode-first iOS mobile app called ShiftWell — a circadian rhythm optimization app for shift workers (nurses, physicians, police, pilots, factory workers). Audience: fatigued night-shift healthcare workers at 3am. This is a precision medical-grade tool, NOT a wellness or mindfulness app.

VISUAL LANGUAGE
Aesthetic peers: Oura, Rise Science, Linear, Things 3. Restraint is the premium signal. Quiet, data-forward, minimal. What we remove matters more than what we add.

Anti-references (do NOT do these): Calm, Headspace, any wellness app with purple gradients and affirmations, crescent-moon-over-pillow clip art, "glow up" language, lifestyle stock photography, badges, burst stars, countdown timers, "LIMITED TIME" banners.

COLOR SYSTEM (use these hex values exactly)
- Background primary: #080B14 (deep navy, never pure black)
- Background surface: #111827 (cards)
- Background elevated: #1E2640 (modals, FABs)
- Accent primary (interactive): #7B68EE (medium slate blue — warm purple)
- Accent secondary (data highlights): #E2B340 (warm gold — for scores and key numbers only)
- Text primary: #F0F2F5 (slightly off-white, reduces eye strain)
- Text secondary: #A0AEC0
- Text tertiary: #6B7280

Semantic colors (use sparingly, one per screen):
- Sleep: #7B61FF (purple)
- Nap: #B794F6 (lavender)
- Night shift: #FF9F43 (orange)
- Meal: #34D399 (green)
- Caffeine cutoff / warning: #FF6B6B (coral red)
- Light exposure: #FCD34D (yellow)
- Wind-down: #818CF8 (indigo)

Color discipline: Any single screen uses gold + ONE semantic color + grays. Never stack semantic colors.

TYPOGRAPHY
System fonts: SF Pro (iOS). Tabular numerics on all countdowns and scores.
- Hero number: 40px, weight 700 (recovery score)
- Screen heading: 28px, weight 700, -0.5 letter-spacing (date display)
- Countdown value: 22px, weight 700, tabular
- Card title: 14px, weight 600
- Body: 16px, weight 400
- Meta: 11px, weight 500
- Section label: 11px, weight 600, 1px letter-spacing, UPPERCASE
- Minimum text size: 11px (accessibility floor — fatigued eyes)

LAYOUT SYSTEM
8px grid. Generous whitespace between sections — cramped = cheap. One clear hero per screen. Progressive disclosure: past events collapse, future events expand.

SCREENS TO DESIGN (generate all six)

1. TODAY DASHBOARD (Recovery Day state)
Three tiers, top to bottom:
- Tier 1 (glanceable, no scroll): Small status pill top-left reading "Recovery". Below it, a large 120px circular score ring in gold (#E2B340) showing "87" with the label "RECOVERY SCORE" beneath. Below the ring, a three-cell countdown row showing "CAFFEINE CUTOFF 2:14p", "WIND DOWN 9:30p", "SLEEP 11:00p" — each cell with a small semantic-colored dot.
- Tier 2 (today's plan): Vertical timeline with a thin left accent bar. Events: "7:00a — Wake + bright light" (yellow dot), "8:30a — Breakfast" (green dot), "2:00p — Caffeine cutoff" (red dot), "9:30p — Wind down begins" (indigo dot), "11:00p — Sleep" (purple dot). Past events dimmed/collapsed. Current event has subtle gold glow.
- Tier 3 (insights, collapsible): One card titled "Why this plan?" with a citation line: "Based on Two-Process Model (Borbely, 1982) and your sleep debt of 2.3h." Small "View references" text link.

Bottom: glassmorphic tab bar with blur, 4 tabs (Today, Schedule, Insights, Profile) — active tab has subtle purple glow, not a filled pill.

2. TODAY DASHBOARD (On-Shift Night state, 3am)
Same 3-tier architecture but: status pill reads "On Shift — Night". Background shifts to slightly warmer #0A0D1A. Score ring is dimmed. Hero element becomes a countdown: "SHIFT ENDS IN 4h 12m" in 40px gold. Timeline shows shift breaks with meal windows. Copy is minimal — a tired nurse at 3am should see 3 things and nothing else.

3. ONBOARDING — 3-STEP FAST PATH
Step 1 of 3: "Welcome. We'll build your plan in 90 seconds." Headline + one-line value prop + "Get started" button. No sign-up required yet. No illustration — just typography and whitespace.
Step 2 of 3: Chronotype quiz — three questions presented one at a time with radio-style OptionCards (large tap targets, subtle purple border on selection). Question: "What time do you usually fall asleep on days off?" Options: "Before 10pm / 10pm-midnight / Midnight-2am / After 2am".
Step 3 of 3: "Import your shifts" with two options: big primary button "Connect calendar" and secondary text link "Add manually". Below both, small text: "We only read shift events. Nothing is shared. Revoke anytime."

4. PAYWALL
Headline: "ShiftWell Premium — $29.99/year". Below: "7-day free trial. Cancel anytime from Settings in one tap." (Literal — principle 4.)
Below that, a short feature list with check marks (no emoji, no badges): "• Unlimited shift imports • Adaptive circadian plans • Calendar export • Sleep debt tracking • HealthKit integration".
Credibility block — small square photo of Dr. Gursimran Singh (placeholder), then text: "Dr. Gursimran Singh, DO — Emergency Medicine, HCA Florida Trinity Hospital. Works nights. Built this because he needed it."
Primary button: "Start 7-day free trial" — gold fill. Secondary text link: "Restore purchase". NO countdown timer. NO scarcity text. NO "LIMITED TIME". NO fake testimonials.

5. SCHEDULE SCREEN
Week view — 7 vertical day columns. Each shift shown as a colored block (orange for night, blue for day). Sleep windows shown as purple translucent overlays behind shifts. Tap a day: opens a detail sheet from bottom with the day's plan + reasoning.

6. NIGHT SKY STATE (post-bedtime, app is "off duty")
Near-black background (#060810). Single centered element: a small constellation drawing (abstract dots + thin lines, no clip-art stars). Text below: "Sleep protected until 7:00a. See you in the morning." Everything else dimmed. No other UI. This state is a DELIBERATE reward for following the plan — the app going quiet is the feature.

COMPONENT DETAILS
- Buttons: 48px minimum height on all sizes. Primary = gold fill with #080B14 text. Secondary = transparent with 1px #7B68EE border. Loading state = skeleton shimmer, not spinner.
- Cards: 0.5px border in rgba(255,255,255,0.06). 16px internal padding. Subtle elevation via shadow, not borders.
- Icons: Lucide or Phosphor icon library, 20px default, 1.5px stroke. Monochrome. No emoji in UI chrome (emoji reserved for empty states and onboarding personality moments only).
- Citations: Every science claim shows "(Author Year)" inline. Tapping opens a reference sheet with DOI link.

COPY TONE
Precise, clinical, confident. Short sentences. No exclamation marks. No "journey," "transformation," "glow-up," "wellness," "holistic," "self-care," "detox," "rituals," "intentions." Use: circadian phase, sleep debt, recovery, chronotype, protocol, evidence, cited.

CRITICAL CONSTRAINTS
1. No crescent moons, pillows, Z's, or clock clip-art anywhere.
2. No stock photography of people sleeping.
3. No gradients used as decoration — gradients must carry data meaning (e.g., a circadian curve).
4. No pre-checked opt-in boxes. No dark patterns. No urgency or scarcity anywhere in the flow.
5. Every scientific claim cites a specific study with author + year.
6. Dr. Gursimran Singh's full credentials (DO, Emergency Medicine, HCA Florida Trinity Hospital) must appear on the paywall and an About section.

Produce all six screens as high-fidelity iPhone 15 Pro mockups (393×852pt). Render dark mode primary.
```

---

## Follow-up Prompt A — Deep-dive on Dashboard

Use after the primary run, when you want three variations of the Today Dashboard hero region to pick from.

```
Refine the ShiftWell Today Dashboard (Recovery Day state) from the previous design. Explore three variants of the Tier 1 glanceable region:

Variant A — Score-dominant: 140px score ring centered, countdowns below as small 11px labels beneath the ring.
Variant B — Countdown-dominant: Large 40px countdown to next event (e.g., "WIND DOWN IN 2h 14m") as the hero; score demoted to a 60px ring in the top-right corner.
Variant C — Split hero: Score ring left (100px), next event countdown right (stacked 40px number + 11px label), separated by a 1px divider.

Same color system, typography, and brand principles. Show all three variants side by side at iPhone 15 Pro dimensions.
```

---

## Follow-up Prompt B — Paywall variations

Use when the paywall needs more exploration. All variants must pass the 7 Brand Principles.

```
Produce three ShiftWell paywall variants. All variants must obey: 7-day free trial, one-tap cancel copy, no countdown timers, no fake testimonials, Dr. Gursimran Singh credentials block visible, $29.99/year.

Variant 1 — Science-forward: Hero is a cited statistic "10–38% of night shift workers develop Shift Work Sleep Disorder (Drake et al. 2004)". Trial button below.
Variant 2 — Founder-forward: Hero is a photo placeholder of Dr. Gursimran Singh with a 2-sentence signed founder statement. Trial button below.
Variant 3 — Algorithm-forward: Hero is a small interactive circadian curve diagram with labeled phases. Caption: "Your plan adapts to this curve." Trial button below.

Use the locked color system and typography. No urgency copy in any variant.
```

---

## Follow-up Prompt C — Onboarding chronotype question

Use to deep-dive on the quiz interaction state.

```
Design the ShiftWell chronotype quiz step (step 2 of 3) at high fidelity. Four OptionCard components stacked vertically, each 72px tall, 16px spacing between. Each card has: a small colored dot on the left (chronotype color), the answer text (16px weight 500), and a subtle right-chevron. On selection: card border transitions to 1.5px #7B68EE with a 4% purple fill overlay. No checkbox, no radio dot — the border IS the selection state.

Background #080B14. Progress indicator top: three small bars, second bar filled in gold. Question text 22px weight 700 centered. 11px UPPERCASE section label "STEP 2 OF 3" above the question in #A0AEC0.
```

---

## Audit checklist after generation

Before using any Stitch output, walk it through the 7 Brand Principles gates from `docs/design/BRAND-PRINCIPLES.md`:

1. Every scientific claim cites a specific study (author + year).
2. Zero urgency / scarcity / countdown / dark patterns.
3. Zero fake testimonials or social proof.
4. One-tap cancel path visible where relevant.
5. Dr. Gursimran Singh credentials visible where relevant.
6. No forbidden vocabulary (wellness, journey, glow-up, holistic, detox, rituals); approved terms used.
7. Restraint test — removed everything that does not carry meaning.

Any screen that fails any gate → identify the failing constraint, add an explicit negative instruction to the prompt, regenerate.
