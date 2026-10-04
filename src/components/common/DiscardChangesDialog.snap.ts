import { expect, test } from '@tests/fixtures/visual';
import { productTile } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('discard product changes confirmation', async ({ page }) => {
    await page.goto('/');
    await expect(productTile(page, 'Avietės')).toBeVisible();
    await page.locator('[data-action="add"]').click();
    const editor = page.getByRole('dialog', { name: 'Pridėti naują produktą' });
    await editor.getByRole('textbox', { name: 'Produktas' }).fill('Serbentai');
    await editor.getByRole('button', { name: 'Atšaukti' }).click();
    await expect(page.getByRole('dialog', { name: 'Atmesti neišsaugotus pakeitimus?' })).toHaveScreenshot([
        'DiscardChangesDialog',
        'discard-confirmation.png',
    ]);
});
