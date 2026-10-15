import { css, renderVisualApp, settleVisual } from '@tests/browser/visual';
import { expect, test } from 'vitest';

import { page, userEvent } from 'vitest/browser';

test('variant creation and editor', async () => {
    await renderVisualApp('/variants');
    const table = css('[data-table="variants"]');
    await expect.element(table.getByRole('row', { name: /Stiklainis/ }).first()).toBeVisible();
    await css('[data-action="add"]').click();
    await expect.element(page.getByRole('textbox', { name: 'Variantas' })).toHaveFocus();
    const creation = page.getByRole('dialog', { name: 'Pridėti naują variantą' });
    await expect.element(creation).toBeVisible();
    await settleVisual();
    await expect(creation).toMatchScreenshot('variant-create');
    await userEvent.keyboard('{Escape}');
    await table
        .getByRole('row', { name: /Stiklainis/ })
        .first()
        .click();
    const editor = page.getByRole('dialog', { name: 'Taisyti variantą' });
    await expect.element(editor).toBeVisible();
    await settleVisual();
    await expect(editor).toMatchScreenshot('variant-editor');
});
