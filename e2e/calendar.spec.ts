import { expect, test, type Page } from '@playwright/test';

const heading = (page: Page, name: string) =>
  page.getByRole('heading', { level: 2, name });

const sampleEvents: [day: string, event: RegExp][] = [
  ['Monday, 22 June 2026', /^Weekly safety briefing,/],
  ['Tuesday, 23 June 2026', /^Site A weekly walkthrough,/],
  ['Wednesday, 24 June 2026', /^Contractor toolbox talk,/],
  ['Friday, 26 June 2026', /^Quarterly site audit,/],
];

// The calendar opens on today, so pretend today is in the week of the sample
// events. Each test gets a fresh browser context, so storage starts from events.json.
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-06-24T10:00:00+12:00'));
  await page.goto('/');
  await expect(heading(page, 'June 2026')).toBeVisible();
});

test('shows the sample events in the month and week views', async ({
  page,
}) => {
  for (const [day, event] of sampleEvents) {
    await expect(
      page
        .getByRole('group', { name: day })
        .getByRole('button', { name: event }),
    ).toBeVisible();
  }

  await page.getByRole('button', { name: 'Week', exact: true }).click();

  await expect(heading(page, '22 – 28 Jun 2026')).toBeVisible();
  for (const [day, event] of sampleEvents) {
    await expect(
      page
        .getByRole('group', { name: day })
        .getByRole('button', { name: event }),
    ).toBeVisible();
  }
});

test('creates an event that is still there after a reload', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'New event' }).click();
  const dialog = page.getByRole('dialog', { name: 'New event' });
  await dialog.getByLabel('Name').fill('Fire drill');
  await dialog.getByRole('button', { name: 'Save' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText('Event created')).toBeVisible();
  const created = page
    .getByRole('group', { name: 'Wednesday, 24 June 2026' })
    .getByRole('button', { name: 'Fire drill, Meeting, 09:00 to 10:00' });
  await expect(created).toBeVisible();

  await page.reload();
  await expect(created).toBeVisible();
});

test('edits and then deletes an event for good', async ({ page }) => {
  await page.getByRole('button', { name: /^Weekly safety briefing,/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit event' });
  await dialog.getByLabel('Name').fill('Monday safety briefing');
  await dialog.getByRole('button', { name: 'Save' }).click();

  const renamed = page.getByRole('button', {
    name: /^Monday safety briefing,/,
  });
  await expect(renamed).toBeVisible();
  await page.reload();
  await expect(renamed).toBeVisible();

  await renamed.click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page
    .getByRole('dialog', { name: 'Delete event?' })
    .getByRole('button', { name: 'Delete' })
    .click();

  await expect(page.getByText('Event deleted')).toBeVisible();
  await expect(renamed).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole('button', { name: /^Contractor toolbox talk,/ }),
  ).toBeVisible();
  await expect(renamed).toHaveCount(0);
});
