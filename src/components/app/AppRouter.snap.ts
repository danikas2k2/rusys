import { expect, test } from '@tests/fixtures/test';
import { productTile } from '@tests/helpers/ui';

test.use({ colorScheme: 'light', reducedMotion: 'reduce', locale: 'lt-LT' });

test.describe('desktop', () => {
    test.skip(({ isMobile }) => isMobile);

    test('navigation drawer and dark theme', async ({ page }) => {
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await page.getByRole('button', { name: 'Meniu' }).click();
        const menu = page.getByRole('menu');
        await expect(menu.getByRole('dialog')).toBeVisible();
        await expect(menu.getByRole('dialog')).toHaveScreenshot(['AppRouter', 'navigation-drawer.png']);
        await menu.getByRole('link', { name: 'Įrankiai' }).click();
        await expect(menu.getByText('Importuoti', { exact: true })).toBeVisible();
        await expect(menu.getByRole('dialog')).toHaveScreenshot(['AppRouter', 'navigation-utilities.png']);

        await menu.getByRole('switch', { name: 'Tamsi tema' }).locator('..').click();
        await page.getByRole('button', { name: 'Meniu' }).click();
        await expect(productTile(page, 'Avietės')).toHaveScreenshot(['AppRouter', 'product-tile-dark.png']);
        await expect(page.locator('.Toolbar')).toHaveScreenshot(['AppRouter', 'toolbar-dark.png']);
    });
});

test.describe('mobile', () => {
    test.use({ scenario: 'history' });
    test.skip(({ isMobile }) => !isMobile);

    test('mobile navigation drawer', async ({ page }) => {
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await page.getByRole('button', { name: 'Meniu' }).tap();
        await expect(page.getByRole('menu').getByRole('dialog')).toHaveScreenshot([
            'AppRouter',
            'mobile-navigation.png',
        ]);
    });
});
