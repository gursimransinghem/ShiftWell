# ShiftWell

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/shiftwell/shiftwell)
[![License](https://img.shields.io/badge/license-proprietary-blue)](./LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blueviolet)](https://github.com/shiftwell/shiftwell/releases/tag/v1.0.0)

## The Problem

700 million shift workers globally face a critical challenge: broken sleep. 32% of US healthcare workers report chronic short sleep. Shift Work Sleep Disorder affects 10-38% of night shift workers, yet **no existing app combines calendar-aware scheduling with science-backed circadian optimization**.

## The Solution

**ShiftWell** is an AI-powered circadian rhythm optimization app for shift workers. Import your shift schedule, let our deterministic algorithm analyze your calendar and personal factors, and get science-backed sleep, nap, meal, and light exposure plans—delivered automatically to your calendar.

**Why deterministic?** Our algorithm traces to published sleep science (Borbely's Two-Process Model, AASM guidelines, NIOSH protocols), not LLM guesswork. Every recommendation is reproducible, auditable, and grounded in peer-reviewed research.

---

## Quick Start

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **Expo CLI** globally installed: `npm install -g expo-cli`
- **iOS Simulator** (macOS) or **physical device** with Expo Go app ([iOS](https://apps.apple.com/us/app/expo-go/id982107779), [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shiftwell/shiftwell.git
   cd shiftwell
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Verify all tests pass** (1,059 tests across 71 suites):
   ```bash
   npm test
   ```

### Running Locally

- **Expo dev server** (live reload on device/simulator):
  ```bash
  npx expo start
  ```
  Then press `i` for iOS Simulator or scan the QR code with Expo Go on your device.

- **Run tests continuously** during development:
  ```bash
  npm test -- --watch
  ```

### Building for TestFlight

- **Managed build via EAS**:
  ```bash
  eas build --platform ios
  ```

---

## Key Features

- **Calendar-Aware Scheduling** — Import your shift calendar, weekday patterns, or one-off blackout dates. ShiftWell builds recovery plans around *your* real life.

- **Circadian Rhythm Optimization** — Personalized sleep windows, strategic napping, caffeine timing, light exposure protocols, and meal scheduling based on your chronotype and shift pattern.

- **AI Weekly Briefs** — Automated summaries of sleep quality, fatigue trends, and actionable recommendations delivered every week.

- **WHOOP Integration** — Sync HRV, resting HR, sleep, and recovery metrics directly into your plan.

- **Google Calendar Sync** — Export sleep plans, nap windows, and light protocols directly to your calendar.

- **Autopilot Mode** — Set it and forget it. ShiftWell generates your weekly plan automatically; adjust or override as needed.

- **Recovery Scoring** — Real-time fatigue and energy modeling so you know your peak performance windows.

- **Adaptive Plans** — Algorithm learns from your sleep logs and adjusts future recommendations week by week.

- **Premium Features** — Advanced recovery analytics, priority support, and ad-free experience ($29.99/yr annual subscription with 7-day free trial).

- **Night Sky Mode** — Dark-mode-first UI designed for night shift workers and low-light environments.

- **Multilingual Support** — Available in English and Spanish.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ ShiftWell Mobile App (Expo / React Native)                  │
│ • iOS (primary), Android (future)                           │
│ • State: Zustand (15 stores)                                │
│ • Dark-mode-first UI (#0A0E1A baseline)                     │
│ • Apple Sign In + Supabase Auth                             │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    ┌───────┐  ┌─────────┐  ┌──────────┐
    │Google │  │ WHOOP   │  │Supabase  │
    │Cal    │  │Integration   │Auth/DB │
    │Sync   │  │         │  │         │
    └───────┘  └─────────┘  └──────────┘
        │            │            │
        └────────────┼────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ Express 4.x API Layer  │
        │ • REST endpoints       │
        │ • Circadian engine     │
        │ • Data processing      │
        └────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Supabase PostgreSQL DB     │
        │ • User profiles            │
        │ • Sleep logs               │
        │ • Shift calendars          │
        │ • Generated plans          │
        └────────────────────────────┘
```

### Core Circadian Engine (`src/lib/circadian/`)

The deterministic algorithm powering ShiftWell:

- **Sleep Windows** (`sleep-windows.ts`) — Computes anchor sleep periods based on shift type and chronotype.
- **Nap Engine** (`nap-engine.ts`) — Strategic napping recommendations (duration, timing, frequency).
- **Caffeine Timing** (`caffeine.ts`) — Optimal caffeine intake windows and cutoff times.
- **Light Protocol** (`light-protocol.ts`) — Bright light exposure and avoidance schedules.
- **Meal Timing** (`meals.ts`) — Time-restricted eating windows aligned with circadian phase.
- **Fatigue Model** (`fatigue-model.ts`) — Tracks accumulated sleep debt and fatigue risk.
- **Energy Model** (`energy-model.ts`) — Predicts energy levels across the week.
- **Prediction Engine** (`prediction-engine.ts`) — Forecasts future sleep quality and recovery.
- **Timezone Handler** (`timezone-handler.ts`) — Adapts plans across timezones.

All algorithms are **deterministic and auditable** — no randomness, no LLM-generated recommendations.

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Mobile Framework** | Expo | 55.0.6 | Cross-platform React Native runtime |
| **Runtime** | React Native | 0.83.2 | iOS native performance |
| **State Management** | Zustand | 5.0.11 | 15 lightweight stores (auth, shifts, plans, etc.) |
| **Authentication** | Supabase Auth | 2.99.1 | Apple Sign In, email, magic links |
| **Database** | Supabase PostgreSQL | 15+ | User data, sleep logs, generated plans |
| **Backend API** | Express.js | 4.x | REST endpoints, circadian engine runner |
| **Calendar Sync** | Google Calendar API | v3 | Export plans to user calendars |
| **Wearable Integration** | WHOOP API | REST | HRV, resting HR, recovery data |
| **Internationalization** | i18next | 23.x | English, Spanish translations |
| **Testing** | Jest + React Native Testing Library | Latest | 1,059 tests across 71 suites |
| **Build & Deployment** | EAS (Expo) | Latest | Managed iOS builds for TestFlight |
| **Dark Mode** | React Native StyleSheet | Native | Dark-mode-first theme (#0A0E1A) |

---

## Project Structure

```
ShiftWell/
├── app/                              # Expo Router / app directory
│   ├── index.tsx                     # Today tab (home screen)
│   ├── schedule.tsx                  # Shift schedule editor
│   ├── circadian.tsx                 # Circadian recommendations
│   ├── brief.tsx                     # AI weekly brief
│   ├── outcomes.tsx                  # Sleep metrics & trends
│   ├── profile.tsx                   # User profile & settings
│   └── settings.tsx                  # App settings & preferences
├── src/
│   ├── components/                   # Reusable UI components
│   ├── lib/
│   │   ├── circadian/                # Core circadian algorithm
│   │   │   ├── sleep-windows.ts
│   │   │   ├── nap-engine.ts
│   │   │   ├── caffeine.ts
│   │   │   ├── light-protocol.ts
│   │   │   ├── meals.ts
│   │   │   ├── fatigue-model.ts
│   │   │   ├── energy-model.ts
│   │   │   ├── prediction-engine.ts
│   │   │   └── timezone-handler.ts
│   │   ├── api.ts                    # API client (Supabase, WHOOP)
│   │   └── utils.ts                  # Shared utilities
│   ├── store/                        # Zustand state stores (15 stores)
│   │   ├── authStore.ts
│   │   ├── shiftsStore.ts
│   │   ├── plansStore.ts
│   │   ├── metricsStore.ts
│   │   └── ... (11 more)
│   ├── types/                        # TypeScript interfaces
│   └── styles/                       # Dark-mode theme
├── api/                              # Express backend
│   ├── index.ts                      # Server entry
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── plans.ts
│   │   ├── shifts.ts
│   │   └── integrations.ts
│   ├── middleware/
│   └── controllers/
├── __tests__/                        # Test suites (1,059 tests, 71 suites)
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                             # Documentation (dev, business, launch, legal)
│   ├── dev/
│   ├── business/
│   ├── launch/
│   ├── research/
│   └── vision/
├── package.json
├── app.json                          # Expo config (bundle ID: com.shiftwell.app)
├── eas.json                          # EAS build config
└── jest.config.js                    # Test configuration
```

---

## Scientific Foundation

ShiftWell's algorithm is grounded in peer-reviewed sleep science:

- **Two-Process Model** (Borbely, 1982) — Sleep homeostasis & circadian rhythm dynamics
- **AASM Clinical Practice Guidelines** (2015, 2023) — Sleep medicine standards
- **Circadian Phase Shifting** (Eastman & Burgess, 2009) — Light timing optimization
- **Bright Light Effects** (Czeisler et al., 1990) — Intensity, duration, and timing
- **Shift Work Sleep Disorder** (Drake et al., 2004) — Epidemiology and prevalence
- **NIOSH Sleep & Fatigue** — Anchor sleep protocols for shift workers
- **Napping Science** (Milner & Cote, 2009; Ruggiero & Redeker, 2014) — Duration & timing
- **Caffeine Metabolism** (Drake et al., 2013) — Half-life and chronotype interactions
- **Time-Restricted Eating** (Manoogian et al., 2022; Chellappa et al., 2021) — Circadian meal timing

Every algorithm module references published literature. See `docs/research/` for full citations.

---

## Features & App Tabs

### Today Tab (`app/index.tsx`)
At-a-glance overview: today's sleep window, upcoming nap opportunity, next meal window, light exposure status.

### Schedule Tab (`app/schedule.tsx`)
Import shift patterns, set recurring schedules, view calendar-based shift plans, sync to Google Calendar.

### Circadian Tab (`app/circadian.tsx`)
Weekly optimization plan: sleep windows, naps, caffeine cutoff, light protocol, meal times. Tap to see the science behind each recommendation.

### Brief Tab (`app/brief.tsx`)
AI-generated weekly summary (premium): sleep trends, fatigue risk, energy forecast, personalized adjustments.

### Outcomes Tab (`app/outcomes.tsx`)
Sleep metrics dashboard: total sleep, sleep efficiency, nap effectiveness, HRV trends (if WHOOP connected), fatigue model score.

### Profile Tab (`app/profile.tsx`)
User data: age, chronotype, shift role (nurse, pilot, surgeon, etc.), work pattern, health conditions.

### Settings Tab (`app/settings.tsx`)
App settings: notifications, dark mode (default), language (English/Spanish), Apple Sign In, integrations (WHOOP, Google Calendar), subscription status.

---

## Monetization

- **Freemium Tier**: Core circadian recommendations, basic sleep tracking, Google Calendar sync.
- **Premium Tier**: $29.99/year annual subscription (or $4.99/month)
  - AI weekly briefs
  - Advanced recovery scoring
  - WHOOP integration
  - Priority support
  - Ad-free experience
  - **7-day free trial** (no payment required)

---

## Contributing

### Code Style & Testing
1. All code must pass TypeScript strict mode.
2. **Every PR must have 100% test coverage** for new logic.
3. Run `npm test` before committing — all 1,059 tests must pass.
4. Use Expo's dev server (`npx expo start`) for live testing.

### Branch Naming
- Feature: `feat/short-description`
- Bug fix: `fix/issue-number-short-description`
- Refactor: `refactor/module-name`

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

Example:
```
feat(circadian): implement dynamic chronotype adjustment

- Added chronotype.ts module to circadian engine
- Adjusts sleep window timing based on weekend sleep patterns
- Includes tests for all edge cases

Closes #42
```

### Testing Guidelines
- Unit tests for all algorithm modules in `src/lib/circadian/`.
- Integration tests for API endpoints.
- E2E tests for critical user workflows.
- Run `npm test -- --coverage` to verify coverage.

### Pull Request Process
1. Create a feature branch from `main`.
2. Commit with clear, descriptive messages.
3. Open a PR with a detailed description of changes.
4. Ensure CI passes (all tests green, no lint errors).
5. Request review from a core maintainer.
6. Merge only after approval.

---

## Roadmap

- **Phase 1–3 (Complete)** — Core app, circadian engine, integrations, 1,059 passing tests.
- **Phase 4 (Q3 2026)** — TestFlight launch, user feedback loop, LLC filing.
- **Phase 5 (Q4 2026)** — App Store submission, Apple Developer enrollment, official launch.
- **Future** — Apple Watch companion, Android port, wearable integrations (Oura, Garmin), predictive fatigue risk.

---

## Support & Feedback

- **Documentation**: See `docs/` directory for architecture, business plans, launch checklist, and research.
- **Issues**: Submit bugs or feature requests on GitHub.
- **Privacy**: See `docs/launch/PRIVACY_POLICY.md`.
- **Medical Disclaimers**: See `docs/launch/HEALTH_DISCLAIMERS.md`.

---

## License

Proprietary © 2026 ShiftWell. All rights reserved.

For licensing inquiries, contact the development team.

---

## About the Founder

ShiftWell was created by **Dr. Gursimran Singh, DO**, an emergency medicine physician with firsthand experience managing circadian disruption in high-stakes clinical work. Driven by the observation that 700 million shift workers globally have no science-backed tool for optimizing sleep and recovery, Dr. Singh founded ShiftWell to bring deterministic, evidence-based circadian optimization to the people who need it most.

---

## Freshness

- **Created:** 2026-04-18
- **Last Reviewed:** 2026-04-18
- **Last Edited:** 2026-04-18
- **Review Notes:** Initial creation — complete launch documentation package with hero section, quick start, architecture overview, tech stack, project structure, contributing guidelines, and scientific foundation references. Ready for launch-kit distribution.

---

**ShiftWell: Sleep Science for Shift Workers**
