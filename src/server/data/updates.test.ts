import {
    addUpdate,
    addUpdates,
    getDiff,
    getSummary,
    moveUpdates,
    removeUpdates,
    removeUpdatesGroup,
    renameUpdates,
} from '~/server/data/updates';
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
            { group: 'G', name: 'A', 22: { d: 1 } },
        ]);
        await UPDATES.insertMany([
            { name: 'A', time: Date.parse('2023-01-01T12:00:00.000Z'), 21: { '': 2 }, 22: { '': 1 } },
            { name: 'A', time: Date.parse('2023-01-05T12:00:00.000Z'), 22: { '': -1 } },
            { name: 'B', time: Date.parse('2023-02-01T12:00:00.000Z'), 22: { '': 2 } },
            { group: 'G', name: 'A', time: Date.parse('2023-02-03T12:00:00.000Z'), 22: { d: 2 } },
            { name: 'B', time: Date.parse('2023-02-05T12:00:00.000Z'), 22: { '': -1 } },
            { group: 'G', name: 'A', time: Date.parse('2023-02-07T12:00:00.000Z'), 22: { d: -1 } },
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
                '': {
                    A: { 22: { '': 1 } },
                    B: { 22: { '': 1 } },
                },
                G: {
                    A: { 22: { d: 1 } },
                },
            });
        });
    });

    describe('addUpdates', () => {
        it('add new updates', async () => {
            expect(await addUpdates('G', 'A', { 21: { '': 1 }, 22: { d: 2 } })).toBeTrue();
            expect(await UPDATES.count({})).toEqual(7);
            expect(await UPDATES.findOne({}, { _id: 0, time: 0 }).sort({ time: -1 })).toEqual({
                group: 'G',
                name: 'A',
                21: { '': 1 },
                22: { d: 1 },
            });
        });

        it('add empty updates', async () => {
            expect(await addUpdates('G', 'A', {})).toBeTrue();
            expect(await UPDATES.count({})).toEqual(7);
            expect(await UPDATES.findOne({}, { _id: 0, time: 0 }).sort({ time: -1 })).toEqual({
                group: 'G',
                name: 'A',
                22: { d: -1 },
            });
        });

        it('add null as updates for specified name', async () => {
            expect(await addUpdates('G', 'A', null)).toBeTrue();
            expect(await UPDATES.count({})).toEqual(7);
            expect(await UPDATES.findOne({}, { _id: 0, time: 0 }).sort({ time: -1 })).toEqual({
                group: 'G',
                name: 'A',
                22: { d: -1 },
            });
        });

        it('do not add updates if not changed', async () => {
            expect(await addUpdates('G', 'A', { 22: { d: 1 } })).toBeFalse();
            expect(await UPDATES.count({})).toEqual(6);
        });
    });

    describe('addUpdate', () => {
        it('add new update for specified group, name, and year', async () => {
            expect(await addUpdate('G', 'A', 22, { '': 1, m: 2, d: 3 })).toBeTrue();
            expect(await UPDATES.count({})).toEqual(7);
            expect(await UPDATES.findOne({}, { _id: 0, time: 0 }).sort({ time: -1 })).toEqual({
                group: 'G',
                name: 'A',
                22: { '': 1, m: 2, d: 2 },
            });
        });

        it('add new update for empty group, and specified name and year', async () => {
            expect(await addUpdate('', 'A', 21, { '': 1, m: 2, d: 3 })).toBeTrue();
            expect(await UPDATES.count({})).toEqual(7);
            expect(await UPDATES.findOne({}, { _id: 0, time: 0 }).sort({ time: -1 })).toEqual({
                group: '',
                name: 'A',
                21: { '': -1, m: 2, d: 3 },
            });
        });

        it('add empty update for specified group, name, and year', async () => {
            expect(await addUpdate('G', 'A', 22, {})).toBeTrue();
            expect(await UPDATES.count({})).toEqual(7);
            expect(await UPDATES.findOne({}, { _id: 0, time: 0 }).sort({ time: -1 })).toEqual({
                group: 'G',
                name: 'A',
                22: { d: -1 },
            });
        });

        it('add null as update for specified name and year', async () => {
            expect(await addUpdate('', 'A', 21, null)).toBeTrue();
            expect(await UPDATES.count({})).toEqual(7);
            expect(await UPDATES.findOne({}, { _id: 0, time: 0 }).sort({ time: -1 })).toEqual({
                group: '',
                name: 'A',
                21: { '': -2 },
            });
        });

        it('do not add update if not changed', async () => {
            expect(await addUpdate('', 'A', 21, { '': 2 })).toBeFalse();
            expect(await UPDATES.count({})).toEqual(6);
        });

        it('do not add update if has nothing to update', async () => {
            expect(await addUpdate('G', 'A', 21, {})).toBeFalse();
            expect(await UPDATES.count({})).toEqual(6);
        });
    });

    describe('renameUpdates', () => {
        it('rename updates', async () => {
            expect(await renameUpdates('G', 'A', 'Z')).toBeTrue();
            expect(await UPDATES.find({}, { _id: 0, group: 1, name: 1 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A' },
                { name: 'A' },
                { name: 'B' },
                { name: 'B' },
                { group: 'G', name: 'Z' },
                { group: 'G', name: 'Z' },
            ]);
        });

        it('rename updates for empty group', async () => {
            expect(await renameUpdates('', 'A', 'Z')).toBeTrue();
            expect(await UPDATES.find({}, { _id: 0, group: 1, name: 1 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'B' },
                { name: 'B' },
                { name: 'Z' },
                { name: 'Z' },
                { group: 'G', name: 'A' },
                { group: 'G', name: 'A' },
            ]);
        });

        it('do not rename if names are the same', async () => {
            expect(await renameUpdates('G', 'A', 'A')).toBeFalse();
            expect(await UPDATES.find({}, { _id: 0, group: 1, name: 1 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A' },
                { name: 'A' },
                { name: 'B' },
                { name: 'B' },
                { group: 'G', name: 'A' },
                { group: 'G', name: 'A' },
            ]);
        });

        it('do not rename if name not found', async () => {
            expect(await renameUpdates('G', 'C', 'Z')).toBeFalse();
            expect(await UPDATES.find({}, { _id: 0, group: 1, name: 1 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A' },
                { name: 'A' },
                { name: 'B' },
                { name: 'B' },
                { group: 'G', name: 'A' },
                { group: 'G', name: 'A' },
            ]);
        });

        it('do not rename if group not found', async () => {
            expect(await renameUpdates('H', 'A', 'Z')).toBeFalse();
            expect(await UPDATES.find({}, { _id: 0, group: 1, name: 1 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A' },
                { name: 'A' },
                { name: 'B' },
                { name: 'B' },
                { group: 'G', name: 'A' },
                { group: 'G', name: 'A' },
            ]);
        });
    });

    describe('removeUpdates', () => {
        it('remove updates', async () => {
            expect(await removeUpdates('G', 'A')).toBeTrue();
            expect(await UPDATES.find({}, { _id: 0, group: 1, name: 1 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A' },
                { name: 'A' },
                { name: 'B' },
                { name: 'B' },
            ]);
        });

        it('remove updates for empty group', async () => {
            expect(await removeUpdates('', 'B')).toBeTrue();
            expect(await UPDATES.find({}, { _id: 0, group: 1, name: 1 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A' },
                { name: 'A' },
                { group: 'G', name: 'A' },
                { group: 'G', name: 'A' },
            ]);
        });

        it('do not remove if name not found', async () => {
            expect(await removeUpdates('G', 'Z')).toBeFalse();
            expect(await UPDATES.count({})).toEqual(6);
        });

        it('do not remove if group not found', async () => {
            expect(await removeUpdates('H', 'A')).toBeFalse();
            expect(await UPDATES.count({})).toEqual(6);
        });
    });

    describe('removeUpdatesGroup', () => {
        it('remove updates', async () => {
            expect(await removeUpdatesGroup('G')).toBeTrue();
            expect(await UPDATES.find({}, { _id: 0, group: 1, name: 1 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A' },
                { name: 'A' },
                { name: 'B' },
                { name: 'B' },
            ]);
        });

        it('remove update for empty group', async () => {
            expect(await removeUpdatesGroup('')).toBeTrue();
            expect(await UPDATES.find({}, { _id: 0, group: 1, name: 1 }).sort({ group: 1, name: 1 })).toEqual([
                { group: 'G', name: 'A' },
                { group: 'G', name: 'A' },
            ]);
        });

        it('do not remove if group not found', async () => {
            expect(await removeUpdatesGroup('H')).toBeFalse();
            expect(await UPDATES.count({})).toEqual(6);
        });
    });

    describe('moveUpdates', () => {
        it('move updates', async () => {
            expect(await moveUpdates('G', 'A', 'H')).toBeTrue();
            expect(await UPDATES.find({}, { _id: 0, group: 1, name: 1 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A' },
                { name: 'A' },
                { name: 'B' },
                { name: 'B' },
                { group: 'H', name: 'A' },
                { group: 'H', name: 'A' },
            ]);
        });

        it('move updates from empty group', async () => {
            expect(await moveUpdates('', 'A', 'H')).toBeTrue();
            expect(await UPDATES.find({}, { _id: 0, group: 1, name: 1 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'B' },
                { name: 'B' },
                { group: 'G', name: 'A' },
                { group: 'G', name: 'A' },
                { group: 'H', name: 'A' },
                { group: 'H', name: 'A' },
            ]);
        });

        it('do not move if name not found', async () => {
            expect(await moveUpdates('G', 'B', 'H')).toBeFalse();
            expect(await UPDATES.find({}, { _id: 0, group: 1, name: 1 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A' },
                { name: 'A' },
                { name: 'B' },
                { name: 'B' },
                { group: 'G', name: 'A' },
                { group: 'G', name: 'A' },
            ]);
        });

        it('do not move if group not found', async () => {
            expect(await moveUpdates('H', 'A', 'J')).toBeFalse();
            expect(await UPDATES.find({}, { _id: 0, group: 1, name: 1 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A' },
                { name: 'A' },
                { name: 'B' },
                { name: 'B' },
                { group: 'G', name: 'A' },
                { group: 'G', name: 'A' },
            ]);
        });

        it('do not move if groups are the same', async () => {
            expect(await moveUpdates('G', 'A', 'G')).toBeFalse();
            expect(await UPDATES.find({}, { _id: 0, group: 1, name: 1 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A' },
                { name: 'A' },
                { name: 'B' },
                { name: 'B' },
                { group: 'G', name: 'A' },
                { group: 'G', name: 'A' },
            ]);
        });

        it('do not move if name already exists in target group', async () => {
            expect(await moveUpdates('', 'A', 'G')).toBeFalse();
            expect(await UPDATES.find({}, { _id: 0, group: 1, name: 1 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A' },
                { name: 'A' },
                { name: 'B' },
                { name: 'B' },
                { group: 'G', name: 'A' },
                { group: 'G', name: 'A' },
            ]);
        });
    });
});
