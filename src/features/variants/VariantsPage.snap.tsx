import { css, renderVisualApp, settleVisual } from '@tests/browser/visual';
import { expect, test } from 'vitest';

import { page } from 'vitest/browser';

test('variants page', async () => {
    await renderVisualApp('/variants');
    const table = css('[data-table="variants"]');
    await expect.element(table.getByRole('row', { name: /Stiklainis/ }).first()).toBeVisible();
    await settleVisual();
    await expect(page).toMatchScreenshot('variants-page');
});
