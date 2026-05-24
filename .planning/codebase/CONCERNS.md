# Codebase Concerns

**Analysis Date:** 2026-05-05

## Tech Debt

**Live Activity / ActivityKit:**

- Issue: `startSleepActivity`, `updateSleepActivity`, and `endSleepActivity` are documented as stubs. When `LIVE_ACTIVITIES_AVAILABLE` is true, the native branch returns immediately without calling ActivityKit (TODO placeholders for import, `update`, `end`). Real behavior is notification-based fallback only.
- Files: `src/lib/adherence/live-activity-service.ts`
- Impact: Users in EAS builds with the native flag set may get no Live Activity updates at all until the TODO block is implemented.
- Fix approach: Add Swift extension + `ShiftWellLiveActivity` target, wire `__LIVE_ACTIVITY_NATIVE_MODULE__`, replace TODOs with native calls; keep notifications as fallback when native unavailable.

**Enterprise API entry script mismatch:**

- Issue: `api/package.json` sets `"main": "src/index.ts"` and `"start": "ts-node src/index.ts"`, but `api/src/index.ts` does not exist. The assembled app lives in `api/src/app.ts` (`buildApp()` factory only; no `listen()` in the portion reviewed).
- Files: `api/package.json`, `api/src/app.ts`
- Impact: `npm start` in `api/` fails at module resolution unless a separate entry file is added or scripts are retargeted.
- Fix approach: Add `api/src/index.ts` that imports `buildApp`, reads `PORT`, calls `app.listen`, or change `start`/`main` to the actual entry file.

**OAuth token stub (development):**

- Issue: `POST /oauth/token` documents a dev stub: any non-empty `client_id` / `client_secret` can yield a token in test/HMAC paths; production path returns 501 until RS256 issuance is configured.
- Files: `api/src/app.ts`
- Impact: Misconfiguration in non-test environments could rely on weak or unimplemented auth.
- Fix approach: Gate stub strictly on `NODE_ENV`, integrate a real IdP or RS256 signing with managed keys, remove permissive credential acceptance outside local dev.

## Known Bugs

**API start command references missing file:**

- Symptoms: Running `npm start` from `api/` errors because `src/index.ts` is absent.
- Files: `api/package.json`
- Trigger: `npm start` or tooling that resolves `"main"`.
- Workaround: Run tests via `npm test` (Jest loads `buildApp` directly) or invoke a custom script once an entry exists.

## Security Considerations

**JWT verification fallback key:**

- Risk: When `JWT_PUBLIC_KEY` is unset, middleware falls back to a documented RSA test public key in code (`api/src/middleware/auth.ts`). If production were deployed without `JWT_PUBLIC_KEY`, verification would use the well-known test key material.
- Files: `api/src/middleware/auth.ts`
- Current mitigation: Production deployments must set `JWT_PUBLIC_KEY` (documented in comments). OAuth issuance for non-test prod returns 501 until configured.
- Recommendations: Fail fast at startup in production if `JWT_PUBLIC_KEY` is missing; add integration test or smoke check for misconfiguration.

**Client-side `any` escapes:**

- Risk: Supabase RPC and storage calls use `(supabase as any)` / `(AsyncStorage as any)` in auth flows, hiding typing mismatches.
- Files: `src/store/auth-store.ts`
- Current mitigation: ESLint suppressions scoped to those lines.
- Recommendations: Regenerate Supabase types or wrap RPC in typed helpers; narrow AsyncStorage usage with proper typings.

## Performance Bottlenecks

**Large tab and screen modules:**

- Problem: Several route-level files exceed typical single-responsibility size, increasing parse cost and making renders harder to optimize.
- Files: `app/(tabs)/index.tsx` (~1033 lines), `app/(tabs)/circadian.tsx` (~733 lines), `app/paywall.tsx` (~725 lines), `app/import.tsx` (~639 lines)
- Cause: Monolithic components mixing data loading, UI branches, and business rules.
- Improvement path: Extract subcomponents and hooks (e.g. circadian charts, paywall variants, import steps) and memoize heavy subtrees.

## Fragile Areas

**Hook dependency suppressions:**

- Files: `src/hooks/useAdaptivePlan.ts`, `src/lib/ai/weekly-brief-scheduler.ts`, `src/components/ui/GradientMeshBackground.tsx`, `app/(tabs)/circadian.tsx`, `app/(onboarding)/welcome.tsx`, and multiple `src/components/night-sky/*` files (eslint-disable for `react-hooks/exhaustive-deps`).
- Why fragile: Stale closures or missed updates when dependencies change without updating the effect list.
- Safe modification: When editing effects, re-evaluate dependency arrays; prefer extracting stable callbacks or refs over blanket disables.
- Test coverage: Rely on component/integration tests where behavior is timing-sensitive.

**Live Activity availability guard:**

- Files: `src/lib/adherence/live-activity-service.ts`
- Why fragile: `(global as any).__LIVE_ACTIVITY_NATIVE_MODULE__` is a convention that must stay in sync with native code; if set without full native implementation, users get silent no-ops in the native branch.

## Scaling Limits

**Enterprise API:**

- Current capacity: In-memory route handlers with injectable repositories (`buildApp` deps); no database layer in tree under `api/src/` reviewed.
- Limit: Horizontal scaling and persistence depend on unimplemented or external repo implementations.
- Scaling path: Back repositories with a real store, add connection pooling, rate limits already in `api/src/middleware/rateLimit.ts` — verify limits match product SLAs.

## Dependencies at Risk

**Not detected:** No deprecated-package audit was run. Jest `^30.3.0` in `api/package.json` is a major bump relative to common ecosystem defaults — validate plugin compatibility when upgrading adjacent tooling.

## Missing Critical Features

**ActivityKit Live Activities:** Documented as blocked on EAS + Xcode; notifications substitute for lock-screen live UX.

**Production token issuance:** RS256 path for `/oauth/token` returns `NOT_CONFIGURED` until implemented (`api/src/app.ts`).

## Test Coverage Gaps

**API runtime entry:**

- What's not tested: Automated test for a real `node`/`ts-node` bootstrap of the server process (only `buildApp` via `api/src/__tests__/routes.test.ts`).
- Files: `api/package.json`, `api/src/app.ts`
- Risk: Broken `start` script ships unnoticed.
- Priority: High

**Live Activity native path:**

- What's not tested: No automated test for `LIVE_ACTIVITIES_AVAILABLE === true` behavior (native module absent in typical CI).
- Files: `src/lib/adherence/live-activity-service.ts`
- Risk: Regression when native module is finally wired.
- Priority: Medium

---

*Concerns audit: 2026-05-05*
