import { css, productTile, renderVisualApp, settleVisual } from '@tests/browser/visual';
import { expect, test } from 'vitest';

import { page } from 'vitest/browser';

test('products page', async () => {
    await renderVisualApp('/');
    await expect.element(productTile('Avietės')).toBeVisible();
    expect(matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true);
    expect(getComputedStyle(productTile('Avietės').element()).transitionDuration).toBe('0s');
    expect(getComputedStyle(css('input').element()).caretColor).toBe('rgba(0, 0, 0, 0)');
    await settleVisual();
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
            width: Math.floor(header.width),
            height: Math.min(24, Math.floor(header.height)),
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
    await settleVisual();
    await expect(page).toMatchScreenshot('products-page-missing');
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
                    .querySelector<HTMLImageElement>('[data-icon-bg], [data-photo-bg]');
                return !!image && image.complete && image.naturalWidth > 0;
            })
            .toBe(true);
    }
    await settleVisual();
    await expect(page).toMatchScreenshot('products-page-images');
});
