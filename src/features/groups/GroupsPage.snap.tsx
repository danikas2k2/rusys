import { css, renderVisualApp, settleVisual } from '@tests/browser/visual';
import { expect, test } from 'vitest';

import { page } from 'vitest/browser';

test('categories page', async () => {
    await renderVisualApp('/categories');
    const table = css('[data-table="groups"]');
    await expect.element(table.getByRole('row', { name: /Uogienės/ })).toBeVisible();
    await settleVisual();
    await expect(page).toMatchScreenshot('categories-page');
});

test('categories page with images', async () => {
    await renderVisualApp('/categories', 'images');
    const table = css('[data-table="groups"]');
    await expect.element(table.getByRole('row', { name: /Uogienės/ })).toBeVisible();
    await settleVisual();
    await expect(page).toMatchScreenshot('categories-page-images');
});
