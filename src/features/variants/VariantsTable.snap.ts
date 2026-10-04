import { expect, test } from '@tests/fixtures/visual';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('variants table', async ({ page }) => {
    await page.goto('/variants');
    const table = page.locator('[data-table="variants"]');
    await expect(table.getByRole('row', { name: /Stiklainis/ }).first()).toBeVisible();
    await expect(table).toHaveScreenshot(['VariantsTable', 'variants-table.png']);
});
