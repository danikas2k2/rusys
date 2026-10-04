import { expect, test } from '@tests/fixtures/visual';
import { openProduct } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('variant row, editor and changed amount', async ({ page }) => {
    await page.goto('/');
    const dialog = await openProduct(page, 'Avietės');
    const variant = dialog.locator('[data-amount-variant-key="Stiklainis"]');
    await expect(variant).toHaveScreenshot(['AmountVariantRow', 'amount-variant-row.png']);
    await variant.click();
    await expect(dialog.getByRole('textbox', { name: 'updated' })).toBeVisible();
    await expect(variant).toHaveScreenshot(['AmountVariantRow', 'amount-variant-editor.png']);
    await dialog.getByRole('textbox', { name: 'updated' }).fill('2');
    await expect(variant.locator('[data-state="positive"]')).toBeVisible();
    await expect(variant).toHaveScreenshot(['AmountVariantRow', 'amount-variant-changed.png']);
});
