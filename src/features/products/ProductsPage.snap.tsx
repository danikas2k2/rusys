import { css, productTile, renderVisualApp, settleVisual } from '@tests/browser/visual';
import { expect, test } from 'vitest';

import { page } from 'vitest/browser';

async function settleProductsPage() {
    // The browser pointer survives between visual tests and can hover a product in the next render.
    await productTile('Avietės').unhover();
    await settleVisual();
}

test('products page', async () => {
    await renderVisualApp('/');
    await expect.element(productTile('Avietės')).toBeVisible();
    expect(matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true);
    expect(getComputedStyle(productTile('Avietės').element()).transitionDuration).toBe('0s');
    expect(getComputedStyle(css('input').element()).caretColor).toBe('rgba(0, 0, 0, 0)');
    await settleProductsPage();
    await expect(page).toMatchScreenshot('products-page');
});

test('sticky filter during a category transition', async () => {
    const originalWidth = window.innerWidth;
    const originalHeight = window.innerHeight;
    await page.viewport(390, 700);
    try {
        await renderVisualApp('/', 'scrolled-products');
        await expect.element(productTile('Avietės')).toBeVisible();
        await new Promise((resolve) => setTimeout(resolve, 250));

        const viewport = css('.ui-AppShell-main [data-scrollarea-viewport]').element();
        viewport.scrollTop = 250;
        await expect.poll(() => css('[data-category-heading]').element().getBoundingClientRect().y).toBeLessThan(0);

        const header = css('[data-products-header]').element().getBoundingClientRect();
        const clip = {
            x: Math.ceil(header.x),
            y: Math.ceil(header.y),
            width: Math.max(1, Math.floor(header.width)),
            height: Math.max(1, Math.floor(header.height)),
        };
        await settleVisual();
        await expect(page).toMatchScreenshot('products-scrolled-header', {
            screenshotOptions: { clip },
        });

        document.documentElement.dataset.visualMotion = 'enabled';
        const style = document.createElement('style');
        style.textContent =
            '::view-transition-old(.category-update), ::view-transition-new(.category-update) { animation-duration: 2s !important; }';
        document.head.appendChild(style);
        await page.getByRole('tab', { name: 'Daržovės' }).click();
        await expect.element(page.getByText('Morkos', { exact: true })).toBeVisible();
        await expect.element(productTile('Morkos')).toBeVisible();
        await new Promise((resolve) => setTimeout(resolve, 300));
        await expect(page).toMatchScreenshot('products-scrolled-header', {
            screenshotOptions: { clip },
        });
    } finally {
        await new Promise((resolve) => setTimeout(resolve, 2100));
        delete document.documentElement.dataset.visualMotion;
        await page.viewport(originalWidth, originalHeight);
    }
});

test('products page with missing items', async () => {
    await renderVisualApp('/', 'review');
    await expect.element(productTile('Avietės')).toBeVisible();
    const icon = css('.toolbar-menu-burger-icon');
    await expect.element(icon).toBeVisible();
    await expect
        .poll(() => {
            const before = getComputedStyle(icon.element(), '::before');
            return (
                before.content !== 'none' &&
                before.content !== 'normal' &&
                before.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
                before.backgroundColor !== 'transparent'
            );
        })
        .toBe(true);
    await settleProductsPage();
    await expect(page).toMatchScreenshot('products-page-missing');
});

test('products use responsive dividers and a subtle removal background', async () => {
    await renderVisualApp('/', 'removing');
    await expect.element(productTile('Avietės')).toBeVisible();
    await settleProductsPage();
    const first = productTile('Avietės').element();
    const second = productTile('Braškės').element();
    expect(getComputedStyle(first).borderTopWidth).toBe('0px');
    expect(getComputedStyle(first).backgroundColor).not.toBe(getComputedStyle(second).backgroundColor);
    expect(first.querySelector('[data-removing-icon]')).toBeNull();
    expect(getComputedStyle(first.querySelector('.ui-Checkbox-icon')!).color).not.toBe(
        getComputedStyle(second.querySelector('.ui-Checkbox-icon')!).color
    );
    expect(getComputedStyle(first, '::before').content).toBe('none');
    const divider = getComputedStyle(second, '::before');
    if (first.getBoundingClientRect().top === second.getBoundingClientRect().top) {
        expect(divider.content).toBe('none');
    } else {
        expect(divider.content).toBe('""');
        expect(divider.height).toBe('1px');
        expect(Number.parseFloat(divider.width)).toBeCloseTo(second.getBoundingClientRect().width, 2);
    }
    await expect(page).toMatchScreenshot('products-page-removing');
});

