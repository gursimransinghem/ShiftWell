**DRAFT — ATTORNEY REVIEW REQUIRED**

---

# Data Processing Agreement

**Between [COMPANY_NAME] and [CUSTOMER_NAME]**

**Effective Date: [EFFECTIVE_DATE]**

---

## 1. Definitions

**"Controller"** means [CUSTOMER_NAME], the legal entity that determines the purposes and means of processing Personal Data under this Agreement.

**"Processor"** means [COMPANY_NAME], the legal entity that processes Personal Data on behalf of the Controller according to instructions in this Agreement and the Master Service Agreement.

**"Personal Data"** means any information relating to an identified or identifiable natural person (a Data Subject) that is processed by Processor on behalf of Controller in the course of providing the ShiftWell service. Personal Data includes but is not limited to:
- Employee names and identification numbers
- Shift schedules and work patterns
- Sleep preferences and historical sleep data
- Circadian rhythm calculations
- App usage analytics and engagement metrics
- Login information and authentication data

**"Processing"** means any operation performed on Personal Data, including collection, recording, organization, structuring, storage, adaptation, retrieval, consultation, use, disclosure, transmission, or erasure.

**"Sub-processor"** means any legal entity that processes Personal Data on behalf of the Processor (e.g., cloud hosting providers, analytics services, third-party vendors).

**"Data Subject"** means an individual employee of the Controller whose Personal Data is processed by the Processor.

**"Data Breach"** means an unauthorized or accidental disclosure, loss, alteration, or destruction of Personal Data.

**"Service Agreement"** means the Master Service Agreement between Controller and Processor for the provision of the ShiftWell service.

---

## 2. Scope and Purpose

This Data Processing Agreement (DPA) governs the Processing of Personal Data by Processor on behalf of Controller. This DPA applies when:

- Controller (enterprise customer) deploys ShiftWell for its employees (Data Subjects)
- Processor accesses, stores, or processes employee schedule data, wellness preferences, or circadian calculations
- This DPA supplements and is incorporated into the Service Agreement

The purpose of Processing is to provide the ShiftWell sleep optimization service, which includes:
- Analyzing employee shift schedules
- Generating personalized sleep, nap, meal, and light recommendations
- Calculating circadian rhythm adjustments
- Tracking usage and engagement analytics
- Providing platform functionality and customer support

---

## 3. Roles and Responsibilities

**Controller Responsibilities:**
- Determines the purpose and scope of Processing
- Ensures lawful basis for collection and Processing of Personal Data
- Obtains Data Subject consent where required by law
- Complies with all applicable data protection laws
- Responds to Data Subject requests for access, correction, or deletion
- Notifies employees of the Processing through privacy notices

**Processor Responsibilities:**
- Processes Personal Data only as instructed by Controller through this Agreement and the Service Agreement
- Implements appropriate technical and organizational security measures
- Ensures Sub-processors are bound by equivalent data protection obligations
- Assists Controller in fulfilling Data Subject rights
- Notifies Controller of suspected Data Breaches
- Maintains records of Processing activities
- Provides audit rights to Controller as outlined in Section 14

---

## 4. Processing Instructions

Processor shall process Personal Data solely in accordance with:

1. Written instructions from Controller through this DPA and the Service Agreement
2. Lawful directions from Controller or applicable regulatory authorities
3. Technical specifications and security protocols defined by Processor and accepted by Controller

Processor shall not process Personal Data for purposes other than those specified in Section 2, except where:
- Legally required by a court order or regulatory authority
- Necessary to prevent imminent harm to Data Subjects or third parties
- Required for Processor's own legitimate business interests (e.g., fraud prevention)

In such cases, Processor shall notify Controller promptly unless legally prohibited from doing so.

---

## 5. Categories of Personal Data

Processor will process the following categories of Personal Data:

