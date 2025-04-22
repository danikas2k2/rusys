/** @jest-environment node */
import { getDetailsFixture } from '@tests/fixtures';
import { getLastUpdate, getUpdatesCount } from '~/server/data/tests/utils';
import { addUpdate, addUpdates, getSummary } from '~/server/data/updates';
import { db } from '~/server/db';

jest.setTimeout(30_000);

jest.mock('~/server/db');
jest.mock('~/server/data/years');

describe('updates', () => {
    const testDetails = getDetailsFixture();

    beforeEach(async () => {
        await (await db()).collection('details').insertMany(testDetails);
    });

    afterEach(async () => {
        await (await db()).collection('details').deleteMany({});
        jest.clearAllMocks();
    });

    describe('getSummary', () => {
        it('returns summary', async () => {
            await expect(getSummary()).resolves.toStrictEqual([
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
            await expect(getSummary([22, 23])).resolves.toStrictEqual([
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
            await expect(
                addUpdates('Daržovės', 'Agurkai', [
                    { year: 21, amounts: [{ variant: 'p', amount: 1 }] },
                    { year: 22, amounts: [{ variant: 'd', amount: 2 }] },
                ])
            ).resolves.toBeTrue();
            await expect(getUpdatesCount()).resolves.toStrictEqual({ count: 9 });
            await expect(getLastUpdate()).resolves.toStrictEqual({
                group: 'Daržovės',
                name: 'Agurkai',
                years: [
                    { year: 21, amounts: [{ variant: 'p', amount: 1 }] },
                    { year: 22, amounts: [{ variant: 'd', amount: 2 }] },
                ],
            });
        });

        it('adds new updates with recycled', async () => {
            await expect(
                addUpdates('Daržovės', 'Agurkai', [
                    {
                        year: 21,
                        amounts: [
                            { variant: 'm', amount: -1, recycled: true },
                            { variant: 'p', amount: 1 },
                        ],
                    },
                ])
            ).resolves.toBeTrue();
            await expect(getUpdatesCount()).resolves.toStrictEqual({ count: 9 });
            await expect(getLastUpdate()).resolves.toStrictEqual({
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
            await expect(addUpdates('Daržovės', 'Agurkai', [])).resolves.toBeFalse();
        });

        it('does not add undefined update', async () => {
            await expect(addUpdates('Daržovės', 'Agurkai', undefined)).resolves.toBeFalse();
        });
    });

    describe('addUpdate', () => {
        it('adds new update for specified group, name, and year', async () => {
            await expect(
                addUpdate('Daržovės', 'Agurkai', 22, [
                    { variant: 'p', amount: 1 },
                    { variant: 'm', amount: 2 },
                    { variant: 'd', amount: -1 },
                ])
            ).resolves.toBeTrue();
            await expect(getUpdatesCount()).resolves.toStrictEqual({ count: 9 });
            await expect(getLastUpdate()).resolves.toStrictEqual({
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
            await expect(
                addUpdate('Daržovės', 'Agurkai', 22, [
                    { variant: 'p', amount: 1 },
                    { variant: 'm', amount: 2 },
                    { variant: 'd', amount: -1, recycled: true },
                ])
            ).resolves.toBeTrue();
            await expect(getUpdatesCount()).resolves.toStrictEqual({ count: 9 });
            await expect(getLastUpdate()).resolves.toStrictEqual({
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
            await expect(addUpdate('', 'Agurkai', 21, [{ variant: 'p', amount: 1 }])).resolves.toBeFalse();
        });

        it('does not add update for empty name', async () => {
            await expect(addUpdate('Daržovės', '', 21, [{ variant: 'p', amount: 1 }])).resolves.toBeFalse();
        });

        it('does not add empty update for specified group, name, and year', async () => {
            await expect(addUpdate('Daržovės', 'Agurkai', 22, [])).resolves.toBeFalse();
        });

        it('does not add undefined as update for specified name and year', async () => {
            await expect(addUpdate('Daržovės', 'Agurkai', 21, undefined)).resolves.toBeFalse();
        });
    });
});
