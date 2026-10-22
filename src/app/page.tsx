'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import dynamic from 'next/dynamic';

// Rendered in the browser only: events live in localStorage and "today" comes
// from the viewer's clock, so a server render could only disagree with the
// first client render.
const CalendarApp = dynamic(
  () => import('./calendar-app/CalendarApp').then((mod) => mod.CalendarApp),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{ flex: 1, display: 'grid', placeItems: 'center', minHeight: 240 }}
      >
        <CircularProgress aria-label="Loading events" />
      </Box>
    ),
  },
);

export default function HomePage() {
  return <CalendarApp />;
}
