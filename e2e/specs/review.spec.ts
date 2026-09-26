import type { Product } from '~/common/data';
import { expect, test } from '../fixtures/test';
import { productTile } from '../helpers/ui';

test.use({ scenario: 'review' });

test('review changes only the touched category and persists missing status @critical', async ({ page, db }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Peržiūra' }).click();
    const review = page.getByRole('dialog').last();
    await review.getByRole('row', { name: 'Avietės' }).getByRole('checkbox').check();
    await review.getByRole('button', { name: 'Taikyti' }).click();
    await expect(review).toHaveCount(0);
    await expect(productTile(page, 'Avietės').getByRole('checkbox', { name: 'Pažymėti kaip trūkstamą' })).toBeChecked();
    await page.reload();
    await expect
        .poll(async () => (await db.collection<Product>('products').findOne({ name: 'Avietės' }))?.missing)
        .toBeFalsy();
    expect((await db.collection<Product>('products').findOne({ name: 'Agurkai' }))?.missing).toBeUndefined();
});

test('missing-only filter reacts to a product checkbox', async ({ page, db }) => {
    await page.goto('/');
    await expect(productTile(page, 'Avietės')).toBeVisible();
    await page.getByRole('checkbox', { name: 'Trūksta 1 produkto' }).click();
    await expect(productTile(page, 'Avietės')).toBeVisible();
    await expect(productTile(page, 'Braškės')).toBeHidden();
    await productTile(page, 'Avietės').getByRole('checkbox', { name: 'Pažymėti kaip turimą' }).click();
    await expect(productTile(page, 'Braškės')).toBeVisible();
    await expect
        .poll(async () => (await db.collection<Product>('products').findOne({ name: 'Avietės' }))?.missing)
        .toBeFalsy();
});

test('select-all can return a category to untouched without saving changes', async ({ page, db }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Peržiūra' }).click();
    const review = page.getByRole('dialog').last();
    const master = review.getByRole('row', { name: 'Uogienės' }).getByRole('checkbox');
    await master.click();
    await expect(master).toHaveAttribute('data-untouched', 'false');
    await master.click();
    await expect(master).toBeChecked();
    await master.click();
    await expect(master).toHaveAttribute('data-untouched', 'true');
    await review.getByRole('button', { name: 'Taikyti' }).click();
    expect((await db.collection<Product>('products').findOne({ name: 'Avietės' }))?.missing).toBe(true);
});
