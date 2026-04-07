# ShiftWell Circadian Sleep Optimization for Shift Workers: A Prospective Cohort Study

**Study Protocol — Version 1.0**
**Date:** 2026-04-07
**Reporting Guideline:** STROBE (Strengthening the Reporting of Observational Studies in Epidemiology)
**ClinicalTrials.gov Registration:** To be obtained before enrollment begins (required for journal submission)
**Corresponding Investigator:** Dr. Gursimran Singh, DO — Emergency Medicine Physician

---

## Table of Contents

1. [Background and Rationale](#1-background-and-rationale)
2. [Study Objectives and Hypotheses](#2-study-objectives-and-hypotheses)
3. [Study Design](#3-study-design)
4. [Study Population](#4-study-population)
5. [Recruitment Plan](#5-recruitment-plan)
6. [Intervention Description](#6-intervention-description)
7. [Primary Outcome](#7-primary-outcome)
8. [Secondary Outcomes](#8-secondary-outcomes)
9. [Data Collection Procedures](#9-data-collection-procedures)
10. [Timeline](#10-timeline)
11. [IRB Pathway Analysis](#11-irb-pathway-analysis)
12. [Sample Size Justification](#12-sample-size-justification)
13. [Statistical Analysis Plan Reference](#13-statistical-analysis-plan-reference)
14. [Data Management and Security](#14-data-management-and-security)
15. [Ethics, Consent, and Confidentiality](#15-ethics-consent-and-confidentiality)
16. [Publication and Authorship Plan](#16-publication-and-authorship-plan)
17. [Limitations and Bias Assessment](#17-limitations-and-bias-assessment)
18. [STROBE Compliance Checklist](#18-strobe-compliance-checklist)
19. [References](#19-references)

---

## 1. Background and Rationale

### 1.1 Epidemiology of Shift Work Sleep Disorder

Approximately 16-20% of the US workforce is engaged in shift work, including nursing, emergency medicine, law enforcement, corrections, transportation, and manufacturing (BLS, 2019). Shift Work Sleep Disorder (SWSD) — characterized by insomnia and/or excessive sleepiness temporally linked to shift schedules — affects 10-38% of night shift workers (Drake et al., 2004). In healthcare alone, 32% of nurses report sleeping fewer than 6 hours per 24-hour period.

The health consequences of chronic circadian misalignment extend beyond fatigue: meta-analyses document elevated risks for cardiovascular disease (relative risk 1.4, Vyas et al., 2012), type 2 diabetes (RR 1.09, Gan et al., 2015), metabolic syndrome (OR 1.51, Wang et al., 2014), breast cancer (RR 1.32, IARC Monographs, 2019), and all-cause mortality (RR 1.11, Torquati et al., 2018). In 2019, the American Heart Association elevated circadian disruption to a formal cardiovascular risk factor (St-Onge et al., AHA Scientific Statement, 2025).

The occupational consequences are equally severe: shift workers exhibit impaired sustained attention equivalent to 0.05% blood alcohol content after 17-19 hours of wakefulness (Dawson & Reid, 1997). Medical errors, vehicle accidents, and workplace injuries are significantly elevated in fatigued shift workers (Gander et al., 2011).

### 1.2 Limitations of Current Interventions

Existing evidence-based interventions for SWSD include:

- **Pharmacological:** Modafinil (approved for SWSD; modest effects, dependency risk), melatonin (effective for circadian shifting; 0.5-3mg physiologic dose), stimulants (short-term alertness, no long-term adaptation)
- **Behavioral:** Cognitive Behavioral Therapy for Insomnia (CBT-I; effect size d=0.78, Trauer et al., 2015; but not shift work-specific, requires trained therapist, 6-8 sessions)
- **Light therapy:** Bright light exposure to shift circadian clock (Eastman & Burgess, 2009; Czeisler et al., 1990); effective but requires equipment adherence
- **Strategic napping:** NIOSH-recommended anchor sleep and prophylactic napping; evidence-based but ad hoc without systematic guidance (Milner & Cote, 2009)

Barriers to uptake are substantial: behavioral interventions require therapist access, pharmacological approaches require prescriptions and carry side effects, and no existing intervention dynamically adapts to the worker's actual schedule in real time.

### 1.3 The ShiftWell Intervention

ShiftWell is an iOS application that generates personalized, science-backed sleep schedules for shift workers by reading the user's shift schedule from their digital calendar. The core algorithm implements the Two-Process Model of sleep regulation (Borbely, 1982; revised Borbely et al., 2022) to identify optimal sleep windows that minimize circadian misalignment while accommodating the shift schedule's constraints.

Key algorithmic components include:

1. **Shift detection:** Automated extraction of shift events from Apple/Google Calendar using confidence scoring
2. **Circadian anchor calculation:** Core Body Temperature Minimum (CBTmin) estimation from chronotype and shift schedule
3. **Sleep window optimization:** Generated sleep windows minimize overlap with the circadian alerting phase (CBTmin + 2-6 hours) and respect commute constraints
4. **Sleep debt tracking:** Running debt balance using Belenky (2003) / Van Dongen (2003) accumulation model
5. **Recovery score:** 14-night rolling recovery metric incorporating sleep duration, sleep window timing adherence, and debt trajectory
6. **Strategic nap scheduling:** Placement of 20-minute naps in the post-lunch circadian trough (Milner & Cote, 2009) before night shifts
7. **Caffeine cutoff timing:** Dynamic caffeine window calculated from planned sleep onset (Drake et al., 2013)

This combination — calendar-aware, personalized, deterministic, and delivered via a consumer smartphone app — represents a novel intervention modality that has not been prospectively evaluated in a shift worker population.

### 1.4 Scientific Rationale for Study Design

A prospective observational cohort design with pre-post comparison within subjects was selected for the following reasons:

1. **Ethical constraint:** Randomization to a "no guidance" control arm raises ethical concerns in chronically sleep-deprived healthcare workers at known elevated injury risk. Withholding a potentially beneficial, low-risk intervention from consenting participants who have sought help is ethically problematic.

2. **Regulatory simplicity:** An observational design using validated questionnaires (PSQI, ESS) and in-app behavioral data is likely to qualify for IRB exempt review, enabling faster study initiation.

3. **Dose-response as internal control:** In the absence of a randomized control group, the dose-response relationship between adherence level and outcome improvement provides internal evidence for causal attribution. If high adherers improve substantially while low adherers do not, this supports a causal interpretation.

4. **Publishability:** Observational cohort studies are routinely published in sleep journals when they address novel interventions with validated instruments, pre-specified hypotheses, and transparent limitation reporting. STROBE guidelines ensure rigorous reporting.

5. **Pre-registration:** All hypotheses are pre-specified in this protocol and the Statistical Analysis Plan (STATISTICAL-ANALYSIS-PLAN.md) before data collection begins, preventing HARKing (Hypothesizing After Results are Known).

---

## 2. Study Objectives and Hypotheses

### 2.1 Primary Objective

To evaluate whether 90 days of ShiftWell algorithm-guided sleep scheduling produces a clinically significant improvement in subjective sleep quality (as measured by the Pittsburgh Sleep Quality Index) in shift workers with baseline sleep disturbance.

### 2.2 Primary Hypothesis

**H1 (Pre-specified):** Participants who use ShiftWell for 90 days will show a mean PSQI total score reduction of ≥3 points from baseline (the established minimum clinically important difference, MCID, for sleep interventions).

**H0 (Null):** Mean PSQI change from baseline to day 90 equals zero.

### 2.3 Secondary Objectives

1. Quantify improvement in daytime sleepiness (Epworth Sleepiness Scale, ESS) over 90 days
2. Quantify improvement in SWSD symptom severity (Shift Work Sleep Disorder Questionnaire, SWQ)
3. Characterize the dose-response relationship between ShiftWell adherence rate and PSQI improvement
4. Describe the trajectory of in-app recovery scores over 12 weeks
5. Compare outcomes by shift type (night-only vs. rotating shift)
6. Identify baseline characteristics predictive of greatest benefit

---

## 3. Study Design

**Design type:** Prospective observational cohort study

**Observation period:** 90 days per participant (12 weeks ± 7 days)

**Measurement timepoints:** Baseline (enrollment), Day 30, Day 60, Day 90

**Data sources:**
- Self-report questionnaires: PSQI, ESS, SWQ (at each timepoint)
- In-app behavioral data: ShiftWell adherence rate, recovery score, sleep debt balance (continuous, automated)
- Demographic/occupational survey: collected at baseline

**Comparator:** Pre-post within-subjects comparison. Participants serve as their own controls.

**Internal validity mechanism:** Dose-response analysis — adherence tertile (low/medium/high) as primary predictor of PSQI change, providing causal attribution support.

**Reporting standard:** STROBE checklist for cohort studies (von Elm et al., 2007; updated 2014)

**Registration:** ClinicalTrials.gov registration completed before first enrollment (protocol version 1.0)

---

## 4. Study Population

### 4.1 Inclusion Criteria

All six criteria must be met for enrollment:

1. **Age:** 18 to 65 years, inclusive
2. **Employment:** Currently employed in shift work — defined as any occupation requiring scheduled work shifts outside standard 8 AM-6 PM Monday-Friday hours. Target industries include: nursing, emergency medicine, emergency medical services (EMS), law enforcement, fire service, corrections, transportation (air, rail, trucking), and manufacturing
3. **Shift type:** Works rotating shifts, night shifts, or early morning shifts; specifically, works ≥2 shifts per week outside the 8 AM-6 PM window, averaged over the prior 3 months
4. **Device:** Owns an iPhone with iOS 16.0 or later and access to the App Store
5. **Commitment:** Willing to use ShiftWell as their primary sleep scheduling app for 90 consecutive days and to complete all follow-up surveys
6. **Consent:** Able to provide informed consent in English or Spanish; no cognitive impairment that would prevent understanding of study procedures

### 4.2 Exclusion Criteria

Any one criterion is sufficient for exclusion:

1. **Diagnosed obstructive sleep apnea (OSA) that is currently untreated:** OSA produces sleep fragmentation independent of circadian scheduling and would confound PSQI interpretation. Participants with treated OSA (CPAP-compliant, defined as >4 hours/night on >70% of nights) may be enrolled.
2. **Other primary sleep disorder:** Diagnosed narcolepsy, central sleep apnea, restless legs syndrome (RLS)/periodic limb movement disorder (PLMD) requiring treatment, or idiopathic hypersomnia
3. **Pregnancy or postpartum status:** Currently pregnant, or postpartum <6 months. Circadian rhythm physiology and sleep architecture are substantially altered during pregnancy and early postpartum, creating heterogeneous baseline biology that would confound circadian scheduling intervention effects
4. **Prescription sleep medications:** Current use of benzodiazepine receptor agonists (temazepam, triazolam), Z-drugs (zolpidem, zaleplon, eszopiclone), or orexin receptor antagonists (suvorexant, lemborexant). These pharmacological agents have direct sedative effects that confound circadian optimization outcomes. Note: Low-dose melatonin supplementation (≤3mg) is NOT an exclusion criterion — it is used as part of circadian shifting and does not confound the intervention
5. **Planned shift change:** Plans to transition from their current shift type (e.g., from rotating to fixed nights, or to day shift) during the study period. Such a transition would prevent clean pre-post comparison of circadian adaptation to a stable schedule
6. **Concurrent sleep trial participation:** Currently enrolled in another interventional sleep study

### 4.3 Rationale for Exclusion Criteria

The exclusion criteria are specifically designed to isolate the effect of circadian scheduling guidance on sleep quality. They exclude participants with conditions that would either (a) confound PSQI measurement by introducing sleep disruption from sources other than circadian misalignment, or (b) create a biological context in which the Two-Process Model-based algorithm cannot reliably generate appropriate recommendations.

---

## 5. Recruitment Plan

### 5.1 Recruitment Channels

Recruitment will proceed through three parallel channels:

**Channel 1 — In-App Recruitment (Primary, ~60% of enrollment)**
A recruitment banner will be displayed to existing ShiftWell users who meet preliminary eligibility criteria (shift worker, iOS device, ≥7 days of app usage). Tapping the banner initiates an eligibility screener. This channel reaches motivated users who have already demonstrated engagement with the app.

**Channel 2 — Social Media Targeted Outreach (Secondary, ~25% of enrollment)**
ShiftWell social media accounts (Instagram, TikTok, Facebook) will post targeted content directed at shift worker communities — specifically nursing Facebook groups, Reddit communities (r/nursing, r/emergencymedicine, r/EMS), and shift worker forums. Posts will describe the study purpose, compensation, and eligibility without using click-bait or misleading language.

**Channel 3 — Institutional Partnerships (Tertiary, ~15% of enrollment)**
Dr. Singh's contacts in hospital nursing leadership (VP Nursing) will be leveraged to share study information with nursing staff via email or unit bulletin board. Hospital Research Office contacts at Tampa Bay-area institutions (Tampa General Hospital, HCA Florida Hospitals, St. Joseph's Hospital) will be approached for study announcement permission. No hospital-level data access is requested — participants self-refer.

### 5.2 Screening Process

1. Interested participants complete an online eligibility screener (REDCap or Typeform)
2. Screener items map directly to inclusion/exclusion criteria
3. Eligible candidates receive automated consent document and baseline survey link within 24 hours
4. A study coordinator (initially Dr. Singh; research assistant when funded) reviews responses weekly to confirm eligibility before data lock

### 5.3 Incentive Structure

- **Completion incentive:** $25 Amazon gift card upon submission of all four surveys (baseline, Day 30, Day 60, Day 90)
- **Rationale:** Modest enough to avoid coercion; sufficient to signal survey value and reduce dropout. Value ($25) is below the threshold for substantial undue inducement in vulnerable populations (FDA guidance)
- **Partial completion:** No partial compensation (all-or-nothing at 90-day completion ensures high-quality longitudinal data)

### 5.4 Anticipated Enrollment Rates

- Initial screener conversion: ~40% of interested contacts meet all criteria
- Consent completion: ~70% of eligible candidates
- 90-day completion: ~80% of enrolled participants (20% dropout anticipated)
- **Target enrolled: 125 participants → 100 completers (see Section 12)**

---

## 6. Intervention Description

### 6.1 ShiftWell Application

ShiftWell is a commercially available iOS application (App Store release). Participants download the app and complete a standard onboarding process:

1. **Calendar connection:** Grant read/write access to Apple Calendar or Google Calendar
2. **Shift schedule detection:** App detects shift events from calendar; user confirms or corrects
3. **Chronotype assessment:** 4-item chronotype quiz calibrates individual circadian timing preference
4. **Routine builder:** Morning and evening pre/post-sleep routines configured
5. **Sleep preference entry:** Target sleep duration, preferred nap duration, caffeine habits

Once onboarded, ShiftWell generates and exports:
- **Primary sleep windows:** Optimal sleep start/end times for each 24-hour period, placed in the user's calendar as events
- **Strategic nap windows:** Pre-shift nap recommendations (20-30 min in circadian trough)
- **Caffeine cutoffs:** Dynamic caffeine window based on planned sleep onset
- **Light protocols:** Morning light exposure timing for circadian shifting before night shift transitions
- **Meal timing guidance:** Time-restricted eating windows aligned to circadian biology

### 6.2 Standardization

The algorithm is deterministic — given the same calendar inputs and user parameters, it produces the same recommendations. This eliminates algorithm variability as a confounder. All participants receive the same algorithmic logic; differences in outcomes are attributable to adherence level and individual biology.

### 6.3 Adherence Measurement

**Adherence definition:** A night is classified as "adherent" if the participant's actual sleep start time (measured by Apple HealthKit sleep data or self-report) falls within 30 minutes of the ShiftWell-recommended sleep window start time.

**Adherence rate:** Calculated weekly as: (adherent nights / total tracked nights) × 100

The 30-minute threshold was selected based on sleep onset latency standards (normal sleep onset latency is <20 minutes per AASM; 30-minute window accommodates normal biological variation).

---

## 7. Primary Outcome

### 7.1 Pittsburgh Sleep Quality Index (PSQI)

**Instrument:** Pittsburgh Sleep Quality Index (Buysse et al., 1989)
**Validation status:** Gold standard subjective sleep quality measure; validated in >10,000 studies
**Scoring:** 7 component scores (subjective sleep quality, sleep latency, sleep duration, habitual sleep efficiency, sleep disturbances, use of sleeping medication, daytime dysfunction); total score 0-21; higher scores indicate worse sleep quality
**Clinical interpretation:**
- PSQI ≤5: Good sleeper
- PSQI 6-10: Moderate sleep disturbance
- PSQI >10: Severe sleep disturbance

**Minimum Clinically Important Difference (MCID):** ≥3-point reduction (Bastien et al., 2001; Mollayeva et al., 2016). This threshold is used as the definition of clinical success in the primary analysis.

**Administration:** Online survey (REDCap/Typeform), self-administered. Administered at: Baseline (T0), Day 30 (T1), Day 60 (T2), Day 90 (T3).

**Rationale for PSQI as primary outcome:** PSQI is the most widely used validated instrument for sleep quality in shift work intervention studies, enabling direct comparison with existing literature (CBT-I trials, pharmacological trials, light therapy trials). A PSQI-based effect size is the minimum publishable evidence for a sleep intervention in a peer-reviewed journal.

---

## 8. Secondary Outcomes

### 8.1 Epworth Sleepiness Scale (ESS)

**Purpose:** Measures daytime sleepiness — the functional impairment dimension of SWSD
**Scoring:** 8-item, 0-24 scale; ESS >10 = excessive daytime sleepiness
**Administration:** Same timepoints as PSQI (T0-T3)
**Expected direction:** ESS reduction from baseline, particularly by Day 60-90 as circadian adaptation accumulates

### 8.2 Shift Work Sleep Disorder Questionnaire (SWQ)

**Purpose:** Disease-specific measurement of SWSD symptom burden
**Validation:** The shift work sleep disorder diagnostic questionnaire (validated in Drake et al., 2004) captures both insomnia and hypersomnia symptoms in the shift work context
**Administration:** Same timepoints as PSQI (T0-T3)

### 8.3 ShiftWell Adherence Rate

**Purpose:** Characterizes dose-response relationship between algorithm adherence and outcomes
**Measurement:** Weekly adherence rate (%) calculated from HealthKit sleep data + app tracking
**Analysis:** Adherence tertiles (Low <40%, Medium 40-70%, High >70%) as primary predictor in dose-response ANCOVA
**Hypothesis:** High-adherence participants (>70%) will achieve ≥3-point PSQI improvement (clinical significance threshold)

### 8.4 Recovery Score Trajectory

**Purpose:** Validates ShiftWell's internally computed recovery metric against PSQI improvements
**Measurement:** Mean in-app recovery score at weeks 1, 4, 8, 12 (from automated app data)
**Analysis:** Linear mixed effects model — does recovery score increase monotonically over the study period?
**Clinical importance:** If recovery score and PSQI change are correlated (r > 0.4), recovery score gains construct validity as a real-time sleep health proxy

### 8.5 Sleep Debt Balance

**Purpose:** Quantifies reduction in cumulative sleep debt as a mechanistic outcome
**Measurement:** Mean weekly sleep debt balance (hours) from app tracking
**Hypothesis:** Sleep debt should decrease from baseline over 90 days in adherent users

### 8.6 Self-Reported Work Performance Impact

**Purpose:** Patient-reported functional outcome with direct occupational relevance
**Item:** Single validated item: "In the past 30 days, did fatigue from sleep problems affect your ability to perform your work safely or effectively?" (Yes/No/Unsure)
**Administration:** T0, T1, T2, T3

---

## 9. Data Collection Procedures

### 9.1 Survey Administration (REDCap)

All self-report surveys will be administered via REDCap (Research Electronic Data Capture) hosted at an IRB-affiliated institution, or Typeform if REDCap access is not available for exempt study. Survey links will be distributed via:

1. **Push notification:** ShiftWell app notification at Day 30, Day 60, Day 90
2. **Email reminder:** Sent at Day 28, Day 30 (deadline), Day 58, Day 60, Day 88, Day 90 (deadline)
3. **SMS reminder (optional):** If participant provides phone number and opts in

Non-responders at Day 30 and Day 60 will receive one additional reminder email at Day 32 and Day 62 respectively. After that, data for the timepoint is coded as missing.

### 9.2 In-App Behavioral Data

The following data points are collected automatically by ShiftWell without participant burden:

| Data Point | Collection Method | Frequency |
|------------|------------------|-----------|
| Actual sleep start time | Apple HealthKit (passive) | Nightly |
| Actual sleep end time | Apple HealthKit (passive) | Nightly |
| Sleep duration | HealthKit (passive) | Nightly |
| Recommended sleep window | App algorithm (generated) | Per shift cycle |
| Adherence flag | Computed (actual vs. recommended ±30 min) | Nightly |
| Weekly adherence rate | Computed | Weekly |
| Recovery score | App formula | Daily |
| Sleep debt balance | App formula | Daily |

### 9.3 Baseline Demographics and Shift Schedule Data

Collected at baseline via the screener/consent survey:

- Age, sex, race/ethnicity (for demographics reporting per CONSORT)
- Job category and specific role
- Shift type (rotating/fixed nights/early mornings/mixed)
- Years working current shift schedule
- Baseline sleep habits (typical bedtime, wake time, total sleep estimate)
- Chronotype (morning/intermediate/evening, from Morningness-Eveningness Questionnaire abbreviated form)
- Comorbid conditions checklist (for exclusion criteria confirmation)
- Current sleep medication use (for exclusion criteria confirmation)

---

## 10. Timeline

| Phase | Months | Activities |
|-------|--------|------------|
| **Preparation** | Months 1-2 | IRB submission and determination; ClinicalTrials.gov registration; finalize REDCap survey; app version lock |
| **Enrollment** | Months 2-4 | Recruitment launch; consent processing; baseline surveys; participant onboarding to ShiftWell |
| **Data Collection** | Months 2-7 | Active 90-day observation period per participant (staggered enrollment acceptable — participants enrolled over 3 months, each observed for 90 days) |
| **Data Closure** | Month 8 | 90-day surveys complete for last cohort; data export and cleaning |
| **Analysis** | Month 9 | Statistical analysis per pre-specified SAP; CONSORT flow diagram |
| **Manuscript Writing** | Months 10-11 | Introduction, Methods, Results, Discussion; Table and Figure preparation |
| **Submission** | Month 12 | Target journal submission (JCSM first choice); concurrent preprint on medRxiv |
| **Publication** | Months 13-18 | Peer review, revision, acceptance |

**Total study duration:** Approximately 12-18 months from protocol finalization to journal acceptance.

**Critical path dependency:** IRB determination (Months 1-2) gates all enrollment. If EXPEDITED review is required (rather than EXEMPT), add 6-8 weeks to IRB timeline.

---

## 11. IRB Pathway Analysis

### 11.1 Classification Analysis

**Applicable regulation:** 45 CFR 46 (Common Rule, revised 2018)

**Proposed classification:** EXEMPT — Category 2: Research involving educational tests, surveys, interviews, or observation of public behavior.

**Justification for EXEMPT classification:**
1. The study uses only validated survey instruments (PSQI, ESS, SWQ) — no experimental interventions, no biological samples, no randomization
2. Data collected does not include identifiable protected health information (PHI) as defined by HIPAA — the research dataset will use participant codes, not names or medical record numbers
3. No interaction with participants beyond routine app usage (participant continues using the app as they would normally)
4. The only added burden beyond normal app use is completing 4 online surveys
5. Risk level is negligible — there is no physical risk, no deception, and minimal psychological risk from survey completion

**Key risk to EXEMPT classification:** If HealthKit sleep data is deemed PHI in the research context, the study may require EXPEDITED review (Category D2: Research involving collection of identifiable private information). This determination depends on whether sleep timing data, in combination with shift schedule data, constitutes "identifiable" information under the revised Common Rule.

**Mitigation:** De-identify data by: (1) assigning participant codes at enrollment; (2) storing participant contact information (for follow-up survey delivery) separately from research data; (3) aggregating HealthKit data at the day level (not retaining raw timestamps); (4) IRB submission should explicitly address this question.

### 11.2 IRB Institution Options

**Option A — University of South Florida (USF) IRB (Preferred)**
- Tampa-based institution; physical access for in-person consultation
- USF has experience with digital health mHealth studies
- Faculty collaborators at USF Morsani College of Medicine (sleep medicine fellowship) could serve as co-investigators, strengthening the application
- Contact: USF IRB Office — irb@usf.edu

**Option B — Johns Hopkins Bloomberg School of Public Health IRB**
- Dr. Singh's medical school connection (DO program + public health exposure)
- Strong research infrastructure; established exempt review process
- May require faculty co-investigator affiliation

**Option C — WCG IRB (Commercial IRB)**
- For-fee commercial IRB ($1,500-3,000 for exempt review)
- Fastest turnaround (2-3 weeks for exempt determination)
- Used by startup digital health companies without academic affiliation
- Appropriate if academic IRB partnerships are not established in time

**Recommendation:** Pursue Option A (USF) with Option C as backup. A co-investigator from USF Sleep Medicine provides academic credibility and access to academic IRB at no cost.

### 11.3 Expedited Review Contingency

If IRB classifies the study as EXPEDITED (rather than EXEMPT), the applicable category is:

- **Category 7:** Research on individual or group characteristics or behavior
- **Category 2:** Research involving collection of identifiable private information (if HealthKit data deemed identifiable)

Timeline impact: EXPEDITED review adds 6-8 weeks and requires full board review (vs. chair review for EXEMPT). This is manageable within the overall study timeline.

---

## 12. Sample Size Justification

**See STATISTICAL-ANALYSIS-PLAN.md (Section 1) for complete power calculation.**

Summary:
- **Effect size assumption:** Cohen's d = 0.5 (conservative — between CBT-I d=0.78 and passive digital health d=0.35-0.55)
- **Primary test:** Paired t-test within-subjects design
- **Alpha:** 0.05 two-tailed
- **Target power:** 80% requires n=34 completers; 90% power requires n=46
- **Dropout adjustment:** 20% anticipated → enroll 42 (80% power) or 58 (90% power)
- **Final target:** Enroll 125 → 100 completers (providing >95% power and enabling subgroup analyses)

The target of 100+ completers substantially exceeds minimum power requirements. This provides statistical margin for unexpected dropout rates and enables the pre-specified subgroup analyses (night-only vs. rotating shift; high vs. low adherence; high vs. low baseline PSQI) with adequate power (>70%) for each subgroup.

---

## 13. Statistical Analysis Plan Reference

The complete pre-specified Statistical Analysis Plan is in: **STATISTICAL-ANALYSIS-PLAN.md** (same directory as this protocol).

The SAP was finalized before data collection begins and covers:
- Primary analysis: paired t-test (or Wilcoxon signed-rank) for PSQI change
- Secondary analyses: ESS, SWQ changes; dose-response ANCOVA; subgroup analyses
- Missing data strategy: complete case primary; multiple imputation sensitivity
- Pre-specified subgroup hypotheses (A, B, C)
- Bonferroni correction for multiple comparisons
- Effect size reporting with 95% CI
- Software: R (primary) or Python (secondary)

---

## 14. Data Management and Security

### 14.1 Data Architecture

| Dataset | Contents | Storage | Access |
|---------|----------|---------|--------|
| Research dataset | Participant codes, PSQI/ESS/SWQ scores, adherence rates, demographics | REDCap (encrypted, HIPAA-compliant) | Research team only |
| Contact list | Names, emails, phone numbers for survey follow-up | Separate secure spreadsheet (encrypted, password-protected) | Study coordinator only |
| HealthKit data | Sleep timing, duration (de-identified, day-level aggregates) | Exported from app, stored in research dataset as participant code only | Research team only |

### 14.2 Data Linkage

Participant codes are the only linkage between the contact list and the research dataset. The linkage key is stored separately from both files and destroyed after study completion (90 days post-publication, or after any required retention period per IRB protocol).

### 14.3 Data Retention

Per federal research regulations: research records retained for 7 years after study completion. De-identified aggregate data may be retained indefinitely for meta-analysis purposes.

---

## 15. Ethics, Consent, and Confidentiality

### 15.1 Informed Consent

Informed consent will be obtained electronically (e-consent). The consent document will cover:
- Study purpose in plain language (8th grade reading level)
- What participation involves (app use, 4 surveys, 90 days)
- Voluntary nature of participation (may withdraw at any time without penalty)
- Compensation structure
- Data use and confidentiality protections
- Contact information for questions or adverse events

Consent will be collected before baseline survey administration. Participants who do not complete the consent form are not enrolled.

### 15.2 Confidentiality Protections

- No names, medical record numbers, or employer identifiers in the research dataset
- Participant codes (e.g., SW-0001, SW-0002) replace all identifiers
- Data transferred using HTTPS encryption
- REDCap hosted on HIPAA-compliant infrastructure

### 15.3 Risk-Benefit Assessment

**Risks:**
- Minimal psychological risk from survey completion (validated instruments, no deceptive items)
- No physical risk
- Privacy risk is low given de-identification protocol

**Benefits:**
- Direct: access to ShiftWell premium features during study period (standard subscription)
- Direct: $25 compensation at completion
- Indirect: contribution to shift worker sleep science and occupational health

**Assessment:** Risk-benefit ratio is clearly favorable. This study presents no more than minimal risk.

### 15.4 ClinicalTrials.gov Registration

Registration on ClinicalTrials.gov (ICMJE member) is required by most peer-reviewed journals as a condition of publication for prospective studies. Registration will be completed using study protocol version 1.0 before first enrollment. NCT number will be included in the manuscript.

---

## 16. Publication and Authorship Plan

### 16.1 Target Journals (in Priority Order)

| Rank | Journal | Publisher | Impact Factor | Open Access | Relevance |
|------|---------|-----------|---------------|-------------|-----------|
| 1 | Journal of Clinical Sleep Medicine (JCSM) | AASM | ~4.8 | Option | AASM flagship; highest relevance |
| 2 | Sleep Health | NSF / Elsevier | ~5.1 | Option | Broad audience; emphasis on real-world studies |
| 3 | JMIR mHealth and uHealth | JMIR Publications | ~5.4 | Yes (APCs apply) | Digital health focus; faster peer review (3-4 months) |
| 4 | Occupational and Environmental Medicine | BMJ | ~4.5 | Option | Occupational health angle; shift work expertise |

### 16.2 Authorship

- **First Author:** Dr. Gursimran Singh, DO — study design, data collection, analysis, writing
- **Senior Author (target):** AASM member with shift work research background; ideally from USF Morsani College of Medicine or affiliated sleep center. Role: senior authorship, methodological oversight, institutional credibility
- **Additional Authors:** Data analyst (if separate from first author); research coordinator (if contributes substantially to data collection per ICMJE criteria)

**ICMJE authorship criteria:** All listed authors must meet all four ICMJE criteria: (1) substantial contribution to conception/design OR data acquisition/analysis; (2) drafting or critical revision; (3) final approval; (4) accountability for all aspects of the work.

### 16.3 Pre-Print Strategy

A preprint on medRxiv will be submitted simultaneously with journal submission. This:
- Establishes priority (timestamped before peer review)
- Enables community feedback during peer review
- Makes findings immediately available to practitioners

### 16.4 Data Sharing

De-identified aggregate data will be deposited in a public repository (OSF or Zenodo) upon publication, consistent with open science principles and JMIR/Sleep Health data sharing policies.

---

## 17. Limitations and Bias Assessment

### 17.1 Selection Bias

**Risk:** ShiftWell users who volunteer for the study are likely more motivated to improve their sleep than the general shift worker population. This limits generalizability to motivated users but is appropriate for establishing proof-of-concept.

**Mitigation:** Report participant characteristics transparently (demographics, baseline PSQI, baseline adherence). Compare demographics to published shift worker population norms.

### 17.2 Absence of Control Group

**Risk:** Without a randomized control group, we cannot fully exclude regression to the mean, Hawthorne effect (behavior change due to being observed), or spontaneous improvement over time.

**Mitigation:**
1. Dose-response analysis: if PSQI improvement is proportional to adherence (not just participation), this argues against pure observation effect
2. Historical comparison: report effect size (Cohen's d) for comparison with published placebo/waitlist conditions in similar populations (d typically 0.1-0.2)
3. Transparent limitations reporting

### 17.3 Self-Report Bias

**Risk:** PSQI, ESS, and SWQ are subjective instruments subject to recall bias, social desirability bias, and response shift.

**Mitigation:** In-app behavioral data (adherence, recovery score, sleep debt) provides objective corroboration. Convergent validity between subjective (PSQI) and objective (adherence rate, debt balance) outcomes strengthens interpretability.

### 17.4 Adherence Paradox

**Risk:** High adherers may show improvement simply because they engaged more with the study, not because of the algorithm — a general engagement effect.

**Mitigation:** The algorithm generates specific recommendations (sleep window timing) that differ from what participants would do without guidance. Measuring the direction of sleep window shifts (toward circadian-optimal vs. circadian-misaligned timing) in high vs. low adherers would address this, though this analysis is exploratory.

### 17.5 Loss to Follow-Up

**Risk:** 20% dropout assumed; differential dropout (sicker participants drop out) would bias toward underestimating benefits.

**Mitigation:** Baseline comparison of completers vs. non-completers (reported in demographics table); multiple imputation sensitivity analysis.

---

## 18. STROBE Compliance Checklist

| STROBE Item | Location in Protocol |
|-------------|---------------------|
| Title and abstract: Study design | Section 3 |
| Introduction: Scientific background | Section 1 |
| Introduction: Study objectives | Section 2 |
| Methods: Study design | Section 3 |
| Methods: Setting (where, when) | Section 5.1, Section 10 |
| Methods: Participants (eligibility criteria) | Section 4 |
| Methods: Variables (outcomes, predictors) | Sections 7-8 |
| Methods: Data sources / measurement | Section 9 |
| Methods: Bias addressed | Section 17 |
| Methods: Study size justification | Section 12 |
| Methods: Statistical methods | Section 13 + SAP |
| Results: Participant flow | To be completed (CONSORT diagram) |
| Results: Descriptive data | To be completed |
| Results: Outcome data | To be completed |
| Results: Main results with CI | To be completed |
| Results: Other analyses | To be completed |
| Discussion: Key results | To be completed |
| Discussion: Limitations | Section 17 |
| Discussion: Interpretation | To be completed |
| Discussion: Generalizability | To be completed |
| Other: Funding | To be completed |

*Items marked "To be completed" will be populated during manuscript preparation after data collection.*

---

## 19. References

1. Borbely AA. "A two process model of sleep regulation." *Human Neurobiology*, 1982. PMID: 7185792
2. Borbely AA, Daan S, Wirz-Justice A, Deboer T. "The two-process model of sleep regulation: beginnings and outlook." *Journal of Sleep Research*, 2022. PMC9540767
3. Buysse DJ, Reynolds CF, Monk TH, Berman SR, Kupfer DJ. "The Pittsburgh Sleep Quality Index: a new instrument for psychiatric practice and research." *Psychiatry Research*, 1989. PMID: 2748771
4. Bastien CH, Vallieres A, Morin CM. "Validation of the Insomnia Severity Index as an outcome measure for insomnia research." *Sleep Medicine*, 2001. PMID: 11166338
5. Belenky G et al. "Patterns of performance degradation and restoration during sleep restriction and subsequent recovery." *Journal of Sleep Research*, 2003. PMID: 12603781
6. Czeisler CA, Kronauer RE, Allan JS et al. "Bright light induction of strong (type 0) resetting of the human circadian pacemaker." *Science*, 1990. PMID: 2367540
7. Dawson D, Reid K. "Fatigue, alcohol and performance impairment." *Nature*, 1997. PMID: 9271100
8. Drake CL, Roehrs T, Richardson G, Walsh JK, Roth T. "Shift work sleep disorder: prevalence and consequences beyond that of symptomatic day workers." *Sleep*, 2004. PMID: 14984893
9. Drake CL, Roehrs TA, Auerbach SH, Roth T. "Effects of caffeine on sleep onset latency and sleep duration." *Journal of Clinical Sleep Medicine*, 2013.
10. Eastman CI, Burgess HJ. "How to travel the world without jet lag." *Sleep Medicine Clinics*, 2009. PMID: 20161220
11. Gander PH, Merry A, Millar MM, Weller J. "Hours of work and fatigue-related error: a survey of New Zealand anaesthetists." *Anaesthesia and Intensive Care*, 2011. PMID: 11913793
12. Johns MW. "A new method for measuring daytime sleepiness: the Epworth sleepiness scale." *Sleep*, 1991. PMID: 1798888
13. Manoogian ENC, Chow LS, Taub PR, Laferrere B, Panda S. "Time-Restricted Eating for the Prevention and Management of Metabolic Diseases." *Endocrine Reviews*, 2022. PMID: 35136217
14. Milner CE, Cote KA. "Benefits of napping in healthy adults: impact of nap length, time of day, age, and experience with napping." *Journal of Sleep Research*, 2009. PMID: 19645971
15. Mollayeva T, Thurairajah P, Burton K, Mollayeva S, Shapiro CM, Colantonio A. "The Pittsburgh Sleep Quality Index as a screening tool for sleep dysfunction in clinical and non-clinical samples." *Sleep Medicine Reviews*, 2016. PMID: 25759896
16. Scott AJ, Webb TL, James MH, et al. "Improving sleep quality leads to better mental health: A meta-analysis of randomised controlled trials." *PLOS ONE*, 2021. PMID: 34762660
17. St-Onge MP et al. "Circadian disruption in cardiometabolic disease: physiology, mechanisms, and interventions." *Circulation*, 2025.
18. Trauer JM, Qian MY, Doyle JS, Rajaratnam SM, Cunnington D. "Cognitive behavioral therapy for chronic insomnia: a systematic review and meta-analysis." *Annals of Internal Medicine*, 2015. PMID: 26054060
19. Van Dongen HP, Maislin G, Mullington JM, Dinges DF. "The cumulative cost of additional wakefulness: dose-response effects on neurobehavioral functions and sleep physiology from chronic sleep restriction." *Sleep*, 2003. PMID: 12683469
20. von Elm E, Altman DG, Egger M, et al. "The Strengthening the Reporting of Observational Studies in Epidemiology (STROBE) statement: guidelines for reporting observational studies." *Lancet*, 2007. PMID: 18064739

---

*Protocol Version 1.0 — Dr. Gursimran Singh, DO — 2026-04-07*
*This protocol is pre-specified before any data collection. Any protocol amendments will be documented with version numbers and submitted to IRB before implementation.*
*ClinicalTrials.gov registration to be completed before first participant enrollment.*
