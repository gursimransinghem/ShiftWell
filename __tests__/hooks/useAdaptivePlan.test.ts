/**
 * TDD: useAdaptivePlan — daily debounce gate
 *
 * Tests the exported runAdaptiveBrain(deps) function directly to avoid
 * needing @testing-library/react-native for useEffect-based hook testing.
 *
 * Gate behaviour:
 *   - Skip if AsyncStorage already has today's date
 *   - Run if no prior record (null)
 *   - Run if last run was yesterday
 *   - Persist today's date after a successful run
 *   - Do NOT persist if buildAdaptiveContext throws
 *   - Pass a 14-night window to getSleepHistory (BRAIN-02)
 */

import { runAdaptiveBrain } from '../../src/hooks/useAdaptivePlan';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, subDays } from 'date-fns';
import { DEFAULT_PROFILE } from '../../src/lib/circadian/types';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('react-native', () => ({
  AppState: { currentState: 'active', addEventListener: jest.fn() },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

const mockIsAvailable = jest.fn().mockResolvedValue(true);
const mockGetSleepHistory = jest.fn();
const mockGetSleepHistoryForRange = jest.fn().mockResolvedValue([]);

jest.mock('../../src/lib/healthkit/healthkit-service', () => ({
  isAvailable: () => mockIsAvailable(),
  getSleepHistory: (...args: unknown[]) => mockGetSleepHistory(...args),
  getSleepHistoryForRange: (...args: unknown[]) => mockGetSleepHistoryForRange(...args),
}));

const mockBuildAdaptiveContext = jest.fn();

jest.mock('../../src/lib/adaptive/context-builder', () => ({
  buildAdaptiveContext: (...args: unknown[]) => mockBuildAdaptiveContext(...args),
}));

const mockComputeDelta = jest.fn().mockReturnValue([]);

jest.mock('../../src/lib/adaptive/change-logger', () => ({
  computeDelta: (...args: unknown[]) => mockComputeDelta(...args),
}));

const mockComparePlannedVsActual = jest.fn().mockReturnValue({
  planned: { start: new Date(), end: new Date(), durationMinutes: 480 },
  actual: null,
  bedtimeDeviationMinutes: 0,
  wakeDeviationMinutes: 0,
  durationDeviationMinutes: 0,
  adherenceScore: 0,
  insight: 'No data',
});

jest.mock('../../src/lib/healthkit/sleep-comparison', () => ({
  comparePlannedVsActual: (...args: unknown[]) => mockComparePlannedVsActual(...args),
}));

const mockSetAdaptiveContext = jest.fn();

jest.mock('../../src/store/plan-store', () => ({
  usePlanStore: jest.fn(),
}));

jest.mock('../../src/store/shifts-store', () => ({
  useShiftsStore: jest.fn((selector: (s: { shifts: unknown[]; personalEvents: unknown[] }) => unknown) =>
    selector({ shifts: [], personalEvents: [] }),
  ),
}));

jest.mock('../../src/store/user-store', () => ({
  useUserStore: jest.fn((selector: (s: { profile: Record<string, unknown> }) => unknown) =>
    selector({ profile: {} }),
  ),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MOCK_SLEEP_RECORD = {
  startDate: new Date('2026-04-05T22:00:00'),
  endDate: new Date('2026-04-06T06:00:00'),
  durationMinutes: 480,
  efficiency: 0.92,
  stages: [],
};

const MOCK_CONTEXT = {
  debt: { severity: 'mild' as const, bankHours: -1.5, trend: 'worsening' as const },
  schedule: { daysUntilTransition: 3, upcomingShifts: [], patternAlerts: [] },
  recovery: { score: 72, zone: 'yellow' as const },
  protocol: null,
};

const mockSetFeedbackAdjustment = jest.fn();
const mockSetDiscrepancyHistory = jest.fn();

function buildDeps() {
  return {
    shifts: [],
    personalEvents: [],
    profile: DEFAULT_PROFILE,
    currentPlan: null,
    planSnapshot: null,
    setAdaptiveContext: mockSetAdaptiveContext,
    feedbackHistory: [],
    setFeedbackAdjustment: mockSetFeedbackAdjustment,
    setDiscrepancyHistory: mockSetDiscrepancyHistory,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const TODAY_ISO = format(new Date(), 'yyyy-MM-dd');
const YESTERDAY_ISO = format(subDays(new Date(), 1), 'yyyy-MM-dd');

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSleepHistory.mockResolvedValue([MOCK_SLEEP_RECORD]);
  mockGetSleepHistoryForRange.mockResolvedValue([]);
  mockBuildAdaptiveContext.mockReturnValue(MOCK_CONTEXT);
  mockComputeDelta.mockReturnValue([]);
  mockSetAdaptiveContext.mockReturnValue(undefined);
  mockSetDiscrepancyHistory.mockReturnValue(undefined);
});

// 1. Skip when already ran today
test('skips when already ran today', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(TODAY_ISO);

  await runAdaptiveBrain(buildDeps());

  expect(mockBuildAdaptiveContext).not.toHaveBeenCalled();
});

// 2. Runs when no prior run
test('runs when no prior run', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

  await runAdaptiveBrain(buildDeps());

  expect(mockBuildAdaptiveContext).toHaveBeenCalledTimes(1);
});

// 3. Runs when last run was yesterday
test('runs when last run was yesterday', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(YESTERDAY_ISO);

  await runAdaptiveBrain(buildDeps());

  expect(mockBuildAdaptiveContext).toHaveBeenCalledTimes(1);
});

// 4. Sets AsyncStorage after successful run
test('sets AsyncStorage after successful run', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

  await runAdaptiveBrain(buildDeps());

  expect(AsyncStorage.setItem).toHaveBeenCalledWith('adaptive-last-run', TODAY_ISO);
});

// 5. Does not set AsyncStorage on error
test('does not set AsyncStorage on error', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  mockBuildAdaptiveContext.mockImplementation(() => {
    throw new Error('context build failed');
  });

  await runAdaptiveBrain(buildDeps());

  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
});

// 6. Passes 14-night history to buildAdaptiveContext (BRAIN-02)
test('passes 14-night history to buildAdaptiveContext (BRAIN-02)', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

  await runAdaptiveBrain(buildDeps());

  // getSleepHistory should be called
  expect(mockGetSleepHistory).toHaveBeenCalledTimes(1);

  // Verify the date range spans ~14 days
  const [startArg, endArg] = mockGetSleepHistory.mock.calls[0] as [Date, Date];
  const diffMs = endArg.getTime() - startArg.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  expect(diffDays).toBeCloseTo(14, 0);

  // buildAdaptiveContext receives the history
  expect(mockBuildAdaptiveContext).toHaveBeenCalledWith(
    expect.objectContaining({ history: [MOCK_SLEEP_RECORD] }),
  );
});

