**DRAFT — ATTORNEY REVIEW REQUIRED**

---

# ShiftWell Privacy Policy

**Effective Date:** [INSERT_DATE]  
**Last Reviewed:** 2026-04-18  
**Last Edited:** 2026-04-18

---

## 1. Introduction

ShiftWell ("we," "us," "our," or "Company") is committed to protecting your privacy and ensuring you have a positive experience on our mobile application and related services (collectively, the "Service"). This Privacy Policy explains what information we collect, how we use it, with whom we share it, and the rights you have regarding your data.

This policy applies to all users of the ShiftWell mobile application (iOS and Android versions) and any affiliated web services. If you do not agree with our privacy practices, please do not use our Service.

---

## 2. Who We Are

**Company:** [COMPANY_NAME]  
**Founders/Controllers:** Dr. Gursimran Singh, DO  
**Location:** Florida, United States  
**Data Protection Officer / Privacy Contact:** [CONTACT_EMAIL]

ShiftWell is an independent health and wellness application for optimizing sleep and circadian rhythm management for shift workers. We are not affiliated with any hospital, healthcare system, or third-party employer. ShiftWell is operated by [COMPANY_NAME], a Florida-based entity.

---

## 3. Information We Collect

### 3.1 Information You Provide Directly

#### Schedule and Shift Data
- Work shift times, rotation patterns, and schedule changes
- Imported schedule data from QGenda or other scheduling systems
- Manually entered shift information
- Workplace type and job classification

#### Sleep and Health Metrics
- Sleep duration and quality scores (from manual entry or integrated health services)
- Nap timing and duration
- Sleep preferences and sleep history
- Health conditions or medications you report (to tailor recommendations)
- Chronotype quiz responses (e.g., morning vs. evening preference)
- Recovery and fatigue ratings

#### Calendar and Event Data
- Google Calendar event titles and times (when you authorize calendar sync)
- Personal event information that affects your sleep windows
- Time zone information

#### User Profile Information
- Full name and email address
- Age or date of birth
- Household composition (e.g., "live alone," "have children")
- Contact preferences
- Account password (hashed and encrypted)

#### Third-Party Account Credentials
- WHOOP account authentication (to fetch sleep/recovery metrics)
- Google Calendar credentials (to read/sync calendar events)
- Apple HealthKit permissions (to access health data on your device)

### 3.2 Information Collected Automatically

#### Device and App Usage Data
- Device type, model, and operating system version
- App version and build number
- Time zone and locale settings
- Crash reports and error logs (anonymized through Sentry)
- Feature usage patterns (which screens you view, which features you use)
- Session duration and frequency of app usage
- In-app event analytics (e.g., "user set a sleep goal," "user exported to calendar")

#### Circadian Algorithm Data
- Inputs: your shift schedule, sleep data, and user preferences
- Outputs: algorithmically generated sleep recommendations, nap windows, meal timing, and light exposure guidance
- Calculation metadata (algorithm version, confidence scores, derivation timestamps)

#### Device Identifiers
- Advertising ID (if you enable analytics)
- App installation ID (internally generated for tracking within ShiftWell only)
- IP address and device fingerprint (for authentication and fraud prevention)

#### Subscription and Purchase Data
- Subscription status (free, trial, premium)
- Subscription start and end dates
- Renewal history (managed by Apple App Store or Google Play; we do not process payment details directly)
- Promotional code redemptions

### 3.3 Information From Third Parties

#### WHOOP Integration
- Sleep duration, sleep stages, and recovery scores
- Strain data and heart rate variability
- When WHOOP provides this data via API

#### Apple HealthKit
- Sleep schedules and sleep samples added to HealthKit
- Sleep duration data read from HealthKit (if you grant permission)

#### Google Calendar
- Event titles, times, and durations
- Calendar metadata (event type, reminders, attendees — if visible to the app)

