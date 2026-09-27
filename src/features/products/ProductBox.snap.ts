import { expect, test } from '@tests/fixtures/test';
import { openProduct, productTile } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('product editor', async ({ page }) => {
    await page.goto('/');
    const amounts = await openProduct(page, 'Avietės');
    await amounts.getByRole('button', { name: 'Taisyti' }).click();
    const editor = page.getByRole('dialog', { name: 'Taisyti produktą' });
    await expect(editor).toHaveScreenshot(['ProductBox', 'product-editor.png']);
});

test('product creation and additional details', async ({ page }) => {
    await page.goto('/');
    await expect(productTile(page, 'Avietės')).toBeVisible();
    await page.locator('[data-action="add"]').click();
    const dialog = page.getByRole('dialog', { name: 'Pridėti naują produktą' });
    await expect(dialog).toHaveScreenshot(['ProductBox', 'product-create.png']);
    await dialog.getByRole('button', { name: 'Papildoma informacija' }).click();
    await expect(dialog).toHaveScreenshot(['ProductBox', 'product-create-details.png']);
});
