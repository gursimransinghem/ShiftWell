# ShiftWell Research Knowledgebase Program

Created: 2026-05-07
Status: Research phase definition

## Goal

Build a cited, evidence-graded sleep science and app-shipping knowledgebase that can support:

- Algorithm validation.
- User-facing explanations.
- AI Gatekeeper grounding.
- Public content claim review.
- Future institutional sales materials.

This document defines the research program. It is not the completed literature dump.

## Output Structure

Planned paths:

- `docs/research/sleep-science-wiki/`
- `docs/research/ai-app-development-wiki/`
- `docs/research/apple-shipping-wiki/`
- `docs/research/atomic-kb/`
- `docs/research/evidence-ledgers/`

Seed ledger:

- [seed-source-ledger-2026-05-07.md](evidence-ledgers/seed-source-ledger-2026-05-07.md)

Each wiki page should include:

- Claim.
- Source citation with URL/DOI/PMID when available.
- Evidence type.
- Population.
- Intervention/exposure.
- Outcome.
- Effect direction.
- Confidence grade.
- ShiftWell algorithm implication.
- User-facing wording constraints.
- Contraindications or caution notes.

Atomic knowledgebase record format:

```yaml
id: SW-SLEEP-0001
topic: light-timing
claim: Timed bright light can shift circadian phase when applied at the correct circadian time.
source_type: guideline | systematic_review | rct | cohort | official_doc | anecdotal
source_url: ""
pmid_or_doi: ""
population: ""
confidence: high | moderate | low | anecdotal
algorithm_implication: ""
user_copy_allowed: ""
safety_notes: ""
last_verified: YYYY-MM-DD
```

## Evidence Standards

Primary sources:

- AASM guidelines and consensus statements.
- NIOSH/CDC shift work and long work hour materials.
- NIH/PubMed indexed reviews, RCTs, and cohort studies.
- Apple official HealthKit and App Store documentation.
- Expo, Supabase, PostHog, Sentry, RevenueCat, and Auth0 official docs.

Secondary sources:

- Medical society education pages.
- University sleep medicine resources.
- High-quality review articles.

Tertiary or anecdotal sources:

- Reddit threads.
- GitHub issues and templates.
- YouTube app-building walkthroughs.
- Blog posts.

Rule:

- Reddit, YouTube, and blogs can inform workflow heuristics, user language, and anti-patterns. They cannot establish sleep science claims unless they point back to primary literature.

## Sleep Science Research Map

Research topics:

- Sleep duration requirements.
- Sleep regularity and consistency.
- Circadian rhythm, phase shifting, and chronotype.
- Shift work disorder and rotating schedules.
- Night shift adaptation versus rapid recovery.
- Strategic light exposure and light avoidance.
- Blue light and device timing.
- Caffeine dose and timing.
- Meal timing and night eating.
- Diet quality and macronutrient timing.
- Alcohol and sleep architecture.
- Melatonin evidence and safety framing.
- Magnesium evidence and limitations.
- Vitamin D and sleep evidence limits.
- Temperature and sleep environment.
- Exercise timing.
- Nap timing and nap duration.
- Sleep debt and recovery sleep.
- Jet lag and travel across time zones.
- Wearable sleep accuracy.
- Apple Health sleep data limitations.
- Safety-sensitive work and fatigue risk.

Required source queries:

- "AASM adult sleep duration consensus statement"
- "AASM shift work disorder practice parameters light melatonin"
- "NIOSH nurses shift work long work hours training"
- "timed bright light circadian phase shift randomized trial"
- "caffeine 6 hours before bedtime sleep study"
- "meal timing night shift workers sleep circadian study"
- "time restricted eating night shift workers randomized trial"
- "sleep environment temperature study systematic review"
- "melatonin shift work sleep disorder systematic review"
- "magnesium sleep systematic review adults"
- "vitamin D sleep deficiency systematic review"
- "wearable sleep tracking accuracy systematic review"
- "Apple HealthKit sleep analysis documentation"

Research pass sequence:

1. Literature harvest.
2. Source triage by evidence quality.
3. Wiki page drafting.
4. Atomic claim extraction.
5. Algorithm implication review.
6. AI Gatekeeper grounding review.
7. Public-claim copy review.

Acceptance criteria:

- Each research topic has at least one high-quality source or an explicit "evidence insufficient" note.
- Every atomic claim has a citation.
- Every user-facing claim is mapped to allowed wording.
- Supplement and medical-adjacent claims include caution language.
- AI Gatekeeper cannot cite a claim without an atomic KB ID.

