import { expect, test } from '@tests/fixtures/test';

test.use({ colorScheme: 'light', reducedMotion: 'reduce', locale: 'lt-LT' });

test.describe('desktop', () => {
    test.skip(({ isMobile }) => isMobile);

    test('category table and editors', async ({ page }) => {
        await page.goto('/categories');
        const table = page.locator('[data-table="groups"]');
        await expect(table.getByRole('row', { name: /Uogienės/ })).toBeVisible();
        await expect(page).toHaveScreenshot(['GroupsPage', 'categories-page.png']);
        await expect(table).toHaveScreenshot(['GroupsPage', 'categories-table.png']);
        await expect(table.getByRole('row', { name: /Uogienės/ })).toHaveScreenshot(['GroupsPage', 'category-row.png']);
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
});

test.describe('mobile', () => {
    test.use({ scenario: 'history' });
    test.skip(({ isMobile }) => !isMobile);

    test('mobile category table', async ({ page }) => {
        await page.goto('/categories');
        await expect(page.locator('[data-table="groups"]')).toBeVisible();
        await expect(page).toHaveScreenshot(['GroupsPage', 'mobile-categories-page.png']);
    });
});
