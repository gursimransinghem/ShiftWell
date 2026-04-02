/**
 * TDD: notification-store Zustand slice — preference state with AsyncStorage persistence.
 */
import { useNotificationStore } from '../../src/store/notification-store';

// Mock AsyncStorage to prevent actual storage calls
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  mergeItem: jest.fn().mockResolvedValue(undefined),
  multiSet: jest.fn().mockResolvedValue(undefined),
}));

describe('useNotificationStore — defaults', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useNotificationStore.setState({
      windDownEnabled: true,
      windDownLeadMinutes: 45,
      caffeineCutoffEnabled: true,
      caffeineCutoffLeadMinutes: 30,
      morningBriefEnabled: true,
    });
  });

  it('windDownLeadMinutes defaults to 45', () => {
    expect(useNotificationStore.getState().windDownLeadMinutes).toBe(45);
  });

  it('caffeineCutoffLeadMinutes defaults to 30', () => {
    expect(useNotificationStore.getState().caffeineCutoffLeadMinutes).toBe(30);
  });

  it('windDownEnabled defaults to true', () => {
    expect(useNotificationStore.getState().windDownEnabled).toBe(true);
  });

  it('caffeineCutoffEnabled defaults to true', () => {
    expect(useNotificationStore.getState().caffeineCutoffEnabled).toBe(true);
  });

  it('morningBriefEnabled defaults to true', () => {
    expect(useNotificationStore.getState().morningBriefEnabled).toBe(true);
  });
});

describe('useNotificationStore — setWindDown', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      windDownEnabled: true,
      windDownLeadMinutes: 45,
      caffeineCutoffEnabled: true,
      caffeineCutoffLeadMinutes: 30,
      morningBriefEnabled: true,
    });
  });

  it('setWindDown(false) sets windDownEnabled to false, preserving leadMinutes', () => {
    const { setWindDown } = useNotificationStore.getState();
    setWindDown(false);
    const state = useNotificationStore.getState();
    expect(state.windDownEnabled).toBe(false);
    expect(state.windDownLeadMinutes).toBe(45);
  });

  it('setWindDown(true, 60) sets windDownEnabled true AND windDownLeadMinutes to 60', () => {
    const { setWindDown } = useNotificationStore.getState();
    setWindDown(true, 60);
    const state = useNotificationStore.getState();
    expect(state.windDownEnabled).toBe(true);
    expect(state.windDownLeadMinutes).toBe(60);
  });
});

describe('useNotificationStore — setCaffeineCutoff', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      windDownEnabled: true,
      windDownLeadMinutes: 45,
      caffeineCutoffEnabled: true,
      caffeineCutoffLeadMinutes: 30,
      morningBriefEnabled: true,
    });
  });

  it('setCaffeineCutoff(false) sets caffeineCutoffEnabled to false', () => {
    const { setCaffeineCutoff } = useNotificationStore.getState();
    setCaffeineCutoff(false);
    expect(useNotificationStore.getState().caffeineCutoffEnabled).toBe(false);
  });

  it('setCaffeineCutoff(true, 45) sets caffeineCutoffEnabled true AND leadMinutes 45', () => {
    const { setCaffeineCutoff } = useNotificationStore.getState();
    setCaffeineCutoff(false); // disable first
    setCaffeineCutoff(true, 45);
    const state = useNotificationStore.getState();
    expect(state.caffeineCutoffEnabled).toBe(true);
    expect(state.caffeineCutoffLeadMinutes).toBe(45);
  });
});

describe('useNotificationStore — setMorningBrief', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      windDownEnabled: true,
      windDownLeadMinutes: 45,
      caffeineCutoffEnabled: true,
      caffeineCutoffLeadMinutes: 30,
      morningBriefEnabled: true,
    });
  });

  it('setMorningBrief(false) sets morningBriefEnabled to false', () => {
    const { setMorningBrief } = useNotificationStore.getState();
    setMorningBrief(false);
    expect(useNotificationStore.getState().morningBriefEnabled).toBe(false);
  });
});

describe('useNotificationStore — persistence key', () => {
  it('store persists under key notification-prefs', () => {
    // Zustand's persist middleware exposes name via persist.getOptions()
    const storeName = (useNotificationStore as any).persist?.getOptions?.()?.name;
    expect(storeName).toBe('notification-prefs');
  });
});
