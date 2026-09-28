import { expect, test } from '@tests/fixtures/test';
import { openProduct } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('product removal confirmation', async ({ page }) => {
    await page.goto('/');
    const amounts = await openProduct(page, 'Avietės');
    await amounts.getByRole('button', { name: 'Taisyti' }).click();
    await page.getByRole('dialog', { name: 'Taisyti produktą' }).getByRole('button', { name: 'Šalinti' }).click();
    await expect(page.getByRole('dialog', { name: 'Ar tikrai norite pašalinti?' })).toHaveScreenshot([
        'ConfirmationDialog',
        'remove-confirmation.png',
    ]);
});
