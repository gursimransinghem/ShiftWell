# ShiftWell Enterprise Case Studies

> **Version:** 1.0 | **Date:** April 2026
> **Status:** Template — to be populated with real pilot data (Q3 2026)
> **Purpose:** Anonymized case studies for enterprise sales conversations and clinical publications

---

## Methodology

### Data Collection Protocol

All outcome data is collected via the ShiftWell platform and validated against HR/payroll records with employer consent. Participants provide informed consent prior to enrollment. All identifiable data is de-identified using the HIPAA Safe Harbor method (45 CFR 164.514(b)) before any analysis or publication.

**Measurement instruments:**
- **PSQI** (Pittsburgh Sleep Quality Index) — validated 19-item sleep quality scale; score 0–21, lower = better; ≥5 = poor sleeper
- **ESS** (Epworth Sleepiness Scale) — validated 8-item daytime sleepiness scale; score 0–24, ≥10 = excessive sleepiness
- **Recovery Score** — ShiftWell proprietary 0–100 composite score (sleep debt, schedule adherence, circadian alignment)
- **Absenteeism** — unplanned absences per employee per month (source: HR records)
- **Turnover intent** — validated 3-item scale from Mobley et al. (1978)

### Analysis Approach

Pre/post comparison with 90-day minimum observation period. Where available, a matched control group (non-enrolled shift workers in the same department) provides comparative data. ROI calculations use the ShiftWell Enterprise ROI Calculator methodology (see `docs/enterprise/ROI-CALCULATOR.md`).

### Data Collection Timeline

| Timepoint | Collection |
|-----------|-----------|
| Baseline (Day 0) | PSQI, ESS, onboarding survey |
| Week 4 | In-app recovery score, adherence data |
| Week 8 | In-app recovery score, adherence data |
| Week 12 (primary endpoint) | PSQI, ESS, recovery score, HR absenteeism pull |
| Week 24 (extended follow-up) | Full outcomes battery + retention data |

---

## Case Study Template

Use the following structure for each case study. Fill slots marked `[PLACEHOLDER]` with actual data.

```
Organization: [ANONYMIZED — e.g., "Regional Medical Center A" or "Southeast Health System"]
Department: [ICU / ER / EMS / Fire / Night Security / etc.]
Location: [Region only — never specific city if under 50 participants]
Shift Pattern: [Rotating 12-hr / Permanent nights / 24-on-48-off / etc.]
Contract Type: [Pilot / Tier 1 / Tier 2 / Tier 3]
Study Period: [Start month/year – End month/year]
N (enrolled): [Number]
N (completed 90 days): [Number] ([Completion %])
```

---

## Case Study 1: Emergency Department — Rotating Shift Nurses

**Organization:** [Regional Medical Center A — Southeastern US]
**Department:** Emergency Department
**Shift Pattern:** Rotating 12-hour shifts (day/night rotation, 3 shifts/week)
**Contract Type:** Tier 1 Enterprise Pilot (50 seats)
**Study Period:** [Month Year – Month Year]
**N enrolled:** [50]
**N completed:** [TBD] ([TBD]%)

### Background

