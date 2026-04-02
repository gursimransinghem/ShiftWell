import { useUserStore } from '../../src/store/user-store';
import { DEFAULT_PROFILE } from '../../src/lib/circadian/types';

// Reset store before each test
beforeEach(() => {
  useUserStore.setState({
    profile: { ...DEFAULT_PROFILE },
    onboardingComplete: false,
    healthkitConnected: false,
  });
});

describe('useUserStore', () => {
  it('initializes with DEFAULT_PROFILE', () => {
    const { profile } = useUserStore.getState();
    expect(profile.chronotype).toBe('intermediate');
    expect(profile.sleepNeed).toBe(7.5);
    expect(profile.workAddress).toBe('');
    expect(profile.amRoutine).toEqual([]);
    expect(profile.pmRoutine).toEqual([]);
  });

  it('setProfile merges partial updates (ONB-01: chronotype)', () => {
    useUserStore.getState().setProfile({ chronotype: 'early' });
    expect(useUserStore.getState().profile.chronotype).toBe('early');
    expect(useUserStore.getState().profile.sleepNeed).toBe(7.5); // unchanged
  });

  it('setProfile saves household data (ONB-05)', () => {
    useUserStore.getState().setProfile({
      householdSize: 3,
      hasYoungChildren: true,
      hasPets: true,
    });
    const { profile } = useUserStore.getState();
    expect(profile.householdSize).toBe(3);
    expect(profile.hasYoungChildren).toBe(true);
    expect(profile.hasPets).toBe(true);
  });

  it('setProfile saves sleep preferences (ONB-06)', () => {
    useUserStore.getState().setProfile({
      sleepNeed: 8,
      napPreference: false,
      caffeineHalfLife: 7,
    });
    const { profile } = useUserStore.getState();
    expect(profile.sleepNeed).toBe(8);
    expect(profile.napPreference).toBe(false);
    expect(profile.caffeineHalfLife).toBe(7);
  });

  it('setProfile saves AM routine (ONB-02)', () => {
    const routine = [
      { id: 'wake', label: 'Wake up', icon: '\u23F0', durationMinutes: 0, enabled: true },
      { id: 'shower', label: 'Shower', icon: '\u{1F6BF}', durationMinutes: 15, enabled: true },
    ];
    useUserStore.getState().setProfile({ amRoutine: routine });
    expect(useUserStore.getState().profile.amRoutine).toHaveLength(2);
    expect(useUserStore.getState().profile.amRoutine[0].id).toBe('wake');
  });

  it('setProfile saves PM routine (ONB-03)', () => {
    const routine = [
      { id: 'dinner', label: 'Dinner', icon: '\u{1F37D}\uFE0F', durationMinutes: 30, enabled: true },
    ];
    useUserStore.getState().setProfile({ pmRoutine: routine });
    expect(useUserStore.getState().profile.pmRoutine).toHaveLength(1);
  });

  it('setProfile saves addresses and commute (ONB-04)', () => {
    useUserStore.getState().setProfile({
      workAddress: '123 Hospital Dr',
      homeAddress: '456 Home St',
      commuteDuration: 45,
    });
    const { profile } = useUserStore.getState();
    expect(profile.workAddress).toBe('123 Hospital Dr');
    expect(profile.homeAddress).toBe('456 Home St');
    expect(profile.commuteDuration).toBe(45);
  });

  it('completeOnboarding sets flag', () => {
    useUserStore.getState().completeOnboarding();
    expect(useUserStore.getState().onboardingComplete).toBe(true);
  });

  it('resetOnboarding restores defaults', () => {
    useUserStore.getState().setProfile({ chronotype: 'late', workAddress: '123' });
    useUserStore.getState().completeOnboarding();
    useUserStore.getState().resetOnboarding();
    const state = useUserStore.getState();
    expect(state.profile.chronotype).toBe('intermediate');
    expect(state.profile.workAddress).toBe('');
    expect(state.onboardingComplete).toBe(false);
  });
});
