import { testPng } from '@tests/fixtures/image';
import { expect, test } from '@tests/fixtures/test';
import { openProduct } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('selected category image', async ({ page }) => {
    await page.goto('/categories');
    await page.getByRole('row', { name: /Uogienės/ }).click();
    const category = page.getByRole('dialog', { name: 'Taisyti kategoriją' });
    await category.locator('input[type="file"]').setInputFiles({
        name: 'category.png',
        mimeType: 'image/png',
        buffer: testPng,
    });
    await expect(category.getByTestId('image-dropzone')).toHaveScreenshot([
        'ImageDropzone',
        'category-image-selected.png',
    ]);
});

test('selected product image', async ({ page }) => {
    await page.goto('/');
    const amounts = await openProduct(page, 'Avietės');
    await amounts.getByRole('button', { name: 'Taisyti' }).click();
    const product = page.getByRole('dialog', { name: 'Taisyti produktą' });
    await product.locator('input[type="file"]').setInputFiles({
        name: 'product.png',
        mimeType: 'image/png',
        buffer: testPng,
    });
    await expect(product.getByTestId('image-dropzone')).toHaveScreenshot([
        'ImageDropzone',
        'product-image-selected.png',
    ]);
});
