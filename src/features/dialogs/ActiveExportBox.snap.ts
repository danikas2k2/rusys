import { expect, test } from '@tests/fixtures/visual';
import { productTile } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('export dialog', async ({ page }) => {
    await page.goto('/');
    await expect(productTile(page, 'Avietės')).toBeVisible();
    await page.getByRole('button', { name: 'Meniu' }).click();
    const menu = page.getByRole('menu');
    await menu.getByRole('link', { name: 'Įrankiai' }).click();
    await menu.getByText('Eksportuoti', { exact: true }).click();
    await expect(page.getByRole('dialog', { name: /Eksportuoti duomenis/ })).toHaveScreenshot([
        'ActiveExportBox',
        'export-dialog.png',
    ]);
});