#### Supabase (Backend Database)
- User authentication logs and session records
- Encrypted backups of your profile and preferences

---

## 4. How We Use Your Information

### 4.1 Primary Uses

**Providing the Service:**
- Storing and syncing your shift schedule, sleep data, and calendar information
- Generating circadian rhythm optimization recommendations using our deterministic algorithm
- Generating exportable sleep plans, nap schedules, meal timing, and light exposure guidance
- Exporting recommendations to your calendar (Google Calendar or Apple Calendar)
- Enabling subscription management and access to premium features

**Algorithm Personalization:**
- Analyzing your shift patterns, sleep history, and preferences
- Applying the Two-Process Model and NIOSH protocols to calculate optimal sleep/nap windows
- Tailoring recommendations based on your chronotype, household situation, and personal constraints
- Storing calculation results and algorithm performance metrics

**Communication:**
- Sending transactional emails (account confirmation, password reset, subscription renewal)
- Sending in-app notifications related to sleep reminders, shift changes, or app updates
- Responding to your inquiries and support requests

### 4.2 Secondary Uses (Requires Consent)

**Analytics and Improvement:**
- Analyzing anonymized feature usage and user behavior trends
- Identifying which recommendations are most effective
- Improving the algorithm's accuracy and personalization
- Generating insights about shift worker sleep patterns (in aggregate, fully anonymized)

**Marketing and Product Development:**
- Sending educational content about sleep science and circadian rhythm optimization
- Informing you of new features or premium plan benefits
- Conducting surveys or requesting feedback about your experience

**Legal and Compliance:**
- Enforcing our Terms of Service
- Responding to legal requests from law enforcement or courts
- Detecting, preventing, and addressing fraud or abuse
- Protecting the security and integrity of the Service

### 4.3 Automated Decision-Making and Profiling

**IMPORTANT: Circadian Rhythm Algorithm Disclosure (GDPR Art. 22, 13(2)(f))**

ShiftWell uses a deterministic circadian rhythm optimization algorithm to automatically generate sleep recommendations based on your shift schedule, sleep metrics, and preferences. This automated decision-making process:

- **Does not involve profiling** in the sense of evaluating your personal aspects or behavior for marketing
- **Does create legal or similarly significant effects**: the generated sleep recommendations may affect your daily schedule
- **Is based on scientific algorithms**, not machine learning or arbitrary scoring
- **Is always explainable**: recommendations include reasoning (e.g., "delay sleep by 2 hours to align with light exposure shift")

**Your rights:**
- You may request a human review of any recommendation and provide feedback
- You may adjust or override any recommendation manually
- You may request explanation of how the algorithm generated a specific recommendation
- You may request the underlying data inputs used in a calculation

Contact [CONTACT_EMAIL] to exercise these rights.

---

## 5. Data Sharing and Disclosure

### 5.1 We Do NOT Sell Your Data

ShiftWell does not sell, rent, license, or otherwise monetize personal data to advertisers, data brokers, or third parties. This applies to all users, including California and EU residents.

### 5.2 Service Providers (Data Processors)

We share your information with the following third-party service providers, who process data on our behalf under strict data processing agreements:

| Service Provider | Purpose | Data Shared | Data Location |
|---|---|---|---|
| **Supabase** | Cloud database, user authentication, data sync | User account, profile, shift schedule, sleep metrics, algorithm results | US (AWS) |
| **WHOOP** | Sleep and recovery metrics | Your WHOOP ID, permission to fetch sleep/recovery data | US (WHOOP servers) |
| **Google** (Calendar API) | Calendar sync and event export | Event titles, times; calendar access token | US (Google servers) |
| **Apple HealthKit** | Sleep data storage and export | Sleep samples, sleep schedules | On-device (Apple servers for iCloud sync, if enabled) |
| **RevenueCat** | Subscription management | Subscription status, renewal dates, receipt validation | US (RevenueCat servers) |
| **Sentry** | Crash reporting and error logging | Anonymized crash logs, error messages, app version, OS version, device type | US (Sentry servers) |

