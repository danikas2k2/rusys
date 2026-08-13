/** @vitest-environment node */
import { getGroupsFixture, getProductsFixture, getVariantsFixture } from '@tests/fixtures';

import { getGroups } from '~/server/data/groups';
import { getFullSummary, getSummary, getSummaryUndates, getSummaryUpdates } from '~/server/data/summary';
import { getVariants } from '~/server/data/variants';
import { getYears } from '~/server/data/years';
import { db } from '~/server/db';

vi.mock(import('~/server/db'));
vi.mock(import('~/server/data/years'));
vi.mock(import('~/server/data/groups'));
vi.mock(import('~/server/data/variants'));

describe('updates', () => {
    beforeEach(async () => {
        const d = await db();
        await d.collection('products').insertMany(getProductsFixture());
        await d.collection('groups').insertMany(getGroupsFixture());
        await d.collection('variants').insertMany(getVariantsFixture());
    });

    afterEach(async () => {
        const d = await db();
        await d.collection('products').deleteMany({});
        await d.collection('groups').deleteMany({});
        await d.collection('variants').deleteMany({});
        vi.clearAllMocks();
    });

    describe('getSummary', () => {
        it('returns summary', async () => {
            await expect(getSummary()).resolves.toStrictEqual([
                {
                    group: 'Uogienės',
                    name: 'Avietės',
                    years: [
                        { year: 22, amounts: [{ variant: 'p', amount: 1, recycled: false }] },
                        { year: 21, amounts: [{ variant: 'p', amount: 3, recycled: false }] },
                    ],
                },
                {
                    group: 'Uogienės',
                    name: 'Braškės',
                    years: [
                        {
                            year: 22,
                            amounts: [
                                { variant: 'p', amount: 1, recycled: false },
                                { variant: 'm', amount: 3, recycled: true },
                            ],
                        },
                        {
                            year: 21,
                            amounts: [{ variant: 'p', amount: 1, recycled: true }],
                        },
                    ],
                },
                {
                    group: 'Daržovės',
                    name: 'Agurkai',
                    years: [{ year: 22, amounts: [{ variant: 'd', amount: 3, recycled: false }] }],
                },
            ]);
            expect(getYears).toHaveBeenCalledWith(undefined, 8);
        });

        it('counts a positive consumed correction dated on/after 2026-08-01 against the consumed total', async () => {
            const d = await db();
            await d.collection('products').insertOne({
                group: 'Daržovės',
                name: 'Konservai',
                updates: [
                    {
                        time: Date.parse('2025-09-10T12:00:00.000Z'),
                        years: [{ year: 22, amounts: [{ variant: 'd', amount: -10, recycled: false }] }],
                    },
                    {
                        // moveConsumedToRecycled's correction pair, dated on/after the cutoff
                        time: Date.parse('2026-08-05T12:00:00.000Z'),
                        years: [
                            {
                                year: 22,
                                amounts: [
                                    { variant: 'd', amount: 3, recycled: false },
                                    { variant: 'd', amount: -3, recycled: true },
                                ],
                            },
                        ],
                    },
                ],
            });

            const result = await getSummary();

            expect(result.find((s) => s.name === 'Konservai')?.years).toStrictEqual([
                {
                    year: 25,
                    amounts: [
                        { variant: 'd', amount: 3, recycled: true },
                        { variant: 'd', amount: 7, recycled: false },
                    ],
                },
            ]);
        });

        it('ignores a positive consumed correction dated before 2026-08-01', async () => {
            const d = await db();
            await d.collection('products').insertOne({
                group: 'Daržovės',
                name: 'Konservai2',
                updates: [
                    {
                        time: Date.parse('2025-09-10T12:00:00.000Z'),
                        years: [{ year: 22, amounts: [{ variant: 'd', amount: -10, recycled: false }] }],
                    },
                    {
                        time: Date.parse('2026-07-31T12:00:00.000Z'),
                        years: [{ year: 22, amounts: [{ variant: 'd', amount: 3, recycled: false }] }],
                    },
                ],
            });

            const result = await getSummary();

            expect(result.find((s) => s.name === 'Konservai2')?.years).toStrictEqual([
                { year: 25, amounts: [{ variant: 'd', amount: 10, recycled: false }] },
            ]);
        });

        it('returns summary for specified years', async () => {
            await expect(getSummary([22, 23])).resolves.toStrictEqual([
                {
                    group: 'Uogienės',
                    name: 'Avietės',
                    years: [{ year: 22, amounts: [{ variant: 'p', amount: 1, recycled: false }] }],
                },
                {
                    group: 'Uogienės',
                    name: 'Braškės',
                    years: [
                        {
                            year: 22,
                            amounts: [
                                { variant: 'p', amount: 1, recycled: false },
                                { variant: 'm', amount: 3, recycled: true },
                            ],
                        },
                    ],
                },
                {
                    group: 'Daržovės',
                    name: 'Agurkai',
                    years: [{ year: 22, amounts: [{ variant: 'd', amount: 3, recycled: false }] }],
                },
            ]);
        });
    });

    describe('getFullSummary', () => {
        const groups = getGroupsFixture();
        const variants = getVariantsFixture();

        beforeEach(() => {
            vi.mocked(getGroups).mockResolvedValue(groups);
            vi.mocked(getVariants).mockResolvedValue(variants);
        });

        it('returns summary', async () => {
            await expect(getFullSummary()).resolves.toStrictEqual({
                years: [23, 22, 21],
                groups,
                variants,
                summary: [
                    {
                        group: 'Uogienės',
                        name: 'Avietės',
                        years: [
                            { year: 22, amounts: [{ variant: 'p', amount: 1, recycled: false }] },
                            { year: 21, amounts: [{ variant: 'p', amount: 3, recycled: false }] },
                        ],
                    },
                    {
                        group: 'Uogienės',
                        name: 'Braškės',
                        years: [
                            {
                                year: 22,
                                amounts: [
                                    { variant: 'p', amount: 1, recycled: false },
                                    { variant: 'm', amount: 3, recycled: true },
                                ],
                            },
                            { year: 21, amounts: [{ variant: 'p', amount: 1, recycled: true }] },
                        ],
                    },
                    {
                        group: 'Daržovės',
                        name: 'Agurkai',
                        years: [{ year: 22, amounts: [{ variant: 'd', amount: 3, recycled: false }] }],
                    },
                ],
            });
            expect(getYears).toHaveBeenCalledWith(3, 8);
        });

        it('rolls a child product into its parent, dropping the separate child row', async () => {
            const d = await db();
            await d
                .collection('products')
                .updateOne({ group: 'Uogienės', name: 'Braškės' }, { $set: { parent: 'Avietės' } });

            const result = await getFullSummary();

            expect(result.summary).toStrictEqual([
                {
                    group: 'Uogienės',
                    name: 'Avietės',
                    years: [
                        {
                            year: 22,
                            amounts: [
                                { variant: 'p', amount: 2, recycled: false },
                                { variant: 'm', amount: 3, recycled: true },
                            ],
                        },
                        {
                            year: 21,
                            amounts: [
                                { variant: 'p', amount: 3, recycled: false },
                                { variant: 'p', amount: 1, recycled: true },
                            ],
                        },
                    ],
                },
                {
                    group: 'Daržovės',
                    name: 'Agurkai',
                    years: [{ year: 22, amounts: [{ variant: 'd', amount: 3, recycled: false }] }],
                },
            ]);
        });

        it('merges a home balance into a year that already has consumed-history amounts', async () => {
            const d = await db();
            await d
                .collection('products')
                .updateOne(
                    { group: 'Uogienės', name: 'Avietės' },
                    { $push: { years: { year: 22, amounts: [{ variant: 'p', amount: 5, home: true }] } } }
                );

            const result = await getFullSummary();

            const avietes = result.summary.find((s) => s.name === 'Avietės');
            const year22 = avietes?.years?.find((y) => y.year === 22);

            expect(year22?.amounts).toContainEqual({ variant: 'p', amount: 5, home: true });
            expect(year22?.amounts).toContainEqual({ variant: 'p', amount: 1, recycled: false });
        });

        it('adds a brand new entry for a product that only has a home balance and no consumed history', async () => {
            const d = await db();
            await d.collection('products').insertOne({
                group: 'Uogienės',
                name: 'Namų likutis',
                years: [{ year: 23, amounts: [{ variant: 'p', amount: 4, home: true }] }],
            });

            const result = await getFullSummary();

            const entry = result.summary.find((s) => s.name === 'Namų likutis');

            expect(entry?.years).toStrictEqual([{ year: 23, amounts: [{ variant: 'p', amount: 4, home: true }] }]);
        });

        it('does not collapse products whose parent chains form a cycle', async () => {
            const d = await db();
            await d.collection('products').insertMany([
                {
                    group: 'Uogienės',
                    name: 'Ciklinis A',
                    parent: 'Ciklinis B',
                    years: [{ year: 22, amounts: [{ variant: 'p', amount: 1 }] }],
                    updates: [
                        {
                            time: Date.parse('2023-01-01T12:00:00.000Z'),
                            years: [{ year: 22, amounts: [{ variant: 'p', amount: -1, recycled: false }] }],
                        },
                    ],
                },
                {
                    group: 'Uogienės',
                    name: 'Ciklinis B',
                    parent: 'Ciklinis A',
                    years: [{ year: 22, amounts: [{ variant: 'p', amount: 1 }] }],
                    updates: [
                        {
                            time: Date.parse('2023-01-01T12:00:00.000Z'),
                            years: [{ year: 22, amounts: [{ variant: 'p', amount: -1, recycled: false }] }],
                        },
                    ],
                },
            ]);

            const result = await getFullSummary();

            expect(result.summary.some((s) => s.name === 'Ciklinis A')).toBe(true);
            expect(result.summary.some((s) => s.name === 'Ciklinis B')).toBe(true);
        });

        it('rolls up through a grandchild (arbitrary depth) into the topmost ancestor', async () => {
            const d = await db();
            await d
                .collection('products')
                .updateOne({ group: 'Uogienės', name: 'Braškės' }, { $set: { parent: 'Avietės' } });
            await d.collection('products').insertOne({
                group: 'Uogienės',
                name: 'Braškės (Zewa)',
                parent: 'Braškės',
                years: [{ year: 22, amounts: [{ variant: 'p', amount: 5 }] }],
                updates: [
                    {
                        time: Date.parse('2023-01-10T12:00:00.000Z'),
                        years: [{ year: 22, amounts: [{ variant: 'p', amount: -5, recycled: false }] }],
                    },
                ],
            });

            const result = await getFullSummary();

            const avietes = result.summary.find((s) => s.name === 'Avietės');
            const year22 = avietes?.years?.find((y) => y.year === 22);

            expect(year22?.amounts).toContainEqual({ variant: 'p', amount: 7, recycled: false });
            expect(result.summary.some((s) => s.name === 'Braškės' || s.name === 'Braškės (Zewa)')).toBe(false);
        });
    });

    describe('getSummaryUpdates', () => {
        it('returns history entries with recycled amounts for the given year', async () => {
            const result = await getSummaryUpdates('Uogienės', 'Braškės', 22);

            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBeGreaterThan(0);
            expect(result.every((e) => e.group === 'Uogienės')).toBe(true);
            expect(result.every((e) => e.name === 'Braškės')).toBe(true);
            expect(result.every((e) => e.year === 22)).toBe(true);
            expect(result.every((e) => Array.isArray(e.amounts))).toBe(true);
        });

        it('only includes entries where recycled field is present', async () => {
            const result = await getSummaryUpdates('Uogienės', 'Braškės', 22);

            const amounts = result.flatMap((e) => e.amounts as unknown as { recycled?: boolean }[]);
            const allHaveRecycled = amounts.every((a) => 'recycled' in a);

            expect(allHaveRecycled).toBe(true);
        });

        it('returns empty array for product with no recycled amounts', async () => {
            // Kopūstai has no updates at all
            const result = await getSummaryUpdates('Daržovės', 'Kopūstai', 21);

            expect(result).toStrictEqual([]);
        });

        it('returns empty array for non-existent product', async () => {
            const result = await getSummaryUpdates('Uogienės', 'Bruknės', 22);

            expect(result).toStrictEqual([]);
        });

        it('returns entries sorted by time descending', async () => {
            const result = await getSummaryUpdates('Uogienės', 'Braškės', 22);

            const times = result.map((e) => e.time);
            const sorted = [...times].sort((a, b) => b - a);

            expect(times).toStrictEqual(sorted);
        });

        it('includes a positive consumed correction dated on/after the cutoff, alongside its matching recycled line', async () => {
            const d = await db();
            await d.collection('products').insertOne({
                group: 'Daržovės',
                name: 'Konservai',
                updates: [
                    {
                        time: Date.parse('2026-08-05T12:00:00.000Z'),
                        years: [
                            {
                                year: 22,
                                amounts: [
                                    { variant: 'd', amount: 3, recycled: false },
                                    { variant: 'd', amount: -3, recycled: true },
                                ],
                            },
                        ],
                    },
                ],
            });

            const result = await getSummaryUpdates('Daržovės', 'Konservai', 25);

            expect(result).toHaveLength(1);
            expect(result[0].amounts).toStrictEqual(
                expect.arrayContaining([
                    { variant: 'd', amount: 3, recycled: false },
                    { variant: 'd', amount: -3, recycled: true },
                ])
            );
            expect(result[0].amounts).toHaveLength(2);
        });

        it('excludes a positive consumed correction dated before the cutoff from the drill-down list', async () => {
            const d = await db();
            await d.collection('products').insertOne({
                group: 'Daržovės',
                name: 'Konservai2',
                updates: [
                    {
                        time: Date.parse('2026-07-31T12:00:00.000Z'),
                        years: [{ year: 22, amounts: [{ variant: 'd', amount: 3, recycled: false }] }],
                    },
                ],
            });

            const result = await getSummaryUpdates('Daržovės', 'Konservai2', 25);

            expect(result).toStrictEqual([]);
        });

        it('returns entries with sessionId field', async () => {
            const result = await getSummaryUpdates('Uogienės', 'Braškės', 22);

            expect(result.length).toBeGreaterThan(0);
            expect(result.every((e) => 'sessionId' in e)).toBe(true);
        });
    });

    describe('getSummaryUndates', () => {
        it('returns empty array when no undates exist', async () => {
            const result = await getSummaryUndates('Uogienės', 'Braškės', 22);

            expect(result).toStrictEqual([]);
        });

        it('returns empty array for non-existent product', async () => {
            const result = await getSummaryUndates('Uogienės', 'Bruknės', 22);

            expect(result).toStrictEqual([]);
        });

        it('returns history entries from undates field with recycled amounts', async () => {
            const d = await db();

            // Insert a product with undates containing recycled amounts within year 22 range
            await d.collection('products').insertOne({
                group: 'Uogienės',
                name: 'Testinė',
                years: [{ year: 22, amounts: [{ variant: 'p', amount: 1 }] }],
                undates: [
                    {
                        time: Date.parse('2023-03-01T12:00:00.000Z'),
                        years: [
                            {
                                year: 22,
                                amounts: [{ variant: 'p', amount: -1, recycled: true }],
                            },
                        ],
                    },
                ],
            });

            const result = await getSummaryUndates('Uogienės', 'Testinė', 22);

            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBeGreaterThan(0);
            expect(result.every((e) => e.group === 'Uogienės')).toBe(true);
            expect(result.every((e) => e.name === 'Testinė')).toBe(true);
            expect(result.every((e) => e.year === 22)).toBe(true);
        });

        it('excludes undates amounts without recycled field', async () => {
            const d = await db();

            // Insert a product with undates containing non-recycled amounts only
            await d.collection('products').insertOne({
                group: 'Daržovės',
                name: 'Testinė2',
                years: [{ year: 22, amounts: [{ variant: 'd', amount: 2 }] }],
                undates: [
                    {
                        time: Date.parse('2023-04-01T12:00:00.000Z'),
                        years: [
                            {
                                year: 22,
                                amounts: [{ variant: 'd', amount: 1 }],
                            },
                        ],
                    },
                ],
            });

            const result = await getSummaryUndates('Daržovės', 'Testinė2', 22);

            // No recycled field means no results match the filter
            expect(result).toStrictEqual([]);
        });
    });
});
