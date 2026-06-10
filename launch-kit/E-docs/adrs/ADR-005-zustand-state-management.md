# ADR-005: Zustand for State Management

**Status:** Accepted
**Date:** 2026-04-18

## Context

ShiftWell has 15+ application state stores managing:
- **Authentication:** User identity, session, Apple Sign In state (auth-store)
- **Subscriptions:** Premium status, trial state, feature flags (premium-store)
- **Health data:** HRV, recovery, strain scores, sleep history (hrv-store)
- **Shifts:** Schedule, patterns, recurrence (shifts-store)
- **Plans:** Generated sleep/nap/light/meal recommendations (plan-store)
- **Calendar sync:** Exported events, calendar integration state (not yet in list, but needed)
- **Predictions:** Circadian phase, fatigue risk, sleep debt (prediction-store)
- **Notifications:** Upcoming recommendations, alerts (notification-store)
- **User profile:** Settings, preferences, onboarding state (user-store)
- **Feedback:** User ratings of recommendations, energy/mood logs (feedback-store)
- **Scores:** Sleep quality, recovery, performance metrics (score-store)
- **Brief:** Onboarding state, initial survey (brief-store)
- **Patterns:** Detected shift patterns, sleep patterns (pattern-store)
- **Autopilot:** Feature flags, automation rules (autopilot-store)
- **AI:** Language/recommendations state (ai-store)
- **Index:** Store registry and initialization (index.ts)

Requirements:
- **Minimal boilerplate:** Founder is a beginner coder; Redux-style action/reducer/selector chains are friction
- **Persistence:** AsyncStorage integration for offline and cross-session data
- **Bundle size:** App must stay <50MB (health apps face stricter App Store limits); state library overhead matters
- **Testing:** Store mutations and selectors must be straightforward to unit test
- **Developer experience:** No Provider wrapping, optional middleware, TypeScript support

Alternatives considered:
- **Redux:** Industry standard, but 40+ lines of boilerplate per store (auth action types, reducers, selectors); overkill for MVP
- **MobX:** Observable-based, but less TypeScript-friendly and less common in React Native community
- **Context API:** Built-in, but re-render performance issues at scale (15+ stores); no persistence out-of-box
- **TanStack Query:** Great for server state, but ShiftWell uses mostly local state (caching shifts, plans, HRV data locally)

## Decision

Use **Zustand 5.0.11 with persist middleware** for all application state. Zustand is a lightweight (~1KB), Zod-compatible state library with first-class persistence.

## Consequences

### Positive
- **Minimal boilerplate:** Store definition is ~3 lines: `create((set) => ({ count: 0, inc: () => set((s) => ({ count: s.count + 1 })) }))`; no action types, no reducers
- **Small bundle footprint:** Zustand ~1KB minified; adds minimal overhead to app size (critical for 50MB limit)
- **Persist middleware:** AsyncStorage integration built-in; persists select state across app restarts with one line of config
- **No Provider hell:** Stores are global singletons; no Provider wrapping (optional, but default is clean)
- **TypeScript support:** Stores are fully typed; mutations and selectors are type-safe
- **Easy testing:** Stores are plain JavaScript; unit tests don't need complex mocking or act() wrappers
- **Middleware composable:** persist, immer (immutable mutations), devtools (time-travel debugging) can be stacked
- **Reactive updates:** Selectors only trigger re-renders if their output changes (performance optimization)

### Negative
- **Less opinionated:** Zustand doesn't enforce patterns; teams can diverge on store design (acceptable for solo founder or small team)
- **Smaller community than Redux:** Fewer tutorials, third-party integrations, but growing rapidly
- **No time-travel debugging by default:** Redux DevTools integration is available but requires explicit setup (low friction, acceptable)
- **AsyncStorage performance:** Heavy writes to AsyncStorage (e.g., logging HRV data 100x/day) can block main thread (mitigated by batching writes or using MMKV)

### Neutral
- **Concurrent features:** Zustand doesn't have built-in support for React 18 Suspense/startTransition (not needed for health app MVP)
- **Server state:** Zustand is local-state-only; API caching is managed separately (TanStack Query could supplement in phase 3)

---
**Store Inventory (src/stores/):**
| Store | Purpose | Persisted | Key Selectors |
|-------|---------|-----------|---|
| auth-store | User identity, Apple Sign In | yes | user(), isAuthenticated() |
| shifts-store | Shift schedule, recurrence | yes | shifts(), pattern() |
| plan-store | Generated recommendations | yes | plansForDate(), nextMeal() |
| hrv-store | HRV, sleep, recovery scores | yes | latestHRV(), weeklyAverage() |
| premium-store | Subscription, trial, feature flags | yes | isPremium(), trialDaysLeft() |
| prediction-store | Circadian phase, fatigue risk | yes | circadianPhase(), fatigueRisk() |
| feedback-store | User ratings, energy logs | yes | ratingsThisWeek(), energyTrend() |
| score-store | Sleep quality, recovery metrics | yes | sleepScore(), recoveryScore() |
| notification-store | Alerts, upcoming recommendations | no | nextNotification() |
| user-store | Settings, preferences, locale | yes | settings(), preferences() |
| brief-store | Onboarding state | yes | completedSteps() |
| pattern-store | Detected patterns | yes | pattern(), confidence() |
| autopilot-store | Automation flags | yes | isEnabled(), rules() |
| ai-store | LLM/recommendation state | no | isGenerating(), lastUpdate() |
| index.ts | Store registry & initialization | — | all stores initialized on app start |

**Created:** 2026-04-18
**Last Reviewed:** 2026-04-18
**Last Edited:** 2026-04-18
**Review Notes:** Initial creation — launch documentation package. Balances simplicity for beginner coder against long-term maintainability and performance.
