import { expect, test } from '@tests/fixtures/visual';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('category row', async ({ page }) => {
    await page.goto('/categories');
    await expect(page.getByRole('row', { name: /Uogienės/ })).toHaveScreenshot(['GroupsRow', 'category-row.png']);
});

test.describe('with image', () => {
    test.use({ scenario: 'images' });

    test('category row', async ({ page }) => {
        await page.goto('/categories');
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
});
