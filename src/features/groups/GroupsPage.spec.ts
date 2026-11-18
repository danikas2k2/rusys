import { expect, test } from '@tests/fixtures/test';

import type { Group } from '~/schema';

test.describe('categories', { tag: '@critical' }, () => {
    test('keeps an edited category after a failed save and succeeds on retry', async ({ page, db }) => {
        await page.goto('/categories');
        await page.getByRole('row', { name: /Uogienės/ }).click();
        const dialog = page.getByRole('dialog', { name: 'Taisyti kategoriją' });
        const name = dialog.getByRole('textbox', { name: 'Kategorija' });
        await name.fill('Uogų uogienės');

        let fail = true;
        await page.route('**/categories', async (route) => {
            if (route.request().method() === 'POST' && route.request().headers()['next-action'] && fail) {
                fail = false;
                await route.fulfill({
                    status: 503,
                    body: 'temporarily unavailable',
                });
            } else {
                await route.continue();
            }
        });

        await dialog.getByRole('button', { name: 'Naujinti' }).click();
        await expect(dialog).toBeVisible();
        await expect(name).toHaveValue('Uogų uogienės');
        await expect.poll(() => fail).toBe(false);
        expect(await db.collection<Group>('groups').countDocuments({ group: 'Uogienės' })).toBe(1);
        expect(await db.collection<Group>('groups').countDocuments({ group: 'Uogų uogienės' })).toBe(0);

        await expect(dialog.getByRole('button', { name: 'Naujinti' })).toBeEnabled();
        await dialog.getByRole('button', { name: 'Naujinti' }).click();
        await expect(dialog).toHaveCount(0);
        await page.reload();
        await expect(page.getByRole('row', { name: /Uogų uogienės/ })).toBeVisible();
        expect(await db.collection<Group>('groups').countDocuments({ group: 'Uogų uogienės' })).toBe(1);
    });

    test('reorders categories and requires confirmation before archiving', async ({ page, db }) => {
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

        await test.step('requires confirmation before archiving a category', async () => {
            await page.getByRole('row', { name: /Daržovės/ }).click();
            const dialog = page.getByRole('dialog', { name: 'Taisyti kategoriją' });
            await dialog.getByRole('button', { name: 'Šalinti' }).click();
            const confirmation = page.getByRole('dialog', { name: 'Ar tikrai norite pašalinti?' });
            await expect(confirmation).toBeVisible();
            await confirmation.getByRole('button', { name: 'Atšaukti' }).click();
            await expect(page.getByRole('row', { name: /Daržovės/ })).toBeVisible();
            expect(
                await db
                    .collection<Group>('groups')
                    .countDocuments({ group: 'Daržovės', archivedAt: { $exists: false } })
            ).toBe(1);

            await dialog.getByRole('button', { name: 'Šalinti' }).click();
            await confirmation.getByRole('button', { name: 'Šalinti' }).click();
            await expect(page.getByRole('row', { name: /Daržovės/ })).toHaveCount(0);
            expect((await db.collection<Group>('groups').findOne({ group: 'Daržovės' }))?.archivedAt).toBeDefined();
        });
    });
});
