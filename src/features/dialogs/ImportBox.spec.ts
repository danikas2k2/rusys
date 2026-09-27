import { readFile } from 'node:fs/promises';

import { expect, test } from '@tests/fixtures/test';
import { productTile } from '@tests/helpers/ui';

import JSZip from 'jszip';

import type { Product } from '~/common/data';

async function openUtility(page: Parameters<Parameters<typeof test>[2]>[0]['page'], label: string) {
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
