import { openProduct, renderVisualApp, settleVisual } from '@tests/browser/visual';
import { expect, test } from 'vitest';

test('move variants dialog', async () => {
    await renderVisualApp('/');
    const amounts = await openProduct('Avietės');
    await amounts.getByRole('button', { name: 'Perkelti variantus' }).click();
    await expect.element(amounts).toBeVisible();
    await settleVisual();
    await expect(amounts).toMatchScreenshot('move-variants');
});
