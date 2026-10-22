import { create } from 'zustand';
import { loadEvents, saveEvents } from './storage';
import type { CalendarEvent, EventInput } from './types';

interface EventStore {
  events: CalendarEvent[];
  load: () => void;
  addEvent: (input: EventInput) => void;
  updateEvent: (id: string, input: EventInput) => void;
  deleteEvent: (id: string) => void;
}

// Zustand store for events. The store is persisted to localStorage.
export const useEventStore = create<EventStore>()((set, get) => ({
  events: [],

  load: () => set({ events: loadEvents() }),

  addEvent: (input) => {
    const events = [...get().events, { id: crypto.randomUUID(), ...input }];
    saveEvents(events);
    set({ events });
  },

  updateEvent: (id, input) => {
    const events = get().events.map((event) =>
      event.id === id ? { id, ...input } : event,
    );
    saveEvents(events);
    set({ events });
  },

  deleteEvent: (id) => {
    const events = get().events.filter((event) => event.id !== id);
    saveEvents(events);
    set({ events });
  },
}));
