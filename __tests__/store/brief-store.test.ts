/**
 * brief-store tests (Phase 20)
 *
 * Tests: generate action, 8-brief cap, toggleEnabled, persist shape.
 * Mocks AsyncStorage and claude-client — never calls the real API.
 */

import { useBriefStore } from '../../src/store/brief-store';
import type { BriefResponse } from '../../src/lib/ai/claude-client';
import type { BriefRequest } from '../../src/lib/ai/claude-client';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  mergeItem: jest.fn().mockResolvedValue(undefined),
  multiSet: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/lib/ai/claude-client', () => ({
  generateWeeklyBrief: jest.fn(),
  FALLBACK_BRIEF: {
    summary: 'Fallback summary.',
    trend: 'stable',
    recommendation: 'Protect wind-down.',
    encouragement: 'Keep going.',
  },
}));

import { generateWeeklyBrief } from '../../src/lib/ai/claude-client';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_BRIEF: BriefResponse = {
  summary: 'Your sleep improved this week.',
  trend: 'improving',
  recommendation: 'Keep your wind-down consistent.',
  encouragement: 'Great momentum!',
};

const MOCK_REQUEST: BriefRequest = {
  sleepHistory: [],
  debtTrend: { current: 1.0, weekAgo: 1.5 },
  upcomingTransitions: [],
  streakDays: 3,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resetStore() {
  useBriefStore.setState({
    currentBrief: null,
    lastGeneratedISO: null,
    enabled: true,
    briefs: [],
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  resetStore();
  (generateWeeklyBrief as jest.Mock).mockResolvedValue(MOCK_BRIEF);
});

describe('useBriefStore — generateBrief', () => {
  it('sets currentBrief after successful generation', async () => {
    await useBriefStore.getState().generateBrief(MOCK_REQUEST, false);
    expect(useBriefStore.getState().currentBrief).toEqual(MOCK_BRIEF);
  });

  it('sets lastGeneratedISO to today', async () => {
    await useBriefStore.getState().generateBrief(MOCK_REQUEST, false);
    const today = new Date().toISOString().slice(0, 10);
    expect(useBriefStore.getState().lastGeneratedISO).toBe(today);
  });

  it('appends brief to history', async () => {
    await useBriefStore.getState().generateBrief(MOCK_REQUEST, false);
    expect(useBriefStore.getState().briefs).toHaveLength(1);
    expect(useBriefStore.getState().briefs[0].brief).toEqual(MOCK_BRIEF);
  });

  it('caps history at 8 entries', async () => {
    // Pre-fill with 8 briefs
    useBriefStore.setState({
      briefs: Array.from({ length: 8 }, (_, i) => ({
        dateISO: `2026-01-0${i + 1}`,
        brief: MOCK_BRIEF,
      })),
    });

    await useBriefStore.getState().generateBrief(MOCK_REQUEST, false);

    expect(useBriefStore.getState().briefs).toHaveLength(8);
  });

  it('newest brief appears first in briefs array', async () => {
    useBriefStore.setState({
      briefs: [{ dateISO: '2026-01-01', brief: MOCK_BRIEF }],
    });

    const newBrief: BriefResponse = { ...MOCK_BRIEF, summary: 'Newest' };
    (generateWeeklyBrief as jest.Mock).mockResolvedValueOnce(newBrief);

    await useBriefStore.getState().generateBrief(MOCK_REQUEST, false);

    expect(useBriefStore.getState().briefs[0].brief.summary).toBe('Newest');
  });

  it('does not call generateWeeklyBrief when disabled', async () => {
    useBriefStore.setState({ enabled: false });
    await useBriefStore.getState().generateBrief(MOCK_REQUEST, false);
    expect(generateWeeklyBrief).not.toHaveBeenCalled();
    expect(useBriefStore.getState().currentBrief).toBeNull();
  });

  it('calls generateWeeklyBrief with the provided request', async () => {
    await useBriefStore.getState().generateBrief(MOCK_REQUEST, false);
    expect(generateWeeklyBrief).toHaveBeenCalledWith(MOCK_REQUEST);
  });
});

describe('useBriefStore — toggleEnabled', () => {
  it('toggles enabled from true to false', () => {
    useBriefStore.setState({ enabled: true });
    useBriefStore.getState().toggleEnabled();
    expect(useBriefStore.getState().enabled).toBe(false);
  });

  it('toggles enabled from false to true', () => {
    useBriefStore.setState({ enabled: false });
    useBriefStore.getState().toggleEnabled();
    expect(useBriefStore.getState().enabled).toBe(true);
  });
});

describe('useBriefStore — dismissCurrentBrief', () => {
  it('clears currentBrief', async () => {
    await useBriefStore.getState().generateBrief(MOCK_REQUEST, false);
    expect(useBriefStore.getState().currentBrief).not.toBeNull();

    useBriefStore.getState().dismissCurrentBrief();
    expect(useBriefStore.getState().currentBrief).toBeNull();
  });

  it('preserves briefs history when dismissing', async () => {
    await useBriefStore.getState().generateBrief(MOCK_REQUEST, false);
    useBriefStore.getState().dismissCurrentBrief();
    expect(useBriefStore.getState().briefs).toHaveLength(1);
  });
});

describe('useBriefStore — persist shape', () => {
  it('initial state has correct shape', () => {
    const state = useBriefStore.getState();
    expect(state.currentBrief).toBeNull();
    expect(state.lastGeneratedISO).toBeNull();
    expect(state.enabled).toBe(true);
    expect(state.briefs).toEqual([]);
  });

  it('briefs array contains dateISO and brief fields', async () => {
    await useBriefStore.getState().generateBrief(MOCK_REQUEST, false);
    const entry = useBriefStore.getState().briefs[0];
    expect(entry).toHaveProperty('dateISO');
    expect(entry).toHaveProperty('brief');
    expect(typeof entry.dateISO).toBe('string');
  });
});
