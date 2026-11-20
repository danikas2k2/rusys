import { currentYear } from '@tests/fixtures/data';
import { expect, test } from '@tests/fixtures/test';
import { openProduct } from '@tests/helpers/ui';

import type { Product } from '~/schema';

test.use({ scenario: 'annual' });

test.describe('annual products', { tag: '@critical' }, () => {
    test('offers consumption periods without stock and shows their totals and history', async ({ page, db }) => {
        const consumptionYear = currentYear - 1;
        await db.collection<Product>('products').updateOne(
            { name: 'Avietės' },
            {
                $set: {
                    years: [{ year: currentYear, amounts: [{ variant: 'Stiklainis', amount: 3 }] }],
                    updates: [
                        {
                            time: new Date(2000 + consumptionYear, 9, 1, 12).getTime(),
                            comment: 'Consumption without stock',
                            years: [
                                {
                                    year: currentYear - 3,
                                    amounts: [{ variant: 'Stiklainis', amount: -2, recycled: false }],
                                },
                            ],
                        },
                    ],
                },
            }
        );
        await page.goto('/');
        const dialog = await openProduct(page, 'Avietės');
        await dialog
            .locator('label')
            .filter({ hasText: new RegExp(`^${consumptionYear}$`) })
            .click();
        await expect(dialog.getByRole('radio', { name: String(consumptionYear), exact: true })).toBeChecked();
        await expect(dialog.locator('[data-product-stock-total]')).toBeEmpty();
        await expect(dialog.locator('[data-product-summary-total]')).toContainText('2');
        await dialog.getByRole('tab', { name: 'Suvartota' }).click();
        await expect(dialog.getByRole('table')).toContainText('Consumption without stock');

        await dialog
            .locator('label')
            .filter({ hasText: new RegExp(`^${currentYear}$`) })
            .click();
        await expect(dialog.getByRole('radio', { name: String(currentYear), exact: true })).toBeChecked();
        const consumedPanel = dialog.getByRole('tabpanel', { name: 'Suvartota' });
        await expect(consumedPanel.getByRole('table')).toBeAttached();
        await expect(consumedPanel.getByRole('table').getByRole('row')).toHaveCount(0);
        await expect(consumedPanel.locator('.ui-Loader-root')).toHaveCount(0);
        let release!: () => void;
        const pending = new Promise<void>((resolve) => {
            release = resolve;
        });
        let requests = 0;
        await page.route('**/*', async (route) => {
            if (route.request().headers()['next-action']) {
                requests++;
                await pending;
            }
            await route.continue();
        });
        try {
            await dialog
                .locator('label')
                .filter({ hasText: new RegExp(`^${consumptionYear}$`) })
                .click();
            await expect.poll(() => requests).toBeGreaterThan(0);
            await expect(dialog.locator('[data-product-summary-total]')).toContainText('2');
            // Cached history and totals remain visible with background requests blocked.
            await expect(dialog.getByRole('table')).toContainText('Consumption without stock');
            await expect(dialog.getByRole('tabpanel', { name: 'Suvartota' }).locator('.ui-Loader-root')).toHaveCount(0);
        } finally {
            release();
        }
    });
});
