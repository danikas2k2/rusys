import { expect, test } from '@tests/fixtures/test';
import { productTile } from '@tests/helpers/ui';

import type { Product } from '~/schema';

test.use({ scenario: 'review' });

test.describe('review', { tag: '@critical' }, () => {
    test('review changes only the touched category and persists missing status', async ({ page, db }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Peržiūra' }).click();
        const review = page.getByRole('dialog').last();
        await review.getByRole('row', { name: 'Avietės' }).getByRole('checkbox').check();
        await review.getByRole('button', { name: 'Taikyti' }).click();
        await expect(review).toHaveCount(0);
        await expect(
            productTile(page, 'Avietės').getByRole('checkbox', { name: 'Pažymėti kaip trūkstamą' })
        ).toBeChecked();
        await page.reload();
        await expect
            .poll(async () => (await db.collection<Product>('products').findOne({ name: 'Avietės' }))?.missing)
            .toBeFalsy();
        expect((await db.collection<Product>('products').findOne({ name: 'Morkos' }))?.missing).toBeUndefined();
    });
});
