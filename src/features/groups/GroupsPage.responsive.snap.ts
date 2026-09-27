import { expect, test } from '@tests/fixtures/test';

test.use({ colorScheme: 'light', reducedMotion: 'reduce', locale: 'lt-LT' });

test('categories page and editor dialogs', async ({ page }) => {
    await page.goto('/categories');
    const table = page.locator('[data-table="groups"]');
    await expect(table.getByRole('row', { name: /Uogienės/ })).toBeVisible();
    await expect(page).toHaveScreenshot(['GroupsPage', 'categories-page.png']);

    await page.locator('[data-action="add"]').click();
    await expect(page.getByRole('dialog', { name: 'Pridėti naują kategoriją' })).toHaveScreenshot([
        'GroupsPage',
        'category-create.png',
    ]);
    await page.keyboard.press('Escape');
    await table.getByRole('row', { name: /Uogienės/ }).click();
    await expect(page.getByRole('dialog', { name: 'Taisyti kategoriją' })).toHaveScreenshot([
        'GroupsPage',
        'category-editor.png',
    ]);
});
