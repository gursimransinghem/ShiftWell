# ShiftWell Validation Study — Pre-Specified Statistical Analysis Plan (SAP)

**SAP Version:** 1.0
**Date:** 2026-04-07
**Corresponding Protocol:** STUDY-PROTOCOL.md (same directory)
**Analyst:** Dr. Gursimran Singh, DO (primary); statistical collaborator TBD
**Status:** LOCKED — This SAP is finalized BEFORE data collection begins. No post-hoc additions permitted.

> **Anti-HARKing Declaration:** All hypotheses, analyses, and thresholds in this document are pre-specified prior to data collection. No analyses will be added after unblinding. Any deviations from this SAP will be reported as exploratory in the manuscript.

---

## Table of Contents

1. [Power Calculation (Primary Outcome: PSQI Change)](#1-power-calculation-primary-outcome-psqi-change)
2. [Primary Analysis](#2-primary-analysis)
3. [Secondary Analyses](#3-secondary-analyses)
4. [Missing Data Strategy](#4-missing-data-strategy)
5. [Adherence Analysis](#5-adherence-analysis)
6. [Pre-Specified Subgroup Hypotheses](#6-pre-specified-subgroup-hypotheses)
7. [Reporting Standards and Multiplicity Correction](#7-reporting-standards-and-multiplicity-correction)
8. [Software and Reproducibility](#8-software-and-reproducibility)
9. [Analysis Timeline](#9-analysis-timeline)

---

## 1. Power Calculation (Primary Outcome: PSQI Change)

### 1.1 Rationale for Effect Size Selection

The primary outcome is the change in Pittsburgh Sleep Quality Index (PSQI) total score from baseline to Day 90. We selected a conservative effect size estimate by reviewing the published literature on digital and behavioral sleep interventions:

| Intervention Category | Effect Size (Cohen's d) | Source |
|----------------------|------------------------|--------|
| Cognitive Behavioral Therapy for Insomnia (CBT-I), meta-analysis | d = 0.78 | Trauer et al., 2015, *Annals of Internal Medicine* |
| Digital sleep interventions (apps, online programs), meta-analysis | d = 0.35-0.55 | Scott et al., 2021, *PLOS ONE* |
| Melatonin for shift work sleep disorder | d = 0.40 | Liira et al., 2014, Cochrane Review |
| Light therapy for circadian shift | d = 0.55 | Eastman & Burgess, 2009 (review) |

**Selected effect size: Cohen's d = 0.5**

This is a pre-registered conservative assumption that falls between CBT-I (intensive, therapist-delivered, d=0.78) and passive digital health (minimal personalization, d=0.35). ShiftWell provides personalized, algorithm-driven guidance beyond passive digital interventions, but is not as intensive as CBT-I. A moderate effect size (d=0.5) is a principled middle-ground estimate.

**PSQI standard deviation assumption:** σ = 3.5 points (pooled SD from shift worker populations; Drake et al. 2004 reported PSQI SD ≈ 3.2-4.0 in SWSD populations). A minimum detectable difference of 1.75 points at d=0.5 corresponds to approximately half the established MCID of 3 points — our power to detect the clinically significant threshold (d ≈ 0.86) is therefore substantially higher than the stated 80%.

### 1.2 Sample Size Calculation

**Test:** Paired t-test (one-sample t-test on difference scores; within-subjects pre-post design)

**Parameters:**
- Effect size (Cohen's d): 0.5
- Alpha (two-tailed): 0.05
- Power target 1 (80%): β = 0.20
- Power target 2 (90%): β = 0.10

**Formula:** n = [(z_α/2 + z_β) / d]²

For two-tailed alpha = 0.05: z_α/2 = 1.96
For power = 0.80: z_β = 0.842
For power = 0.90: z_β = 1.282

**80% power calculation:**
n = [(1.96 + 0.842) / 0.5]² = [2.802 / 0.5]² = [5.604]² = 31.4 → **n = 34 completers**

**90% power calculation:**
n = [(1.96 + 1.282) / 0.5]² = [3.242 / 0.5]² = [6.484]² = 42.0 → **n = 46 completers**

### 1.3 Dropout Adjustment

Anticipated dropout rate: 20% (based on similar 90-day digital health studies; Pew Research Center digital health adherence data; our own conservative estimate for engaged app users)

**Adjusted enrollment targets:**
- For 80% power (n=34 completers): enroll **n = 43** (34 / 0.80 = 42.5 → 43)
- For 90% power (n=46 completers): enroll **n = 58** (46 / 0.80 = 57.5 → 58)

### 1.4 Rationale for n=100+ Target

The primary power calculation demonstrates that **minimum viable sample size is 34-46 completers**. The study target of 100+ completers (enrolling ~125) provides:

1. **Statistical power:** >95% power to detect d=0.5 at alpha=0.05 (two-tailed); ~99% power to detect the clinically significant threshold (PSQI change ≥3 points, estimated d≈0.86)
2. **Subgroup analysis capability:** Three pre-specified subgroups (night-only vs. rotating shift; high vs. low adherence; high vs. low baseline PSQI) each require ~34 participants per cell — n=100 provides adequate power (≥70%) for each pre-specified subgroup
3. **Manuscript credibility:** Reviewers at JCSM and Sleep Health routinely critique underpowered studies; n=100+ substantially exceeds minimum and signals rigorous design
4. **Attrition buffer:** If dropout exceeds 20% (worst case 30%), n=125 enrolled → ~88 completers → still >80% power

**Conclusion:** The target of 100-150 completers is well-justified, substantially exceeds minimum requirements, and enables all pre-specified secondary analyses.

### 1.5 Power Sensitivity Table

| n Completers | Power (d=0.5) | Power (d=0.4) | Power (d=0.86) |
|-------------|--------------|--------------|----------------|
| 34          | 80%          | 61%          | >99%           |
| 46          | 90%          | 73%          | >99%           |
| 75          | >98%         | 89%          | >99%           |
| 100         | >99%         | 96%          | >99%           |

*d=0.86 corresponds to MCID ≥3-point PSQI change with σ=3.5*

---

## 2. Primary Analysis

### 2.1 Hypothesis

- **H0 (Null):** Mean change in PSQI total score from baseline to Day 90 = 0
- **H1 (Alternative):** Mean change in PSQI total score from baseline to Day 90 < 0 (i.e., improvement)
- **Test type:** Two-tailed (conservative, per publication standards; one-tailed hypothesis is stated in H1 but two-tailed test used for publication credibility)
- **Alpha:** 0.05

### 2.2 Statistical Test

**Primary test:** Paired t-test on PSQI change score (PSQI_90 - PSQI_0)

**Normality assessment:** Before choosing between parametric and non-parametric test:
1. Shapiro-Wilk test on PSQI change scores (significant p < 0.05 indicates departure from normality)
2. Visual inspection: Q-Q plot and histogram of change scores
3. **Pre-specified decision rule:** If Shapiro-Wilk p < 0.05 AND visual inspection confirms non-normality (skewness > |2| or kurtosis > |7|), replace paired t-test with Wilcoxon signed-rank test (non-parametric equivalent). This decision is made after initial data inspection, before examining results.

### 2.3 Analytic Sample

**Primary analysis population:** Complete cases — participants with both baseline PSQI (T0) and 90-day PSQI (T3). This is the intention-to-treat analytic population for this observational study.

**Exclusions from analysis:**
- Enrolled participants who never completed the baseline survey (no data) — not counted in denominator
- Participants who withdrew consent and requested data deletion

**Inclusion:** All enrolled participants with both T0 and T3 PSQI scores, regardless of adherence level or intermediate survey completion.

### 2.4 Reporting Requirements

All primary analysis results will be reported per STROBE standards:

| Metric | Reporting |
|--------|-----------|
| N | Completers (both T0 and T3 PSQI) with reasons for exclusion |
| Mean baseline PSQI (SD) | Per CONSORT table format |
| Mean 90-day PSQI (SD) | As above |
| Mean change (SD) | PSQI_T3 - PSQI_T0 |
| 95% Confidence Interval for mean change | Paired t-test CI |
| t-statistic, degrees of freedom | Reported exactly |
| p-value | Exact (e.g., p=0.023 — not p<0.05) |
| Effect size | Cohen's d with 95% CI |
| NNT at MCID | % achieving ≥3-point improvement with 95% CI |

**Number Needed to Treat (NNT) at MCID:** The proportion of participants achieving ≥3-point PSQI reduction will be reported as a clinically interpretable secondary metric. NNT = 1 / (response_rate - assumed_spontaneous_improvement_rate), where spontaneous improvement is assumed 15% based on watchful waiting control arms in published insomnia RCTs.

---

## 3. Secondary Analyses

### 3a. Dose-Response Analysis (Pre-Specified)

**Hypothesis:** PSQI improvement is proportional to ShiftWell adherence level — a dose-response relationship supporting causal attribution.

**Adherence tertile classification (pre-specified thresholds):**
| Tertile | Weekly Adherence Rate | Label |
|---------|----------------------|-------|
| Low | < 40% | Low adherence |
| Medium | 40-70% | Medium adherence |
| High | > 70% | High adherence |

Note: Tertile thresholds are pre-specified rather than data-driven to prevent cherry-picking. These thresholds are clinically meaningful: <40% represents minimal engagement, >70% represents consistent use.

**Statistical test:** Analysis of Covariance (ANCOVA)
- **Dependent variable:** PSQI at Day 90 (T3)
- **Covariate:** Baseline PSQI (T0) — controls for regression to the mean
- **Factor:** Adherence tertile (3 levels)

**Expected finding:** F-test for adherence tertile is significant (p < 0.05); post-hoc pairwise comparison: High > Medium > Low in PSQI improvement magnitude (Bonferroni adjustment within ANCOVA: alpha = 0.05/3 comparisons = 0.017).

**Why ANCOVA and not repeated measures ANOVA?** ANCOVA directly adjusts for baseline PSQI difference between adherence groups, which is more appropriate when groups may differ at baseline (since adherence level is not randomized).

### 3b. Subgroup Analysis — Shift Type (Pre-Specified)

**Hypothesis:** Night-only shift workers will show greater PSQI improvement than rotating shift workers.

**Rationale:** Night-only workers have a stable circadian challenge that the algorithm can optimally address (consistent schedule = consistent sleep window). Rotating shift workers face varying circadian demands that the algorithm must continuously re-optimize, potentially with less consistent benefit.

**Groups:**
- Night-only: works ≥3 night shifts/week with no day or evening shift components
- Rotating: works a mix of shift types within any 4-week cycle

**Statistical test:** Two-sample independent t-test (or Mann-Whitney U if normality violated per Shapiro-Wilk)
- **Dependent variable:** PSQI change score (T3 - T0)
- **Alpha (adjusted for multiple comparisons):** Bonferroni correction across all pre-specified subgroup analyses → alpha = 0.05/3 = **0.017**
- **Note:** Subgroup analyses are hypothesis-generating; a significant result informs Phase 2 study design, it does not constitute primary evidence

### 3c. Recovery Score Trajectory (Pre-Specified)

**Hypothesis:** ShiftWell recovery score increases monotonically from Week 1 to Week 12.

**Data structure:** Repeated measures — mean weekly recovery score at Weeks 1, 4, 8, 12 (4 time points)

**Statistical test:** Linear Mixed Effects Model
- **Outcome:** Recovery score (0-100 scale)
- **Fixed effect:** Time (weeks 1, 4, 8, 12 as numeric)
- **Random effect:** Participant (random intercept to account for inter-individual differences in baseline recovery score)
- **Estimate of interest:** Slope of time coefficient — is it positive and significant?

**Reporting:**
- Fixed effect estimate for time (slope) with 95% CI
- p-value for time slope
- Random effects variance (ICC — intraclass correlation coefficient) to characterize between-subject heterogeneity
- Conditional R² (variance explained by fixed + random effects)

**Convergence with primary outcome:** Pearson correlation between 90-day recovery score change and PSQI change will be reported as construct validity evidence. Expected r > 0.4 (moderate) if recovery score has validity as a real-time proxy for sleep quality.

### 3d. ESS and SWQ Secondary Outcomes (Pre-Specified)

**Tests:** Paired t-test (or Wilcoxon signed-rank per normality assessment) — identical procedure to primary PSQI analysis

**Bonferroni correction for multiple secondary questionnaire outcomes:**
- Number of secondary questionnaire outcomes: 2 (ESS, SWQ)
- Adjusted alpha per test: 0.05/2 = **0.025**

**Reporting:** Same format as primary analysis — mean change, 95% CI, Cohen's d, p-value (exact), NNT.

**Trajectory analysis:** PSQI, ESS, and SWQ scores at T0, T1 (Day 30), T2 (Day 60), T3 (Day 90) will be plotted as longitudinal profiles to visualize improvement trajectory. Repeated measures ANOVA will test whether scores at T1 and T2 differ from baseline (alpha = 0.025 for intermediate timepoints, Bonferroni-adjusted).

---

## 4. Missing Data Strategy

### 4.1 Primary Analysis Approach: Complete Case Analysis

The primary analysis is complete case analysis — only participants with both T0 (baseline) and T3 (Day 90) PSQI scores are included.

**Justification:** In a 90-day observational study with modest dropout (<20% anticipated), complete case analysis is appropriate when missingness is completely at random (MCAR) or missing at random (MAR) conditional on observed covariates. The dropout analysis (see 4.3) will assess whether this assumption is tenable.

### 4.2 Sensitivity Analysis: Multiple Imputation

**Trigger:** If dropout rate exceeds 15% OR baseline characteristics differ between completers and non-completers (Section 4.3), multiple imputation will be performed as sensitivity analysis.

**Method:** Multiple imputation by chained equations (MICE), implemented in R (`mice` package, version ≥3.0)

**Imputation details:**
- Number of imputations: m = 20 (Rubin's rule; adequate for up to 20% missing data)
- Variables included in imputation model: baseline PSQI, baseline ESS, age, shift type, sex, intermediate timepoint PSQI scores (T1, T2) when available
- Imputation method by variable type: predictive mean matching (continuous variables); logistic regression (binary)
- Convergence checked by plotting mean and SD of imputed values across iterations

**Reporting:** If complete case and multiple imputation analyses yield materially different results (>0.5 Cohen's d difference), both will be reported in the Results. If results are consistent, multiple imputation results will be reported in Supplementary materials.

### 4.3 Dropout Analysis (Pre-Specified)

A dropout analysis will compare baseline characteristics of completers (T3 survey submitted) vs. non-completers (T3 survey not submitted) on the following variables:

| Variable | Test |
|----------|------|
| Age | Independent t-test |
| Sex | Chi-square |
| Shift type (night vs. rotating) | Chi-square |
| Baseline PSQI | Independent t-test |
| Baseline ESS | Independent t-test |
| Week 1 adherence rate | Independent t-test |

**Interpretation:** If ≥3 of 6 variables differ significantly (p < 0.05) between completers and non-completers, or if baseline PSQI differs by >2 points between groups, this suggests informative dropout. This finding will be prominently reported in the Limitations section and the multiple imputation sensitivity analysis results will be elevated to the primary text.

### 4.4 Intermediate Timepoints

For participants who complete T3 but missed T1 or T2 intermediate surveys: they ARE included in the primary analysis (only T0 and T3 required). Missing T1/T2 data is coded as missing in the longitudinal trajectory analysis (Section 3d) and handled by mixed effects modeling (which accommodates missing intermediate timepoints under MAR assumption).

---

## 5. Adherence Analysis

### 5.1 Definition of Adherence

A night is classified as **"adherent"** if:

`|actual_sleep_start - recommended_sleep_start| ≤ 30 minutes`

Where:
- **Actual sleep start:** Time derived from Apple HealthKit sleep data (primary) or self-report (secondary if HealthKit unavailable)
- **Recommended sleep start:** ShiftWell app-generated sleep window start time for that calendar date
- **30-minute threshold:** Based on normal sleep onset latency of 10-20 minutes per AASM guidelines; 30 minutes accommodates biological variation while still distinguishing adherent from non-adherent behavior

### 5.2 Weekly Adherence Rate

```
Weekly_Adherence_Rate (%) = (Adherent_Nights / Total_Tracked_Nights) × 100
```

Where Total_Tracked_Nights = nights with both a ShiftWell recommendation AND a HealthKit sleep record for that calendar date.

Nights without either a recommendation (off-duty period with no scheduled sleep) or a HealthKit record (participant did not wear device/device not synced) are excluded from the denominator. Participants with <3 tracked nights in a given week will have that week excluded from adherence calculations.

### 5.3 Overall Adherence Rate

```
Overall_Adherence_Rate (%) = (Sum of Adherent Nights across all weeks) / (Sum of Total Tracked Nights across all weeks) × 100
```

This 90-day overall adherence rate is the primary adherence metric used for tertile classification in the dose-response analysis (Section 3a).

### 5.4 Primary Adherence Research Question

**Question:** Does ShiftWell adherence rate improve over the 90-day study period as participants become habituated to the sleep schedule?

**Hypothesis:** Adherence rate at Week 12 is higher than at Week 1 (learning effect / habit formation).

**Test:** Repeated measures ANOVA with time (weeks 1, 4, 8, 12) as within-subject factor and adherence rate as outcome.
- Mauchly's test for sphericity; Greenhouse-Geisser correction if violated
- Post-hoc: Bonferroni pairwise comparisons between weeks if overall F is significant (alpha = 0.05/6 pairwise comparisons = 0.008)

**Secondary question:** Does adherence rate in the first 2 weeks predict 90-day PSQI change? This is a practical question for early identification of participants likely to benefit. Pearson correlation between Weeks 1-2 mean adherence and PSQI change (T3-T0). Threshold: r > 0.3 suggests clinically useful early prediction.

---

## 6. Pre-Specified Subgroup Hypotheses

All hypotheses below are declared before data collection. Results will be reported as hypothesis-confirming or hypothesis-disconfirming. Additional subgroup analyses (not listed here) will be labeled as EXPLORATORY in the manuscript.

### Hypothesis A: Shift Type Differential Effect

**Statement (pre-specified):** Night-only shift workers will show a greater absolute reduction in PSQI total score (T3-T0) compared to rotating shift workers, because the ShiftWell algorithm achieves more consistent circadian optimization for stable schedules than for variable ones.

**Direction:** Night-only PSQI change > Rotating PSQI change (more negative = more improvement)

**Test:** Two-sample t-test on PSQI change scores, stratified by shift type
**Alpha:** 0.017 (Bonferroni-corrected, 3 subgroup tests)
**Minimum detectable effect at n=50 per group:** d=0.4

**Expected finding if confirmed:** Night-only workers achieve mean PSQI change of -4.5 points vs. rotating workers -2.5 points

### Hypothesis B: Baseline Severity Differential Effect

**Statement (pre-specified):** Participants with baseline PSQI ≥10 (moderate-severe sleep disturbance) will show a greater absolute PSQI improvement than those with baseline PSQI <10 (mild disturbance), due to the statistical floor effect in mild cases and greater biological opportunity for improvement in more impaired participants.

**Direction:** Baseline PSQI ≥10 group PSQI change > Baseline PSQI <10 group PSQI change (absolute)

**Test:** Two-sample t-test on PSQI change scores, stratified by baseline severity group
**Alpha:** 0.017 (Bonferroni-corrected)

**Threshold:** PSQI ≥10 is pre-specified as the cut-point for moderate-severe disturbance (Buysse criteria)

### Hypothesis C: High Adherence Clinical Significance

**Statement (pre-specified):** Participants with overall 90-day adherence rate >70% will achieve a mean PSQI reduction of ≥3 points (the MCID threshold), demonstrating that consistent algorithm use produces clinically significant sleep quality improvement.

**Test:** One-sample t-test: Is mean PSQI change in the High adherence group (>70%) significantly less than -3.0?
- H0: Mean PSQI change in High group ≥ -3.0 (i.e., no clinically significant change)
- H1: Mean PSQI change in High group < -3.0
**Alpha:** 0.017 (Bonferroni-corrected)

**Clinical significance:** If confirmed, Hypothesis C constitutes the primary evidence for clinical efficacy in a high-engagement user population. This is the key claim for peer-reviewed publication.

---

## 7. Reporting Standards and Multiplicity Correction

### 7.1 Multiple Comparisons Framework

| Analysis Category | Number of Tests | Correction Method | Adjusted Alpha |
|-------------------|----------------|-------------------|----------------|
| Primary analysis | 1 (PSQI change) | None (pre-specified primary) | 0.05 |
| Secondary questionnaires | 2 (ESS, SWQ) | Bonferroni | 0.025 |
| Subgroup analyses | 3 (A, B, C) | Bonferroni | 0.017 |
| Adherence ANOVA post-hoc | 6 pairwise | Bonferroni | 0.008 |
| ANCOVA adherence tertile pairwise | 3 pairwise | Bonferroni within ANCOVA | 0.017 |

### 7.2 STROBE Reporting Standards

Per STROBE checklist for cohort studies, the manuscript will include:

- **CONSORT-style participant flow diagram:** Screened → Eligible → Enrolled → Completed T1 → Completed T2 → Completed T3 → Analyzed (complete case)
- **Table 1 — Participant characteristics:** Age (mean, SD), sex (n, %), race/ethnicity (n, %), shift type (n, %), years on shift schedule (mean, SD), baseline PSQI (mean, SD), baseline ESS (mean, SD)
- **Table 2 — Primary and secondary outcomes:** Mean (SD), change from baseline (mean, 95% CI), Cohen's d with 95% CI, p-value (exact), NNT

### 7.3 Effect Size Reporting

All primary and secondary outcomes will report Cohen's d with 95% CI, calculated as:

```
d = mean_change / pooled_SD
95% CI using noncentral t-distribution (R: `effectsize` package, function `cohens_d`)
```

For the ANCOVA dose-response analysis: partial eta-squared (η²_p) will be reported as the effect size for the F-test.

### 7.4 P-Value Reporting

All p-values will be reported exactly (e.g., p=0.023). The value p<0.001 may be used for very small p-values but p=0.05 or p=0.04 will never be rounded to "p<0.05." This is per JCSM and Sleep Health author guidelines.

---

## 8. Software and Reproducibility

### 8.1 Primary Analysis Software

**Language:** R (version to be specified at time of analysis; currently R 4.4.x)

**Required Packages:**

| Package | Purpose |
|---------|---------|
| `stats` (base R) | Paired t-test, ANOVA, Shapiro-Wilk, Pearson correlation |
| `mice` | Multiple imputation (v3.0+) |
| `lme4` | Linear mixed effects models |
| `lmerTest` | p-values for mixed effects models |
| `effectsize` | Cohen's d with CI, partial eta-squared |
| `car` | ANCOVA, Levene's test |
| `ggplot2` | Visualization (longitudinal profiles, dose-response plots) |
| `rstatix` | Repeated measures ANOVA, Mauchly's test |
| `tableone` | Table 1 participant characteristics generation |

**Reporting:** R version and all package versions will be reported in the Methods section.

### 8.2 Secondary Analysis Software

**Language:** Python (backup/validation) — scipy.stats, statsmodels, pandas

Python replication of primary analysis will serve as quality check. If results differ from R by >0.01 in effect size or >0.001 in p-value, discrepancy will be investigated and resolved before manuscript submission.

### 8.3 Reproducibility

An analysis script (R Markdown or Quarto document) will be prepared that:
1. Ingests the de-identified CSV export from REDCap
2. Runs all pre-specified analyses in the order defined in this SAP
3. Generates all tables and figures for the manuscript
4. Is version-controlled in a private GitHub repository

The analysis script will be shared publicly (OSF or GitHub) upon publication, consistent with open science standards.

---

## 9. Analysis Timeline

| Milestone | Target Date | Activities |
|-----------|-------------|------------|
| SAP finalization | Before first enrollment | This document locked |
| ClinicalTrials.gov registration | Before first enrollment | SAP and protocol uploaded |
| Interim safety review | Month 4 (midpoint) | Adverse events only; no efficacy peek |
| Data lock | Month 8 | All T3 surveys submitted; data exported |
| Data cleaning | Week 1 of Month 9 | Outlier identification, exclusion confirmation |
| Dropout analysis | Week 1-2 of Month 9 | Completers vs. non-completers comparison |
| Primary analysis | Week 2-3 of Month 9 | Paired t-test, normality assessment |
| Secondary analyses | Week 3-4 of Month 9 | ESS, SWQ, dose-response, mixed effects |
| Subgroup analyses | Week 4 of Month 9 | Hypotheses A, B, C |
| Sensitivity analysis | Week 4 of Month 9 | Multiple imputation (if triggered) |
| Table and figure generation | Week 1 of Month 10 | All manuscript-ready tables and figures |
| Results review | Week 2 of Month 10 | Internal review by all authors |
| Manuscript writing | Months 10-11 | Introduction, Discussion, Abstract |
| Submission | Month 12 | JCSM (primary target) |

### 9.1 Interim Analysis Policy

No interim efficacy analysis will be performed. A safety review at Month 4 will check for:
- Any serious adverse events (none expected; study involves questionnaire completion and normal app use)
- Dropout rate trajectory (if >30% dropout projected, enrollment target may be increased)

This is NOT an interim efficacy analysis — PSQI data will not be examined at Month 4. The pre-specified primary analysis is performed only after data lock.

---

*SAP Version 1.0 — Dr. Gursimran Singh, DO — 2026-04-07*
*Locked before data collection. Any amendments require version increment, documented rationale, and IRB notification if applicable.*
*This SAP will be uploaded to ClinicalTrials.gov at registration.*
