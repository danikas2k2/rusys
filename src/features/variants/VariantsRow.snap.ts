import { expect, test } from '@tests/fixtures/visual';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('variant row', async ({ page }) => {
    await page.goto('/variants');
    await expect(
        page
            .locator('[data-table="variants"]')
            .getByRole('row', { name: /Stiklainis/ })
            .first()
    ).toHaveScreenshot(['VariantsRow', 'variant-row.png']);
});
