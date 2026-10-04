import { expect, test } from '@tests/fixtures/visual';
import { productTile, waitForImages } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('category rail', async ({ page }) => {
    await page.goto('/');
    await expect(productTile(page, 'Avietės')).toBeVisible();
    await expect(page.locator('[data-tabs="category-rail"]')).toHaveScreenshot(['CategoryRail', 'category-rail.png']);
});

test.describe('with images', () => {
    test.use({ scenario: 'images' });

    test('category rail', async ({ page }) => {
        await page.goto('/');
        const rail = page.locator('[data-tabs="category-rail"]');
        await waitForImages(rail, 2);
        await expect(rail).toHaveScreenshot(['CategoryRail', 'category-rail-images.png']);
    });
});
