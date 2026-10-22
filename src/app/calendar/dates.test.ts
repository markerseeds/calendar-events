import type { CalendarEvent } from '@/app/events/types';
import { formatWeekTitle, getEventsForDay, getMonthDays } from './dates';

const june = (day: number, hour = 0) => new Date(2026, 5, day, hour);

function event(name: string, start: Date, end: Date): CalendarEvent {
  return { id: name, name, type: 'meeting', start, end };
}

describe('getMonthDays', () => {
  it('covers whole Monday-to-Sunday weeks', () => {
    const days = getMonthDays(new Date(2026, 5, 15));

    expect(days).toHaveLength(35);
    expect(days[0]).toEqual(new Date(2026, 5, 1));
    expect(days[34]).toEqual(new Date(2026, 6, 5));
  });

  it('adds a sixth row when the month needs it', () => {
    // August 2026 starts on a Saturday and ends on a Monday.
    const days = getMonthDays(new Date(2026, 7, 10));

    expect(days).toHaveLength(42);
    expect(days[0]).toEqual(new Date(2026, 6, 27));
    expect(days[41]).toEqual(new Date(2026, 8, 6));
  });
});

describe('getEventsForDay', () => {
  it('shows an overnight event on both of its days', () => {
    const nightShift = event('Night shift', june(22, 21), june(23, 6));

    expect(getEventsForDay([nightShift], june(22))).toEqual([nightShift]);
    expect(getEventsForDay([nightShift], june(23))).toEqual([nightShift]);
    expect(getEventsForDay([nightShift], june(24))).toEqual([]);
  });

  it('does not spill onto the next day when an event ends at midnight', () => {
    const late = event('Late shift', june(22, 18), june(23));

    expect(getEventsForDay([late], june(22))).toEqual([late]);
    expect(getEventsForDay([late], june(23))).toEqual([]);
  });
});

describe('formatWeekTitle', () => {
  it.each([
    ['within one month', new Date(2026, 5, 24), '22 – 28 Jun 2026'],
    ['across two months', new Date(2026, 6, 1), '29 Jun – 5 Jul 2026'],
    ['across two years', new Date(2026, 11, 31), '28 Dec 2026 – 3 Jan 2027'],
  ])('describes a week %s', (_label, date, title) => {
    expect(formatWeekTitle(date)).toBe(title);
  });
});
