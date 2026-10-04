import { expect, test } from '@tests/fixtures/test';

import type { Product, Variant } from '~/common/data';

test.describe('variants', () => {
    test('creates and edits a variant with its display metadata @critical', async ({ page, db }) => {
        await page.goto('/variants');
        await expect(page.getByRole('row', { name: /Stiklainis/ }).first()).toBeVisible();
        await page.locator('[data-action="add"]').click();
        const add = page.getByRole('dialog', { name: 'Pridėti naują variantą' });
        await add.getByRole('textbox', { name: 'Variantas' }).fill('Šeimyninis stiklainis');
        await add.getByRole('textbox', { name: 'Kiekis' }).fill('4');
        await add.getByRole('textbox', { name: 'Žyma' }).fill('pak.');
        await add.getByRole('button', { name: 'Pridėti' }).click();
        await expect(page.getByRole('row', { name: /Šeimyninis stiklainis/ })).toBeVisible();
        await expect
            .poll(async () =>
                db.collection<Variant>('variants').findOne({ group: 'Uogienės', variant: 'Šeimyninis stiklainis' })
            )
            .toMatchObject({ count: 4, suffix: 'pak.' });

        await page.getByRole('row', { name: /Šeimyninis stiklainis/ }).click();
        const edit = page.getByRole('dialog', { name: 'Taisyti variantą' });
        await edit.getByRole('textbox', { name: 'Variantas' }).fill('Dovanų rinkinys');
        await edit.getByRole('button', { name: 'Naujinti' }).click();
        await expect(page.getByRole('row', { name: /Dovanų rinkinys/ })).toBeVisible();
        await page.reload();
        await expect(page.getByRole('row', { name: /Dovanų rinkinys/ })).toBeVisible();
        expect(await db.collection<Variant>('variants').countDocuments({ variant: 'Šeimyninis stiklainis' })).toBe(0);
    });

    test('renaming a used variant updates product amounts', async ({ page, db }) => {
        await page.goto('/variants');
        await expect(page.getByRole('row', { name: /Stiklainis/ }).first()).toBeVisible();
        await page
            .getByRole('row', { name: /Stiklainis/ })
            .first()
            .click();
        const dialog = page.getByRole('dialog', { name: 'Taisyti variantą' });
        await dialog.getByRole('textbox', { name: 'Variantas' }).fill('Vienas stiklainis');
        await dialog.getByRole('button', { name: 'Naujinti' }).click();
        await expect(page.getByRole('row', { name: /Vienas stiklainis/ })).toBeVisible();
        const product = await db.collection<Product>('products').findOne({ group: 'Uogienės', name: 'Avietės' });
        expect(product?.years?.[0]?.amounts?.[0]?.variant).toBe('Vienas stiklainis');
    });

    test('copies a variant into another category without removing the source', async ({ page, db }) => {
        await page.goto('/variants');
        await page.getByRole('row', { name: /Didelis indelis/ }).click();
        const edit = page.getByRole('dialog', { name: 'Taisyti variantą' });
        const category = edit.getByRole('combobox', { name: 'Kategorija' });
        await category.click();
        await category.press('ArrowDown');
        await category.press('Enter');
        await expect(category).toHaveValue('Daržovės');
        await edit.getByRole('button', { name: 'Kopijuoti' }).click();
        await page.getByRole('tab', { name: 'Daržovės' }).click();
        await expect(page.getByRole('row', { name: /Didelis indelis/ })).toBeVisible();
        expect(await db.collection<Variant>('variants').countDocuments({ variant: 'Didelis indelis' })).toBe(2);
        await page.reload();
        await expect(page.getByRole('row', { name: /Didelis indelis/ })).toBeVisible();
    });

    test('reorders variants and archives one after confirmation', async ({ page, db }) => {
        await page.goto('/variants');
        await expect(page.getByRole('row', { name: /Didelis indelis/ })).toBeVisible();
        await page
            .getByRole('row', { name: /Stiklainis/ })
            .locator('[data-drag-handle]')
            .dragTo(page.getByRole('row', { name: /Didelis indelis/ }), { steps: 10 });
        await expect
            .poll(
                async () =>
                    (await db.collection<Variant>('variants').findOne({ group: 'Uogienės', variant: 'Stiklainis' }))
                        ?.order
            )
            .toBe(1);
        await page.reload();
        await expect(page.locator('[data-table="variants"] tbody tr').first()).toContainText('Didelis indelis');

        await test.step('archives a variant only after confirmation', async () => {
            await page.getByRole('row', { name: /Didelis indelis/ }).click();
            const dialog = page.getByRole('dialog', { name: 'Taisyti variantą' });
            await dialog.getByRole('button', { name: 'Šalinti' }).click();
            const confirm = page.getByRole('dialog', { name: 'Ar tikrai norite pašalinti?' });
            await confirm.getByRole('button', { name: 'Atšaukti' }).click();
            await expect(page.getByRole('row', { name: /Didelis indelis/ })).toBeVisible();

            await dialog.getByRole('button', { name: 'Šalinti' }).click();
            await confirm.getByRole('button', { name: 'Šalinti' }).click();
            await expect(page.getByRole('row', { name: /Didelis indelis/ })).toHaveCount(0);
            expect(
                (await db.collection<Variant>('variants').findOne({ group: 'Uogienės', variant: 'Didelis indelis' }))
                    ?.archivedAt
            ).toBeDefined();
        });
    });
});
