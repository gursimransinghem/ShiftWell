import { classifyShiftType, classifyDays, detectPatterns } from '../../src/lib/circadian/classify-shifts';
import type { ShiftEvent } from '../../src/lib/circadian/types';

describe('classifyShiftType', () => {
  it('classifies a morning start as day shift', () => {
    const start = new Date('2026-03-15T07:00:00');
    const end = new Date('2026-03-15T15:00:00');
    expect(classifyShiftType(start, end)).toBe('day');
  });

  it('classifies an afternoon start as evening shift', () => {
    const start = new Date('2026-03-15T14:00:00');
    const end = new Date('2026-03-15T23:00:00');
    expect(classifyShiftType(start, end)).toBe('evening');
  });

  it('classifies an evening start as night shift', () => {
    const start = new Date('2026-03-15T19:00:00');
    const end = new Date('2026-03-16T07:00:00');
    expect(classifyShiftType(start, end)).toBe('night');
  });

  it('classifies an early morning start (3am) as night shift', () => {
    const start = new Date('2026-03-15T03:00:00');
    const end = new Date('2026-03-15T11:00:00');
    expect(classifyShiftType(start, end)).toBe('night');
  });

  it('classifies a 24-hour shift as extended', () => {
    const start = new Date('2026-03-15T07:00:00');
    const end = new Date('2026-03-16T07:00:00');
    expect(classifyShiftType(start, end)).toBe('extended');
  });

  it('classifies an 18-hour shift as extended', () => {
    const start = new Date('2026-03-15T06:00:00');
    const end = new Date('2026-03-16T00:00:00');
    expect(classifyShiftType(start, end)).toBe('extended');
  });
});

describe('classifyDays', () => {
  const makeShift = (
    id: string,
    startStr: string,
    endStr: string,
  ): ShiftEvent => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    return {
      id,
      title: `Shift ${id}`,
      start,
      end,
      shiftType: classifyShiftType(start, end),
    };
  };

  it('classifies a simple 3-night stretch correctly', () => {
    const shifts: ShiftEvent[] = [
      makeShift('1', '2026-03-15T19:00:00', '2026-03-16T07:00:00'),
      makeShift('2', '2026-03-16T19:00:00', '2026-03-17T07:00:00'),
      makeShift('3', '2026-03-17T19:00:00', '2026-03-18T07:00:00'),
    ];

    const startDate = new Date('2026-03-14T00:00:00');
    const endDate = new Date('2026-03-19T00:00:00');

    const classified = classifyDays(startDate, endDate, shifts);

    // Mar 14: day before nights → transition-to-nights
    expect(classified[0].dayType).toBe('transition-to-nights');
    // Mar 15: night shift
    expect(classified[1].dayType).toBe('work-night');
    // Mar 16: night shift
    expect(classified[2].dayType).toBe('work-night');
    // Mar 17: night shift
    expect(classified[3].dayType).toBe('work-night');
    // Mar 18: the overnight shift from Mar 17 bleeds into Mar 18,
    // so the shift detector assigns Mar 18 as work-night too (shift ends 07:00).
    // Mar 19: first fully clear day after nights → recovery
    expect(classified[4].dayType).toBe('work-night');
    expect(classified[5].dayType).toBe('recovery');
  });

  it('classifies day shifts correctly', () => {
    const shifts: ShiftEvent[] = [
      makeShift('1', '2026-03-15T07:00:00', '2026-03-15T19:00:00'),
      makeShift('2', '2026-03-16T07:00:00', '2026-03-16T19:00:00'),
    ];

    const startDate = new Date('2026-03-15T00:00:00');
    const endDate = new Date('2026-03-16T00:00:00');

    const classified = classifyDays(startDate, endDate, shifts);

    expect(classified[0].dayType).toBe('work-day');
    expect(classified[1].dayType).toBe('work-day');
  });

  it('handles mixed shift types', () => {
    const shifts: ShiftEvent[] = [
      makeShift('1', '2026-03-15T07:00:00', '2026-03-15T15:00:00'), // day
      makeShift('2', '2026-03-16T14:00:00', '2026-03-16T23:00:00'), // evening
      makeShift('3', '2026-03-17T19:00:00', '2026-03-18T07:00:00'), // night
    ];

    const startDate = new Date('2026-03-15T00:00:00');
    const endDate = new Date('2026-03-17T00:00:00');

    const classified = classifyDays(startDate, endDate, shifts);

    expect(classified[0].dayType).toBe('work-day');
    expect(classified[1].dayType).toBe('work-evening');
    expect(classified[2].dayType).toBe('work-night');
  });

  it('handles empty shifts (all days off)', () => {
    const startDate = new Date('2026-03-15T00:00:00');
    const endDate = new Date('2026-03-17T00:00:00');

    const classified = classifyDays(startDate, endDate, []);

    expect(classified).toHaveLength(3);
    classified.forEach((day) => {
      expect(day.dayType).toBe('off');
    });
  });
});

describe('detectPatterns', () => {
  it('detects night stretch lengths', () => {
    const shifts: ShiftEvent[] = [
      { id: '1', title: 'Night', start: new Date('2026-03-15T19:00'), end: new Date('2026-03-16T07:00'), shiftType: 'night' },
      { id: '2', title: 'Night', start: new Date('2026-03-16T19:00'), end: new Date('2026-03-17T07:00'), shiftType: 'night' },
      { id: '3', title: 'Night', start: new Date('2026-03-17T19:00'), end: new Date('2026-03-18T07:00'), shiftType: 'night' },
    ];

    const startDate = new Date('2026-03-14T00:00:00');
    const endDate = new Date('2026-03-19T00:00:00');

    const classified = classifyDays(startDate, endDate, shifts);
    const patterns = detectPatterns(classified);

    // 3 night shifts + the bleed-over day = 4 classified night-work days
    expect(patterns.nightStretchLengths).toContain(4);
    expect(patterns.hardTransitions).toBeGreaterThan(0);
  });
});
