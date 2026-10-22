import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { EventDialog } from './EventDialog';

const newEvent = {
  name: '',
  type: 'meeting',
  start: new Date(2026, 5, 25, 10, 0),
  end: new Date(2026, 5, 25, 11, 0),
};

const briefing = {
  id: 'evt-001',
  name: 'Weekly safety briefing',
  type: 'meeting',
  start: new Date(2026, 5, 22, 9, 0),
  end: new Date(2026, 5, 22, 9, 30),
};

function renderDialog(props: Partial<ComponentProps<typeof EventDialog>> = {}) {
  const handlers = {
    onSave: jest.fn(),
    onDelete: jest.fn(),
    onClose: jest.fn(),
  };
  render(<EventDialog event={newEvent} {...handlers} {...props} />);
  return handlers;
}

const save = () =>
  userEvent.click(screen.getByRole('button', { name: 'Save' }));

describe('EventDialog', () => {
  it('shows what is wrong instead of saving', async () => {
    const { onSave } = renderDialog();
    fireEvent.change(screen.getByLabelText('End'), {
      target: { value: '2026-06-25T09:00' },
    });

    await save();

    expect(screen.getByText('Enter a name')).toBeInTheDocument();
    expect(screen.getByText('End must be after the start')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves the trimmed name and the dates', async () => {
    const { onSave } = renderDialog();
    await userEvent.type(screen.getByLabelText('Name'), '  Fire drill  ');

    await save();

    expect(onSave).toHaveBeenCalledWith({
      name: 'Fire drill',
      type: 'meeting',
      start: new Date(2026, 5, 25, 10, 0),
      end: new Date(2026, 5, 25, 11, 0),
    });
  });

  it('stays open and explains when saving fails', async () => {
    const { onClose } = renderDialog({
      onSave: () => {
        throw new DOMException('Storage is full', 'QuotaExceededError');
      },
    });
    await userEvent.type(screen.getByLabelText('Name'), 'Fire drill');

    await save();

    expect(screen.getByRole('alert')).toHaveTextContent(
      "Couldn't save to browser storage. Free up space or try again.",
    );
    expect(screen.getByLabelText('Name')).toHaveValue('Fire drill');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deletes an event only after confirmation', async () => {
    const { onDelete } = renderDialog({ event: briefing });

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const confirm = screen.getByRole('dialog', { name: 'Delete event?' });
    expect(confirm).toHaveTextContent(
      '“Weekly safety briefing” will be permanently deleted.',
    );
    expect(onDelete).not.toHaveBeenCalled();

    await userEvent.click(
      within(confirm).getByRole('button', { name: 'Delete' }),
    );

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('has no Delete button for a new event', () => {
    renderDialog();

    expect(
      screen.getByRole('dialog', { name: 'New event' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();
  });
});
