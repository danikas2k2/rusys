import { css, dialogScreenshotOptions, openProduct, renderVisualApp, settleVisual } from '@tests/browser/visual';
import { currentYear } from '@tests/fixtures/data';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { page } from 'vitest/browser';

// Keep the September history fixture in the date-only range throughout the year.
beforeEach(() => vi.setSystemTime(new Date(2000 + currentYear, 10, 20, 12)));
afterEach(() => vi.useRealTimers());

test('product amounts, editable variant and history', async () => {
    await renderVisualApp('/', 'history');
    const dialog = await openProduct('Avietės');
    await expect.element(dialog.getByRole('tab', { name: 'Kiekiai' })).toBeVisible();
    await settleVisual();
    await expect(page).toMatchScreenshot('amounts-dialog', dialogScreenshotOptions(dialog));

    // Keep the locator stable when opening the accordion changes its text and matching ancestors.
    const variant = dialog.getByRole('button', { name: /^Stiklainis\b/ });
    await variant.click();
    await expect.element(dialog.getByRole('textbox', { name: 'updated' })).toBeVisible();
    const card = variant.element().closest('.ui-Accordion-item')!;
    await settleVisual();
    await expect(page).toMatchScreenshot('amounts-expanded', dialogScreenshotOptions(dialog));

    await dialog.getByRole('textbox', { name: 'updated' }).fill('2');
    await expect.poll(() => !!card.querySelector('[data-state="positive"]')).toBe(true);
    await dialog.getByRole('button', { name: 'Atšaukti' }).click();
    await dialog.getByRole('tab', { name: 'Istorija' }).click();
    await expect.element(page.getByText('Suvalgyta su arbata')).toBeVisible();
    const history = css('[data-table="history"]', dialog);
    await expect.element(css('[data-history-date]', history)).toBeVisible();
    await settleVisual();
    await expect(page).toMatchScreenshot('amounts-history', dialogScreenshotOptions(dialog));
    await dialog.getByRole('button', { name: /Perkelti į išmesta/ }).click();
    await expect.element(dialog.getByRole('textbox', { name: 'Kiekis' })).toBeVisible();
    await expect.element(dialog.getByRole('button', { name: 'Atšaukti' })).toBeVisible();
    await expect.element(dialog.getByRole('button', { name: 'Išmesti' })).toBeVisible();
    await expect.element(css('[data-history-amount-line][data-expanded]', dialog)).toBeVisible();
    await dialog.getByRole('button', { name: 'Mažinti' }).click();
    await expect.element(dialog.getByRole('button', { name: /Perkelti į išmesta/ })).toMatchTextContent('0');
    await settleVisual();
    await expect(page).toMatchScreenshot('amounts-history-recycle', dialogScreenshotOptions(dialog));
});

test('year selector and year totals', async () => {
    await renderVisualApp('/', 'annual');
    const dialog = await openProduct('Avietės');
    await expect.element(css('[data-year-total]', dialog)).toBeVisible();
    await settleVisual();
    // Modal autofocus can finish later on CI. Capture the totals without an incidental focus ring.
    const close = dialog.getByRole('button', { name: 'Uždaryti' });
    await expect.element(close).toHaveFocus();
    close.element().blur();
    await expect(page).toMatchScreenshot('annual-amounts-dialog', dialogScreenshotOptions(dialog));
    await dialog.getByText(String(currentYear), { exact: true }).click();
    await expect
        .poll(() => dialog.element().querySelector('[data-amount-variant-key="Stiklainis"]')?.textContent)
        .toContain('3');
    await settleVisual();
    await expect(page).toMatchScreenshot('annual-current-year', dialogScreenshotOptions(dialog));
});

test('expands a later history amount across both columns', async () => {
    await renderVisualApp('/?history-multiple', 'history');
    const dialog = await openProduct('Avietės');
    await dialog.getByRole('tab', { name: 'Istorija' }).click();
    await expect.element(page.getByText('Suvalgyta su arbata')).toBeVisible();
    const history = css('[data-table="history"]', dialog);
    await expect.element(history.getByRole('button', { name: /Didelis indelis/ })).toBeVisible();
    const second = history.getByRole('button', { name: /Didelis indelis/ });
    await second.click();
    await expect.element(dialog.getByRole('textbox', { name: 'Kiekis' })).toBeVisible();
    await settleVisual();
    await expect(page).toMatchScreenshot('amounts-history-multiple', dialogScreenshotOptions(dialog));
});

test('consumption totals and history share the selected year', async () => {
    await renderVisualApp('/', 'history');
    const dialog = await openProduct('Avietės');
    await dialog.getByRole('tab', { name: 'Suvartota' }).click();
    await expect.element(dialog.getByRole('tab', { name: 'Suvartota' })).toHaveAttribute('aria-selected', 'true');
    await expect
        .element(dialog.getByRole('tabpanel', { name: 'Suvartota' }).getByRole('table'))
        .toMatchTextContent('Suvalgyta su arbata');
    await settleVisual();
    await expect(page).toMatchScreenshot('amounts-consumed-history', dialogScreenshotOptions(dialog));
});
