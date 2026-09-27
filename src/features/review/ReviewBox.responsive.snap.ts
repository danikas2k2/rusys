import { expect, test } from '@tests/fixtures/test';
import { productTile } from '@tests/helpers/ui';

test.use({ colorScheme: 'light', reducedMotion: 'reduce', locale: 'lt-LT', scenario: 'review' });

test('review dialog', async ({ page }) => {
    await page.goto('/');
    await expect(productTile(page, 'Avietės')).toBeVisible();
    await page.getByRole('button', { name: 'Peržiūra' }).click();
    const dialog = page.getByRole('dialog').last();
    await expect(dialog.getByRole('row', { name: 'Avietės' })).toBeVisible();
    await expect(dialog).toHaveScreenshot(['ReviewBox', 'review-dialog.png']);
});
