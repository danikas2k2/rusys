import { getMissing, removeMissing, renameMissing, setMissing } from '~/server/data/missing';
import { MISSING } from '~/server/db';

jest.mock('~/server/db');

describe('missing', () => {
    beforeEach(async () => {
        await MISSING.insertOne({
            missing: ['A', 'B'],
        });
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await MISSING.deleteOne({}, {});
    });

    describe('getMissing', () => {
        it('return current missing items', async () => {
            expect(await getMissing()).toEqual(['A', 'B']);
        });
    });

    describe('setMissing', () => {
        it('set new missing items', async () => {
            expect(await setMissing(['A', 'C'])).toEqual(['A', 'C']);
        });
    });

    describe('renameMissing', () => {
        it('change missing item name', async () => {
            expect(await renameMissing('A', 'Z')).toBeTrue();
            expect(await getMissing()).toEqual(['Z', 'B']);
        });

        it('return false if no missing was changed', async () => {
            expect(await renameMissing('Z', 'A')).toBeFalse();
            expect(await getMissing()).toEqual(['A', 'B']);
        });
    });

    describe('removeMissing', () => {
        it('remove missing by name', async () => {
            expect(await removeMissing('A')).toBeTrue();
            expect(await getMissing()).toEqual(['B']);
        });

        it('return zero if no missing was removed', async () => {
            expect(await removeMissing('Z')).toBeFalse();
            expect(await getMissing()).toEqual(['A', 'B']);
        });
    });
});
