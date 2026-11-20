import { renderFixtureApp } from '@tests/browser/app';
import { element, layoutCleanup } from '@tests/browser/layout';
import { currentYear } from '@tests/fixtures/data';
import { describe, expect, test, vi } from 'vitest';

import { page } from 'vitest/browser';

import type { Variant } from '~/schema';
import { getProductsAction, setAmountsAction } from '~/server/actions/products';

vi.mock(import('~/server/actions/products'), { spy: true });

async function openAmounts() {
    await page.getByText('Avietės', { exact: true }).click();
    const dialog = page.getByRole('dialog', { name: /Avietės Uogienės/ });
    await expect.element(dialog).toBeVisible();
    return dialog;
}

async function renderTotals(withSuffixes: boolean) {
    await renderFixtureApp('/', 'consumed-recycled', (data) => {
        const jar = 'Stiklainis';
        const smallJar = 'Didelis indelis';
        const extra = 'Papildomi';
        return {
            ...data,
            variants: [
                ...data.variants!.map((variant): Variant => {
                    if (variant.variant === jar) {
                        return { ...variant, count: 0.5, units: 'l' };
                    }
                    if (variant.variant === smallJar) {
                        return { ...variant, count: 0.25, units: 'l', suffix: 'm' };
                    }
                    return variant;
                }),
                { group: 'Uogienės', variant: extra, order: 2, suffix: 'e' },
            ],
            products: data.products!.map((product) =>
                product.name === 'Avietės' && withSuffixes
                    ? {
                          ...product,
                          years: [
                              {
                                  year: currentYear,
                                  amounts: [
                                      { variant: jar, amount: 2 },
                                      { variant: extra, amount: 4 },
                                  ],
                              },
                          ],
                      }
                    : product
            ),
            summary: [
                {
                    group: 'Uogienės',
                    name: 'Avietės',
                    years: [
                        {
                            year: currentYear,
                            amounts: [
                                { variant: jar, amount: withSuffixes ? 5 : 1, recycled: false },
                                { variant: jar, amount: withSuffixes ? 3 : 1, recycled: true },
                                ...(withSuffixes
                                    ? [
                                          { variant: smallJar, amount: 1, recycled: false },
                                          { variant: smallJar, amount: 1, recycled: true },
                                      ]
                                    : []),
                            ],
                        },
                    ],
                },
            ],
        };
    });
}

describe('amount dialog layout', { tags: ['component'] }, () => {
    layoutCleanup();

    test('keeps dialog and content widths stable while saving and clears the draft on reopen', async () => {
        const save = Promise.withResolvers<void>();
        vi.mocked(setAmountsAction).mockReturnValueOnce(save.promise);
        await renderFixtureApp('/', 'basic', (data) => {
            vi.mocked(getProductsAction).mockResolvedValueOnce({
                products: [...data.products!],
                summary: [...data.summary!],
                years: [...data.years!],
                groups: data.groups!,
                variants: data.variants!,
            });
            return data;
        });
        const dialog = await openAmounts();
        await dialog.getByRole('button', { name: /^Stiklainis\b/ }).click();
        await dialog.getByRole('textbox', { name: 'updated' }).fill('2');
        const widths = () => [
            dialog.element().clientWidth,
            element('.amount-box-content', dialog.element()).clientWidth,
        ];
        const before = widths();

        try {
            await dialog.getByRole('button', { name: 'Naujinti' }).click();
            await expect.element(dialog.getByRole('button', { name: 'Uždaryti' })).toBeDisabled();
            expect(setAmountsAction).toHaveBeenCalledTimes(1);
            expect(widths()).toStrictEqual(before);
        } finally {
            save.resolve();
        }

        await expect.element(dialog).not.toBeInTheDocument();
        const reopened = await openAmounts();
        await expect.element(reopened.getByRole('button', { name: 'Uždaryti' })).toBeEnabled();
        await expect.element(reopened.getByRole('button', { name: 'Naujinti' })).not.toBeInTheDocument();
    });

    test('keeps variant suffixes smaller than physical units in stock and summary totals', async () => {
        await renderTotals(true);
        const dialog = await openAmounts();
        const stock = element('[data-product-stock-total]', dialog.element());
        const summary = element('[data-product-summary-total]', dialog.element());
        const suffix = Array.from(stock.querySelectorAll('sub')).find((sub) => sub.textContent === 'e')!;
        const sourceSuffixes = () => Array.from(summary.querySelectorAll('[data-sources] sub'));
        await expect.poll(() => sourceSuffixes().length).toBe(2);
        const suffixSize = getComputedStyle(suffix).fontSize;
        const units = Array.from(summary.querySelectorAll('[data-total] > sub'));
        expect(units).toHaveLength(2);
        for (const source of sourceSuffixes()) {
            expect(getComputedStyle(source).fontSize).toBe(suffixSize);
        }
        for (const unit of units) {
            expect(unit.textContent).toBe('l');
            expect(parseFloat(getComputedStyle(unit).fontSize)).toBeGreaterThan(parseFloat(suffixSize));
        }
    });

    test('aligns stock and summary totals vertically and keeps units on the same baseline', async () => {
        await renderTotals(false);
        const dialog = await openAmounts();
        await expect
            .poll(() => !!dialog.element().querySelector('[data-product-summary-total] [data-type="recycled"]'))
            .toBe(true);

        const measure = (selector: string) => {
            const block = element(selector, dialog.element());
            const value = element('[data-value][data-total="volume"]', block);
            const unit = element('sub', value);
            const number = element('[data-number]', value);
            const rect = block.getBoundingClientRect();
            return {
                center: rect.top + rect.height / 2,
                alignment: getComputedStyle(value).alignItems,
                unitSize: getComputedStyle(unit).fontSize,
                unitOffset: unit.getBoundingClientRect().bottom - number.getBoundingClientRect().bottom,
            };
        };
        const stock = measure('[data-product-stock-total]');
        const summary = measure('[data-product-summary-total]');
        expect(Math.abs(stock.center - summary.center)).toBeLessThan(1);
        expect(stock.alignment).toBe('baseline');
        expect(summary.alignment).toBe('baseline');
        expect(stock.unitSize).toBe(summary.unitSize);
        expect(Math.abs(stock.unitOffset - summary.unitOffset)).toBeLessThan(1);
    });

    test('centers stock and hides consumption and year controls for non-annual products', async () => {
        await renderFixtureApp('/', 'consumed-recycled', (data) => ({
            ...data,
            groups: data.groups!.map((group) => (group.group === 'Uogienės' ? { ...group, annual: false } : group)),
        }));
        const dialog = await openAmounts();

        await expect.element(dialog.getByRole('radio')).not.toBeInTheDocument();
        await expect.element(dialog.getByRole('tab', { name: 'Suvartota' })).not.toBeInTheDocument();
        await expect.element(dialog.getByRole('tab', { name: 'Istorija' })).toBeVisible();
        expect(dialog.element().querySelector('[data-product-summary-total]')).toBeNull();

        const total = element('[data-product-stock-total] [data-number]', dialog.element());
        const totals = element('[data-product-year-totals]', dialog.element());
        const centerX = (node: Element) => {
            const { left, width } = node.getBoundingClientRect();
            return left + width / 2;
        };
        expect(total).toHaveTextContent('3');
        expect(Math.abs(centerX(total) - centerX(totals))).toBeLessThan(1);
    });
});