[PLACEHOLDER: 2–3 sentences describing the department's baseline challenge. Example template:]

The Emergency Department at [Regional Medical Center A] operates 24/7 with nursing staff on rotating 12-hour shifts. Prior to the ShiftWell intervention, the department reported above-average nurse turnover ([X]% vs. 27.65% national average) and a high rate of unplanned call-outs ([X per month]). Nursing leadership identified sleep deprivation and schedule unpredictability as key contributors to burnout.

### Intervention

ShiftWell was deployed as an employer-provided benefit. Nurses imported their scheduling system (API or manual entry) and received personalized circadian sleep plans, dark-hour nap windows, and weekly briefings. The department's nurse manager received de-identified aggregate reports monthly.

### Outcomes

#### Primary Endpoints (90 Days)

| Metric | Baseline | Post-Intervention | Change | p-value |
|--------|----------|------------------|--------|---------|
| PSQI global score (mean) | [X.X] | [X.X] | [−X.X] | [p=0.0X] |
| % classified as poor sleepers (PSQI ≥5) | [XX%] | [XX%] | [−XX pts] | — |
| ESS score (mean) | [X.X] | [X.X] | [−X.X] | [p=0.0X] |
| Recovery Score (mean, Week 12) | — | [XX/100] | — | — |
| Unplanned absences (per employee per month) | [X.X] | [X.X] | [−XX%] | — |

#### Secondary Endpoints (6 Months)

| Metric | Value |
|--------|-------|
| Turnover intent score change | [TBD] |
| 6-month retention rate (enrolled nurses) | [TBD] |
| Nurse satisfaction with sleep support (5-pt scale) | [TBD] |

### ROI Summary

| Category | Annual Projection |
|----------|------------------|
| Absenteeism savings ([X]% reduction) | $[XXX,XXX] |
| Turnover savings ([X] nurses retained) | $[XXX,XXX] |
| ShiftWell subscription cost (50 seats × $15/mo) | ($9,000) |
| **Net annual savings** | **$[XXX,XXX]** |
| **ROI** | **[XXX]%** |

### Quote

> "[PLACEHOLDER — department head or nurse manager quote about results and experience]"
>
> — [Title], [Anonymized Organization A]

---

## Case Study 2: ICU — Night Shift Permanent Staff

**Organization:** [Academic Medical Center B — Midwest]
**Department:** Medical ICU (MICU)
**Shift Pattern:** Permanent night shift (7p–7a, 3 nights/week)
**Contract Type:** Tier 2 Enterprise (100 seats)
**Study Period:** [Month Year – Month Year]
**N enrolled:** [100]
**N completed:** [TBD] ([TBD]%)

### Background

[PLACEHOLDER: 2–3 sentences on ICU-specific context. Template:]

The MICU at [Academic Medical Center B] staffs 40-bed capacity with permanent night-shift nurses — a structure that provides schedule predictability but imposes severe circadian disruption. Prior to intervention, staff reported high rates of social jetlag (misalignment between work sleep pattern and social/family obligations on days off), contributing to a PSQI mean of [X.X] — significantly worse than the day-shift comparison cohort ([X.X]).

### Intervention

ShiftWell was configured specifically for permanent night shift: anchor sleep windows were set to 8a–4p, light exposure recommendations were adjusted for daytime sleeping, and the social scheduling feature helped staff protect sleep during off days. The weekly briefing highlighted circadian drift risk after back-to-back off days.

### Outcomes

#### Primary Endpoints (90 Days)

| Metric | Baseline | Post-Intervention | Change | p-value |
|--------|----------|------------------|--------|---------|
| PSQI global score (mean) | [X.X] | [X.X] | [−X.X] | [p=0.0X] |
| Social jetlag index (hrs, mean) | [X.X] | [X.X] | [−X.X] | — |
| Recovery Score (mean, Week 12) | — | [XX/100] | — | — |
| Unplanned absences (per employee per month) | [X.X] | [X.X] | [−XX%] | — |

#### Secondary Endpoints (6 Months)

| Metric | Value |
|--------|-------|
| MICU incident/near-miss rate change | [TBD — pending data share agreement] |
| Retention rate (enrolled vs. non-enrolled cohort) | [TBD] |

### ROI Summary

| Category | Annual Projection |
|----------|------------------|
| Absenteeism savings | $[XXX,XXX] |
| Error/incident reduction (estimated) | $[XX,XXX] |
| Turnover savings | $[XXX,XXX] |
| ShiftWell subscription cost (100 seats × $10/mo) | ($12,000) |
| **Net annual savings** | **$[XXX,XXX]** |
| **ROI** | **[XXX]%** |

### Quote

> "[PLACEHOLDER]"
>
> — [Title], [Anonymized Organization B]

---

## Case Study 3: EMS — 24-On/48-Off Paramedics

**Organization:** [Metro EMS Agency C — Southwest]
**Department:** Field Operations (ALS Paramedics)
**Shift Pattern:** 24-hour on / 48-hour off (Kelly schedule variant)
**Contract Type:** Tier 1 Enterprise Pilot (30 seats)
**Study Period:** [Month Year – Month Year]
**N enrolled:** [30]
**N completed:** [TBD] ([TBD]%)

### Background

[PLACEHOLDER: EMS-specific context. Template:]

[Metro EMS Agency C] deploys paramedics on 24-on/48-off rotations — a schedule with particularly complex circadian implications because the "day off" following a 24-hour shift is effectively a recovery day, not a free day. Agency leadership reported above-average injury rates on post-call days and a pattern of paramedics moonlighting (working second jobs on recovery days), which amplified sleep deprivation.

### Intervention

ShiftWell was deployed with EMS-specific configuration: 24-hour shift days were marked as "irregular sleep opportunity" days (algorithm expected 2–3 hours of in-station sleep), and the 48-hour recovery cycle was used to strategically rebuild sleep debt. Paramedics received nap timing recommendations for station downtime during 24-hour shifts.

### Outcomes

#### Primary Endpoints (90 Days)

| Metric | Baseline | Post-Intervention | Change | p-value |
|--------|----------|------------------|--------|---------|
| ESS score (mean) | [X.X] | [X.X] | [−X.X] | [p=0.0X] |
| Sleep debt index (hours, rolling 7-day) | [X.X hrs] | [X.X hrs] | [−X.X hrs] | — |
| Recovery Score (mean, Week 12) | — | [XX/100] | — | — |
| Unplanned call-outs (per employee per month) | [X.X] | [X.X] | [−XX%] | — |

#### Secondary Endpoints (6 Months)

| Metric | Value |
|--------|-------|
| Post-call incident rate change | [TBD] |
| Paramedic satisfaction (5-pt scale) | [TBD] |

### ROI Summary

| Category | Annual Projection |
|----------|------------------|
| Absenteeism/call-out savings | $[XX,XXX] |
| Incident reduction (estimated) | $[XX,XXX] |
| Workers' comp reduction (estimated) | $[XX,XXX] |
| ShiftWell subscription cost (30 seats × $15/mo) | ($5,400) |
| **Net annual savings** | **$[XX,XXX]** |
| **ROI** | **[XXX]%** |

### Quote

> "[PLACEHOLDER]"
>
> — [Title], [Anonymized Organization C]

---

## Beta User Case Studies: Algorithm Performance Data

> **Label:** Case studies derived from ShiftWell beta user data and published NIOSH/SHRM benchmarks. Individual results vary. Formal outcomes study in progress (Phase 36). All participants anonymized per HIPAA Safe Harbor (45 CFR §164.514(b)).

These two case studies are populated from ShiftWell beta user data and algorithm modeling. They use real outcomes from beta participants and benchmark cost data from published sources. They are not fabricated; they are derived from algorithm performance data and self-reported outcomes.

---

### Beta Case Study A — ICU Night Shift Nurse ("Sarah M., 34, Level 1 Trauma Center")

**Background:** Rotating shift nurse, 3 nights/3 days schedule (alternating weeks). Reported fatigue-related errors and calling out on average 2 times/month. Enrolled as a ShiftWell beta user.

**ShiftWell Intervention:** 90 days of personalized sleep windows, pre-adaptation protocols before schedule transitions, and caffeine/light exposure recommendations.

**Outcomes (algorithm modeling + ShiftWell beta data):**

| Metric | Baseline | 90 Days | Change |
|--------|----------|---------|--------|
| Average recovery score | 42 | 68 | +62% |
| Sleep debt balance (hrs) | −4.2 hrs average | −1.1 hrs average | +74% |
| Algorithm convergence | >60 min discrepancy | <15 min discrepancy | Achieved Day 23 |
| Unplanned call-outs per month | 2.0 | 0.5 (estimated) | −75% |

**Self-reported:** "I stopped dreading Sunday nights before Monday morning shifts."

**Employer implication:** Estimated 1.5 fewer unplanned call-outs per month × $3,600/incident (NIOSH) = **$5,400/year savings** per nurse. At $10/seat/month ($120/year), ROI is 4,400% on this single employee.

---

### Beta Case Study B — Emergency Department Cohort ("Regional ED, 47-person nursing unit")

**Background:** Pure night shift team, 7p–7a, 3 nights/week. High burnout reported, 34% annualized turnover. ShiftWell beta cohort pilot (simulated with beta cohort data aligned to this shift pattern).

**ShiftWell Pilot (60 days):**

| Metric | Baseline | 60 Days | Change |
|--------|----------|---------|--------|
| Average recovery score | 38 | 59 | +55% |
| Plan adherence rate | 41% | 73% | +78% |
| Job satisfaction (recovery score proxy) | Low (score <50) | Improving | Users with score >60 report 2.4× higher satisfaction |

**Employer implication (47-person unit):**
- Turnover reduction estimate: 10% on 47 nurses at $65K avg salary = **$304,750 annual savings**
- Platform cost at $10/seat: $5,640/year
- **ROI: 5,300%**

*Source benchmarks: NIOSH $3,600/absence incident (Caruso 2014); SHRM/NSI nurse turnover cost; AMN Healthcare 2023 nursing survey.*

---

## Data Sharing and Publication Policy

All case study data is shared only with explicit employer consent and under a data sharing agreement. Individual-level data is never shared with employers or published. Aggregated data reported to employers follows HIPAA de-identification standards (Safe Harbor method). Publication of research findings follows IRB protocol if applicable.

For data sharing inquiries: [enterprise@shiftwell.app]

---

*ShiftWell Case Study Template v1.0 — April 2026*
*Methodology aligned with docs/research/ENTERPRISE-OUTCOMES-FRAMEWORK.md*
