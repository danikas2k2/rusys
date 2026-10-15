import { openProduct, renderVisualApp, settleVisual } from '@tests/browser/visual';
import { expect, test } from 'vitest';

import { page } from 'vitest/browser';

test('product removal confirmation', async () => {
    await renderVisualApp('/');
    const amounts = await openProduct('Avietės');
    await amounts.getByRole('button', { name: 'Taisyti' }).click();
    await page.getByRole('dialog', { name: 'Taisyti produktą' }).getByRole('button', { name: 'Šalinti' }).click();
    const confirmation = page.getByRole('dialog', { name: 'Ar tikrai norite pašalinti?' });
    await expect.element(confirmation).toBeVisible();
    await settleVisual();
    await expect(confirmation).toMatchScreenshot('remove-confirmation', {
        comparatorOptions: { allowedMismatchedPixels: 2 },
    });
});
