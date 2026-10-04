import { expect, test } from '@tests/fixtures/visual';
import { waitForImages } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('categories table', async ({ page }) => {
    await page.goto('/categories');
    const table = page.locator('[data-table="groups"]');
    await expect(table.getByRole('row', { name: /Uogienės/ })).toBeVisible();
    await expect(table).toHaveScreenshot(['GroupsTable', 'categories-table.png']);
});

test.describe('with images', () => {
    test.use({ scenario: 'images' });

    test('categories table', async ({ page }) => {
        await page.goto('/categories');
        const table = page.locator('[data-table="groups"]');
        await waitForImages(table, 2);
        await expect(table).toHaveScreenshot(['GroupsTable', 'categories-table-images.png']);
    });
});
