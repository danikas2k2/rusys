import { expect, test } from '@tests/fixtures/test';

test.use({ colorScheme: 'light', reducedMotion: 'reduce', locale: 'lt-LT' });

test.describe('desktop', () => {
    test('variant table and editors', async ({ page }) => {
        await page.goto('/variants');
        const table = page.locator('[data-table="variants"]');
        await expect(table.getByRole('row', { name: /Stiklainis/ }).first()).toBeVisible();
        await expect(page).toHaveScreenshot(['VariantsPage', 'variants-page.png']);
        await expect(table).toHaveScreenshot(['VariantsPage', 'variants-table.png']);
        await expect(table.getByRole('row', { name: /Stiklainis/ }).first()).toHaveScreenshot([
            'VariantsPage',
            'variant-row.png',
        ]);
        await page.locator('[data-action="add"]').click();
        await expect(page.getByRole('dialog', { name: 'Pridėti naują variantą' })).toHaveScreenshot([
            'VariantsPage',
            'variant-create.png',
        ]);
        await page.keyboard.press('Escape');
        await table
            .getByRole('row', { name: /Stiklainis/ })
            .first()
            .click();
        await expect(page.getByRole('dialog', { name: 'Taisyti variantą' })).toHaveScreenshot([
            'VariantsPage',
            'variant-editor.png',
        ]);
    });
});
