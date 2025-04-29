/** @jest-environment node */
import { getAggregatedVariantsFixture, getDetailsFixture, getVariantsFixture } from '@tests/fixtures';
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
import { db } from '~/server/db';

jest.setTimeout(30_000);

jest.mock('~/server/db');
jest.mock('~/server/data/years');

describe('variants', () => {
    beforeEach(async () => {
        await (await db()).collection('details').insertMany(getDetailsFixture());
        await (await db()).collection('variants').insertMany(getVariantsFixture());
    });

    afterEach(async () => {
        await (await db()).collection('details').deleteMany();
        await (await db()).collection('variants').deleteMany();
        jest.clearAllMocks();
    });

    const variants = getAggregatedVariantsFixture();

    describe('getVariants', () => {
        it('returns variants sorted by group and order', async () => {
            await expect(getVariants()).resolves.toStrictEqual(variants);
        });
    });

    describe('setVariants', () => {
        it('sets new variants', async () => {
            await expect(setVariants([{ group: 'Uogienės', variant: 'D', order: 0, short: 'DD' }])).resolves.toBeTrue();
            await expect(getVariants()).resolves.toStrictEqual([
                { group: 'Uogienės', variant: 'D', order: 0, short: 'DD', used: false },
            ]);
        });

        it('sets empty variants', async () => {
            await expect(setVariants([])).resolves.toBeTrue();
            await expect(getVariants()).resolves.toStrictEqual([]);
        });
    });

    describe('setGroupVariants', () => {
        it('sets new variants', async () => {
            await expect(
                setGroupVariants('Uogienės', [
                    { variant: 'B', order: 0, long: 'bb' },
                    { variant: 'D', order: 1, short: 'DD' },
                ])
            ).resolves.toBeTrue();
            await expect(getVariants()).resolves.toStrictEqual([
                ...variants.slice(0, 5),
                { group: 'Uogienės', variant: 'B', order: 0, long: 'bb', used: false },
                { group: 'Uogienės', variant: 'D', order: 1, short: 'DD', used: false },
            ]);
        });

        it('sets empty variants', async () => {
            await expect(setGroupVariants('Uogienės', [])).resolves.toBeTrue();
            await expect(getVariants()).resolves.toStrictEqual(variants.slice(0, 5));
        });

        it('sets new group variants', async () => {
            await expect(setGroupVariants('Grybai', [{ variant: 'D', order: 0, short: 'DD' }])).resolves.toBeTrue();
            await expect(getVariants()).resolves.toStrictEqual([
                ...variants.slice(0, 5),
                { group: 'Grybai', variant: 'D', order: 0, short: 'DD', used: false },
                ...variants.slice(5),
            ]);
        });
    });

    describe('updateVariant', () => {
        it('updates variant by changing order, long and title', async () => {
            await expect(updateVariant('Uogienės', 'p', { order: 0, long: 'aa', short: 'AA' })).resolves.toBeTrue();
            await expect(getVariants()).resolves.toStrictEqual([
                ...variants.slice(0, 5),
                { ...variants[5], order: 0, long: 'aa', short: 'AA' },
                ...variants.slice(6),
            ]);
        });

        it('updates variant by changing order and long', async () => {
            await expect(updateVariant('Uogienės', 'p', { order: 0, long: 'aa' })).resolves.toBeTrue();
            await expect(getVariants()).resolves.toStrictEqual([
                ...variants.slice(0, 5),
                { ...variants[5], order: 0, long: 'aa' },
                ...variants.slice(6),
            ]);
        });

        it('updates variant by changing order only', async () => {
            await expect(updateVariant('Uogienės', 'd', { order: 0 })).resolves.toBeTrue();
            await expect(getVariants()).resolves.toStrictEqual([
                ...variants.slice(0, 6),
                { group: 'Uogienės', variant: 'd', order: 0, used: false },
                ...variants.slice(7),
            ]);
        });

        it('updates variant by changing title only', async () => {
            await expect(updateVariant('Uogienės', 'd', { order: 1, short: 'D.' })).resolves.toBeTrue();
            await expect(getVariants()).resolves.toStrictEqual([
                ...variants.slice(0, 6),
                { group: 'Uogienės', variant: 'd', order: 1, short: 'D.', used: false },
                ...variants.slice(7),
            ]);
        });

        it('updates variant by changing long only', async () => {
            await expect(updateVariant('Uogienės', 'd', { order: 1, long: '0.75 l' })).resolves.toBeTrue();
            await expect(getVariants()).resolves.toStrictEqual([
                ...variants.slice(0, 6),
                { group: 'Uogienės', variant: 'd', order: 1, long: '0.75 l', used: false },
                ...variants.slice(7),
            ]);
        });

        it('does not update variant when nothing changes', async () => {
            await expect(
                updateVariant('Uogienės', 'm', { order: 2, long: '250 ml.', short: 'M.' })
            ).resolves.toBeFalse();
            await expect(getVariants()).resolves.toStrictEqual(variants);
        });

        it('adds new variant with same order', async () => {
            await expect(
                updateVariant('Uogienės', 'z', { order: 3, long: '250 ml.', short: 'M.' })
            ).resolves.toBeTrue();
            await expect(getVariants()).resolves.toStrictEqual([
                ...variants.slice(0, 9),
                { group: 'Uogienės', variant: 'z', order: 3, long: '250 ml.', short: 'M.', used: false },
                ...variants.slice(9),
            ]);
        });

        it('adds new variant with new group', async () => {
            await expect(updateVariant('Šaldyti', 'm', { order: 3, long: '250 ml.', short: 'M.' })).resolves.toBeTrue();
            await expect(getVariants()).resolves.toStrictEqual([
                ...variants,
                { group: 'Šaldyti', variant: 'm', order: 3, long: '250 ml.', short: 'M.', used: false },
            ]);
        });
    });

    describe('renameVariant', () => {
        it('renames variant', async () => {
            await expect(renameVariant('Daržovės', 'p', '2')).resolves.toBeTrue();
            await expect(getVariants()).resolves.toStrictEqual([
                ...variants.slice(0, 1),
                { ...variants[1], variant: '2', used: false },
                ...variants.slice(2),
            ]);
        });

        it('renames variant of different group', async () => {
            await expect(renameVariant('Uogienės', 'd', '3/4')).resolves.toBeTrue();
            await expect(getVariants()).resolves.toStrictEqual([
                ...variants.slice(0, 6),
                { ...variants[6], variant: '3/4' },
                ...variants.slice(7),
            ]);
        });

        it('does not rename if names are the same', async () => {
            await expect(renameVariant('Daržovės', 'p', 'p')).resolves.toBeFalse();
            await expect(getVariants()).resolves.toStrictEqual(variants);
        });

        it('does not rename if name not found', async () => {
            await expect(renameVariant('Daržovės', '1/4', 'm')).resolves.toBeFalse();
            await expect(getVariants()).resolves.toStrictEqual(variants);
        });

        it('does not rename if group not found', async () => {
            await expect(renameVariant('Šaldyti', 'p', '1/2')).resolves.toBeFalse();
            await expect(getVariants()).resolves.toStrictEqual(variants);
        });
    });

    describe('renameVariantsGroup', () => {
        it('renames variant group', async () => {
            await expect(renameVariantsGroup('Daržovės', 'Šaldyti')).resolves.toBeTrue();
            await expect(getVariants()).resolves.toStrictEqual([
                ...variants.slice(5),
                ...variants.slice(0, 5).map((v) => ({ ...v, group: 'Šaldyti', used: false })),
            ]);
        });

        it('renames different group', async () => {
            await expect(renameVariantsGroup('Uogienės', 'Šaldyti')).resolves.toBeTrue();
            await expect(getVariants()).resolves.toStrictEqual([
                ...variants.slice(0, 5),
                ...variants.slice(5).map((v) => ({ ...v, group: 'Šaldyti', used: false })),
            ]);
        });

        it('does not rename if group is the same', async () => {
            await expect(renameVariantsGroup('Daržovės', 'Daržovės')).resolves.toBeFalse();
            await expect(getVariants()).resolves.toStrictEqual(variants);
        });

        it('does not rename if group not found', async () => {
            await expect(renameVariantsGroup('Šaldyti', 'Daržovės')).resolves.toBeFalse();
            await expect(getVariants()).resolves.toStrictEqual(variants);
        });
    });

    describe('deleteVariant', () => {
        it('deletes variant', async () => {
            await expect(deleteVariant('Daržovės', 'p')).resolves.toBeTrue();
            await expect(getVariants()).resolves.toStrictEqual([...variants.slice(0, 1), ...variants.slice(2)]);
        });

        it('deletes variant of different group', async () => {
            await expect(deleteVariant('Uogienės', 'p')).resolves.toBeTrue();
            await expect(getVariants()).resolves.toStrictEqual([...variants.slice(0, 5), ...variants.slice(6)]);
        });

        it('does not delete if name not found', async () => {
            await expect(deleteVariant('Daržovės', 'z')).resolves.toBeFalse();
            await expect(getVariants()).resolves.toStrictEqual(variants);
        });

        it('does not delete if group not found', async () => {
            await expect(deleteVariant('Šaldyti', 'p')).resolves.toBeFalse();
            await expect(getVariants()).resolves.toStrictEqual(variants);
        });
    });

    describe('deleteVariantsGroup', () => {
        it('deletes group', async () => {
            await expect(deleteVariantsGroup('Daržovės')).resolves.toBeTrue();
            await expect(getVariants()).resolves.toStrictEqual(variants.slice(5));
        });

        it('deletes different group', async () => {
            await expect(deleteVariantsGroup('Uogienės')).resolves.toBeTrue();
            await expect(getVariants()).resolves.toStrictEqual(variants.slice(0, 5));
        });

        it('does not delete if group not found', async () => {
            await expect(deleteVariantsGroup('Šaldyti')).resolves.toBeFalse();
            await expect(getVariants()).resolves.toStrictEqual(variants);
        });
    });
});
