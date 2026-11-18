import { renderFixtureApp } from '@tests/browser/app';
import { element, layoutCleanup, viewportSelector } from '@tests/browser/layout';
import { currentYear } from '@tests/fixtures/data';
import { describe, expect, test, vi } from 'vitest';

import { commands, page } from 'vitest/browser';

const categoryRail = '[data-tabs="category-rail"]';
const railContent = '.CategoryRailLayout-content';

async function renderLongRail(searchProduct = false) {
    await renderFixtureApp('/', 'scrolled-products', (data) => ({
        ...data,
        groups: [
            ...data.groups!,
            ...Array.from({ length: 40 }, (_, index) => ({ group: `Kategorija ${index}`, order: index + 2 })),
        ],
        products: searchProduct
            ? [...data.products!, { group: 'Kategorija 39', name: 'Ieškomas produktas', years: [] }]
            : [
                  ...data.products!,
                  ...Array.from({ length: 70 }, (_, index) => ({
                      group: 'Uogienės',
                      name: `Uoga ${index}`,
                      years: [],
                  })),
              ],
    }));
}

function tile(name: string) {
    return page.getByText(name, { exact: true }).element().closest<HTMLElement>('[data-tile-kind="product"]')!;
}

describe('product page layout', { tags: ['component'] }, () => {
    layoutCleanup();

    test('scrolls the selected category into view and restores selection after clearing search', async () => {
        await renderLongRail(true);
        const rail = element(categoryRail);
        const viewport = element(viewportSelector);
        await expect.poll(() => getComputedStyle(rail).getPropertyValue('--category-rail-height')).toMatch(/\d+px/);
        const search = page.getByRole('searchbox', { name: 'filtruokite' });
        await search.fill('Ieškomas');
        const selected = page.getByRole('tab', { name: 'Kategorija 39', exact: true });
        await expect.element(selected).toHaveAttribute('aria-selected', 'true');
        await expect.poll(() => rail.scrollTop).toBeGreaterThan(0);
        const railBox = rail.getBoundingClientRect();
        const clearance = parseFloat(getComputedStyle(document.documentElement).fontSize);
        await expect
            .poll(() => selected.element().getBoundingClientRect().top)
            .toBeGreaterThanOrEqual(railBox.top + clearance - 1);
        expect(selected.element().getBoundingClientRect().bottom).toBeLessThanOrEqual(railBox.bottom - clearance + 1);
        expect(viewport.scrollTop).toBe(0);

        await search.fill('');
        const first = page.getByRole('tab', { name: 'Uogienės', exact: true });
        await expect.element(first).toHaveAttribute('aria-selected', 'true');
        await expect
            .poll(() => first.element().getBoundingClientRect().top)
            .toBeGreaterThanOrEqual(railBox.top + clearance - 1);
        expect(first.element().getBoundingClientRect().bottom).toBeLessThanOrEqual(railBox.bottom + 1);
        expect(viewport.scrollTop).toBe(0);
    });

    test('keeps native wheel scrolling independent between the rail and product list', async () => {
        await renderLongRail();
        const rail = element(categoryRail);
        const viewport = element(viewportSelector);
        await expect.poll(() => getComputedStyle(rail).getPropertyValue('--category-rail-height')).toMatch(/\d+px/);
        expect(getComputedStyle(rail).overscrollBehaviorY).toBe('contain');
        expect(rail.scrollHeight).toBeGreaterThan(rail.clientHeight);
        const railBox = rail.getBoundingClientRect();
        const viewportBox = viewport.getBoundingClientRect();
        expect(railBox.bottom).toBeLessThanOrEqual(viewportBox.bottom + 1);

        await page.getByRole('tablist').hover({ position: { x: railBox.width / 2, y: railBox.height / 2 } });
        await commands.layoutWheel(250);
        await expect.poll(() => rail.scrollTop).toBeGreaterThan(0);
        expect(viewport.scrollTop).toBe(0);

        rail.scrollTop = rail.scrollHeight;
        await commands.layoutWheel(400);
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        expect(viewport.scrollTop).toBe(0);
        const railOffset = rail.scrollTop;

        const content = element(railContent).getBoundingClientRect();
        await commands.layoutWheel(300, {
            x: content.left + content.width / 2,
            y: viewportBox.top + viewportBox.height / 2,
        });
        await expect.poll(() => viewport.scrollTop).toBeGreaterThan(0);
        expect(rail.scrollTop).toBe(railOffset);
        expect(rail.getBoundingClientRect().top).toBeCloseTo(railBox.top, 0);
    });

    test('removes page snapshot layers while a product dialog changes year and restores them on close', async () => {
        await renderFixtureApp('/', 'annual');
        const viewport = element(viewportSelector);
        const header = element('[data-products-header]');
        const layers = () => [
            getComputedStyle(viewport).viewTransitionName,
            getComputedStyle(header).viewTransitionName,
        ];
        const original = ['category-page-scrollport', 'products-sticky-header'];
        if (CSS.supports('view-transition-group', 'contain')) {
            expect(layers()).toStrictEqual(original);
        }

        await page.getByText('Avietės', { exact: true }).click();
        const dialog = page.getByRole('dialog', { name: /Avietės Uogienės/ });
        await expect.poll(layers).toStrictEqual(['none', 'none']);
        const year = dialog.getByText(String(currentYear - 1), { exact: true });
        await year.click();
        await expect.element(dialog.getByRole('radio', { name: String(currentYear - 1), exact: true })).toBeChecked();
        expect(layers()).toStrictEqual(['none', 'none']);
        await dialog.getByRole('button', { name: 'Uždaryti' }).click();
        if (CSS.supports('view-transition-group', 'contain')) {
            await expect.poll(layers).toStrictEqual(original);
        }
    });

    test('clips the category transition to the scrolled product viewport', async () => {
        await page.viewport(390, 700);
        await commands.layoutReducedMotion('no-preference');
        await renderFixtureApp('/', 'scrolled-products');
        const viewport = element(viewportSelector);
        viewport.scrollTop = 250;
        await expect.poll(() => viewport.scrollTop).toBeGreaterThan(0);
        await expect.poll(() => element('[data-category-heading]').getBoundingClientRect().top).toBeLessThan(0);

        const supportsClipping = CSS.supports('view-transition-group', 'contain');
        if (supportsClipping) {
            expect(getComputedStyle(viewport).viewTransitionName).toBe('category-page-scrollport');
            expect(getComputedStyle(viewport).getPropertyValue('view-transition-group')).toBe('contain');
            expect(
                getComputedStyle(document.documentElement, '::view-transition-group(category-page-scrollport)').overflow
            ).toBe('clip');
        }
        const transition = vi.spyOn(document, 'startViewTransition');
        const fade = vi.spyOn(element(railContent), 'animate');
        await page.getByRole('tab', { name: 'Daržovės' }).click();
        await expect.element(page.getByText('Morkos', { exact: true })).toBeVisible();
        await expect.poll(() => transition.mock.calls.length).toBe(supportsClipping ? 1 : 0);
        await expect.poll(() => fade.mock.calls.length).toBe(supportsClipping ? 0 : 1);
    });

    test('wraps amounts below the title without overflow when the card narrows', async () => {
        await renderFixtureApp('/');
        const card = tile('Avietės');
        const title = element('[data-product-title]', card);
        const amounts = element('[data-tile-amounts]', card);
        const details = element('[data-product-details]', card);
        await expect
            .poll(() => Math.abs(amounts.getBoundingClientRect().top - title.getBoundingClientRect().top))
            .toBeLessThan(2);

        card.style.width = '120px';
        await expect.poll(() => amounts.getBoundingClientRect().top >= title.getBoundingClientRect().bottom).toBe(true);
        expect(Math.abs(amounts.getBoundingClientRect().right - details.getBoundingClientRect().right)).toBeLessThan(2);
        expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
    });

    test('equalizes neighboring card heights when one title wraps', async () => {
        const longName =
            'Labai ilgas produkto pavadinimas su papildoma informacija, kurios neužtenka sutalpinti vienoje eilutėje';
        await renderFixtureApp('/', 'basic', (data) => ({
            ...data,
            products: data.products!.map((product) =>
                product.name === 'Avietės' ? { ...product, name: longName } : product
            ),
        }));
        const first = tile(longName);
        const second = tile('Braškės');
        const grid = first.parentElement!;
        grid.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
        grid.style.gridTemplateRows = 'auto';

        expect(first.getBoundingClientRect().top).toBe(second.getBoundingClientRect().top);
        expect(first.getBoundingClientRect().height).toBe(second.getBoundingClientRect().height);
        expect(element('[data-product-name]', first).getBoundingClientRect().height).toBeGreaterThan(
            element('[data-product-name]', second).getBoundingClientRect().height
        );
    });
});
