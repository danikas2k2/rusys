import { expect, test } from '@tests/fixtures/test';
import { openProduct } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('move variants dialog', async ({ page }) => {
    await page.goto('/');
    const amounts = await openProduct(page, 'Avietės');
    await amounts.getByRole('button', { name: 'Perkelti variantus' }).click();
    await expect(amounts).toHaveScreenshot(['MoveVariantsBox', 'move-variants.png']);
});
