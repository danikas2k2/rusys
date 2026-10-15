import { expect, test } from '@tests/fixtures/test';
import { expectNoA11yViolations } from '@tests/playwright/accessibility';

test('scans the categories page', async ({ page }) => {
    await page.goto('/categories');
    await expect(page.locator('[data-table="groups"]')).toBeVisible();
    await expectNoA11yViolations(page);
});
