# ShiftWell HIPAA Compliance Checklist

> **Status:** Pre-compliance — consumer wellness app evaluating HIPAA readiness for B2B hospital licensing.
> **Author:** Dr. Gursimran Singh, DO / Claude
> **Audience:** Founder, future legal counsel, potential hospital IT compliance teams

---

## 1. Does ShiftWell Need HIPAA Compliance?

### Short Answer

**Not yet — but it will the moment a hospital deploys it for employees.**

### Legal Analysis

HIPAA applies to two categories of entities:

**Covered Entities** — health plans, healthcare clearinghouses, and healthcare providers who transmit health information electronically. ShiftWell is none of these. A consumer downloading ShiftWell from the App Store and tracking their own sleep is not a HIPAA-regulated transaction.

**Business Associates** — any person or organization that creates, receives, maintains, or transmits Protected Health Information (PHI) on behalf of a covered entity. This is where ShiftWell's B2B angle creates exposure.

### When ShiftWell Becomes a Business Associate

ShiftWell triggers Business Associate status under any of these scenarios:

1. **Hospital-sponsored wellness program.** If HCA Florida Trinity (or any hospital system) licenses ShiftWell for its employees as part of an occupational health or wellness initiative, the hospital is a covered entity and ShiftWell is handling PHI on their behalf. A BAA is required.

2. **Integration with hospital systems.** If ShiftWell pulls schedule data from a hospital's scheduling system (e.g., QGenda via API) and that data is linked to identifiable employees, the data may constitute individually identifiable health information under 45 CFR § 160.103 — especially if combined with sleep/fatigue metrics.

3. **Employer health data reporting.** If ShiftWell's enterprise dashboard provides aggregated (or worse, individual) fatigue/sleep data to hospital administrators, and that data is tied to identifiable employees, ShiftWell is maintaining PHI for a covered entity.

4. **EHR integration.** Any future connection to Meditech, Epic, Cerner, or other EHR systems to push/pull patient or provider health data is an unambiguous HIPAA trigger.

### When ShiftWell Does NOT Need HIPAA

The consumer-direct model — an individual downloads the app, enters their own schedule, and gets sleep recommendations — does not trigger HIPAA. The user is managing their own health data, not receiving it from a covered entity. This falls under the HHS "consumer health app" guidance: apps that collect data directly from users (not from covered entities) are not Business Associates.

However, even in consumer mode, ShiftWell should comply with FTC Health Breach Notification Rule (16 CFR Part 318) which requires notification if there's a breach of individually identifiable health information, and state health data privacy laws (Washington My Health My Data Act, Connecticut SB-3, etc.) which are expanding rapidly.

### Bottom Line

For **Phase 1 (consumer launch):** HIPAA is not legally required but good security hygiene is. FTC breach notification rules apply.

For **Phase 2 (B2B hospital licensing):** HIPAA compliance is mandatory. No hospital compliance team will sign off without a BAA, documented security controls, and ideally a third-party audit.

**Recommendation:** Build HIPAA-ready from now. The delta between "good security" and "HIPAA-compliant" is mostly documentation, audit logging, and BAAs — not a ground-up rebuild.

### Key References

