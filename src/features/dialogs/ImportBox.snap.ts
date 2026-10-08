import { expect, test } from '@tests/fixtures/visual';
import { holdUploadProgress } from '@tests/helpers/holdUploadProgress';
import { productTile } from '@tests/helpers/ui';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT' });

test('import dialog', async ({ page }) => {
    await page.goto('/');
    await expect(productTile(page, 'Avietės')).toBeVisible();
    await page.getByRole('button', { name: 'Meniu' }).click();
    const menu = page.getByRole('menu');
    await menu.getByRole('link', { name: 'Įrankiai' }).click();
    await menu.getByText('Importuoti', { exact: true }).click();
    const importDialog = page.getByRole('dialog', { name: 'Importuoti' });
    await expect(importDialog).toHaveScreenshot(['ImportBox', 'import-dialog.png']);
});

test('import upload progress', async ({ page }) => {
    await holdUploadProgress(page, '/api/v1/imports');
    await page.goto('/');
    await expect(productTile(page, 'Avietės')).toBeVisible();
    await page.getByRole('button', { name: 'Meniu' }).click();
    const menu = page.getByRole('menu');
    await menu.getByRole('link', { name: 'Įrankiai' }).click();
    await menu.getByText('Importuoti', { exact: true }).click();
    const importDialog = page.getByRole('dialog', { name: 'Importuoti' });
    await importDialog.locator('input[type="file"]').setInputFiles({
        name: 'backup.zip',
        mimeType: 'application/zip',
        buffer: Buffer.from('visual upload'),
    });
    await importDialog.getByRole('button', { name: 'Importuoti' }).click();
    await expect(importDialog.getByRole('progressbar', { name: 'Upload progress' })).toHaveAttribute(
        'aria-valuenow',
        '42'
    );
    await expect(importDialog).toHaveScreenshot(['ImportBox', 'import-upload-progress.png']);
});
