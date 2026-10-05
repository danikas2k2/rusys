import { expect, test } from '@tests/fixtures/visual';
import { holdUploadProgress } from '@tests/helpers/holdUploadProgress';
import { openProduct } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('selected category image', async ({ page }) => {
    await page.goto('/categories');
    await page.getByRole('row', { name: /Uogienės/ }).click();
    const category = page.getByRole('dialog', { name: 'Taisyti kategoriją' });
    await category.locator('input[type="file"]').setInputFiles('src/tests/assets/uogienes.png');
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
    await product.locator('input[type="file"]').setInputFiles('src/tests/assets/avietes.png');
    await expect(product.getByTestId('image-dropzone')).toHaveScreenshot([
        'ImageDropzone',
        'product-image-selected.png',
    ]);
});

test('category image upload progress', async ({ page }) => {
    await holdUploadProgress(page, '/api/v1/groups/');
    await page.goto('/categories');
    await page.getByRole('row', { name: /Uogienės/ }).click();
    const category = page.getByRole('dialog', { name: 'Taisyti kategoriją' });
    await category.locator('input[type="file"]').setInputFiles('src/tests/assets/uogienes.png');
    await category.getByRole('button', { name: 'Naujinti' }).click();
    await expect(category.getByRole('progressbar', { name: 'Upload progress' })).toHaveAttribute('aria-valuenow', '42');
    await expect(category.getByTestId('image-dropzone')).toHaveScreenshot([
        'ImageDropzone',
        'category-image-upload-progress.png',
    ]);
});
