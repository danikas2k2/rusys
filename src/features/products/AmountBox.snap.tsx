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
    await settleVisual();
    await expect(dialog).toMatchScreenshot('amounts-history');
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
