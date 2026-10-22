# Events Calendar

A month and week calendar for the provided `events.json`, built with Next.js (App Router), React, TypeScript, MUI and Zustand. The month and week views are hand-built, with no calendar UI library. Events can be created, edited and deleted, and they are saved in the browser's localStorage.

## Quick start

You need Node.js 20.9 or later (it was developed on 22) and npm.

```bash
npm install && npm run dev
```

Then open **http://localhost:3000**. The calendar opens on today's date. The sample events are in the week of **22 June 2026**, so use the ‹ button to go back to June 2026.

**Resetting the data:** run `localStorage.removeItem('calendar-events')` in the browser console and reload.

## Scripts

| Command                              | What it does                                                                                                                            |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                        | Development server on port 3000                                                                                                         |
| `npm test`                           | Unit and component tests (Jest + React Testing Library)                                                                                 |
| `npm run test:e2e`                   | End-to-end tests (Playwright) against a production build on port 3100. Run `npx playwright install chromium` once before the first run. |
| `npm run lint` / `npm run typecheck` | ESLint and TypeScript                                                                                                                   |
| `npm run check`                      | Lint, type check and unit tests                                                                                                         |

## Decisions

- **Stack:** ecoPortal's production stack: Next.js 16 (App Router), React 19, MUI 9, Zustand 5, Jest 30 with Testing Library, and Playwright. date-fns does the date maths and zod checks stored data. TypeScript 5.9, because typescript-eslint doesn't support TypeScript 7 yet.
- **Hand-built views with plain helper functions.** The date maths (`calendar/dates.ts`) and the week layout (`calendar/eventLayout.ts`) are plain functions with their own tests; the components only render their results.
- **Overlapping events:** in the week view, events that overlap, directly or through a chain, form a group. Each event takes the first column that is free when it starts, and the group splits the width evenly (`layoutDayEvents`).
- **One Zustand store** (`events/eventStore.ts`) holds the events. Each change is saved to localStorage first and only then applied.
- **Checking data at the boundary.** Data from `events.json` and localStorage goes through a zod schema (`events/storage.ts`). Invalid records are skipped and logged; unreadable data falls back to the sample events.
- **Time model:** the dataset's times have no time zone, so they are treated as local wall-clock times and saved back in the same format. The week view places events by clock time, so they still line up with the hour labels on daylight-saving days.
- **Client-only rendering:** the calendar is loaded with `next/dynamic` and `ssr: false`, because it depends on localStorage and the viewer's clock.

## Known limitations

- **Always opens on today.** The view and date aren't kept in the URL, so a reload goes back to today and a link can't point at a date.
- **Busy days scroll.** A busy day in the month view scrolls inside its cell instead of collapsing into "+N more".
- **Event kinds:** no all-day events and no recurring events. A multi-day event appears on each of its days, not as one bar across them.
- **One time zone.** Events have no zone of their own.
- **Browser storage only.** Data stays in one browser and is limited to about 5 MB. Two open tabs overwrite each other's changes.
- **No drag and drop** to move or resize events.
- **Designed for desktop and tablet first.** It works on phones, but the week view is cramped.
- **Date inputs are the browser's own** `datetime-local` control, so their look depends on the browser.

## With more time

### Architecture

1. Replace localStorage with an API that loads events by date range, using a data-fetching library (TanStack Query or RTK Query) for loading states, retries and caching. The store's actions would become async.
2. Keep the view and date in the URL, so links can be shared and the browser's Back button works.
3. Store times as UTC plus a time zone per event or site.

### Features, in priority order

1. Drag to move and resize events in the week view.
2. All-day events, with bars that span days in the month view.
3. "+N events" for number of events that extend past the current calendar box
4. Filter and search by type or name.
5. Recurring events.
