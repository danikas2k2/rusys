import { css, productTile, renderVisualApp, settleVisual } from '@tests/browser/visual';
import { expect, test } from 'vitest';

import { page } from 'vitest/browser';

test('filtered toolbar', async () => {
    await renderVisualApp('/');
    await expect.element(productTile('Avietės')).toBeVisible();
    const filter = page.getByRole('searchbox', { name: 'filtruokite' });
    await filter.fill('Avietės');
    const toolbar = css('.Toolbar');
    await expect.element(toolbar.getByRole('button', { name: 'Išvalyti' })).toBeVisible();
    await settleVisual();
    await expect(toolbar).toMatchScreenshot('toolbar-filtered');
});
