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
    const history = page.getByRole('dialog').last();
    return history;
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
    const icon = tile.locator('[data-icon-bg]').first();
    await expect.poll(() => icon.evaluate((element) => getComputedStyle(element).backgroundImage)).toMatch(/^url\(/);
    await icon.evaluate(async (element) => {
        const source = getComputedStyle(element).backgroundImage.match(/^url\(["']?(.*?)["']?\)$/)?.[1];
        if (!source) {
            throw new Error('Tile has no background image');
        }
        const image = new Image();
        image.src = source;
        await image.decode();
    });
}
