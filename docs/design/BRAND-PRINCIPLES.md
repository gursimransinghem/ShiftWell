# ShiftWell Brand Principles

> **Date:** 2026-04-20
> **Status:** Locked. Governs all visual, copy, and UX decisions.
> **Enforced via:** Logo tournament rubric (`assets/brand/BRAND-TOURNAMENT-2026-04-20.md`), website audit, paywall copy review, App Store listing review.

---

## Why this doc exists

Shift workers are targeted relentlessly by wellness scams: melatonin grift, "sleep gurus," magic pillow ads, "this one trick doctors hate," influencer-endorsed supplements that don't work. Healthcare workers are the most-targeted demographic on Instagram for exactly this reason.

ShiftWell earns trust by being the opposite of every ad in their feed. If the product ever *feels* like one of those ads — even for one screen — we've lost the user. Worse, we've become the thing the founder built this product to fight.

These seven principles govern every visual, every line of copy, every UX decision. They're not guidelines. They're gates. Something that violates a principle doesn't ship.

---

## The Seven Principles

### 1. Citations visible, algorithm transparent

**Rule:** Every scientific claim must cite a specific peer-reviewed study (author + year minimum). Users can open any plan recommendation and see WHY — the inputs, the formula, the references.

**Why:** Scams hide behind "proprietary" and "our science team." Real science names sources. Transparency is a moat — nobody else will show their work because most competitors don't have the work to show.

**Applies to:** Website "The Science" section. App "Why am I seeing this?" tooltips. Paywall claims. App Store description. Every stat in social copy.

**Examples of compliance:**
- ✓ "10–38% of night shift workers develop Shift Work Sleep Disorder (Drake et al. 2004)"
- ✗ "Most shift workers struggle with sleep" (no source)

---

### 2. No urgency copy. No scarcity. No dark patterns.

**Rule:** Zero countdown timers. Zero "LAST CHANCE" language. Zero "only X spots left." Zero auto-renew trickery. Zero pre-checked opt-in boxes. Zero "are you sure you want to miss out" dialogs.

**Why:** These are the native language of subscription scams. Using any of them puts ShiftWell in the same visual vocabulary as the things shift workers swipe past 50 times a day. The product sells itself once used; we don't need to trick anyone into trying it.

**Applies to:** Paywall. Website pricing section. Trial expiration notifications. Marketing email. Social copy.

**Examples of violation (never ship):**
- ✗ "Offer ends in 23h 47m"
- ✗ "Join 10,000+ nurses (only 50 spots left this month)"
- ✗ "⚡ LIMITED TIME: 40% off — TODAY ONLY"

**Compliant framing:**
- ✓ "7-day free trial. Cancel anytime from Settings in one tap."
- ✓ "Annual plan saves 40% vs monthly." (no timer)

---

### 3. No fake social proof. Ever.

**Rule:** No placeholder testimonials. No "coming soon" testimonials that are actually AI-generated. No stock-photo faces next to made-up quotes. No "as seen in [logos]" unless we've actually been featured.

**Why:** Every shift worker has been burned by a fake 5-star review. The moment they suspect a testimonial is fake, they leave — permanently. Better to have an empty testimonial section with "Beta user quotes coming soon — join the waitlist" than one fake quote.

**Applies to:** Website. App Store listing. Social posts. Paywall.

**Approved substitutes until real beta quotes exist:**
- ✓ "Beta starting 2026-05. Join the waitlist for founding-member pricing."
- ✓ Founder statement (Sim on camera, specific story, signed).
- ✓ Cited study outcomes ("10–38% SWSD prevalence" — Drake 2004) framed as *the problem*, not product proof.

---

### 4. One-click cancel, always visible.

**Rule:** The cancellation path from "I'm paying" to "I'm not paying anymore" is a single tap inside Settings. The path is documented in Settings copy, paywall copy, and the welcome-to-paid email. Cancellation does NOT require email, phone call, or form submission.

**Why:** Apple/Google already require this via subscription management, but we document it explicitly so users see the promise before they subscribe. Confidence to try comes from knowing leaving is easy.

**Applies to:** Paywall. Settings. Welcome email. App Store description. Website pricing.

**Required copy pattern:** "7-day free trial. Cancel anytime from Settings → Subscription → Cancel. Takes one tap."

---

### 5. Physician credibility, named and visible.

**Rule:** Dr. Gursimran Singh, DO, ED physician at HCA Florida Trinity Hospital. Full credentials visible on website, App Store listing, paywall. Not "our medical team." Not "a doctor." Named person with verifiable employer and specialty.

