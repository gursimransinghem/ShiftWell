# ADR-002: Supabase for Authentication & Data Layer

**Status:** Accepted
**Date:** 2026-04-18

## Context

ShiftWell requires a backend for user authentication, sleep/shift data persistence, and real-time subscriptions. The app integrates with Apple Sign In, WHOOP API, and Apple HealthKit, and needs a relational database to store:
- User profiles and authentication state
- Shift schedules and patterns
- Generated sleep/meal/light plans (tied to calendar)
- HRV data, recovery scores, and feedback logs
- Subscription and premium feature state

Alternative backends considered:
- **Firebase:** Fully managed, real-time, but limited relational structure and higher lock-in risk for health data
- **Custom Node.js/Express backend:** Maximum flexibility but requires infrastructure management, DevOps overhead, and security hardening for health data (HIPAA considerations)
- **AWS Amplify:** Good RDS support, but higher complexity and cost for MVP stage

Requirements:
- PostgreSQL relational database (shift schedules, plans, HRV patterns are relational)
- Row-Level Security (RLS) for privacy (users see only their own data)
- Built-in Apple Sign In and email authentication
- Real-time subscriptions for multi-device sync
- Edge functions for custom business logic (e.g., plan generation triggers)
- Generous free tier for MVP (testing and early growth)

## Decision

Use **Supabase (hosted PostgreSQL + Auth + Edge Functions + Realtime)** as the backend for ShiftWell v1-v3. Supabase is an open-source alternative to Firebase, built on PostgreSQL and PostgREST.

## Consequences

### Positive
- **Open-source:** Full source code available; can self-host on custom infrastructure later if needed
- **PostgreSQL:** Relational data model supports complex queries (shift patterns, plan history, HRV correlations)
- **Row-Level Security:** RLS policies enforce data isolation without app-level complexity
- **Apple Sign In:** Native support in Supabase Auth with email/password fallback
- **Real-time subscriptions:** WebSocket-based sync for multi-device and calendar exports
- **Edge Functions:** Deno-based serverless (alternative to custom backend) for plan generation and API integrations
- **Generous free tier:** Suitable for MVP testing and early production (~250,000 API requests/month free, auto-scales)
- **No vendor lock-in:** Can migrate to self-hosted PostgreSQL or standard managed databases (AWS RDS, DigitalOcean, etc.)

### Negative
- **Push notifications:** Supabase does not include push notification service; supplement with Expo Notifications or Firebase Cloud Messaging
- **Less mature than Firebase:** Smaller community, fewer third-party integrations, less documentation for niche use cases
- **RLS complexity:** Row-Level Security policies require careful design; misconfiguration can expose user data (mitigated by security review)
- **Scaling costs:** Beyond free tier, database overages and edge function invocations accumulate (acceptable post-launch if user base grows)
- **HIPAA considerations:** Default Supabase hosting not HIPAA-compliant (mitigation: self-host on HIPAA-eligible infrastructure if required by regulation)

### Neutral
- **API versioning:** PostgREST auto-generates REST API from schema; versioning requires discipline (acceptable for MVP)
- **Database backups:** Supabase handles automated backups, but recovery is manual; suitable for development/beta (production should use custom snapshots)

---
**Created:** 2026-04-18
**Last Reviewed:** 2026-04-18
**Last Edited:** 2026-04-18
**Review Notes:** Initial creation — launch documentation package. Balances managed infrastructure simplicity with open-source flexibility for health data.
