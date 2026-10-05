import { expect, test } from '@tests/fixtures/test';
import { openProduct, productTile } from '@tests/helpers/ui';

import type { Product } from '~/common/data';

test.describe('product amounts', () => {
    test('animates variant expansion and dialog controls', async ({ page }) => {
        await page.goto('/');
        const amount = await openProduct(page, 'Avietės');
        await test.step('animates variant expansion', async () => {
            await page.evaluate(() => {
                const original = document.startViewTransition.bind(document);
                const counter = window as typeof window & { __variantViewTransitions: number };
                counter.__variantViewTransitions = 0;
                document.startViewTransition = (...args) => {
                    counter.__variantViewTransitions += 1;
                    return original(...args);
                };
            });

            const variant = amount.locator('[data-amount-variant-key="Stiklainis"]');
            await variant.locator('[aria-expanded="false"]').click();
            await expect(variant.locator('[aria-expanded="true"]')).toBeVisible();
            await expect
                .poll(() =>
                    page.evaluate(
                        () => (window as typeof window & { __variantViewTransitions: number }).__variantViewTransitions
                    )
                )
                .toBeGreaterThan(0);
            const afterExpand = await page.evaluate(
                () => (window as typeof window & { __variantViewTransitions: number }).__variantViewTransitions
            );

            await variant.locator('[aria-expanded="true"]').click();
            await expect(variant.locator('[aria-expanded="false"]')).toBeVisible();
            await expect
                .poll(() =>
                    page.evaluate(
                        () => (window as typeof window & { __variantViewTransitions: number }).__variantViewTransitions
                    )
                )
                .toBeGreaterThan(afterExpand);
        });

        await test.step('animates tab content and variant-selection controls', async () => {
            await page.evaluate(() => {
                const original = document.startViewTransition.bind(document);
                const counter = window as typeof window & { __dialogViewTransitions: number };
                counter.__dialogViewTransitions = 0;
                document.startViewTransition = (...args) => {
                    counter.__dialogViewTransitions += 1;
                    return original(...args);
                };
            });

            await amount.getByRole('tab', { name: 'Istorija' }).click();
            await expect(amount.getByRole('tabpanel', { name: 'Istorija' })).toBeVisible();
            await expect
                .poll(() =>
                    page.evaluate(
                        () => (window as typeof window & { __dialogViewTransitions: number }).__dialogViewTransitions
                    )
                )
                .toBeGreaterThan(0);
            const afterTabSwitch = await page.evaluate(
                () => (window as typeof window & { __dialogViewTransitions: number }).__dialogViewTransitions
            );

            await amount.getByRole('tab', { name: 'Kiekiai' }).click();
            await expect(amount.getByRole('tabpanel', { name: 'Kiekiai' })).toBeVisible();
            await expect
                .poll(() =>
                    page.evaluate(
                        () => (window as typeof window & { __dialogViewTransitions: number }).__dialogViewTransitions
                    )
                )
                .toBeGreaterThan(afterTabSwitch);
            await page.evaluate(() => {
                (window as typeof window & { __dialogViewTransitions: number }).__dialogViewTransitions = 0;
            });
            await amount.getByRole('button', { name: 'Perkelti variantus' }).click();
            await expect(amount.getByRole('checkbox')).toHaveCount(1);
            await expect
                .poll(() =>
                    page.evaluate(
                        () => (window as typeof window & { __dialogViewTransitions: number }).__dialogViewTransitions
                    )
                )
                .toBeGreaterThan(0);
            const afterMoveStart = await page.evaluate(
                () => (window as typeof window & { __dialogViewTransitions: number }).__dialogViewTransitions
            );
            await amount.getByRole('button', { name: 'Atšaukti' }).click();
            await expect(amount.getByRole('checkbox')).toHaveCount(0);
            await expect
                .poll(() =>
                    page.evaluate(
                        () => (window as typeof window & { __dialogViewTransitions: number }).__dialogViewTransitions
                    )
                )
                .toBeGreaterThan(afterMoveStart);
        });
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
        await page.goto('/summary');
        await expect(
            page.locator('[data-summary-tile]').filter({ hasText: 'Avietės' }).locator('[data-type="recycled"]')
        ).toBeVisible();
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

    test('reclassifies part of consumed stock as discarded from history', async ({ page, db }) => {
        await page.goto('/');
        let amount = await openProduct(page, 'Avietės');
        await amount.locator('[data-amount-variant-key="Stiklainis"] [aria-expanded="false"]').click();
        await amount.getByRole('textbox', { name: 'consumed' }).fill('2');
        await amount.getByRole('button', { name: 'Naujinti' }).click();
        amount = await openProduct(page, 'Avietės');
        await amount.getByRole('tab', { name: 'Istorija' }).click();
        await amount.locator('[data-table="history"] tbody tr').first().click();
        await amount.getByRole('textbox', { name: 'amount' }).fill('1');
        await amount.getByRole('button', { name: /Perkelti/ }).click();
        await expect
            .poll(async () => (await db.collection<Product>('products').findOne({ name: 'Avietės' }))?.updates?.length)
            .toBe(2);
        await page.goto('/summary');
        const tile = page.locator('[data-summary-tile]').filter({ hasText: 'Avietės' });
        await expect(tile.locator('[data-type="consumed"]')).toBeVisible();
        await expect(tile.locator('[data-type="recycled"]')).toBeVisible();
        expect(await db.collection<Product>('products').countDocuments({ name: 'Avietės' })).toBe(1);
    });
});
