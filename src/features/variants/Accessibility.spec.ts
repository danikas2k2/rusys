import { expect, test } from '@tests/fixtures/test';
import { expectNoA11yViolations } from '@tests/playwright/accessibility';

test('scans the variants page', async ({ page }) => {
    await page.goto('/variants');
    await expect(page.locator('[data-table="variants"]')).toBeVisible();
    await expectNoA11yViolations(page);
});
