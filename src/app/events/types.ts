export interface CalendarEvent {
  id: string;
  name: string;
  type: string;
  start: Date;
  end: Date;
}

/** An event without its id: what the form creates or edits. */
export type EventInput = Omit<CalendarEvent, 'id'>;

/** The event types for selection */
export const EVENT_TYPES = [
  { id: 'meeting', label: 'Meeting', color: '#2E6B3F' },
  { id: 'training', label: 'Training', color: '#3949AB' },
];

/** Unknown types (e.g. from new data) still show, in grey. */
export function getEventType(type: string) {
  return (
    EVENT_TYPES.find((eventType) => eventType.id === type) ?? {
      id: type,
      label: type,
      color: '#616161',
    }
  );
}
