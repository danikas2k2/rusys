import { expect, type Locator, type Page } from '@playwright/test';

export function productTile(page: Page, name: string) {
    return page.locator('[data-tile-kind="product"]:visible').filter({ hasText: name }).first();
}

export async function openProduct(page: Page, name: string) {
    await productTile(page, name).click();
    return page.getByRole('dialog', { name: new RegExp(`${name} Uogienės`) });
}

export async function openSummaryHistory(page: Page) {
    await page.goto('/summary');
    const tile = page.locator('[data-summary-tile]').filter({ hasText: 'Avietės' });
    await tile.click();
    return page.getByRole('dialog').last();
}

export async function waitForImages(locator: Locator, count: number) {
    const images = locator.locator('img');
    await expect(images).toHaveCount(count);
    await expect
        .poll(() =>
            images.evaluateAll((elements: HTMLImageElement[]) =>
                elements.every((image) => image.complete && image.naturalWidth > 0)
            )
        )
        .toBe(true);
}

export async function waitForTileBackground(tile: Locator) {
    const image = tile.locator('[data-icon-bg], [data-photo-bg]').first();
    await expect(image).toBeVisible();
    await expect
        .poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0))
        .toBe(true);
}

export async function waitForMenuIcon(page: Page) {
    const icon = page.locator('.toolbar-menu-burger-icon');
    await expect(icon).toBeVisible();
    await expect
        .poll(() =>
            icon.evaluate((element) => {
                const before = getComputedStyle(element, '::before');
                return (
                    before.content !== 'none' &&
                    before.content !== 'normal' &&
                    before.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
                    before.backgroundColor !== 'transparent'
                );
            })
        )
        .toBe(true);
}
