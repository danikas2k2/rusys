import { expect, test } from '@tests/fixtures/test';
import { productTile } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('toolbar and filtered state', async ({ page }) => {
    await page.goto('/');
    await expect(productTile(page, 'Avietės')).toBeVisible();
    const toolbar = page.locator('.Toolbar');
    await expect(toolbar).toHaveScreenshot(['Toolbar', 'toolbar.png']);
    await page.getByRole('searchbox', { name: 'filtruokite' }).fill('Avietės');
    await expect(toolbar).toHaveScreenshot(['Toolbar', 'toolbar-filtered.png']);
});
