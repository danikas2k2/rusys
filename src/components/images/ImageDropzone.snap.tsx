import { holdUploadProgress, openProduct, renderVisualApp, settleVisual, uploadImage } from '@tests/browser/visual';
import { expect, test } from 'vitest';

import { page } from 'vitest/browser';

test('selected category image', async () => {
    await renderVisualApp('/categories');
    await page.getByRole('row', { name: /Uogienės/ }).click();
    const category = page.getByRole('dialog', { name: 'Taisyti kategoriją' });
    await uploadImage('input[type="file"]', 'uogienes.png', category);
    const dropzone = category.getByTestId('image-dropzone');
    await expect.element(dropzone).toBeVisible();
    await expect.element(dropzone.getByRole('button', { name: 'Pašalinti paveikslėlį' })).toBeEnabled();
    await settleVisual();
    await expect(dropzone).toMatchScreenshot('category-image-selected');
});

test('selected product image', async () => {
    await renderVisualApp('/');
    const amounts = await openProduct('Avietės');
    await amounts.getByRole('button', { name: 'Taisyti' }).click();
    const product = page.getByRole('dialog', { name: 'Taisyti produktą' });
    await uploadImage('input[type="file"]', 'avietes.png', product);
    const dropzone = product.getByTestId('image-dropzone');
    await expect.element(dropzone).toBeVisible();
    await expect.element(dropzone.getByRole('button', { name: 'Pašalinti paveikslėlį' })).toBeEnabled();
    await settleVisual();
    await expect(dropzone).toMatchScreenshot('product-image-selected');
});

test('category image upload progress', async () => {
    holdUploadProgress('/api/images');
    await renderVisualApp('/categories');
    await page.getByRole('row', { name: /Uogienės/ }).click();
    const category = page.getByRole('dialog', { name: 'Taisyti kategoriją' });
    await uploadImage('input[type="file"]', 'uogienes.png', category);
    await expect.element(category.getByRole('button', { name: 'Naujinti' })).toBeDisabled();
    await expect
        .element(category.getByRole('progressbar', { name: 'Upload progress' }))
        .toHaveAttribute('aria-valuenow', '42');
    await expect.element(category.getByRole('button', { name: 'Pašalinti paveikslėlį' })).toBeDisabled();
    await settleVisual();
    await expect(category.getByTestId('image-dropzone')).toMatchScreenshot('category-image-upload-progress');
});
