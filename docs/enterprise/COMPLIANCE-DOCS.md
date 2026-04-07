# ShiftWell Compliance Documentation

> **Version:** 1.0 | **Date:** April 2026
> **Purpose:** Enterprise sales HIPAA readiness summary and compliance roadmap
> **Source:** Synthesized from `docs/research/HIPAA-COMPLIANCE-ASSESSMENT.md`
> **Audience:** Hospital IT, Legal, Compliance, and Procurement teams

---

## Executive Summary

ShiftWell's v1.0–v1.3 consumer architecture is **local-first**: all health data remains on the user's device and never leaves the phone. ShiftWell is **not a HIPAA covered entity** in this configuration.

For enterprise deployments (v1.4+) where employers receive aggregated workforce sleep data, ShiftWell implements full HIPAA Business Associate controls. This document describes those controls, our data classification framework, de-identification methodology, BAA terms, and our SOC2 roadmap.

---

## 1. Data Flow Diagram

### Consumer Architecture (v1.0–v1.3) — No PHI Transmission

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S DEVICE                            │
│                                                                 │
│  HealthKit ──→ ShiftWell App ──→ Local Storage (encrypted)     │
│  Calendar  ──→                                                  │
│  Manual Input ──→                                               │
│                                                                 │
│  [NO DATA LEAVES DEVICE — No PHI created, transmitted, or held] │
└─────────────────────────────────────────────────────────────────┘
```

### Enterprise Architecture (v1.4+) — PHI Boundary Active

```
┌──────────────────┐      ┌────────────────────────┐      ┌─────────────────────┐
│   USER'S DEVICE  │      │   SHIFTWELL SERVERS     │      │  EMPLOYER DASHBOARD  │
│                  │      │                          │      │                      │
│  HealthKit data  │─────▶│  De-identification       │─────▶│  Aggregate only      │
│  Sleep schedule  │ TLS  │  pipeline (Safe Harbor)  │      │  (cohort ≥ 20)       │
│  Recovery score  │ 1.3  │  AES-256 at rest         │      │  No individual data  │
│                  │      │  Audit logging            │      │                      │
└──────────────────┘      └────────────────────────┘      └─────────────────────┘
         ▲                         │
         │                         │ BAA Required
         │                    ┌────▼─────────────────┐
         └────────────────────│  Covered Entity       │
           User consent        │  (Hospital/Insurer)   │
                               └───────────────────────┘

BOUNDARY 1: Device → Server (only de-identified aggregates cross)
BOUNDARY 2: Server → Employer Dashboard (Safe Harbor + differential privacy)
```

---

## 2. PHI vs. Non-PHI Classification

| Data Category | Data Elements | PHI? | Handling |
|---------------|---------------|------|----------|
| Sleep schedule | Planned bedtime, wake time, nap windows | No | Behavioral recommendations |
| Shift calendar | Shift times, start/end | No | Work schedule data |
| Onboarding profile | Chronotype, preferences, commute time | No | Behavioral preferences |
| Recovery score (v1.x) | Adherence-based 0–100 score | Borderline | Derived from behavioral data only |
| Recovery score (v2.0+) | Includes biometric inputs | **Yes** | PHI when combined with biometrics |
| HealthKit sleep data | Duration, stages, efficiency | **Yes** | Never transmitted in raw form |
| HealthKit HRV/HR | RMSSD, resting heart rate | **Yes** | Never transmitted in raw form |
| PSQI/ESS responses | Self-reported assessments | **Yes** | Never transmitted individually |
| User identity | Name, email, device ID | **Yes (identifier)** | Stripped before any aggregation |
| Employer association | Employer name + health data combo | **Yes (identifier)** | Aggregate only, cohort ≥ 20 |
| Aggregate cohort data | Average scores by department | Depends | PHI if cohort < 20; suppressed |

**Key principle:** ShiftWell never transmits individual-level health data to employers. Employers receive only de-identified aggregate statistics about cohorts of ≥20 employees.

---

## 3. De-identification Methodology

### 3.1 HIPAA Safe Harbor (45 CFR 164.514(b))

ShiftWell applies Safe Harbor de-identification before any data crosses from a user device to servers or from servers to employer dashboards. All 18 HIPAA identifiers are addressed:

| Identifier | ShiftWell Action |
|-----------|-----------------|
| Names | Stripped; pseudonymous study ID assigned |
| Geographic data (below state) | Aggregated to state or region only |
| Dates (except year) | Converted to relative days (Day 1, Day 2...) |
| Email addresses | Stripped before aggregation |
| Device/phone identifiers | Stripped before aggregation |
| IP addresses | Not logged at server level |
| Biometric patterns (HRV) | Aggregated only; no individual patterns transmitted |
| Internal user IDs | Replaced with one-way-hashed pseudonyms per cohort |
| All other identifiers | Not applicable to ShiftWell data types |

### 3.2 Differential Privacy for Small Cohorts

For employer reports where cohort size may allow re-identification:

```
Rules applied to all aggregated employer statistics:

