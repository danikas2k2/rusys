/** @jest-environment node */
import { getLastUpdate, getUpdatesCount } from '~/server/data/tests/utils';
import { addUpdate, addUpdates, getDiff, getSummary } from '~/server/data/updates';
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

    describe('getDiff', () => {
        it('returns difference for both values undefined', () => {
            expect(getDiff(undefined, undefined)).toEqual([]);
        });

        it('returns difference for prev value undefined', () => {
            expect(getDiff(undefined, [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }])).toEqual([{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }]);
        });

        it('returns difference for new value undefined', () => {
            expect(getDiff([{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }], undefined)).toEqual([{ year: 21, amounts: [{ variant: 'p', amount: -2 }] }]);
        });

        it('returns difference for unchanged values', () => {
            expect(getDiff([{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }], [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }])).toEqual([]);
        });

        it('returns difference for changed values', () => {
            expect(
                getDiff(
                    [
                        { year: 21, amounts: [{ variant: 'p', amount: 2 }] },
                        { year: 22, amounts: [{ variant: 'p', amount: 2 }] },
                    ],
                    [
                        { year: 21, amounts: [{ variant: 'p', amount: 1 }] },
                        { year: 22, amounts: [{ variant: 'p', amount: 2 }] },
                        { year: 23, amounts: [{ variant: 'p', amount: 1 }] },
                    ]
                )
            ).toEqual([
                { year: 21, amounts: [{ variant: 'p', amount: -1 }] },
                { year: 23, amounts: [{ variant: 'p', amount: 1 }] },
            ]);
        });
    });

    describe('getSummary', () => {
        it('returns updates', async () => {
            expect(await getSummary()).toEqual([
                { group: 'G', name: 'A', years: [{ year: 22, amounts: [{ variant: 'd', amount: 1 }] }] },
                {
                    group: 'J',
                    name: 'A',
                    years: [
                        { year: 21, amounts: [{ variant: 'p', amount: 3 }] },
                        { year: 22, amounts: [{ variant: 'p', amount: 1 }] },
                    ],
                },
                { group: 'J', name: 'B', years: [{ year: 22, amounts: [{ variant: 'p', amount: 1 }] }] },
            ]);
        });

        it('returns updates for specified years', async () => {
            expect(await getSummary([22, 23])).toEqual([
                { group: 'G', name: 'A', years: [{ year: 22, amounts: [{ variant: 'd', amount: 1 }] }] },
                { group: 'J', name: 'A', years: [{ year: 22, amounts: [{ variant: 'p', amount: 1 }] }] },
                { group: 'J', name: 'B', years: [{ year: 22, amounts: [{ variant: 'p', amount: 1 }] }] },
            ]);
        });
    });

    describe('addUpdates', () => {
        it('adds new updates', async () => {
            expect(
                await addUpdates('G', 'A', [
                    { year: 21, amounts: [{ variant: 'p', amount: 1 }] },
                    { year: 22, amounts: [{ variant: 'd', amount: 2 }] },
                ])
            ).toBeTrue();
            expect(await getUpdatesCount()).toEqual({ count: 8 });
            expect(await getLastUpdate()).toEqual({
                group: 'G',
                name: 'A',
                years: [
                    { year: 21, amounts: [{ variant: 'p', amount: 1 }] },
                    { year: 22, amounts: [{ variant: 'd', amount: 1 }] },
                ],
            });
        });

        it('adds empty updates', async () => {
            expect(await addUpdates('G', 'A', [])).toBeTrue();
            expect(await getUpdatesCount()).toEqual({ count: 8 });
            expect(await getLastUpdate()).toEqual({
                group: 'G',
                name: 'A',
                years: [{ year: 22, amounts: [{ variant: 'd', amount: -1 }] }],
            });
        });

        it('adds undefined as updates for specified name', async () => {
            expect(await addUpdates('G', 'A', undefined)).toBeTrue();
            expect(await getUpdatesCount()).toEqual({ count: 8 });
            expect(await getLastUpdate()).toEqual({
                group: 'G',
                name: 'A',
                years: [{ year: 22, amounts: [{ variant: 'd', amount: -1 }] }],
            });
        });

        it('does not add updates if not changed', async () => {
            expect(await addUpdates('G', 'A', [{ year: 22, amounts: [{ variant: 'd', amount: 1 }] }])).toBeFalse();
            expect(await getUpdatesCount()).toEqual({ count: 7 });
        });
    });

    describe('addUpdate', () => {
        it('adds new update for specified group, name, and year', async () => {
            expect(
                await addUpdate('G', 'A', 22, [
                    { variant: 'p', amount: 1 },
                    { variant: 'm', amount: 2 },
                    { variant: 'd', amount: 3 },
                ])
            ).toBeTrue();
            expect(await getUpdatesCount()).toEqual({ count: 8 });
            expect(await getLastUpdate()).toEqual({
                group: 'G',
                name: 'A',
                years: [
                    {
                        year: 22,
                        amounts: [
                            { variant: 'p', amount: 1 },
                            { variant: 'm', amount: 2 },
                            { variant: 'd', amount: 2 },
                        ],
                    },
                ],
            });
        });

        it('does not add update for empty group', async () => {
            expect(
                await addUpdate('', 'A', 21, [
                    { variant: 'p', amount: 1 },
                    { variant: 'm', amount: 2 },
                    { variant: 'd', amount: 3 },
                ])
            ).toBeFalse();
            expect(await getUpdatesCount()).toEqual({ count: 7 });
        });

        it('adds empty update for specified group, name, and year', async () => {
            expect(await addUpdate('G', 'A', 22, [])).toBeTrue();
            expect(await getUpdatesCount()).toEqual({ count: 8 });
            expect(await getLastUpdate()).toEqual({
                group: 'G',
                name: 'A',
                years: [{ year: 22, amounts: [{ variant: 'd', amount: -1 }] }],
            });
        });

        it('adds undefined as update for specified name and year', async () => {
            expect(await addUpdate('', 'A', 21, undefined)).toBeFalse();
            expect(await getUpdatesCount()).toEqual({ count: 7 });
        });

        it('does not add update if not changed', async () => {
            expect(await addUpdate('', 'A', 21, [{ variant: 'p', amount: 2 }])).toBeFalse();
            expect(await getUpdatesCount()).toEqual({ count: 7 });
        });

        it('does not add update if has nothing to update', async () => {
            expect(await addUpdate('G', 'A', 21, [])).toBeFalse();
            expect(await getUpdatesCount()).toEqual({ count: 7 });
        });
    });
});
