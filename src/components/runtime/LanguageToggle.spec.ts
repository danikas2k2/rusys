import { expect, test } from '@tests/fixtures/test';

test.use({ locale: 'lt-LT', scenario: 'history' });

test('changes language while keeping the navigation drawer open', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-grid="products"]:visible').first()).toBeVisible();
    await page.getByRole('button', { name: 'Meniu' }).click();

    const requests: string[] = [];
    page.on('request', (request) => {
        if (request.isNavigationRequest() || request.headers().rsc) {
            requests.push(request.url());
        }
    });

    const menu = page.getByRole('menu');
    const languageSwitch = menu.getByRole('switch', { name: 'Perjungti į anglų kalbą' });
    await menu.locator(`label[for="${await languageSwitch.getAttribute('id')}"]`).click();

    await expect(menu.getByRole('dialog')).toBeVisible();
    await expect(menu.getByRole('link', { name: 'Products' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle('Cellar');
    expect(requests).toStrictEqual([]);

    await menu.getByRole('link', { name: 'Summary' }).click();
    await expect(page).toHaveURL(/\/summary(?:\?|$)/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.getByRole('menu').getByRole('link', { name: 'Products' })).toBeVisible();
});
