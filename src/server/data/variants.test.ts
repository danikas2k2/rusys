/** @jest-environment node */
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
import { getVariantsFixture } from '~/tests/fixtures';

jest.mock('~/server/db');
jest.mock('~/server/data/years');

describe('variants', () => {
    jest.setTimeout(30_000);

    beforeEach(async () => {
        await (await getVariantsCollection()).insertMany(getVariantsFixture());
    });

    afterEach(async () => {
        await (await getVariantsCollection()).deleteMany();
        jest.clearAllMocks();
    });

    const variants = getVariantsFixture().sort((a, b) => a.group.localeCompare(b.group) || a.order - b.order);

    describe('getVariants', () => {
        it('returns variants sorted by group and order', async () => {
            expect(await getVariants()).toEqual(variants);
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
                await setGroupVariants('J', [
                    { variant: 'B', order: 0, long: 'bb' },
                    { variant: 'D', order: 1, short: 'DD' },
                ])
            ).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 5),
                { group: 'J', variant: 'B', order: 0, long: 'bb' },
                { group: 'J', variant: 'D', order: 1, short: 'DD' },
            ]);
        });

        it('sets empty variants', async () => {
            expect(await setGroupVariants('J', [])).toBeTrue();
            expect(await getVariants()).toEqual(variants.slice(0, 5));
        });

        it('sets new group variants', async () => {
            expect(await setGroupVariants('X', [{ variant: 'D', order: 0, short: 'DD' }])).toBeTrue();
            expect(await getVariants()).toEqual([...variants, { group: 'X', variant: 'D', order: 0, short: 'DD' }]);
        });
    });

    describe('updateVariant', () => {
        it('updates variant by changing order, long and title', async () => {
            expect(await updateVariant('J', 'p', { order: 0, long: 'aa', short: 'AA' })).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 5),
                { ...variants[5], order: 0, long: 'aa', short: 'AA' },
                ...variants.slice(6),
            ]);
        });

        it('updates variant by changing order and long', async () => {
            expect(await updateVariant('J', 'p', { order: 0, long: 'aa' })).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 5),
                { ...variants[5], order: 0, long: 'aa' },
                ...variants.slice(6),
            ]);
        });

        it('updates variant by changing order only', async () => {
            expect(await updateVariant('J', 'd', { order: 0 })).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 6),
                { group: 'J', variant: 'd', order: 0 },
                ...variants.slice(7),
            ]);
        });

        it('updates variant by changing title only', async () => {
            expect(await updateVariant('J', 'd', { order: 1, short: 'D.' })).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 6),
                { group: 'J', variant: 'd', order: 1, short: 'D.' },
                ...variants.slice(7),
            ]);
        });

        it('updates variant by changing long only', async () => {
            expect(await updateVariant('J', 'd', { order: 1, long: '0.75 l' })).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 6),
                { group: 'J', variant: 'd', order: 1, long: '0.75 l' },
                ...variants.slice(7),
            ]);
        });

        it('does not update variant when nothing changes', async () => {
            expect(await updateVariant('J', 'm', { order: 2, long: '250 ml.', short: 'M.' })).toBeFalse();
            expect(await getVariants()).toEqual(variants);
        });

        it('adds new variant with same order', async () => {
            expect(await updateVariant('J', 'z', { order: 3, long: '250 ml.', short: 'M.' })).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 9),
                { group: 'J', variant: 'z', order: 3, long: '250 ml.', short: 'M.' },
                ...variants.slice(9),
            ]);
        });

        it('adds new variant with new group', async () => {
            expect(await updateVariant('H', 'm', { order: 3, long: '250 ml.', short: 'M.' })).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 5),
                { group: 'H', variant: 'm', order: 3, long: '250 ml.', short: 'M.' },
                ...variants.slice(5),
            ]);
        });
    });

    describe('renameVariant', () => {
        it('renames variant', async () => {
            expect(await renameVariant('G', 'p', '2')).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 1),
                { ...variants[1], variant: '2' },
                ...variants.slice(2),
            ]);
        });

        it('renames variant of different group', async () => {
            expect(await renameVariant('J', 'd', '3/4')).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 6),
                { ...variants[6], variant: '3/4' },
                ...variants.slice(7),
            ]);
        });

        it('does not rename if names are the same', async () => {
            expect(await renameVariant('G', 'p', 'p')).toBeFalse();
            expect(await getVariants()).toEqual(variants);
        });

        it('does not rename if name not found', async () => {
            expect(await renameVariant('G', '1/4', 'm')).toBeFalse();
            expect(await getVariants()).toEqual(variants);
        });

        it('does not rename if group not found', async () => {
            expect(await renameVariant('H', 'p', '1/2')).toBeFalse();
            expect(await getVariants()).toEqual(variants);
        });
    });

    describe('renameVariantsGroup', () => {
        it('renames variant group', async () => {
            expect(await renameVariantsGroup('G', 'H')).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 5).map((v) => ({ ...v, group: 'H' })),
                ...variants.slice(5),
            ]);
        });

        it('renames different group', async () => {
            expect(await renameVariantsGroup('J', 'H')).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 5),
                ...variants.slice(5).map((v) => ({ ...v, group: 'H' })),
            ]);
        });

        it('does not rename if group is the same', async () => {
            expect(await renameVariantsGroup('G', 'G')).toBeFalse();
            expect(await getVariants()).toEqual(variants);
        });

        it('does not rename if group not found', async () => {
            expect(await renameVariantsGroup('H', 'G')).toBeFalse();
            expect(await getVariants()).toEqual(variants);
        });
    });

    describe('deleteVariant', () => {
        it('deletes variant', async () => {
            expect(await deleteVariant('G', 'p')).toBeTrue();
            expect(await getVariants()).toEqual([...variants.slice(0, 1), ...variants.slice(2)]);
        });

        it('deletes variant of different group', async () => {
            expect(await deleteVariant('J', 'p')).toBeTrue();
            expect(await getVariants()).toEqual([...variants.slice(0, 5), ...variants.slice(6)]);
        });

        it('does not delete if name not found', async () => {
            expect(await deleteVariant('G', 'z')).toBeFalse();
            expect(await getVariants()).toEqual(variants);
        });

        it('does not delete if group not found', async () => {
            expect(await deleteVariant('H', 'p')).toBeFalse();
            expect(await getVariants()).toEqual(variants);
        });
    });

    describe('deleteVariantsGroup', () => {
        it('deletes group', async () => {
            expect(await deleteVariantsGroup('G')).toBeTrue();
            expect(await getVariants()).toEqual(variants.slice(5));
        });

        it('deletes different group', async () => {
            expect(await deleteVariantsGroup('J')).toBeTrue();
            expect(await getVariants()).toEqual(variants.slice(0, 5));
        });

        it('does not delete if group not found', async () => {
            expect(await deleteVariantsGroup('H')).toBeFalse();
            expect(await getVariants()).toEqual(variants);
        });
    });
});
