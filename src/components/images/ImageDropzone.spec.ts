import { expect, test } from '@tests/fixtures/test';
import { openProduct } from '@tests/helpers/ui';

import type { Group, Product } from '~/common/data';

const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==',
    'base64'
);

test.describe('image uploads', () => {
    test('uploads and removes a category image', async ({ page, db }) => {
        await page.goto('/categories');
        await page.getByRole('row', { name: /Uogienės/ }).click();
        let dialog = page.getByRole('dialog', { name: 'Taisyti kategoriją' });
        await dialog
            .locator('input[type="file"]')
            .setInputFiles({ name: 'icon.png', mimeType: 'image/png', buffer: png });
        await dialog.getByRole('button', { name: 'Naujinti' }).click();
        await expect(dialog).toHaveCount(0);
        await expect
            .poll(async () => (await db.collection<Group>('groups').findOne({ group: 'Uogienės' }))?.image)
            .toContain('/images/');
        await page.reload();
        await page.getByRole('row', { name: /Uogienės/ }).click();
        dialog = page.getByRole('dialog', { name: 'Taisyti kategoriją' });
        await expect(dialog.getByRole('button', { name: 'Pašalinti paveikslėlį' })).toBeVisible();
        await dialog.getByRole('button', { name: 'Pašalinti paveikslėlį' }).click();
        await dialog.getByRole('button', { name: 'Naujinti' }).click();
        await expect
            .poll(async () => (await db.collection<Group>('groups').findOne({ group: 'Uogienės' }))?.image)
            .toBeFalsy();
    });

    test('uploads product and variant images and clears the variant image', async ({ page, db }) => {
        await page.goto('/');
        let amount = await openProduct(page, 'Avietės');
        await amount.getByRole('button', { name: 'Taisyti' }).click();
        const edit = page.getByRole('dialog', { name: 'Taisyti produktą' });
        await edit
            .locator('input[type="file"]')
            .setInputFiles({ name: 'product.png', mimeType: 'image/png', buffer: png });
        await edit.getByRole('button', { name: 'Naujinti' }).click();
        await expect
            .poll(async () => (await db.collection<Product>('products').findOne({ name: 'Avietės' }))?.image)
            .toContain('/images/');
        await page.reload();
        amount = await openProduct(page, 'Avietės');
        await amount.locator('[data-amount-variant-key="Stiklainis"]').click();
        await amount
            .locator('input[type="file"]')
            .setInputFiles({ name: 'variant.png', mimeType: 'image/png', buffer: png });
        await expect
            .poll(
                async () =>
                    (await db.collection<Product>('products').findOne({ name: 'Avietės' }))?.variantImages?.Stiklainis
            )
            .toContain('/images/');
        await amount.getByRole('button', { name: 'Pašalinti paveikslėlį' }).click();
        await expect
            .poll(
                async () =>
                    (await db.collection<Product>('products').findOne({ name: 'Avietės' }))?.variantImages?.Stiklainis
            )
            .toBeFalsy();
    });

    test('rejects a non-image file without changing the category', async ({ page, db }) => {
        await page.goto('/categories');
        await page.getByRole('row', { name: /Uogienės/ }).click();
        const dialog = page.getByRole('dialog', { name: 'Taisyti kategoriją' });
        await dialog.locator('input[type="file"]').setInputFiles({
            name: 'notes.txt',
            mimeType: 'text/plain',
            buffer: Buffer.from('not an image'),
        });
        await expect(dialog.getByRole('alert')).toContainText('Pasirinkite tinkamą paveikslėlio failą');
        expect((await db.collection<Group>('groups').findOne({ group: 'Uogienės' }))?.image).toBeUndefined();
    });
});
