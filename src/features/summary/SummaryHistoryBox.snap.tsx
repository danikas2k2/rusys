import { renderVisualApp, settleVisual } from '@tests/browser/visual';
import { expect, test } from 'vitest';

import { page } from 'vitest/browser';

test('summary history dialog', async () => {
    await renderVisualApp('/summary', 'history');
    const tile = Array.from(document.querySelectorAll('[data-summary-tile]')).find((element) =>
        element.textContent?.includes('Avietės')
    );
    if (!tile) {
        throw new Error('Summary tile Avietės not found');
    }
    await page.elementLocator(tile).click();
    const history = page.getByRole('dialog').last();
    await expect.element(history).toMatchTextContent('Suvalgyta su arbata');
    await settleVisual();
    await expect(history).toMatchScreenshot('summary-history-dialog');
});
