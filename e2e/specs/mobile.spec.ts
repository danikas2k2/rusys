import { expect, test } from '../fixtures/test';

test('mobile menu and product amounts work with touch', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Meniu' }).tap();
    await page.getByRole('menu').getByRole('link', { name: 'Variantai' }).tap();
    await expect(page.locator('[data-table="variants"]')).toBeVisible();
    await page.getByRole('button', { name: 'Meniu' }).tap();
    await page.getByRole('menu').getByRole('link', { name: 'Produktai' }).tap();
    await page.locator('[data-tile-kind="product"]').filter({ hasText: 'Avietės' }).tap();
    const dialog = page.getByRole('dialog', { name: /Avietės Uogienės/ });
    await expect(dialog.getByRole('tab', { name: 'Kiekiai' })).toBeVisible();
    await dialog.getByRole('button', { name: 'Uždaryti' }).tap();
    await expect(dialog).toHaveCount(0);
});