**Data Processing Agreements:** All service providers have signed Data Processing Agreements (DPAs) that comply with GDPR Article 28 and CCPA Section 1798.140(ab). [REQUEST COPIES AT [CONTACT_EMAIL]]

### 5.3 Legal Obligations and Law Enforcement

We may disclose your information when required by law, court order, or government request, including:
- Subpoenas, search warrants, or similar legal processes
- Emergency situations involving risk of death or serious injury
- Protecting against fraud, abuse, or security threats

We will notify you of legal requests unless legally prohibited from doing so.

### 5.4 Business Transfers

If ShiftWell is involved in a merger, acquisition, bankruptcy, dissolution, or asset sale, your information may be transferred as part of that transaction. We will notify you of any such change and provide you with the right to opt-out if the successor company materially changes how your data is handled.

### 5.5 Publicly Available Information

You may choose to share information publicly within the ShiftWell app (e.g., if we add social or community features in the future). Any information you voluntarily make public is not subject to this Privacy Policy.

---

## 6. Your Privacy Rights

### 6.1 Residents of the European Union (GDPR)

Under the General Data Protection Regulation (GDPR), you have the following rights:

#### Right of Access (Art. 15)
- You may request a copy of all personal data we hold about you
- We will provide this in a structured, commonly used, portable format within 30 days

#### Right to Correction (Art. 16)
- You may request correction of inaccurate or incomplete data
- We will verify and update information within 30 days

#### Right to Erasure ("Right to Be Forgotten") (Art. 17)
- You may request deletion of your data in certain circumstances:
  - If data is no longer necessary for the purpose collected
  - If you withdraw consent and we have no other legal basis
  - If you object to processing
  - If data was processed unlawfully
- **Exceptions:** We may retain data if required by law, to defend legal claims, or to maintain service continuity (up to 90 days)

#### Right to Restrict Processing (Art. 18)
- You may request we limit our processing to storage only while you dispute accuracy or lawfulness
- We will resume processing upon your request or after resolving the dispute

#### Right to Data Portability (Art. 20)
- You may request your data in a machine-readable format (JSON or CSV)
- You may request we transmit your data directly to another service provider
- We will comply within 30 days

#### Right to Object (Art. 21)
- You may object to processing for marketing, analytics, or legitimate interests
- We will cease processing within 30 days unless we demonstrate compelling reasons to continue

#### Right to Not Be Subject to Automated Decision-Making (Art. 22)
- You may request human review of decisions made solely by our algorithm
- Contact [CONTACT_EMAIL] to request manual review

#### Right to Lodge a Complaint
- If you believe we have violated your rights, you may file a complaint with your local data protection authority (DPA)
- **EU Privacy Portal:** https://edpb.ec.europa.eu/edpb_en

### 6.2 California Residents (CCPA/CPRA)

Under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA), California residents have the following rights:

#### Right to Know (CCPA § 1798.100, CPRA § 1798.100)
- You may request what personal information we collect, use, share, and sell
- We will provide this information within 45 days
- We will provide details on:
  - Categories of personal information collected and shared
  - Sources of that information
  - Our purposes for collection
  - Categories of third parties with whom we share it

#### Right to Delete (CCPA § 1798.105, CPRA § 1798.105)
- You may request deletion of personal information we collected
- **Exceptions:** We may retain data if necessary to:
  - Complete your transaction
  - Detect or prevent fraud or security incidents
  - Comply with legal obligations
  - Enable internal uses reasonably aligned with your expectations
  - Improve product quality (with data aggregation/anonymization)
- We will complete deletions within 45 days

#### Right to Correct (CPRA § 1798.120)
- You may request correction of inaccurate personal information
- We will verify and update information within 45 days

