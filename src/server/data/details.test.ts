import {
    getDetails,
    moveDetails,
    removeDetails,
    removeDetailsGroup,
    renameDetails,
    renameDetailsGroup,
    setDetails,
    updateDetails,
} from '~/server/data/details';
import { addUpdate, addUpdates } from '~/server/data/updates';
import { getYears } from '~/server/data/years';
import { DETAILS } from '~/server/db';

jest.mock('~/server/db');
jest.mock('~/server/data/years');
jest.mock('~/server/data/updates', () => ({
    addUpdates: jest.fn(),
    addUpdate: jest.fn(),
}));

describe('details', () => {
    beforeEach(async () => {
        await DETAILS.insertMany([
            { name: 'A', 21: { '': 2 } },
            { name: 'B', 22: { '': 1 } },
            { group: 'G', name: 'A', 22: { d: 1 } },
            { group: 'G', name: 'C', 21: { '': 2 } },
        ]);
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await DETAILS.deleteMany({}, {});
    });

    describe('getDetails', () => {
        it('return details for specified years', async () => {
            expect(await getDetails(getYears())).toEqual({
                '': {
                    A: { 21: { '': 2 } },
                    B: { 22: { '': 1 } },
                },
                G: {
                    A: { 22: { d: 1 } },
                    C: { 21: { '': 2 } },
                },
            });
        });
    });

    describe('setDetails', () => {
        it('set new details for empty group and specified name', async () => {
            expect(await setDetails('', 'A', { 21: { '': 1 }, 22: { d: 2 } })).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'B', 22: { '': 1 } },
                { group: '', name: 'A', 21: { '': 1 }, 22: { d: 2 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);

            expect(addUpdate).not.toHaveBeenCalled();
            expect(addUpdates).toHaveBeenCalledTimes(1);
            expect(addUpdates).toHaveBeenCalledWith('', 'A', { 21: { '': 1 }, 22: { d: 2 } });
        });

        it('set new details for specified group and name', async () => {
            expect(await setDetails('G', 'A', { 21: { '': 1 }, 22: { d: 2 } })).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 21: { '': 1 }, 22: { d: 2 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);

            expect(addUpdate).not.toHaveBeenCalled();
            expect(addUpdates).toHaveBeenCalledTimes(1);
            expect(addUpdates).toHaveBeenCalledWith('G', 'A', { 21: { '': 1 }, 22: { d: 2 } });
        });

        it('set new details for new group and specified name', async () => {
            expect(await setDetails('H', 'C', { 21: { '': 1 }, 22: { d: 2 } })).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
                { group: 'H', name: 'C', 21: { '': 1 }, 22: { d: 2 } },
            ]);

            expect(addUpdate).not.toHaveBeenCalled();
            expect(addUpdates).toHaveBeenCalledTimes(1);
            expect(addUpdates).toHaveBeenCalledWith('H', 'C', { 21: { '': 1 }, 22: { d: 2 } });
        });

        it('set new details for specified group and name without history', async () => {
            expect(await setDetails('G', 'A', { 21: { '': 1 }, 22: { d: 2 } }, true)).toBeTrue();
            expect(addUpdate).not.toHaveBeenCalled();
            expect(addUpdates).not.toHaveBeenCalled();
        });

        it('set no details for empty group and specified name', async () => {
            expect(await setDetails('', 'A')).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'B', 22: { '': 1 } },
                { group: '', name: 'A' },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
            expect(addUpdate).not.toHaveBeenCalled();
            expect(addUpdates).toHaveBeenCalledTimes(1);
            expect(addUpdates).toHaveBeenCalledWith('', 'A', undefined);
        });

        it('set no details for specified group and name', async () => {
            expect(await setDetails('G', 'A')).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A' },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
            expect(addUpdate).not.toHaveBeenCalled();
            expect(addUpdates).toHaveBeenCalledTimes(1);
            expect(addUpdates).toHaveBeenCalledWith('G', 'A', undefined);
        });

        it('set no details for new group and specified name', async () => {
            expect(await setDetails('H', 'A')).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
                { group: 'H', name: 'A' },
            ]);
            expect(addUpdate).not.toHaveBeenCalled();
            expect(addUpdates).toHaveBeenCalledTimes(1);
            expect(addUpdates).toHaveBeenCalledWith('H', 'A', undefined);
        });
    });

    describe('updateDetails', () => {
        it('update details for empty group and existing name and year', async () => {
            expect(await updateDetails('', 'A', 22, { '': 1, m: 2, d: 3 })).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 }, 22: { '': 1, m: 2, d: 3 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
            expect(addUpdates).not.toHaveBeenCalled();
            expect(addUpdate).toHaveBeenCalledTimes(1);
            expect(addUpdate).toHaveBeenCalledWith('', 'A', 22, { '': 1, m: 2, d: 3 });
        });

        it('update details for existing group, name, and year', async () => {
            expect(await updateDetails('G', 'A', 22, { '': 1, m: 2, d: 3 })).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { '': 1, m: 2, d: 3 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
            expect(addUpdates).not.toHaveBeenCalled();
            expect(addUpdate).toHaveBeenCalledTimes(1);
            expect(addUpdate).toHaveBeenCalledWith('G', 'A', 22, { '': 1, m: 2, d: 3 });
        });

        it('update details for existing group, name, and year without history', async () => {
            expect(await updateDetails('G', 'A', 22, { '': 1, m: 2, d: 3 }, true)).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { '': 1, m: 2, d: 3 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
            expect(addUpdates).not.toHaveBeenCalled();
            expect(addUpdate).not.toHaveBeenCalled();
        });

        it('update details for empty group, existing name and year without value', async () => {
            expect(await updateDetails('', 'A', 21)).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A' },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
            expect(addUpdates).not.toHaveBeenCalled();
            expect(addUpdate).toHaveBeenCalledTimes(1);
            expect(addUpdate).toHaveBeenCalledWith('', 'A', 21, undefined);
        });

        it('update details for empty group, existing name, and different year without value', async () => {
            expect(await updateDetails('', 'A', 22)).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
            expect(addUpdates).not.toHaveBeenCalled();
            expect(addUpdate).toHaveBeenCalledTimes(1);
            expect(addUpdate).toHaveBeenCalledWith('', 'A', 22, undefined);
        });

        it('update details for existing group and name and different year without value', async () => {
            expect(await updateDetails('G', 'A', 21)).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
            expect(addUpdates).not.toHaveBeenCalled();
            expect(addUpdate).toHaveBeenCalledTimes(1);
            expect(addUpdate).toHaveBeenCalledWith('G', 'A', 21, undefined);
        });

        it('update details for new group, existing name, and different year without value', async () => {
            expect(await updateDetails('H', 'A', 22)).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
                { group: 'H', name: 'A' },
            ]);
            expect(addUpdates).not.toHaveBeenCalled();
            expect(addUpdate).toHaveBeenCalledTimes(1);
            expect(addUpdate).toHaveBeenCalledWith('H', 'A', 22, undefined);
        });

        it('update details for existing group, name, and year without value', async () => {
            expect(await updateDetails('G', 'A', 22)).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A' },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
            expect(addUpdates).not.toHaveBeenCalled();
            expect(addUpdate).toHaveBeenCalledTimes(1);
            expect(addUpdate).toHaveBeenCalledWith('G', 'A', 22, undefined);
        });

        it('update details for empty group and existing name without year and value', async () => {
            expect(await updateDetails('', 'A')).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'B', 22: { '': 1 } },
                { group: '', name: 'A' },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
            expect(addUpdates).not.toHaveBeenCalled();
            expect(addUpdate).not.toHaveBeenCalled();
        });

        it('update details for existing group and name without year and value', async () => {
            expect(await updateDetails('G', 'A')).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A' },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
            expect(addUpdates).not.toHaveBeenCalled();
            expect(addUpdate).not.toHaveBeenCalled();
        });

        it('update details for new group and existing name without year and value', async () => {
            expect(await updateDetails('H', 'A')).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
                { group: 'H', name: 'A' },
            ]);
            expect(addUpdates).not.toHaveBeenCalled();
            expect(addUpdate).not.toHaveBeenCalled();
        });
    });

    describe('renameDetails', () => {
        it('rename details', async () => {
            expect(await renameDetails('G', 'A', 'Z')).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
                { group: 'G', name: 'Z', 22: { d: 1 } },
            ]);
        });

        it('rename details for empty group', async () => {
            expect(await renameDetails('', 'A', 'Z')).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'B', 22: { '': 1 } },
                { name: 'Z', 21: { '': 2 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
        });

        it('do not rename if name not found', async () => {
            expect(await renameDetails('G', 'B', 'Z')).toBeFalse();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
        });

        it('do not rename if group not found', async () => {
            expect(await renameDetails('H', 'A', 'Z')).toBeFalse();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
        });

        it('do not rename if names are the same', async () => {
            expect(await renameDetails('', 'A', 'A')).toBeFalse();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
        });
    });

    describe('renameDetailsGroup', () => {
        it('rename details group', async () => {
            expect(await renameDetailsGroup('G', 'H')).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'H', name: 'A', 22: { d: 1 } },
                { group: 'H', name: 'C', 21: { '': 2 } },
            ]);
        });

        it('rename empty group', async () => {
            expect(await renameDetailsGroup('', 'H')).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
                { group: 'H', name: 'A', 21: { '': 2 } },
                { group: 'H', name: 'B', 22: { '': 1 } },
            ]);
        });

        it('do not rename if group not found', async () => {
            expect(await renameDetailsGroup('H', 'J')).toBeFalse();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
        });

        it('do not rename if group is the same', async () => {
            expect(await renameDetailsGroup('G', 'G')).toBeFalse();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
        });

        it('do not rename if group is the same and empty', async () => {
            expect(await renameDetailsGroup('', '')).toBeFalse();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
        });
    });

    describe('removeDetails', () => {
        it('remove details', async () => {
            expect(await removeDetails('G', 'A')).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
        });

        it('remove details from empty group', async () => {
            expect(await removeDetails('', 'A')).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
        });

        it('do not remove if group not found', async () => {
            expect(await removeDetails('H', 'A')).toBeFalse();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
        });

        it('do not remove if name not found', async () => {
            expect(await removeDetails('G', 'B')).toBeFalse();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
        });
    });

    describe('removeDetailsGroup', () => {
        it('remove details by group', async () => {
            expect(await removeDetailsGroup('G')).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
            ]);
        });

        it('remove details by empty group', async () => {
            expect(await removeDetailsGroup('')).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
        });

        it('do not remove if group not found', async () => {
            expect(await removeDetailsGroup('H')).toBeFalse();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
        });
    });

    describe('moveDetails', () => {
        it('move details', async () => {
            expect(await moveDetails('G', 'A', 'H')).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
                { group: 'H', name: 'A', 22: { d: 1 } },
            ]);
        });

        it('move details from empty group', async () => {
            expect(await moveDetails('', 'A', 'H')).toBeTrue();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
                { group: 'H', name: 'A', 21: { '': 2 } },
            ]);
        });

        it('do not move if name not found', async () => {
            expect(await moveDetails('G', 'B', 'H')).toBeFalse();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
        });

        it('do not move if group not found', async () => {
            expect(await moveDetails('H', 'A', 'J')).toBeFalse();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
        });

        it('do not move if groups are the same', async () => {
            expect(await moveDetails('G', 'A', 'G')).toBeFalse();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
        });

        it('do not move if name already exists in target group', async () => {
            expect(await moveDetails('', 'A', 'G')).toBeFalse();
            expect(await DETAILS.find({}, { _id: 0 }).sort({ group: 1, name: 1 })).toEqual([
                { name: 'A', 21: { '': 2 } },
                { name: 'B', 22: { '': 1 } },
                { group: 'G', name: 'A', 22: { d: 1 } },
                { group: 'G', name: 'C', 21: { '': 2 } },
            ]);
        });
    });
});