- [HHS: Resources for Mobile Health App Developers](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-apps/index.html)
- [FTC: Mobile Health Apps Interactive Tool](https://www.ftc.gov/business-guidance/resources/mobile-health-apps-interactive-tool)
- [HHS: The Access Right, Health Apps, & APIs](https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/access-right-health-apps-apis/index.html)

---

## 2. Current State Audit

Based on codebase review as of 2026-04-18.

### 2.1 Data Storage

| Component | Implementation | File |
|---|---|---|
| **Database** | Supabase PostgreSQL (AWS US region) | `src/lib/supabase/client.ts` |
| **Schema** | 6 tables with RLS enabled on all | `supabase/migrations/001_initial_schema.sql` |
| **Backups** | AWS US, encrypted, 30-day retention | Per privacy policy Section 7.1 |
| **Payments** | RevenueCat (Apple/Google handle payment processing) | `src/lib/api/types.ts` |

**Row-Level Security (RLS)** is properly configured on all 6 tables: `users`, `shifts`, `personal_events`, `sleep_plans`, `health_data`, `subscriptions`. Every policy enforces `auth.uid() = user_id` — this is PostgreSQL-level enforcement, not app-level. This is a strength.

### 2.2 Encryption

| Layer | Status | Details |
|---|---|---|
| **In transit** | ✅ Implemented | TLS 1.3 via Supabase HTTPS enforcement |
| **At rest (database-level)** | ✅ Implemented | Supabase encrypts all data at rest (AES-256, AWS default) |
| **At rest (field-level)** | ❌ Not implemented | PHI columns (HRV, sleep quality, heart rate) stored as plaintext in database |
| **Session tokens** | ✅ Secure | Stored in Expo SecureStore (iOS Keychain / Android Keystore) via `src/lib/supabase/storage-adapter.ts` |
| **Passwords** | ✅ Secure | Supabase Auth handles bcrypt hashing with salting |

**Gap:** Privacy policy claims "AES-256 encryption at rest" (Section 7.1) which is true at the infrastructure level via AWS. However, no field-level encryption exists for sensitive health columns. For HIPAA, database-level encryption satisfies the "encryption at rest" requirement per NIST guidelines, but field-level encryption adds defense-in-depth for PHI.

### 2.3 PII/PHI Collected

**Personally Identifiable Information (PII):**

- Email address and display name (via Supabase Auth)
- Household composition: `has_young_children`, `has_pets`, `household_size`
- Commute duration: `commute_minutes`
- Subscription status and renewal dates (via RevenueCat)

**Protected Health Information (PHI):**

- Sleep timing: `actual_sleep_start`, `actual_sleep_end`, `actual_sleep_minutes`
- Sleep quality: `sleep_quality_score` (1-10 scale)
- Heart rate: `heart_rate_avg_sleeping`
- In-bed times: `in_bed_start`, `in_bed_end`
- Chronotype classification
- Caffeine sensitivity and half-life preferences
- WHOOP integration data: HRV, recovery scores, strain data, sleep stages
- Apple HealthKit data: sleep samples, sleep schedules, heart rate variability
- Algorithmically generated sleep/nap/meal plans (JSONB in `sleep_plans`)

**Third-party health data integrations:**

| Source | Data | Auth Method |
|---|---|---|
| WHOOP API | HRV, recovery, strain, sleep stages | OAuth 2.0 |
| Apple HealthKit | Sleep samples, HRV | On-device (Apple terms) |
| Google Calendar | Event titles/times (may reveal health appointments) | OAuth 2.0 |

### 2.4 Authentication

| Feature | Status | Implementation |
|---|---|---|
| Apple Sign-In | ✅ Active | `expo-apple-authentication` |
| Email/Password | ✅ Active | Supabase Auth |
| Google Sign-In | ⚠️ Configured, not implemented | In `app.json` plugins, not in `auth.ts` |
| JWT management | ✅ Active | Auto-refresh enabled, Supabase-managed |
| MFA/2FA | ❌ Not implemented | Not available in current auth flow |

**Gap:** Multi-factor authentication is not implemented. HIPAA does not explicitly mandate MFA, but the Security Rule requires "a method to authenticate identity" (45 CFR § 164.312(d)), and MFA is considered a best practice. Hospital IT teams will expect it.

### 2.5 Data Retention Policies

Documented in Privacy Policy Section 8.1:

| Data Category | Retention Period |
|---|---|
| User account & profile | Until deletion or 3 years inactivity |
| Shift schedule & sleep data | Until deletion or user export/delete |
| Calendar events (synced) | Until unsync or 6 months inactivity |
| WHOOP/HealthKit data | Until disconnection or 12 months sync failure |
| Algorithm calculations | 24 months |
| Crash reports (Sentry) | 90 days (anonymized) |
| Subscription/payment records | 7 years (tax compliance) |
| Server backups | 30 days (encrypted) |
| Account deletion logs | 7 years (anonymized) |

**Gap:** Retention schedule is documented but no automated purge mechanism exists in the codebase. Retention policies are aspirational, not enforced.

### 2.6 Data Export/Deletion

**Account Deletion:**
- Implemented in `src/store/auth-store.ts` (lines 173-224)
- Calls `delete_user` RPC on Supabase
- Clears 14 local storage keys (shifts, plans, health data)
- Clears SecureStore session token
- **Critical bug:** RPC deletion falls back to sign-out if unavailable. Server-side data may not actually be purged. Comment in code: "requires auth.admin or RLS policy on server."

**Data Export:**
- Privacy policy promises JSON/CSV export (GDPR Art. 20, CCPA Right to Know)
- `src/lib/enterprise/export-formatter.ts` exists but handles anonymized enterprise/cohort data only
- **No user-facing individual data export feature exists.** This is a compliance gap for GDPR, CCPA, and HIPAA (right of access).

---

## 3. Gap Analysis

### 3.1 Business Associate Agreements

| Processor | BAA Status | Required For HIPAA? | Action |
|---|---|---|---|
| **Supabase** | ❌ Not signed | Yes — stores all PHI | Sign BAA via Supabase HIPAA form (requires Team plan + $350/mo add-on) |
| **RevenueCat** | ❌ Not signed | Likely no — handles subscription status, not PHI | Verify RevenueCat does not receive PHI; document determination |
| **Sentry** | ❌ Not signed | Possibly — crash reports may contain PHI fragments | Audit Sentry payload; strip PHI or sign BAA |
| **WHOOP** | ❌ Not signed | Yes — transmits health metrics | Contact WHOOP for BAA (they offer one for enterprise integrations) |
| **Google (Calendar)** | ❌ Not signed | Possibly — event data may reveal health info | Google offers BAA for Workspace; consumer API likely insufficient |
| **Apple (HealthKit)** | N/A | No — data stays on-device per Apple's architecture | On-device processing; Apple's developer agreement covers this |

**Privacy Policy Claim vs. Reality:** Section 5.2 states "All service providers have signed Data Processing Agreements (DPAs) that comply with GDPR Article 28." No DPAs are visible in the codebase. This claim needs to be either substantiated or corrected before launch.

### 3.2 Audit Logging

**Current state: No server-side audit logging exists.**

The codebase has two client-side logging mechanisms:
- `src/lib/adaptive/transparency-log.ts` — logs autopilot changes (90-entry cap, user-facing)
- `src/lib/adaptive/change-logger.ts` — computes plan diffs, stored in Zustand state

Neither satisfies HIPAA's audit logging requirements under 45 CFR § 164.312(b): "Implement hardware, software, and/or procedural mechanisms that record and examine activity in information systems that contain or use ePHI."

**Required:**
- Server-side audit table recording: who accessed what data, when, from where, and what action was taken (CRUD)
- Database triggers on all PHI-containing tables (`health_data`, `sleep_plans`, `users`)
- Minimum 6-year retention of audit logs (per HIPAA record retention)
- Tamper-proof storage (append-only, separate from application database)

### 3.3 Access Controls and Role-Based Permissions

**Current:** Single-role architecture. Every authenticated user has the same permissions (read/write their own data via RLS). No admin roles, no staff roles, no enterprise admin roles.

**Required for B2B:**
- Enterprise admin role (view aggregated team data, manage organization)
- Individual employee role (manage own data only)
- Supabase dashboard access controls (who can query production database directly?)
- Principle of minimum necessary access documented and enforced

### 3.4 Encryption Standards

| Requirement | HIPAA Spec | ShiftWell Status |
|---|---|---|
| Encryption in transit | TLS 1.2+ | ✅ TLS 1.3 via Supabase |
| Encryption at rest | AES-256 or equivalent | ✅ AWS default encryption (Supabase) |
| Key management | Documented key rotation | ⚠️ Managed by Supabase/AWS — no visibility into rotation schedule |
| End-to-end encryption | Addressable (not required) | ❌ Not implemented |

**Note:** HIPAA treats encryption as an "addressable" specification, not "required." This means you must implement it OR document why an equivalent alternative is reasonable. Given that ShiftWell already has encryption in transit and at rest, this is largely satisfied. Document the determination.

### 3.5 Breach Notification Procedures

**Current:** Privacy Policy Section 9 documents breach notification requirements (72-hour GDPR window, "without unreasonable delay" per HIPAA, 60-day max).

**Gap:** No technical implementation. No incident response runbook. No breach detection mechanism. No designated security officer. No notification templates. No HHS breach reporting workflow.

**Required:** HIPAA Breach Notification Rule (45 CFR §§ 164.400-414) requires notification to affected individuals within 60 days, to HHS (immediately if >500 individuals, annually if <500), and to media if >500 individuals in a single state/jurisdiction.

### 3.6 Employee Training

**Current state:** Solo developer — N/A for now.

**Required at scale:** All workforce members with access to PHI must receive HIPAA training within a reasonable period after joining, and refresher training annually. "Workforce" includes employees, volunteers, trainees, contractors — anyone under organizational control.

**Action:** Create a training plan template now. It costs nothing and demonstrates compliance intent.

---

## 4. Implementation Checklist

### Priority 1: Critical for B2B (Must Have Before Hospital Pilots)

- [ ] **Sign Supabase BAA** — Upgrade to Team plan, request HIPAA add-on, sign BAA. This is the single most important step. Without it, storing any PHI on Supabase violates HIPAA. Est: 1-2 weeks (plan upgrade + paperwork).

- [ ] **Implement server-side audit logging** — Create `audit_log` table in Supabase. Add database triggers on `health_data`, `sleep_plans`, `users`, `shifts` tables to log all INSERT/UPDATE/DELETE operations with timestamp, user_id, action, old_value, new_value. Use a Supabase Edge Function or database trigger. Ensure append-only (no DELETE permission on audit table). Est: 12-16 hours dev time.

- [ ] **Fix account deletion RPC** — The `delete_user` function must actually cascade-delete all user data from all tables, not fall back to sign-out. Implement via Supabase Edge Function with `service_role` key. Verify deletion is complete. Est: 4-6 hours.

- [ ] **Build user data export endpoint** — HIPAA right of access (45 CFR § 164.524) requires providing individuals with their PHI within 30 days. Build a Supabase Edge Function that exports all user data as JSON. Wire to Settings UI. Est: 8-10 hours.

- [ ] **Conduct HIPAA Risk Assessment** — Required by 45 CFR § 164.308(a)(1)(ii)(A). Document all threats/vulnerabilities, likelihood, impact, and current mitigations. Use the HHS Security Risk Assessment Tool (free). This is the foundational HIPAA document. Est: 8-12 hours.

- [ ] **Write HIPAA Security Policies** — Minimum required policies: Information Security Policy, Access Control Policy, Incident Response Plan, Data Backup and Recovery Plan, Workforce Training Plan, Sanction Policy. These can start as templates and be customized. Est: 12-16 hours.

### Priority 2: Important (Should Have Before Enterprise Sales)

- [ ] **Implement MFA** — Add TOTP-based MFA via Supabase Auth (they support it natively). Make it optional for consumer, required for enterprise users. Est: 6-8 hours.

- [ ] **Role-based access control for enterprise** — Add organization/team model to database schema. Enterprise admin sees aggregated data only. Individual employees see only their own data. Document minimum necessary access. Est: 16-24 hours.

- [ ] **Audit Sentry payloads for PHI** — Review what data Sentry crash reports capture. Strip any health data from error reports using Sentry's `beforeSend` hook. Document the determination (BAA needed or not). Est: 2-3 hours.

- [ ] **Obtain WHOOP BAA** — Contact WHOOP enterprise/developer relations to sign a BAA for the API integration. If unavailable, document the risk and consider making WHOOP integration opt-in only for enterprise deployments. Est: 2-4 weeks elapsed.

- [ ] **Implement automated data retention enforcement** — Build a scheduled Supabase Edge Function that purges data per the retention schedule in the privacy policy. Log all purges to the audit table. Est: 8-12 hours.

- [ ] **Resolve API key exposure** — The Claude API key exposed in the client bundle (flagged as P1 in State of ShiftWell) must be routed through a Supabase Edge Function before any deployment. This is a security issue independent of HIPAA. Est: 4-6 hours.

### Priority 3: Nice to Have (Strengthens Compliance Posture)

- [ ] **Field-level encryption for PHI columns** — Encrypt `heart_rate_avg_sleeping`, `sleep_quality_score`, HRV values at the column level using pgcrypto or application-level encryption. Adds defense-in-depth. Est: 16-20 hours.

- [ ] **Penetration test** — Hire a third-party firm to pen test the Supabase backend and app. Required for enterprise credibility, not strictly required by HIPAA (but expected). Est: $3,000-$8,000.

- [ ] **Formalize DPAs with all processors** — Substantiate the privacy policy's claim that DPAs exist. Execute DPAs with RevenueCat, Sentry, Google, WHOOP (separate from BAAs). Est: 4-8 weeks elapsed.

- [ ] **HIPAA training documentation** — Create a training plan, even if you're the only workforce member. Document that you completed training. Update annually. Est: 2-4 hours.

- [ ] **Breach notification templates and runbook** — Pre-draft notification letters (to individuals, HHS, media). Document the incident response workflow. Know who to call. Est: 4-6 hours.

---

## 5. SOC 2 vs HIPAA: Which Should ShiftWell Pursue?

### Comparison

| Dimension | HIPAA | SOC 2 Type II |
|---|---|---|
| **Legal status** | Federal law — mandatory if handling PHI for/from covered entities | Voluntary industry standard — no legal mandate |
| **Enforcement** | HHS Office for Civil Rights; fines $100-$50K per violation, up to $1.5M/year per category | No government enforcement; market-driven (customers require it) |
| **Scope** | PHI only — specific to healthcare data | Broad — covers security, availability, confidentiality, processing integrity, privacy |
| **Audience** | Hospital compliance teams, covered entities | Enterprise buyers across all industries, VCs, tech partners |
| **Timeline** | 3-6 months to implement | 6-12 months (Type II requires observation period) |
| **Cost for solo dev** | $5K-$15K (self-directed with templates + Supabase BAA) | $20K-$50K (requires third-party auditor) |
| **Renewal** | Ongoing — no "certification" to renew, but annual risk assessment required | Annual audit required |

### Recommendation

**Phase 1 (consumer launch): Neither is required.** Focus on good security fundamentals (encryption, RLS, secure auth) and FTC Health Breach Notification compliance.

**Phase 2 (B2B hospital licensing): HIPAA first.** This is non-negotiable. No hospital will deploy ShiftWell without a BAA and documented HIPAA compliance. SOC 2 is irrelevant if you can't demonstrate HIPAA adherence.

**Phase 3 (enterprise scale / fundraising): Add SOC 2 Type II.** Once ShiftWell is selling to multiple hospital systems or seeking VC funding, SOC 2 Type II becomes a market differentiator. It signals to non-healthcare enterprise buyers (corporate wellness programs, airlines, logistics companies) that your security practices have been independently verified.

**Overlap opportunity:** ~30-40% of controls overlap between HIPAA and SOC 2. If you build HIPAA compliance first, the incremental effort for SOC 2 drops significantly. Supabase already undergoes annual audits covering both SOC 2 and HIPAA controls simultaneously, which simplifies your vendor compliance story.

**Do not pursue SOC 2 instead of HIPAA.** SOC 2 does not satisfy HIPAA requirements. A SOC 2 report does not replace a BAA. Hospital compliance teams will reject SOC 2 as a substitute for HIPAA documentation.

### References

- [Secureframe: SOC 2 + HIPAA Compliance](https://secureframe.com/hub/hipaa/and-soc-2-compliance)
- [Censinet: SOC 2 and HIPAA Compliance Overlap Study](https://censinet.com/perspectives/soc-2-hipaa-compliance-overlap-study)
- [Total HIPAA: Can SOC 2 Replace a BAA?](https://www.totalhipaa.com/what-is-soc2-audit-and-can-it-replace-a-baa/)

---

## 6. Cost Estimate

### Realistic Budget for Solo Developer HIPAA Compliance

| Item | Cost | Frequency | Notes |
|---|---|---|---|
| **Supabase Team Plan** | $599/mo ($7,188/yr) | Monthly | Required minimum for HIPAA BAA. Currently on Pro at $25/mo. |
| **Supabase HIPAA Add-on** | $350/mo ($4,200/yr) | Monthly | Confirmed by Supabase staff. Includes BAA, HIPAA project config, Security Advisor. |
| **Supabase Compute Add-on** | ~$10-50/mo | Monthly | Point-in-Time Recovery (PITR) required for HIPAA; needs small compute minimum. |
| **HIPAA Risk Assessment** | $0-$2,000 | Annual | Free using HHS SRA Tool (self-directed). $1K-$2K if hiring a consultant for first pass. |
| **Policy Documentation** | $0-$3,000 | One-time | DIY with templates ($0) or hire a HIPAA consultant to draft ($2K-$3K). Services like Compliancy Group, AccountableHQ run ~$300/mo. |
| **Compliance Platform (optional)** | $200-$500/mo | Monthly | Tools like Vanta, Drata, Secureframe automate evidence collection. Overkill for solo dev now, valuable at scale. |
| **Penetration Test** | $3,000-$8,000 | Annual | Not required by HIPAA but expected by hospital IT. Can defer to Phase 3. |
| **Legal Review** | $1,500-$3,000 | One-time | Attorney review of BAA, privacy policy, and compliance documentation. |
| **SOC 2 Type II Audit** | $15,000-$30,000 | Annual | Only if pursuing SOC 2. Defer to Phase 3. |

### Phase-by-Phase Cost Summary

**Phase 1 — Consumer Launch (now):**

| Item | Cost |
|---|---|
| Current Supabase Pro plan | $25/mo |
| Security improvements (dev time only) | $0 |
| **Total incremental cost** | **$0/mo** |

Focus: Fix the API key exposure, implement proper account deletion, and launch.

**Phase 2 — HIPAA-Ready for Hospital Pilots:**

| Item | Monthly | Annual |
|---|---|---|
| Supabase Team plan | $599 | $7,188 |
| HIPAA add-on | $350 | $4,200 |
| Compute add-on (PITR) | ~$25 | ~$300 |
| Legal review (one-time) | — | $2,000 |
| Risk assessment (one-time, DIY) | — | $0 |
| **Total** | **~$974/mo** | **~$13,688/yr** |

Dev time: ~60-80 hours for audit logging, data export, MFA, RBAC, policy docs.

**Phase 3 — Enterprise Scale:**

Add to Phase 2 costs:

| Item | Annual |
|---|---|
| SOC 2 Type II audit | $20,000-$30,000 |
| Compliance platform (Vanta/Drata) | $6,000-$12,000 |
| Penetration test | $5,000-$8,000 |
| **Additional annual cost** | **$31,000-$50,000** |

### Key Supabase HIPAA References

- [Supabase HIPAA Compliance Docs](https://supabase.com/docs/guides/security/hipaa-compliance)
- [Supabase HIPAA Projects Setup](https://supabase.com/docs/guides/platform/hipaa-projects)
- [Supabase Shared Responsibility Model](https://supabase.com/docs/guides/deployment/shared-responsibility-model)
- [Supabase Security](https://supabase.com/security)
- [Supabase HIPAA Pricing Discussion (GitHub)](https://github.com/orgs/supabase/discussions/35594)
- [Supabase Pricing](https://supabase.com/pricing)

---

## Appendix A: HIPAA Safeguards Quick Reference

### Administrative Safeguards (45 CFR § 164.308)

- [ ] Security Management Process (risk analysis, risk management, sanction policy, review)
- [ ] Assigned Security Responsibility (designated security officer — you, for now)
- [ ] Workforce Security (authorization, clearance, termination procedures)
- [ ] Information Access Management (access authorization, establishment, modification)
- [ ] Security Awareness Training (security reminders, malware protection, login monitoring, password management)
- [ ] Security Incident Procedures (response and reporting)
- [ ] Contingency Plan (data backup, disaster recovery, emergency mode operation, testing)
- [ ] Evaluation (periodic assessment)
- [ ] BAAs with all business associates

### Physical Safeguards (45 CFR § 164.310)

- [ ] Facility Access Controls (contingency operations, facility security plan, access control, maintenance records)
- [ ] Workstation Use (policies for accessing ePHI)
- [ ] Workstation Security (physical safeguards)
- [ ] Device and Media Controls (disposal, media re-use, accountability, data backup and storage)

**Note:** For a cloud-hosted app, most physical safeguards are handled by Supabase/AWS. Document this in your risk assessment.

### Technical Safeguards (45 CFR § 164.312)

- [ ] Access Control (unique user ID, emergency access, automatic logoff, encryption/decryption)
- [ ] Audit Controls (record and examine system activity)
- [ ] Integrity (mechanism to authenticate ePHI, protect from improper alteration/destruction)
- [ ] Person or Entity Authentication (verify identity of users seeking access)
- [ ] Transmission Security (integrity controls, encryption)

---

## Appendix B: Files Reviewed in This Audit

**Core Infrastructure:**
- `supabase/migrations/001_initial_schema.sql` — 6 tables, RLS policies
- `src/lib/supabase/client.ts` — Supabase client configuration
- `src/lib/supabase/auth.ts` — Authentication implementation
- `src/lib/supabase/storage-adapter.ts` — SecureStore integration

**Data Handling:**
- `src/lib/adaptive/transparency-log.ts` — Client-side change logging
- `src/lib/adaptive/change-logger.ts` — Plan diff annotation
- `src/lib/enterprise/export-formatter.ts` — Anonymized data export

**Legal & Policy:**
- `launch-kit/C-legal/privacy-policy.md` — 721-line comprehensive privacy policy (DRAFT)
- `launch-kit/C-legal/data-processing-agreement.md` — Draft DPA
- `launch-kit/C-legal/medical-disclaimer.md` — Wellness product positioning
- `launch-kit/C-legal/data-disclosure.md` — Plain-English data summary

**Architecture Decisions:**
- `launch-kit/E-docs/adrs/ADR-002-supabase-backend.md` — Notes HIPAA self-hosting option
- `launch-kit/E-docs/adrs/ADR-004-whoop-integration.md` — OAuth-based data handling

**Configuration:**
- `app.json` — Permissions, privacy manifests
- `.env` / `.env.example` — Environment variables
- `package.json` — Dependencies

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial creation. Comprehensive HIPAA compliance audit based on codebase review and web research of current Supabase HIPAA capabilities, pricing, and requirements. All costs verified against Supabase official documentation and staff confirmations as of April 2026.
