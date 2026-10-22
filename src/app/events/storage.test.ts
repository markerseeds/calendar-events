import sampleEvents from '@/data/events.json';
import { loadEvents, saveEvents, STORAGE_KEY } from './storage';

function saveRaw(value: unknown) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

beforeEach(() => {
  localStorage.clear();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('loadEvents', () => {
  it('uses the sample events on the first visit', () => {
    const events = loadEvents();

    expect(events).toHaveLength(4);
    expect(events[0]).toEqual({
      id: 'evt-001',
      type: 'meeting',
      name: 'Weekly safety briefing',
      start: new Date(2026, 5, 22, 9, 0),
      end: new Date(2026, 5, 22, 9, 30),
    });
  });

  it('prefers the saved events over the sample events', () => {
    saveRaw([
      {
        id: 'saved-1',
        type: 'meeting',
        name: 'Saved meeting',
        startDate: '2026-07-01T09:00:00',
        endDate: '2026-07-01T10:00:00',
      },
    ]);

    expect(loadEvents().map((event) => event.name)).toEqual(['Saved meeting']);
  });

  it('keeps an empty saved list empty', () => {
    saveRaw([]);

    expect(loadEvents()).toEqual([]);
  });

  it.each([
    ['is not JSON', 'not json'],
    ['is not a list', '{"a":1}'],
  ])(
    'falls back to the sample events when the saved value %s',
    (_label, value) => {
      localStorage.setItem(STORAGE_KEY, value);

      expect(loadEvents()).toHaveLength(4);
    },
  );

  it('skips invalid records and keeps the rest', () => {
    saveRaw([
      sampleEvents[0],
      null,
      { ...sampleEvents[1], name: '   ' },
      { ...sampleEvents[2], endDate: 'soon' },
      { ...sampleEvents[3], endDate: sampleEvents[3].startDate },
    ]);

    expect(loadEvents().map((event) => event.id)).toEqual(['evt-001']);
  });
});

describe('saveEvents', () => {
  it('saves events in the same format as events.json', () => {
    saveEvents(loadEvents());

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual(
      sampleEvents,
    );
  });
});
