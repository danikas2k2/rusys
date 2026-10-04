import { currentYear } from '@tests/fixtures/data';
import { expect, test } from '@tests/fixtures/test';

test.use({ scenario: 'history' });

test.describe('summary', () => {
    test('consumption persists and summary filters work @critical', async ({ page }) => {
        await page.goto('/summary');
        const tile = page.locator('[data-summary-tile]').filter({ hasText: 'Avietės' });
        await test.step('consumption appears in the history dialog and survives reload', async () => {
            await expect(tile).toBeVisible();
            await expect(tile).toContainText('1');
            await tile.click();
            const history = page.getByRole('dialog').last();
            await expect(history).toContainText('Suvalgyta su arbata');
            await page.reload();
            await expect(tile).toContainText('1');
        });

        await test.step('quick search filters the summary', async () => {
            await page.getByRole('searchbox', { name: 'filtruokite' }).fill('kopūstai');
            await expect(tile).toBeHidden();
            await page.getByRole('searchbox', { name: 'filtruokite' }).clear();
            await expect(tile).toBeVisible();
            await expect(tile).toHaveAttribute('data-year', String(currentYear));
        });
    });
});