#### Right to Opt-Out of Sale or Sharing of Personal Information (CCPA § 1798.120, CPRA § 1798.120)
- **ShiftWell's Practice:** We do NOT sell your personal information
- **Sharing:** We do not "share" personal information with third parties for cross-context behavioral advertising
- **Your Right:** You may submit an opt-out request. We will honor this even though we do not engage in these practices
- **Opt-Out Mechanism:** [INSERT_OPT_OUT_LINK or contact [CONTACT_EMAIL]]

#### Right to Limit Use and Disclosure (CPRA § 1798.121)
- You may limit our use of sensitive personal information (health data, biometric data, precise geolocation)
- We will honor this limitation within 15 days
- We will only use limited data for:
  - Providing the Service you requested
  - Complying with legal obligations
  - Other uses you have separately authorized

#### Right to Opt-Out of Automated Decision-Making (CPRA § 1798.121)
- You may opt-out of profiling or automated decision-making that produces legal or similarly significant effects
- Contact [CONTACT_EMAIL] to exercise this right
- **Exceptions:** We may continue processing if necessary to fulfill your request, detect fraud, or comply with law

#### Right to Non-Discrimination (CCPA § 1798.125, CPRA § 1798.125)
- We will not discriminate against you for exercising privacy rights
- We will not deny, charge different prices, or provide different quality of service
- **Exception:** We may offer financial incentives for data collection (e.g., premium features for sharing data) provided the incentive is transparent and you can opt-out

#### Right to Know About Automated Decision-Making and Profiling (CPRA § 1798.100(d))
- **Pre-Use Notice:** Before using our circadian rhythm algorithm, we provide this Privacy Policy explaining:
  - The algorithm creates automated decisions that significantly affect you
  - The algorithm is based on deterministic science (not machine learning)
  - You may request human review
- **Opt-Out:** You may choose not to use algorithm-generated recommendations and instead create manual sleep plans

#### Consumer Right to Correct (CPRA § 1798.120)
- You may correct inaccurate personal information
- We will update records within 45 days

#### How to Exercise California Rights
- **Right to Know / Delete / Correct:** Submit a request at [INSERT_CCPA_REQUEST_LINK] or email [CONTACT_EMAIL]
- **Verification:** We will verify your identity by requesting:
  - Email address associated with your account
  - Recent app usage or account activity
  - Other information sufficient to reasonably authenticate
- **Authorized Agent:** You may appoint an authorized agent to submit requests on your behalf. We will require proof of authorization.
- **Response Time:** We will respond to verified requests within 45 days

#### California-Specific Disclosures

**Personal Information Sold or Shared (Last 12 Months):** None

**Business Purpose Categories for Data Collection:**

| Data Category | Business Purposes | Third Parties Shared With |
|---|---|---|
| Shift schedule, sleep metrics | Service delivery, algorithm operation, analytics | Supabase |
| Calendar events | Calendar sync and export | Google, Apple |
| Health data (WHOOP, HealthKit) | Sleep recommendations, algorithm input | WHOOP, Apple |
| App usage, crash reports | Service improvement, bug fixing | Sentry, Supabase |
| Account and subscription data | Service management, fraud prevention | RevenueCat, Supabase |
| Device identifiers | Analytics, fraud prevention | Sentry (anonymized) |

**Retention Periods (See Section 8):** Data retained as long as necessary to provide Service, with longer retention for legal, security, or backup purposes.

### 6.3 Residents of Other US States (Virginia, Colorado, Connecticut, Utah)

Similar privacy laws are now in effect in multiple US states. If you are a resident of Virginia (VCDPA), Colorado (CPA), Connecticut (CTDPA), or Utah (UCPA), you have similar rights to California residents, including:
- Right to access, delete, correct, and port personal information
- Right to opt-out of targeted advertising, automated decision-making, and data sales
- Right to non-discrimination

**To exercise these rights, contact [CONTACT_EMAIL] with your state of residence.**

