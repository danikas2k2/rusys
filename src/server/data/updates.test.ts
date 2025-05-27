/** @jest-environment node */
import { getDetailsFixture, getGroupsFixture, getVariantsFixture } from '@tests/fixtures';
import { getGroups } from '~/server/data/groups';
import { getFullSummary, getSummary } from '~/server/data/updates';
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
        await d.collection('details').insertMany(getDetailsFixture());
        await d.collection('groups').insertMany(getGroupsFixture());
        await d.collection('variants').insertMany(getVariantsFixture());
    });

    afterEach(async () => {
        const d = await db();
        await d.collection('details').deleteMany({});
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
                        { year: 22, amounts: [{ variant: 'p', amount: 1 }] },
                        { year: 21, amounts: [{ variant: 'p', amount: 3 }] },
                    ],
                },
                {
                    group: 'Uogienės',
                    name: 'Braškės',
                    years: [
                        {
                            year: 22,
                            amounts: [
                                { variant: 'p', amount: 1 },
                                { variant: 'm', amount: 3, recycled: true },
                            ],
                        },
                        {
                            year: 21,
                            amounts: [{ variant: 'p', amount: 1, recycled: true }],
                        },
                    ],
                },
                { group: 'Daržovės', name: 'Agurkai', years: [{ year: 22, amounts: [{ variant: 'd', amount: 1 }] }] },
            ]);
        });

        it('returns summary for specified years', async () => {
            await expect(getSummary([22, 23])).resolves.toStrictEqual([
                { group: 'Uogienės', name: 'Avietės', years: [{ year: 22, amounts: [{ variant: 'p', amount: 1 }] }] },
                {
                    group: 'Uogienės',
                    name: 'Braškės',
                    years: [
                        {
                            year: 22,
                            amounts: [
                                { variant: 'p', amount: 1 },
                                { variant: 'm', amount: 3, recycled: true },
                            ],
                        },
                    ],
                },
                { group: 'Daržovės', name: 'Agurkai', years: [{ year: 22, amounts: [{ variant: 'd', amount: 1 }] }] },
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
                            { year: 22, amounts: [{ variant: 'p', amount: 1 }] },
                            { year: 21, amounts: [{ variant: 'p', amount: 3 }] },
                        ],
                    },
                    {
                        group: 'Uogienės',
                        name: 'Braškės',
                        years: [
                            {
                                year: 22,
                                amounts: [
                                    { variant: 'p', amount: 1 },
                                    { variant: 'm', amount: 3, recycled: true },
                                ],
                            },
                            { year: 21, amounts: [{ variant: 'p', amount: 1, recycled: true }] },
                        ],
                    },
                    {
                        group: 'Daržovės',
                        name: 'Agurkai',
                        years: [{ year: 22, amounts: [{ variant: 'd', amount: 1 }] }],
                    },
                ],
            });
        });
    });
});
