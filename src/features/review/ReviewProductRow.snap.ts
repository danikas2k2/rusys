import { expect, test } from '@tests/fixtures/visual';
import { productTile } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT', scenario: 'review' });

test('review product row', async ({ page }) => {
    await page.goto('/');
    await expect(productTile(page, 'Avietės')).toBeVisible();
    await page.getByRole('button', { name: 'Peržiūra' }).click();
    await expect(page.getByRole('dialog').last().getByRole('row', { name: 'Avietės' })).toHaveScreenshot([
        'ReviewProductRow',
        'review-product-row.png',
    ]);
});
