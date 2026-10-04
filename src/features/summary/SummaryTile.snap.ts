import { expect, test } from '@tests/fixtures/visual';
import { waitForTileBackground } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test.describe('history', () => {
    test.use({ scenario: 'history' });

    test('summary tile', async ({ page }) => {
        await page.goto('/summary');
        const tile = page.locator('[data-summary-tile]').filter({ hasText: 'Avietės' });
        await expect(tile).toHaveScreenshot(['SummaryTile', 'summary-tile.png']);
    });
});

test.describe('with images', () => {
    test.use({ scenario: 'history-images' });

    test('summary tile', async ({ page }) => {
        await page.goto('/summary');
        const tile = page.locator('[data-summary-tile]').filter({ hasText: 'Avietės' }).first();
        await waitForTileBackground(tile);
        await expect(tile).toHaveScreenshot(['SummaryTile', 'summary-tile-image.png']);
    });
});

test.describe('consumed and recycled', () => {
    test.use({ scenario: 'consumed-recycled' });

    test('summary tile shows consumed and discarded stock', async ({ page }) => {
        await page.goto('/summary');
        const tile = page.locator('[data-summary-tile]').filter({ hasText: 'Avietės' });
        await expect(tile.locator('[data-type="consumed"]').first()).toBeVisible();
        await expect(tile.locator('[data-type="recycled"]').first()).toBeVisible();
        await expect(tile).toHaveScreenshot(['SummaryTile', 'summary-tile-consumed-and-recycled.png']);
    });
});
