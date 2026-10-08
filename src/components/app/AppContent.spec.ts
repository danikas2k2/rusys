import { expect, test } from '@tests/fixtures/test';
import { productTile } from '@tests/helpers/ui';

test.describe('app states and filters', () => {
    test.describe('isolated empty state', () => {
        test.use({ scenario: 'empty' });

        test('shows no data on every primary route', async ({ page }) => {
            for (const route of ['/', '/summary', '/variants', '/categories']) {
                await page.goto(route);
                await expect(page.locator('[data-error]').first()).toContainText('Duomenų nėra');
            }
        });
    });

    test('quick search filters product, category and variant views', async ({ page }) => {
        await page.goto('/');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        const search = page.getByRole('searchbox', { name: 'filtruokite' });
        await search.fill('Braškės');
        await expect(productTile(page, 'Avietės')).toBeHidden();
        await expect(productTile(page, 'Braškės')).toBeVisible();
        await search.clear();
        await page.getByRole('button', { name: 'Meniu' }).click();
        await page.getByRole('menu').getByRole('link', { name: 'Kategorijos' }).click();
        await expect(page.locator('[data-table="groups"]')).toBeVisible();
        await search.fill('Braškės');
        await expect(page.getByRole('row', { name: /Uogienės/ })).toBeHidden();
        await search.clear();
        await expect(page.getByRole('row', { name: /Uogienės/ })).toBeVisible();
        await page.getByRole('button', { name: 'Meniu' }).click();
        await page.getByRole('menu').getByRole('link', { name: 'Variantai' }).click();
        await expect(page.locator('[data-table="variants"]')).toBeVisible();
        await search.fill('indelis');
        await expect(page.getByRole('row', { name: /Didelis indelis/ })).toBeVisible();
        await expect(page.getByRole('row', { name: /Stiklainis/ })).toBeHidden();
    });

    test('theme switch survives reload', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Meniu' }).click();
        const menu = page.getByRole('menu');
        await menu.getByRole('switch', { name: 'Tamsi tema' }).locator('..').click();
        await page.reload();
        await page.getByRole('button', { name: 'Meniu' }).click();
        await expect(page.getByRole('menu').getByRole('switch', { name: 'Šviesi tema' })).toBeChecked();
    });

    test('loads categories from SSR without a browser API request', async ({ page }) => {
        const apiRequests: string[] = [];
        page.on('request', (request) => {
            if (request.url().includes('/api/v1/')) {
                apiRequests.push(request.url());
            }
        });
        await page.goto('/categories');
        await expect(page.getByRole('row', { name: /Uogienės/ })).toBeVisible();
        expect(apiRequests).toStrictEqual([]);
    });
});
