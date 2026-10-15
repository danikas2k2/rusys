import { css, renderVisualApp, settleVisual } from '@tests/browser/visual';
import { expect, test } from 'vitest';

import { page } from 'vitest/browser';

function firstSummaryTile(name: string) {
    const tile = Array.from(document.querySelectorAll('[data-summary-tile]')).find((element) =>
        element.textContent?.includes(name)
    );
    if (!tile) {
        throw new Error(`Summary tile ${name} not found`);
    }
    return page.elementLocator(tile);
}

test('summary page', async () => {
    await renderVisualApp('/summary', 'history');
    await expect.element(firstSummaryTile('Avietės')).toBeVisible();
    await settleVisual();
    await expect(css('.ui-AppShell-root')).toMatchScreenshot('summary-page');
});

test('summary page with images', async () => {
    await renderVisualApp('/summary', 'history-images');
    await expect.element(firstSummaryTile('Avietės')).toBeVisible();
    const menuIcon = css('.toolbar-menu-burger-icon');
    await expect.element(menuIcon).toBeVisible();
    await expect
        .poll(() => {
            const before = getComputedStyle(menuIcon.element(), '::before');
            return (
                before.content !== 'none' &&
                before.content !== 'normal' &&
                before.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
                before.backgroundColor !== 'transparent'
            );
        })
        .toBe(true);
    await settleVisual();
    await expect(page).toMatchScreenshot('summary-page-images');
});

test('summary page with consumed and recycled', async () => {
    await renderVisualApp('/summary', 'consumed-recycled');
    await expect.element(firstSummaryTile('Avietės')).toBeVisible();
    await settleVisual();
    await expect(page).toMatchScreenshot('summary-page-consumed-and-recycled');
});
