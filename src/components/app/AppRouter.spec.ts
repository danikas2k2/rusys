import { expect, test } from '@tests/fixtures/test';
import { productTile } from '@tests/helpers/ui';

const destinations = [
    { label: 'Produktai', path: '/', content: '[data-grid="products"]' },
    { label: 'Variantai', path: '/variants', content: '[data-table="variants"]' },
];

test(
    'navigates with server data and URL filters, then restores the previous page',
    { tag: '@critical' },
    async ({ page }) => {
        await page.addInitScript(() => {
            Object.defineProperty(document, 'startViewTransition', { configurable: true, value: undefined });
        });
        const apiRequests: string[] = [];
        page.on('request', (request) => {
            if (request.url().includes('/api/v1/')) {
                apiRequests.push(request.url());
            }
        });

        const filters = 'g=Uogien%C4%97s';
        await page.goto(`/categories?${filters}`);
        await expect(page.getByRole('row', { name: /Uogienės/ })).toBeVisible();

        for (const { label, path, content } of destinations) {
            await test.step(`navigate to ${label}`, async () => {
                await page.getByRole('button', { name: 'Meniu' }).click();
                await page.getByRole('navigation').getByRole('link', { name: label }).click();
                await expect(page).toHaveURL(
                    (url) => url.pathname === path && url.searchParams.get('g') === 'Uogienės'
                );
                await expect(page.locator(`${content}:visible`).first()).toBeVisible();
                await expect(page.getByRole('dialog', { name: 'Meniu' })).toBeHidden();
            });
        }

        await expect(page.getByRole('row', { name: /Stiklainis/ })).toBeVisible();
        await page.goBack();
        await expect(page).toHaveURL((url) => url.pathname === '/' && url.searchParams.get('g') === 'Uogienės');
        await expect(productTile(page, 'Avietės')).toBeVisible();
        expect(apiRequests).toStrictEqual([]);

        await page.getByRole('button', { name: 'Meniu' }).click();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog', { name: 'Meniu' })).toBeHidden();
    }
);

test.describe('mobile navigation', { tag: ['@mobile', '@critical'] }, () => {
    test('mobile menu and product amounts work with touch', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Meniu' }).tap();
        await page.getByRole('navigation').getByRole('link', { name: 'Variantai' }).tap();
        await expect(page.locator('[data-table="variants"]')).toBeVisible();
        await page.getByRole('button', { name: 'Meniu' }).tap();
        await page.getByRole('navigation').getByRole('link', { name: 'Produktai' }).tap();
        await page.locator('[data-tile-kind="product"]').filter({ hasText: 'Avietės' }).tap();
        const dialog = page.getByRole('dialog', { name: /Avietės Uogienės/ });
        await expect(dialog.getByRole('tab', { name: 'Kiekiai' })).toBeVisible();
        await dialog.getByRole('button', { name: 'Uždaryti' }).tap();
        await expect(dialog).toHaveCount(0);
    });
});
