/** @jest-environment node */
import { getGroupsFixture, getProductsFixture, getVariantsFixture } from '@tests/fixtures';

import { getGroups } from '~/server/data/groups';
import { getFullSummary, getSummary, getSummaryUndates, getSummaryUpdates } from '~/server/data/summary';
import { getVariants } from '~/server/data/variants';
import { db } from '~/server/db';

jest.setTimeout(30_000);

jest.mock('~/server/db');
jest.mock('~/server/data/years');
jest.mock('~/server/data/groups');
jest.mock('~/server/data/variants');

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
        jest.clearAllMocks();
    });

    describe('getSummary', () => {
        it('returns summary', async () => {
            await expect(getSummary()).resolves.toStrictEqual([
                {
                    group: 'Uogienės',
                    name: 'Avietės',
                    years: [
                        { year: 22, amounts: [{ variant: 'p', amount: -2, recycled: false }] },
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
                                { variant: 'p', amount: -2, recycled: true },
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
                    years: [{ year: 22, amounts: [{ variant: 'd', amount: -1, recycled: false }] }],
                },
            ]);
        });

        it('returns summary for specified years', async () => {
            await expect(getSummary([22, 23])).resolves.toStrictEqual([
                {
                    group: 'Uogienės',
                    name: 'Avietės',
                    years: [{ year: 22, amounts: [{ variant: 'p', amount: -2, recycled: false }] }],
                },
                {
                    group: 'Uogienės',
                    name: 'Braškės',
                    years: [
                        {
                            year: 22,
                            amounts: [
                                { variant: 'p', amount: -2, recycled: true },
                                { variant: 'p', amount: 1, recycled: false },
                                { variant: 'm', amount: 3, recycled: true },
                            ],
                        },
                    ],
                },
                {
                    group: 'Daržovės',
                    name: 'Agurkai',
                    years: [{ year: 22, amounts: [{ variant: 'd', amount: -1, recycled: false }] }],
                },
            ]);
        });
    });

    describe('getFullSummary', () => {
        const groups = getGroupsFixture();
        const variants = getVariantsFixture();

        beforeEach(() => {
            jest.mocked(getGroups).mockResolvedValue(groups);
            jest.mocked(getVariants).mockResolvedValue(variants);
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
                            { year: 22, amounts: [{ variant: 'p', amount: -2, recycled: false }] },
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
                                    { variant: 'p', amount: -2, recycled: true },
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
                        years: [{ year: 22, amounts: [{ variant: 'd', amount: -1, recycled: false }] }],
                    },
                ],
            });
        });
    });

    describe('getSummaryUpdates', () => {
        it('returns history entries with recycled amounts for the given year', async () => {
            // Year 22 = Sept 2022 to Sept 2023
            // Braškės has updates in Feb 2023 (within year 22 range) with recycled amounts
            const result = await getSummaryUpdates('Uogienės', 'Braškės', 22);

            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBeGreaterThan(0);

            for (const entry of result) {
                expect(entry.group).toBe('Uogienės');
                expect(entry.name).toBe('Braškės');
                expect(entry.year).toBe(22);
                expect(entry.amounts).toBeDefined();
                expect(Array.isArray(entry.amounts)).toBe(true);
            }
        });

        it('only includes entries where recycled field is present', async () => {
            const result = await getSummaryUpdates('Uogienės', 'Braškės', 22);

            for (const entry of result) {
                for (const amount of entry.amounts ?? []) {
                    expect(amount).toHaveProperty('recycled');
                }
            }
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

            if (result.length > 1) {
                for (let i = 1; i < result.length; i++) {
                    expect(result[i - 1].time).toBeGreaterThanOrEqual(result[i].time);
                }
            }
        });

        it('returns entries with sessionId field', async () => {
            const result = await getSummaryUpdates('Uogienės', 'Braškės', 22);

            expect(result.length).toBeGreaterThan(0);

            for (const entry of result) {
                expect(entry).toHaveProperty('sessionId');
            }
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

            for (const entry of result) {
                expect(entry.group).toBe('Uogienės');
                expect(entry.name).toBe('Testinė');
                expect(entry.year).toBe(22);
            }
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
