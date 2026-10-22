import { isValid, parseISO } from 'date-fns';

/** The form's field values, exactly as the inputs hold them. */
export interface EventFormValues {
  name: string;
  type: string;
  start: string;
  end: string;
}

export type EventFormErrors = Partial<Record<keyof EventFormValues, string>>;

export function validateEvent(values: EventFormValues): EventFormErrors {
  const errors: EventFormErrors = {};
  const start = parseISO(values.start);
  const end = parseISO(values.end);

  if (!values.name.trim()) {
    errors.name = 'Enter a name';
  }
  if (!isValid(start)) {
    errors.start = 'Enter a valid start date and time';
  }
  if (!isValid(end)) {
    errors.end = 'Enter a valid end date and time';
  } else if (isValid(start) && end <= start) {
    errors.end = 'End must be after the start';
  }

  return errors;
}
