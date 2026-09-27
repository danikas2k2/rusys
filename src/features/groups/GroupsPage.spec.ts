import { expect, test } from '@tests/fixtures/test';

import type { Group, Product, Variant } from '~/common/data';

test.describe('categories', () => {
    test('creates a category, persists its options, and discards a cancelled draft @critical', async ({ page, db }) => {
        await page.goto('/categories');
        await expect(page.getByRole('row', { name: /Uogienės/ })).toBeVisible();

        await page.locator('[data-action="add"]').click();
        let dialog = page.getByRole('dialog', { name: 'Pridėti naują kategoriją' });
        await expect(dialog).toBeVisible();
        await dialog.getByRole('textbox', { name: 'Kategorija' }).fill('Prieskoniai');
        await dialog.getByRole('button', { name: 'Atšaukti' }).click();
        await page.getByRole('button', { name: 'Atmesti' }).click();
        await expect(dialog).toBeHidden();
        expect(await db.collection<Group>('groups').countDocuments({ group: 'Prieskoniai' })).toBe(0);

        await page.locator('[data-action="add"]').click();
        dialog = page.getByRole('dialog', { name: 'Pridėti naują kategoriją' });
        await dialog.getByRole('textbox', { name: 'Kategorija' }).fill('Konservai');
        await dialog.getByRole('checkbox', { name: 'Metiniai' }).uncheck();
        await dialog.getByRole('checkbox', { name: 'Peržiūra' }).check();
        await dialog.getByRole('button', { name: 'Pridėti' }).click();
        await expect(page.getByRole('row', { name: /Konservai/ })).toBeVisible();
        await page.reload();
        await expect(page.getByRole('row', { name: /Konservai/ })).toBeVisible();
        const category = await db.collection<Group>('groups').findOne({ group: 'Konservai' });
        expect(category?.annual).toBe(false);
        expect(category?.review).toBe(true);
    });

    test('renames a category and updates its products and variants', async ({ page, db }) => {
        await page.goto('/categories');
        await page.getByRole('row', { name: /Uogienės/ }).click();
        const dialog = page.getByRole('dialog', { name: 'Taisyti kategoriją' });
        await expect(dialog).toBeVisible();
        await dialog.getByRole('textbox', { name: 'Kategorija' }).fill('Uogų uogienės');
        await dialog.getByRole('button', { name: 'Naujinti' }).click();
        await expect(page.getByRole('row', { name: /Uogų uogienės/ })).toBeVisible();
        await page.reload();
        await expect(page.getByRole('row', { name: /Uogų uogienės/ })).toBeVisible();
        expect(await db.collection<Group>('groups').countDocuments({ group: 'Uogienės' })).toBe(0);
        expect(await db.collection<Product>('products').countDocuments({ group: 'Uogų uogienės' })).toBe(2);
        expect(await db.collection<Variant>('variants').countDocuments({ group: 'Uogų uogienės' })).toBe(2);
    });

    test('requires confirmation before archiving a category', async ({ page, db }) => {
        await page.goto('/categories');
        await page.getByRole('row', { name: /Daržovės/ }).click();
        const dialog = page.getByRole('dialog', { name: 'Taisyti kategoriją' });
        await dialog.getByRole('button', { name: 'Šalinti' }).click();
        const confirmation = page.getByRole('dialog', { name: 'Ar tikrai norite pašalinti?' });
        await expect(confirmation).toBeVisible();
        await confirmation.getByRole('button', { name: 'Atšaukti' }).click();
        await expect(page.getByRole('row', { name: /Daržovės/ })).toBeVisible();
        expect(
            await db.collection<Group>('groups').countDocuments({ group: 'Daržovės', archivedAt: { $exists: false } })
        ).toBe(1);

        await dialog.getByRole('button', { name: 'Šalinti' }).click();
        await confirmation.getByRole('button', { name: 'Šalinti' }).click();
        await expect(page.getByRole('row', { name: /Daržovės/ })).toHaveCount(0);
        expect((await db.collection<Group>('groups').findOne({ group: 'Daržovės' }))?.archivedAt).toBeDefined();
    });

    test('reorders categories using the drag handle', async ({ page, db }) => {
        await page.goto('/categories');
        const handle = page.getByRole('row', { name: /Uogienės/ }).locator('[data-drag-handle]');
        const target = page.getByRole('row', { name: /Daržovės/ });
        await handle.dragTo(target, { steps: 10 });
        await expect
            .poll(async () => (await db.collection<Group>('groups').findOne({ group: 'Uogienės' }))?.order)
            .toBe(1);
        await page.reload();
        const rows = page.locator('[data-table="groups"] tbody tr');
        await expect(rows.first()).toContainText('Daržovės');
    });
});
