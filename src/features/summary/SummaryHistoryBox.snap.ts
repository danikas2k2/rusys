import { expect, test } from '@tests/fixtures/visual';
import { openSummaryHistory } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT', scenario: 'history' });

test('summary history dialog', async ({ page }) => {
    const history = await openSummaryHistory(page);
    await expect(history).toContainText('Suvalgyta su arbata');
    await expect(history).toHaveScreenshot(['SummaryHistoryBox', 'summary-history-dialog.png']);
});
