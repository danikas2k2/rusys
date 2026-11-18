import { expect, test } from '@tests/fixtures/test';
import { openProduct, productTile } from '@tests/helpers/ui';

import type { Product } from '~/schema';

test.describe('product amounts', () => {
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
