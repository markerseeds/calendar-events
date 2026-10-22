import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { addMonths, addWeeks, format } from 'date-fns';
import { formatWeekTitle } from './dates';

export type CalendarView = 'month' | 'week';

interface CalendarToolbarProps {
  view: CalendarView;
  date: Date;
  onViewChange: (view: CalendarView) => void;
  onDateChange: (date: Date) => void;
}

export function CalendarToolbar({
  view,
  date,
  onViewChange,
  onDateChange,
}: CalendarToolbarProps) {
  const title =
    view === 'month' ? format(date, 'MMMM yyyy') : formatWeekTitle(date);

  function move(amount: number) {
    onDateChange(
      view === 'month' ? addMonths(date, amount) : addWeeks(date, amount),
    );
  }

  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', flexWrap: 'wrap', columnGap: 1, rowGap: 1.5 }}
    >
      <Button
        variant="outlined"
        color="inherit"
        onClick={() => onDateChange(new Date())}
      >
        Today
      </Button>
      <Stack direction="row">
        <IconButton aria-label={`Previous ${view}`} onClick={() => move(-1)}>
          <ChevronLeftIcon />
        </IconButton>
        <IconButton aria-label={`Next ${view}`} onClick={() => move(1)}>
          <ChevronRightIcon />
        </IconButton>
      </Stack>
      <Typography
        variant="h5"
        component="h2"
        aria-live="polite"
        sx={{ flex: 1, minWidth: 'max-content', fontWeight: 600 }}
      >
        {title}
      </Typography>
      <ToggleButtonGroup
        exclusive
        size="small"
        color="primary"
        aria-label="Calendar view"
        value={view}
        onChange={(_, next: CalendarView | null) => {
          // Clicking the selected view again gives null; keep the view.
          if (next) onViewChange(next);
        }}
      >
        <ToggleButton value="month" sx={{ px: 2 }}>
          Month
        </ToggleButton>
        <ToggleButton value="week" sx={{ px: 2 }}>
          Week
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}
