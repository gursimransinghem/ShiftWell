# ADR-004: WHOOP as Primary Wearable Integration

**Status:** Accepted
**Date:** 2026-04-18

## Context

ShiftWell's algorithm uses objective biometric data to tune personalized sleep/nap/light recommendations. Key metrics required:
- **Heart rate variability (HRV):** Proxy for circadian phase and autonomic nervous system state
- **Sleep stages:** Deep, REM, light sleep duration and timing
- **Recovery score:** Aggregate metric of rested state and readiness
- **Strain score:** Cumulative physiological stress

Wearable options evaluated:
- **WHOOP:** $30/month or part of Apple Fitness+, targets performance-focused professionals and athletes, provides detailed HRV/sleep/recovery data, strong REST API, premium positioning aligns with ShiftWell user demographic (healthcare workers, pilots, first responders)
- **Apple Watch + HealthKit:** Broader user base (~20M active users), included with purchase, but sleep/HRV data less granular than WHOOP; HealthKit API has privacy restrictions
- **Fitbit/Garmin:** Large installed base, but weaker HRV APIs and fragmented data access
- **Oura Ring:** Strong sleep data, but smaller user base and higher hardware cost ($300+)

Strategy: WHOOP as primary integration (target users), Apple HealthKit as secondary fallback (broader appeal).

## Decision

Use **WHOOP API (OAuth 2.0) as the primary wearable integration** for v1-v3. WHOOP is the highest-fidelity source for HRV, sleep staging, and recovery metrics. Fall back to **Apple HealthKit** for users without WHOOP or as optional secondary data source.

## Consequences

### Positive
- **High-fidelity data:** WHOOP provides detailed HRV (5-minute sampling), sleep stage breakdown (REM/deep/light), and recovery scores with clinical validation
- **User demographic alignment:** WHOOP users are performance-focused professionals (military, healthcare, athletes, executives) — overlaps perfectly with shift workers (high willingness to pay, health-conscious)
- **Established API:** WHOOP REST API is stable, well-documented, and supports OAuth 2.0 (secure, user-initiated data access)
- **Premium positioning:** WHOOP integration signals ShiftWell as a premium health app, supporting freemium pricing ($0–$29.99/yr upsell)
- **Data freshness:** WHOOP updates daily (some metrics 4x/day); timely for shift work planning
- **Privacy by design:** WHOOP data is accessed via OAuth; users control data sharing; no server-side credential storage

### Negative
- **Smaller user base:** WHOOP has ~500K active users vs. Apple Watch 20M+; limits initial user acquisition (mitigated by HealthKit fallback)
- **Subscription cost:** WHOOP subscription ($30/mo or $119/yr) adds friction; users may hesitate (mitigated by positioning as "optimization investment" for shift workers)
- **WHOOP dependency:** If WHOOP changes API, shuts down, or pivots, ShiftWell loses primary data source (mitigated by HealthKit fallback and planning for alternative integrations in phase 3)
- **Integration complexity:** OAuth flow, token refresh, and background sync require careful implementation (acceptable within current engineering capacity)

### Neutral
- **Apple HealthKit fallback:** HealthKit data is less rich than WHOOP (no 5-minute HRV sampling) but sufficient for basic recommendations; dual-integration is acceptable
- **Garmin/Fitbit later:** Phase 3 or 4 can add Garmin ConnectAPI or Fitbit API if user demand justifies (not blocking for v1 launch)
- **Wearable-agnostic mode:** Users without any wearable can use algorithm with manual sleep/energy logs (lower quality, acceptable for free tier)

---
**Integration Architecture:**
- WHOOP OAuth → ShiftWell backend edge function → sync to Supabase (user's HRV table)
- HealthKit → React Native Expo module → local caching → background sync
- Algorithm reads from unified HRV store (WHOOP preferred, HealthKit fallback)

**Created:** 2026-04-18
**Last Reviewed:** 2026-04-18
**Last Edited:** 2026-04-18
**Review Notes:** Initial creation — launch documentation package. Prioritizes data quality and user demographic fit over broad wearable coverage.
