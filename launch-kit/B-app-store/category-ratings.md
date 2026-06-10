# ShiftWell — Category & Age Rating Specifications

> Answers for App Store Connect category selection and age rating questionnaire.
> Copy these answers directly into App Store Connect.

---

## Category Selection

| Field | Value | Rationale |
|-------|-------|-----------|
| **Primary Category** | Health & Fitness | Highest browse traffic for sleep/wellness apps. All direct competitors (Timeshifter, Riseo, OffShift, RISE, AutoSleep, SleepWatch) are in this category. ShiftWell will appear in "Health & Fitness" browse, top charts, and category-specific search results. |
| **Secondary Category** | Medical | Reinforces clinical credibility. Captures healthcare professionals browsing for work tools. Fewer apps in Medical = less competition for "New Apps We Love" editorial consideration. Also signals to Apple reviewers that the app has a health/science basis. |

**Categories NOT chosen and why:**
- Lifestyle: Too broad, dilutes positioning. Sleep trackers get lost next to recipe apps and habit trackers.
- Productivity: Mismatches user intent. People searching Productivity want task managers, not sleep plans.
- Education: Would only apply if ShiftWell were primarily educational content.

---

## Age Rating Questionnaire

Answer each question exactly as shown when completing the App Store Connect age rating questionnaire:

| Question | Answer | Notes |
|----------|--------|-------|
| Cartoon or Fantasy Violence | None | No violence of any kind |
| Realistic Violence | None | No violence of any kind |
| Sexual Content or Nudity | None | No sexual content |
| Profanity or Crude Humor | None | No profanity |
| Alcohol, Tobacco, or Drug Use or References | None | Caffeine guidance is wellness, not drug reference |
| Simulated Gambling | None | No gambling |
| Horror/Fear Themes | None | No horror content |
| Mature/Suggestive Themes | None | No mature themes |
| Medical/Treatment Information | Infrequent/Mild | App provides sleep wellness guidance based on research. Does NOT diagnose, prescribe, or treat. Health disclaimer is displayed. |
| Unrestricted Web Access | No | App does not contain a web browser |
| Gambling with Real Currency | No | No gambling |

**Resulting age rating: 4+**

ShiftWell qualifies for 4+ because it contains no objectionable content. The "Medical/Treatment Information: Infrequent/Mild" selection covers the sleep science recommendations without triggering a higher age rating. Apple's threshold for "Frequent/Intense" medical information is apps that provide diagnostic tools or treatment protocols — ShiftWell provides wellness scheduling, not medical advice.

---

## Content Rights & Declarations

| Declaration | Answer | Details |
|-------------|--------|---------|
| Does your app contain third-party content? | No | All content is original |
| Does your app contain, show, or access third-party content? | No | No third-party content embedded |
| Does your app use encryption? | Yes — exempt | Uses HTTPS for optional network calls (calendar sync). Qualifies for exemption under ITAR EAR99. Set `ITSAppUsesNonExemptEncryption: false` in Info.plist (already configured in app.json) |
| Does your app use advertising? | No | No ads in v1 |
| Is your app designed for kids? | No | Not a Kids Category app |
| Does your app include in-app purchases? | Yes | ShiftWell Premium subscription: $29.99/year with 7-day free trial |

---

## Subscription Details (for App Store Connect)

| Field | Value |
|-------|-------|
| Subscription Group Name | ShiftWell Premium |
| Reference Name | shiftwell_premium_annual |
| Product ID | com.shiftwell.app.premium.annual |
| Duration | 1 Year (Auto-Renewable) |
| Price | $29.99 USD |
| Free Trial | 7 days |
| Subscription Description | Unlock advanced recovery analytics, unlimited plan history, priority algorithm updates, and exclusive features. Cancel anytime. |
| Introductory Offer | Free Trial (7 days) |

---

## App Review Notes (for the review team)

Paste this into the "Notes for Review" field in App Store Connect:

```
ShiftWell is a circadian sleep optimization app for shift workers. It imports work schedules (via ICS files or manual entry), generates personalized sleep plans based on peer-reviewed circadian science, and writes those plans to the user's calendar.

Key points for review:
- Health disclaimer is displayed on first launch and accessible from Settings
- The app does NOT diagnose, prescribe, or treat any medical condition
- All data is stored on-device using AsyncStorage and SecureStore
- HealthKit integration (optional) reads sleep data and HRV — does not write health data
- Calendar access is used to read shifts and write sleep plan events
- No user accounts required to use core features (Apple Sign-In is optional for premium)
- Subscription: $29.99/year with 7-day free trial, managed through StoreKit 2

Test account credentials: [provide before submission]
```

---

Created: 2026-04-18
Last Reviewed: 2026-04-18
Last Edited: 2026-04-18
Review Notes: New file. Covers primary/secondary category selection with competitive rationale, complete age rating questionnaire answers, content declarations, subscription configuration, and App Review notes.
