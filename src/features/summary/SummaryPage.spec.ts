import { currentYear } from '@tests/fixtures/data';
import { expect, test } from '@tests/fixtures/test';

import type { Product } from '~/schema';

test.use({ scenario: 'history' });

test.describe('summary', () => {
    test('clips the category transition to the scrolled summary viewport', async ({ page, db }) => {
        await page.setViewportSize({ width: 390, height: 700 });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await db.collection<Product>('products').insertMany(
            ['Uogienės', 'Daržovės'].flatMap((group) =>
                Array.from({ length: 30 }, (_, index) => ({
                    group,
                    name: `${group} ${index}`,
                    updates: [
                        {
                            time: Date.now(),
                            years: [
                                {
                                    year: currentYear,
                                    amounts: [
                                        {
                                            variant: group === 'Uogienės' ? 'Stiklainis' : 'Kilogramas',
                                            amount: -1,
                                            recycled: false,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                }))
            )
        );
        await page.goto('/summary');
        await expect(page.locator('[data-summary-tile]').filter({ hasText: 'Uogienės 0' }).first()).toBeVisible();

        const viewport = page.locator('.ui-AppShell-main [data-scrollarea-viewport]');
        await viewport.evaluate((element) => {
            element.scrollTop = 250;
        });
        await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
        await expect.poll(async () => (await page.locator('[data-category-heading]').boundingBox())?.y).toBeLessThan(0);
        expect(
            await viewport.evaluate((element) => getComputedStyle(element).getPropertyValue('view-transition-group'))
        ).toBe('contain');

        await page.getByRole('tab', { name: 'Daržovės' }).click();
        await expect(page.locator('[data-summary-tile]').filter({ hasText: 'Daržovės 0' }).first()).toBeVisible();
    });

    test('consumption persists and summary filters work @critical', async ({ page }) => {
        await page.goto('/summary');
        const tile = page.locator('[data-summary-tile]').filter({ hasText: 'Avietės' });
        await test.step('consumption appears in the history dialog and survives reload', async () => {
            await expect(tile).toBeVisible();
            await expect(tile).toContainText('1');
            await tile.click();
            const history = page.getByRole('dialog').last();
            await expect(history).toContainText('Suvalgyta su arbata');
            await page.reload();
            await expect(tile).toContainText('1');
        });

        await test.step('quick search filters the summary', async () => {
            await page.getByRole('searchbox', { name: 'filtruokite' }).fill('kopūstai');
            await expect(tile).toBeHidden();
            await page.getByRole('searchbox', { name: 'filtruokite' }).clear();
            await expect(tile).toBeVisible();
            await expect(tile).toHaveAttribute('data-year', String(currentYear));
        });
    });
});
