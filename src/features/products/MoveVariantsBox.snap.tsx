import { dialogScreenshotOptions, openProduct, renderVisualApp, settleVisual } from '@tests/browser/visual';
import { expect, test } from 'vitest';

import { page } from 'vitest/browser';

test('move variants dialog', async () => {
    await renderVisualApp('/');
    const amounts = await openProduct('Avietės');
    await amounts.getByRole('button', { name: 'Perkelti variantus' }).click();
    await expect.element(amounts).toBeVisible();
    await settleVisual();
    await expect(page).toMatchScreenshot('move-variants', dialogScreenshotOptions(amounts));
});
