import {
    getMissing,
    moveMissing,
    removeMissing,
    removeMissingGroup,
    renameMissing,
    renameMissingGroup,
    setMissing,
} from '~/server/data/missing';
import { MISSING } from '~/server/db';

jest.mock('~/server/db');

describe('missing', () => {
    beforeEach(async () => {
        await MISSING.insertOne({
            missing: ['A', 'B', { group: '', name: 'C' }, { group: 'G', name: 'A' }],
        });
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await MISSING.deleteOne({}, {});
    });

    describe('getMissing', () => {
        it('return current missing items', async () => {
            expect(await getMissing()).toEqual([
                { group: '', name: 'A' },
                { group: '', name: 'B' },
                { group: '', name: 'C' },
                { group: 'G', name: 'A' },
            ]);
        });
    });

    describe('setMissing', () => {
        it('set new missing items', async () => {
            expect(await setMissing(['A', 'C'])).toBeTrue();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: [
                    { group: '', name: 'A' },
                    { group: '', name: 'C' },
                ],
            });
        });
    });

    describe('renameMissing', () => {
        it('rename item', async () => {
            expect(await renameMissing('G', 'A', 'Z')).toBeTrue();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: [
                    { group: '', name: 'A' },
                    { group: '', name: 'B' },
                    { group: '', name: 'C' },
                    { group: 'G', name: 'Z' },
                ],
            });
        });

        it('rename item of empty group', async () => {
            expect(await renameMissing('', 'A', 'Z')).toBeTrue();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: [
                    { group: '', name: 'B' },
                    { group: '', name: 'C' },
                    { group: '', name: 'Z' },
                    { group: 'G', name: 'A' },
                ],
            });
        });

        it('do not rename if names are the same', async () => {
            expect(await renameMissing('G', 'A', 'A')).toBeFalse();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: ['A', 'B', { group: '', name: 'C' }, { group: 'G', name: 'A' }],
            });
        });

        it('do not rename if name not found', async () => {
            expect(await renameMissing('G', 'C', 'Z')).toBeFalse();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: ['A', 'B', { group: '', name: 'C' }, { group: 'G', name: 'A' }],
            });
        });

        it('do not rename if group not found', async () => {
            expect(await renameMissing('H', 'A', 'Z')).toBeFalse();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: ['A', 'B', { group: '', name: 'C' }, { group: 'G', name: 'A' }],
            });
        });
    });

    describe('renameMissingGroup', () => {
        it('rename group', async () => {
            expect(await renameMissingGroup('G', 'H')).toBeTrue();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: [
                    { group: '', name: 'A' },
                    { group: '', name: 'B' },
                    { group: '', name: 'C' },
                    { group: 'H', name: 'A' },
                ],
            });
        });

        it('rename empty group', async () => {
            expect(await renameMissingGroup('', 'H')).toBeTrue();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: [
                    { group: 'G', name: 'A' },
                    { group: 'H', name: 'A' },
                    { group: 'H', name: 'B' },
                    { group: 'H', name: 'C' },
                ],
            });
        });

        it('do not rename if group is the same', async () => {
            expect(await renameMissingGroup('G', 'G')).toBeFalse();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: ['A', 'B', { group: '', name: 'C' }, { group: 'G', name: 'A' }],
            });
        });

        it('do not rename if group not found', async () => {
            expect(await renameMissingGroup('H', 'Z')).toBeFalse();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: ['A', 'B', { group: '', name: 'C' }, { group: 'G', name: 'A' }],
            });
        });
    });

    describe('removeMissing', () => {
        it('remove item', async () => {
            expect(await removeMissing('G', 'A')).toBeTrue();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: [
                    { group: '', name: 'A' },
                    { group: '', name: 'B' },
                    { group: '', name: 'C' },
                ],
            });
        });

        it('remove item from empty group', async () => {
            expect(await removeMissing('', 'A')).toBeTrue();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: [
                    { group: '', name: 'B' },
                    { group: '', name: 'C' },
                    { group: 'G', name: 'A' },
                ],
            });
        });

        it('do not remove if name not found', async () => {
            expect(await removeMissing('G', 'Z')).toBeFalse();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: ['A', 'B', { group: '', name: 'C' }, { group: 'G', name: 'A' }],
            });
        });

        it('do not remove if group not found', async () => {
            expect(await removeMissing('H', 'A')).toBeFalse();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: ['A', 'B', { group: '', name: 'C' }, { group: 'G', name: 'A' }],
            });
        });
    });

    describe('removeMissingGroup', () => {
        it('remove group', async () => {
            expect(await removeMissingGroup('G')).toBeTrue();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: [
                    { group: '', name: 'A' },
                    { group: '', name: 'B' },
                    { group: '', name: 'C' },
                ],
            });
        });

        it('remove empty group', async () => {
            expect(await removeMissingGroup('')).toBeTrue();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: [{ group: 'G', name: 'A' }],
            });
        });

        it('do not remove if group not found', async () => {
            expect(await removeMissingGroup('H')).toBeFalse();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: ['A', 'B', { group: '', name: 'C' }, { group: 'G', name: 'A' }],
            });
        });
    });

    describe('moveMissing', () => {
        it('move item', async () => {
            expect(await moveMissing('G', 'A', 'H')).toBeTrue();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: [
                    { group: '', name: 'A' },
                    { group: '', name: 'B' },
                    { group: '', name: 'C' },
                    { group: 'H', name: 'A' },
                ],
            });
        });

        it('move item from empty group', async () => {
            expect(await moveMissing('', 'A', 'H')).toBeTrue();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: [
                    { group: '', name: 'B' },
                    { group: '', name: 'C' },
                    { group: 'G', name: 'A' },
                    { group: 'H', name: 'A' },
                ],
            });
        });

        it('do not move if name not found', async () => {
            expect(await moveMissing('G', 'B', 'H')).toBeFalse();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: ['A', 'B', { group: '', name: 'C' }, { group: 'G', name: 'A' }],
            });
        });

        it('do not move if group not found', async () => {
            expect(await moveMissing('H', 'A', 'J')).toBeFalse();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: ['A', 'B', { group: '', name: 'C' }, { group: 'G', name: 'A' }],
            });
        });

        it('do not move if groups are the same', async () => {
            expect(await moveMissing('G', 'A', 'G')).toBeFalse();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: ['A', 'B', { group: '', name: 'C' }, { group: 'G', name: 'A' }],
            });
        });

        it('do not move if name already exists in target group', async () => {
            expect(await moveMissing('', 'A', 'G')).toBeFalse();
            expect(await MISSING.findOne({}, { _id: 0 })).toEqual({
                missing: ['A', 'B', { group: '', name: 'C' }, { group: 'G', name: 'A' }],
            });
        });
    });
});
