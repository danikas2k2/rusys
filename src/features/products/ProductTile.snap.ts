import { testPng } from '@tests/fixtures/image';
import { expect, test } from '@tests/fixtures/test';
import { openProduct, productTile } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('product tiles with and without stock', async ({ page }) => {
    await page.goto('/');
    await expect(productTile(page, 'Avietės')).toHaveScreenshot(['ProductTile', 'product-tile-stock.png']);
    await expect(productTile(page, 'Braškės')).toHaveScreenshot(['ProductTile', 'product-tile-empty.png']);
});

test.describe('review', () => {
    test.use({ scenario: 'review' });

    test('missing product tile', async ({ page }) => {
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toHaveScreenshot(['ProductTile', 'product-tile-missing.png']);
    });
});

test('saved product image', async ({ page, db }) => {
    await page.goto('/');
    const amounts = await openProduct(page, 'Avietės');
    await amounts.getByRole('button', { name: 'Taisyti' }).click();
    const product = page.getByRole('dialog', { name: 'Taisyti produktą' });
    await product.locator('input[type="file"]').setInputFiles({
        name: 'product.png',
        mimeType: 'image/png',
        buffer: testPng,
    });
    await product.getByRole('button', { name: 'Naujinti' }).click();
    await expect
        .poll(
            async () =>
                (await db.collection<{ name: string; image?: string }>('products').findOne({ name: 'Avietės' }))?.image
        )
        .toContain('/images/');
    await page.reload();
    const tile = productTile(page, 'Avietės');
    const icon = tile.locator('[data-icon-bg]');
    await expect(icon).toBeVisible();
    await icon.evaluate(async (element) => {
        const source = getComputedStyle(element).backgroundImage.match(/^url\(["']?(.*?)["']?\)$/)?.[1];
        if (!source) {
            throw new Error('Product icon has no background image');
        }
        const image = new Image();
        image.src = source;
        await image.decode();
    });
    await expect(tile).toHaveScreenshot(['ProductTile', 'product-tile-image.png']);
});
