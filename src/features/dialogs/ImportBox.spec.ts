import { readFile, rm } from 'node:fs/promises';
import path from 'node:path';

import { expect, test } from '@tests/fixtures/test';
import { productTile } from '@tests/helpers/ui';

import type { Page } from '@playwright/test';
import JSZip from 'jszip';

import type { Product } from '~/schema';

async function openUtility(page: Page, label: string) {
    await page.getByRole('button', { name: 'Meniu' }).click();
    const menu = page.getByRole('navigation');
    await menu.getByRole('link', { name: 'Įrankiai' }).click();
    await menu.getByText(label, { exact: true }).click();
}

test.describe('import and export', { tag: '@critical' }, () => {
    test('restores an uploaded image from the exported archive', async ({ page, db, imagesDir }) => {
        const png = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==',
            'base64'
        );
        await page.goto('/');
        await productTile(page, 'Avietės').click();
        await page
            .getByRole('dialog', { name: /Avietės Uogienės/ })
            .getByRole('button', { name: 'Taisyti' })
            .click();
        const editor = page.getByRole('dialog', { name: 'Taisyti produktą' });
        await editor.locator('input[type="file"]').setInputFiles({
            name: 'product.png',
            mimeType: 'image/png',
            buffer: png,
        });
        await editor.getByRole('button', { name: 'Naujinti' }).click();
        await page
            .getByRole('dialog', { name: /Avietės Uogienės/ })
            .getByRole('button', { name: 'Uždaryti' })
            .click();
        await expect
            .poll(async () => (await db.collection<Product>('products').findOne({ name: 'Avietės' }))?.image)
            .toMatch(/^\/images\/[0-9a-f]{2}\/[0-9a-f]{2}\/[0-9a-f]{32}\.png$/);
        const imageUrl = (await db.collection<Product>('products').findOne({ name: 'Avietės' }))!.image!;
        const imagePath = path.join(imagesDir, imageUrl.slice('/images/'.length));

        await openUtility(page, 'Eksportuoti');
        const downloadPromise = page.waitForEvent('download');
        await page
            .getByRole('dialog', { name: /Eksportuoti duomenis/ })
            .getByRole('button', { name: 'Eksportuoti' })
            .click();
        const archive = await readFile((await (await downloadPromise).path())!);
        const zip = await JSZip.loadAsync(archive);
        const dataFile = zip.file('data.json');
        expect(dataFile).not.toBeNull();
        const { products } = JSON.parse((await dataFile?.async('string')) ?? '{}') as { products?: Product[] };
        expect(products).toEqual(
            expect.arrayContaining([expect.objectContaining({ name: 'Avietės', image: imageUrl })])
        );
        expect(await zip.file(`images/${imageUrl.slice('/images/'.length)}`)?.async('nodebuffer')).toEqual(png);

        await db.collection<Product>('products').deleteOne({ name: 'Avietės' });
        await rm(imagePath);
        await page.reload();
        await expect(productTile(page, 'Avietės')).toHaveCount(0);
        await openUtility(page, 'Importuoti');
        const dialog = page.getByRole('dialog', { name: 'Importuoti' });
        await dialog
            .locator('input[type="file"]')
            .setInputFiles({ name: 'backup.zip', mimeType: 'application/zip', buffer: archive });
        await dialog.getByRole('button', { name: 'Importuoti' }).click();
        await expect(dialog).toHaveCount(0);
        await page.reload();
        await expect(productTile(page, 'Avietės')).toBeVisible();
        expect(await db.collection<Product>('products').countDocuments({ name: 'Avietės' })).toBe(1);
        const restoredUrl = (await db.collection<Product>('products').findOne({ name: 'Avietės' }))!.image!;
        expect(restoredUrl).toMatch(/^\/images\/[0-9a-f]{2}\/[0-9a-f]{2}\/[0-9a-f]{32}\.png$/);
        expect(restoredUrl).not.toBe(imageUrl);
        expect(await readFile(path.join(imagesDir, restoredUrl.slice('/images/'.length)))).toEqual(png);
        const response = await page.request.get(restoredUrl);
        expect(response.status()).toBe(200);
        expect(await response.body()).toEqual(png);
    });
});
