---
title: "HIPAA Compliance Assessment: Data Flow Mapping & Safeguards"
date: 2026-04-07
project: ShiftWell
phase: 26-enterprise-research
plan: 26-01
domain: HIPAA compliance, privacy, data classification, enterprise readiness
tags: [HIPAA, PHI, BAA, de-identification, differential-privacy, SOC2, compliance, enterprise]
confidence: HIGH (HIPAA requirements and Safe Harbor method), MEDIUM (epsilon tuning and SOC2 costs)
provides: "Data flow map and required safeguards for employer dashboard"
feeds_into: "Phase 27 ENT-01 — data pipeline architecture decisions"
---

# HIPAA Compliance Assessment: Data Flow Mapping & Safeguards

**Purpose:** Map all ShiftWell data flows, classify PHI vs. non-PHI, specify required safeguards for enterprise deployment, and produce a development checklist for Phase 27.

**Key finding:** Consumer ShiftWell (v1.0-v1.3) is NOT a covered entity and has no HIPAA obligations. Enterprise ShiftWell (Phase 27+) creates a Business Associate relationship when employers receive aggregated health data — BAA is required before any pilot launch. De-identification (Safe Harbor) plus differential privacy for small cohorts is the compliant architecture.

---

## 1. Does HIPAA Apply?

### 1.1 ShiftWell as Consumer App: No HIPAA Obligation

ShiftWell in its current local-first architecture (v1.0-v1.3):
- Users download independently from the App Store
- All health data (HealthKit, recovery scores, sleep plans) stays on device
- No data is transmitted to ShiftWell servers
- ShiftWell is NOT a HIPAA covered entity
- No Business Associate Agreement is required

**Why not?** HIPAA's Privacy Rule applies to covered entities (healthcare providers, health plans, clearinghouses) and their business associates. A consumer app that stores data locally and is downloaded independently — even by healthcare workers — does not trigger HIPAA, because ShiftWell never receives, maintains, or transmits individually identifiable health information.

### 1.2 ShiftWell as Enterprise Platform: BAA Required

When an employer (hospital, health system) purchases ShiftWell and receives outcome reports:
- The employer IS a covered entity (hospital)
- ShiftWell becomes a **Business Associate (BA)** under HIPAA 45 CFR §164.308
- A **BAA (Business Associate Agreement)** is legally required before any health data flows to the employer
- This applies even if ShiftWell only transmits de-identified aggregate data — the employer-sponsored arrangement establishes the BA relationship

**Development implications:**
1. Do NOT build any employer data flow without a signed BAA template ready
2. De-identification pipeline must be implemented server-side before Phase 27 pilot launch
3. Differential privacy must be applied for all small cohorts before the first employer sees data
4. Every employer API endpoint must validate that a BAA is on file for that org_id

### 1.3 Data Flows That Trigger BAA Requirement

| Data Flow | BAA Required? | Trigger Condition |
|-----------|--------------|-------------------|
| User → ShiftWell mobile app | No | Local-first; no PHI transmitted |
| ShiftWell app → ShiftWell backend (enterprise enrollment) | Yes | Health data leaves device for employer benefit |
| ShiftWell backend → Employer dashboard | Yes | Aggregated health data to employer |
| Employer → ShiftWell (schedule import with employee IDs) | Yes | Employee IDs + work data = PHI when combined with health data |
| ShiftWell backend → Analytics/research | Conditional | De-identified aggregate: no BAA. Individual-linked: yes |

---

## 2. Data Flow Map

Each numbered flow below classifies the data type, PHI status, and required safeguard.

```
[Data Flow Architecture]

FLOW 1: User → Mobile App (device-local)
  Data: sleep schedule, adherence, recovery scores, HealthKit HRV/sleep
  PHI: YES (if HealthKit biometric data linked to identity)
  Safeguard: No data leaves device. Local-first architecture. No BAA needed.

FLOW 2: Mobile App → ShiftWell Backend
  Data: enrollment confirmation, aggregate contribution (enterprise users only)
  PHI: YES — encrypted health data if transmitted
  Safeguard: TLS 1.2+ minimum (TLS 1.3 required Phase 27+); AES-256 server-side

FLOW 3: ShiftWell Backend → Employer Dashboard API
  Data: AGGREGATED ONLY — cohort mean scores, trend data, adherence rates
  PHI: Only if not properly de-identified
  Safeguard: Safe Harbor de-identification REQUIRED. Differential privacy for cohorts < 50.
  Rule: NEVER transmit individual-level records to employer

FLOW 4: Employer → ShiftWell (Schedule Import)
  Data: Shift schedules with employee IDs
  PHI: YES — employee IDs combined with work schedule = PHI under HIPAA
  Safeguard: BAA required. Import processed server-side. Employee IDs replaced with
             internal pseudonymous IDs (hash or UUID) before storage.

FLOW 5: ShiftWell Backend → Analytics/Research
  Data: De-identified aggregate data only
  PHI: No — if properly de-identified per Safe Harbor
  Safeguard: Safe Harbor applied. Cohort minimum enforced. No individual records.
```

