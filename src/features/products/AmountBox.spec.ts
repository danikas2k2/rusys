import { expect, test } from '@tests/fixtures/test';
import { openProduct, productTile } from '@tests/helpers/ui';

import type { Product, Variant } from '~/schema';

test.describe('product amounts', () => {
    test('keeps the dialog and content width stable while saving', async ({ page }) => {
        await page.goto('/');
        const dialog = await openProduct(page, 'Avietės');
        await dialog.locator('[data-amount-variant-key="Stiklainis"] [aria-expanded="false"]').click();
        await dialog.getByRole('textbox', { name: 'updated' }).fill('2');
        const content = dialog.locator('.amount-box-content');
        const dialogWidth = await dialog.evaluate((element) => element.clientWidth);
        const contentWidth = await content.evaluate((element) => element.clientWidth);
        await page.route('**/*', async (route) => {
            if (route.request().headers()['next-action']) {
                await new Promise((resolve) => setTimeout(resolve, 500));
            }
            await route.continue();
        });

        await dialog.getByRole('button', { name: 'Naujinti' }).click();
        await expect(dialog.getByRole('button', { name: 'Uždaryti' })).toBeDisabled();

        expect(await dialog.evaluate((element) => element.clientWidth)).toBe(dialogWidth);
        expect(await content.evaluate((element) => element.clientWidth)).toBe(contentWidth);
        await expect(dialog).toBeHidden();
        const reopened = await openProduct(page, 'Avietės');
        await expect(reopened.getByRole('button', { name: 'Uždaryti' })).toBeEnabled();
        await expect(reopened.getByRole('button', { name: 'Naujinti' })).toHaveCount(0);
    });

    test('consumes stock with a comment, then undoes and redoes it @critical', async ({ page, db }) => {
        await page.goto('/');
        let amount = await openProduct(page, 'Avietės');
        await amount.locator('[data-amount-variant-key="Stiklainis"] [aria-expanded="false"]').click();
        await amount.getByRole('textbox', { name: 'consumed' }).fill('1');
        await amount.getByPlaceholder('Komentaras').fill('Suvalgytas stiklainis');
        await amount.getByRole('button', { name: 'Naujinti' }).click();
        await expect(amount).toHaveCount(0);
        await expect(productTile(page, 'Avietės')).toContainText('2');
        let product = await db.collection<Product>('products').findOne({ name: 'Avietės' });
        expect(
            'comment' in (product?.updates?.at(-1) ?? {}) && (product?.updates?.at(-1) as { comment?: string }).comment
        ).toBe('Suvalgytas stiklainis');
        await page.reload();
        amount = await openProduct(page, 'Avietės');
        await amount.getByRole('tab', { name: 'Istorija' }).click();
        await expect(amount).toContainText('Suvalgytas stiklainis');
        await amount.getByRole('tab', { name: 'Kiekiai' }).click();
        await amount.getByRole('button', { name: /Grąžinti/ }).click();
        await expect(productTile(page, 'Avietės')).toContainText('3');
        await amount.getByRole('button', { name: /Pakartoti/ }).click();
        await expect(productTile(page, 'Avietės')).toContainText('2');
        product = await db.collection<Product>('products').findOne({ name: 'Avietės' });
        expect(product?.years?.[0]?.amounts?.[0]?.amount).toBe(2);
    });

    test('adds stock and records discarded amounts in the summary', async ({ page, db }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        const amount = await openProduct(page, 'Avietės');
        await amount.locator('[data-amount-variant-key="Stiklainis"] [aria-expanded="false"]').click();
        await amount.getByRole('textbox', { name: 'updated' }).fill('2');
        await amount.getByRole('textbox', { name: 'recycled' }).fill('1');
        await amount.getByRole('button', { name: 'Naujinti' }).click();
        await expect(productTile(page, 'Avietės')).toContainText('4');
        await expect
            .poll(
                async () =>
                    (await db.collection<Product>('products').findOne({ name: 'Avietės' }))?.years?.[0]?.amounts?.[0]
                        ?.amount
            )
            .toBe(4);
        const updated = await openProduct(page, 'Avietės');
        await expect(updated.locator('[data-product-summary-total] [data-type="recycled"]')).toBeVisible();
    });

    test('reduces stock without recording consumption or waste', async ({ page, db }) => {
        await page.goto('/');
        let amount = await openProduct(page, 'Avietės');
        await amount.locator('[data-amount-variant-key="Stiklainis"] [aria-expanded="false"]').click();
        await amount.getByRole('textbox', { name: 'updated' }).fill('-1');
        await amount.getByRole('button', { name: 'Naujinti' }).click();
        await expect(amount).toBeHidden();
        await expect
            .poll(
                async () =>
                    (await db.collection<Product>('products').findOne({ name: 'Avietės' }))?.years?.[0]?.amounts?.[0]
                        ?.amount
            )
            .toBe(2);
        await page.reload();
        await expect(productTile(page, 'Avietės')).toContainText('2');
        amount = await openProduct(page, 'Avietės');
        await expect(amount.locator('[data-product-summary-total] [data-type="consumed"]')).toHaveCount(0);
        await expect(amount.locator('[data-product-summary-total] [data-type="recycled"]')).toHaveCount(0);
    });

    test('updates multiple stock variants in one action', async ({ page, db }) => {
        await db
            .collection<Product>('products')
            .updateOne(
                { name: 'Avietės' },
                { $push: { 'years.0.amounts': { variant: 'Didelis indelis', amount: 4 } } }
            );
        await page.goto('/');
        let amount = await openProduct(page, 'Avietės');
        const small = amount.locator('[data-amount-variant-key="Stiklainis"]');
        const large = amount.locator('[data-amount-variant-key="Didelis indelis"]');
        await small.locator('[aria-expanded="false"]').click();
        await small.getByRole('textbox', { name: 'consumed' }).fill('1');
        await large.locator('[aria-expanded="false"]').click();
        await large.getByRole('textbox', { name: 'recycled' }).fill('2');
        await amount.getByRole('button', { name: 'Naujinti' }).click();
        await expect(amount).toBeHidden();
        await expect
            .poll(
                async () => (await db.collection<Product>('products').findOne({ name: 'Avietės' }))?.years?.[0]?.amounts
            )
            .toEqual(
                expect.arrayContaining([
                    { variant: 'Stiklainis', amount: 2 },
                    { variant: 'Didelis indelis', amount: 2 },
                ])
            );
        await page.reload();
        amount = await openProduct(page, 'Avietės');
        await expect(amount.locator('[data-product-summary-total] [data-type="consumed"]')).toBeVisible();
        await expect(amount.locator('[data-product-summary-total] [data-type="recycled"]')).toBeVisible();
    });

    test('moves a stock variant to another product in the same category', async ({ page, db }) => {
        await page.goto('/');
        const amount = await openProduct(page, 'Avietės');
        await amount.getByRole('button', { name: 'Perkelti variantus' }).click();
        const variant = amount.locator('[data-amount-variant-key="Stiklainis"]');
        const selection = variant.getByRole('checkbox', { name: 'Pasirinkite variantą' });
        await selection.check();
        await expect(selection).toBeChecked();
        const target = amount.getByRole('combobox', { name: 'Perkelti į' });
        await target.click();
        await page.getByRole('option', { name: 'Braškės' }).click();
        await amount.getByRole('button', { name: 'Perkelti', exact: true }).click();
        await expect
            .poll(async () =>
                (await db.collection<Product>('products').findOne({ name: 'Braškės' }))?.years?.some(({ amounts }) =>
                    amounts.some(({ amount: quantity }) => quantity === 3)
                )
            )
            .toBe(true);
        await page.reload();
        await expect(productTile(page, 'Braškės')).toContainText('3');
    });

    test('moves stock to another category and copies its variant', async ({ page, db }) => {
        await page.goto('/');
        const amount = await openProduct(page, 'Avietės');
        await amount.getByRole('button', { name: 'Perkelti variantus' }).click();
        await amount
            .locator('[data-amount-variant-key="Stiklainis"]')
            .getByRole('checkbox', { name: 'Pasirinkite variantą' })
            .check();
        await amount.getByRole('combobox', { name: 'Perkelti į' }).click();
        await page.getByRole('option', { name: 'Morkos' }).click();
        await amount.getByRole('button', { name: 'Perkelti', exact: true }).click();
        await expect
            .poll(async () =>
                (await db.collection<Product>('products').findOne({ group: 'Daržovės', name: 'Morkos' }))?.years?.some(
                    ({ amounts }) =>
                        amounts.some(({ variant, amount: quantity }) => variant === 'Stiklainis' && quantity === 3)
                )
            )
            .toBe(true);
        const source = await db.collection<Product>('products').findOne({ group: 'Uogienės', name: 'Avietės' });
        expect(
            source?.years?.flatMap(({ amounts }) => amounts).find(({ variant }) => variant === 'Stiklainis')?.amount ??
                0
        ).toBe(0);
        expect(
            await db.collection<Variant>('variants').findOne({ group: 'Daržovės', variant: 'Stiklainis' })
        ).toMatchObject({ count: 1, units: 'vnt' });
        expect(
            await db.collection<Variant>('variants').countDocuments({ group: 'Uogienės', variant: 'Stiklainis' })
        ).toBe(1);
        await page.reload();
        await page.getByRole('tab', { name: 'Daržovės' }).click();
        await expect(productTile(page, 'Morkos')).toContainText('3');
    });

    test('reclassifies part of consumed stock as discarded from history', async ({ page, db }) => {
        await page.goto('/');
        let amount = await openProduct(page, 'Avietės');
        await amount.locator('[data-amount-variant-key="Stiklainis"] [aria-expanded="false"]').click();
        await amount.getByRole('textbox', { name: 'consumed' }).fill('2');
        await amount.getByRole('button', { name: 'Naujinti' }).click();
        amount = await openProduct(page, 'Avietės');
        await amount.getByRole('tab', { name: 'Istorija' }).click();
        await amount.getByRole('button', { name: /Perkelti į išmesta:.*Stiklainis/ }).click();
        await amount.getByRole('textbox', { name: 'Kiekis' }).fill('-1');
        await amount.getByRole('button', { name: 'Išmesti' }).click();
        await expect
            .poll(async () => (await db.collection<Product>('products').findOne({ name: 'Avietės' }))?.updates?.length)
            .toBe(2);
        const totals = amount.locator('[data-product-summary-total]');
        await expect(totals.locator('[data-type="consumed"]')).toBeVisible();
        await expect(totals.locator('[data-type="recycled"]')).toBeVisible();
        await amount.getByRole('tab', { name: 'Suvartota' }).click();
        await expect(amount.getByRole('table')).toBeVisible();
        expect(await db.collection<Product>('products').countDocuments({ name: 'Avietės' })).toBe(1);
    });
});

