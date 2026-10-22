import { validateEvent } from './validation';

const valid = {
  name: 'Fire drill',
  type: 'training',
  start: '2026-06-25T10:00',
  end: '2026-06-25T11:00',
};

describe('validateEvent', () => {
  it('returns no errors for a valid event', () => {
    expect(validateEvent(valid)).toEqual({});
  });

  it.each(['', '   '])('asks for a name when it is %p', (name) => {
    expect(validateEvent({ ...valid, name })).toEqual({ name: 'Enter a name' });
  });

  it('rejects missing or half-typed dates', () => {
    expect(validateEvent({ ...valid, start: '', end: '2026-06-25T1' })).toEqual(
      {
        start: 'Enter a valid start date and time',
        end: 'Enter a valid end date and time',
      },
    );
  });

  it.each([
    ['the same as', '2026-06-25T10:00'],
    ['before', '2026-06-25T09:00'],
  ])('rejects an end %s the start', (_label, end) => {
    expect(validateEvent({ ...valid, end })).toEqual({
      end: 'End must be after the start',
    });
  });
});
