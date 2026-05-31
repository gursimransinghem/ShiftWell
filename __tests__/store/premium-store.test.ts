/**
 * Premium store revenue-path tests.
 *
 * These tests assert real store state transitions; they do not mock the store.
 */

const mockInitialize = jest.fn();
const mockCheckPremiumStatus = jest.fn();
const mockPurchasePackage = jest.fn();
const mockRestorePurchases = jest.fn();
const mockGetOfferings = jest.fn();
const mockOnPremiumStatusChange = jest.fn();

jest.mock('../../src/lib/premium/premium-service', () => ({
  initialize: mockInitialize,
  checkPremiumStatus: mockCheckPremiumStatus,
  purchasePackage: mockPurchasePackage,
  restorePurchases: mockRestorePurchases,
  getOfferings: mockGetOfferings,
  onPremiumStatusChange: mockOnPremiumStatusChange,
}));

import { usePremiumStore } from '../../src/store/premium-store';

const NOW = new Date('2026-05-31T12:00:00.000Z');
const EXPIRES_AT = new Date('2026-07-01T00:00:00.000Z');

function resetPremiumStore(): void {
  usePremiumStore.setState({
    isPremium: false,
    plan: 'free',
    expiresAt: null,
    isLoading: false,
    offerings: null,
    trialStartedAt: null,
    trialDaysLeft: 0,
    isInTrial: false,
    isGrandfathered: false,
  });
}

describe('premium-store trial lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
    mockInitialize.mockResolvedValue(undefined);
    mockCheckPremiumStatus.mockResolvedValue({
      isPremium: false,
      plan: 'free',
      expiresAt: null,
    });
    mockOnPremiumStatusChange.mockReturnValue(() => undefined);
    resetPremiumStore();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('startTrial starts a 14-day trial exactly once', () => {
    usePremiumStore.getState().startTrial();
    const firstStart = usePremiumStore.getState().trialStartedAt;

    jest.setSystemTime(new Date('2026-06-01T12:00:00.000Z'));
    usePremiumStore.getState().startTrial();

    expect(firstStart).toBe(NOW.toISOString());
    expect(usePremiumStore.getState()).toMatchObject({
      trialStartedAt: firstStart,
      trialDaysLeft: 14,
      isInTrial: true,
    });
  });

  it('initializePremium auto-starts trial on first launch and wires status listener', async () => {
    await usePremiumStore.getState().initializePremium();

    expect(usePremiumStore.getState()).toMatchObject({
      trialStartedAt: NOW.toISOString(),
      trialDaysLeft: 14,
      isInTrial: true,
      isPremium: false,
      plan: 'free',
    });
    expect(mockInitialize).toHaveBeenCalledTimes(1);
    expect(mockCheckPremiumStatus).toHaveBeenCalledTimes(1);
    expect(mockOnPremiumStatusChange).toHaveBeenCalledTimes(1);
  });

  it('initializePremium rehydrates persisted trial state without resetting the start date', async () => {
    const existingStart = new Date('2026-05-28T12:00:00.000Z').toISOString();
    usePremiumStore.setState({ trialStartedAt: existingStart });

    await usePremiumStore.getState().initializePremium();

    expect(usePremiumStore.getState()).toMatchObject({
      trialStartedAt: existingStart,
      trialDaysLeft: 11,
      isInTrial: true,
    });
  });

  it('initializePremium preserves current premium state if RevenueCat initialization fails', async () => {
    const existingStart = new Date('2026-05-30T12:00:00.000Z').toISOString();
    usePremiumStore.setState({
      trialStartedAt: existingStart,
      isPremium: true,
      plan: 'premium',
      expiresAt: EXPIRES_AT,
    });
    mockInitialize.mockRejectedValueOnce(new Error('missing API key'));

    await usePremiumStore.getState().initializePremium();

    expect(usePremiumStore.getState()).toMatchObject({
      trialStartedAt: existingStart,
      trialDaysLeft: 13,
      isInTrial: true,
      isPremium: true,
      plan: 'premium',
      expiresAt: EXPIRES_AT,
    });
    expect(mockCheckPremiumStatus).not.toHaveBeenCalled();
  });
});

describe('premium-store purchase and restore flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
    mockCheckPremiumStatus.mockResolvedValue({
      isPremium: true,
      plan: 'premium',
      expiresAt: EXPIRES_AT,
    });
    resetPremiumStore();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('purchase calls RevenueCat package purchase, refreshes premium status, and clears loading', async () => {
    const pkg = { identifier: 'annual' };
    mockPurchasePackage.mockResolvedValue(undefined);

    const purchasePromise = usePremiumStore.getState().purchase(pkg);
    expect(usePremiumStore.getState().isLoading).toBe(true);
    await purchasePromise;

    expect(mockPurchasePackage).toHaveBeenCalledWith(pkg);
    expect(mockCheckPremiumStatus).toHaveBeenCalledTimes(1);
    expect(usePremiumStore.getState()).toMatchObject({
      isLoading: false,
      isPremium: true,
      plan: 'premium',
      expiresAt: EXPIRES_AT,
    });
  });

  it('purchase clears loading and preserves free state when RevenueCat purchase throws', async () => {
    mockPurchasePackage.mockRejectedValueOnce(new Error('cancelled'));

    await usePremiumStore.getState().purchase({ identifier: 'annual' });

    expect(usePremiumStore.getState()).toMatchObject({
      isLoading: false,
      isPremium: false,
      plan: 'free',
      expiresAt: null,
    });
    expect(mockCheckPremiumStatus).not.toHaveBeenCalled();
  });

  it('restore calls RevenueCat restore, refreshes premium status, and clears loading', async () => {
    mockRestorePurchases.mockResolvedValue(undefined);

    const restorePromise = usePremiumStore.getState().restore();
    expect(usePremiumStore.getState().isLoading).toBe(true);
    await restorePromise;

    expect(mockRestorePurchases).toHaveBeenCalledTimes(1);
    expect(mockCheckPremiumStatus).toHaveBeenCalledTimes(1);
    expect(usePremiumStore.getState()).toMatchObject({
      isLoading: false,
      isPremium: true,
      plan: 'premium',
      expiresAt: EXPIRES_AT,
    });
  });

  it('restore clears loading and preserves free state when RevenueCat restore throws', async () => {
    mockRestorePurchases.mockRejectedValueOnce(new Error('network'));

    await usePremiumStore.getState().restore();

    expect(usePremiumStore.getState()).toMatchObject({
      isLoading: false,
      isPremium: false,
      plan: 'free',
      expiresAt: null,
    });
    expect(mockCheckPremiumStatus).not.toHaveBeenCalled();
  });
});