**The critical rule:** The employer dashboard (Flow 3) receives ONLY pre-aggregated metrics. Individual records NEVER cross this boundary. This is not a preference — it is the architectural constraint that makes de-identification possible and limits ShiftWell's liability.

---

## 3. De-identification Methods

### 3.1 HIPAA Safe Harbor (45 CFR §164.514(b)) — Primary Method

Safe Harbor requires removing all 18 specified identifiers before data can be considered de-identified. ShiftWell data mapped against each identifier:

| # | Identifier | ShiftWell Collects? | Action Required |
|---|-----------|--------------------|--------------------|
| 1 | Names | Yes — user profile | Strip before aggregation; replace with pseudonym |
| 2 | Geographic data below state level | Yes — work location | Aggregate to state level only |
| 3 | Dates (except year) | Yes — sleep timestamps | Convert to relative days (Day 1, Day 2, etc.) |
| 4 | Phone numbers | No | N/A |
| 5 | Fax numbers | No | N/A |
| 6 | Email addresses | Yes — auth | Strip before aggregation |
| 7 | Social Security Numbers | No | N/A |
| 8 | Medical record numbers | No | N/A |
| 9 | Health plan beneficiary numbers | No | N/A |
| 10 | Account numbers | No | N/A |
| 11 | Certificate/license numbers | No | N/A |
| 12 | Vehicle identifiers | No | N/A |
| 13 | Device identifiers | Yes — phone/watch IDs | Strip from all records before aggregation |
| 14 | URLs | No | N/A |
| 15 | IP addresses | Potentially — server logs | Strip from logs; do not log without truncation |
| 16 | Biometric identifiers | Yes — HRV waveform patterns | Aggregate only; never transmit individual patterns |
| 17 | Full-face photographs | No | N/A |
| 18 | Any unique identifying number | Yes — internal user IDs | Replace with study-specific pseudonyms (org_id + hash) |

**ShiftWell identifies as handling identifiers 1, 2, 3, 6, 13, 15, 16, and 18.** These eight identifiers must be removed or generalized before any data leaves the device for enterprise use.

### 3.2 Expert Determination — Secondary Method

Alternative to Safe Harbor: a qualified statistical expert certifies that residual re-identification risk is "very small" (45 CFR §164.514(b)(1)).

- **Cost:** $10,000-$50,000 for initial certification; renewal required on data schema changes
- **When needed:** Research publications where more granular data is required; small cohort analysis that cannot pass Safe Harbor
- **Recommendation:** Use Safe Harbor for enterprise reporting (well-defined, no expert cost). Reserve Expert Determination for peer-reviewed publications where ShiftWell wants to report granular outcomes.

### 3.3 Differential Privacy for Small Cohorts — Required for Phase 27

**Problem:** When an employer has fewer than 50 users enrolled, Safe Harbor de-identification may not prevent re-identification. Example: "The only ICU night shift nurse with a recovery score below 40 last Tuesday" identifies one person even with names removed.

**Solution:** Laplace mechanism differential privacy applied to all aggregate statistics before they are sent to employers.

**Specification:**
```
For any statistic reported in the employer dashboard:

1. Minimum cohort size threshold: 20 employees per reported subgroup
   - Below 20: suppress the statistic entirely (display "Insufficient data")
   - This threshold applies per: department, shift type, or any reported subgroup

2. Noise injection: Laplace mechanism
   noisy_value = true_value + Laplace(0, sensitivity / epsilon)
   - epsilon = 1.0 (recommended balance: healthcare analytics standard)
   - sensitivity = maximum change to the statistic from adding/removing one user

3. Rounding: Round all reported values to nearest 5 units
   Example: 73.2% → 75%, 41.8% → 40%

4. Suppression rules:
   - NEVER report individual-level data to employers (architectural constraint)
   - NEVER report cohorts smaller than 20
   - NEVER report shift-pattern data when fewer than 5 workers share that pattern
   - NEVER transmit raw HealthKit data to any external system

5. Privacy budget (epsilon) reference:
   epsilon = 0.1: Very strong privacy (high noise, less analytical value)
   epsilon = 1.0: RECOMMENDED — balanced for ShiftWell enterprise reports
   epsilon = 10.0: Weak privacy (lower noise, higher re-identification risk — do not use)
```

