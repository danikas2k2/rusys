import { expect, test } from '@tests/fixtures/test';

const destinations = [
    { label: 'Produktai', path: '/', content: '[data-grid="products"]' },
    { label: 'Variantai', path: '/variants', content: '[data-table="variants"]' },
    { label: 'Kategorijos', path: '/categories', content: '[data-table="groups"]' },
];

test.describe('desktop navigation', () => {
    test.use({ scenario: 'history' });
    test.skip(({ isMobile }) => isMobile);

    test('switches categories', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('[data-grid="products"]:visible').first()).toBeVisible();
        await page.getByRole('tab', { name: 'Daržovės' }).click();
        await expect(page.getByRole('tab', { name: 'Daržovės' })).toHaveAttribute('aria-selected', 'true');
        await expect(page.locator('[data-grid="products"]:visible')).toContainText('Morkos');
        await expect(page.locator('[data-grid="products"]:visible')).not.toContainText('Avietės');
    });

    test('navigates and restores the previous page without the browser API', async ({ page }) => {
        await page.addInitScript(() => {
            Object.defineProperty(document, 'startViewTransition', { configurable: true, value: undefined });
        });

        await page.goto('/');
        await expect(page.locator('[data-grid="products"]:visible').first()).toBeVisible();
        await page.getByRole('button', { name: 'Meniu' }).click();
        await page.getByRole('navigation').getByRole('link', { name: 'Variantai' }).click();
        await expect(page.locator('[data-table="variants"]:visible').first()).toBeVisible();
        await page.goBack();
        await expect(page.locator('[data-grid="products"]:visible').first()).toBeVisible();
    });

    test('navigates with server-preloaded destination data', async ({ page }) => {
        const apiRequests: string[] = [];
        page.on('request', (request) => {
            if (request.url().includes('/api/v1/')) {
                apiRequests.push(request.url());
            }
        });
        await page.goto('/');
        await expect(page.locator('[data-grid="products"]:visible').first()).toBeVisible();
        await page.getByRole('button', { name: 'Meniu' }).click();
        await page.getByRole('navigation').getByRole('link', { name: 'Variantai' }).click();
        await expect(page.locator('[data-table="variants"]:visible').first()).toBeVisible();
        expect(apiRequests).toStrictEqual([]);
    });

    test('menu navigates between all primary routes', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('[data-grid="products"]:visible').first()).toBeVisible();
        for (const { label, path, content } of [...destinations.slice(1), destinations[0]!]) {
            await test.step(`menu navigates to ${label}`, async () => {
                await page.getByRole('button', { name: 'Meniu' }).click();
                const menu = page.getByRole('navigation');
                const drawer = page.getByRole('dialog', { name: 'Meniu' });
                await expect(drawer).toBeVisible();
                await expect(menu.getByRole('link', { name: 'Suvestinė' })).toHaveCount(0);
                await menu.getByRole('link', { name: label }).click();
                await expect(page).toHaveURL(new RegExp(`${path === '/' ? '/$' : `${path}$`}`));
                await expect(drawer).toBeHidden();
                await expect(page.locator(`${content}:visible`).first()).toBeVisible();

                await page.getByRole('button', { name: 'Meniu' }).click();
                await expect(menu.getByRole('link', { name: label })).toHaveAttribute('data-active', 'true');
                await page.keyboard.press('Escape');
                await expect(drawer).toBeHidden();
            });
        }
    });

    for (const { label, path, content } of destinations) {
        test(`opens ${label} directly`, async ({ page }) => {
            await page.goto(path);
            await expect(page.locator(`${content}:visible`).first()).toBeVisible();
        });
    }

    test('menu keeps URL filters when navigating and closes with Escape', async ({ page }) => {
        const filters = 'q=Aviet%C4%97s&g=Uogien%C4%97s';
        await page.goto(`/?${filters}`);
        await page.getByRole('button', { name: 'Meniu' }).click();
        const menu = page.getByRole('navigation');
        await menu.getByRole('link', { name: 'Variantai' }).click();
        await expect(page).toHaveURL(new RegExp(`/variants\\?${filters}$`));

        await page.getByRole('button', { name: 'Meniu' }).click();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog', { name: 'Meniu' })).toBeHidden();
    });
});

test.describe('mobile navigation', { tag: '@mobile' }, () => {
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
