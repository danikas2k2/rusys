import { expect, test } from '@tests/fixtures/test';

import AxeBuilder from '@axe-core/playwright';

const routes = [
    { path: '/', content: '[data-tile-kind="product"]' },
    { path: '/summary', content: '[data-summary-tile]' },
    { path: '/categories', content: '[data-table="groups"]' },
    { path: '/variants', content: '[data-table="variants"]' },
    { path: '/offline', content: 'main h1' },
];

test.describe('accessibility', () => {
    test.use({ scenario: 'history' });

    for (const { path, content } of routes) {
        test(`scans ${path}`, async ({ page }) => {
            await page.goto(path);
            await expect(page.locator(content).first()).toBeVisible();
            const results = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
                .analyze();
            expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
        });
    }

    test('scans the open navigation menu', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('[data-tile-kind="product"]').first()).toBeVisible();
        await page.getByRole('button', { name: 'Meniu' }).click();
        await expect(page.getByRole('dialog', { name: 'Meniu' })).toBeVisible();
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });

    test('scans a product form dialog', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('[data-tile-kind="product"]').first()).toBeVisible();
        await page.locator('[data-action="add"]').click();
        const dialog = page.getByRole('dialog', { name: 'Pridėti naują produktą' });
        await expect(dialog).toBeVisible();
        const results = await new AxeBuilder({ page })
            .include('[role="dialog"]')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();
        expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });

    test('scans a positive form action in dark mode', async ({ page }) => {
        await page.goto('/');
        await page.locator('html').evaluate((element) => element.setAttribute('data-mantine-color-scheme', 'dark'));
        await page.locator('[data-action="add"]').click();
        const dialog = page.getByRole('dialog', { name: 'Pridėti naują produktą' });
        await expect(dialog).toBeVisible();
        const results = await new AxeBuilder({ page })
            .include('[role="dialog"]')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();
        expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });
});
