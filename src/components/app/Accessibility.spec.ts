import { expect, test } from '@tests/fixtures/test';
import { expectNoA11yViolations } from '@tests/playwright/accessibility';

test.describe('navigation accessibility', () => {
    test.use({ scenario: 'history' });

    test('scans the open navigation menu', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('[data-tile-kind="product"]').first()).toBeVisible();
        await page.getByRole('button', { name: 'Meniu' }).click();
        await expect(page.getByRole('dialog', { name: 'Meniu' })).toBeVisible();
        await expectNoA11yViolations(page);
    });
});
