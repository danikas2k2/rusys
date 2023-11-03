import { getDetails, removeDetails, renameDetails, setDetails, updateDetails } from '~/server/data/details';
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
        ]);
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await DETAILS.deleteMany({}, {});
    });

    describe('getDetails', () => {
        it('return details for specified years', async () => {
            expect(await getDetails(getYears())).toEqual({
                A: { 21: { '': 2 } },
                B: { 22: { '': 1 } },
            });
        });
    });

    describe('setDetails', () => {
        it('set new details for specified name', async () => {
            expect(await setDetails('A', { 21: { '': 1 }, 22: { d: 2 } })).toEqual({
                A: { 21: { '': 1 }, 22: { d: 2 } },
                B: { 22: { '': 1 } },
            });

            expect(addUpdate).not.toHaveBeenCalled();
            expect(addUpdates).toHaveBeenCalledTimes(1);
            expect(addUpdates).toHaveBeenCalledWith('A', { 21: { '': 1 }, 22: { d: 2 } });
        });

        it('set new details for specified name without history', async () => {
            expect(await setDetails('A', { 21: { '': 1 }, 22: { d: 2 } }, true)).toEqual({
                A: { 21: { '': 1 }, 22: { d: 2 } },
                B: { 22: { '': 1 } },
            });

            expect(addUpdate).not.toHaveBeenCalled();
            expect(addUpdates).not.toHaveBeenCalled();
        });

        it('set no details for specified name', async () => {
            expect(await setDetails('A')).toEqual({
                A: {},
                B: { 22: { '': 1 } },
            });

            expect(addUpdate).not.toHaveBeenCalled();
            expect(addUpdates).toHaveBeenCalledTimes(1);
            expect(addUpdates).toHaveBeenCalledWith('A', undefined);
        });
    });

    describe('updateDetails', () => {
        it('update details for specified name and year', async () => {
            expect(await updateDetails('A', 22, { '': 1, m: 2, d: 3 })).toEqual({
                A: { 21: { '': 2 }, 22: { '': 1, m: 2, d: 3 } },
                B: { 22: { '': 1 } },
            });

            expect(addUpdates).not.toHaveBeenCalled();
            expect(addUpdate).toHaveBeenCalledTimes(1);
            expect(addUpdate).toHaveBeenCalledWith('A', 22, { '': 1, m: 2, d: 3 });
        });

        it('update details for specified name and year without history', async () => {
            expect(await updateDetails('A', 22, { '': 1, m: 2, d: 3 }, true)).toEqual({
                A: { 21: { '': 2 }, 22: { '': 1, m: 2, d: 3 } },
                B: { 22: { '': 1 } },
            });

            expect(addUpdates).not.toHaveBeenCalled();
            expect(addUpdate).not.toHaveBeenCalled();
        });

        it('update details for specified name and year without value', async () => {
            expect(await updateDetails('A', 21)).toEqual({
                A: {},
                B: { 22: { '': 1 } },
            });

            expect(addUpdates).not.toHaveBeenCalled();
            expect(addUpdate).toHaveBeenCalledTimes(1);
            expect(addUpdate).toHaveBeenCalledWith('A', 21, undefined);
        });

        it('update details for specified name without year and value', async () => {
            expect(await updateDetails('A')).toEqual({
                A: {},
                B: { 22: { '': 1 } },
            });

            expect(addUpdates).not.toHaveBeenCalled();
            expect(addUpdate).not.toHaveBeenCalled();
        });
    });

    describe('renameDetails', () => {
        it('change details name', async () => {
            expect(await renameDetails('A', 'Z')).toBeTrue();
            expect(await getDetails(getYears())).toEqual({
                B: { 22: { '': 1 } },
                Z: { 21: { '': 2 } },
            });
        });

        it('return false if no details was changed', async () => {
            expect(await renameDetails('Z', 'A')).toBeFalse();
            expect(await getDetails(getYears())).toEqual({
                A: { 21: { '': 2 } },
                B: { 22: { '': 1 } },
            });
        });
    });

    describe('removeDetails', () => {
        it('remove details by name', async () => {
            expect(await removeDetails('A')).toBeTrue();
            expect(await getDetails(getYears())).toEqual({
                B: { 22: { '': 1 } },
            });
        });

        it('return false if no details was removed', async () => {
            expect(await removeDetails('Z')).toBeFalse();
            expect(await getDetails(getYears())).toEqual({
                A: { 21: { '': 2 } },
                B: { 22: { '': 1 } },
            });
        });
    });
});
