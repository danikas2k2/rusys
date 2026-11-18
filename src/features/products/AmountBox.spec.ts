import { expect, test } from '@tests/fixtures/test';
import { openProduct, productTile } from '@tests/helpers/ui';

import type { Product } from '~/schema';

test.describe('consumption in the product dialog', () => {
    test.use({ scenario: 'history' });

    test(
        'persists consumption and refreshes both histories after save, undo and redo',
        { tag: '@critical' },
        async ({ page, db }) => {
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
            await expect(productTile(page, 'Avietės')).toContainText('2');

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
            await expect(productTile(page, 'Avietės')).toContainText('3');
            await dialog.getByRole('tab', { name: 'Kiekiai' }).click();
            await dialog.getByRole('button', { name: /Pakartoti/ }).click();
            await expectHistoryOpacity('1');
            await expect(productTile(page, 'Avietės')).toContainText('2');
            const saved = await db.collection<Product>('products').findOne({ group: 'Uogienės', name: 'Avietės' });
            expect(saved?.years?.[0]?.amounts?.[0]?.amount).toBe(2);
            expect(saved?.updates?.at(-1)?.comment).toBe('History cache test');

            await page.reload();
            dialog = await openProduct(page, 'Avietės');
            await expect(dialog.locator('[data-product-summary-total] [data-type="consumed"]')).toContainText('2');
            await expectHistoryOpacity('1');
        }
    );
});