### 6.4 Children's Privacy (COPPA)

ShiftWell is not directed to, and we do not knowingly collect personal information from, children under 13. If we learn that we have collected personal information from a child under 13 without verifiable parental consent, we will delete that information promptly.

**If you believe we have collected data from a child under 13, contact [CONTACT_EMAIL] immediately.**

---

## 7. Data Security

### 7.1 Security Measures

ShiftWell implements industry-standard security measures to protect your information against unauthorized access, alteration, disclosure, or destruction:

#### Encryption
- **In Transit:** All data transmitted between your device and ShiftWell servers is encrypted using TLS 1.3 (or higher)
- **At Rest:** Sensitive data (passwords, health metrics) is encrypted at rest using AES-256 encryption in our Supabase database

#### Authentication
- Passwords are hashed using bcrypt with salting
- Multi-factor authentication (MFA) is available for account security
- API keys and third-party credentials are encrypted and never stored in plaintext

#### Access Controls
- Only authorized employees and service providers can access your data
- Access is logged and monitored
- Employees sign strict confidentiality agreements

#### Network Security
- Firewalls and intrusion detection systems protect our infrastructure
- Regular security audits and penetration testing
- Compliance with OWASP Top 10 security practices

#### Data Minimization
- We collect only the information necessary to provide the Service
- We do not retain data longer than necessary (see Section 8)

### 7.2 Limitations

No security measure is 100% foolproof. While we use industry-standard protections, we cannot guarantee absolute security. You use ShiftWell at your own risk.

### 7.3 Your Responsibility

You are responsible for:
- Keeping your password confidential
- Enabling device-level security (biometric lock, passcode)
- Reporting suspicious activity to [CONTACT_EMAIL]
- Reviewing your account settings for third-party integrations (WHOOP, Google, Apple)

---

## 8. Data Retention

### 8.1 Retention Schedule by Data Category

| Data Category | Retention Period | Reason for Retention |
|---|---|---|
| **User Account & Profile** | Until account deletion or 3 years of inactivity | Service continuity, user authentication |
| **Shift Schedule & Sleep Data** | Until account deletion or user export/delete | Core Service function |
| **Calendar Events (synced)** | Until user unsync or 6 months of inactivity | Calendar integration |
| **WHOOP/HealthKit Data** | Until integration disconnected or 12 months of sync failure | Health recommendation accuracy |
| **Algorithm Calculations** | 24 months | Improvement, audit trail, refund support |
| **Crash Reports (Sentry)** | 90 days (anonymized) | Bug fixing and service improvement |
| **Subscription/Payment Records** | 7 years | Tax compliance, fraud prevention, dispute resolution |
| **Server Backups** | 30 days (encrypted) | Disaster recovery |
| **Legal Holds** | Indefinitely while hold is active | Litigation support, compliance |
| **Account Deletion Logs** | 7 years (anonymized) | Regulatory compliance |

### 8.2 Deletion Process

When you delete your account:
1. Your profile and personally identifiable information are deleted within 30 days
2. Shift schedules, sleep data, and calendar integration are deleted within 30 days
3. Encrypted backups are deleted within 90 days
4. Anonymized usage analytics may be retained indefinitely
5. Subscription records are retained for 7 years (tax compliance)
6. Law enforcement requests may require retention beyond deletion

---

## 9. International Data Transfers

### 9.1 Data Storage Location

- **Primary Storage:** Supabase (hosted on AWS in the United States)
- **Backup Storage:** AWS US regions
- **Processing:** United States and EU (depending on service provider location)

### 9.2 GDPR Data Transfer Mechanisms

For users in the European Union, we rely on the following legal mechanisms for international data transfers:

**Standard Contractual Clauses (SCCs):**
- All US-based service providers (Supabase, RevenueCat, Sentry, WHOOP) have signed SCCs
- SCCs are compliant with GDPR Article 46 and EDPB guidance
- [REQUEST COPIES AT [CONTACT_EMAIL]]

