import { expect, test } from '@tests/fixtures/test';
import { expectNoA11yViolations } from '@tests/playwright/accessibility';

test.describe('product accessibility', () => {
    test.use({ scenario: 'history' });

    test('scans the product page', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('[data-tile-kind="product"]').first()).toBeVisible();
        await expectNoA11yViolations(page);
    });

    test('scans the product creation dialog', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('[data-tile-kind="product"]').first()).toBeVisible();
        await page.locator('[data-action="add"]').click();
        const dialog = page.getByRole('dialog', { name: 'Pridėti naują produktą' });
        await expect(dialog).toBeVisible();
        await expectNoA11yViolations(page, '[role="dialog"]');
    });

    test('scans the product creation dialog in dark mode', async ({ page }) => {
        await page.goto('/');
        await page.locator('html').evaluate((element) => element.setAttribute('data-mantine-color-scheme', 'dark'));
        await page.locator('[data-action="add"]').click();
        const dialog = page.getByRole('dialog', { name: 'Pridėti naują produktą' });
        await expect(dialog).toBeVisible();
        await expectNoA11yViolations(page, '[role="dialog"]');
    });
});
