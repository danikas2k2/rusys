import { expect, test } from '@tests/fixtures/visual';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT', scenario: 'history' });

test('summary page', async ({ page }) => {
    await page.goto('/summary');
    await expect(page.locator('[data-summary-tile]').filter({ hasText: 'Avietės' })).toBeVisible();
    await expect(page).toHaveScreenshot(['SummaryPage', 'summary-page.png']);
});

test.describe('with images', () => {
    test.use({ scenario: 'history-images' });

    test('summary page', async ({ page }) => {
        await page.goto('/summary');
        await expect(page.locator('[data-summary-tile]').filter({ hasText: 'Avietės' }).first()).toBeVisible();
        await expect(page).toHaveScreenshot(['SummaryPage', 'summary-page-images.png']);
    });
});

test.describe('consumed and recycled', () => {
    test.use({ scenario: 'consumed-recycled' });

    test('summary page', async ({ page }) => {
        await page.goto('/summary');
        await expect(page.locator('[data-summary-tile]').filter({ hasText: 'Avietės' }).first()).toBeVisible();
        await expect(page).toHaveScreenshot(['SummaryPage', 'summary-page-consumed-and-recycled.png']);
    });
});