**Adequacy Decisions:**
- Transfers to Standard Contractual Clause-bound entities are permitted under GDPR
- We conduct Transfer Impact Assessments (TIAs) to evaluate third-country laws

### 9.3 Your Rights Regarding Transfers

You may:
- Request a copy of SCCs: [CONTACT_EMAIL]
- Request our Transfer Impact Assessment
- Object to transfers (limited exceptions for Service delivery)

---

## 10. Third-Party Integrations

### 10.1 Third-Party Services (Not Processors)

When you authorize integrations with WHOOP, Google, or Apple HealthKit, you are sharing data directly with those services. ShiftWell acts as an intermediary, but those services are independent data controllers. Their privacy policies apply:

- **WHOOP:** https://www.whoop.com/legal/privacy/
- **Google:** https://policies.google.com/privacy
- **Apple:** https://www.apple.com/privacy/

### 10.2 Revoking Third-Party Access

You can disconnect third-party integrations at any time:
- In-app settings: Integrations > [Service Name] > Disconnect
- Third-party account settings: Revoke app access to ShiftWell
- **Note:** Revoking access does not delete previously synced data; contact [CONTACT_EMAIL] to request deletion

### 10.3 Third-Party Links

Our app may contain links to external websites, health resources, or social media. We are not responsible for the privacy practices of third-party sites. We encourage you to review their privacy policies before sharing information.

---

## 11. Cookies and Tracking Technologies

### 11.1 Mobile App (No Cookies)

The ShiftWell mobile app does not use HTTP cookies or similar persistent tracking technologies. However, we may use:
- **Local Storage:** On-device caching of your shift schedule and preferences
- **Device Identifiers:** Advertising ID (optional), app installation ID
- **Analytics SDKs:** Sentry for crash reporting (anonymized)

### 11.2 Web Platform (If Applicable)

If ShiftWell launches a web version, we may use:
- **Session Cookies:** To maintain your login and preferences
- **Analytics Cookies:** To track feature usage (Google Analytics or similar)
- **Advertising Cookies:** None — we do not engage in behavioral advertising

**Your Choice:** Most browsers allow you to:
- Disable cookies in settings
- Delete existing cookies
- Use "Do Not Track" (DNT) signals

**Note:** Disabling cookies may limit app functionality (e.g., login may require re-authentication).

---

## 12. Marketing and Communications

### 12.1 Types of Communications

You may receive:
- **Transactional Emails:** Account confirmations, password resets, subscription renewals (mandatory, cannot opt-out)
- **Promotional Emails:** Information about new features, premium benefits, health tips (opt-in/opt-out)
- **In-App Notifications:** Sleep reminders, shift change alerts (configurable in settings)
- **Surveys:** Feedback requests about your experience (optional)

### 12.2 Opt-Out Options

**Email Marketing:**
- Unsubscribe link in every marketing email
- Account settings > Notifications > Marketing Emails (Off)
- Contact [CONTACT_EMAIL]

**In-App Notifications:**
- Settings > Notifications > Toggle off by type
- iOS: Settings > ShiftWell > Notifications
- Android: Settings > Apps > ShiftWell > Notifications

**All Communications:**
- Contact [CONTACT_EMAIL] with "STOP" and we will suppress all non-transactional messages within 10 days

### 12.3 Marketing Basis

We send marketing communications based on:
- **Consent:** You may opt-in during signup or in settings
- **Legitimate Interest:** Following your signup, we may send one promotional email about premium features (you may opt-out immediately)

---

## 13. California Shine the Light Law (CA Civil Code § 1798.83)

California residents may request a list of third parties with whom we have shared personal information for direct marketing purposes. To make this request:
- Email [CONTACT_EMAIL] with "CA Privacy Request" in the subject line
- Include your name and address
- We will respond within 30 days with:
  - A list of third parties (if applicable)
  - The types of information shared
  - How to opt-out of future sharing

