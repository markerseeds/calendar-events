import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { STORAGE_KEY } from '@/app/events/storage';
import { CalendarApp } from './CalendarApp';

function renderApp() {
  render(<CalendarApp initialDate={new Date(2026, 5, 24)} />);
}

const heading = (name: string) =>
  screen.findByRole('heading', { level: 2, name });

beforeEach(() => {
  localStorage.clear();
});

describe('CalendarApp', () => {
  it('shows the sample events in the month view', async () => {
    renderApp();

    expect(await heading('June 2026')).toBeInTheDocument();
    const monday = screen.getByRole('group', { name: 'Monday, 22 June 2026' });
    expect(
      within(monday).getByRole('button', {
        name: 'Weekly safety briefing, Meeting, 09:00 to 09:30',
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /, Meeting, / })).toHaveLength(
      4,
    );
  });

  it('switches to the week view and moves between weeks', async () => {
    renderApp();

    await userEvent.click(screen.getByRole('button', { name: 'Week' }));
    expect(await heading('22 – 28 Jun 2026')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Next week' }));
    expect(await heading('29 Jun – 5 Jul 2026')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Previous week' }),
    );
    expect(await heading('22 – 28 Jun 2026')).toBeInTheDocument();
  });

  it('creates an event from a click on a day', async () => {
    renderApp();

    await userEvent.click(
      screen.getByRole('group', { name: 'Thursday, 25 June 2026' }),
    );
    const dialog = screen.getByRole('dialog', { name: 'New event' });
    expect(within(dialog).getByLabelText('Start')).toHaveValue(
      '2026-06-25T09:00',
    );
    await userEvent.type(within(dialog).getByLabelText('Name'), 'Fire drill');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(
      screen.getByRole('button', {
        name: 'Fire drill, Meeting, 09:00 to 10:00',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Event created')).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toContain('"name":"Fire drill"');
  });

  it('renames and then deletes an event', async () => {
    renderApp();

    await userEvent.click(
      await screen.findByRole('button', { name: /^Weekly safety briefing,/ }),
    );
    const name = screen.getByLabelText('Name');
    await userEvent.clear(name);
    await userEvent.type(name, 'Monday safety briefing');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Event updated')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: /^Monday safety briefing,/ }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'Delete event?' })).getByRole(
        'button',
        { name: 'Delete' },
      ),
    );

    expect(
      screen.queryByRole('button', { name: /^Monday safety briefing,/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Event deleted')).toBeInTheDocument();
  });
});
