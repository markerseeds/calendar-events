import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { format, isSameMonth, isToday } from 'date-fns';
import type { CalendarEvent } from '@/app/events/types';
import { formatDayLabel, getEventsForDay, getMonthDays } from './dates';
import { EventChip } from './EventChip';

const sevenColumns = 'repeat(7, minmax(0, 1fr))';

interface MonthViewProps {
  date: Date;
  events: CalendarEvent[];
  onDayClick: (day: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function MonthView({
  date,
  events,
  onDayClick,
  onEventClick,
}: MonthViewProps) {
  const days = getMonthDays(date);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        aria-hidden
        sx={{
          display: 'grid',
          gridTemplateColumns: sevenColumns,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        {days.slice(0, 7).map((day) => (
          <Typography
            key={day.toISOString()}
            variant="caption"
            sx={{
              px: 1,
              py: 0.75,
              fontWeight: 600,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {format(day, 'EEE')}
          </Typography>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: sevenColumns,
          gridAutoRows: 'minmax(6.5rem, 1fr)',
          flex: 1,
          // Rows share the height available; on short screens the grid scrolls.
          minHeight: 0,
          overflowY: 'auto',
          '& > :nth-last-of-type(-n + 7)': { borderBottom: 0 },
        }}
      >
        {days.map((day) => {
          const today = isToday(day);
          const inMonth = isSameMonth(day, date);
          return (
            <Box
              key={day.toISOString()}
              role="group"
              aria-label={formatDayLabel(day)}
              aria-current={today ? 'date' : undefined}
              onClick={() => onDayClick(day)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                minWidth: 0,
                // A busy day scrolls inside its cell instead of squashing its contents.
                minHeight: 0,
                overflowY: 'auto',
                '& > *': { flexShrink: 0 },
                p: 0.5,
                borderRight: 1,
                borderBottom: 1,
                borderColor: 'divider',
                '&:nth-of-type(7n)': { borderRight: 0 },
                bgcolor: inMonth ? 'background.paper' : 'grey.50',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Box
                component="span"
                sx={{
                  alignSelf: 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  typography: 'body2',
                  fontWeight: today ? 700 : 500,
                  color: today
                    ? 'primary.contrastText'
                    : inMonth
                      ? 'text.primary'
                      : 'text.disabled',
                  bgcolor: today ? 'primary.main' : 'transparent',
                }}
              >
                {format(day, 'd')}
              </Box>

              {/* minmax(0, 1fr) stops long names from widening the day. */}
              <Box
                component="ul"
                sx={{
                  listStyle: 'none',
                  m: 0,
                  p: 0,
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr)',
                  gap: '2px',
                }}
              >
                {getEventsForDay(events, day).map((event) => (
                  <li key={event.id}>
                    <EventChip
                      event={event}
                      day={day}
                      onSelect={onEventClick}
                    />
                  </li>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
