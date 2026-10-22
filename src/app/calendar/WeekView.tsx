import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { addMinutes, format, isToday, startOfDay } from 'date-fns';
import { useEffect, useRef, type MouseEvent } from 'react';
import type { CalendarEvent } from '@/app/events/types';
import { formatDayLabel, getEventsForDay, getWeekDays } from './dates';
import { MINUTES_PER_DAY, layoutDayEvents } from './eventLayout';
import { WeekEvent } from './WeekEvent';

const HOUR_HEIGHT = 48;
const GUTTER_WIDTH = 56;
const columns = `${GUTTER_WIDTH}px repeat(7, minmax(0, 1fr))`;
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

interface WeekViewProps {
  date: Date;
  events: CalendarEvent[];
  onSlotClick: (start: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function WeekView({
  date,
  events,
  onSlotClick,
  onEventClick,
}: WeekViewProps) {
  const days = getWeekDays(date);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Open at the start of the working day rather than at midnight.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 8 * HOUR_HEIGHT;
  }, []);

  // Clicking an empty part of a column suggests a new event at that half hour.
  function handleColumnClick(
    clickEvent: MouseEvent<HTMLDivElement>,
    day: Date,
  ) {
    const rect = clickEvent.currentTarget.getBoundingClientRect();
    const minutes =
      ((clickEvent.clientY - rect.top) / rect.height) * MINUTES_PER_DAY;
    const halfHours = Math.min(Math.max(Math.floor(minutes / 30), 0), 47);
    onSlotClick(addMinutes(startOfDay(day), halfHours * 30));
  }

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
          gridTemplateColumns: columns,
          borderBottom: 1,
          borderColor: 'divider',
          // Leave room for the scrollbar of the grid below.
          scrollbarGutter: 'stable',
          overflowY: 'hidden',
        }}
      >
        <span />
        {days.map((day) => (
          <Box
            key={day.toISOString()}
            sx={{
              display: 'flex',
              // Stack weekday over date where columns are narrow.
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'baseline' },
              justifyContent: 'center',
              columnGap: 0.75,
              py: 1,
              minWidth: 0,
              overflow: 'hidden',
              color: isToday(day) ? 'primary.main' : 'text.secondary',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {format(day, 'EEE')}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: isToday(day) ? 'primary.main' : 'text.primary',
              }}
            >
              {format(day, 'd')}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          scrollbarGutter: 'stable',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: columns,
            height: 24 * HOUR_HEIGHT,
          }}
        >
          <Box aria-hidden sx={{ position: 'relative' }}>
            {HOURS.map((hour) => (
              <Box
                key={hour}
                sx={{
                  height: HOUR_HEIGHT,
                  pr: 1,
                  textAlign: 'right',
                  typography: 'caption',
                  lineHeight: 1,
                  color: 'text.secondary',
                  fontVariantNumeric: 'tabular-nums',
                  // Sit each label on its hour line (the first one stays inside the grid).
                  transform: hour === 0 ? 'none' : 'translateY(-0.5em)',
                }}
              >
                {`${String(hour).padStart(2, '0')}:00`}
              </Box>
            ))}
          </Box>

          {days.map((day) => (
            <Box
              key={day.toISOString()}
              role="group"
              aria-label={formatDayLabel(day)}
              aria-current={isToday(day) ? 'date' : undefined}
              onClick={(clickEvent) => handleColumnClick(clickEvent, day)}
              sx={(theme) => ({
                position: 'relative',
                minWidth: 0,
                borderLeft: 1,
                borderColor: 'divider',
                cursor: 'pointer',
                backgroundColor: isToday(day)
                  ? alpha(theme.palette.primary.main, 0.04)
                  : 'transparent',
                // One line per hour, drawn by the background rather than 24 elements.
                backgroundImage: `linear-gradient(to bottom, ${theme.palette.divider} 1px, transparent 1px)`,
                backgroundSize: `100% ${HOUR_HEIGHT}px`,
              })}
            >
              {layoutDayEvents(getEventsForDay(events, day)).map(
                ({ event, column, columnCount }) => (
                  <WeekEvent
                    key={event.id}
                    event={event}
                    day={day}
                    column={column}
                    columnCount={columnCount}
                    onSelect={onEventClick}
                  />
                ),
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
