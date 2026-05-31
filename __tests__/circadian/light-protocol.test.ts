import { differenceInMinutes } from 'date-fns';
import { generateLightProtocol } from '../../src/lib/circadian/light-protocol';
import type {
  CircadianPhase,
  ClassifiedDay,
  PlanBlock,
  UserProfile,
} from '../../src/lib/circadian/types';
import { DEFAULT_PROFILE } from '../../src/lib/circadian/types';

const dayId = '2026-03-15';

const nightDay: ClassifiedDay = {
  date: new Date(`${dayId}T00:00:00`),
  dayType: 'work-night',
  shift: {
    id: 'night-shift',
    title: 'Night Shift',
    start: new Date(`${dayId}T19:00:00`),
    end: new Date('2026-03-16T07:00:00'),
    shiftType: 'night',
  },
  personalEvents: [],
};

const mainSleep: PlanBlock = {
  id: 'main-sleep',
  type: 'main-sleep',
  start: new Date(`${dayId}T08:00:00`),
  end: new Date(`${dayId}T16:00:00`),
  label: 'Main Sleep',
  description: 'Daytime sleep before night shift',
  priority: 1,
};

const profile: UserProfile = {
  ...DEFAULT_PROFILE,
  commuteDuration: 45,
};

const latePhase: CircadianPhase = {
  dlmoHour: 21,
  cbtMinHour: 4,
  confidenceHours: 1,
  source: 'user-tuned',
};

const shortNightDay: ClassifiedDay = {
  ...nightDay,
  shift: {
    ...nightDay.shift!,
    end: new Date('2026-03-16T00:30:00'),
  },
};

describe('generateLightProtocol — work-night semantic branches', () => {
  it('hold mode emits a full-shift alertness light-seek block', () => {
    const blocks = generateLightProtocol(nightDay, profile, [mainSleep], undefined, 'hold');
    const seek = blocks.find((block) => block.id === `${dayId}-light-seek-shift`);

    expect(seek).toMatchObject({
      type: 'light-seek',
      label: 'Bright Light (Alertness)',
      start: nightDay.shift!.start,
      end: nightDay.shift!.end,
    });
    expect(blocks.some((block) => block.id === `${dayId}-light-avoid-shift`)).toBe(false);
  });

  it('adapt mode without phase falls back to shift midpoint for bright-light cutoff', () => {
    const blocks = generateLightProtocol(nightDay, profile, [mainSleep]);
    const seek = blocks.find((block) => block.id === `${dayId}-light-seek-shift`);
    const dim = blocks.find((block) => block.id === `${dayId}-light-avoid-shift`);

    expect(seek).toBeDefined();
    expect(dim).toBeDefined();
    expect(seek!.start).toEqual(nightDay.shift!.start);
    expect(seek!.end).toEqual(new Date('2026-03-16T01:00:00'));
    expect(dim!.start).toEqual(seek!.end);
    expect(dim!.end).toEqual(nightDay.shift!.end);
  });

  it('adapt mode clamps bright light to shift end when the cutoff is after the shift', () => {
    const blocks = generateLightProtocol(shortNightDay, profile, [mainSleep], latePhase, 'adapt');
    const seek = blocks.find((block) => block.id === `${dayId}-light-seek-shift`);

    expect(seek).toMatchObject({
      type: 'light-seek',
      start: shortNightDay.shift!.start,
      end: shortNightDay.shift!.end,
    });
    expect(blocks.some((block) => block.id === `${dayId}-light-avoid-shift`)).toBe(false);
  });

  it('commute light-avoid block duration follows profile.commuteDuration', () => {
    const blocks = generateLightProtocol(nightDay, profile, [mainSleep], latePhase, 'adapt');
    const commute = blocks.find((block) => block.id === `${dayId}-light-avoid-commute`);

    expect(commute).toMatchObject({
      type: 'light-avoid',
      label: 'Dark Sunglasses (Commute)',
      start: nightDay.shift!.end,
    });
    expect(differenceInMinutes(commute!.end, commute!.start)).toBe(profile.commuteDuration);
  });
});
