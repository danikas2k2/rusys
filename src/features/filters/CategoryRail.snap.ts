import { expect, test } from '@tests/fixtures/test';
import { productTile } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('category rail', async ({ page }) => {
    await page.goto('/');
    await expect(productTile(page, 'Avietės')).toBeVisible();
    await expect(page.locator('[data-tabs="category-rail"]')).toHaveScreenshot(['CategoryRail', 'category-rail.png']);
});
