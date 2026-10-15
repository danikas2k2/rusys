import { css, productTile, renderVisualApp, settleVisual } from '@tests/browser/visual';
import { expect, test } from 'vitest';

import { page } from 'vitest/browser';

test('discard product changes confirmation', async () => {
    await renderVisualApp('/');
    await expect.element(productTile('Avietės')).toBeVisible();
    await css('[data-action="add"]').click();
    const editor = page.getByRole('dialog', { name: 'Pridėti naują produktą' });
    await editor.getByRole('textbox', { name: 'Produktas' }).fill('Serbentai');
    await editor.getByRole('button', { name: 'Atšaukti' }).click();
    const confirmation = page.getByRole('dialog', { name: 'Atmesti neišsaugotus pakeitimus?' });
    await expect.element(confirmation).toBeVisible();
    await settleVisual();
    await expect(confirmation).toMatchScreenshot('discard-confirmation');
});
