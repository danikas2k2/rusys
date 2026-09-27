import { currentYear } from '@tests/fixtures/data';
import { expect, test } from '@tests/fixtures/test';
import { openProduct, productTile } from '@tests/helpers/ui';

test.use({ colorScheme: 'light', reducedMotion: 'reduce', locale: 'lt-LT' });

test.describe('desktop', () => {
    test.skip(({ isMobile }) => isMobile);

    test('product amounts, editable variant and history', async ({ page }) => {
        await page.goto('/');
        const dialog = await openProduct(page, 'Avietės');
        await expect(dialog.getByRole('tab', { name: 'Kiekiai' })).toBeVisible();
        await expect(dialog).toHaveScreenshot(['AmountBox', 'amounts-dialog.png']);
        const variant = dialog.locator('[data-amount-variant-key="Stiklainis"]');
        await expect(variant).toHaveScreenshot(['AmountBox', 'amount-variant-row.png']);
        await variant.click();
        await expect(dialog.getByRole('textbox', { name: 'updated' })).toBeVisible();
        await expect(dialog).toHaveScreenshot(['AmountBox', 'amounts-expanded.png']);
        await expect(variant).toHaveScreenshot(['AmountBox', 'amount-variant-editor.png']);
        await dialog.getByRole('textbox', { name: 'updated' }).fill('2');
        await expect(variant.locator('[data-state="positive"]')).toBeVisible();
        await expect(variant).toHaveScreenshot(['AmountBox', 'amount-variant-changed.png']);
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

test.describe('mobile', () => {
    test.use({ scenario: 'history' });
    test.skip(({ isMobile }) => !isMobile);

    test('mobile amounts dialog', async ({ page }) => {
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await page.getByRole('button', { name: 'Meniu' }).tap();
        await page.getByRole('button', { name: 'Meniu' }).tap();
        await productTile(page, 'Avietės').tap();
        await expect(page.getByRole('dialog', { name: /Avietės Uogienės/ })).toHaveScreenshot([
            'AmountBox',
            'mobile-amounts-dialog.png',
        ]);
    });
});
