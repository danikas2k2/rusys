import { access, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { expect, test } from '@tests/fixtures/test';
import { openProduct } from '@tests/helpers/ui';

import type { Page, Response } from '@playwright/test';

import type { Group, Product } from '~/schema';

const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==',
    'base64'
);

async function tokenFrom(response: Pick<Response, 'ok' | 'json'>): Promise<string> {
    expect(response.ok()).toBe(true);
    const body: { token: string } = await response.json();
    expect(body.token).toMatch(/^upload:[a-f0-9]{64}$/);
    return body.token;
}

function pendingFile(imagesDir: string, token: string): string {
    if (!/^upload:[a-f0-9]{64}$/.test(token)) {
        throw new Error('Invalid test token');
    }
    return path.join(imagesDir, '.pending', token.slice('upload:'.length));
}

async function selectImage(page: Page, dialog: ReturnType<Page['getByRole']>): Promise<string> {
    const uploaded = page.waitForResponse(
        (response) =>
            response.url().endsWith('/api/images') && response.request().postData()?.includes('"image"') === true
    );
    await dialog.locator('input[type="file"]').setInputFiles({ name: 'image.png', mimeType: 'image/png', buffer: png });
    return tokenFrom(await uploaded);
}

test.describe('image uploads', () => {
    test('drops an upload whose response arrives after the editor is closed', async ({ page, imagesDir }) => {
        await page.goto('/categories');
        await page.getByRole('row', { name: /Uogienės/ }).click();
        const dialog = page.getByRole('dialog', { name: 'Taisyti kategoriją' });
        let release: () => void = () => undefined;
        const gate = new Promise<void>((resolve) => {
            release = resolve;
        });
        let staged: (token: string) => void = () => undefined;
        const ready = new Promise<string>((resolve) => {
            staged = resolve;
        });
        await page.route('**/api/images', async (route) => {
            const response = await route.fetch();
            staged(await tokenFrom(response));
            await gate;
            await route.fulfill({ response });
        });
        try {
            await dialog
                .locator('input[type="file"]')
                .setInputFiles({ name: 'image.png', mimeType: 'image/png', buffer: png });
            const token = await ready;
            await dialog.getByRole('button', { name: 'Atšaukti' }).click();
            await expect(dialog).toHaveCount(0);
            release();
            await expect
                .poll(() =>
                    access(pendingFile(imagesDir, token)).then(
                        () => true,
                        () => false
                    )
                )
                .toBe(false);
        } finally {
            release();
        }
    });

    test('drops a staged image when leaving the page', async ({ page, imagesDir }) => {
        await page.goto('/categories');
        await page.getByRole('row', { name: /Uogienės/ }).click();
        const token = await selectImage(page, page.getByRole('dialog', { name: 'Taisyti kategoriją' }));
        await page.goto('/');
        await expect
            .poll(() =>
                access(pendingFile(imagesDir, token)).then(
                    () => true,
                    () => false
                )
            )
            .toBe(false);
    });
    test('uploads in the background and submits only the token through a server action', async ({
        page,
        db,
        imagesDir,
    }) => {
        await page.goto('/categories');
        await page.getByRole('row', { name: /Uogienės/ }).click();
        const dialog = page.getByRole('dialog', { name: 'Taisyti kategoriją' });
        let release: () => void = () => undefined;
        const gate = new Promise<void>((resolve) => {
            release = resolve;
        });
        let staged: () => void = () => undefined;
        const ready = new Promise<void>((resolve) => {
            staged = resolve;
        });
        await page.route('**/api/images', async (route) => {
            const response = await route.fetch();
            staged();
            await gate;
            await route.fulfill({ response });
        });
        const uploaded = page.waitForResponse('**/api/images');
        try {
            await dialog
                .locator('input[type="file"]')
                .setInputFiles({ name: 'image.png', mimeType: 'image/png', buffer: png });
            await ready;
            await expect(dialog.getByRole('button', { name: 'Naujinti' })).toBeDisabled();
            await dialog.getByRole('textbox', { name: 'Kategorija' }).fill('Fone įkelta');
            expect(await db.collection('groups').countDocuments({ group: 'Fone įkelta' })).toBe(0);
            release();
            const token = await tokenFrom(await uploaded);
            await access(pendingFile(imagesDir, token));
            const submitted = page.waitForRequest(
                (request) => !!request.headers()['next-action'] && !!request.postData()?.includes(token)
            );
            await dialog.getByRole('button', { name: 'Naujinti' }).click();
            expect((await submitted).postData()).not.toContain('data:image/');
            await expect(dialog).toHaveCount(0);
            await expect
                .poll(async () => (await db.collection<Group>('groups').findOne({ group: 'Fone įkelta' }))?.image)
                .toContain('/images/');
            await expect
                .poll(() =>
                    access(pendingFile(imagesDir, token)).then(
                        () => true,
                        () => false
                    )
                )
                .toBe(false);
        } finally {
            release();
        }
    });

    for (const kind of ['category', 'product'] as const) {
        test(`drops an uploaded ${kind} image when the editor is cancelled`, async ({ page, db, imagesDir }) => {
            await page.goto(kind === 'category' ? '/categories' : '/');
            if (kind === 'category') {
                await page.getByRole('row', { name: /Uogienės/ }).click();
            } else {
                await (await openProduct(page, 'Avietės')).getByRole('button', { name: 'Taisyti' }).click();
            }
            const dialog = page.getByRole('dialog', {
                name: kind === 'category' ? 'Taisyti kategoriją' : 'Taisyti produktą',
            });
            const token = await selectImage(page, dialog);
            await access(pendingFile(imagesDir, token));
            await dialog.getByRole('button', { name: 'Atšaukti' }).click();
            await page.getByRole('button', { name: 'Atmesti', exact: true }).click();
            await expect(dialog).toHaveCount(0);
            await expect
                .poll(() =>
                    access(pendingFile(imagesDir, token)).then(
                        () => true,
                        () => false
                    )
                )
                .toBe(false);
            const saved =
                kind === 'category'
                    ? await db.collection<Group>('groups').findOne({ group: 'Uogienės' })
                    : await db.collection<Product>('products').findOne({ name: 'Avietės' });
            expect(saved?.image).toBeUndefined();
        });

        for (const expiration of ['expired', 'removed'] as const) {
            test(`saves ${kind} data with a ${expiration} token and accepts a replacement image`, async ({
                page,
                db,
                imagesDir,
            }) => {
                await page.goto(kind === 'category' ? '/categories' : '/');
                if (kind === 'category') {
                    await page.getByRole('row', { name: /Uogienės/ }).click();
                } else {
                    await (await openProduct(page, 'Avietės')).getByRole('button', { name: 'Taisyti' }).click();
                }
                const dialog = page.getByRole('dialog', {
                    name: kind === 'category' ? 'Taisyti kategoriją' : 'Taisyti produktą',
                });
                const token = await selectImage(page, dialog);
                const file = pendingFile(imagesDir, token);
                if (expiration === 'removed') {
                    await unlink(file);
                } else {
                    const record: Record<string, unknown> = JSON.parse(await readFile(file, 'utf8'));
                    await writeFile(file, JSON.stringify({ ...record, expires: Date.now() - 1000 }));
                }
                await dialog
                    .getByRole('textbox', { name: kind === 'category' ? 'Kategorija' : 'Produktas', exact: true })
                    .fill('Išsaugota be paveikslėlio');
                await dialog.getByRole('button', { name: 'Naujinti' }).click();
                await expect(dialog.getByRole('alert')).toContainText('Kiti pakeitimai išsaugoti', { timeout: 15_000 });
                const collection =
                    kind === 'category' ? db.collection<Group>('groups') : db.collection<Product>('products');
                const filter =
                    kind === 'category'
                        ? { group: 'Išsaugota be paveikslėlio' }
                        : { name: 'Išsaugota be paveikslėlio' };
                await expect.poll(() => collection.countDocuments(filter)).toBe(1);
                expect((await collection.findOne(filter))?.image).toBeUndefined();
                const replacement = await selectImage(page, dialog);
                const submitted = page.waitForRequest(
                    (request) => !!request.headers()['next-action'] && !!request.postData()?.includes(replacement)
                );
                await dialog.getByRole('button', { name: 'Naujinti' }).click();
                expect((await submitted).postData()).not.toContain('data:image/');
                await expect(dialog).toHaveCount(0);
                await expect.poll(async () => (await collection.findOne(filter))?.image).toContain('/images/');
                expect(await collection.countDocuments(filter)).toBe(1);
            });
        }
    }
    test('uploads, removes and rejects an invalid category image', async ({ page, db }) => {
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

        await test.step('rejects a non-image file without changing the category', async () => {
            await page.getByRole('row', { name: /Uogienės/ }).click();
            const edit = page.getByRole('dialog', { name: 'Taisyti kategoriją' });
            await edit.locator('input[type="file"]').setInputFiles({
                name: 'notes.txt',
                mimeType: 'text/plain',
                buffer: Buffer.from('not an image'),
            });
            await expect(edit.getByRole('alert')).toContainText('Pasirinkite tinkamą paveikslėlio failą');
            expect((await db.collection<Group>('groups').findOne({ group: 'Uogienės' }))?.image).toBeUndefined();
        });
    });

    test('uploads product and variant images and clears the variant image', async ({ page, db }) => {
        await page.goto('/');
        let amount = await openProduct(page, 'Avietės');
        await amount.getByRole('button', { name: 'Taisyti' }).click();
        const edit = page.getByRole('dialog', { name: 'Taisyti produktą' });
        const token = await selectImage(page, edit);
        const productAction = page.waitForRequest(
            (request) => !!request.headers()['next-action'] && !!request.postData()?.includes(token)
        );
        await edit.getByRole('button', { name: 'Naujinti' }).click();
        expect((await productAction).postData()).not.toContain('data:image/');
        await expect
            .poll(async () => (await db.collection<Product>('products').findOne({ name: 'Avietės' }))?.image)
            .toContain('/images/');
        await page.reload();
        amount = await openProduct(page, 'Avietės');
        await amount.locator('[data-amount-variant-key="Stiklainis"] [aria-expanded="false"]').click();
        const variantDropzone = amount.getByTestId('image-dropzone');
        const variantUpload = page.waitForResponse(
            (response) =>
                response.url().endsWith('/api/images') && response.request().postData()?.includes('"image"') === true
        );
        const variantAction = page.waitForRequest(
            (request) => !!request.headers()['next-action'] && !!request.postData()?.includes('upload:')
        );
        const fileChooser = page.waitForEvent('filechooser');
        await variantDropzone.click();
        await (await fileChooser).setFiles({ name: 'variant.png', mimeType: 'image/png', buffer: png });
        const variantToken = await tokenFrom(await variantUpload);
        const payload = (await variantAction).postData();
        expect(payload).toContain(variantToken);
        expect(payload).not.toContain('data:image/');
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
});
