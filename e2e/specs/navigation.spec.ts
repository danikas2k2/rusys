import { expect, test } from '../fixtures/test';

test.use({ scenario: 'history' });

const destinations = [
    { label: 'Produktai', path: '/', content: '[data-grid="products"]' },
    { label: 'Suvestinė', path: '/summary', content: '[data-grid="summary"]' },
    { label: 'Variantai', path: '/variants', content: '[data-table="variants"]' },
    { label: 'Kategorijos', path: '/categories', content: '[data-table="groups"]' },
];

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
