import { expect, test } from '@tests/fixtures/test';
import { openProduct } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test.describe('history', () => {
    test.use({ scenario: 'history' });

    test('summary tile', async ({ page }) => {
        await page.goto('/summary');
        const tile = page.locator('[data-summary-tile]').filter({ hasText: 'Avietės' });
        await expect(tile).toHaveScreenshot(['SummaryTile', 'summary-tile.png']);
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
                (await db.collection<{ name: string; updates?: unknown[] }>('products').findOne({ name: 'Avietės' }))
                    ?.updates?.length
        )
        .toBe(1);
    await page.goto('/summary');
    const tile = page.locator('[data-summary-tile]').filter({ hasText: 'Avietės' });
    await expect(tile.locator('[data-type="consumed"]')).toBeVisible();
    await expect(tile.locator('[data-type="recycled"]')).toBeVisible();
    await expect(tile).toHaveScreenshot(['SummaryTile', 'summary-tile-consumed-and-recycled.png']);
});
