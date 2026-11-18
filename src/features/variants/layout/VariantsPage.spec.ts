import { renderFixtureApp } from '@tests/browser/app';
import { element, layoutCleanup, viewportSelector } from '@tests/browser/layout';
import { describe, expect, test } from 'vitest';

import { commands, page } from 'vitest/browser';

describe('variant page layout', { tags: ['component'] }, () => {
    layoutCleanup();

    test('clips the category transition to the scrolled variants viewport', async () => {
        await page.viewport(390, 700);
        await commands.layoutReducedMotion('no-preference');
        await renderFixtureApp('/variants', 'basic', (data) => ({
            ...data,
            variants: [
                ...data.variants!,
                ...['Uogienės', 'Daržovės'].flatMap((group) =>
                    Array.from({ length: 35 }, (_, order) => ({
                        group,
                        variant: `${group} ${order}`,
                        order: order + 2,
                    }))
                ),
            ],
        }));
        await expect.element(page.getByRole('row', { name: /Uogienės 0/ })).toBeVisible();
        const viewport = element(viewportSelector);
        viewport.scrollTop = 250;
        await expect.poll(() => viewport.scrollTop).toBeGreaterThan(0);
        await expect.poll(() => element('[data-category-heading]').getBoundingClientRect().top).toBeLessThan(0);
        expect(getComputedStyle(viewport).viewTransitionName).toBe('category-page-scrollport');
        expect(getComputedStyle(viewport).getPropertyValue('view-transition-group')).toBe('contain');
        expect(
            getComputedStyle(document.documentElement, '::view-transition-group(category-page-scrollport)').overflow
        ).toBe('clip');

        await page.getByRole('tab', { name: 'Daržovės' }).click();
        await expect.element(page.getByRole('row', { name: /Daržovės 0/ })).toBeVisible();
    });
});
