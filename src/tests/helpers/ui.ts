import type { test } from '../fixtures/test';

type Page = Parameters<Parameters<typeof test>[2]>[0]['page'];

export function productTile(page: Page, name: string) {
    return page.locator('[data-tile-kind="product"]').filter({ hasText: name });
}

export async function openProduct(page: Page, name: string) {
    await productTile(page, name).click();
    return page.getByRole('dialog', { name: new RegExp(`${name} Uogienės`) });
}
