import { dialogScreenshotOptions, openProduct, renderVisualApp, settleVisual } from '@tests/browser/visual';
import { expect, test } from 'vitest';

import { page } from 'vitest/browser';

test('move variants dialog', async () => {
    await renderVisualApp('/');
    const amounts = await openProduct('Avietės');
    await amounts.getByRole('button', { name: 'Perkelti variantus' }).click();
    // The dialog was already visible before the click; wait for the transfer controls to commit.
    await expect.element(amounts.getByRole('combobox', { name: 'Perkelti į' })).toBeVisible();
    await expect.element(amounts.getByRole('button', { name: 'Atšaukti' })).toBeVisible();
    await settleVisual();
    await expect(page).toMatchScreenshot('move-variants', dialogScreenshotOptions(amounts));
});