**Why:** Generic "built by doctors" claims are scam-coded. Specific named physicians with verifiable positions are the opposite. Plus: Sim actually lives the problem (works nights), which is load-bearing on the founder story.

**Applies to:** Website "About" section. App Store description. Paywall "Why trust this?" section. Every social post where credibility is at stake.

**Required elements:**
- Name: Dr. Gursimran Singh
- Credential: DO
- Role: Emergency Medicine physician
- Hospital: HCA Florida Trinity Hospital
- Lived experience: "Works nights. Built this because he needed it."

---

### 6. Mission-first framing. No wellness-speak.

**Rule:** ShiftWell is a precision tool for a specific physiological problem (circadian desync in non-standard schedules). It is not a wellness app, not a mindfulness app, not a self-care app, not a manifestation app. Our vocabulary reflects this.

**Forbidden vocabulary:**
- "wellness," "self-care," "glow-up," "your best self," "rituals," "intentions"
- "journey," "transformation," "awakening," "manifest," "universe"
- "whisper," "gentle," "nurture," "bloom," "tending," "softness"
- "energy" (as in "high energy / low energy" — medical usage "caloric" is fine)
- "holistic" (scam flag)
- "detox" (scam flag)

**Approved vocabulary:**
- circadian phase, sleep debt, recovery, Two-Process Model, chronotype
- shift, night, rotating, anchor sleep, phase shift, light exposure
- recommendation, plan, protocol, adherence, evidence, citation
- precision, specific, validated, measured, tracked

**Applies to:** Every line of copy across every surface. Reject language that would fit in a wellness Instagram feed.

---

### 7. Restraint as the premium signal.

**Rule:** Premium feel comes from what we remove, not what we add. No CTAs competing for attention. No animations that don't communicate information. No gradients for decoration — gradients must carry data meaning (e.g., circadian curve). No badges. No banners. No "NEW" tags. No exclamation marks in copy.

**Why:** The scam visual language is maximalist — burst stars, glowing badges, multiple CTAs, countdown animations, social proof notifications sliding in. Quiet, data-forward, minimal interfaces are the opposite signal. Oura, Rise Science, Linear, Things — our visual peers are apps that refuse to shout.

**Applies to:** Every screen. Every marketing asset. Every App Store screenshot.

**Tests before shipping anything visual:**
- If I removed this element, would the user still understand what to do? If yes, remove it.
- Is this animation conveying information, or just decorating? If decorating, remove it.
- Does this gradient serve the data, or is it wallpaper? If wallpaper, flatten it.
- Is there more than one primary CTA in view? If yes, demote the extras.

---

## Enforcement

Every new asset (logo, screen, page section, email, social post) passes through this checklist:

| # | Check | Pass / Fail |
|---|---|---|
| 1 | Every scientific claim cites a specific study | |
| 2 | Zero urgency / scarcity / countdown / dark patterns | |
| 3 | Zero fake testimonials or social proof | |
| 4 | One-tap cancel path visible where relevant | |
| 5 | Dr. Gursimran Singh credentials visible where relevant | |
| 6 | No forbidden vocabulary; approved terms used | |
| 7 | Restraint test passed — removed everything that doesn't carry meaning | |

An asset fails any check = it doesn't ship until fixed.

---

## Applied to the logo tournament

The five creative lanes (Fulcrum / Bioluminescent / Astronomical / Möbius / Geometric wordmark) are all compliant with principles 1–7 by design. But each submitted concept must pass the same gates:

- Does the concept avoid stock sleep iconography (z's, pillows, clocks)? *(Principle 7: Restraint)*
- Does it avoid wellness-app gradient clichés? *(Principle 6: Mission-first)*
- Does it avoid medical tropes (stethoscope, caduceus, cross)? *(Principle 5: Physician credibility is VERBAL not VISUAL)*
- Does it survive as a single-color monochrome favicon? *(Principle 7)*
- Would a shift worker be proud to wear it on a T-shirt, or would it look like a wellness scam logo? *(Principles 2, 6, 7 combined)*

Any concept that fails any of these gates is dropped before it reaches the user.

---

## Source documents

- `docs/vision/MANIFESTO.md` — mission statement, founder voice
- `docs/business/COMPETITIVE_EDGE_LOG.md` — premium positioning
- `docs/research/SCIENTIFIC-AUDIT-REPORT-2026-04-18.md` — "what's missing" (honest gaps we don't hide)
- `docs/design/references/LUMI-REFERENCE-2026-04-20.md` — structural reference with explicit voice rejection

---

*Last reviewed: 2026-04-20 · Governs: all public-facing ShiftWell assets*
