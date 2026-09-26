import { readFile } from 'node:fs/promises';

import JSZip from 'jszip';

import type { Group, Product } from '~/common/data';
import { expect, test } from '../fixtures/test';
import { openProduct, productTile } from '../helpers/ui';

const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==',
    'base64'
);

async function openUtility(page: Parameters<Parameters<typeof test>[2]>[0]['page'], label: string) {
    await page.getByRole('button', { name: 'Meniu' }).click();
    const menu = page.getByRole('menu');
    await menu.getByRole('link', { name: 'Įrankiai' }).click();
    await menu.getByText(label, { exact: true }).click();
}

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

test('uploads and removes a category image', async ({ page, db }) => {
    await page.goto('/categories');
    await page.getByRole('row', { name: /Uogienės/ }).click();
    let dialog = page.getByRole('dialog', { name: 'Taisyti kategoriją' });
    await dialog.locator('input[type="file"]').setInputFiles({ name: 'icon.png', mimeType: 'image/png', buffer: png });
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
    await edit.locator('input[type="file"]').setInputFiles({ name: 'product.png', mimeType: 'image/png', buffer: png });
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
