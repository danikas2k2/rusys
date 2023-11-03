import { getRemoving, removeRemoving, renameRemoving, setRemoving } from '~/server/data/removing';
import { getYears } from '~/server/data/years';
import { REMOVING } from '~/server/db';

jest.mock('~/server/db');
jest.mock('~/server/data/years');
jest.mock('~/server/data/updates', () => ({
    addUpdates: jest.fn(),
    addUpdate: jest.fn(),
}));

describe('removing', () => {
    beforeEach(async () => {
        await REMOVING.insertMany([{ name: 'A', 21: true }, { name: 'B', 22: true }, { name: 'C' }]);
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await REMOVING.deleteMany({}, {});
    });

    describe('getRemoving', () => {
        it('return removing for specified years', async () => {
            expect(await getRemoving(getYears())).toEqual({
                A: { 21: true },
                B: { 22: true },
            });
        });
    });

    describe('setRemoving', () => {
        it('set removing for specified name and year', async () => {
            expect(await setRemoving('A', 22, true)).toEqual({
                A: { 21: true, 22: true },
                B: { 22: true },
            });
        });

        it('set not removing for specified name and year', async () => {
            expect(await setRemoving('A', 21, false)).toEqual({
                B: { 22: true },
            });
        });
    });

    describe('renameRemoving', () => {
        it('change removing name', async () => {
            expect(await renameRemoving('A', 'Z')).toBeTrue();
            expect(await getRemoving(getYears())).toEqual({
                B: { 22: true },
                Z: { 21: true },
            });
        });

        it('return false if no removing was changed', async () => {
            expect(await renameRemoving('Z', 'A')).toBeFalse();
            expect(await getRemoving(getYears())).toEqual({
                A: { 21: true },
                B: { 22: true },
            });
        });
    });

    describe('removeRemoving', () => {
        it('remove removing by name', async () => {
            expect(await removeRemoving('A')).toBeTrue();
            expect(await getRemoving(getYears())).toEqual({
                B: { 22: true },
            });
        });

        it('return false if no removing was removed', async () => {
            expect(await removeRemoving('Z')).toBeFalse();
            expect(await getRemoving(getYears())).toEqual({
                A: { 21: true },
                B: { 22: true },
            });
        });
    });
});
