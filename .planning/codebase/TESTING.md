# Testing Patterns

**Analysis Date:** 2026-05-05

## Test Framework

**Runner:**

- Jest `^30.3.0` with `ts-jest` `^29.4.6` — root `package.json` and `api/package.json`.
- Root config: `jest.config.js` (CommonJS `module.exports`).
- API config: inline `"jest"` key in `api/package.json` (no separate `jest.config.js`).

**Assertion Library:**

- Jest built-in `expect`.

**Run Commands:**

```bash
cd /Users/sima/Projects/ShiftWell && npm test    # App + shared roots (__tests__, src per jest.config.js)
cd /Users/sima/Projects/ShiftWell/api && npm test   # API only; --passWithNoTests
```

## Test File Organization

**Location:**

- **Top-level:** `__tests__/` at repo root with domain subfolders (`adaptive/`, `circadian/`, `store/`, `lib/ai/`, `components/`, `api/`, etc.).
- **Co-located:** `src/lib/**/__tests__/*.test.ts` — e.g. `src/lib/calendar/__tests__/`, `src/lib/enterprise/__tests__/`, `src/lib/notifications/__tests__/`.
- **API:** `api/src/__tests__/routes.test.ts` only `**/__tests__/**/*.test.ts` matches per `api/package.json`.

**Naming:**

- `*.test.ts` exclusively (no `*.spec.*` found).

**Structure:**

```
ShiftWell/
├── __tests__/           # majority of suites
├── jest.config.js
├── jest.setup.ts
├── src/lib/.../__tests__/
└── api/src/__tests__/
```

## Test Structure

**Suite Organization:**

```typescript
describe('POST /v1/schedules', () => {
  let app: ReturnType<typeof buildApp>['app'];
  beforeAll(async () => {
    const built = buildApp();
    app = built.app;
  });
  it('returns 201 with accepted count for valid shiftwell payload', async () => {
    const res = await request(app).post('/v1/schedules').set('Authorization', `Bearer ${token}`).send({...});
    expect(res.status).toBe(201);
  });
});
```

Reference: `api/src/__tests__/routes.test.ts`.

**Patterns:**

- `beforeEach` / `beforeAll` for app build, store reset, and mock defaults — e.g. `plan-store.test.ts`, `calendar-service.test.ts`.
- Nested `describe` blocks per route, parser, or unit under test.

## Mocking

**Framework:** Jest (`jest.mock`, `jest.fn`, `jest.clearAllMocks`, `jest.useRealTimers`).

**Patterns:**

```typescript
jest.mock('../../src/lib/circadian/index', () => ({
  generateSleepPlan: jest.fn(),
}));
// Import after mocks when the module under test must receive the mock:
import { generateSleepPlan } from '../../src/lib/circadian/index';
(generateSleepPlan as jest.Mock).mockReturnValue(MOCK_PLAN);
```

Reference: `__tests__/store/plan-store.test.ts`, `__tests__/hooks/useAdaptivePlan.test.ts`.

**Module name mapper (root):** `jest.config.js` maps native/Expo modules to files under `__mocks__/` — e.g. `@react-native-async-storage/async-storage`, `expo-calendar`, `expo-secure-store`, `expo-notifications`, `react-native-svg`, `@kingstinct/react-native-healthkit`, Supabase and sync-engine paths.

**What to Mock:**

- Native modules, Expo APIs, external SDKs, and heavy collaborators (HealthKit service, `buildAdaptiveContext`, stores when testing hooks).

**What NOT to Mock:**

- Pure parsers under test (Kronos/QGenda sections import real parsers from `../routes/schedule` inside `routes.test.ts`). Calendar tests use the mapped `expo-calendar` mock as the boundary.

## Fixtures and Factories

**Test Data:**

```typescript
const MOCK_PLAN: SleepPlan = {
  blocks: [...],
  startDate: new Date('2026-04-10'),
  // ...
};
```

Reference: `__tests__/store/plan-store.test.ts`. JWT helper `makeToken` in API tests uses `jose` `SignJWT` with a fixed `TextEncoder` secret.

**Location:** Inline in test files; no central `fixtures/` folder detected.

## Coverage

**Requirements:** None enforced in `package.json` scripts (no `collectCoverage` defaults documented).

**View Coverage:** Add Jest `--coverage` locally if needed; not prewired in scripts.

## Test Types

**Unit Tests:**

- Dominant style: pure functions, Zustand store behavior with mocked dependencies, parser units, and “logic-only” hook tests (`runAdaptiveBrain` exported for testability — `__tests__/hooks/useAdaptivePlan.test.ts`).

**Integration Tests:**

- API HTTP tests with `supertest` against `buildApp()` — `api/src/__tests__/routes.test.ts`. Auth uses real JWT signing in tests; repos may be defaulted inside `buildApp`.

**E2E Tests:**

- Not detected (no Detox / Maestro / Playwright config in sampled tree).

## Component testing

**Strategy:** Some UI tests avoid rendering — e.g. `__tests__/components/AdaptiveInsightCard.test.ts` reads `AdaptiveInsightCard.tsx` from disk and asserts on source patterns + types. `__tests__/components/WeeklyBriefCard.test.ts` exists alongside. `__tests__/store/jest-mocks.test.ts` verifies mock modules load without native errors.

**react-test-renderer:** Listed in root `devDependencies` but hook tests explicitly bypass full RN renderer where noted in comments.

## Common Patterns

**Async Testing:**

```typescript
const res = await request(app).get('/v1/outcomes').query({ start: '2025-01-01', end: '2025-01-31' });
expect(res.status).toBe(200);
```

**Error Testing:**

```typescript
expect(res.status).toBe(400);
expect(res.body.code).toBe('VALIDATION_ERROR');
```

**Environment:** Root `jest.setup.ts` sets `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` so modules that read env at load time do not throw. API tests rely on `NODE_ENV === 'test'` default secret behavior in `buildApp()` — see `api/src/app.ts`.

**Dynamic import in tests:**

```typescript
const { KronosParser } = await import('../routes/schedule');
```

Used in `api/src/__tests__/routes.test.ts` for parser suites.

---

*Testing analysis: 2026-05-05*
