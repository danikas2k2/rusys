import { currentYear } from '@tests/fixtures/data';
import { expect, test } from '@tests/fixtures/test';
import { openProduct, productTile } from '@tests/helpers/ui';

import type { Product } from '~/schema';

test.use({ scenario: 'annual' });

test.describe('annual products', () => {
    test('keeps variant suffixes smaller than physical units in both totals', async ({ page, db }) => {
        await db
            .collection('variants')
            .updateOne({ group: 'Uogienės', variant: 'Stiklainis' }, { $set: { count: 0.5, units: 'l' } });
        await db
            .collection('variants')
            .updateOne(
                { group: 'Uogienės', variant: 'Didelis indelis' },
                { $set: { count: 0.25, units: 'l', suffix: 'm' } }
            );
        await db.collection('variants').insertOne({ group: 'Uogienės', variant: 'Papildomi', order: 2, suffix: 'e' });
        await db.collection<Product>('products').updateOne(
            { name: 'Avietės' },
            {
                $set: {
                    years: [
                        {
                            year: currentYear,
                            amounts: [
                                { variant: 'Stiklainis', amount: 2 },
                                { variant: 'Papildomi', amount: 4 },
                            ],
                        },
                    ],
                    updates: [
                        {
                            time: new Date(2000 + currentYear, 9, 1, 12).getTime(),
                            years: [
                                {
                                    year: currentYear,
                                    amounts: [
                                        { variant: 'Stiklainis', amount: -5, recycled: false },
                                        { variant: 'Didelis indelis', amount: -1, recycled: false },
                                        { variant: 'Stiklainis', amount: -3, recycled: true },
                                        { variant: 'Didelis indelis', amount: -1, recycled: true },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            }
        );
        await page.goto('/');
        const dialog = await openProduct(page, 'Avietės');
        const suffix = dialog.locator('[data-product-stock-total] sub').filter({ hasText: /^e$/ });
        const units = dialog.locator('[data-product-summary-total] [data-total] > sub');
        const sourceSuffixes = dialog.locator('[data-product-summary-total] [data-sources] sub');
        await expect(sourceSuffixes).toHaveCount(2);
        const suffixSize = await suffix.evaluate((element) => getComputedStyle(element).fontSize);
        for (const source of await sourceSuffixes.all()) {
            expect(await source.evaluate((element) => getComputedStyle(element).fontSize)).toBe(suffixSize);
        }
        for (const unit of await units.all()) {
            expect(await unit.textContent()).toBe('l');
            expect(await unit.evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThan(
                parseFloat(suffixSize)
            );
        }
    });

    test('aligns dialog totals vertically and keeps units on the same baseline', async ({ page, db }) => {
        await db
            .collection('variants')
            .updateOne({ group: 'Uogienės', variant: 'Stiklainis' }, { $set: { count: 0.5, units: 'l' } });
        await db.collection<Product>('products').updateOne(
            { name: 'Avietės' },
            {
                $set: {
                    updates: [
                        {
                            time: new Date(2000 + currentYear, 9, 1, 12).getTime(),
                            years: [
                                {
                                    year: currentYear,
                                    amounts: [
                                        { variant: 'Stiklainis', amount: -1, recycled: false },
                                        { variant: 'Stiklainis', amount: -1, recycled: true },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            }
        );
        await page.goto('/');
        const dialog = await openProduct(page, 'Avietės');
        await dialog
            .locator('label')
            .filter({ hasText: new RegExp(`^${currentYear}$`) })
            .click();
        const summary = dialog.locator('[data-product-summary-total]');
        await expect(summary.locator('[data-type="recycled"]')).toBeVisible();

        const metrics = await dialog.evaluate((element) => {
            function measure(selector: string) {
                const block = element.querySelector(selector)!;
                const value = block.querySelector('[data-value][data-total="volume"]')!;
                const unit = value.querySelector('sub')!;
                const number = value.querySelector('[data-number]')!;
                const rect = block.getBoundingClientRect();
                return {
                    center: rect.top + rect.height / 2,
                    alignment: getComputedStyle(value).alignItems,
                    unitSize: getComputedStyle(unit).fontSize,
                    unitOffset: unit.getBoundingClientRect().bottom - number.getBoundingClientRect().bottom,
                };
            }
            return { stock: measure('[data-product-stock-total]'), summary: measure('[data-product-summary-total]') };
        });
        expect(Math.abs(metrics.stock.center - metrics.summary.center)).toBeLessThan(1);
        expect(metrics.stock.alignment).toBe('baseline');
        expect(metrics.summary.alignment).toBe('baseline');
        expect(metrics.stock.unitSize).toBe(metrics.summary.unitSize);
        expect(Math.abs(metrics.stock.unitOffset - metrics.summary.unitOffset)).toBeLessThan(1);
    });

    test('offers consumption periods without stock and shows their totals and history', async ({ page, db }) => {
        const consumptionYear = currentYear - 1;
        await db.collection<Product>('products').updateOne(
            { name: 'Avietės' },
            {
                $set: {
                    years: [{ year: currentYear, amounts: [{ variant: 'Stiklainis', amount: 3 }] }],
                    updates: [
                        {
                            time: new Date(2000 + consumptionYear, 9, 1, 12).getTime(),
                            comment: 'Consumption without stock',
                            years: [
                                {
                                    year: currentYear - 3,
                                    amounts: [{ variant: 'Stiklainis', amount: -2, recycled: false }],
                                },
                            ],
                        },
                    ],
                },
            }
        );
        await page.goto('/');
        const dialog = await openProduct(page, 'Avietės');
        await dialog
            .locator('label')
            .filter({ hasText: new RegExp(`^${consumptionYear}$`) })
            .click();
        await expect(dialog.getByRole('radio', { name: String(consumptionYear), exact: true })).toBeChecked();
        await expect(dialog.locator('[data-product-stock-total]')).toBeEmpty();
        await expect(dialog.locator('[data-product-summary-total]')).toContainText('2');
        await dialog.getByRole('tab', { name: 'Suvartota' }).click();
        await expect(dialog.getByRole('table')).toContainText('Consumption without stock');

        await dialog
            .locator('label')
            .filter({ hasText: new RegExp(`^${currentYear}$`) })
            .click();
        await expect(dialog.getByRole('radio', { name: String(currentYear), exact: true })).toBeChecked();
        const consumedPanel = dialog.getByRole('tabpanel', { name: 'Suvartota' });
        await expect(consumedPanel.getByRole('table')).toBeAttached();
        await expect(consumedPanel.getByRole('table').getByRole('row')).toHaveCount(0);
        await expect(consumedPanel.locator('.ui-Loader-root')).toHaveCount(0);
        let release!: () => void;
        const pending = new Promise<void>((resolve) => {
            release = resolve;
        });
        let requests = 0;
        await page.route('**/*', async (route) => {
            if (route.request().headers()['next-action']) {
                requests++;
                await pending;
            }
            await route.continue();
        });
        try {
            await dialog
                .locator('label')
                .filter({ hasText: new RegExp(`^${consumptionYear}$`) })
                .click();
            await expect.poll(() => requests).toBeGreaterThan(0);
            // Cached history must render while every background request is still blocked.
            await expect(dialog.getByRole('table')).toContainText('Consumption without stock');
            await expect(dialog.getByRole('tabpanel', { name: 'Suvartota' }).locator('.ui-Loader-root')).toHaveCount(0);
        } finally {
            release();
        }
    });

    test('splits consumption history and totals at the September boundary', async ({ page, db }) => {
        const boundaryYear = currentYear - 1;
        const before = 'Before the September boundary';
        const after = 'At the September boundary';
        await db.collection<Product>('products').updateOne(
            { group: 'Uogienės', name: 'Avietės' },
            {
                $set: {
                    updates: [
                        { time: Date.UTC(2000 + boundaryYear, 7, 31, 23, 59, 59, 999), comment: before, amount: -2 },
                        { time: Date.UTC(2000 + boundaryYear, 8, 1), comment: after, amount: -5 },
                    ].map(({ time, comment, amount }) => ({
                        time,
                        comment,
                        years: [
                            { year: boundaryYear - 1, amounts: [{ variant: 'Stiklainis', amount, recycled: false }] },
                        ],
                    })),
                },
            }
        );

        await page.goto('/');
        const dialog = await openProduct(page, 'Avietės');
        await dialog.getByRole('tab', { name: 'Suvartota' }).click();
        const history = dialog.getByRole('tabpanel', { name: 'Suvartota' }).getByRole('table');
        const total = dialog.locator('[data-product-summary-total] [data-type="consumed"]');
        for (const period of [
            { year: boundaryYear - 1, included: before, excluded: after, total: '2' },
            { year: boundaryYear, included: after, excluded: before, total: '5' },
        ]) {
            await dialog
                .locator('label')
                .filter({ hasText: new RegExp(`^${period.year}$`) })
                .click();
            await expect(dialog.getByRole('radio', { name: String(period.year), exact: true })).toBeChecked();
            await expect(history).toContainText(period.included);
            await expect(history).not.toContainText(period.excluded);
            await expect(total).toContainText(period.total);
        }
    });

    test('switches annual content and persists the removal marker', async ({ page, db }) => {
        await page.goto('/');
        const amount = await openProduct(page, 'Avietės');
        await test.step('switches between years', async () => {
            await amount
                .locator('label')
                .filter({ hasText: String(currentYear) })
                .click();
            await expect(amount.locator('[data-amount-variant-key="Stiklainis"]')).toContainText('3');
            await amount
                .locator('label')
                .filter({ hasText: String(currentYear - 1) })
                .click();
            await expect(amount.locator('[data-amount-variant-key="Stiklainis"]')).toContainText('2');
        });

        await test.step('annual years remain separate and removal marker persists', async () => {
            await expect(amount.getByRole('radio', { name: String(currentYear - 1) })).toBeChecked();
            await amount
                .locator('label')
                .filter({ hasText: String(currentYear) })
                .click();
            await expect(amount.locator('[data-amount-variant-key="Stiklainis"]')).toContainText('3');
            await amount.getByRole('button', { name: 'Šie metai naikinami?' }).click();
            await expect(productTile(page, 'Avietės')).toHaveAttribute('data-removing', 'true');
            await expect
                .poll(async () => {
                    const item = await db.collection<Product>('products').findOne({ name: 'Avietės' });
                    return item?.years?.find(({ year }) => year === currentYear)?.removing;
                })
                .toBe(true);
            await page.reload();
            const product = await db.collection<Product>('products').findOne({ name: 'Avietės' });
            expect(product?.years?.find(({ year }) => year === currentYear)?.removing).toBe(true);
            expect(product?.years?.find(({ year }) => year === currentYear - 1)?.amounts?.[0]?.amount).toBe(2);
        });
    });
});
