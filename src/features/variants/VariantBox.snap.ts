import { expect, test } from '@tests/fixtures/test';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('variant creation and editor', async ({ page }) => {
    await page.goto('/variants');
    const table = page.locator('[data-table="variants"]');
    await expect(table.getByRole('row', { name: /Stiklainis/ }).first()).toBeVisible();
    await page.locator('[data-action="add"]').click();
    await expect(page.getByRole('dialog', { name: 'Pridėti naują variantą' })).toHaveScreenshot([
        'VariantBox',
        'variant-create.png',
    ]);
    await page.keyboard.press('Escape');
    await table
        .getByRole('row', { name: /Stiklainis/ })
        .first()
        .click();
    await expect(page.getByRole('dialog', { name: 'Taisyti variantą' })).toHaveScreenshot([
        'VariantBox',
        'variant-editor.png',
    ]);
});
