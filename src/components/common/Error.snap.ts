import { expect, test } from '@tests/fixtures/visual';

test.use({ reducedMotion: 'reduce', locale: 'lt-LT', scenario: 'empty' });

test('empty data error', async ({ page }) => {
    await page.goto('/');
    const error = page.getByRole('alert', { name: 'Klaida' });
    await expect(error).toContainText('Duomenų nėra');
    await expect(error).toHaveScreenshot(['Error', 'empty-state.png']);
});
