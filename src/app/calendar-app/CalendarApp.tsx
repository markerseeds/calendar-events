'use client';

import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Snackbar from '@mui/material/Snackbar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { addHours, setHours, startOfDay } from 'date-fns';
import { useEffect, useState } from 'react';
import {
  CalendarToolbar,
  type CalendarView,
} from '@/app/calendar/CalendarToolbar';
import { MonthView } from '@/app/calendar/MonthView';
import { WeekView } from '@/app/calendar/WeekView';
import { EventDialog } from '@/app/events/EventDialog';
import { useEventStore } from '@/app/events/eventStore';
import type { EventInput } from '@/app/events/types';

type Draft = EventInput & { id?: string };

interface CalendarAppProps {
  // The date the calendar shows first. Defaults to today.
  initialDate?: Date;
}

export function CalendarApp({ initialDate }: CalendarAppProps) {
  const { events, load, addEvent, updateEvent, deleteEvent } = useEventStore();
  const [view, setView] = useState<CalendarView>('month');
  const [date, setDate] = useState(() => initialDate ?? new Date());
  const [draft, setDraft] = useState<Draft | null>(null);
  const [notice, setNotice] = useState({ open: false, message: '' });

  useEffect(() => {
    load();
  }, [load]);

  function openNewEvent(start: Date) {
    setDraft({ name: '', type: 'meeting', start, end: addHours(start, 1) });
  }

  // If saving fails these throw before the dialog closes, and the dialog shows the error.
  function handleSave(input: EventInput) {
    if (draft?.id) {
      updateEvent(draft.id, input);
      setNotice({ open: true, message: 'Event updated' });
    } else {
      addEvent(input);
      setNotice({ open: true, message: 'Event created' });
    }
    setDraft(null);
  }

  function handleDelete() {
    if (!draft?.id) return;
    deleteEvent(draft.id);
    setNotice({ open: true, message: 'Event deleted' });
    setDraft(null);
  }

  return (
    <Box
      sx={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <AppBar
        position="static"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          <CalendarMonthIcon color="primary" aria-hidden />
          <Typography
            variant="h6"
            component="h1"
            sx={{ flex: 1, fontWeight: 700 }}
          >
            Events calendar
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openNewEvent(setHours(startOfDay(date), 9))}
          >
            New event
          </Button>
        </Toolbar>
      </AppBar>

      <Container
        component="main"
        maxWidth="xl"
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          py: 2,
        }}
      >
        <CalendarToolbar
          view={view}
          date={date}
          onViewChange={setView}
          onDateChange={setDate}
        />
        {view === 'month' ? (
          <MonthView
            date={date}
            events={events}
            onDayClick={(day) => openNewEvent(setHours(day, 9))}
            onEventClick={setDraft}
          />
        ) : (
          <WeekView
            date={date}
            events={events}
            onSlotClick={openNewEvent}
            onEventClick={setDraft}
          />
        )}
      </Container>

      {draft && (
        <EventDialog
          event={draft}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setDraft(null)}
        />
      )}

      <Snackbar
        open={notice.open}
        message={notice.message}
        autoHideDuration={4000}
        onClose={(_, reason) => {
          if (reason !== 'clickaway') setNotice({ ...notice, open: false });
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
