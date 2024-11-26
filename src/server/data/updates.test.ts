/** @jest-environment node */
import { getLastUpdate, getUpdatesCount } from '~/server/data/tests/utils';
import { addUpdate, addUpdates, getSummary } from '~/server/data/updates';
import { getDetailsCollection } from '~/server/db';
import { getDetailsFixture } from '~/tests/fixtures';

jest.mock('~/server/db');
jest.mock('~/server/data/years');

describe('updates', () => {
    jest.setTimeout(30_000);

    const testDetails = getDetailsFixture();

    beforeEach(async () => {
        await (await getDetailsCollection()).insertMany(testDetails);
    });

    afterEach(async () => {
        await (await getDetailsCollection()).deleteMany({});
        jest.clearAllMocks();
    });

    describe('getSummary', () => {
        it('returns summary', async () => {
            expect(await getSummary()).toEqual([
                { group: 'Daržovės', name: 'Agurkai', years: [{ year: 22, amounts: [{ variant: 'd', amount: 1 }] }] },
                {
                    group: 'Uogienės',
                    name: 'Avietės',
                    years: [
                        { year: 21, amounts: [{ variant: 'p', amount: 3 }] },
                        { year: 22, amounts: [{ variant: 'p', amount: 1 }] },
                    ],
                },
                {
                    group: 'Uogienės',
                    name: 'Braškės',
                    years: [
                        {
                            year: 21,
                            amounts: [{ variant: 'p', amount: 1, recycled: true }],
                        },
                        {
                            year: 22,
                            amounts: [
                                { variant: 'm', amount: 3, recycled: true },
                                { variant: 'p', amount: 1 },
                            ],
                        },
                    ],
                },
            ]);
        });

        it('returns summary for specified years', async () => {
            expect(await getSummary([22, 23])).toEqual([
                { group: 'Daržovės', name: 'Agurkai', years: [{ year: 22, amounts: [{ variant: 'd', amount: 1 }] }] },
                { group: 'Uogienės', name: 'Avietės', years: [{ year: 22, amounts: [{ variant: 'p', amount: 1 }] }] },
                {
                    group: 'Uogienės',
                    name: 'Braškės',
                    years: [
                        {
                            year: 22,
                            amounts: [
                                { variant: 'm', amount: 3, recycled: true },
                                { variant: 'p', amount: 1 },
                            ],
                        },
                    ],
                },
            ]);
        });
    });

    describe('addUpdates', () => {
        it('adds new updates', async () => {
            expect(
                await addUpdates('Daržovės', 'Agurkai', [
                    { year: 21, amounts: [{ variant: 'p', amount: 1 }] },
                    { year: 22, amounts: [{ variant: 'd', amount: 2 }] },
                ])
            ).toBeTrue();
            expect(await getUpdatesCount()).toEqual({ count: 9 });
            expect(await getLastUpdate()).toEqual({
                group: 'Daržovės',
                name: 'Agurkai',
                years: [
                    { year: 21, amounts: [{ variant: 'p', amount: 1 }] },
                    { year: 22, amounts: [{ variant: 'd', amount: 2 }] },
                ],
            });
        });

        it('adds new updates with recycled', async () => {
            expect(
                await addUpdates('Daržovės', 'Agurkai', [
                    {
                        year: 21,
                        amounts: [
                            { variant: 'm', amount: -1, recycled: true },
                            { variant: 'p', amount: 1 },
                        ],
                    },
                ])
            ).toBeTrue();
            expect(await getUpdatesCount()).toEqual({ count: 9 });
            expect(await getLastUpdate()).toEqual({
                group: 'Daržovės',
                name: 'Agurkai',
                years: [
                    {
                        year: 21,
                        amounts: [
                            { variant: 'm', amount: -1, recycled: true },
                            { variant: 'p', amount: 1 },
                        ],
                    },
                ],
            });
        });

        it('does not add empty update', async () => {
            expect(await addUpdates('Daržovės', 'Agurkai', [])).toBeFalse();
        });

        it('does not add undefined update', async () => {
            expect(await addUpdates('Daržovės', 'Agurkai', undefined)).toBeFalse();
        });
    });

    describe('addUpdate', () => {
        it('adds new update for specified group, name, and year', async () => {
            expect(
                await addUpdate('Daržovės', 'Agurkai', 22, [
                    { variant: 'p', amount: 1 },
                    { variant: 'm', amount: 2 },
                    { variant: 'd', amount: -1 },
                ])
            ).toBeTrue();
            expect(await getUpdatesCount()).toEqual({ count: 9 });
            expect(await getLastUpdate()).toEqual({
                group: 'Daržovės',
                name: 'Agurkai',
                years: [
                    {
                        year: 22,
                        amounts: [
                            { variant: 'p', amount: 1 },
                            { variant: 'm', amount: 2 },
                            { variant: 'd', amount: -1 },
                        ],
                    },
                ],
            });
        });

        it('adds new update with recycled for specified group, name, and year', async () => {
            expect(
                await addUpdate('Daržovės', 'Agurkai', 22, [
                    { variant: 'p', amount: 1 },
                    { variant: 'm', amount: 2 },
                    { variant: 'd', amount: -1, recycled: true },
                ])
            ).toBeTrue();
            expect(await getUpdatesCount()).toEqual({ count: 9 });
            expect(await getLastUpdate()).toEqual({
                group: 'Daržovės',
                name: 'Agurkai',
                years: [
                    {
                        year: 22,
                        amounts: [
                            { variant: 'p', amount: 1 },
                            { variant: 'm', amount: 2 },
                            { variant: 'd', amount: -1, recycled: true },
                        ],
                    },
                ],
            });
        });

        it('does not add update for empty group', async () => {
            expect(await addUpdate('', 'Agurkai', 21, [{ variant: 'p', amount: 1 }])).toBeFalse();
        });

        it('does not add update for empty name', async () => {
            expect(await addUpdate('Daržovės', '', 21, [{ variant: 'p', amount: 1 }])).toBeFalse();
        });

        it('does not add empty update for specified group, name, and year', async () => {
            expect(await addUpdate('Daržovės', 'Agurkai', 22, [])).toBeFalse();
        });

        it('does not add undefined as update for specified name and year', async () => {
            expect(await addUpdate('Daržovės', 'Agurkai', 21, undefined)).toBeFalse();
        });
    });
});