| Category | Description | Source |
|----------|-------------|--------|
| Identifiers | Employee name, user ID, email address | Controller's HRIS or manual entry |
| Schedule Data | Shift times, work patterns, rotation dates | Controller's scheduling system |
| Wellness Data | Sleep preferences, sleep duration history, nap logs | ShiftWell app, user input |
| Circadian Data | Circadian calculations, light exposure recommendations, sleep phase predictions | ShiftWell algorithm |
| Usage Analytics | Login frequency, feature usage, session duration, app engagement metrics | ShiftWell platform analytics |
| Device/Technical Data | IP address, device type, operating system version, app version, crash reports | Sentry (Section 8) |
| Billing Data | Billing contact, payment method (processed by RevenueCat, not stored by Processor) | RevenueCat (Section 8) |

---

## 6. Categories of Data Subjects

The Personal Data processed under this Agreement relates to the following categories of Data Subjects:

- Employees of Controller (mandatory or voluntary users of ShiftWell)
- Shift workers including healthcare workers, airline crews, manufacturing staff, emergency responders
- Any individual for whom Controller has authorized ShiftWell access

---

## 7. Duration

This DPA remains in effect for the duration of the Service Agreement. Upon termination or expiration of the Service Agreement:

- Processing of new Personal Data shall cease immediately
- Processor shall delete or return all Personal Data within 30 days per Section 15
- Data retention for legal compliance (e.g., audit logs) shall be minimal and encrypted
- Controller may request written certification that deletion is complete

---

## 8. Sub-processors

Processor uses the following Sub-processors to provide the ShiftWell service:

| Sub-processor | Purpose | Data Processed | Location |
|---------------|---------|-----------------|----------|
| Supabase (Supabase Inc.) | Database hosting, data storage, API backend | All Personal Data categories | US (us-east-1) |
| Sentry (Sentry Inc.) | Error tracking, crash reporting, performance monitoring | Device/technical data, anonymized usage patterns | US, EU |
| RevenueCat (RevenueCat Inc.) | Billing, subscription management, payment processing | Billing data only; no sensitive personal data | US, EU |

**Sub-processor Changes:**
- Processor may change or add Sub-processors upon 30 days' written notice to Controller
- Controller may object to the addition of a new Sub-processor within 30 days by notifying Processor in writing
- If Controller objects, Controller may terminate the Service Agreement without penalty
- By continuing use of ShiftWell after 30 days, Controller accepts the new Sub-processor

**Sub-processor Obligations:**
- All Sub-processors are bound by data protection obligations equivalent to this DPA
- Processor remains liable to Controller for Sub-processor performance
- Processor shall ensure Sub-processors are located in jurisdictions with adequate data protection

---

## 9. Security Measures

Processor implements the following technical and organizational security measures:

**Encryption:**
- All Personal Data encrypted in transit using TLS 1.2 or higher
- Database encryption at rest using AES-256
- Encryption keys managed securely and rotated annually

**Access Controls:**
- Role-based access control (RBAC) limiting employee access to minimum necessary data
- Multi-factor authentication (MFA) required for all system access
- Audit logging of all access to Personal Data
- Immediate access revocation upon employee termination

**Infrastructure Security:**
- Firewall and DDoS protection
- Regular security patching and updates
- Intrusion detection and prevention systems
- Secure backups with redundancy and tested recovery procedures

**Operational Security:**
- Data protection training for all employees handling Personal Data
- Background checks for administrative personnel
- Confidentiality agreements with all employees and contractors
- Incident response plan with regular testing

**Third-Party Security:**
- Annual security audits (SOC 2 Type II or equivalent)
- Vulnerability assessments and penetration testing
- Compliance with Sub-processor security requirements

**Data Minimization:**
- Collection limited to data necessary for service functionality
- Retention of Personal Data limited to service duration plus 30 days
- Regular deletion of obsolete or unnecessary data
- Anonymization of analytics data where possible

---

## 10. Data Subject Rights

Processor shall assist Controller in fulfilling the following rights of Data Subjects:

**Right of Access:** Processor shall provide Controller with tools or reports to enable Data Subjects to request and receive copies of their Personal Data processed by Processor.

**Right to Rectification:** Processor shall, upon instruction from Controller, correct or update inaccurate Personal Data.

**Right to Erasure ("Right to be Forgotten"):** Processor shall delete Personal Data when requested by Controller, except where retention is required by law or this Agreement.

**Right to Restrict Processing:** Processor shall, upon instruction from Controller, limit Processing of Personal Data to storage only.

