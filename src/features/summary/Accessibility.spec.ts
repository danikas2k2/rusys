import { expect, test } from '@tests/fixtures/test';
import { expectNoA11yViolations } from '@tests/playwright/accessibility';

test.describe('summary accessibility', () => {
    test.use({ scenario: 'history' });

    test('scans the summary page', async ({ page }) => {
        await page.goto('/summary');
        await expect(page.locator('[data-summary-tile]').first()).toBeVisible();
        await expectNoA11yViolations(page);
    });
});
