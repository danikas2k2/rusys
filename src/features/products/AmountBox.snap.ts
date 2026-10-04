import { currentYear } from '@tests/fixtures/data';
import { expect, test } from '@tests/fixtures/visual';
import { openProduct } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test.describe('amount dialog', () => {
    test('product amounts, editable variant and history', async ({ page }) => {
        await page.goto('/');
        const dialog = await openProduct(page, 'Avietės');
        await expect(dialog.getByRole('tab', { name: 'Kiekiai' })).toBeVisible();
        await expect(dialog).toHaveScreenshot(['AmountBox', 'amounts-dialog.png']);
        const variant = dialog.locator('[data-amount-variant-key="Stiklainis"]');
        await variant.click();
        await expect(dialog.getByRole('textbox', { name: 'updated' })).toBeVisible();
        const cardOverflow = await variant.evaluate((element) => {
            const panel = element.closest('.amount-box-quantities-panel');
            if (!panel) {
                throw new Error('Quantities panel not found');
            }
            return element.getBoundingClientRect().right - panel.getBoundingClientRect().right;
        });
        expect(cardOverflow).toBeLessThanOrEqual(0);
        await expect(dialog).toHaveScreenshot(['AmountBox', 'amounts-expanded.png']);
        await dialog.getByRole('textbox', { name: 'updated' }).fill('2');
        await expect(variant.locator('[data-state="positive"]')).toBeVisible();
        await dialog.getByRole('button', { name: 'Atšaukti' }).click();

        await dialog.getByRole('tab', { name: 'Istorija' }).click();
        await expect(dialog.locator('[data-table="history"]')).toBeVisible();
        await expect(dialog).toHaveScreenshot(['AmountBox', 'amounts-history-empty.png']);
    });

    test.describe('annual products', () => {
        test.use({ scenario: 'annual' });

        test('year selector and year totals', async ({ page }) => {
            await page.goto('/');
            const dialog = await openProduct(page, 'Avietės');
            await expect(dialog.locator('[data-year-total]')).toBeVisible();
            await expect(dialog).toHaveScreenshot(['AmountBox', 'annual-amounts-dialog.png']);
            await dialog
                .locator('label')
                .filter({ hasText: String(currentYear) })
                .click();
            await expect(dialog.locator('[data-amount-variant-key="Stiklainis"]')).toContainText('3');
            await expect(dialog).toHaveScreenshot(['AmountBox', 'annual-current-year.png']);
        });
    });
});
