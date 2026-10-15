import {
    clickMenuButton,
    css,
    holdUploadProgress,
    productTile,
    renderVisualApp,
    settleVisual,
} from '@tests/browser/visual';
import { expect, test } from 'vitest';

import { page } from 'vitest/browser';

async function openImportDialog() {
    await expect.element(productTile('Avietės')).toBeVisible();
    clickMenuButton();
    const menu = page.getByRole('navigation');
    await menu.getByRole('link', { name: 'Įrankiai' }).click();
    await menu.getByText('Importuoti', { exact: true }).click();
    return page.getByRole('dialog', { name: 'Importuoti' });
}

test('import dialog', async () => {
    await renderVisualApp('/');
    const dialog = await openImportDialog();
    await expect.element(dialog).toBeVisible();
    await settleVisual();
    await expect(dialog).toMatchScreenshot('import-dialog');
});

test('import upload progress', async () => {
    holdUploadProgress('/api/v1/imports');
    await renderVisualApp('/');
    const dialog = await openImportDialog();
    await css('input[type="file"]', dialog).upload(
        new File(['visual upload'], 'backup.zip', { type: 'application/zip' })
    );
    await dialog.getByRole('button', { name: 'Importuoti' }).click();
    await expect
        .element(dialog.getByRole('progressbar', { name: 'Upload progress' }))
        .toHaveAttribute('aria-valuenow', '42');
    await settleVisual();
    await expect(dialog).toMatchScreenshot('import-upload-progress');
});
