import { expect, test } from '@tests/fixtures/test';
import { openProduct } from '@tests/helpers/ui';

test.use({ colorScheme: 'light', reducedMotion: 'reduce', locale: 'lt-LT' });

test.describe('desktop', () => {
    test.skip(({ isMobile }) => isMobile);

    test.describe('summary and review', () => {
        test.use({ scenario: 'history' });

        test('summary page, tile, year and history dialog', async ({ page }) => {
            await page.goto('/summary');
            const tile = page.locator('[data-summary-tile]').filter({ hasText: 'Avietės' });
            await expect(tile).toBeVisible();
            await expect(page).toHaveScreenshot(['SummaryPage', 'summary-page.png']);
            await expect(tile).toHaveScreenshot(['SummaryPage', 'summary-tile.png']);
            await tile.click();
            const history = page.getByRole('dialog').last();
            await expect(history).toContainText('Suvalgyta su arbata');
            await expect(history).toHaveScreenshot(['SummaryPage', 'summary-history-dialog.png']);
            await expect(history.locator('[data-summary-year-bar]')).toHaveScreenshot([
                'SummaryPage',
                'summary-year-bar.png',
            ]);
            await expect(history.locator('[data-table="history"]')).toHaveScreenshot([
                'SummaryPage',
                'summary-history-table.png',
            ]);
        });
    });

    test('summary tile shows consumed and discarded stock', async ({ page, db }) => {
        await page.goto('/');
        const dialog = await openProduct(page, 'Avietės');
        await dialog.locator('[data-amount-variant-key="Stiklainis"]').click();
        await dialog.getByRole('textbox', { name: 'consumed' }).fill('1');
        await dialog.getByRole('textbox', { name: 'recycled' }).fill('1');
        await dialog.getByRole('button', { name: 'Naujinti' }).click();
        await expect
            .poll(
                async () =>
                    (
                        await db
                            .collection<{ name: string; updates?: unknown[] }>('products')
                            .findOne({ name: 'Avietės' })
                    )?.updates?.length
            )
            .toBe(1);
        await page.goto('/summary');
        const tile = page.locator('[data-summary-tile]').filter({ hasText: 'Avietės' });
        await expect(tile.locator('[data-type="consumed"]')).toBeVisible();
        await expect(tile.locator('[data-type="recycled"]')).toBeVisible();
        await expect(tile).toHaveScreenshot(['SummaryPage', 'summary-tile-consumed-and-recycled.png']);
    });
});

test.describe('mobile', () => {
    test.use({ scenario: 'history' });
    test.skip(({ isMobile }) => !isMobile);

    test('mobile summary page', async ({ page }) => {
        await page.goto('/summary');
        await expect(page.locator('[data-grid="summary"]')).toBeVisible();
        await expect(page).toHaveScreenshot(['SummaryPage', 'mobile-summary-page.png']);
    });
});
