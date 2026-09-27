import { currentYear } from '@tests/fixtures/data';
import { expect, test } from '@tests/fixtures/test';

test.use({ scenario: 'history' });

test.describe('summary', () => {
    test('consumption appears in the summary and history dialog @critical', async ({ page }) => {
        await page.goto('/summary');
        const tile = page.locator('[data-summary-tile]').filter({ hasText: 'Avietės' });
        await expect(tile).toBeVisible();
        await expect(tile).toContainText('1');
        await tile.click();
        const history = page.getByRole('dialog').last();
        await expect(history).toContainText('Suvalgyta su arbata');
        await page.reload();
        await expect(tile).toContainText('1');
    });

    test('summary respects category and quick search filters', async ({ page }) => {
        await page.goto('/summary');
        const tile = page.locator('[data-summary-tile]').filter({ hasText: 'Avietės' });
        await expect(tile).toBeVisible();
        await page.getByRole('searchbox', { name: 'filtruokite' }).fill('kopūstai');
        await expect(tile).toBeHidden();
        await page.getByRole('searchbox', { name: 'filtruokite' }).clear();
        await expect(tile).toBeVisible();
        await expect(tile).toHaveAttribute('data-year', String(currentYear));
    });
});
