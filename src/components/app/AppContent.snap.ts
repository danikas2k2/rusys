import { expect, test } from '@tests/fixtures/test';

test.use({ colorScheme: 'light', reducedMotion: 'reduce', locale: 'lt-LT' });

test.describe('desktop', () => {
    test.describe('empty state', () => {
        test.use({ scenario: 'empty' });

        test('empty page and error component', async ({ page }) => {
            await page.goto('/');
            const error = page.getByRole('alert', { name: 'Klaida' });
            await expect(error).toContainText('Duomenų nėra');
            await expect(error).toHaveScreenshot(['AppContent', 'empty-state.png']);
        });
    });
});
