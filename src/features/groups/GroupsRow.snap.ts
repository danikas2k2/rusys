import { testPng } from '@tests/fixtures/image';
import { expect, test } from '@tests/fixtures/test';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('category row', async ({ page }) => {
    await page.goto('/categories');
    await expect(page.getByRole('row', { name: /Uogienės/ })).toHaveScreenshot(['GroupsRow', 'category-row.png']);
});

test('saved category image', async ({ page, db }) => {
    await page.goto('/categories');
    await page.getByRole('row', { name: /Uogienės/ }).click();
    const category = page.getByRole('dialog', { name: 'Taisyti kategoriją' });
    await category.locator('input[type="file"]').setInputFiles({
        name: 'category.png',
        mimeType: 'image/png',
        buffer: testPng,
    });
    await category.getByRole('button', { name: 'Naujinti' }).click();
    await expect
        .poll(
            async () =>
                (await db.collection<{ group: string; image?: string }>('groups').findOne({ group: 'Uogienės' }))?.image
        )
        .toContain('/images/');
    await page.reload();
    const row = page.getByRole('row', { name: /Uogienės/ });
    await expect
        .poll(() =>
            row
                .locator('img')
                .first()
                .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)
        )
        .toBe(true);
    await expect(row).toHaveScreenshot(['GroupsRow', 'category-row-image.png']);
});