test.describe('consumption in the product dialog', () => {
    test.use({ scenario: 'history' });

    test('refreshes both cached histories after saving, undo and redo', async ({ page }) => {
        await page.goto('/');
        let dialog = await openProduct(page, 'Avietės');
        for (const tab of ['Istorija', 'Suvartota']) {
            await dialog.getByRole('tab', { name: tab }).click();
            await expect(dialog.getByRole('table')).toContainText('Suvalgyta su arbata');
        }
        await dialog.getByRole('tab', { name: 'Kiekiai' }).click();
        await dialog.locator('[data-amount-variant-key="Stiklainis"] [aria-expanded="false"]').click();
        await dialog.getByRole('textbox', { name: 'consumed' }).fill('1');
        await dialog.getByRole('textbox', { name: 'Komentaras' }).fill('History cache test');
        await dialog.getByRole('button', { name: 'Naujinti' }).click();
        await expect(dialog).toBeHidden();

        dialog = await openProduct(page, 'Avietės');
        async function expectHistoryOpacity(opacity: string) {
            for (const tab of ['Istorija', 'Suvartota']) {
                await dialog.getByRole('tab', { name: tab }).click();
                const row = dialog.getByRole('table').getByRole('row').filter({ hasText: 'History cache test' });
                await expect(row).toHaveCSS('opacity', opacity);
            }
        }
        await expectHistoryOpacity('1');
        await dialog.getByRole('tab', { name: 'Kiekiai' }).click();
        await dialog.getByRole('button', { name: /Grąžinti/ }).click();
        await expectHistoryOpacity('0.4');
        await dialog.getByRole('tab', { name: 'Kiekiai' }).click();
        await dialog.getByRole('button', { name: /Pakartoti/ }).click();
        await expectHistoryOpacity('1');
    });

    test('consumption totals and history survive reload @critical', async ({ page }) => {
        await page.goto('/');
        let dialog = await openProduct(page, 'Avietės');
        await expect(dialog.locator('[data-product-summary-total] [data-type="consumed"]')).toContainText('1');
        await dialog.getByRole('tab', { name: 'Suvartota' }).click();
        await expect(dialog.getByRole('table')).toContainText('Suvalgyta su arbata');

        await page.reload();
        dialog = await openProduct(page, 'Avietės');
        await expect(dialog.locator('[data-product-summary-total] [data-type="consumed"]')).toContainText('1');
        await dialog.getByRole('tab', { name: 'Suvartota' }).click();
        await expect(dialog.getByRole('table')).toContainText('Suvalgyta su arbata');
    });
});
