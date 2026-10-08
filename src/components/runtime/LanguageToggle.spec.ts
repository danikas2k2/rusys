import { expect, test } from '@tests/fixtures/test';

import type { Locator } from '@playwright/test';

test.use({ scenario: 'history' });

async function switchLanguage(menu: Locator, accessibleName: string): Promise<void> {
    const languageSwitch = menu.getByRole('switch', { name: accessibleName });
    await menu.locator(`label[for="${await languageSwitch.getAttribute('id')}"]`).click();
}

test.describe('Lithuanian browser language', () => {
    test.use({ locale: 'lt-LT' });

    test('switches to English without closing the drawer or refreshing the route', async ({ page, context }) => {
        await page.goto('/');
        await expect(page.locator('[data-grid="products"]:visible').first()).toBeVisible();
        await expect(page.locator('html')).toHaveAttribute('lang', 'lt');
        await expect(page).toHaveTitle('Rūsys');
        expect((await context.cookies()).find(({ name }) => name === 'rusys-locale')).toBeUndefined();

        await page.getByRole('button', { name: 'Meniu' }).click();
        const menu = page.getByRole('menu');
        await expect(menu.getByRole('switch', { name: 'Perjungti į anglų kalbą' })).toBeChecked();
        await expect(menu.getByText('🇱🇹')).toBeVisible();

        const requests: string[] = [];
        page.on('request', (request) => {
            if (request.isNavigationRequest() || request.headers().rsc) {
                requests.push(request.url());
            }
        });

        await switchLanguage(menu, 'Perjungti į anglų kalbą');

        await expect(menu.getByRole('dialog')).toBeVisible();
        await expect(menu.getByRole('link', { name: 'Products' })).toBeVisible();
        await expect(menu.getByRole('switch', { name: 'Switch to Lithuanian' })).not.toBeChecked();
        await expect(menu.getByText('🇺🇸')).toBeVisible();
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');
        await expect(page).toHaveTitle('Cellar');
        await expect(page.locator('meta[name="description"]')).toHaveAttribute(
            'content',
            'Product and inventory tracking'
        );
        expect((await context.cookies()).find(({ name }) => name === 'rusys-locale')?.value).toBe('en-US');
        expect(requests).toStrictEqual([]);

        await menu.getByRole('link', { name: 'Summary' }).click();
        await expect(page).toHaveURL(/\/summary(?:\?|$)/);
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');

        await page.reload();
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');
        await expect(page).toHaveTitle('Cellar');
        await page.getByRole('button', { name: 'Menu' }).click();
        await expect(page.getByRole('menu').getByRole('link', { name: 'Products' })).toBeVisible();

        await page.goto('/offline');
        await expect(page.getByRole('heading', { name: 'No internet connection' })).toBeVisible();
        await expect(page).toHaveTitle('No connection · Cellar');
    });
});

test.describe('English browser language', () => {
    test.use({ locale: 'en-US' });

    test('switches to Lithuanian and keeps it after a server reload', async ({ page, context }) => {
        await page.goto('/');
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');
        await expect(page).toHaveTitle('Cellar');
        expect((await context.cookies()).find(({ name }) => name === 'rusys-locale')).toBeUndefined();

        await page.getByRole('button', { name: 'Menu' }).click();
        const menu = page.getByRole('menu');
        await expect(menu.getByRole('switch', { name: 'Switch to Lithuanian' })).not.toBeChecked();
        await expect(menu.getByText('🇺🇸')).toBeVisible();

        await switchLanguage(menu, 'Switch to Lithuanian');

        await expect(menu.getByRole('link', { name: 'Produktai' })).toBeVisible();
        await expect(menu.getByRole('switch', { name: 'Perjungti į anglų kalbą' })).toBeChecked();
        await expect(menu.getByText('🇱🇹')).toBeVisible();
        await expect(page.locator('html')).toHaveAttribute('lang', 'lt');
        await expect(page).toHaveTitle('Rūsys');
        expect((await context.cookies()).find(({ name }) => name === 'rusys-locale')?.value).toBe('lt-LT');

        await page.reload();
        await expect(page.locator('html')).toHaveAttribute('lang', 'lt');
        await expect(page).toHaveTitle('Rūsys');
        await page.getByRole('button', { name: 'Meniu' }).click();
        await expect(page.getByRole('menu').getByRole('link', { name: 'Suvestinė' })).toBeVisible();

        await page.goto('/offline');
        await expect(page.getByRole('heading', { name: 'Nėra interneto ryšio' })).toBeVisible();
        await expect(page).toHaveTitle('Nėra ryšio · Rūsys');
    });
});
