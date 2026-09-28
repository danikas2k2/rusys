import { readFile, rm } from 'node:fs/promises';
import path from 'node:path';

import { expect, test } from '@tests/fixtures/test';
import { productTile } from '@tests/helpers/ui';

import type { Page } from '@playwright/test';
import JSZip from 'jszip';

import type { Product } from '~/common/data';

async function openUtility(page: Page, label: string) {
    await page.getByRole('button', { name: 'Meniu' }).click();
    const menu = page.getByRole('menu');
    await menu.getByRole('link', { name: 'Įrankiai' }).click();
    await menu.getByText(label, { exact: true }).click();
}

test.describe('import and export', () => {
    test('exports data and imports the archive into the isolated database', async ({ page, db }) => {
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await openUtility(page, 'Eksportuoti');
        const downloadPromise = page.waitForEvent('download');
        await page
            .getByRole('dialog', { name: /Eksportuoti duomenis/ })
            .getByRole('button', { name: 'Eksportuoti' })
            .click();
        const download = await downloadPromise;
        const archive = await readFile((await download.path())!);
        const zip = await JSZip.loadAsync(archive);
        const data = JSON.parse((await zip.file('data.json')?.async('string')) ?? '{}') as {
            products?: Product[];
        };
        expect(data.products?.some(({ name }) => name === 'Avietės')).toBe(true);

        await db.dropDatabase();
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
    });

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
        expect(await zip.file(`images/${imageUrl.slice('/images/'.length)}`)?.async('nodebuffer')).toEqual(png);

        await db.dropDatabase();
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
        expect((await db.collection<Product>('products').findOne({ name: 'Avietės' }))?.image).toBe(imageUrl);
        expect(await readFile(imagePath)).toEqual(png);
        const response = await page.request.get(imageUrl);
        expect(response.status()).toBe(200);
        expect(await response.body()).toEqual(png);
    });

    test('rejects an invalid import without replacing existing data', async ({ page, db }) => {
        await page.goto('/');
        await openUtility(page, 'Importuoti');
        const dialog = page.getByRole('dialog', { name: 'Importuoti' });
        await dialog.locator('input[type="file"]').setInputFiles({
            name: 'broken.zip',
            mimeType: 'application/zip',
            buffer: Buffer.from('not a zip'),
        });
        await dialog.getByRole('button', { name: 'Importuoti' }).click();
        await expect(dialog.getByRole('alert')).toBeVisible();
        expect(await db.collection<Product>('products').countDocuments({ name: 'Avietės' })).toBe(1);
    });

    test('rejects a ZIP with an invalid data schema', async ({ page, db }) => {
        const zip = new JSZip();
        zip.file('data.json', '{}');
        const archive = await zip.generateAsync({ type: 'nodebuffer' });
        await page.goto('/');
        await openUtility(page, 'Importuoti');
        const dialog = page.getByRole('dialog', { name: 'Importuoti' });
        await dialog
            .locator('input[type="file"]')
            .setInputFiles({ name: 'invalid.zip', mimeType: 'application/zip', buffer: archive });
        await dialog.getByRole('button', { name: 'Importuoti' }).click();
        await expect(dialog.getByRole('alert')).toBeVisible();
        expect(await db.collection<Product>('products').countDocuments({ name: 'Avietės' })).toBe(1);
    });

    test('cancelled import leaves the database unchanged', async ({ page, db }) => {
        await page.goto('/');
        await openUtility(page, 'Importuoti');
        const dialog = page.getByRole('dialog', { name: 'Importuoti' });
        await dialog.locator('input[type="file"]').setInputFiles({
            name: 'backup.zip',
            mimeType: 'application/zip',
            buffer: Buffer.from('draft'),
        });
        await dialog.getByRole('button', { name: 'Atšaukti' }).click();
        await page
            .getByRole('dialog', { name: 'Atmesti neišsaugotus pakeitimus?' })
            .getByRole('button', { name: 'Atmesti' })
            .click();
        await expect(dialog).toHaveCount(0);
        expect(await db.collection<Product>('products').countDocuments({ name: 'Avietės' })).toBe(1);
    });
});
