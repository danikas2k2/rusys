import { expect, test } from '@tests/fixtures/test';
import { productTile } from '@tests/helpers/ui';

test.use({ colorScheme: 'light', reducedMotion: 'reduce', locale: 'lt-LT' });

test('import and export dialogs', async ({ page }) => {
    await page.goto('/');
    await expect(productTile(page, 'Avietės')).toBeVisible();
    await page.getByRole('button', { name: 'Meniu' }).click();
    const menu = page.getByRole('menu');
    await menu.getByRole('link', { name: 'Įrankiai' }).click();
    await menu.getByText('Importuoti', { exact: true }).click();
    const importDialog = page.getByRole('dialog', { name: 'Importuoti' });
    await expect(importDialog).toHaveScreenshot(['ImportBox', 'import-dialog.png']);

    await page.keyboard.press('Escape');
    await expect(importDialog).toHaveCount(0);
    await page.getByRole('button', { name: 'Meniu' }).click();
    await menu.getByRole('link', { name: 'Įrankiai' }).click();
    await menu.getByText('Eksportuoti', { exact: true }).click();
    await expect(page.getByRole('dialog', { name: /Eksportuoti duomenis/ })).toHaveScreenshot([
        'ImportBox',
        'export-dialog.png',
    ]);
});
