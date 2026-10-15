import { productTile, renderVisualApp, settleVisual } from '@tests/browser/visual';
import { expect, test } from 'vitest';

import { page } from 'vitest/browser';

test('review dialog', async () => {
    await renderVisualApp('/', 'review');
    await expect.element(productTile('Avietės')).toBeVisible();
    await page.getByRole('button', { name: 'Peržiūra' }).click();
    const dialog = page.getByRole('dialog').last();
    await expect.element(dialog.getByRole('row', { name: 'Avietės' })).toBeVisible();
    await settleVisual();
    await expect(dialog).toMatchScreenshot('review-dialog');
});