## AI App Development Workflow Research

Research goal:

Compile current best practices for shipping an AI-assisted iOS app using modern AI coding workflows, while separating official shipping requirements from community workflow advice.

Research sources:

- GitHub repositories and templates for Expo/React Native mobile apps.
- GitHub issues/discussions for EAS, Supabase, PostHog, RevenueCat, and Sentry integration pitfalls.
- Reddit threads on AI app development, "vibe coding", solo founders, App Store launch, TestFlight pilots, and Expo shipping.
- YouTube walkthroughs loaded into NotebookLM.
- Official docs for final shipping steps.

Workflow topics:

- AI-assisted planning and spec writing.
- Agent-driven implementation with phase gates.
- Test-driven development with AI agents.
- App Store/TestFlight release process.
- Mobile analytics instrumentation.
- Crash reporting and release health.
- Backend-as-a-service architecture.
- Subscription/paywall implementation.
- Privacy policy and data deletion.
- Product analytics loops.
- Pilot feedback loops.

Acceptance criteria:

- Official shipping checklist is based on primary docs, not Reddit/YouTube.
- Community findings are tagged anecdotal.
- Workflow recommendations are mapped to concrete ShiftWell tasks.
- Risky claims such as "fastest way" or "best stack" are tagged as unverified unless backed by direct evidence.

## NotebookLM YouTube Research Lane

NotebookLM should be used for YouTube/transcript synthesis only after a ShiftWell-specific notebook exists.

Notebook requirements:

- Notebook title: `ShiftWell AI App Dev + Sleep Science YouTube Findings`
- Sources: selected YouTube transcripts, official docs, and any workflow articles.
- Do not mix this with unrelated notebooks.

Notebook questions:

1. What exact app-building steps do these sources recommend?
2. What recurring mistakes or anti-patterns appear?
3. Which recommendations apply to Expo/React Native iOS shipping?
4. Which recommendations conflict with official Apple, Expo, or vendor docs?
5. What should be converted into ShiftWell tasks, and what should stay anecdotal?

Output:

- `docs/research/ai-app-development-wiki/notebooklm-youtube-findings-YYYY-MM-DD.md`

Acceptance criteria:

- Findings cite NotebookLM source references.
- Each finding is tagged official, expert, anecdotal, or unsupported.
- Conflicts with official docs are resolved in favor of official docs.

## Apple App Shipping Verification Checklist

Primary references to verify in current turn before execution:

- Apple App Store Connect TestFlight documentation.
- Apple App Review submission documentation.
- Expo EAS Build documentation.
- Expo EAS Submit iOS documentation.
- RevenueCat React Native/Expo documentation.
- Sentry React Native Expo documentation.
- PostHog React Native documentation.
- Supabase Expo React Native documentation.

Required verified steps:

1. Apple Developer account active.
2. Bundle identifier confirmed.
3. App Store Connect app record exists.
4. Capabilities configured.
5. Privacy labels drafted.
6. Screenshots and metadata drafted.
7. EAS credentials configured.
8. iOS production build succeeds.
9. Build uploads to App Store Connect.
10. Internal TestFlight install succeeds.
11. External TestFlight beta review passes when required.
12. App Review submission checklist is complete.

Acceptance criteria:

- Every step has a source link and proof artifact.
- Steps requiring Sim action are marked external blocker.
- No App Store claim is treated as verified without current official doc review.

## Stack Research

Current stack to verify and harden:

- Expo / React Native.
- Supabase for backend data and edge functions.
- PostHog for product analytics.
- Sentry for crash reporting.
- RevenueCat for subscriptions.
- Apple HealthKit for sleep data where permissioned.

Potential future stack:

- Auth0 only if ShiftWell needs external auth complexity beyond the chosen current auth path.
- Atomic Agents only if the AI Gatekeeper becomes a separate service or agent runtime.
- Figma libraries and Code Connect when UI design system and implementation mapping become a focused workstream.

## Research Done Definition

The research phase is done when:

- Sleep science wiki exists.
- AI app development wiki exists.
- Apple shipping wiki exists.
- Atomic KB exists.
- Source ledger exists.
- Claims are evidence-graded.
- AI Gatekeeper prompt/schema cannot reference uncited claims.
- Lead Engineer approves promotion into implementation.
