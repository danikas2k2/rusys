import { css, renderVisualApp, settleVisual } from '@tests/browser/visual';
import { expect, test } from 'vitest';

import { page, userEvent } from 'vitest/browser';

test('category creation and editor', async () => {
    await renderVisualApp('/categories');
    const table = css('[data-table="groups"]');
    await expect.element(table.getByRole('row', { name: /Uogienės/ })).toBeVisible();
    await css('[data-action="add"]').click();
    const creation = page.getByRole('dialog', { name: 'Pridėti naują kategoriją' });
    await expect.element(creation).toBeVisible();
    await expect.element(creation.getByRole('textbox', { name: 'Kategorija' })).toHaveFocus();
    await settleVisual();
    await expect(creation).toMatchScreenshot('category-create');
    await userEvent.keyboard('{Escape}');
    await table.getByRole('row', { name: /Uogienės/ }).click();
    const editor = page.getByRole('dialog', { name: 'Taisyti kategoriją' });
    await expect.element(editor).toBeVisible();
    await expect.element(editor.getByRole('textbox', { name: 'Kategorija' })).toHaveFocus();
    await settleVisual();
    await expect(editor).toMatchScreenshot('category-editor');
});
