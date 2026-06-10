# Wearable Integration Partnership Pitch

> Target: WHOOP and Oura business development / partnerships teams. Adapt for other wearable platforms (Garmin, Apple Watch, Samsung) as needed.

---

## Subject Line Variants

1. **"ShiftWell + [WHOOP/Oura]: the killer use case for shift worker health data"**
2. **"700M shift workers need your sensor data + our circadian algorithm"**
3. **"Partnership inquiry — sleep optimization app for shift workers using [WHOOP/Oura] data"**

---

## Email — WHOOP Version

**From:** Dr. Gursimran Singh, DO — Emergency Medicine Physician & Founder, ShiftWell
**To:** [CONTACT_NAME], [TITLE], WHOOP

---

[CONTACT_FIRST_NAME],

I'm an emergency medicine physician who built ShiftWell — a circadian sleep optimization app for shift workers. I'm reaching out because WHOOP has the best continuous physiological data pipeline in wearables, and ShiftWell has the algorithm that makes that data actionable for 700 million people who work against their body clock.

**What ShiftWell does:** The app imports a shift worker's schedule and generates a personalized circadian optimization plan — sleep windows, naps, caffeine cutoffs, light protocols, meal timing — based on the Two-Process Model and NIOSH-validated science. It exports the plan to the user's calendar. Think of it as a circadian co-pilot.

**What we'd build together:**

ShiftWell + WHOOP integration would create a closed-loop circadian system:

1. **WHOOP → ShiftWell:** Pull HRV, sleep staging, strain, and recovery data via WHOOP's API to personalize recommendations. A nurse with low HRV and 4 hours of fragmented sleep gets a different plan than one who nailed their anchor sleep.
2. **ShiftWell → User → WHOOP:** Users follow ShiftWell's plan, WHOOP measures the outcome, ShiftWell refines the next cycle. Continuous improvement loop.
3. **Outcome tracking:** We can quantify the impact — HRV trends, recovery scores, sleep consistency — across shift patterns. This is publishable research data.

**Why this is good for WHOOP:**

| Benefit | Detail |
|---|---|
| **Specialized use case** | ShiftWell is the first app purpose-built for shift worker circadian optimization. WHOOP gets showcased as the data backbone for a clinical-grade tool — not just another fitness tracker integration. |
| **Market expansion** | 22M US shift workers (healthcare, fire, EMS, law enforcement, manufacturing). Many aren't current WHOOP users. ShiftWell gives them a reason to buy one. |
| **Co-marketing** | Joint content: "How WHOOP + ShiftWell helped 500 ER nurses sleep better." Case studies, social media, podcast appearances. I'm a practicing ER doc — the story writes itself. |
| **Stickiness** | Users who integrate WHOOP with ShiftWell have two reasons to keep the subscription. Churn reduction through ecosystem depth. |
| **Research credibility** | Physician-founded, peer-reviewed science basis. Potential for co-authored research on wearable-guided circadian interventions. |

**What we'd need from WHOOP:**
- API access (developer tier or partnership tier)
- Co-marketing commitment (blog post, social feature, App Store cross-promotion)
- Optional: hardware discount codes for ShiftWell pilot participants

**What WHOOP gets from us:**
- A showcase integration that demonstrates WHOOP's value beyond athletes
- Access to shift worker demographics (healthcare, first responders) — a massive TAM WHOOP hasn't fully penetrated
- Joint research opportunities with publishable outcomes
- Content engine: an ER doctor using WHOOP data to optimize nurse sleep is compelling storytelling

I'd love to set up a 20-minute call with your partnerships or developer relations team. Happy to share a product demo, our API integration spec, or our science documentation.

— Sim

**Dr. Gursimran Singh, DO**
Emergency Medicine | HCA Florida Trinity Hospital
Founder, ShiftWell — Circadian Sleep Optimization for Shift Workers
[PHONE] | [EMAIL] | [WEBSITE]

---

## Oura-Specific Adjustments

When adapting for Oura, swap these angles:

- **Data emphasis:** Oura excels at sleep staging, readiness scores, and temperature trends. Lead with sleep quality granularity rather than strain/recovery.
- **User profile:** Oura's user base skews wellness-focused professionals vs. WHOOP's athlete/performance base. Emphasize the "healthcare professional wellness" angle.
- **Ring form factor:** Nurses and doctors can wear an Oura Ring during clinical shifts (no screen, infection control friendly). WHOOP bands are bulkier. This is a legitimate clinical advantage — call it out.
- **API:** Oura's Cloud API v2 provides sleep, readiness, and activity data. Integration architecture is similar.

**Oura-specific value prop:** "Oura Ring is the only wearable most nurses can comfortably wear during a 12-hour shift. ShiftWell turns that data into a circadian plan they can actually follow."

---

## Technical Integration Overview (Include as Attachment if Requested)

```
┌─────────────┐     API Pull      ┌─────────────┐
│   WHOOP /   │ ──────────────►   │  ShiftWell   │
│    Oura     │   HRV, sleep,     │  Algorithm   │
│   Cloud     │   recovery,       │  Engine      │
│             │   temperature     │              │
└─────────────┘                   └──────┬───────┘
                                         │
                                  Personalized
                                  circadian plan
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │   User's     │
                                  │   Calendar   │
                                  │   + App UI   │
                                  └──────┬───────┘
                                         │
                                   User follows
                                   the plan
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │  Wearable    │
                                  │  measures    │◄── Feedback loop
                                  │  outcomes    │
                                  └─────────────┘
```

---

## Personalization Checklist

- [ ] `[CONTACT_NAME]` / `[CONTACT_FIRST_NAME]` / `[TITLE]` — BD or partnerships contact
- [ ] Company name (WHOOP vs. Oura vs. other)
- [ ] Adjust value props per Oura section if targeting Oura
- [ ] `[PHONE]` / `[EMAIL]` / `[WEBSITE]` — your contact info

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial creation. WHOOP and Oura API capabilities verified. Integration architecture is conceptual — technical spec to be detailed during partnership discussions.
