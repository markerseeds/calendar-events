import type { CalendarEvent } from '@/app/events/types';
import { layoutDayEvents, minutesIntoDay } from './eventLayout';

const june = (day: number, hour: number, minute = 0) =>
  new Date(2026, 5, day, hour, minute);

function event(name: string, start: Date, end: Date): CalendarEvent {
  return { id: name, name, type: 'meeting', start, end };
}

/** Lays out the events and returns each one's [column, columnCount] by name. */
function columnsOf(events: CalendarEvent[]) {
  return Object.fromEntries(
    layoutDayEvents(events).map(({ event, column, columnCount }) => [
      event.name,
      [column, columnCount],
    ]),
  );
}

describe('layoutDayEvents', () => {
  it('gives a lone event the full width', () => {
    expect(columnsOf([event('A', june(22, 9), june(22, 10))])).toEqual({
      A: [0, 1],
    });
  });

  it('puts overlapping events side by side', () => {
    expect(
      columnsOf([
        event('A', june(22, 9), june(22, 10)),
        event('B', june(22, 9, 30), june(22, 10, 30)),
      ]),
    ).toEqual({ A: [0, 2], B: [1, 2] });
  });

  it('lets back-to-back events share a column', () => {
    expect(
      columnsOf([
        event('A', june(22, 9), june(22, 10)),
        event('B', june(22, 10), june(22, 11)),
      ]),
    ).toEqual({ A: [0, 1], B: [0, 1] });
  });

  it('reuses a freed column within a chain of overlaps', () => {
    expect(
      columnsOf([
        event('A', june(22, 9), june(22, 10)),
        event('B', june(22, 9, 30), june(22, 10, 30)),
        event('C', june(22, 10), june(22, 11)),
      ]),
    ).toEqual({ A: [0, 2], B: [1, 2], C: [0, 2] });
  });
});

describe('minutesIntoDay', () => {
  it('clamps an overnight event to the day being drawn', () => {
    const day = new Date(2026, 5, 23);

    expect(minutesIntoDay(june(22, 21), day)).toBe(0);
    expect(minutesIntoDay(june(23, 6, 30), day)).toBe(390);
    expect(minutesIntoDay(june(24, 0), day)).toBe(1440);
  });
});
