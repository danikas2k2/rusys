import { expect, test } from '@tests/fixtures/test';
import { openProduct, productTile } from '@tests/helpers/ui';

test.use({ colorScheme: 'light', reducedMotion: 'reduce', locale: 'lt-LT' });

test('products page, amounts and product editor', async ({ page }) => {
    await page.goto('/');
    await expect(productTile(page, 'Avietės')).toBeVisible();
    await expect(page).toHaveScreenshot(['ProductsPage', 'products-page.png']);

    const amounts = await openProduct(page, 'Avietės');
    await expect(amounts).toHaveScreenshot(['ProductsPage', 'amounts-dialog.png']);
    await amounts.getByRole('button', { name: 'Taisyti' }).click();
    await expect(page.getByRole('dialog', { name: 'Taisyti produktą' })).toHaveScreenshot([
        'ProductsPage',
        'product-editor.png',
    ]);
});

test('product creation dialog', async ({ page }) => {
    await page.goto('/');
    await expect(productTile(page, 'Avietės')).toBeVisible();
    await page.locator('[data-action="add"]').click();
    await expect(page.getByRole('dialog', { name: 'Pridėti naują produktą' })).toHaveScreenshot([
        'ProductsPage',
        'product-create.png',
    ]);
});
