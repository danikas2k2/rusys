import { expect, test } from '@tests/fixtures/visual';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('categories page', async ({ page }) => {
    await page.goto('/categories');
    const table = page.locator('[data-table="groups"]');
    await expect(table.getByRole('row', { name: /Uogienės/ })).toBeVisible();
    await expect(page).toHaveScreenshot(['GroupsPage', 'categories-page.png']);
});
