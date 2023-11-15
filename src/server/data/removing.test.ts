import {
    getRemoving,
    moveRemoving,
    removeRemoving,
    removeRemovingGroup,
    renameRemoving,
    renameRemovingGroup,
    setRemoving,
} from '~/server/data/removing';
import { getYears } from '~/server/data/years';
import { REMOVING } from '~/server/db';

jest.mock('~/server/db');
jest.mock('~/server/data/years');

// TODO refactor db structure to store removing state inside the details document

describe('removing', () => {
    beforeEach(async () => {
        await REMOVING.insertMany([
            { name: 'A', 21: true },
            { name: 'B', 22: true },
            { name: 'C' },
            { group: 'G', name: 'A', 22: true },
        ]);
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await REMOVING.deleteMany({}, {});
    });

    describe('getRemoving', () => {
        it('return removing for specified years', async () => {
            expect(await getRemoving(getYears())).toEqual({
                '': {
                    A: { 21: true },
                    B: { 22: true },
                },
                G: {
                    A: { 22: true },
                },
            });
        });
    });

    describe('setRemoving', () => {
        it('set removing by group, name, and year', async () => {
            expect(await setRemoving('G', 'A', 21, true)).toBeTrue();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'A', 21: true, 22: true },
            ]);
        });

        it('set removing by empty group, name, and year', async () => {
            expect(await setRemoving('', 'A', 22, true)).toBeTrue();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true, 22: true },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'A', 22: true },
            ]);
        });

        it('set not removing by group, name, and year', async () => {
            expect(await setRemoving('G', 'A', 22, false)).toBeTrue();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'A' },
            ]);
        });

        it('set not removing by empty group, name, and year', async () => {
            expect(await setRemoving('', 'A', 21, false)).toBeTrue();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A' },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'A', 22: true },
            ]);
        });

        it('do nothing if year not found', async () => {
            expect(await setRemoving('G', 'A', 21, false)).toBeFalse();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'A', 22: true },
            ]);
        });

        it('do nothing if name not found', async () => {
            expect(await setRemoving('G', 'Z', 22, false)).toBeFalse();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'A', 22: true },
            ]);
        });

        it('do nothing if group not found', async () => {
            expect(await setRemoving('H', 'A', 22, false)).toBeFalse();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'A', 22: true },
            ]);
        });
    });

    describe('renameRemoving', () => {
        it('rename item', async () => {
            expect(await renameRemoving('G', 'A', 'Z')).toBeTrue();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'Z', 22: true },
            ]);
        });

        it('rename item of empty group', async () => {
            expect(await renameRemoving('', 'A', 'Z')).toBeTrue();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'B', 22: true },
                { name: 'C' },
                { name: 'Z', 21: true },
                { group: 'G', name: 'A', 22: true },
            ]);
        });

        it('do not rename if names are the same', async () => {
            expect(await renameRemoving('G', 'A', 'A')).toBeFalse();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'A', 22: true },
            ]);
        });

        it('do not rename if name not found', async () => {
            expect(await renameRemoving('G', 'B', 'Z')).toBeFalse();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'A', 22: true },
            ]);
        });

        it('do not rename if group not found', async () => {
            expect(await renameRemoving('H', 'A', 'Z')).toBeFalse();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'A', 22: true },
            ]);
        });
    });

    describe('renameRemovingGroup', () => {
        it('rename item', async () => {
            expect(await renameRemovingGroup('G', 'H')).toBeTrue();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'H', name: 'A', 22: true },
            ]);
        });

        it('rename empty group', async () => {
            expect(await renameRemovingGroup('', 'H')).toBeTrue();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { group: 'G', name: 'A', 22: true },
                { group: 'H', name: 'A', 21: true },
                { group: 'H', name: 'B', 22: true },
                { group: 'H', name: 'C' },
            ]);
        });

        it('do not rename if group is the same', async () => {
            expect(await renameRemovingGroup('G', 'G')).toBeFalse();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'A', 22: true },
            ]);
        });

        it('do not rename if group not found', async () => {
            expect(await renameRemovingGroup('H', 'J')).toBeFalse();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'A', 22: true },
            ]);
        });
    });

    describe('removeRemoving', () => {
        it('remove item', async () => {
            expect(await removeRemoving('G', 'A')).toBeTrue();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
            ]);
        });

        it('remove item of empty group', async () => {
            expect(await removeRemoving('', 'A')).toBeTrue();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'A', 22: true },
            ]);
        });

        it('do not remove if name not found', async () => {
            expect(await removeRemoving('G', 'B')).toBeFalse();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'A', 22: true },
            ]);
        });

        it('do not remove if group not found', async () => {
            expect(await removeRemoving('H', 'A')).toBeFalse();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'A', 22: true },
            ]);
        });
    });

    describe('removeRemovingGroup', () => {
        it('remove group', async () => {
            expect(await removeRemovingGroup('G')).toBeTrue();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
            ]);
        });

        it('remove empty group', async () => {
            expect(await removeRemovingGroup('')).toBeTrue();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { group: 'G', name: 'A', 22: true },
            ]);
        });

        it('do not remove if group not found', async () => {
            expect(await removeRemovingGroup('H')).toBeFalse();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'A', 22: true },
            ]);
        });
    });

    describe('moveRemoving', () => {
        it('move item', async () => {
            expect(await moveRemoving('G', 'A', 'H')).toBeTrue();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'H', name: 'A', 22: true },
            ]);
        });

        it('move item from empty group', async () => {
            expect(await moveRemoving('', 'A', 'H')).toBeTrue();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'A', 22: true },
                { group: 'H', name: 'A', 21: true },
            ]);
        });

        it('do not move if name not found', async () => {
            expect(await moveRemoving('G', 'B', 'H')).toBeFalse();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'A', 22: true },
            ]);
        });

        it('do not move if group not found', async () => {
            expect(await moveRemoving('H', 'A', 'J')).toBeFalse();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'A', 22: true },
            ]);
        });

        it('do not move if groups are the same', async () => {
            expect(await moveRemoving('G', 'A', 'G')).toBeFalse();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'A', 22: true },
            ]);
        });

        it('do not move if name already exists in target group', async () => {
            expect(await moveRemoving('', 'A', 'G')).toBeFalse();
            expect(await REMOVING.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: true },
                { name: 'B', 22: true },
                { name: 'C' },
                { group: 'G', name: 'A', 22: true },
            ]);
        });
    });
});
