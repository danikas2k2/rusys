import { clickMenuButton, productTile, renderVisualApp, settleVisual } from '@tests/browser/visual';
import { expect, test } from 'vitest';

import { page } from 'vitest/browser';

test('export dialog', async () => {
    await renderVisualApp('/');
    await expect.element(productTile('Avietės')).toBeVisible();
    clickMenuButton();
    const menu = page.getByRole('navigation');
    await menu.getByRole('link', { name: 'Įrankiai' }).click();
    await menu.getByText('Eksportuoti', { exact: true }).click();
    const dialog = page.getByRole('dialog', { name: /Eksportuoti duomenis/ });
    await expect.element(dialog).toBeVisible();
    await settleVisual();
    await expect(dialog).toMatchScreenshot('export-dialog');
});
