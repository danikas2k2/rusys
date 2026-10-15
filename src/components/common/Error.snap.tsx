import { renderVisualApp, settleVisual } from '@tests/browser/visual';
import { expect, test } from 'vitest';

import { page } from 'vitest/browser';

test('empty data error', async () => {
    await renderVisualApp('/', 'empty');
    const error = page.getByRole('alert', { name: 'Klaida' });
    await expect.element(error).toMatchTextContent('Duomenų nėra');
    await settleVisual();
    await expect(error).toMatchScreenshot('empty-state');
});