**Implementation:** Differential privacy is applied **server-side** before the API response is constructed. It is NOT applied in the mobile app. The mobile app computes and stores raw individual values locally; the privacy layer exists only at the server-to-employer boundary.

---

## 4. Differential Privacy for Small Cohorts

(Detailed specification as above, Section 3.3.)

**Technical library recommendation:** Google's open-source differential privacy libraries (github.com/google/differential-privacy) or OpenDP (opendp.org) provide vetted Laplace mechanism implementations. Do not implement from scratch — use an audited library.

**Validation requirement:** Before Phase 27 pilot launch, verify that:
1. Epsilon = 1.0 is applied to all employer-facing aggregate queries
2. Cohort minimum (20) is enforced in the query layer, not just the presentation layer
3. Noise injection occurs before query results are serialized, not after
4. Unit tests verify that individual-level data cannot be derived from employer dashboard output (oracle attack simulation)

---

## 5. Required Technical Safeguards (HIPAA §164.312)

| Safeguard | Requirement | ShiftWell Phase 27 Implementation |
|-----------|-------------|-----------------------------------|
| **Encryption at rest** | AES-256 for all PHI in database | Supabase (Postgres) encrypted storage + Row Level Security |
| **Encryption in transit** | TLS 1.3 minimum for all PHI data flows | Enforce TLS 1.3 on all Supabase API endpoints; reject TLS 1.2 |
| **Access controls** | Role-based access; employer sees only their cohort | JWT scoped to org_id; row-level security in Postgres (employer_id = JWT.org_id) |
| **Audit logging** | All PHI access logged: timestamp, user, action, result | Supabase audit log table; log all queries to employer dashboard API |
| **Minimum necessary** | Employer receives only pre-aggregated metrics, never individual records | Server enforces: individual-level queries return 403 for employer role |
| **Unique user ID** | Internal pseudonymous ID (not email) for all health data joins | SHA-256(user_id + org_salt) → replaces PII in enterprise data tables |
| **Workforce access** | Only authorized personnel access PHI | Internal admin dashboard requires MFA; access logged |
| **Emergency access** | Documented procedure for PHI access in emergencies | Incident response runbook with break-glass procedure |

---

## 6. Required Administrative Safeguards

### 6.1 BAA Template: Core Provisions

A Business Associate Agreement between ShiftWell (Business Associate) and each enterprise customer (Covered Entity) must include the following provisions (per HHS sample provisions and 45 CFR §164.504(e)):

| Provision | ShiftWell Obligation |
|-----------|---------------------|
| **Permitted uses of PHI** | Use PHI only for: (a) providing aggregate wellness reporting to Covered Entity, (b) improving ShiftWell algorithms (de-identified), (c) as required by law |
| **Prohibited uses** | No sale of PHI; no use for marketing; no disclosure to third parties without authorization |
| **Appropriate safeguards** | Implement AES-256 encryption at rest, TLS 1.3 in transit, access controls, audit logging |
| **Breach notification** | Report any breach of unsecured PHI to Covered Entity within **60 days** of discovery (HIPAA §164.410(b)) |
| **Subcontractor BAAs** | Execute BAAs with all subcontractors handling PHI (Supabase, cloud providers) |
| **Data subject rights** | Support Covered Entity in responding to individual access and amendment requests |
| **Return or destruction of PHI** | On contract termination: destroy all PHI within **30 days**; provide written confirmation |
| **Audit rights** | Allow Covered Entity (or its designee) to audit ShiftWell's compliance practices |
| **Minimum necessary** | Request, use, and disclose only the minimum PHI necessary |

**BAA template strategy:**
- Phase 1: Draft BAA using HHS sample provisions as foundation. Healthcare attorney review: $2,000-$5,000 (one-time).
- Phase 2: Standard BAA available for all enterprise customers; customization for large health systems.
- Required before: First employer API key is issued. No exceptions.

### 6.2 Data Retention Policy

| Data Category | Retention Period | Basis |
|---------------|-----------------|-------|
| Server-side PHI (enterprise users) | Maximum 1 year rolling | HIPAA minimum necessary |
| De-identified research data | 7 years | Publication requirements |
| Enterprise aggregate reports | 3 years | Employer reporting needs |
| User account data | 30 days after deletion request | GDPR/CCPA right to deletion |
| Audit logs | 6 years | HIPAA requires 6-year retention of compliance records (§164.530) |
| On-device data | Indefinite — user controls | Local-first; ShiftWell does not manage |

