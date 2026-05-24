# ShiftWell Seed Source Ledger

Created: 2026-05-07
Status: Seed ledger for the research knowledgebase program

## Purpose

This is the first verified source ledger for the sleep science, AI app development, and Apple shipping research phase. It is not the final large literature dump. The next research pass should expand each topic into wiki pages and atomic KB records.

## Evidence Grade

- High: guideline, consensus statement, systematic review, official platform documentation.
- Moderate: randomized trial, controlled trial, strong cohort, focused expert review.
- Low: small study, older review, limited population, indirect evidence.
- Anecdotal: Reddit, YouTube, blog, GitHub issue, founder experience.

## Sleep Science Seed Sources

| Topic | Source | Evidence | ShiftWell use |
|---|---|---|---|
| Adult sleep duration | AASM/Sleep Research Society consensus statement: [Recommended Amount of Sleep for a Healthy Adult](https://academic.oup.com/sleep/article/38/6/843/2416939) | High | Anchor adult duration copy and avoid inventing exact personal prescriptions. |
| Circadian rhythm sleep disorders | AASM practice parameters: [Clinical Evaluation and Treatment of Circadian Rhythm Sleep Disorders](https://pmc.ncbi.nlm.nih.gov/articles/PMC2082098/) | High | Support cautious light, melatonin, nap, jet lag, and shift work framing. |
| Shift work and nurse long hours | NIOSH/CDC: [Training for Nurses on Shift Work and Long Work Hours](https://www.cdc.gov/niosh/work-hour-training-for-nurses/objectives.html) | High | Ground shift-worker risk language and pilot education. |
| Shift schedule design | NIOSH/CDC: [Work Organization Strategies](https://www.cdc.gov/niosh/work-hour-training-for-nurses/longhours/mod5/05.html) | High | Inform schedule-risk warnings, consecutive night logic, and recovery-day copy. |
| Night shift sleep behavior | NIOSH/CDC: [Coping with Night and Evening Shifts](https://espanol.foodsafety.gov/_www_cdc_gov/niosh/work-hour-training-for-nurses/longhours/mod9/05.html) | High | Support darkness, protected sleep, pre-shift nap, and family-interruption guidance. |
| Caffeine timing | Drake et al. 2013: [Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed](https://pubmed.ncbi.nlm.nih.gov/24235903/) | Moderate | Support caffeine cutoff suggestions before planned sleep, with individual tolerance caveat. |
| Jet lag and phase shifting | Eastman and Burgess 2009: [How To Travel the World Without Jet lag](https://pmc.ncbi.nlm.nih.gov/articles/PMC2829880/) | Moderate | Future travel/jet lag vertical; supports timed light, melatonin, and sleep schedule planning. |
| Light/dark adaptation to night work | Eastman and Martin 1999: [How to use light and dark to produce circadian adaptation to night shift work](https://pubmed.ncbi.nlm.nih.gov/10344580/) | Moderate | Support algorithm constraints around bright light and light avoidance timing. |
| Light/dark exposure for night shifts | Boivin and James 2002: [Circadian adaptation to night-shift work by judicious light and darkness exposure](https://pubmed.ncbi.nlm.nih.gov/12465889/) | Moderate | Support light/dark protocols; needs careful translation to consumer actions. |
| Meal timing in shift workers | Manoogian et al. 2022: [Healthy Heroes randomized clinical trial](https://pubmed.ncbi.nlm.nih.gov/36198291/) | Moderate | Support meal-timing research lane; do not overstate as universal sleep treatment. |
| Sleep timing and consistency | Chaput et al. 2020: [Sleep timing, sleep consistency, and health in adults](https://pubmed.ncbi.nlm.nih.gov/33054339/) | High | Support regularity and social jetlag language; evidence quality varies by outcome. |
| Sleep regularity | Kalkanis et al. 2025: [Sleep regularity as an important component of sleep hygiene](https://pubmed.ncbi.nlm.nih.gov/41259946/) | High, recent | Use as current review input; verify full text and recency before public claims. |
| Melatonin in shift workers | Carriedo-Diez et al. 2022: [Exogenous melatonin and shift work sleep disorder in health personnel](https://pmc.ncbi.nlm.nih.gov/articles/PMC9408537/) | High for review type, limited by included studies | Supplement lane only; require caution language and no dosing without clinical review. |
| Shiftwork systems | Driscoll et al. 2007: [Neurobehavioural and physiological effects of shiftwork systems](https://pubmed.ncbi.nlm.nih.gov/17418596/) | High for review type, older | Historical evidence for schedule design; update with newer sources before enterprise claims. |

## Product And Shipping Seed Sources

| Topic | Source | Evidence | ShiftWell use |
|---|---|---|---|
| TestFlight process | Apple: [TestFlight Overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/) | High | Required source for internal/external tester rules and beta review. |
| External testers | Apple: [Invite external testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers/) | High | Verify external pilot distribution and public link constraints. |
| App Review submission | Apple: [Submit an app](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app) | High | Source of truth for App Store review sequence. |
| EAS iOS production build | Expo: [Create a production build for iOS](https://docs.expo.dev/tutorial/eas/ios-production-build/) | High | Source of truth for EAS production build path. |
| EAS Submit | Expo: [EAS Submit](https://docs.expo.dev/submit/introduction/) | High | Source of truth for uploading iOS builds to App Store Connect/TestFlight. |
| Supabase React Native auth | Supabase: [Use Supabase Auth with React Native](https://supabase.com/docs/guides/auth/quickstarts/react-native) | High | Verify auth/session persistence, token refresh, and React Native setup. |
| Supabase Expo quickstart | Supabase: [Use Supabase with Expo React Native](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native) | High | Verify Expo-specific client setup and publishable key guidance. |
| PostHog React Native | PostHog: [React Native library](https://posthog.com/docs/libraries/react-native) | High | Source for event capture, feature flags, and mobile analytics setup. |
| Sentry Expo | Sentry: [Expo setup for React Native](https://docs.sentry.io/platforms/react-native/manual-setup/expo/) | High | Source for Expo crash monitoring setup and release health. |
| RevenueCat React Native | RevenueCat: [React Native SDK](https://www.revenuecat.com/docs/getting-started/installation/reactnative) | High | Source for subscription SDK setup and entitlement checks. |
| RevenueCat Expo | RevenueCat: [Expo setup](https://www.revenuecat.com/docs/getting-started/installation/expo) | High | Source for Expo development build and purchase-testing constraints. |

## Next Research Tasks

- Expand this seed ledger into `docs/research/sleep-science-wiki/`.
- Create atomic KB records for every accepted claim.
- Add PMID/DOI fields to every scientific source.
- Add contraindication/caution fields for supplements, illness, pregnancy, medications, and safety-sensitive work.
- Add official Apple/Expo/Supabase/PostHog/Sentry/RevenueCat verification screenshots or command outputs during M0/M1.
- Create NotebookLM notebook `ShiftWell AI App Dev + Sleep Science YouTube Findings` before importing YouTube sources.
- Tag GitHub/Reddit/YouTube findings as anecdotal unless independently verified by official docs or primary literature.

