import { expect, test } from '@tests/fixtures/test';
import { productTile } from '@tests/helpers/ui';

import type { Route } from '@playwright/test';

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
        await page.goto('/categories');
        await expect(page.getByRole('row', { name: /Uogienės/ })).toBeHidden();
        await search.clear();
        await expect(page.getByRole('row', { name: /Uogienės/ })).toBeVisible();
        await page.goto('/variants');
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
        await expect(page.getByRole('menu').getByRole('switch')).toBeChecked();
    });

    test('load error offers retry and recovers when the API responds', async ({ page }) => {
        let fail = true;
        await page.route('**/api/v1/groups', async (route: Route) => {
            if (fail) {
                await route.fulfill({
                    status: 503,
                    contentType: 'application/json',
                    body: '{"error":"temporarily unavailable"}',
                });
            } else {
                await route.continue();
            }
        });
        await page.goto('/categories');
        await expect(page.locator('[data-error]').first()).toContainText('Unexpected error occurred');
        fail = false;
        await page.getByRole('button', { name: 'Reload page' }).click();
        await expect(page.getByRole('row', { name: /Uogienės/ })).toBeVisible();
    });
});