---

## 14. Do Not Track Signals

Some browsers include a "Do Not Track" (DNT) feature. Currently, there is no accepted industry standard for recognizing DNT signals. **ShiftWell does not respond to browser DNT signals**, though we provide granular privacy controls in our app settings.

---

## 15. Changes to This Privacy Policy

We may update this Privacy Policy to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of material changes by:
- Posting the updated policy on our website and in the app
- Sending an email to your registered address
- Requiring explicit consent (if required by law)

**Your continued use of ShiftWell after changes means you accept the updated policy.**

---

## 16. Contact Us

For questions, requests, or concerns about this Privacy Policy or our privacy practices:

**Data Protection Officer / Privacy Contact:**
- Email: [CONTACT_EMAIL]
- Mailing Address: [COMPANY_NAME], Florida, United States
- Response Time: 15 business days for routine inquiries, 30 days for formal requests

**Privacy Request Methods:**
1. **In-App:** Settings > Privacy > [Contact / Request Data]
2. **Email:** [CONTACT_EMAIL] with "Privacy Request" in subject line
3. **Online Form:** [INSERT_GDPR/CCPA_REQUEST_LINK]

**For EU Residents:** You may lodge a complaint with your local Data Protection Authority if you believe we have violated GDPR rights. Contact your national DPA: https://edpb.ec.europa.eu/edpb_en

**For California Residents:** You may file a complaint with the California Attorney General: https://oag.ca.gov/contact/consumer-complaint-about-company

---

## 17. Summary of Key Privacy Features

| Feature | Status |
|---|---|
| Do we sell your data? | **No** — never, explicitly prohibited |
| Do we share data with advertisers? | **No** — we have no advertising partnerships |
| Do we use tracking pixels or cookies? | **No** (mobile app); minimal tracking (web, if launched) |
| Can you export your data? | **Yes** — GDPR/CCPA right to portability |
| Can you delete your data? | **Yes** — with limited legal exceptions |
| Is data encrypted? | **Yes** — TLS in transit, AES-256 at rest |
| Who is your biggest processor? | **Supabase** (database) — signed DPA |
| Can you control third-party integrations? | **Yes** — connect/disconnect in settings |
| Does your algorithm require consent? | **Yes** — opt-out by choosing manual planning |
| How long do we keep data? | **Varies by type** — 30 days to 7 years (see Section 8) |

---

## 18. Effective Date and Review Schedule

- **Effective Date:** [INSERT_DATE]
- **Last Reviewed:** 2026-04-18
- **Review Schedule:** Annually or upon material legal/business changes
- **Next Review:** April 2027

---

## Appendix A: GDPR Legal Basis for Processing

ShiftWell processes personal data under the following legal bases (GDPR Article 6):

| Data Category | Legal Basis | Details |
|---|---|---|
| **Account creation, login, authentication** | Contract (Art. 6(1)(b)) | Necessary to provide Service |
| **Shift schedule, sleep data, algorithm input** | Contract (Art. 6(1)(b)) | Core Service function |
| **Circadian recommendations, exports** | Contract (Art. 6(1)(b)) | Core Service function |
| **Third-party integration (WHOOP, Google, Apple)** | Consent (Art. 6(1)(a)) | You explicitly authorize integration |
| **Analytics and usage tracking** | Consent (Art. 6(1)(a)) with option to withdraw | Improvement; you control in settings |
| **Email marketing and promotions** | Consent (Art. 6(1)(a)) with option to withdraw | You opt-in; unsubscribe links provided |
| **Fraud detection and security** | Legitimate Interest (Art. 6(1)(f)) | Protecting users and service integrity |
| **Compliance with legal obligations** | Legal Obligation (Art. 6(1)(c)) | Court orders, regulatory requirements |
| **Account support and customer service** | Contract (Art. 6(1)(b)) | Responding to your inquiries |