1. Minimum cohort size: 20 employees per reported group
   Below 20 → statistic suppressed entirely

2. Laplace noise injection: epsilon = 1.0
   noisy_value = true_value + Laplace(0, sensitivity / epsilon)

3. Rounding: all reported values rounded to nearest 5
   Example: 73.2% → 75%, 41.8% → 40%

4. Never report individual-level data to employers
5. Never report cohorts smaller than 20
6. Suppress any statistic where fewer than 5 workers
   share a specific shift pattern within the cohort
```

---

## 4. Business Associate Agreement (BAA)

### 4.1 When a BAA Is Required

ShiftWell executes a BAA with each enterprise customer when:
1. The employer is a HIPAA covered entity (hospital, health system, insurer)
2. ShiftWell receives, creates, or transmits PHI on behalf of the employer
3. The employer provides ShiftWell subscriptions and receives aggregate health data

**Note:** No BAA is required when ShiftWell is used as a standalone consumer app by individual shift workers, even if those workers are employed by a covered entity.

### 4.2 BAA Template Outline

ShiftWell's BAA template covers all required HHS provisions:

| Provision | ShiftWell Position |
|-----------|-------------------|
| **Permitted uses of PHI** | Aggregate reporting only; no individual data provided to employer |
| **Safeguards** | AES-256 encryption at rest; TLS 1.3 in transit; RBAC for admin access |
| **Breach notification** | Written notification within 60 days of discovery |
| **Subcontractor obligations** | BAA flow-down to all sub-processors (cloud provider, database) |
| **Individual rights support** | Users can export/delete all data from within the app |
| **Return/destroy PHI** | Automated deletion within 30 days of contract termination |
| **Audit rights** | Annual compliance report; on-request audit support |
| **Minimum necessary PHI** | Only de-identified aggregates cross device-to-server boundary |

**BAA availability:** Standard BAA template available at contract signing. Healthcare attorney review completed. Custom provisions available for large health systems (≥500 seats).

### 4.3 Sub-Processor BAAs

ShiftWell maintains BAAs with all sub-processors that may handle PHI in the enterprise architecture:
- Cloud infrastructure provider (TBD at enterprise launch)
- Database provider (TBD at enterprise launch)
- Analytics/observability (PHI-excluded by design)

---

## 5. SOC2 Type II Roadmap

### 5.1 Why SOC2

SOC2 Type II is the de facto trust standard required by enterprise healthcare procurement. It is not legally mandated but is a practical prerequisite for contracts with large health systems.

**Current status:** Pre-SOC2. HIPAA compliance documentation and BAA execution serve as interim trust signals for early enterprise pilots.

### 5.2 Timeline

| Phase | Activity | Target | Estimated Cost |
|-------|----------|--------|----------------|
| Consumer launch | HIPAA documentation, BAA template, Privacy Policy | Now | Done ($0) |
| Enterprise pilot (v1.4) | Draft BAA, de-identification pipeline, legal review | Month 6–9 | $5,000–$10,000 |
| Enterprise launch (v1.4) | Execute BAAs, HIPAA risk assessment, data flow audit | Month 9–12 | $5,000–$15,000 |
| SOC2 readiness (v2.0) | Gap assessment, policy development, tool selection | Month 12–15 | $3,000–$8,000 |
| SOC2 Type I audit | Point-in-time controls assessment | Month 15–18 | $8,000–$12,000 |
| Observation period | 6–12 months of controls operating | Month 18–24 | Operational only |
| SOC2 Type II audit | Full assessment over observation period | Month 24–30 | $8,000–$15,000 |

**Decision gate:** Initiate SOC2 when enterprise ARR exceeds $50,000. Estimated tooling: Vanta or Drata ($6,000–$15,000/year).

### 5.3 Trust Service Criteria Priority

| Criteria | Priority | Rationale |
|----------|----------|-----------|
| Security (CC) | Critical — first | Foundation for all others |
| Availability | High | Enterprise dashboard SLA requirements |
| Confidentiality | High | Health data context |
| Privacy | High | Aligns directly with HIPAA obligations |
| Processing Integrity | Medium | Algorithm accuracy; lower risk |

### 5.4 Pre-SOC2 Controls (In Place Now or Before Enterprise Launch)

These foundational controls will be implemented regardless of SOC2 timeline:

- [ ] AES-256 encryption at rest; TLS 1.3 in transit
- [ ] Role-based access control (RBAC) for all admin/dashboard features
- [ ] Audit logging for all data access, exports, and admin actions
- [ ] Documented incident response plan (see Section 6)
- [ ] Data retention policy with automated deletion
- [ ] Vendor/sub-processor BAA management
- [ ] Annual security training for all team members with data access
- [ ] Annual penetration test of enterprise-facing infrastructure ($5,000–$25,000)

---

## 6. Incident Response Plan Summary

### 6.1 Breach Classification

| Tier | Description | Response Timeline |
|------|-------------|-------------------|
| Tier 1 (Critical) | Unauthorized access to PHI affecting ≥500 individuals | 24-hour containment; HHS notification within 60 days |
| Tier 2 (Significant) | Unauthorized access to PHI affecting <500 individuals | 72-hour containment; covered entity notification within 60 days |
| Tier 3 (Minor) | Suspected breach with no confirmed PHI exposure | Investigation within 72 hours; documentation |

### 6.2 Response Steps

```
1. DETECT — Automated monitoring alerts or team member reports suspected breach
2. CONTAIN — Immediately isolate affected systems; revoke compromised credentials
3. ASSESS — Determine scope: what data, how many individuals, how long exposed
4. NOTIFY — Covered entity (BAA partner) within 60 days per HIPAA Breach Rule
5. REMEDIATE — Patch vulnerability, restore from clean backup, document
6. REPORT — HHS notification if ≥500 individuals affected (annual log if <500)
7. REVIEW — Post-incident review; update controls to prevent recurrence
```

### 6.3 User Notification

Individual users are notified within 30 days of confirmed breach affecting their data. Notification includes: what data was affected, when it occurred, what we've done, and what users should do.

---

## 7. Data Retention and Deletion Policy

| Data Category | Retention Period | Basis |
|---------------|-----------------|-------|
| On-device sleep data | Indefinite (user controls) | Local-first; user owns data |
| Enterprise aggregate reports | 3 years | Employer reporting + regulatory |
| De-identified research data | 7 years | Publication + audit trail |
| User account data | 30 days after deletion request | GDPR/CCPA right to deletion |
| Server-side PHI (if any) | Max 1 year rolling | HIPAA minimum necessary |
| Audit logs | 6 years | HIPAA compliance records requirement |

### User Data Export

Users can export all their data in machine-readable format at any time (JSON/CSV) directly from the ShiftWell app. This satisfies HIPAA access rights, CCPA/CPRA data portability, and GDPR Article 20.

---

## 8. Regulatory Compliance Summary

| Regulation | Status | Notes |
|------------|--------|-------|
| HIPAA Privacy Rule | Compliant (consumer); BAA-ready (enterprise) | Local-first architecture; no PHI transmitted in v1.x |
| HIPAA Security Rule | Compliant | AES-256, TLS 1.3, RBAC |
| HIPAA Breach Notification | Policy documented | Automated detection planned for enterprise |
| CCPA/CPRA | Compliant | Privacy Policy covers California requirements |
| GDPR | Compliant | Consent-based, data portability, right to deletion |
| Apple HealthKit Guidelines | Compliant | Health data not used for advertising |
| SOC2 Type II | Roadmap | Target: Month 24–30 post-enterprise launch |

---

## Contact

For compliance questions, BAA requests, or security disclosures:
- Email: [legal@shiftwell.app]
- Security: [security@shiftwell.app]
- Responsible Disclosure: [security@shiftwell.app]

---

*ShiftWell Compliance Documentation v1.0 — April 2026*
*Synthesized from HIPAA-COMPLIANCE-ASSESSMENT.md*
*Review cycle: Quarterly or upon material architecture change*
