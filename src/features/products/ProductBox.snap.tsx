import { css, openProduct, productTile, renderVisualApp, settleVisual } from '@tests/browser/visual';
import { expect, test } from 'vitest';

import { page } from 'vitest/browser';

test('product editor', async () => {
    await renderVisualApp('/');
    const amounts = await openProduct('Avietės');
    await amounts.getByRole('button', { name: 'Taisyti' }).click();
    const editor = page.getByRole('dialog', { name: 'Taisyti produktą' });
    await expect.element(editor).toBeVisible();
    await expect.element(editor.getByRole('textbox', { name: 'Produktas' })).toHaveFocus();
    await settleVisual();
    await expect(editor).toMatchScreenshot('product-editor');
});

test('product creation and additional details', async () => {
    await renderVisualApp('/');
    await expect.element(productTile('Avietės')).toBeVisible();
    await css('[data-action="add"]').click();
    const dialog = page.getByRole('dialog', { name: 'Pridėti naują produktą' });
    await expect.element(dialog).toBeVisible();
    await expect.element(dialog.getByRole('textbox', { name: 'Produktas' })).toHaveFocus();
    await settleVisual();
    await expect(dialog).toMatchScreenshot('product-create');
    await dialog.getByRole('button', { name: 'Papildoma informacija' }).click();
    await settleVisual();
    await expect(dialog).toMatchScreenshot('product-create-details');
});