---

## Appendix B: Data Subject Rights Quickstart

**If you are an EU or California resident, here's how to exercise your rights:**

### 1. Right to Access / Know
- **What:** Get a copy of all data we hold about you
- **How:** Contact [CONTACT_EMAIL] with "Data Access Request"
- **Timeline:** 30 days (EU), 45 days (California)

### 2. Right to Deletion / Deletion
- **What:** Request we delete your data
- **How:** Settings > Account > Delete Account, or email [CONTACT_EMAIL]
- **Timeline:** 30 days (EU), 45 days (California)
- **Exceptions:** Legal hold, tax records, fraud investigation

### 3. Right to Correction / Correct
- **What:** Fix inaccurate information
- **How:** Update in app, or email [CONTACT_EMAIL] with corrections
- **Timeline:** 30 days (EU), 45 days (California)

### 4. Right to Portability
- **What:** Export your data in a portable format (JSON/CSV)
- **How:** Settings > Data > Export, or email [CONTACT_EMAIL]
- **Timeline:** 30 days (EU), 45 days (California)

### 5. Right to Object / Opt-Out
- **What:** Stop processing of marketing, analytics, or automated decisions
- **How:** Settings > Privacy > Opt-Out, or email [CONTACT_EMAIL]
- **Timeline:** 15 days (CPRA limit use), 30 days (GDPR object)

### 6. Right to Restrict / Limit Use
- **What:** Limit processing to storage only during dispute
- **How:** Email [CONTACT_EMAIL] with "Restrict Processing" request
- **Timeline:** 30 days (EU)

### 7. Right to Not Be Profiled / Automated Decision-Making
- **What:** Opt-out of algorithm-generated recommendations
- **How:** Uncheck "AI Recommendations" in settings, or use manual planning
- **Timeline:** Immediate

---

## Appendix C: Incident Response and Breach Notification

### Data Breach Definition
A breach of personal data is any unauthorized access, alteration, disclosure, or destruction of data.

### Our Breach Response Process
1. **Detection:** We monitor for unauthorized access and security incidents 24/7
2. **Investigation:** Upon discovery, we investigate scope, affected users, and root cause within 24 hours
3. **Notification (If Required):**
   - **EU (GDPR Art. 33):** We notify your Data Protection Authority without undue delay (≤72 hours)
   - **California (CCPA § 1798.150):** We notify affected residents without unreasonable delay (typically ≤30 days)
   - **Other US States:** We comply with state breach notification laws
4. **Your Notification:** We will email you at your registered address with:
   - Description of the breach
   - Data types affected
   - Steps we took to secure systems
   - Your rights and resources
   - Contact for questions

### Your Rights After a Breach
- **Credit Monitoring:** For breaches involving financial data, we will offer complimentary credit monitoring for ≥2 years
- **Fraud Protection:** You may request we place a security freeze on your credit
- **Legal Recourse (CCPA):** You may file a private right of action for statutory damages ($100–$750 per incident)

---

Created: 2026-04-18  
Last Reviewed: 2026-04-18  
Last Edited: 2026-04-18

**Review Notes:** Initial draft — comprehensive GDPR/CCPA-2026 compliant privacy policy for attorney review. Includes automated decision-making disclosures, CPRA Section 1798.121 limit-use rights, state consumer breach rights, explicit data-retention schedules, and third-party processor table. Requires:
1. Attorney legal review and customization
2. Completion of placeholder fields: [COMPANY_NAME], [CONTACT_EMAIL], dates
3. Link insertion for CCPA/GDPR request portal
4. CCPA Opt-Out mechanism implementation
5. Cross-reference to Terms of Service (health disclaimers, liability waivers)
6. Legal review of jurisdiction-specific language (Florida LLC vs. Delaware C-Corp)
7. Coordination with Data Processing Agreements (DPAs) with Supabase, RevenueCat, Sentry, WHOOP
