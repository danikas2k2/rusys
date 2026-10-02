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

    test('starts a view transition for category changes', async ({ page }) => {
        await page.addInitScript(() => {
            const original = document.startViewTransition.bind(document);
            const counter = window as typeof window & { __viewTransitionStarts: number };
            counter.__viewTransitionStarts = 0;
            document.startViewTransition = (...args) => {
                counter.__viewTransitionStarts += 1;
                return original(...args);
            };
        });

        await page.goto('/');
        await expect(page.locator('[data-grid="products"]')).toBeVisible();
        await page.evaluate(() => {
            (window as typeof window & { __viewTransitionStarts: number }).__viewTransitionStarts = 0;
        });

        await page.getByRole('tab', { name: 'Daržovės' }).click();
        await expect(page.getByRole('tab', { name: 'Daržovės' })).toHaveAttribute('aria-selected', 'true');
        await expect
            .poll(() =>
                page.evaluate(
                    () => (window as typeof window & { __viewTransitionStarts: number }).__viewTransitionStarts
                )
            )
            .toBeGreaterThan(0);
    });

    test('disables view transition animations for reduced motion', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.addInitScript(() => {
            const original = document.startViewTransition.bind(document);
            const observed = window as typeof window & { __viewTransitionDurations: number[] };
            observed.__viewTransitionDurations = [];
            document.startViewTransition = (...args) => {
                const transition = original(...args);
                void transition.ready.then(() => {
                    observed.__viewTransitionDurations.push(
                        ...document
                            .getAnimations()
                            .filter((animation) =>
                                (animation.effect as KeyframeEffect | null)?.pseudoElement?.startsWith(
                                    '::view-transition'
                                )
                            )
                            .map((animation) => Number(animation.effect?.getComputedTiming().duration))
                    );
                });
                return transition;
            };
        });

        await page.goto('/');
        await expect(page.locator('[data-grid="products"]')).toBeVisible();
        await page.evaluate(() => {
            (window as typeof window & { __viewTransitionDurations: number[] }).__viewTransitionDurations = [];
        });
        await page.getByRole('tab', { name: 'Daržovės' }).click();
        await expect(page.getByRole('tab', { name: 'Daržovės' })).toHaveAttribute('aria-selected', 'true');

        await expect
            .poll(() =>
                page.evaluate(
                    () => (window as typeof window & { __viewTransitionDurations: number[] }).__viewTransitionDurations
                )
            )
            .not.toHaveLength(0);
        const durations = await page.evaluate(
            () => (window as typeof window & { __viewTransitionDurations: number[] }).__viewTransitionDurations
        );
        expect(durations.every((duration) => duration === 0)).toBe(true);
    });

    test('navigates and restores the previous page without the browser API', async ({ page }) => {
        await page.addInitScript(() => {
            Object.defineProperty(document, 'startViewTransition', { configurable: true, value: undefined });
        });

        await page.goto('/');
        await expect(page.locator('[data-grid="products"]')).toBeVisible();
        await page.getByRole('button', { name: 'Meniu' }).click();
        await page.getByRole('menu').getByRole('link', { name: 'Suvestinė' }).click();
        await expect(page.locator('[data-grid="summary"]')).toBeVisible();
        await page.goBack();
        await expect(page.locator('[data-grid="products"]')).toBeVisible();
    });

    test('navigates with server-preloaded destination data', async ({ page }) => {
        const apiRequests: string[] = [];
        page.on('request', (request) => {
            if (request.url().includes('/api/v1/')) {
                apiRequests.push(request.url());
            }
        });
        await page.goto('/');
        await expect(page.locator('[data-grid="products"]')).toBeVisible();
        await page.getByRole('button', { name: 'Meniu' }).click();
        await page.getByRole('menu').getByRole('link', { name: 'Suvestinė' }).click();
        await expect(page.locator('[data-grid="summary"]')).toBeVisible();
        expect(apiRequests).toStrictEqual([]);
    });

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

    test('page and menu fit within the viewport with iOS safe area insets', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('[data-grid="products"]')).toBeVisible();
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
