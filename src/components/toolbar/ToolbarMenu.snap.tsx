import { clickMenuButton, productTile, renderVisualApp, settleVisual } from '@tests/browser/visual';
import { expect, test } from 'vitest';

import { page } from 'vitest/browser';

test('navigation drawer and utilities in both themes', async () => {
    await renderVisualApp('/');
    await expect.element(productTile('Avietės')).toBeVisible();
    const expectedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    expect(document.documentElement.getAttribute('data-mantine-color-scheme')).toBe(expectedTheme);
    clickMenuButton();
    const menu = page.getByRole('dialog', { name: 'Meniu' });
    await expect.element(menu).toBeVisible();
    await settleVisual();
    await expect(menu).toMatchScreenshot('navigation-drawer');
    await menu.getByRole('link', { name: 'Įrankiai' }).click();
    await expect.element(menu.getByText('Importuoti', { exact: true })).toBeVisible();
    await settleVisual();
    await expect(menu).toMatchScreenshot('navigation-utilities');
});
