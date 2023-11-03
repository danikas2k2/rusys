import { addUpdate, addUpdates, getDiff, getSummary, removeUpdates, renameUpdates } from '~/server/data/updates';
import { getYears } from '~/server/data/years';
import { DETAILS, UPDATES } from '~/server/db';

jest.mock('~/server/db');
jest.mock('~/server/data/years');

describe('updates', () => {
    beforeEach(async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-05-01T00:00:00.000Z'));

        await DETAILS.insertMany([
            { name: 'A', 21: { '': 2 } },
            { name: 'B', 22: { '': 1 } },
        ]);
        await UPDATES.insertMany([
            { name: 'A', time: Date.parse('2023-01-01T12:00:00.000Z'), 21: { '': 2 }, 22: { '': 1 } },
            { name: 'A', time: Date.parse('2023-01-05T12:00:00.000Z'), 22: { '': -1 } },
            { name: 'B', time: Date.parse('2023-02-01T12:00:00.000Z'), 22: { '': 2 } },
            { name: 'B', time: Date.parse('2023-02-05T12:00:00.000Z'), 22: { '': -1 } },
        ]);
    });

    afterEach(async () => {
        jest.clearAllMocks();

        await DETAILS.deleteMany({}, {});
        await UPDATES.deleteMany({}, {});
    });

    afterAll(jest.useRealTimers);

    describe('getDiff', () => {
        it('return difference for both values undefined', () => {
            expect(getDiff(null, null)).toBeNull();
        });

        it('return difference for prev value undefined', () => {
            expect(getDiff(null, { 21: { '': 2 } })).toEqual({ 21: { '': 2 } });
        });

        it('return difference for new value undefined', () => {
            expect(getDiff({ 21: { '': 2 } }, null)).toEqual({ 21: { '': -2 } });
        });

        it('return difference for unchanged values', () => {
            expect(getDiff({ 21: { '': 2 } }, { 21: { '': 2 } })).toBeNull();
        });

        it('return difference for changed values', () => {
            expect(
                getDiff({ 21: { '': 2 }, '22': { '': 2 } }, { 21: { '': 1 }, '22': { '': 2 }, '23': { '': 1 } })
            ).toEqual({
                21: { '': -1 },
                '23': { '': 1 },
            });
        });
    });

    describe('getSummary', () => {
        it('return updates for specified years', async () => {
            expect(await getSummary(getYears())).toEqual({
                A: { 23: { '': 1 } },
                B: { 23: { '': 1 } },
            });
        });
    });

    describe('addUpdates', () => {
        it('add new updates for specified name', async () => {
            expect(await addUpdates('A', { 21: { '': 1 }, 22: { d: 2 } })).toBeTrue();
            expect(await UPDATES.count({})).toEqual(5);
            expect(await UPDATES.find({}, { _id: 0 }).sort({ time: -1 }).limit(1)).toEqual([
                { name: 'A', time: Date.parse('2023-05-01T00:00:00.000Z'), 21: { '': -1 }, 22: { d: 2 } },
            ]);
        });

        it('add empty  updates for specified name', async () => {
            expect(await addUpdates('A', {})).toBeTrue();
            expect(await UPDATES.count({})).toEqual(5);
            expect(await UPDATES.find({}, { _id: 0 }).sort({ time: -1 }).limit(1)).toEqual([
                { name: 'A', time: Date.parse('2023-05-01T00:00:00.000Z'), 21: { '': -2 } },
            ]);
        });

        it('add null as updates for specified name', async () => {
            expect(await addUpdates('A', null)).toBeTrue();
            expect(await UPDATES.count({})).toEqual(5);
            expect(await UPDATES.find({}, { _id: 0 }).sort({ time: -1 }).limit(1)).toEqual([
                { name: 'A', time: Date.parse('2023-05-01T00:00:00.000Z'), 21: { '': -2 } },
            ]);
        });

        it('do not add updates if not changed', async () => {
            expect(await addUpdates('A', { 21: { '': 2 } })).toBeFalse();
            expect(await UPDATES.count({})).toEqual(4);
        });
    });

    describe('addUpdate', () => {
        it('add new update for specified name and year', async () => {
            expect(await addUpdate('A', 21, { '': 1, m: 2, d: 3 })).toBeTrue();
            expect(await UPDATES.count({})).toEqual(5);
            expect(await UPDATES.find({}, { _id: 0 }).sort({ time: -1 }).limit(1)).toEqual([
                { name: 'A', time: Date.parse('2023-05-01T00:00:00.000Z'), 21: { '': -1, m: 2, d: 3 } },
            ]);
        });

        it('add empty update for specified name and year', async () => {
            expect(await addUpdate('A', 21, {})).toBeTrue();
            expect(await UPDATES.count({})).toEqual(5);
            expect(await UPDATES.find({}, { _id: 0 }).sort({ time: -1 }).limit(1)).toEqual([
                { name: 'A', time: Date.parse('2023-05-01T00:00:00.000Z'), 21: { '': -2 } },
            ]);
        });

        it('add null as update for specified name and year', async () => {
            expect(await addUpdate('A', 21, null)).toBeTrue();
            expect(await UPDATES.count({})).toEqual(5);
            expect(await UPDATES.find({}, { _id: 0 }).sort({ time: -1 }).limit(1)).toEqual([
                { name: 'A', time: Date.parse('2023-05-01T00:00:00.000Z'), 21: { '': -2 } },
            ]);
        });

        it('do not add update if not changed', async () => {
            expect(await addUpdate('A', 21, { '': 2 })).toBeFalse();
            expect(await UPDATES.count({})).toEqual(4);
        });
    });

    describe('renameUpdates', () => {
        it('change updates name', async () => {
            expect(await renameUpdates('A', 'Z')).toBeTrue();
            expect(await UPDATES.find({}, { _id: 0 }).sort({ time: 1, name: 1 })).toEqual([
                expect.objectContaining({ name: 'Z' }),
                expect.objectContaining({ name: 'Z' }),
                expect.objectContaining({ name: 'B' }),
                expect.objectContaining({ name: 'B' }),
            ]);
        });

        it('return false if no updates was changed', async () => {
            expect(await renameUpdates('Z', 'A')).toBeFalse();
            expect(await UPDATES.find({}, { _id: 0 }).sort({ time: 1, name: 1 })).toEqual([
                expect.objectContaining({ name: 'A' }),
                expect.objectContaining({ name: 'A' }),
                expect.objectContaining({ name: 'B' }),
                expect.objectContaining({ name: 'B' }),
            ]);
        });
    });

    describe('removeUpdates', () => {
        it('remove updates by name', async () => {
            expect(await removeUpdates('A')).toBeTrue();
            expect(await UPDATES.count({})).toEqual(2);
        });

        it('return false if no updates was removed', async () => {
            expect(await removeUpdates('Z')).toBeFalse();
            expect(await UPDATES.count({})).toEqual(4);
        });
    });
});
