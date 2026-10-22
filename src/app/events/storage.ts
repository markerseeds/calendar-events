import { format, isValid, parseISO } from 'date-fns';
import { z } from 'zod';
import sampleEvents from '@/data/events.json';
import type { CalendarEvent } from './types';

export const STORAGE_KEY = 'calendar-events';

// Dates are saved like the dataset's: local time, no time zone.
const DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";

// An event as it is stored in events.json and in localStorage.
const eventRecordSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  name: z.string().trim().min(1),
  startDate: z.string(),
  endDate: z.string(),
});

/**
 * Turns stored records into events. Broken records are skipped (and logged)
 * so one bad entry can't break the whole calendar.
 */
export function parseEvents(records: unknown[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const record of records) {
    const result = eventRecordSchema.safeParse(record);
    if (!result.success) {
      console.warn('Skipping an invalid event', record);
      continue;
    }

    const { id, type, name, startDate, endDate } = result.data;
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    if (!isValid(start) || !isValid(end) || end <= start) {
      console.warn('Skipping an event with invalid dates', record);
      continue;
    }

    events.push({ id, type, name, start, end });
  }

  return events;
}

/**
 * Loads the saved events. On the first visit, or when the saved data can't be
 * read, it falls back to the sample events from events.json.
 */
export function loadEvents(): CalendarEvent[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const records = JSON.parse(saved);
      if (Array.isArray(records)) return parseEvents(records);
    }
  } catch (error) {
    // Storage is blocked or the saved value isn't valid JSON.
    console.error("Couldn't read the saved events", error);
  }
  return parseEvents(sampleEvents);
}

/** Saves events in the same format as events.json. Throws if storage is full. */
export function saveEvents(events: CalendarEvent[]) {
  const records = events.map((event) => ({
    id: event.id,
    type: event.type,
    name: event.name,
    startDate: format(event.start, DATE_FORMAT),
    endDate: format(event.end, DATE_FORMAT),
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}
