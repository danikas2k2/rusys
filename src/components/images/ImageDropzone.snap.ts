import { expect, test } from '@tests/fixtures/test';
import { openProduct, productTile } from '@tests/helpers/ui';

test.use({ colorScheme: 'light', reducedMotion: 'reduce', locale: 'lt-LT' });

const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==',
    'base64'
);

test.describe('desktop', () => {
    test('uploaded category and product images', async ({ page, db }) => {
        await page.goto('/categories');
        await page.getByRole('row', { name: /Uogienės/ }).click();
        const category = page.getByRole('dialog', { name: 'Taisyti kategoriją' });
        await category.locator('input[type="file"]').setInputFiles({
            name: 'category.png',
            mimeType: 'image/png',
            buffer: png,
        });
        await expect(category).toHaveScreenshot(['ImageDropzone', 'category-image-selected.png']);
        await category.getByRole('button', { name: 'Naujinti' }).click();
        await expect
            .poll(
                async () =>
                    (await db.collection<{ group: string; image?: string }>('groups').findOne({ group: 'Uogienės' }))
                        ?.image
            )
            .toContain('/images/');
        await page.reload();
        const categoryRow = page.getByRole('row', { name: /Uogienės/ });
        await expect(categoryRow).toBeVisible();
        await expect
            .poll(() =>
                categoryRow
                    .locator('img')
                    .first()
                    .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)
            )
            .toBe(true);
        await expect(categoryRow).toHaveScreenshot(['ImageDropzone', 'category-row-image.png']);

        await page.goto('/');
        const amounts = await openProduct(page, 'Avietės');
        await amounts.getByRole('button', { name: 'Taisyti' }).click();
        const product = page.getByRole('dialog', { name: 'Taisyti produktą' });
        await product.locator('input[type="file"]').setInputFiles({
            name: 'product.png',
            mimeType: 'image/png',
            buffer: png,
        });
        await expect(product).toHaveScreenshot(['ImageDropzone', 'product-image-selected.png']);
        await product.getByRole('button', { name: 'Naujinti' }).click();
        await expect
            .poll(
                async () =>
                    (await db.collection<{ name: string; image?: string }>('products').findOne({ name: 'Avietės' }))
                        ?.image
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
        await expect(tile).toHaveScreenshot(['ImageDropzone', 'product-tile-image.png']);
    });
});
