# ADR-001: Expo & React Native for Cross-Platform Development

**Status:** Accepted
**Date:** 2026-04-18

## Context

ShiftWell is founded by an emergency medicine physician (DO) with beginner coding experience. The core product is a circadian sleep optimization app for shift workers, initially targeting iOS but with future cross-platform aspirations (Android, web). The team is solo-founder stage, requiring rapid iteration and minimal operational overhead.

Key constraints:
- Single developer with limited native iOS/Kotlin experience
- Need to ship to TestFlight and App Store on aggressive timeline
- Desire for code reuse across iOS and future Android
- Expo managed workflow simplifies CI/CD and OTA updates
- Large React Native ecosystem with health/fitness libraries (WHOOP SDK, Apple HealthKit bindings)

Alternative considered: Native Swift development (iOS-first), custom Android bridge later.

## Decision

Use **Expo managed workflow with React Native (v0.83.2, Expo SDK 55.0.6)** as the primary platform for ShiftWell v1-v3. Native modules are wrapped via Expo SDK or compiled with EAS Build.

## Consequences

### Positive
- **Rapid iteration:** Hot reload and live preview on device without rebuilding (faster than native)
- **Single codebase:** JavaScript/TypeScript shared across iOS and future Android/web platforms
- **Managed builds:** EAS Build handles provisioning, signing, and TestFlight upload (no local Xcode complexity)
- **OTA updates:** EAS Update for critical bug fixes and feature rollouts without App Store review cycle
- **Large ecosystem:** Mature npm packages for health integrations (WHOOP, Apple HealthKit via Expo modules)
- **Learning curve:** Beginner-friendly ramp for non-native developers; documentation and community support
- **Free tier for MVP:** Expo's free tier covers development, testing, and early production phases

### Negative
- **Native module limitations:** Some specialized health APIs (continuous HRV polling, background tasks) require custom native code or Expo modules
- **Bundle size:** React Native overhead (~4MB baseline) vs. native Swift (~1-2MB), mitigated by code splitting and tree-shaking
- **Performance edge cases:** Complex animations or real-time data streaming may require optimization (not blocking for sleep app use case)
- **App Store restrictions:** Expo managed workflow apps undergo standard App Store review; no speed advantage there
- **Dependency on Expo:** Breaking changes in Expo SDK 56+ could require migration work (mitigated by pinning to SDK 55 and testing before upgrades)

### Neutral
- **Android later:** Codebase is portable to Android, but requires Android-specific testing and debug builds (not critical for Phase 1-3)
- **Web:** React Native Web is experimental for health apps; web version deferred post-launch
- **Market expectation:** iOS-first is acceptable for niche health apps; Android gap is not a blocker for initial launch

---
**Created:** 2026-04-18
**Last Reviewed:** 2026-04-18
**Last Edited:** 2026-04-18
**Review Notes:** Initial creation — launch documentation package. Aligns with founder's beginner coding experience and rapid iteration timeline.
