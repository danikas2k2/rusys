import { expect, test } from '@tests/fixtures/test';

const destinations = [
    { label: 'Produktai', path: '/', content: '[data-grid="products"]' },
    { label: 'Suvestinė', path: '/summary', content: '[data-grid="summary"]' },
    { label: 'Variantai', path: '/variants', content: '[data-table="variants"]' },
    { label: 'Kategorijos', path: '/categories', content: '[data-table="groups"]' },
];

test.describe('reduced motion', () => {
    test.use({ scenario: 'history' });
    test.skip(({ isMobile }) => isMobile);

    test('disables CSS motion across the app and startup loader', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('[data-grid="products"]:visible').first()).toBeVisible();
        expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
        await page.addStyleTag({ url: '/assets/loader.css' });

        const movingElements = await page.evaluate(() => {
            const loader = document.createElement('div');
            loader.className = 'loader';
            loader.innerHTML = '<div></div><div></div><div></div>';
            document.body.append(loader);

            return Array.from(document.querySelectorAll('body *'))
                .filter((element) => !element.closest('nextjs-portal'))
                .flatMap((element) => {
                    const style = getComputedStyle(element);
                    const durations = [style.animationDuration, style.transitionDuration].flatMap((value) =>
                        value.split(',').map((duration) => Number.parseFloat(duration))
                    );
                    return durations.some((duration) => duration > 0) ? [element.outerHTML.slice(0, 120)] : [];
                });
        });

        expect(movingElements).toEqual([]);
    });
});

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
        await page.getByRole('menu').getByRole('link', { name: 'Suvestinė' }).click();
        await expect(page.locator('[data-grid="summary"]:visible').first()).toBeVisible();
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
        await page.getByRole('menu').getByRole('link', { name: 'Suvestinė' }).click();
        await expect(page.locator('[data-grid="summary"]:visible').first()).toBeVisible();
        expect(apiRequests).toStrictEqual([]);
    });

    test('menu navigates between all primary routes', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('[data-grid="products"]:visible').first()).toBeVisible();
        for (const { label, path, content } of [...destinations.slice(1), destinations[0]!]) {
            await test.step(`menu navigates to ${label}`, async () => {
                await page.getByRole('button', { name: 'Meniu' }).click();
                const menu = page.getByRole('menu');
                await expect(menu.getByRole('dialog')).toBeVisible();
                await menu.getByRole('link', { name: label }).click();
                await expect(page).toHaveURL(new RegExp(`${path === '/' ? '/$' : `${path}$`}`));
                await expect(menu.getByRole('dialog')).toBeHidden();
                await expect(page.locator(`${content}:visible`).first()).toBeVisible();

                await page.getByRole('button', { name: 'Meniu' }).click();
                await expect(menu.getByRole('link', { name: label })).toHaveAttribute('data-active', 'true');
                await page.keyboard.press('Escape');
                await expect(menu.getByRole('dialog')).toBeHidden();
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

    test('page and menu fit within the viewport with iOS safe area insets', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('[data-grid="products"]:visible').first()).toBeVisible();
        await page.addStyleTag({
            content:
                ':root { --safe-block-start: 59px; --safe-block-end: 34px; --safe-inline-start: 12px; --safe-inline-end: 12px; }',
        });

        const shell = page.locator('.ui-AppShell-root');
        const shellBounds = await shell.boundingBox();
        const footerBounds = await page.locator('.ui-AppShell-footer').boundingBox();
        const viewport = page.viewportSize()!;

        expect(shellBounds).not.toBeNull();
        expect(footerBounds).not.toBeNull();
        expect(shellBounds!.x).toBeGreaterThanOrEqual(0);
        expect(shellBounds!.x + shellBounds!.width).toBeLessThanOrEqual(viewport.width);
        expect(shellBounds!.y + shellBounds!.height).toBeLessThanOrEqual(viewport.height);
        expect(footerBounds!.y + footerBounds!.height).toBeLessThanOrEqual(viewport.height);

        await page.getByRole('button', { name: 'Meniu' }).tap();
        const menuBounds = await page.locator('.drawer .ui-Drawer-content').boundingBox();
        expect(menuBounds).not.toBeNull();
        expect(menuBounds!.y + menuBounds!.height).toBeLessThanOrEqual(viewport.height);
    });

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
