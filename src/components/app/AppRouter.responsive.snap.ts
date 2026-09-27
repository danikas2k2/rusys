import { expect, test } from '@tests/fixtures/test';
import { productTile } from '@tests/helpers/ui';

test.use({ colorScheme: 'light', reducedMotion: 'reduce', locale: 'lt-LT' });

test('navigation drawer', async ({ page }) => {
    await page.goto('/');
    await expect(productTile(page, 'Avietės')).toBeVisible();
    await page.getByRole('button', { name: 'Meniu' }).click();
    await expect(page.getByRole('menu').getByRole('dialog')).toHaveScreenshot(['AppRouter', 'navigation-drawer.png']);
});