### 6.3 Breach Response Outline

If a data breach involving PHI is suspected:

1. **Detect:** Automated anomaly detection on server-side data access patterns
2. **Contain:** Immediately revoke affected API keys and disable compromised accounts
3. **Assess:** Determine scope — number of individuals, types of PHI, root cause
4. **Notify:** Covered Entity (employer) within 60 days of discovery (HIPAA §164.410)
5. **Notify:** HHS via online portal if >500 individuals affected; state AG if required
6. **Document:** Maintain breach log with date, scope, response actions, notifications
7. **Remediate:** Patch root cause; implement additional safeguards; update incident response plan

### 6.4 SOC 2 Type II Roadmap

SOC 2 Type II is the de facto trust standard required by enterprise healthcare customers for SaaS vendors. It is not legally mandated but is a **practical prerequisite** for contracts above $50,000 ARR.

| Phase | Activity | Timeline | Estimated Cost |
|-------|----------|----------|----------------|
| Readiness | Gap assessment, policy development, tooling selection | 2-3 months | $3,000-$8,000 |
| Implementation | Security controls, monitoring, audit evidence collection | 2-4 months | $5,000-$15,000 |
| Type I audit | Point-in-time assessment | 1-2 months | $8,000-$12,000 |
| Observation period | Controls operating effectively | 6-12 months | $0 (operational) |
| Type II audit | Assessment over observation period | 1-2 months | $8,000-$15,000 |
| **Total Year 1** | | 12-18 months | $24,000-$50,000 |
| Annual renewal | Re-audit + maintenance | Ongoing | $12,000-$25,000/year |

**Recommendation:** Defer SOC 2 until enterprise revenue justifies the investment (target: $50K+ ARR from enterprise). Use HIPAA compliance documentation and BAA execution as interim trust signals for early pilots. Start SOC 2 readiness assessment at $50K ARR.

**Pre-SOC 2 controls to implement now (Phase 27):**
1. Encryption at rest and in transit (AES-256, TLS 1.3)
2. Role-based access control with MFA for admin functions
3. Audit logging for all PHI access
4. Incident response plan documented
5. Data retention policy implemented and automated
6. Vendor management (BAAs with Supabase, Apple)

---

## 7. Development Checklist for Phase 27

The following must be true before the first employer pilot is launched. Each item maps to a HIPAA requirement and a technical safeguard.

- [ ] **BAA template** reviewed and approved by healthcare attorney — no employer API key issued without signed BAA
- [ ] **All PII stripped** before aggregate query results leave backend — verified by integration test
- [ ] **Differential privacy** (Laplace mechanism, ε = 1.0) applied for all cohorts regardless of size — applied for cohorts < 50 as minimum
- [ ] **TLS 1.3** enforced on all API endpoints — TLS 1.2 and below rejected
- [ ] **Access control:** employer JWT scoped to `org_id` — Postgres Row Level Security enforces employer sees only their cohort
- [ ] **Audit log table** created and populated on all PHI reads — includes timestamp, user, action, result
- [ ] **Cohort minimum** enforced in query layer: statistics suppressed for subgroups < 20 users
- [ ] **Employee ID pseudonymization** implemented: employer-provided IDs hashed with org-specific salt before storage
- [ ] **No individual records** accessible via employer API — endpoint returns 403 for individual-level queries from employer role
- [ ] **Data deletion** workflow: automated purge within 30 days of contract termination
- [ ] **Breach detection** baseline: alerting on anomalous data access patterns (volume, time, scope)
- [ ] **Encryption at rest:** AES-256 on all database tables containing PHI

---

## 8. Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| HIPAA applicability (BAA requirement) | HIGH | Settled law; HHS published guidance on wellness apps and BAAs |
| Safe Harbor 18-identifier list | HIGH | Statutory requirement (45 CFR §164.514(b)) — no interpretation needed |
| Differential privacy specification (ε = 1.0) | MEDIUM | Academic literature supports; optimal epsilon for ShiftWell requires empirical tuning |
| SOC 2 timeline and cost | MEDIUM | Based on 2025 startup survey data; actual costs vary significantly by auditor and scope |
| BAA provisions | HIGH | HHS sample provisions are well-documented; attorney review recommended before execution |
| Breach notification timeline (60 days) | HIGH | Statutory requirement (45 CFR §164.410) |

---

*Produced for ShiftWell Phase 26 Plan 01 — 2026-04-07*
*Feeds: Phase 27 ENT-01 (data pipeline architecture and employer API safeguards)*
