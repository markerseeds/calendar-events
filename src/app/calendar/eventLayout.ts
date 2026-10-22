import { addDays, startOfDay } from 'date-fns';
import type { CalendarEvent } from '@/app/events/types';

export const MINUTES_PER_DAY = 24 * 60;

/**
 * Minutes from the start of `day` to `date`, clamped to that day (0–1440).
 * Uses the clock time rather than elapsed time, so events still line up with
 * the hour labels on daylight-saving days.
 */
export function minutesIntoDay(date: Date, day: Date): number {
  const dayStart = startOfDay(day);
  if (date <= dayStart) return 0;
  if (date >= addDays(dayStart, 1)) return MINUTES_PER_DAY;
  return date.getHours() * 60 + date.getMinutes();
}

export interface PositionedEvent {
  event: CalendarEvent;
  column: number;
  columnCount: number;
}

/**
 * Places one day's events in side-by-side columns. Events that overlap,
 * directly or through a chain, form a group. Each event takes the first
 * column that is free when it starts, and every event in a group shares the
 * group's column count, so they split the width evenly.
 */
export function layoutDayEvents(events: CalendarEvent[]): PositionedEvent[] {
  // Earliest first; for the same start, the longer event goes on the left.
  const sorted = [...events].sort(
    (a, b) =>
      a.start.getTime() - b.start.getTime() ||
      b.end.getTime() - a.end.getTime(),
  );

  const positioned: PositionedEvent[] = [];
  let group: PositionedEvent[] = [];
  let columnEnds: Date[] = []; // when the last event in each column ends
  let groupEnd = -Infinity;

  function closeGroup() {
    for (const item of group) item.columnCount = columnEnds.length;
    positioned.push(...group);
    group = [];
    columnEnds = [];
  }

  for (const event of sorted) {
    if (event.start.getTime() >= groupEnd) closeGroup();

    let column = columnEnds.findIndex((end) => end <= event.start);
    if (column === -1) column = columnEnds.length;
    columnEnds[column] = event.end;

    group.push({ event, column, columnCount: 0 });
    groupEnd = Math.max(groupEnd, event.end.getTime());
  }
  closeGroup();

  return positioned;
}
