/** @jest-environment node */
import { getTestVariants } from '~/tests/fixtures';
import {
    deleteVariant,
    deleteVariantsGroup,
    getVariants,
    renameVariant,
    renameVariantsGroup,
    setGroupVariants,
    setVariants,
    updateVariant,
} from '~/server/data/variants';
import { getVariantsCollection } from '~/server/db';

jest.mock('~/server/db');
jest.mock('~/server/data/years');

describe('variants', () => {
    jest.setTimeout(30_000);

    beforeEach(async () => {
        await (await getVariantsCollection()).insertMany(getTestVariants());
    });

    afterEach(async () => {
        await (await getVariantsCollection()).deleteMany();
        jest.clearAllMocks();
    });

    const testVariants = getTestVariants();

    describe('getVariants', () => {
        it('returns variants sorted by group and order', async () => {
            expect(await getVariants()).toEqual(testVariants);
        });
    });

    describe('setVariants', () => {
        it('sets new variants', async () => {
            expect(await setVariants([{ group: 'J', variant: 'D', order: 0, short: 'DD' }])).toBeTrue();
            expect(await getVariants()).toEqual([{ group: 'J', variant: 'D', order: 0, short: 'DD' }]);
        });

        it('sets empty variants', async () => {
            expect(await setVariants([])).toBeTrue();
            expect(await getVariants()).toEqual([]);
        });
    });

    describe('setGroupVariants', () => {
        it('sets new variants', async () => {
            expect(
                await setGroupVariants('', [
                    { variant: 'B', order: 0, long: 'bb' },
                    { variant: 'D', order: 1, short: 'DD' },
                ])
            ).toBeTrue();
            expect(await getVariants()).toEqual([
                { group: 'J', variant: 'B', order: 0, long: 'bb' },
                { group: 'J', variant: 'D', order: 1, short: 'DD' },
                ...testVariants.filter((v) => v.group !== ''),
            ]);
        });

        it('sets empty variants', async () => {
            expect(await setGroupVariants('', [])).toBeTrue();
            expect(await getVariants()).toEqual(testVariants.filter((v) => v.group !== ''));
        });

        it('sets new group variants', async () => {
            expect(await setGroupVariants('X', [{ variant: 'D', order: 0, short: 'DD' }])).toBeTrue();
            expect(await getVariants()).toEqual([...testVariants, { group: 'X', variant: 'D', order: 0, short: 'DD' }]);
        });
    });

    describe('updateVariant', () => {
        it('updates variant by changing order, long and title', async () => {
            expect(await updateVariant('', '', { order: 0, long: 'aa', short: 'AA' })).toBeTrue();
            expect(await getVariants()).toEqual([
                { ...testVariants[0], order: 0, long: 'aa', short: 'AA' },
                ...testVariants.slice(1),
            ]);
        });

        it('updates variant by changing order and long', async () => {
            expect(await updateVariant('', '', { order: 0, long: 'aa' })).toBeTrue();
            expect(await getVariants()).toEqual([
                { ...testVariants[0], order: 0, long: 'aa' },
                ...testVariants.slice(1),
            ]);
        });

        it('updates variant by changing order only', async () => {
            expect(await updateVariant('', 'd', { order: 0 })).toBeTrue();
            expect(await getVariants()).toEqual([
                testVariants[0],
                { group: 'J', variant: 'd', order: 0 },
                ...testVariants.slice(2),
            ]);
        });

        it('updates variant by changing title only', async () => {
            expect(await updateVariant('', 'd', { order: 1, short: 'D.' })).toBeTrue();
            expect(await getVariants()).toEqual([
                testVariants[0],
                { group: 'J', variant: 'd', order: 1, short: 'D.' },
                ...testVariants.slice(2),
            ]);
        });

        it('updates variant by changing long only', async () => {
            expect(await updateVariant('', 'd', { order: 1, long: '0.75 l' })).toBeTrue();
            expect(await getVariants()).toEqual([
                testVariants[0],
                { group: 'J', variant: 'd', order: 1, long: '0.75 l' },
                ...testVariants.slice(2),
            ]);
        });

        it('does not update variant when nothing changes', async () => {
            expect(await updateVariant('', 'm', { order: 2, long: '250 ml.', short: 'M.' })).toBeFalse();
            expect(await getVariants()).toEqual(testVariants);
        });

        it('adds new variant with same order', async () => {
            expect(await updateVariant('', 'z', { order: 3, long: '250 ml.', short: 'M.' })).toBeTrue();
            expect(await getVariants()).toEqual([
                ...testVariants.slice(0, 4),
                { group: 'J', variant: 'z', order: 3, long: '250 ml.', short: 'M.' },
                ...testVariants.slice(4),
            ]);
        });

        it('adds new variant with new group', async () => {
            expect(await updateVariant('H', 'm', { order: 3, long: '250 ml.', short: 'M.' })).toBeTrue();
            expect(await getVariants()).toEqual([
                ...testVariants,
                { group: 'H', variant: 'm', order: 3, long: '250 ml.', short: 'M.' },
            ]);
        });
    });

    describe('renameVariant', () => {
        it('renames variant', async () => {
            expect(await renameVariant('G', '', '2')).toBeTrue();
            expect(await getVariants()).toEqual([
                ...testVariants.slice(0, 6),
                { ...testVariants[6], variant: '2' },
                ...testVariants.slice(7),
            ]);
        });

        it('renames variant of empty group', async () => {
            expect(await renameVariant('', 'd', '3/4')).toBeTrue();
            expect(await getVariants()).toEqual([
                testVariants[0],
                { ...testVariants[1], variant: '3/4' },
                ...testVariants.slice(2),
            ]);
        });

        it('does not rename if names are the same', async () => {
            expect(await renameVariant('G', '', '')).toBeFalse();
            expect(await getVariants()).toEqual(testVariants);
        });

        it('does not rename if name not found', async () => {
            expect(await renameVariant('G', '1/4', 'm')).toBeFalse();
            expect(await getVariants()).toEqual(testVariants);
        });

        it('does not rename if group not found', async () => {
            expect(await renameVariant('H', '', '1/2')).toBeFalse();
            expect(await getVariants()).toEqual(testVariants);
        });
    });

    describe('renameVariantsGroup', () => {
        it('renames variant group', async () => {
            expect(await renameVariantsGroup('G', 'H')).toBeTrue();
            expect(await getVariants()).toEqual([
                ...testVariants.slice(0, 5),
                ...testVariants.slice(5).map((v) => ({ ...v, group: 'H' })),
            ]);
        });

        it('renames empty group', async () => {
            expect(await renameVariantsGroup('', 'H')).toBeTrue();
            expect(await getVariants()).toEqual([
                ...testVariants.slice(5),
                ...testVariants.slice(0, 5).map((v) => ({ ...v, group: 'H' })),
            ]);
        });

        it('does not rename if group is the same', async () => {
            expect(await renameVariantsGroup('G', 'G')).toBeFalse();
            expect(await getVariants()).toEqual(testVariants);
        });

        it('does not rename if group not found', async () => {
            expect(await renameVariantsGroup('H', 'G')).toBeFalse();
            expect(await getVariants()).toEqual(testVariants);
        });
    });

    describe('deleteVariant', () => {
        it('deletes variant', async () => {
            expect(await deleteVariant('G', '')).toBeTrue();
            expect(await getVariants()).toEqual([...testVariants.slice(0, 6), ...testVariants.slice(7)]);
        });

        it('deletes variant of empty group', async () => {
            expect(await deleteVariant('', '')).toBeTrue();
            expect(await getVariants()).toEqual(testVariants.slice(1));
        });

        it('does not delete if name not found', async () => {
            expect(await deleteVariant('G', 'z')).toBeFalse();
            expect(await getVariants()).toEqual(testVariants);
        });

        it('does not delete if group not found', async () => {
            expect(await deleteVariant('H', '')).toBeFalse();
            expect(await getVariants()).toEqual(testVariants);
        });
    });

    describe('deleteVariantsGroup', () => {
        it('deletes group', async () => {
            expect(await deleteVariantsGroup('G')).toBeTrue();
            expect(await getVariants()).toEqual(testVariants.slice(0, 5));
        });

        it('deletes empty group', async () => {
            expect(await deleteVariantsGroup('')).toBeTrue();
            expect(await getVariants()).toEqual(testVariants.slice(5));
        });

        it('does not delete if group not found', async () => {
            expect(await deleteVariantsGroup('H')).toBeFalse();
            expect(await getVariants()).toEqual(testVariants);
        });
    });
});
