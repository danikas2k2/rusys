import type { Variant, YearAmounts } from '~/common/data';
import {
    addTypedVariantAmount,
    addVariantAmount,
    combineProductYears,
    formatVolume,
    formatWeight,
    getAmountTotals,
    getChangedAmount,
    getCombinedAmounts,
    getVariantAmount,
    mergeAmountsIgnoringExpiry,
} from '~/common/utils/amounts';

vi.mock(import('~/store/groups/useGetGroups'));
vi.mock(import('~/store/variants/useGetVariants'));
vi.mock(import('~/store/products/useGetProducts'));

describe('amounts', () => {
    beforeEach(() => {});

    afterEach(() => vi.clearAllMocks());

    describe('getVariantAmount', () => {
        it('returns 0 for undefined amounts', () => {
            expect(getVariantAmount(undefined, 'p')).toBe(0);
        });

        it('returns 0 if variant is not found', () => {
            expect(getVariantAmount([{ variant: 'p', amount: 1 }], 'd')).toBe(0);
        });

        it('returns the amount if found (no flags)', () => {
            expect(getVariantAmount([{ variant: 'p', amount: 1 }], 'p')).toBe(1);
        });

        it('sums multiple plain entries for the same variant', () => {
            expect(
                getVariantAmount(
                    [
                        { variant: 'p', amount: 3 },
                        { variant: 'p', amount: 2 },
                    ],
                    'p'
                )
            ).toBe(5);
        });

        it('treats suspicious=undefined the same as suspicious=false', () => {
            expect(getVariantAmount([{ variant: 'p', amount: 5 }], 'p', undefined)).toBe(5);
            expect(getVariantAmount([{ variant: 'p', amount: 5 }], 'p', false)).toBe(5);
        });

        it('treats home=undefined the same as home=false', () => {
            expect(getVariantAmount([{ variant: 'p', amount: 7 }], 'p', undefined, undefined)).toBe(7);
            expect(getVariantAmount([{ variant: 'p', amount: 7 }], 'p', undefined, false)).toBe(7);
        });

        it('returns 0 when only suspicious entry exists but plain is requested', () => {
            expect(getVariantAmount([{ variant: 'p', amount: 4, suspicious: true }], 'p')).toBe(0);
        });

        it('returns 0 when only home entry exists but plain is requested', () => {
            expect(getVariantAmount([{ variant: 'p', amount: 4, home: true }], 'p')).toBe(0);
        });

        it('returns suspicious amount when suspicious=true is requested', () => {
            expect(
                getVariantAmount(
                    [
                        { variant: 'p', amount: 3 },
                        { variant: 'p', amount: 10, suspicious: true },
                    ],
                    'p',
                    true
                )
            ).toBe(10);
        });

        it('returns home amount when home=true is requested', () => {
            expect(
                getVariantAmount(
                    [
                        { variant: 'p', amount: 3 },
                        { variant: 'p', amount: 8, home: true },
                    ],
                    'p',
                    undefined,
                    true
                )
            ).toBe(8);
        });

        it('does not sum suspicious and non-suspicious as the same variant', () => {
            const amounts = [
                { variant: 'p', amount: 5 },
                { variant: 'p', amount: 10, suspicious: true },
            ];

            expect(getVariantAmount(amounts, 'p')).toBe(5);
            expect(getVariantAmount(amounts, 'p', true)).toBe(10);
        });

        it('does not sum home and non-home as the same variant', () => {
            const amounts = [
                { variant: 'p', amount: 5 },
                { variant: 'p', amount: 6, home: true },
            ];

            expect(getVariantAmount(amounts, 'p')).toBe(5);
            expect(getVariantAmount(amounts, 'p', undefined, true)).toBe(6);
        });

        it('treats all four (plain, suspicious, home, suspicious+home) combinations as independent', () => {
            const amounts = [
                { variant: 'p', amount: 1 },
                { variant: 'p', amount: 2, suspicious: true },
                { variant: 'p', amount: 3, home: true },
                { variant: 'p', amount: 4, suspicious: true, home: true },
            ];

            expect(getVariantAmount(amounts, 'p')).toBe(1);
            expect(getVariantAmount(amounts, 'p', true)).toBe(2);
            expect(getVariantAmount(amounts, 'p', undefined, true)).toBe(3);
            expect(getVariantAmount(amounts, 'p', true, true)).toBe(4);
        });

        it('sums multiple entries with the same (variant, suspicious, home) composite key', () => {
            const amounts = [
                { variant: 'p', amount: 2, suspicious: true },
                { variant: 'p', amount: 3, suspicious: true },
            ];

            expect(getVariantAmount(amounts, 'p', true)).toBe(5);
        });

        it('returns 0 for an empty array', () => {
            expect(getVariantAmount([], 'p')).toBe(0);
        });

        it('does not sum different expiresAt dates as the same variant', () => {
            const amounts = [
                { variant: 'p', amount: 5, expiresAt: 100 },
                { variant: 'p', amount: 6, expiresAt: 200 },
            ];

            expect(getVariantAmount(amounts, 'p', undefined, undefined, 100)).toBe(5);
            expect(getVariantAmount(amounts, 'p', undefined, undefined, 200)).toBe(6);
        });

        it('treats a dated entry as distinct from a plain (undated) entry', () => {
            const amounts = [
                { variant: 'p', amount: 3 },
                { variant: 'p', amount: 4, expiresAt: 100 },
            ];

            expect(getVariantAmount(amounts, 'p')).toBe(3);
            expect(getVariantAmount(amounts, 'p', undefined, undefined, 100)).toBe(4);
        });

        it('sums multiple entries with the same expiresAt date', () => {
            const amounts = [
                { variant: 'p', amount: 2, expiresAt: 100 },
                { variant: 'p', amount: 3, expiresAt: 100 },
            ];

            expect(getVariantAmount(amounts, 'p', undefined, undefined, 100)).toBe(5);
        });
    });

    describe('getChangedAmount', () => {
        it('returns false if no amounts', () => {
            expect(getChangedAmount([])).toBe(false);
        });

        it('returns false for undefined amounts', () => {
            expect(getChangedAmount(undefined)).toBe(false);
        });

        it('returns the sum of all amounts', () => {
            expect(
                getChangedAmount([
                    { variant: 'p', amount: 1 },
                    { variant: 'd', amount: 2 },
                ])
            ).toBe(3);
        });

        it('returns true if sum of all amounts is zero but there are non-zero entries', () => {
            expect(
                getChangedAmount([
                    { variant: 'p', amount: 1 },
                    { variant: 'd', amount: -1 },
                ])
            ).toBe(true);
        });

        it('returns a positive number for all-positive amounts', () => {
            expect(getChangedAmount([{ variant: 'p', amount: 5 }])).toBe(5);
        });

        it('returns a negative number for net negative amounts', () => {
            expect(
                getChangedAmount([
                    { variant: 'p', amount: 1 },
                    { variant: 'd', amount: -4 },
                ])
            ).toBe(-3);
        });

        it('returns true when all amounts are zero individually', () => {
            expect(getChangedAmount([{ variant: 'p', amount: 0 }])).toBe(false);
        });

        it('sums suspicious and home entries together with plain entries', () => {
            expect(
                getChangedAmount([
                    { variant: 'p', amount: 2 },
                    { variant: 'p', amount: 3, suspicious: true },
                    { variant: 'p', amount: 1, home: true },
                ])
            ).toBe(6);
        });
    });

    describe('addVariantAmount', () => {
        it('adds a new plain entry to an empty accumulator', () => {
            expect(addVariantAmount([], { variant: 'p', amount: 5 })).toStrictEqual([{ variant: 'p', amount: 5 }]);
        });

        it('adds a new suspicious entry and does not merge with a plain entry', () => {
            const acc = [{ variant: 'p', amount: 5 }];
            const result = addVariantAmount(acc, { variant: 'p', amount: 3, suspicious: true });

            expect(result).toHaveLength(2);
            expect(result).toContainEqual({ variant: 'p', amount: 5 });
            expect(result).toContainEqual({ variant: 'p', amount: 3, suspicious: true });
        });

        it('adds a new home entry and does not merge with plain or suspicious entries', () => {
            const acc = [
                { variant: 'p', amount: 5 },
                { variant: 'p', amount: 3, suspicious: true },
            ];
            const result = addVariantAmount(acc, { variant: 'p', amount: 2, home: true });

            expect(result).toHaveLength(3);
            expect(result).toContainEqual({ variant: 'p', amount: 5 });
            expect(result).toContainEqual({ variant: 'p', amount: 3, suspicious: true });
            expect(result).toContainEqual({ variant: 'p', amount: 2, home: true });
        });

        it('adds all four independent variants of the same variant string', () => {
            let acc: readonly ReturnType<typeof addVariantAmount>[number][] = [];
            acc = addVariantAmount(acc, { variant: 'p', amount: 1 });
            acc = addVariantAmount(acc, { variant: 'p', amount: 2, suspicious: true });
            acc = addVariantAmount(acc, { variant: 'p', amount: 3, home: true });
            acc = addVariantAmount(acc, { variant: 'p', amount: 4, suspicious: true, home: true });

            expect(acc).toHaveLength(4);
            expect(acc).toContainEqual({ variant: 'p', amount: 1 });
            expect(acc).toContainEqual({ variant: 'p', amount: 2, suspicious: true });
            expect(acc).toContainEqual({ variant: 'p', amount: 3, home: true });
            expect(acc).toContainEqual({ variant: 'p', amount: 4, suspicious: true, home: true });
        });

        it('merges amounts for matching plain + plain composite key', () => {
            const acc = [{ variant: 'p', amount: 5 }];

            expect(addVariantAmount(acc, { variant: 'p', amount: 3 })).toStrictEqual([{ variant: 'p', amount: 8 }]);
        });

        it('merges amounts for matching suspicious + suspicious composite key', () => {
            const acc = [{ variant: 'p', amount: 5, suspicious: true }];

            expect(addVariantAmount(acc, { variant: 'p', amount: 3, suspicious: true })).toStrictEqual([
                { variant: 'p', amount: 8, suspicious: true },
            ]);
        });

        it('merges amounts for matching home + home composite key', () => {
            const acc = [{ variant: 'p', amount: 5, home: true }];

            expect(addVariantAmount(acc, { variant: 'p', amount: 3, home: true })).toStrictEqual([
                { variant: 'p', amount: 8, home: true },
            ]);
        });

        it('merges amounts for matching suspicious+home composite key', () => {
            const acc = [{ variant: 'p', amount: 5, suspicious: true, home: true }];

            expect(addVariantAmount(acc, { variant: 'p', amount: 3, suspicious: true, home: true })).toStrictEqual([
                { variant: 'p', amount: 8, suspicious: true, home: true },
            ]);
        });

        it('does not store suspicious:false on new plain entry', () => {
            const result = addVariantAmount([], { variant: 'p', amount: 1, suspicious: false });

            expect(result[0]).not.toHaveProperty('suspicious');
        });

        it('does not store home:false on new plain entry', () => {
            const result = addVariantAmount([], { variant: 'p', amount: 1, home: false });

            expect(result[0]).not.toHaveProperty('home');
        });

        it('stores suspicious:true on a suspicious entry', () => {
            const result = addVariantAmount([], { variant: 'p', amount: 1, suspicious: true });

            expect(result[0]).toHaveProperty('suspicious', true);
        });

        it('stores home:true on a home entry', () => {
            const result = addVariantAmount([], { variant: 'p', amount: 1, home: true });

            expect(result[0]).toHaveProperty('home', true);
        });

        it('handles negative amounts (consumed/recycled)', () => {
            const acc = [{ variant: 'p', amount: 10 }];

            expect(addVariantAmount(acc, { variant: 'p', amount: -4 })).toStrictEqual([{ variant: 'p', amount: 6 }]);
        });

        it('handles negative amounts on a suspicious entry', () => {
            const acc = [{ variant: 'p', amount: 10, suspicious: true }];

            expect(addVariantAmount(acc, { variant: 'p', amount: -4, suspicious: true })).toStrictEqual([
                { variant: 'p', amount: 6, suspicious: true },
            ]);
        });

        it('does not merge entries for different variants', () => {
            const acc = [{ variant: 'p', amount: 5 }];
            const result = addVariantAmount(acc, { variant: 'd', amount: 3 });

            expect(result).toHaveLength(2);
            expect(result).toContainEqual({ variant: 'p', amount: 5 });
            expect(result).toContainEqual({ variant: 'd', amount: 3 });
        });

        it('adds a new dated entry and does not merge with a plain entry', () => {
            const acc = [{ variant: 'p', amount: 5 }];
            const result = addVariantAmount(acc, { variant: 'p', amount: 3, expiresAt: 100 });

            expect(result).toHaveLength(2);
            expect(result).toContainEqual({ variant: 'p', amount: 5 });
            expect(result).toContainEqual({ variant: 'p', amount: 3, expiresAt: 100 });
        });

        it('does not merge two entries with different expiresAt dates', () => {
            const acc = [{ variant: 'p', amount: 5, expiresAt: 100 }];
            const result = addVariantAmount(acc, { variant: 'p', amount: 3, expiresAt: 200 });

            expect(result).toHaveLength(2);
            expect(result).toContainEqual({ variant: 'p', amount: 5, expiresAt: 100 });
            expect(result).toContainEqual({ variant: 'p', amount: 3, expiresAt: 200 });
        });

        it('merges amounts for matching expiresAt composite key', () => {
            const acc = [{ variant: 'p', amount: 5, expiresAt: 100 }];

            expect(addVariantAmount(acc, { variant: 'p', amount: 3, expiresAt: 100 })).toStrictEqual([
                { variant: 'p', amount: 8, expiresAt: 100 },
            ]);
        });

        it('does not store expiresAt:0 on a new entry (falsy)', () => {
            const result = addVariantAmount([], { variant: 'p', amount: 1, expiresAt: 0 });

            expect(result[0]).not.toHaveProperty('expiresAt');
        });
    });

    describe('mergeAmountsIgnoringExpiry', () => {
        it('returns an empty array for an empty input', () => {
            expect(mergeAmountsIgnoringExpiry([])).toStrictEqual([]);
        });

        it('sums differently-dated entries of the same variant into one, dropping expiresAt', () => {
            const result = mergeAmountsIgnoringExpiry([
                { variant: 'p', amount: 6 },
                { variant: 'p', amount: 1, expiresAt: 100 },
                { variant: 'p', amount: 2, expiresAt: 200 },
            ]);

            expect(result).toStrictEqual([{ variant: 'p', amount: 9 }]);
        });

        it('keeps different variants separate', () => {
            const result = mergeAmountsIgnoringExpiry([
                { variant: 'p', amount: 6 },
                { variant: 'd', amount: 1, expiresAt: 100 },
            ]);

            expect(result).toHaveLength(2);
            expect(result).toContainEqual({ variant: 'p', amount: 6 });
            expect(result).toContainEqual({ variant: 'd', amount: 1 });
        });

        it('keeps suspicious and home entries separate from plain entries of the same variant', () => {
            const result = mergeAmountsIgnoringExpiry([
                { variant: 'p', amount: 1 },
                { variant: 'p', amount: 2, suspicious: true },
                { variant: 'p', amount: 3, home: true },
            ]);

            expect(result).toHaveLength(3);
            expect(result).toContainEqual({ variant: 'p', amount: 1 });
            expect(result).toContainEqual({ variant: 'p', amount: 2, suspicious: true });
            expect(result).toContainEqual({ variant: 'p', amount: 3, home: true });
        });

        it('merges two dated suspicious entries of the same variant into one suspicious total', () => {
            const result = mergeAmountsIgnoringExpiry([
                { variant: 'p', amount: 2, suspicious: true, expiresAt: 100 },
                { variant: 'p', amount: 3, suspicious: true, expiresAt: 200 },
            ]);

            expect(result).toStrictEqual([{ variant: 'p', amount: 5, suspicious: true }]);
        });
    });

    describe('addTypedVariantAmount', () => {
        it('keeps consumed and recycled totals separate for the same variant', () => {
            let acc: readonly ReturnType<typeof addTypedVariantAmount>[number][] = [];
            acc = addTypedVariantAmount(acc, { variant: 'p', amount: -2, recycled: false });
            acc = addTypedVariantAmount(acc, { variant: 'p', amount: -3, recycled: true });

            expect(acc).toHaveLength(2);
            expect(acc).toContainEqual({ variant: 'p', amount: -2, recycled: false });
            expect(acc).toContainEqual({ variant: 'p', amount: -3, recycled: true });
        });

        it('keeps an "updated" (no recycled field) entry separate from consumed/recycled', () => {
            let acc: readonly ReturnType<typeof addTypedVariantAmount>[number][] = [];
            acc = addTypedVariantAmount(acc, { variant: 'p', amount: 5 });
            acc = addTypedVariantAmount(acc, { variant: 'p', amount: -2, recycled: false });

            expect(acc).toHaveLength(2);
            expect(acc).toContainEqual({ variant: 'p', amount: 5 });
            expect(acc).toContainEqual({ variant: 'p', amount: -2, recycled: false });
        });

        it('merges amounts with the same (variant, recycled) composite key', () => {
            const acc = [{ variant: 'p', amount: -2, recycled: false }];

            expect(addTypedVariantAmount(acc, { variant: 'p', amount: -3, recycled: false })).toStrictEqual([
                { variant: 'p', amount: -5, recycled: false },
            ]);
        });

        it('still respects suspicious/home as independent dimensions', () => {
            let acc: readonly ReturnType<typeof addTypedVariantAmount>[number][] = [];
            acc = addTypedVariantAmount(acc, { variant: 'p', amount: -2, recycled: false });
            acc = addTypedVariantAmount(acc, { variant: 'p', amount: -1, recycled: false, home: true });

            expect(acc).toHaveLength(2);
            expect(acc).toContainEqual({ variant: 'p', amount: -2, recycled: false });
            expect(acc).toContainEqual({ variant: 'p', amount: -1, recycled: false, home: true });
        });

        it('keeps a suspicious entry separate from a non-suspicious one for the same variant', () => {
            let acc: readonly ReturnType<typeof addTypedVariantAmount>[number][] = [];
            acc = addTypedVariantAmount(acc, { variant: 'p', amount: -2, recycled: false });
            acc = addTypedVariantAmount(acc, { variant: 'p', amount: -1, recycled: false, suspicious: true });

            expect(acc).toHaveLength(2);
            expect(acc).toContainEqual({ variant: 'p', amount: -2, recycled: false });
            expect(acc).toContainEqual({ variant: 'p', amount: -1, recycled: false, suspicious: true });
        });

        it('keeps differently-dated consumed lines for the same variant separate', () => {
            let acc: readonly ReturnType<typeof addTypedVariantAmount>[number][] = [];
            acc = addTypedVariantAmount(acc, { variant: 'p', amount: -2, recycled: false, expiresAt: 100 });
            acc = addTypedVariantAmount(acc, { variant: 'p', amount: -3, recycled: false, expiresAt: 200 });

            expect(acc).toHaveLength(2);
            expect(acc).toContainEqual({ variant: 'p', amount: -2, recycled: false, expiresAt: 100 });
            expect(acc).toContainEqual({ variant: 'p', amount: -3, recycled: false, expiresAt: 200 });
        });

        it('merges consumed lines with the same (variant, recycled, expiresAt) composite key', () => {
            const acc = [{ variant: 'p', amount: -2, recycled: false, expiresAt: 100 }];

            expect(
                addTypedVariantAmount(acc, { variant: 'p', amount: -3, recycled: false, expiresAt: 100 })
            ).toStrictEqual([{ variant: 'p', amount: -5, recycled: false, expiresAt: 100 }]);
        });
    });

    describe('combineProductYears', () => {
        it('returns an empty array for no products', () => {
            expect(combineProductYears([])).toStrictEqual([]);
        });

        it('returns a single product unchanged (as YearAmounts)', () => {
            const result = combineProductYears([[{ year: 2020, amounts: [{ variant: 'p', amount: 3 }] }]]);

            expect(result).toStrictEqual([{ year: 2020, amounts: [{ variant: 'p', amount: 3 }] }]);
        });

        it('sums amounts for matching years across multiple products', () => {
            const result = combineProductYears([
                [{ year: 2020, amounts: [{ variant: 'p', amount: 3 }] }],
                [{ year: 2020, amounts: [{ variant: 'p', amount: 2 }] }],
            ]);

            expect(result).toStrictEqual([{ year: 2020, amounts: [{ variant: 'p', amount: 5 }] }]);
        });

        it('keeps non-overlapping years from different products, sorted ascending', () => {
            const result = combineProductYears([
                [{ year: 2021, amounts: [{ variant: 'p', amount: 2 }] }],
                [{ year: 2020, amounts: [{ variant: 'd', amount: 1 }] }],
            ]);

            expect(result).toStrictEqual([
                { year: 2020, amounts: [{ variant: 'd', amount: 1 }] },
                { year: 2021, amounts: [{ variant: 'p', amount: 2 }] },
            ]);
        });

        it('ignores undefined years entries (products with no years yet)', () => {
            const result = combineProductYears([undefined, [{ year: 2020, amounts: [{ variant: 'p', amount: 4 }] }]]);

            expect(result).toStrictEqual([{ year: 2020, amounts: [{ variant: 'p', amount: 4 }] }]);
        });

        it('treats a year entry with a missing amounts field (malformed/legacy document) as empty', () => {
            const result = combineProductYears([
                [{ year: 2020, amounts: undefined } as unknown as YearAmounts],
                [{ year: 2020, amounts: [{ variant: 'p', amount: 4 }] }],
            ]);

            expect(result).toStrictEqual([{ year: 2020, amounts: [{ variant: 'p', amount: 4 }] }]);
        });
    });

    describe('getCombinedAmounts', () => {
        it('returns undefined for undefined input', () => {
            expect(getCombinedAmounts(undefined)).toBeUndefined();
        });

        it('returns an empty array for an empty years array', () => {
            expect(getCombinedAmounts([])).toStrictEqual([]);
        });

        it('treats a year entry with a missing amounts field (malformed/legacy document) as empty', () => {
            const result = getCombinedAmounts([
                { year: 2020, amounts: undefined } as unknown as YearAmounts,
                { year: 2021, amounts: [{ variant: 'p', amount: 4 }] },
            ]);

            expect(result).toStrictEqual([{ variant: 'p', amount: 4 }]);
        });

        it('combines amounts from a single year', () => {
            expect(
                getCombinedAmounts([
                    {
                        year: 2020,
                        amounts: [
                            { variant: 'p', amount: 3 },
                            { variant: 'd', amount: 2 },
                        ],
                    },
                ])
            ).toStrictEqual([
                { variant: 'p', amount: 3 },
                { variant: 'd', amount: 2 },
            ]);
        });

        it('sums same variant across multiple years', () => {
            const result = getCombinedAmounts([
                { year: 2020, amounts: [{ variant: 'p', amount: 3 }] },
                { year: 2021, amounts: [{ variant: 'p', amount: 2 }] },
            ]);

            expect(result).toStrictEqual([{ variant: 'p', amount: 5 }]);
        });

        it('keeps plain and suspicious entries separate across years', () => {
            const result = getCombinedAmounts([
                { year: 2020, amounts: [{ variant: 'p', amount: 3 }] },
                { year: 2021, amounts: [{ variant: 'p', amount: 2, suspicious: true }] },
            ]);

            expect(result).toHaveLength(2);
            expect(result).toContainEqual({ variant: 'p', amount: 3 });
            expect(result).toContainEqual({ variant: 'p', amount: 2, suspicious: true });
        });

        it('keeps plain and home entries separate across years', () => {
            const result = getCombinedAmounts([
                { year: 2020, amounts: [{ variant: 'p', amount: 4 }] },
                { year: 2021, amounts: [{ variant: 'p', amount: 1, home: true }] },
            ]);

            expect(result).toHaveLength(2);
            expect(result).toContainEqual({ variant: 'p', amount: 4 });
            expect(result).toContainEqual({ variant: 'p', amount: 1, home: true });
        });

        it('respects all four suspicious+home dimensions across years', () => {
            const result = getCombinedAmounts([
                {
                    year: 2020,
                    amounts: [
                        { variant: 'p', amount: 1 },
                        { variant: 'p', amount: 2, suspicious: true },
                    ],
                },
                {
                    year: 2021,
                    amounts: [
                        { variant: 'p', amount: 3, home: true },
                        { variant: 'p', amount: 4, suspicious: true, home: true },
                    ],
                },
                {
                    year: 2022,
                    amounts: [
                        { variant: 'p', amount: 10 },
                        { variant: 'p', amount: 20, suspicious: true },
                        { variant: 'p', amount: 30, home: true },
                        { variant: 'p', amount: 40, suspicious: true, home: true },
                    ],
                },
            ]);

            expect(result).toHaveLength(4);
            expect(result).toContainEqual({ variant: 'p', amount: 11 });
            expect(result).toContainEqual({ variant: 'p', amount: 22, suspicious: true });
            expect(result).toContainEqual({ variant: 'p', amount: 33, home: true });
            expect(result).toContainEqual({ variant: 'p', amount: 44, suspicious: true, home: true });
        });

        it('combines multiple variants across multiple years', () => {
            const result = getCombinedAmounts([
                {
                    year: 2020,
                    amounts: [
                        { variant: 'p', amount: 5 },
                        { variant: 'd', amount: 3 },
                    ],
                },
                {
                    year: 2021,
                    amounts: [
                        { variant: 'p', amount: 2 },
                        { variant: 'd', amount: 1 },
                    ],
                },
            ]);

            expect(result).toHaveLength(2);
            expect(result).toContainEqual({ variant: 'p', amount: 7 });
            expect(result).toContainEqual({ variant: 'd', amount: 4 });
        });
    });

    describe('getAmountTotals', () => {
        const variant = (name: string, units?: Variant['units'], count?: number): Variant => ({
            group: 'g',
            variant: name,
            order: 0,
            ...(units ? { units } : {}),
            ...(count != null ? { count } : {}),
        });

        it('returns empty totals for undefined amounts', () => {
            expect(getAmountTotals(undefined, [])).toStrictEqual({ unitless: [] });
        });

        it('converts the example from the request: 5x500ml + 6x750ml + 1x250ml = 7250ml', () => {
            const variants = [variant('a', 'ml', 500), variant('b', 'ml', 750), variant('c', 'ml', 250)];
            const amounts = [
                { variant: 'a', amount: 5 },
                { variant: 'b', amount: 6 },
                { variant: 'c', amount: 1 },
            ];

            expect(getAmountTotals(amounts, variants).volume).toBe(7250);
        });

        it('sums l and ml variants together into a single ml-based volume total', () => {
            const variants = [variant('a', 'l', 1), variant('b', 'ml', 500)];
            const amounts = [
                { variant: 'a', amount: 2 },
                { variant: 'b', amount: 3 },
            ];

            expect(getAmountTotals(amounts, variants).volume).toBe(3500);
        });

        it('sums kg and g variants together into a single g-based weight total', () => {
            const variants = [variant('a', 'kg', 1), variant('b', 'g', 500)];
            const amounts = [
                { variant: 'a', amount: 2 },
                { variant: 'b', amount: 3 },
            ];

            expect(getAmountTotals(amounts, variants).weight).toBe(3500);
        });

        it("sums 'vnt' units variants into the count total using the variant count multiplier", () => {
            const variants = [variant('a', 'vnt', 6)];
            const amounts = [{ variant: 'a', amount: 2 }];

            expect(getAmountTotals(amounts, variants).count).toBe(12);
        });

        it('defaults the count multiplier to 1 when the variant has no count', () => {
            const variants = [variant('a', 'l')];
            const amounts = [{ variant: 'a', amount: 3 }];

            expect(getAmountTotals(amounts, variants).volume).toBe(3000);
        });

        it('puts amounts for variants without units into unitless, unchanged', () => {
            const variants = [variant('a')];
            const amounts = [{ variant: 'a', amount: 4 }];

            const totals = getAmountTotals(amounts, variants);

            expect(totals.volume).toBeUndefined();
            expect(totals.weight).toBeUndefined();
            expect(totals.count).toBeUndefined();
            expect(totals.unitless).toStrictEqual([{ variant: 'a', amount: 4 }]);
        });

        it('treats an amount for an unknown variant as unitless', () => {
            const amounts = [{ variant: 'missing', amount: 4 }];

            expect(getAmountTotals(amounts, [])).toStrictEqual({ unitless: [{ variant: 'missing', amount: 4 }] });
        });

        it('splits mixed-unit amounts into separate volume/weight/count/unitless buckets', () => {
            const variants = [variant('a', 'ml', 500), variant('b', 'g', 200), variant('c', 'vnt'), variant('d')];
            const amounts = [
                { variant: 'a', amount: 2 },
                { variant: 'b', amount: 3 },
                { variant: 'c', amount: 4 },
                { variant: 'd', amount: 5 },
            ];

            expect(getAmountTotals(amounts, variants)).toStrictEqual({
                volume: 1000,
                weight: 600,
                count: 4,
                unitless: [{ variant: 'd', amount: 5 }],
            });
        });
    });

    describe('formatVolume', () => {
        it('renders totals below the 100ml threshold in ml', () => {
            expect(formatVolume(99)).toStrictEqual({ value: '99', unit: 'ml' });
        });

        it('renders a whole number in l with no fraction symbol when exact', () => {
            expect(formatVolume(2000)).toStrictEqual({ value: '2', unit: 'l' });
        });

        it("appends '¼' for a quarter, matching the request example: 5x500ml+6x750ml+1x250ml=7250ml", () => {
            expect(formatVolume(7250)).toStrictEqual({ value: '7¼', unit: 'l' });
        });

        it("appends '½' for a half", () => {
            expect(formatVolume(4500)).toStrictEqual({ value: '4½', unit: 'l' });
        });

        it("appends '¾' for three quarters", () => {
            expect(formatVolume(1750)).toStrictEqual({ value: '1¾', unit: 'l' });
        });

        it('omits the leading 0 when the whole part is zero', () => {
            expect(formatVolume(150)).toStrictEqual({ value: '¼', unit: 'l' });
        });

        it('rounds to the nearest quarter', () => {
            expect(formatVolume(7100)).toStrictEqual({ value: '7', unit: 'l' });
            expect(formatVolume(7150)).toStrictEqual({ value: '7¼', unit: 'l' });
        });

        it("renders '<½' instead of a misleading 0 when a non-zero amount rounds down to 0", () => {
            expect(formatVolume(100)).toStrictEqual({ value: '<½', unit: 'l' });
        });
    });

    describe('formatWeight', () => {
        it('renders totals below the 100g threshold in g', () => {
            expect(formatWeight(99)).toStrictEqual({ value: '99', unit: 'g' });
        });

        it("appends '¼' for a quarter", () => {
            expect(formatWeight(1250)).toStrictEqual({ value: '1¼', unit: 'kg' });
        });

        it("appends '¾' for three quarters", () => {
            expect(formatWeight(1750)).toStrictEqual({ value: '1¾', unit: 'kg' });
        });

        it("renders '<½' instead of a misleading 0 when a non-zero amount rounds down to 0", () => {
            expect(formatWeight(100)).toStrictEqual({ value: '<½', unit: 'kg' });
        });
    });
});
