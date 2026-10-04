import { expect, test } from '@tests/fixtures/visual';
import { openSummaryHistory } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT', scenario: 'history' });

test('summary year bar', async ({ page }) => {
    const history = await openSummaryHistory(page);
    await expect(history.locator('[data-summary-year-bar]')).toHaveScreenshot([
        'SummaryYearBar',
        'summary-year-bar.png',
    ]);
});