**Right to Data Portability:** Processor shall, upon instruction from Controller, provide Personal Data in a structured, commonly used, machine-readable format (e.g., CSV, JSON) suitable for transmission to another service provider.

**Right to Object:** Processor shall respect objections to Processing and cease such Processing upon instruction from Controller.

**Mechanism for Fulfillment:**
- Data Subjects should direct requests to Controller (Data Subject's employer)
- Controller shall forward requests to Processor at [CONTACT_EMAIL]
- Processor shall respond to requests within 15 business days
- Processor shall not charge a fee unless requests are manifestly unfounded or excessive

---

## 11. Breach Notification

**Processor's Obligation:**
If Processor discovers or suspects a Data Breach, Processor shall:

1. **Notify Controller promptly** (no later than 48 hours after discovery) at [CONTACT_EMAIL]
2. **Provide the following information:**
   - Nature and scope of the breach
   - Categories and approximate number of Data Subjects affected
   - Categories and approximate number of Personal Data records involved
   - Likely consequences of the breach
   - Measures taken or proposed to mitigate harm
   - Contact point for further information

3. **Cooperate with Controller** in investigating the breach, preserving evidence, and responding to Data Subject inquiries
4. **Implement mitigation measures** including:
   - Securing systems against further unauthorized access
   - Resetting affected user credentials if appropriate
   - Enhancing monitoring and detection systems
   - Providing credit monitoring or identity protection services if Data Subjects face identity theft risk

**Controller's Obligations:**
Controller is responsible for:
- Determining whether notification to Data Subjects or regulators is required under applicable law
- Drafting and sending such notifications
- Complying with legal notification timelines (typically 72 hours to regulators)

**Processor's Cooperation:**
- Processor shall not publicly disclose the breach without Controller's prior written consent
- Processor shall provide Controller with all evidence and documentation needed for regulatory response
- Processor shall attend meetings with regulators if requested by Controller

---

## 12. International Data Transfers

**Data Location:**
All Personal Data processed by Processor is stored in the United States (Supabase us-east-1 region). Controller acknowledges that Personal Data may be transferred to and processed in the United States.

**Legal Basis for Transfers:**
- Where Controller and Data Subjects are located in the EU, EEA, or Switzerland, transfers are governed by Standard Contractual Clauses (Processor's Model SCCs are available upon request)
- Where applicable law requires adequacy determinations, Processor relies on:
  - EU-US Data Privacy Framework (DPF) where applicable
  - Standard Contractual Clauses as supplementary safeguard
  - Enhanced security measures outlined in Section 9

**Data Subject Rights in Transfer Context:**
- Data Subjects retain all rights under applicable data protection law, including GDPR
- Data Subjects may exercise rights through Controller or directly with Processor at [CONTACT_EMAIL]
- Processor acknowledges legal obligations to EU Data Subjects even if Processor is US-based

**Controller's Responsibility:**
Controller shall ensure that any international transfer of Personal Data from the EU, EEA, or Switzerland is lawful under GDPR Article 44 and complies with applicable adequacy mechanisms.

---

## 13. HIPAA Addendum (Optional for Healthcare Customers)

This Section applies only if Controller is a HIPAA-covered entity or business associate and requires a HIPAA Business Associate Agreement.

### 13.1 Scope of HIPAA Applicability

**Important Note:** ShiftWell does NOT automatically process Protected Health Information (PHI) as defined by HIPAA. ShiftWell processes shift schedules and wellness data to generate sleep optimization recommendations.

**However,** if Controller is a healthcare organization that:
- Integrates ShiftWell with Electronic Health Record (EHR) systems
- Includes employee health data from EHR systems in the input to ShiftWell
- Allows ShiftWell to access or display PHI

...then the HIPAA Addendum below applies.

### 13.2 Business Associate Status

**If this Addendum applies:**
- Processor agrees to function as a Business Associate under HIPAA
- Processor shall comply with the HIPAA Security Rule, Breach Notification Rule, and Privacy Rule as they apply to the services provided
- Processor acknowledges that PHI includes health plan information, medical treatment information, and payment-for-healthcare information

**If this Addendum does NOT apply:**
- ShiftWell is NOT a Business Associate
- HIPAA regulations do not apply to ShiftWell's Processing
- ShiftWell security measures are implemented as best practice but are not HIPAA-mandatory

### 13.3 HIPAA Compliance (If Applicable)

If Processor is acting as a Business Associate:

**Administrative Safeguards:**
- Designate a Privacy and Security officer responsible for policy compliance
- Implement employee training on HIPAA Privacy and Security Rules (annually, at minimum)
- Conduct a Security Risk Analysis annually and document findings
- Implement corrective action plans for identified vulnerabilities

**Physical Safeguards:**
- Restrict physical access to facilities containing PHI
- Implement surveillance systems and access controls
- Maintain facility audit logs

**Technical Safeguards:**
- Implement access controls limiting employee access to PHI (RBAC)
- Enforce unique user identification and emergency access procedures
- Implement encryption and decryption mechanisms
- Maintain audit logs and monitors of PHI access

**Organizational Safeguards:**
- Ensure Sub-processors are bound by equivalent HIPAA obligations
- Establish data use limitations (PHI used only for specified purposes)
- Implement breach notification procedures (72-hour notification requirement)

**Limitation of Use and Disclosure:**
- Processor shall use PHI only for purposes stated in the Service Agreement
- Processor shall not use PHI for marketing, fundraising, or other secondary purposes
- Processor shall not sell PHI

### 13.4 Data Breach Notification (HIPAA)

If PHI is breached, Processor shall:
- Notify Controller without unreasonable delay and in no case later than 60 days
- Provide notification at [CONTACT_EMAIL]
- Include all information required by HIPAA Breach Notification Rule (45 CFR §164.400 et seq.)
- Preserve evidence and support Controller's regulatory reporting

### 13.5 Audit Rights (HIPAA)

- Controller may audit Processor's HIPAA compliance upon reasonable notice
- Processor shall provide access to relevant systems, policies, and documentation
- Audits shall occur no more than annually unless Controller has reasonable cause

### 13.6 Term and Termination (HIPAA)

Upon termination:
- Processor shall return or securely destroy all PHI
- Processor shall provide written certification of destruction
- Copies retained for legal compliance purposes shall be encrypted and securely stored

---

## 14. Audit Rights

**Right to Audit:**
- Controller may audit Processor's compliance with this DPA upon reasonable written notice
- Audits may occur no more than once per calendar year, except where:
  - Controller has reasonable grounds to believe a compliance violation exists
  - Regulators have ordered an audit
  - A Data Breach has occurred

**Audit Procedures:**
- Controller shall provide Processor with 30 days' written notice
- Audits shall be conducted during business hours at Processor's facilities or via remote access
- Audits shall be limited in scope to this DPA's requirements and shall not disrupt service availability
- Controller may engage independent auditors (subject to confidentiality agreements)

**Audit Reports:**
- Processor shall provide reasonable cooperation and access to relevant documentation
- Controller shall provide Processor with a copy of any audit findings
- Processor shall respond to findings within 30 days with corrective actions or explanations

**Audit Costs:**
- Controller bears the cost of audits conducted beyond one per calendar year
- Processor bears the cost of the first audit per calendar year
- Processor shall not impose fees for audits ordered by regulators

**Limitations:**
- Audits shall not disclose confidential business information of Processor unrelated to this DPA
- Audits shall not disclose confidential information about other customers
- Processor may require audit reports to be redacted or subject to protective orders

---

## 15. Data Deletion and Return

**Upon Termination or Expiration:**

Within 30 days of Service Agreement termination or expiration, Processor shall:

1. **Delete or Return:** At Controller's election, either:
   - Securely delete all Personal Data from all systems (including backups)
   - Return all Personal Data to Controller in a structured, machine-readable format

2. **Certification:** Provide written certification signed by an authorized officer that:
   - All Personal Data has been deleted or returned
   - Deletion was secure and irreversible (e.g., cryptographic erasure)
   - No Personal Data remains in active systems, backups, or archives

3. **Exceptions:** Processor may retain Personal Data only where:
   - Legally required by applicable law or regulation
   - Required for Processor's legal defense in ongoing disputes
   - Anonymized and aggregated (not re-identifiable)
   - Encrypted and securely stored with access strictly limited

4. **Timeline:** Retention under exceptions shall be limited to the minimum time necessary and shall not exceed 90 days post-termination.

---

## 16. Liability

**Liability Limitations:**
Processor's liability for violations of this DPA is governed by the limitations in the Service Agreement. To the extent permitted by law:

- Processor's total liability for any Data Breach or violation of this DPA shall not exceed the fees paid by Controller in the 12 months preceding the claim
- Processor shall not be liable for Data Breaches caused by Controller's negligence, misuse, or failure to follow security recommendations
- Processor shall not be liable for third-party actions (e.g., criminal hacking) despite reasonable security measures

**Data Protection Authority Fines:**
- If a Data Protection Authority imposes fines on Controller due to Processor's violation of applicable data protection law, Processor shall reimburse Controller for such fines up to the liability cap
- Controller must provide notice of fines within 30 days and cooperate in any remedy efforts

---

## 17. Governing Law and Jurisdiction

**Governing Law:** This DPA shall be governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict of laws principles.

**Jurisdiction:** Both parties consent to the exclusive jurisdiction of the state and federal courts located in Florida for any legal action or proceeding related to this DPA or the Service Agreement.

**EU/EEA Data Protection:** Notwithstanding the above, if Controller is located in the EU, EEA, or Switzerland, and a Data Breach occurs that triggers GDPR investigation:
- Processor acknowledges that relevant Data Protection Authorities (e.g., EDPB, national DPAs) have jurisdiction over compliance matters
- Processor shall cooperate fully with any DPA investigation or enforcement action
- Disputes regarding adequacy of remedies may be brought before EU or national courts as permitted by GDPR Article 78

---

## 18. Entire Agreement and Amendment

**Incorporation into Service Agreement:**
This DPA is incorporated into and forms an integral part of the Service Agreement. In the event of conflict, this DPA shall take precedence regarding data protection matters.

**Amendment:**
- This DPA may be amended only by written agreement signed by authorized representatives of both parties
- Processor may amend this DPA to comply with changes in applicable law, with 30 days' notice to Controller
- Material amendments that materially reduce data protection shall require Controller's prior written consent

---

## 19. Contact Information

**For Data Protection, Security, or Breach Notifications:**

[COMPANY_NAME]  
Data Protection Officer / Legal  
Email: [CONTACT_EMAIL]  
Response Time: 48 hours for breach notifications, 15 business days for other inquiries  

**For Data Subject Requests:**

Data Subjects should direct requests to their employer (Controller). Controller shall forward requests to the above contact.

---

## 20. Effective Date and Execution

This DPA becomes effective on [EFFECTIVE_DATE] and shall remain in effect until terminated in accordance with the Service Agreement.

**By executing the Service Agreement, both parties agree to be bound by this DPA.**

---

## Appendix A: Standard Contractual Clauses (For International Transfers)

*[NOTE: This is a placeholder. Upon attorney review and finalization, include the complete Standard Contractual Clauses (Module One: Controller-to-Processor or Module Two: Processor-to-Sub-processor) as published by the European Commission. Link to current version at: https://ec.europa.eu/info/law/law-topic/data-protection/international-dimension-data-protection/standard-contractual-clauses_en]*

---

## Appendix B: Sub-processor Data Processing Addendum Template

*[Processor shall ensure all Sub-processors execute an equivalent DPA covering at minimum: (1) scope of Processing; (2) controller/processor roles; (3) data categories; (4) security measures; (5) breach notification; (6) audit rights; (7) liability limitations. Template available upon request.]*

---

## Appendix C: Data Processing Impact Assessment (DPIA) Template

*[For high-risk Processing (e.g., large-scale collection, automated decision-making, systematic monitoring), Controller may request Processor's participation in a Data Protection Impact Assessment. Processor shall cooperate with reasonable requests.]*

---

**DRAFT — ATTORNEY REVIEW REQUIRED**

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: Initial draft — enterprise DPA template for attorney review. Includes HIPAA Addendum (optional), SCCs placeholder, Sub-processor framework. Flagged for legal counsel review on Standard Contractual Clauses applicability, HIPAA Business Associate alignment, and state-specific compliance requirements (Florida, GDPR where applicable). Ready for customer-facing deployment after attorney sign-off.
