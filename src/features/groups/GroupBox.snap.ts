import { expect, test } from '@tests/fixtures/test';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('category creation and editor', async ({ page }) => {
    await page.goto('/categories');
    const table = page.locator('[data-table="groups"]');
    await expect(table.getByRole('row', { name: /Uogienės/ })).toBeVisible();
    await page.locator('[data-action="add"]').click();
    await expect(page.getByRole('dialog', { name: 'Pridėti naują kategoriją' })).toHaveScreenshot([
        'GroupBox',
        'category-create.png',
    ]);
    await page.keyboard.press('Escape');
    await table.getByRole('row', { name: /Uogienės/ }).click();
    await expect(page.getByRole('dialog', { name: 'Taisyti kategoriją' })).toHaveScreenshot([
        'GroupBox',
        'category-editor.png',
    ]);
});
