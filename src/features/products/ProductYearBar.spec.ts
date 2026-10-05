import { currentYear } from '@tests/fixtures/data';
import { expect, test } from '@tests/fixtures/test';
import { openProduct, productTile } from '@tests/helpers/ui';

import type { Product } from '~/common/data';

test.use({ scenario: 'annual' });

test.describe('annual products', () => {
    test('switches annual content and persists the removal marker', async ({ page, db }) => {
        await page.goto('/');
        const amount = await openProduct(page, 'Avietės');
        await test.step('switches between years', async () => {
            await amount
                .locator('label')
                .filter({ hasText: String(currentYear) })
                .click();
            await expect(amount.locator('[data-amount-variant-key="Stiklainis"]')).toContainText('3');
            await amount
                .locator('label')
                .filter({ hasText: String(currentYear - 1) })
                .click();
            await expect(amount.locator('[data-amount-variant-key="Stiklainis"]')).toContainText('2');
        });

        await test.step('annual years remain separate and removal marker persists', async () => {
            await expect(amount.getByRole('radio', { name: String(currentYear - 1) })).toBeChecked();
            await amount
                .locator('label')
                .filter({ hasText: String(currentYear) })
                .click();
            await expect(amount.locator('[data-amount-variant-key="Stiklainis"]')).toContainText('3');
            await amount.getByRole('button', { name: 'Šie metai naikinami?' }).click();
            await expect(productTile(page, 'Avietės')).toHaveAttribute('data-removing', 'true');
            await expect
                .poll(async () => {
                    const item = await db.collection<Product>('products').findOne({ name: 'Avietės' });
                    return item?.years?.find(({ year }) => year === currentYear)?.removing;
                })
                .toBe(true);
            await page.reload();
            const product = await db.collection<Product>('products').findOne({ name: 'Avietės' });
            expect(product?.years?.find(({ year }) => year === currentYear)?.removing).toBe(true);
            expect(product?.years?.find(({ year }) => year === currentYear - 1)?.amounts?.[0]?.amount).toBe(2);
        });
    });
});
