import { expect, test } from '@tests/fixtures/visual';
import { openSummaryHistory } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT', scenario: 'history' });

test('summary history table', async ({ page }) => {
    const history = await openSummaryHistory(page);
    await expect(history.locator('[data-table="history"]')).toHaveScreenshot([
        'SummaryHistoryTab',
        'summary-history-table.png',
    ]);
});
