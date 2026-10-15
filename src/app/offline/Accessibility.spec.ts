import { expect, test } from '@tests/fixtures/test';
import { expectNoA11yViolations } from '@tests/playwright/accessibility';

test('scans the offline page', async ({ page }) => {
    await page.goto('/offline');
    await expect(page.locator('main h1')).toBeVisible();
    await expectNoA11yViolations(page);
});
