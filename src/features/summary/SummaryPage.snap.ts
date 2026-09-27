import { expect, test } from '@tests/fixtures/test';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT', scenario: 'history' });

test('summary page', async ({ page }) => {
    await page.goto('/summary');
    await expect(page.locator('[data-summary-tile]').filter({ hasText: 'Avietės' })).toBeVisible();
    await expect(page).toHaveScreenshot(['SummaryPage', 'summary-page.png']);
});
