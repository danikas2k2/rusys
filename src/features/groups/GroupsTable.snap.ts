import { expect, test } from '@tests/fixtures/test';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('categories table', async ({ page }) => {
    await page.goto('/categories');
    const table = page.locator('[data-table="groups"]');
    await expect(table.getByRole('row', { name: /Uogienės/ })).toBeVisible();
    await expect(table).toHaveScreenshot(['GroupsTable', 'categories-table.png']);
});