// ---------------------------------------------------------------------------
// Discrepancy History (Phase 14 — HK-01, HK-02, HK-03)
// ---------------------------------------------------------------------------

// 7. getSleepHistoryForRange(30) called after debt context assembly
test('calls getSleepHistoryForRange(30) during successful run', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

  await runAdaptiveBrain(buildDeps());

  expect(mockGetSleepHistoryForRange).toHaveBeenCalledTimes(1);
  expect(mockGetSleepHistoryForRange).toHaveBeenCalledWith(30);
});

// 8. setDiscrepancyHistory called with [] when getSleepHistoryForRange returns []
test('calls setDiscrepancyHistory with [] when no HK data', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  mockGetSleepHistoryForRange.mockResolvedValue([]);

  await runAdaptiveBrain(buildDeps());

  expect(mockSetDiscrepancyHistory).toHaveBeenCalledWith([]);
});

// 9. setDiscrepancyHistory called with [] when plan is null
test('calls setDiscrepancyHistory with [] when plan is null', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  // Return some HK data — but plan is null so no comparison possible
  mockGetSleepHistoryForRange.mockResolvedValue([MOCK_SLEEP_RECORD]);

  const deps = buildDeps(); // currentPlan is null in buildDeps
  await runAdaptiveBrain(deps);

  // With null plan, should still call setDiscrepancyHistory (with [])
  expect(mockSetDiscrepancyHistory).toHaveBeenCalledWith([]);
});

// 10. setDiscrepancyHistory not called when debounce gate prevents run
test('does not call setDiscrepancyHistory when run is skipped (debounce gate)', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(format(new Date(), 'yyyy-MM-dd'));

  await runAdaptiveBrain(buildDeps());

  expect(mockSetDiscrepancyHistory).not.toHaveBeenCalled();
});

test('subscribes to raw feedback records instead of derived array selector', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '../../src/hooks/useAdaptivePlan.ts'),
    'utf8',
  );

  expect(source).toContain('const feedbackRecords = useFeedbackStore((s) => s.records);');
  expect(source).not.toContain('useFeedbackStore((s) => s.getRecentHistory(7))');
});
