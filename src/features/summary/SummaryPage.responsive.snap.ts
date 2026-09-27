import { expect, test } from '@tests/fixtures/test';

test.use({ colorScheme: 'light', reducedMotion: 'reduce', locale: 'lt-LT', scenario: 'history' });

test('summary page and history dialog', async ({ page }) => {
    await page.goto('/summary');
    const tile = page.locator('[data-summary-tile]').filter({ hasText: 'Avietės' });
    await expect(tile).toBeVisible();
    await expect(page).toHaveScreenshot(['SummaryPage', 'summary-page.png']);

    await tile.click();
    const history = page.getByRole('dialog').last();
    await expect(history).toContainText('Suvalgyta su arbata');
    await expect(history).toHaveScreenshot(['SummaryPage', 'summary-history-dialog.png']);
});
