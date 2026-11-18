import { access } from 'node:fs/promises';
import path from 'node:path';

import { expect, test } from '@tests/fixtures/test';
import { productTile, waitForImages } from '@tests/helpers/ui';

import type { Page, Response } from '@playwright/test';

import type { Group } from '~/schema';

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

test.describe('image uploads', { tag: '@critical' }, () => {
    test.use({ scenario: 'images' });

    test('drops a staged image when leaving the page', async ({ page, imagesDir }) => {
        await page.goto('/categories');
        await page.getByRole('row', { name: /Uogienės/ }).click();
        const token = await selectImage(page, page.getByRole('dialog', { name: 'Taisyti kategoriją' }));
        await access(pendingFile(imagesDir, token));
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
        await page.goto('/');
        for (const name of ['Avietės', 'Braškės']) {
            await waitForImages(productTile(page, name), 1);
        }
        await page.getByRole('tab', { name: 'Daržovės' }).click();
        await waitForImages(productTile(page, 'Morkos'), 1);
        await page.goto('/categories');
        for (const name of ['Uogienės', 'Daržovės']) {
            await waitForImages(page.getByRole('row', { name: new RegExp(name) }), 1);
        }
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
        await page.reload();
        await waitForImages(page.getByRole('row', { name: /Fone įkelta/ }), 1);
    });
});
