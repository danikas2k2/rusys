import { expect, test } from '@tests/fixtures/test';

const destinations = [
    { label: 'Produktai', path: '/', content: '[data-grid="products"]' },
    { label: 'Suvestinė', path: '/summary', content: '[data-grid="summary"]' },
    { label: 'Variantai', path: '/variants', content: '[data-table="variants"]' },
    { label: 'Kategorijos', path: '/categories', content: '[data-table="groups"]' },
];

test.describe('desktop navigation', () => {
    test.use({ scenario: 'history' });
    test.skip(({ isMobile }) => isMobile);

    for (const { label, path, content } of destinations) {
        test(`menu navigates to ${label}`, async ({ page }) => {
            await page.goto('/');
            await page.getByRole('button', { name: 'Meniu' }).click();
            const menu = page.getByRole('menu');
            await expect(menu.getByRole('dialog')).toBeVisible();
            await menu.getByRole('link', { name: label }).click();
            await expect(page).toHaveURL(new RegExp(`${path === '/' ? '/$' : `${path}$`}`));
            await expect(menu.getByRole('dialog')).toBeHidden();
            await expect(page.locator(content)).toBeVisible();

            await page.getByRole('button', { name: 'Meniu' }).click();
            await expect(menu.getByRole('link', { name: label })).toHaveAttribute('data-active', 'true');
        });
    }

    for (const { label, path, content } of destinations) {
        test(`opens ${label} directly`, async ({ page }) => {
            await page.goto(path);
            await expect(page.locator(content)).toBeVisible();
        });
    }

    test('menu keeps URL filters when navigating and closes with Escape', async ({ page }) => {
        const filters = 'q=Aviet%C4%97s&g=Uogien%C4%97s';
        await page.goto(`/?${filters}`);
        await page.getByRole('button', { name: 'Meniu' }).click();
        const menu = page.getByRole('menu');
        await expect(menu.getByRole('link', { name: 'Suvestinė' })).toHaveAttribute('href', `/summary?${filters}`);
        await menu.getByRole('link', { name: 'Suvestinė' }).click();
        await expect(page).toHaveURL(new RegExp(`/summary\\?${filters}$`));

        await page.getByRole('button', { name: 'Meniu' }).click();
        await page.keyboard.press('Escape');
        await expect(menu.getByRole('dialog')).toBeHidden();
    });

    test('utilities expands to show import and export actions', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Meniu' }).click();
        const menu = page.getByRole('menu');
        await menu.getByRole('link', { name: 'Įrankiai' }).click();
        await expect(menu.getByText('Eksportuoti', { exact: true })).toBeVisible();
        await expect(menu.getByText('Importuoti', { exact: true })).toBeVisible();
    });
});

test.describe('mobile navigation', () => {
    test.skip(({ isMobile }) => !isMobile);

    test('mobile menu and product amounts work with touch', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Meniu' }).tap();
        await page.getByRole('menu').getByRole('link', { name: 'Variantai' }).tap();
        await expect(page.locator('[data-table="variants"]')).toBeVisible();
        await page.getByRole('button', { name: 'Meniu' }).tap();
        await page.getByRole('menu').getByRole('link', { name: 'Produktai' }).tap();
        await page.locator('[data-tile-kind="product"]').filter({ hasText: 'Avietės' }).tap();
        const dialog = page.getByRole('dialog', { name: /Avietės Uogienės/ });
        await expect(dialog.getByRole('tab', { name: 'Kiekiai' })).toBeVisible();
        await dialog.getByRole('button', { name: 'Uždaryti' }).tap();
        await expect(dialog).toHaveCount(0);
    });
});
