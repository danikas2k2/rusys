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
import { getDetailsCollection, getVariantsCollection } from '~/server/db';
import { getAggregatedVariantsFixture, getDetailsFixture, getVariantsFixture } from '~/tests/fixtures';

jest.mock('~/server/db');
jest.mock('~/server/data/years');

describe('variants', () => {
    jest.setTimeout(30_000);

    beforeEach(async () => {
        await (await getDetailsCollection()).insertMany(getDetailsFixture());
        await (await getVariantsCollection()).insertMany(getVariantsFixture());
    });

    afterEach(async () => {
        await (await getDetailsCollection()).deleteMany();
        await (await getVariantsCollection()).deleteMany();
        jest.clearAllMocks();
    });

    const variants = getAggregatedVariantsFixture();

    describe('getVariants', () => {
        it('returns variants sorted by group and order', async () => {
            expect(await getVariants()).toEqual(variants);
        });
    });

    describe('setVariants', () => {
        it('sets new variants', async () => {
            expect(await setVariants([{ group: 'Uogienės', variant: 'D', order: 0, short: 'DD' }])).toBeTrue();
            expect(await getVariants()).toEqual([
                { group: 'Uogienės', variant: 'D', order: 0, short: 'DD', used: false },
            ]);
        });

        it('sets empty variants', async () => {
            expect(await setVariants([])).toBeTrue();
            expect(await getVariants()).toEqual([]);
        });
    });

    describe('setGroupVariants', () => {
        it('sets new variants', async () => {
            expect(
                await setGroupVariants('Uogienės', [
                    { variant: 'B', order: 0, long: 'bb' },
                    { variant: 'D', order: 1, short: 'DD' },
                ])
            ).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 5),
                { group: 'Uogienės', variant: 'B', order: 0, long: 'bb', used: false },
                { group: 'Uogienės', variant: 'D', order: 1, short: 'DD', used: false },
            ]);
        });

        it('sets empty variants', async () => {
            expect(await setGroupVariants('Uogienės', [])).toBeTrue();
            expect(await getVariants()).toEqual(variants.slice(0, 5));
        });

        it('sets new group variants', async () => {
            expect(await setGroupVariants('Grybai', [{ variant: 'D', order: 0, short: 'DD' }])).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 5),
                { group: 'Grybai', variant: 'D', order: 0, short: 'DD', used: false },
                ...variants.slice(5),
            ]);
        });
    });

    describe('updateVariant', () => {
        it('updates variant by changing order, long and title', async () => {
            expect(await updateVariant('Uogienės', 'p', { order: 0, long: 'aa', short: 'AA' })).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 5),
                { ...variants[5], order: 0, long: 'aa', short: 'AA' },
                ...variants.slice(6),
            ]);
        });

        it('updates variant by changing order and long', async () => {
            expect(await updateVariant('Uogienės', 'p', { order: 0, long: 'aa' })).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 5),
                { ...variants[5], order: 0, long: 'aa' },
                ...variants.slice(6),
            ]);
        });

        it('updates variant by changing order only', async () => {
            expect(await updateVariant('Uogienės', 'd', { order: 0 })).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 6),
                { group: 'Uogienės', variant: 'd', order: 0, used: false },
                ...variants.slice(7),
            ]);
        });

        it('updates variant by changing title only', async () => {
            expect(await updateVariant('Uogienės', 'd', { order: 1, short: 'D.' })).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 6),
                { group: 'Uogienės', variant: 'd', order: 1, short: 'D.', used: false },
                ...variants.slice(7),
            ]);
        });

        it('updates variant by changing long only', async () => {
            expect(await updateVariant('Uogienės', 'd', { order: 1, long: '0.75 l' })).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 6),
                { group: 'Uogienės', variant: 'd', order: 1, long: '0.75 l', used: false },
                ...variants.slice(7),
            ]);
        });

        it('does not update variant when nothing changes', async () => {
            expect(await updateVariant('Uogienės', 'm', { order: 2, long: '250 ml.', short: 'M.' })).toBeFalse();
            expect(await getVariants()).toEqual(variants);
        });

        it('adds new variant with same order', async () => {
            expect(await updateVariant('Uogienės', 'z', { order: 3, long: '250 ml.', short: 'M.' })).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 9),
                { group: 'Uogienės', variant: 'z', order: 3, long: '250 ml.', short: 'M.', used: false },
                ...variants.slice(9),
            ]);
        });

        it('adds new variant with new group', async () => {
            expect(await updateVariant('Šaldyti', 'm', { order: 3, long: '250 ml.', short: 'M.' })).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants,
                { group: 'Šaldyti', variant: 'm', order: 3, long: '250 ml.', short: 'M.', used: false },
            ]);
        });
    });

    describe('renameVariant', () => {
        it('renames variant', async () => {
            expect(await renameVariant('Daržovės', 'p', '2')).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 1),
                { ...variants[1], variant: '2', used: false },
                ...variants.slice(2),
            ]);
        });

        it('renames variant of different group', async () => {
            expect(await renameVariant('Uogienės', 'd', '3/4')).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 6),
                { ...variants[6], variant: '3/4' },
                ...variants.slice(7),
            ]);
        });

        it('does not rename if names are the same', async () => {
            expect(await renameVariant('Daržovės', 'p', 'p')).toBeFalse();
            expect(await getVariants()).toEqual(variants);
        });

        it('does not rename if name not found', async () => {
            expect(await renameVariant('Daržovės', '1/4', 'm')).toBeFalse();
            expect(await getVariants()).toEqual(variants);
        });

        it('does not rename if group not found', async () => {
            expect(await renameVariant('Šaldyti', 'p', '1/2')).toBeFalse();
            expect(await getVariants()).toEqual(variants);
        });
    });

    describe('renameVariantsGroup', () => {
        it('renames variant group', async () => {
            expect(await renameVariantsGroup('Daržovės', 'Šaldyti')).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(5),
                ...variants.slice(0, 5).map((v) => ({ ...v, group: 'Šaldyti', used: false })),
            ]);
        });

        it('renames different group', async () => {
            expect(await renameVariantsGroup('Uogienės', 'Šaldyti')).toBeTrue();
            expect(await getVariants()).toEqual([
                ...variants.slice(0, 5),
                ...variants.slice(5).map((v) => ({ ...v, group: 'Šaldyti', used: false })),
            ]);
        });

        it('does not rename if group is the same', async () => {
            expect(await renameVariantsGroup('Daržovės', 'Daržovės')).toBeFalse();
            expect(await getVariants()).toEqual(variants);
        });

        it('does not rename if group not found', async () => {
            expect(await renameVariantsGroup('Šaldyti', 'Daržovės')).toBeFalse();
            expect(await getVariants()).toEqual(variants);
        });
    });

    describe('deleteVariant', () => {
        it('deletes variant', async () => {
            expect(await deleteVariant('Daržovės', 'p')).toBeTrue();
            expect(await getVariants()).toEqual([...variants.slice(0, 1), ...variants.slice(2)]);
        });

        it('deletes variant of different group', async () => {
            expect(await deleteVariant('Uogienės', 'p')).toBeTrue();
            expect(await getVariants()).toEqual([...variants.slice(0, 5), ...variants.slice(6)]);
        });

        it('does not delete if name not found', async () => {
            expect(await deleteVariant('Daržovės', 'z')).toBeFalse();
            expect(await getVariants()).toEqual(variants);
        });

        it('does not delete if group not found', async () => {
            expect(await deleteVariant('Šaldyti', 'p')).toBeFalse();
            expect(await getVariants()).toEqual(variants);
        });
    });

    describe('deleteVariantsGroup', () => {
        it('deletes group', async () => {
            expect(await deleteVariantsGroup('Daržovės')).toBeTrue();
            expect(await getVariants()).toEqual(variants.slice(5));
        });

        it('deletes different group', async () => {
            expect(await deleteVariantsGroup('Uogienės')).toBeTrue();
            expect(await getVariants()).toEqual(variants.slice(0, 5));
        });

        it('does not delete if group not found', async () => {
            expect(await deleteVariantsGroup('Šaldyti')).toBeFalse();
            expect(await getVariants()).toEqual(variants);
        });
    });
});
