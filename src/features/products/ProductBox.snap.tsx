import {
    css,
    dialogScreenshotOptions,
    openProduct,
    productTile,
    renderVisualApp,
    settleVisual,
} from '@tests/browser/visual';
import { expect, test } from 'vitest';

import { page } from 'vitest/browser';

test('product editor', async () => {
    await renderVisualApp('/');
    const amounts = await openProduct('Avietės');
    await amounts.getByRole('button', { name: 'Taisyti' }).click();
    const editor = page.getByRole('dialog', { name: 'Taisyti produktą' });
    const name = editor.getByRole('textbox', { name: 'Produktas' });
    await expect.element(editor).toBeVisible();
    await expect.element(name).toHaveFocus();
    await settleVisual();
    await expect.element(name).toHaveFocus();
    await expect(page).toMatchScreenshot('product-editor', dialogScreenshotOptions(editor));
});

test('product creation and additional details', async () => {
    await renderVisualApp('/');
    await expect.element(productTile('Avietės')).toBeVisible();
    await css('[data-action="add"]').click();
    const dialog = page.getByRole('dialog', { name: 'Pridėti naują produktą' });
    await expect.element(dialog).toBeVisible();
    await expect.element(dialog.getByRole('textbox', { name: 'Produktas' })).toHaveFocus();
    await settleVisual();
    await expect(page).toMatchScreenshot('product-create', dialogScreenshotOptions(dialog));
    const details = dialog.getByRole('button', { name: 'Papildoma informacija' });
    await details.click();
    // React commits this accordion in a transition; wait before measuring the screenshot clip.
    await expect.element(details).toHaveAttribute('aria-expanded', 'true');
    await expect.element(dialog.getByRole('combobox', { name: 'Tėvinis produktas' })).toBeVisible();
    await settleVisual();
    await expect(page).toMatchScreenshot('product-create-details', dialogScreenshotOptions(dialog));
});
