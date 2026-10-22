import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { format, parseISO } from 'date-fns';
import { useState, type FormEvent } from 'react';
import { EVENT_TYPES, getEventType, type EventInput } from './types';
import {
  validateEvent,
  type EventFormErrors,
  type EventFormValues,
} from './validation';

// The value format of <input type="datetime-local">.
const INPUT_FORMAT = "yyyy-MM-dd'T'HH:mm";

const SAVE_ERROR =
  "Couldn't save to browser storage. Free up space or try again.";

interface EventDialogProps {
  /** The event to edit, or a new event that has no id yet. */
  event: EventInput & { id?: string };
  onSave: (input: EventInput) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function EventDialog({
  event,
  onSave,
  onDelete,
  onClose,
}: EventDialogProps) {
  const [values, setValues] = useState<EventFormValues>({
    name: event.name,
    type: event.type,
    start: format(event.start, INPUT_FORMAT),
    end: format(event.end, INPUT_FORMAT),
  });
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [saveError, setSaveError] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const isNew = !event.id;

  // An event from other data can have a type the app doesn't know; offer it too.
  const typeOptions = EVENT_TYPES.some((type) => type.id === values.type)
    ? EVENT_TYPES
    : [...EVENT_TYPES, getEventType(values.type)];

  function handleChange(field: keyof EventFormValues, value: string) {
    setValues({ ...values, [field]: value });
    setErrors({ ...errors, [field]: undefined });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const newErrors = validateEvent(values);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      onSave({
        name: values.name.trim(),
        type: values.type,
        start: parseISO(values.start),
        end: parseISO(values.end),
      });
    } catch {
      setSaveError(SAVE_ERROR);
    }
  }

  function handleDelete() {
    setConfirmingDelete(false);
    try {
      onDelete();
    } catch {
      setSaveError(SAVE_ERROR);
    }
  }

  return (
    <>
      <Dialog open onClose={onClose} fullWidth maxWidth="sm">
        {/* noValidate: show our messages, not the browser's pop-ups.
            display: contents keeps the dialog's own layout and scrolling. */}
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          sx={{ display: 'contents' }}
        >
          <DialogTitle>{isNew ? 'New event' : 'Edit event'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              {saveError && <Alert severity="error">{saveError}</Alert>}
              <TextField
                label="Name"
                value={values.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={Boolean(errors.name)}
                helperText={errors.name}
                autoFocus
                fullWidth
              />
              <TextField
                select
                label="Type"
                value={values.type}
                onChange={(e) => handleChange('type', e.target.value)}
                fullWidth
              >
                {typeOptions.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  type="datetime-local"
                  label="Start"
                  value={values.start}
                  onChange={(e) => handleChange('start', e.target.value)}
                  error={Boolean(errors.start)}
                  helperText={errors.start}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  type="datetime-local"
                  label="End"
                  value={values.end}
                  onChange={(e) => handleChange('end', e.target.value)}
                  error={Boolean(errors.end)}
                  helperText={errors.end}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            {!isNew && (
              <Button
                color="error"
                onClick={() => setConfirmingDelete(true)}
                sx={{ mr: 'auto' }}
              >
                Delete
              </Button>
            )}
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
      >
        <DialogTitle>Delete event?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            “{event.name}” will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmingDelete(false)} autoFocus>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