test('products flow down each column with horizontal dividers and a half-rem column gap', async () => {
    await renderVisualApp('/', 'scrolled-products');
    await expect.element(productTile('Avietės')).toBeVisible();
    await settleProductsPage();
    const grid = productTile('Avietės').element().parentElement!;
    const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const tiles = grid.querySelectorAll(':scope > [data-tile-kind="product"]');
    const rows = getComputedStyle(grid).gridTemplateRows.split(' ').length;
    const nextRow = tiles[1];
    expect(getComputedStyle(grid).rowGap).toBe('0px');
    expect(getComputedStyle(grid).columnGap).toBe('8px');
    const horizontalDivider = getComputedStyle(nextRow, columns > 1 ? '::after' : '::before');
    expect(horizontalDivider.content).toBe('""');
    expect(horizontalDivider.height).toBe('1px');
    expect(nextRow.getBoundingClientRect().top).toBe(tiles[0].getBoundingClientRect().bottom);
    for (let index = 1; index < tiles.length; index++) {
        const previous = tiles[index - 1].getBoundingClientRect();
        const current = tiles[index].getBoundingClientRect();
        if (index % rows === 0) {
            expect(current.top).toBe(tiles[0].getBoundingClientRect().top);
            expect(current.left - previous.right).toBeCloseTo(8, 1);
        } else {
            expect(current.left).toBe(previous.left);
            expect(current.top).toBe(previous.bottom);
        }
    }
    if (columns > 1) {
        const nextColumn = tiles[rows];
        expect(getComputedStyle(nextColumn, '::before').content).toBe('none');
        expect(getComputedStyle(nextColumn, '::after').content).toBe('none');
        expect(getComputedStyle(nextRow, '::before').content).toBe('none');
        expect(getComputedStyle(tiles[0], '::after').content).toBe('none');
    }
    const bounds = grid.getBoundingClientRect();
    const x = Math.ceil(bounds.left);
    const y = Math.ceil(bounds.top);
    await expect(page).toMatchScreenshot('products-continuous-list', {
        screenshotOptions: {
            clip: {
                x,
                y,
                width: Math.floor(bounds.right) - x,
                height: Math.floor(nextRow.getBoundingClientRect().bottom) - y,
            },
        },
    });
});

test('expanded children span the column flow and subsequent products start below them', async () => {
    await renderVisualApp('/', 'grouped-products');
    const parent = productTile('Avietės');
    await expect.element(parent).toBeVisible();
    const parentElement = parent.element();
    await css('[data-product-expand]', parent).click();
    const child = productTile('Avietės su medumi');
    await expect.element(child).toBeVisible();
    await settleProductsPage();
    const panel = child.element().closest('[data-children-panel]')!;
    const grid = parentElement.parentElement!;
    expect(panel.getBoundingClientRect().width).toBeCloseTo(grid.getBoundingClientRect().width, 1);
    expect(panel.getBoundingClientRect().top).toBeGreaterThanOrEqual(parentElement.getBoundingClientRect().bottom);
    expect(productTile('Braškės').element().getBoundingClientRect().top).toBeGreaterThanOrEqual(
        panel.getBoundingClientRect().bottom
    );
    await css('[data-product-expand]', productTile('Avietės')).click();
    await expect.element(child).not.toBeVisible();
    expect(child.element().isConnected).toBe(true);
    await css('[data-product-expand]', productTile('Avietės')).click();
    await expect.element(child).toBeVisible();
});

test('products page with images', async () => {
    await renderVisualApp('/', 'images');
    const rail = css('[data-tabs="category-rail"]').element();
    await expect
        .poll(() => {
            const images = Array.from(rail.querySelectorAll('img'));
            return images.length === 2 && images.every((image) => image.complete && image.naturalWidth > 0);
        })
        .toBe(true);
    for (const name of ['Avietės', 'Braškės']) {
        await expect
            .poll(() => {
                const image = productTile(name)
                    .element()
                    .querySelector<HTMLImageElement>('[data-product-thumbnail], [data-product-icon]');
                return !!image && image.complete && image.naturalWidth > 0;
            })
            .toBe(true);
    }
    await settleProductsPage();
    await expect(page).toMatchScreenshot('products-page-images');
});

test('product amounts stay beside the title and wrap only when space runs out', async () => {
    await renderVisualApp('/');
    await expect.element(productTile('Avietės')).toBeVisible();
    const tile = productTile('Avietės').element() as HTMLElement;
    const title = tile.querySelector<HTMLElement>('[data-product-title]')!;
    const amounts = tile.querySelector<HTMLElement>('[data-tile-amounts]')!;
    const details = tile.querySelector<HTMLElement>('[data-product-details]')!;
    await expect
        .poll(() => Math.abs(amounts.getBoundingClientRect().top - title.getBoundingClientRect().top))
        .toBeLessThan(2);
    expect(tile.getBoundingClientRect().height).toBeLessThan(60);
    expect(Math.abs(amounts.getBoundingClientRect().right - details.getBoundingClientRect().right)).toBeLessThan(2);

    tile.style.width = '120px';
    await expect.poll(() => amounts.getBoundingClientRect().top >= title.getBoundingClientRect().bottom).toBe(true);
    expect(Math.abs(amounts.getBoundingClientRect().right - details.getBoundingClientRect().right)).toBeLessThan(2);
    expect(tile.scrollWidth).toBeLessThanOrEqual(tile.clientWidth);
});

test('neighboring product cards share the height of the tallest card in their row', async () => {
    await renderVisualApp('/');
    await expect.element(productTile('Avietės')).toBeVisible();
    const first = productTile('Avietės').element() as HTMLElement;
    const second = productTile('Braškės').element() as HTMLElement;
    const grid = first.parentElement!;
    grid.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
    grid.style.gridTemplateRows = 'auto';
    first.querySelector('[data-product-name]')!.textContent =
        'Labai ilgas produkto pavadinimas su papildoma informacija, kurios neužtenka sutalpinti vienoje eilutėje';
    await expect.poll(() => first.getBoundingClientRect().top === second.getBoundingClientRect().top).toBe(true);
    await expect.poll(() => first.getBoundingClientRect().height === second.getBoundingClientRect().height).toBe(true);
    expect(first.querySelector('[data-product-name]')!.getBoundingClientRect().height).toBeGreaterThan(
        second.querySelector('[data-product-name]')!.getBoundingClientRect().height
    );
});
