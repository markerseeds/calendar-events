import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';
import { addDays, startOfDay } from 'date-fns';
import { getEventType, type CalendarEvent } from '@/app/events/types';
import { formatEventLabel, formatTimeRange } from './dates';
import { MINUTES_PER_DAY, minutesIntoDay } from './eventLayout';

interface WeekEventProps {
  event: CalendarEvent;
  day: Date;
  column: number;
  columnCount: number;
  onSelect: (event: CalendarEvent) => void;
}

const percent = (fraction: number) => `${fraction * 100}%`;

/** An event block in a week-view day column, placed by its time and overlap column. */
export function WeekEvent({
  event,
  day,
  column,
  columnCount,
  onSelect,
}: WeekEventProps) {
  const startMinutes = minutesIntoDay(event.start, day);
  const endMinutes = minutesIntoDay(event.end, day);
  const continuesBefore = event.start < startOfDay(day);
  const continuesAfter = event.end > addDays(startOfDay(day), 1);
  const label =
    formatEventLabel(event) + (continuesBefore ? ', continued' : '');

  return (
    <ButtonBase
      aria-label={label}
      title={label}
      // Inline styles: the values differ for every event.
      style={{
        top: percent(startMinutes / MINUTES_PER_DAY),
        height: percent((endMinutes - startMinutes) / MINUTES_PER_DAY),
        left: percent(column / columnCount),
        width: percent(1 / columnCount),
      }}
      onClick={(clickEvent) => {
        // Don't let the day column underneath start a new event.
        clickEvent.stopPropagation();
        onSelect(event);
      }}
      sx={blockStyles(getEventType(event.type).color, {
        continuesBefore,
        continuesAfter,
        // Too short for two lines: put the time after the name.
        compact: endMinutes - startMinutes < 45,
      })}
    >
      <Box
        component="span"
        sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {event.name}
      </Box>
      <Box
        component="span"
        sx={{
          color: 'text.secondary',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {formatTimeRange(event.start, event.end)}
      </Box>
    </ButtonBase>
  );
}

interface BlockShape {
  continuesBefore: boolean;
  continuesAfter: boolean;
  compact: boolean;
}

function blockStyles(
  color: string,
  { continuesBefore, continuesAfter, compact }: BlockShape,
): SxProps<Theme> {
  return {
    position: 'absolute',
    minHeight: 20,
    display: 'flex',
    flexDirection: compact ? 'row' : 'column',
    alignItems: compact ? 'baseline' : 'stretch',
    justifyContent: 'flex-start',
    gap: compact ? 0.75 : '1px',
    '& > *': { minWidth: 0, flexShrink: compact ? 1 : 0 },
    px: 0.75,
    py: 0.25,
    overflow: 'hidden',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    typography: 'caption',
    lineHeight: 1.3,
    color: 'text.primary',
    bgcolor: alpha(color, 0.16),
    borderLeft: `3px solid ${color}`,
    // Square the ends that carry on into another day.
    borderRadius: 1,
    ...(continuesBefore && { borderTopLeftRadius: 0, borderTopRightRadius: 0 }),
    ...(continuesAfter && {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    }),
    // Keep a gap between neighbours in the same overlap group.
    boxShadow: (theme) => `0 0 0 1px ${theme.palette.background.paper}`,
    '&:hover': { bgcolor: alpha(color, 0.26), zIndex: 1 },
    '&.Mui-focusVisible': {
      outline: '2px solid',
      outlineColor: 'primary.main',
      zIndex: 1,
    },
  };
}
