import { css, openProduct, renderVisualApp, settleVisual } from '@tests/browser/visual';
import { currentYear } from '@tests/fixtures/data';
import { expect, test } from 'vitest';

import { page } from 'vitest/browser';

test('product amounts, editable variant and history', async () => {
    await renderVisualApp('/', 'history');
    const dialog = await openProduct('Avietės');
    await expect.element(dialog.getByRole('tab', { name: 'Kiekiai' })).toBeVisible();
    await settleVisual();
    await expect(dialog).toMatchScreenshot('amounts-dialog');

    const variant = css('[data-amount-variant-key="Stiklainis"]', dialog);
    await variant.click();
    await expect.element(dialog.getByRole('textbox', { name: 'updated' })).toBeVisible();
    const card = variant.element();
    const panel = card.closest('.amount-box-quantities-panel');
    if (!panel) {
        throw new Error('Quantities panel not found');
    }
    expect(card.getBoundingClientRect().right - panel.getBoundingClientRect().right).toBeLessThanOrEqual(0);
    await settleVisual();
    await expect(dialog).toMatchScreenshot('amounts-expanded');

    await dialog.getByRole('textbox', { name: 'updated' }).fill('2');
    await expect.poll(() => !!card.querySelector('[data-state="positive"]')).toBe(true);
    await dialog.getByRole('button', { name: 'Atšaukti' }).click();
    await dialog.getByRole('tab', { name: 'Istorija' }).click();
    await expect.element(page.getByText('Suvalgyta su arbata')).toBeVisible();
    const history = css('[data-table="history"]', dialog);
    await expect.element(history).toMatchTextContent('Suvalgyta su arbata');
    await expect.element(history).toMatchTextContent('Stiklainis');
    await expect.element(css('[data-history-date]', history)).toBeVisible();
    await expect.element(css('[data-history-date]', history)).toMatchTextContent('Rugsėjo');
    await settleVisual();
    await expect(dialog).toMatchScreenshot('amounts-history');
    await dialog.getByRole('button', { name: /Perkelti į išmesta/ }).click();
    await expect.element(dialog.getByRole('textbox', { name: 'Kiekis' })).toBeVisible();
    await expect.element(dialog.getByRole('button', { name: 'Atšaukti' })).toBeVisible();
    await expect.element(dialog.getByRole('button', { name: 'Išmesti' })).toBeVisible();
    await expect.element(css('[data-history-amount-line][data-expanded]', dialog)).toBeVisible();
    const dateRow = history.element().querySelector('[data-history-date]')?.closest('tr');
    if (!dateRow) {
        throw new Error('History date row not found');
    }
    expect(getComputedStyle(dateRow).borderBottomWidth).toBe('0px');
    await dialog.getByRole('button', { name: 'Mažinti' }).click();
    await expect.element(dialog.getByRole('button', { name: /Perkelti į išmesta/ })).toMatchTextContent('0');
    await settleVisual();
    await expect(dialog).toMatchScreenshot('amounts-history-recycle');
    await dialog.getByRole('button', { name: 'Atšaukti' }).click();
    await expect.element(dialog.getByRole('textbox', { name: 'Kiekis' })).not.toBeInTheDocument();
    await expect.element(dialog.getByRole('button', { name: /Perkelti į išmesta/ })).toHaveFocus();
    await dialog.getByRole('tab', { name: 'Kiekiai' }).click();
});

test('year selector and year totals', async () => {
    await renderVisualApp('/', 'annual');
    const dialog = await openProduct('Avietės');
    await expect.element(css('[data-year-total]', dialog)).toBeVisible();
    await settleVisual();
    await expect(dialog).toMatchScreenshot('annual-amounts-dialog');
    const yearLabel = Array.from(dialog.element().querySelectorAll('label')).find((label) =>
        label.textContent?.includes(String(currentYear))
    );
    if (!yearLabel) {
        throw new Error(`Year label ${currentYear} not found`);
    }
    await page.elementLocator(yearLabel).click();
    await expect
        .poll(() => dialog.element().querySelector('[data-amount-variant-key="Stiklainis"]')?.textContent)
        .toContain('3');
    await settleVisual();
    await expect(dialog).toMatchScreenshot('annual-current-year');
});

test('expands a later history amount across both columns', async () => {
    await renderVisualApp('/?history-multiple', 'history');
    const dialog = await openProduct('Avietės');
    await dialog.getByRole('tab', { name: 'Istorija' }).click();
    await expect.element(page.getByText('Suvalgyta su arbata')).toBeVisible();
    const history = css('[data-table="history"]', dialog);
    await expect.element(history.getByRole('button', { name: /Didelis indelis/ })).toBeVisible();
    const first = history.getByRole('button', { name: /Stiklainis/ }).element();
    const second = history.getByRole('button', { name: /Didelis indelis/ });
    const date = history.element().querySelector('[data-history-date]');
    expect(first.closest('tr')).toBe(date?.closest('tr'));
    await second.click();
    await expect.element(dialog.getByRole('textbox', { name: 'Kiekis' })).toBeVisible();
    expect(second.element().closest('td')?.getAttribute('colspan')).toBe('2');
    expect(second.element().closest('tr')).not.toBe(date?.closest('tr'));
    const rows = Array.from(history.element().querySelectorAll('tr[data-history-entry]'));
    expect(getComputedStyle(rows[0]).borderBottomWidth).toBe('0px');
    await settleVisual();
    await expect(dialog).toMatchScreenshot('amounts-history-multiple');
});
