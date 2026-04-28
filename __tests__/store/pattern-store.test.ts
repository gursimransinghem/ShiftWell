import { usePatternStore } from '../../src/store/pattern-store';

jest.mock('../../src/lib/patterns/pattern-detector', () => ({
  detectPatterns: jest.fn(() => []),
}));

jest.mock('../../src/lib/patterns/alert-generator', () => ({
  generatePatternAlert: jest.fn(),
}));

describe('usePatternStore', () => {
  beforeEach(() => {
    jest.useRealTimers();
    usePatternStore.setState({
      alerts: [],
      patterns: [],
      dismissedPatterns: [],
      lastAnalyzedISO: null,
      isAnalyzing: false,
    });
  });

  it('clears stale analyzing state when refresh is debounced', () => {
    usePatternStore.setState({
      isAnalyzing: true,
      lastAnalyzedISO: new Date().toISOString(),
    });

    usePatternStore.getState().refreshAlerts([], [], []);

    expect(usePatternStore.getState().isAnalyzing).toBe(false);
  });
});
