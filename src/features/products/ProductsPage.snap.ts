import { expect, test } from '@tests/fixtures/test';
import { openProduct, productTile } from '@tests/helpers/ui';

test.use({ colorScheme: 'light', reducedMotion: 'reduce', locale: 'lt-LT' });

test.describe('desktop', () => {
    test.skip(({ isMobile }) => isMobile);

    test('product page, toolbar, category rail and product tiles', async ({ page }) => {
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();

        await expect(page).toHaveScreenshot(['ProductsPage', 'products-page.png']);
        await expect(page.locator('.Toolbar')).toHaveScreenshot(['ProductsPage', 'toolbar.png']);
        await expect(page.locator('[data-tabs="category-rail"]')).toHaveScreenshot([
            'ProductsPage',
            'category-rail.png',
        ]);
        await expect(productTile(page, 'Avietės')).toHaveScreenshot(['ProductsPage', 'product-tile-stock.png']);
        await expect(productTile(page, 'Braškės')).toHaveScreenshot(['ProductsPage', 'product-tile-empty.png']);

        const filter = page.getByRole('searchbox', { name: 'filtruokite' });
        await filter.fill('Avietės');
        await expect(page.locator('.Toolbar')).toHaveScreenshot(['ProductsPage', 'toolbar-filtered.png']);
    });

    test('product editor, move variants, and confirmation dialogs', async ({ page }) => {
        await page.goto('/');
        const amounts = await openProduct(page, 'Avietės');
        await amounts.getByRole('button', { name: 'Perkelti variantus' }).click();
        await expect(amounts).toHaveScreenshot(['ProductsPage', 'move-variants.png']);
        await amounts.getByRole('button', { name: 'Atšaukti' }).click();
        await amounts.getByRole('button', { name: 'Taisyti' }).click();
        const editor = page.getByRole('dialog', { name: 'Taisyti produktą' });
        await expect(editor).toHaveScreenshot(['ProductsPage', 'product-editor.png']);
        await editor.getByRole('button', { name: 'Šalinti' }).click();
        await expect(page.getByRole('dialog', { name: 'Ar tikrai norite pašalinti?' })).toHaveScreenshot([
            'ProductsPage',
            'remove-confirmation.png',
        ]);
    });

    test('product creation and unsaved changes dialog', async ({ page }) => {
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await page.locator('[data-action="add"]').click();
        const dialog = page.getByRole('dialog', { name: 'Pridėti naują produktą' });
        await expect(dialog).toHaveScreenshot(['ProductsPage', 'product-create.png']);
        await dialog.getByRole('button', { name: 'Papildoma informacija' }).click();
        await expect(dialog).toHaveScreenshot(['ProductsPage', 'product-create-details.png']);
        await dialog.getByRole('textbox', { name: 'Produktas' }).fill('Serbentai');
        await dialog.getByRole('button', { name: 'Atšaukti' }).click();
        await expect(page.getByRole('dialog', { name: 'Atmesti neišsaugotus pakeitimus?' })).toBeVisible();
        await expect(page).toHaveScreenshot(['ProductsPage', 'discard-confirmation.png']);
    });
});

test.describe('mobile', () => {
    test.use({ scenario: 'history' });
    test.skip(({ isMobile }) => !isMobile);

    test('mobile product page and tile', async ({ page }) => {
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await expect(page).toHaveScreenshot(['ProductsPage', 'mobile-products-page.png']);
        await expect(productTile(page, 'Avietės')).toHaveScreenshot(['ProductsPage', 'mobile-product-tile.png']);
    });
});
