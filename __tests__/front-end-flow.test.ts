import { DEFAULT_EXPORT_OPTIONS } from '../src/lib/calendar/ics-generator';
import type { SleepPlan } from '../src/lib/circadian/types';

const replaceMock = jest.fn();
const pushMock = jest.fn();
const backMock = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    replace: replaceMock,
    push: pushMock,
    back: backMock,
  },
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///cache/',
  EncodingType: { UTF8: 'utf8' },
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  readAsStringAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/lib/notifications/notification-service', () => ({
  schedulePlanNotifications: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/lib/calendar/plan-write-service', () => ({
  writeChangedBlocks: jest.fn().mockResolvedValue(undefined),
}));

const mockPlan: SleepPlan = {
  blocks: [
    {
      id: 'sleep-1',
      type: 'main-sleep',
      start: new Date('2026-04-29T08:00:00Z'),
      end: new Date('2026-04-29T15:30:00Z'),
      label: 'Main Sleep',
      description: 'Core recovery sleep',
      priority: 1,
    },
  ],
  startDate: new Date('2026-04-29T00:00:00Z'),
  endDate: new Date('2026-04-30T00:00:00Z'),
  classifiedDays: [],
  stats: {
    avgSleepHours: 7.5,
    nightShiftCount: 1,
    hardTransitions: 0,
    circadianDebtScore: 10,
  },
};

describe('front-end onboarding to calendar export wiring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exports the generated sleep plan as a shareable ICS file', async () => {
    const { sharePlanICS } = await import('../src/hooks/useExport');
    const FileSystem = await import('expo-file-system/legacy');
    const Sharing = await import('expo-sharing');

    const exported = await sharePlanICS(mockPlan, DEFAULT_EXPORT_OPTIONS);

    expect(exported).toBe(true);
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
      'file:///cache/ShiftWell-Sleep-Plan.ics',
      expect.stringContaining('BEGIN:VCALENDAR'),
      { encoding: 'utf8' },
    );
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      'file:///cache/ShiftWell-Sleep-Plan.ics',
      expect.objectContaining({
        mimeType: 'text/calendar',
        dialogTitle: 'Export Sleep Plan',
      }),
    );
  });

  it('marks onboarding complete before leaving the calendar onboarding screen', () => {
    const source = require('fs').readFileSync(
      require('path').join(__dirname, '../app/(onboarding)/calendar.tsx'),
      'utf8',
    );

    expect(source).toContain('const completeOnboarding = useUserStore');
    expect(source).toMatch(/async function finishOnboarding\(\) \{[\s\S]*completeOnboarding\(\);[\s\S]*router\.replace\('\/\(tabs\)'\);/);
  });

  it('routes incomplete users to the concrete welcome screen on cold start', () => {
    const source = require('fs').readFileSync(
      require('path').join(__dirname, '../app/index.tsx'),
      'utf8',
    );

    expect(source).toContain("router.replace('/(onboarding)/welcome')");
    expect(source).not.toContain("router.replace('/onboarding')");
  });

  it('continues from import back to onboarding plan-ready before first-run completion', () => {
    const source = require('fs').readFileSync(
      require('path').join(__dirname, '../app/import.tsx'),
      'utf8',
    );

    expect(source).toContain("router.replace(onboardingComplete ? '/(tabs)/schedule' : '/(onboarding)/plan-ready')");
    expect(source).toContain("title={onboardingComplete ? 'Back to Settings' : 'Back'}");
  });
});
