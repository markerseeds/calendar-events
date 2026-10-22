import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';
import { format, startOfDay } from 'date-fns';
import { getEventType, type CalendarEvent } from '@/app/events/types';
import { formatEventLabel } from './dates';

interface EventChipProps {
  event: CalendarEvent;
  /** The day the chip is on: an event that started on an earlier day shows "↳" instead of its time. */
  day: Date;
  onSelect: (event: CalendarEvent) => void;
}

/** One line in a month-view day: "09:00 Weekly safety briefing". */
export function EventChip({ event, day, onSelect }: EventChipProps) {
  const continued = event.start < startOfDay(day);
  const label = formatEventLabel(event) + (continued ? ', continued' : '');

  return (
    <ButtonBase
      aria-label={label}
      title={label}
      onClick={(clickEvent) => {
        // Don't let the day cell underneath start a new event.
        clickEvent.stopPropagation();
        onSelect(event);
      }}
      sx={chipStyles(getEventType(event.type).color)}
    >
      {continued ? (
        <Box component="span" aria-hidden sx={{ flexShrink: 0 }}>
          ↳
        </Box>
      ) : (
        <Box
          component="span"
          sx={{
            flexShrink: 0,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {format(event.start, 'HH:mm')}
        </Box>
      )}
      <Box
        component="span"
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {event.name}
      </Box>
    </ButtonBase>
  );
}

function chipStyles(color: string): SxProps<Theme> {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    width: '100%',
    minWidth: 0,
    px: 0.75,
    py: '1px',
    borderRadius: 1,
    borderLeft: `3px solid ${color}`,
    bgcolor: alpha(color, 0.12),
    color: 'text.primary',
    typography: 'caption',
    fontWeight: 500,
    lineHeight: 1.6,
    textAlign: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    '&:hover': { bgcolor: alpha(color, 0.22) },
    '&.Mui-focusVisible': {
      outline: '2px solid',
      outlineColor: 'primary.main',
      outlineOffset: 1,
    },
  };
}
