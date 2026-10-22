import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isSameYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { getEventType, type CalendarEvent } from '@/app/events/types';

// Weeks start on Monday, as in New Zealand.
const WEEK_STARTS_ON = 1;

/** Every day in the month grid: whole weeks from the one holding the 1st to the one holding the last day. */
export function getMonthDays(date: Date): Date[] {
  return eachDayOfInterval({
    start: startOfWeek(startOfMonth(date), { weekStartsOn: WEEK_STARTS_ON }),
    end: endOfWeek(endOfMonth(date), { weekStartsOn: WEEK_STARTS_ON }),
  });
}

/** The seven days of the week containing `date`. */
export function getWeekDays(date: Date): Date[] {
  return eachDayOfInterval({
    start: startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON }),
    end: endOfWeek(date, { weekStartsOn: WEEK_STARTS_ON }),
  });
}

/** The events on `day`, including ones that start earlier or end later, by start time. */
export function getEventsForDay(
  events: CalendarEvent[],
  day: Date,
): CalendarEvent[] {
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);
  return events
    .filter((event) => event.start < dayEnd && event.end > dayStart)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** e.g. "22 – 28 Jun 2026", "29 Jun – 5 Jul 2026", "28 Dec 2026 – 3 Jan 2027". */
export function formatWeekTitle(date: Date): string {
  const start = startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });
  const end = addDays(start, 6);
  const endText = format(end, 'd MMM yyyy');
  if (isSameMonth(start, end)) return `${format(start, 'd')} – ${endText}`;
  if (isSameYear(start, end)) return `${format(start, 'd MMM')} – ${endText}`;
  return `${format(start, 'd MMM yyyy')} – ${endText}`;
}

export function formatDayLabel(date: Date): string {
  return format(date, 'EEEE, d MMMM yyyy');
}

/** "09:00 – 09:30" within a day; "22 Jun 21:00 – 23 Jun 06:00" across days. */
export function formatTimeRange(
  start: Date,
  end: Date,
  separator = ' – ',
): string {
  // An event ending at the next midnight still reads as a same-day event ("23:00 – 00:00").
  const sameDay =
    isSameDay(start, end) ||
    end.getTime() === addDays(startOfDay(start), 1).getTime();
  const pattern = sameDay ? 'HH:mm' : 'd MMM HH:mm';
  return `${format(start, pattern)}${separator}${format(end, pattern)}`;
}

/** The name screen readers hear: "Weekly safety briefing, Meeting, 09:00 to 09:30". */
export function formatEventLabel(event: CalendarEvent): string {
  console.log('formatEventLabel', event);
  const type = getEventType(event.type).label;
  return `${event.name}, ${type}, ${formatTimeRange(event.start, event.end, ' to ')}`;
}
