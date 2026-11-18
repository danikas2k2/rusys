import { expect, test } from '@tests/fixtures/test';
import { openProduct, productTile } from '@tests/helpers/ui';

import type { Product } from '~/schema';

test.describe('products', { tag: '@critical' }, () => {
    test('renames, moves and removes a product with confirmation', async ({ page, db }) => {
        await page.goto('/');
        let amount = await openProduct(page, 'Avietės');
        await amount.getByRole('button', { name: 'Taisyti' }).click();
        let edit = page.getByRole('dialog', { name: 'Taisyti produktą' });
        await edit.getByRole('textbox', { name: 'Produktas' }).fill('Aviečių džemas');
        await edit.getByRole('button', { name: 'Naujinti' }).click();
        await expect(productTile(page, 'Aviečių džemas')).toBeVisible();
        await page.reload();
        await expect(productTile(page, 'Aviečių džemas')).toBeVisible();
        amount = await openProduct(page, 'Aviečių džemas');
        await amount.getByRole('button', { name: 'Taisyti' }).click();
        edit = page.getByRole('dialog', { name: 'Taisyti produktą' });
        await expect(edit.getByRole('textbox', { name: 'Produktas' })).toBeFocused();
        const category = edit.getByRole('combobox', { name: 'Kategorija' });
        await category.click();
        const vegetables = page.getByRole('option', { name: 'Daržovės' });
        await expect(vegetables).toBeVisible();
        await vegetables.click();
        await expect(category).toHaveValue('Daržovės');
        await edit.getByRole('button', { name: 'Perkelti' }).click();
        await expect
            .poll(async () => (await db.collection<Product>('products').findOne({ name: 'Aviečių džemas' }))?.group)
            .toBe('Daržovės');
        await page.reload();
        expect((await db.collection<Product>('products').findOne({ name: 'Aviečių džemas' }))?.group).toBe('Daržovės');
        await page.getByRole('tab', { name: 'Daržovės' }).click();
        await expect(page.getByRole('tab', { name: 'Daržovės' })).toHaveAttribute('aria-selected', 'true');
        await expect(productTile(page, 'Aviečių džemas')).toBeVisible();
        await productTile(page, 'Aviečių džemas').click();
        await page
            .getByRole('dialog', { name: /Aviečių džemas Daržovės/ })
            .getByRole('button', { name: 'Taisyti' })
            .click();
        edit = page.getByRole('dialog', { name: 'Taisyti produktą' });
        await edit.getByRole('button', { name: 'Šalinti' }).click();
        const confirm = page.getByRole('dialog', { name: 'Ar tikrai norite pašalinti?' });
        await confirm.getByRole('button', { name: 'Atšaukti' }).click();
        await expect(productTile(page, 'Aviečių džemas')).toBeVisible();
        await edit.getByRole('button', { name: 'Šalinti' }).click();
        await confirm.getByRole('button', { name: 'Šalinti' }).click();
        await expect(productTile(page, 'Aviečių džemas')).toHaveCount(0);
        expect(
            (await db.collection<Product>('products').findOne({ name: 'Aviečių džemas' }))?.archivedAt
        ).toBeDefined();
    });

    test('creates a child product and expands its parent tile', async ({ page, db }) => {
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        await page.locator('[data-action="add"]').click();
        const add = page.getByRole('dialog', { name: 'Pridėti naują produktą' });
        await add.getByRole('textbox', { name: 'Produktas' }).fill('Aviečių uogienė be cukraus');
        await add.getByRole('button', { name: 'Papildoma informacija' }).click();
        const parent = add.getByRole('combobox', { name: 'Tėvinis produktas' });
        await parent.click();
        await parent.fill('Avietės');
        await page.getByRole('option', { name: 'Avietės' }).click();
        await expect(parent).toHaveValue('Avietės');
        await add.getByRole('button', { name: 'Pridėti' }).click();
        await expect(page.getByRole('dialog', { name: /Aviečių uogienė be cukraus Uogienės/ })).toBeVisible();
        expect((await db.collection<Product>('products').findOne({ name: 'Aviečių uogienė be cukraus' }))?.parent).toBe(
            'Avietės'
        );
        await page
            .getByRole('dialog', { name: /Aviečių uogienė be cukraus Uogienės/ })
            .getByRole('button', { name: 'Uždaryti' })
            .click();
        await expect(productTile(page, 'Avietės').getByRole('button', { name: 'Išplėsti' })).toBeVisible();
        await productTile(page, 'Avietės').getByRole('button', { name: 'Išplėsti' }).click();
        await expect(productTile(page, 'Aviečių uogienė be cukraus')).toBeVisible();

        const parentTile = productTile(page, 'Avietės');
        await parentTile.getByRole('button', { name: 'Suskleisti' }).click();
        await expect(productTile(page, 'Aviečių uogienė be cukraus')).toBeHidden();
        await expect(page.getByRole('dialog', { name: /Avietės Uogienės/ })).not.toBeVisible();
        await parentTile.getByRole('button', { name: 'Išplėsti' }).click();
        await expect(productTile(page, 'Aviečių uogienė be cukraus')).toBeVisible();
        await page.reload();
        await productTile(page, 'Avietės').getByRole('button', { name: 'Išplėsti' }).click();
        await expect(productTile(page, 'Aviečių uogienė be cukraus')).toBeVisible();
    });
});
