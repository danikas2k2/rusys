import { expect, test } from '@tests/fixtures/visual';
import { productTile } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('filtered toolbar', async ({ page }) => {
    await page.goto('/');
    await expect(productTile(page, 'Avietės')).toBeVisible();
    const toolbar = page.locator('.Toolbar');
    const filter = page.getByRole('searchbox', { name: 'filtruokite' });
    await expect
        .poll(async () => {
            await filter.fill('Avietės');
            return toolbar.getByRole('button', { name: 'Išvalyti' }).isVisible();
        })
        .toBe(true);
    await expect(toolbar).toHaveScreenshot(['Toolbar', 'toolbar-filtered.png']);
});
