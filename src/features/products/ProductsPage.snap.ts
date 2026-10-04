import { expect, test } from '@tests/fixtures/visual';
import { productTile, waitForImages, waitForTileBackground } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('products page', async ({ page }) => {
    await page.goto('/');
    await expect(productTile(page, 'Avietės')).toBeVisible();
    await expect(page).toHaveScreenshot(['ProductsPage', 'products-page.png']);
});

test.describe('with images', () => {
    test.use({ scenario: 'images' });

    test('products page', async ({ page }) => {
        await page.goto('/');
        await waitForImages(page.locator('[data-tabs="category-rail"]'), 2);
        await waitForTileBackground(productTile(page, 'Avietės'));
        await waitForTileBackground(productTile(page, 'Braškės'));
        await expect(page).toHaveScreenshot(['ProductsPage', 'products-page-images.png']);
    });
});
