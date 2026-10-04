import { expect, test } from '@tests/fixtures/visual';
import { productTile } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('navigation drawer and utilities in both themes', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(productTile(page, 'Avietės')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute(
        'data-mantine-color-scheme',
        testInfo.project.name.endsWith('-dark') ? 'dark' : 'light'
    );
    await page.getByRole('button', { name: 'Meniu' }).click();
    const menu = page.getByRole('menu');
    await expect(menu.getByRole('dialog')).toBeVisible();
    await expect(menu.getByRole('dialog')).toHaveScreenshot(['ToolbarMenu', 'navigation-drawer.png']);
    await menu.getByRole('link', { name: 'Įrankiai' }).click();
    await expect(menu.getByText('Importuoti', { exact: true })).toBeVisible();
    await expect(menu.getByRole('dialog')).toHaveScreenshot(['ToolbarMenu', 'navigation-utilities.png']);
});
