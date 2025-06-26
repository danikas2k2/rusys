/** @jest-environment node */
import { getAggregatedVariantsFixture, getDetailsFixture, getGroupsFixture, getVariantsFixture } from '@tests/fixtures';
import { $all } from '~/server/data/tests/utils';
import {
    copyVariant,
    copyVariants,
    deleteVariant,
    deleteVariantsGroup,
    getVariants,
    renameVariant,
    renameVariantsGroup,
    reorderVariants,
    updateVariant,
} from '~/server/data/variants';
import { db } from '~/server/db';

jest.setTimeout(30_000);

jest.mock('~/server/db');
jest.mock('~/server/data/years');

describe('variants', () => {
    const groups = getGroupsFixture();
    const variants = getVariantsFixture();

    beforeEach(async () => {
        const options = { forceServerObjectId: true };
        const d = await db();
        await d.collection('details').insertMany(getDetailsFixture(), options);
        await d.collection('variants').insertMany(variants, options);
        await d.collection('groups').insertMany(groups, options);
    });

    afterEach(async () => {
        const d = await db();
        await d.collection('details').deleteMany();
        await d.collection('variants').deleteMany();
        await d.collection('groups').deleteMany();
        jest.clearAllMocks();
    });

    describe('getVariants', () => {
        it('returns variants sorted by group and order', async () => {
            await expect(getVariants()).resolves.toStrictEqual(getAggregatedVariantsFixture());
        });
    });

    describe('updateVariant', () => {
        it('updates variant by changing order and suffix', async () => {
            await expect(updateVariant('Uogienės', 'p', { order: 0, suffix: 'AA' })).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([
                { ...variants[0], order: 0, suffix: 'AA' },
                ...variants.slice(1),
            ]);
        });

        it('updates variant by changing order only', async () => {
            await expect(updateVariant('Uogienės', 'd', { order: 0 })).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants.slice(0, 1),
                { group: 'Uogienės', variant: 'd', order: 0 },
                ...variants.slice(2),
            ]);
        });

        it('updates variant by changing suffix only', async () => {
            await expect(updateVariant('Uogienės', 'd', { order: 1, suffix: 'DD' })).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants.slice(0, 1),
                { group: 'Uogienės', variant: 'd', order: 1, suffix: 'DD' },
                ...variants.slice(2),
            ]);
        });

        it.each`
            title                | group         | variant | update
            ${'nothing changes'} | ${'Uogienės'} | ${'m'}  | ${{ order: 2, suffix: 'M.' }}
            ${'empty group'}     | ${''}         | ${'p'}  | ${{ order: 0, suffix: 'AA' }}
            ${'empty variant'}   | ${'Uogienės'} | ${''}   | ${{ order: 0, suffix: 'AA' }}
        `('does not update variant when $title', async ({ group, variant, update }) => {
            await expect(updateVariant(group, variant, update)).resolves.toBeFalse();
            await expect($all('variants')).resolves.toStrictEqual(variants);
        });

        it.each`
            title                        | group         | variant | update                        | expected
            ${'same order'}              | ${'Uogienės'} | ${'z'}  | ${{ order: 3, suffix: 'M.' }} | ${{}}
            ${'incremented order'}       | ${'Uogienės'} | ${'z'}  | ${{ suffix: 'M.' }}           | ${{ order: 5 }}
            ${'new group'}               | ${'Šaldyti'}  | ${'m'}  | ${{ order: 3, suffix: 'M.' }} | ${{}}
            ${'new group without order'} | ${'Šaldyti'}  | ${'m'}  | ${{ suffix: 'M.' }}           | ${{ order: 0 }}
        `('adds new variant with $title', async ({ group, variant, update, expected }) => {
            await expect(updateVariant(group, variant, update)).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants,
                { group, variant, ...update, ...expected },
            ]);
        });
    });

    describe('renameVariant', () => {
        it('renames variant', async () => {
            await expect(renameVariant('Daržovės', 'p', '1/2')).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants.slice(0, 6),
                { ...variants[6], variant: '1/2' },
                ...variants.slice(7),
            ]);
        });

        it('renames variant of different group', async () => {
            await expect(renameVariant('Uogienės', 'd', '3/4')).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants.slice(0, 1),
                { ...variants[1], variant: '3/4' },
                ...variants.slice(2),
            ]);
        });

        it('renames variant and set updated fields', async () => {
            await expect(renameVariant('Daržovės', 'p', '1/2', { suffix: '½' })).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants.slice(0, 6),
                { ...variants[6], variant: '1/2', suffix: '½' },
                ...variants.slice(7),
            ]);
        });

        it('renames variant and remove missing fields', async () => {
            await expect(renameVariant('Daržovės', 'p', '1/2', {})).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants.slice(0, 6),
                { group: 'Daržovės', variant: '1/2', order: 1 },
                ...variants.slice(7),
            ]);
        });

        it.each`
            title                           | group         | variant  | newVariant
            ${'when variants are the same'} | ${'Daržovės'} | ${'p'}   | ${'p'}
            ${'when empty group'}           | ${''}         | ${'p'}   | ${'1/2'}
            ${'when missing group'}         | ${'Šaldyti'}  | ${'p'}   | ${'1/2'}
            ${'from empty variant'}         | ${'Daržovės'} | ${''}    | ${'1/2'}
            ${'from missing variant'}       | ${'Daržovės'} | ${'1/4'} | ${'m'}
            ${'to empty variant'}           | ${'Daržovės'} | ${'p'}   | ${''}
        `('does not rename $title', async ({ group, variant, newVariant }) => {
            await expect(renameVariant(group, variant, newVariant)).resolves.toBeFalse();
            await expect($all('variants')).resolves.toStrictEqual(variants);
        });
    });

    describe('renameVariantsGroup', () => {
        it('renames variant group', async () => {
            await expect(renameVariantsGroup('Daržovės', 'Šaldyti')).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants.slice(0, 5),
                ...variants.slice(5).map((v) => ({ ...v, group: 'Šaldyti' })),
            ]);
        });

        it('renames different group', async () => {
            await expect(renameVariantsGroup('Uogienės', 'Šaldyti')).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants.slice(0, 5).map((v) => ({ ...v, group: 'Šaldyti' })),
                ...variants.slice(5),
            ]);
        });

        it.each`
            title                         | group         | newGroup
            ${'when groups are the same'} | ${'Daržovės'} | ${'Daržovės'}
            ${'from empty group'}         | ${''}         | ${'Daržovės'}
            ${'from missing group'}       | ${'Šaldyti'}  | ${'Uogienės'}
            ${'to empty group'}           | ${'Daržovės'} | ${''}
        `('does not rename $title', async ({ group, newGroup }) => {
            await expect(renameVariantsGroup(group, newGroup)).resolves.toBeFalse();
            await expect($all('variants')).resolves.toStrictEqual(variants);
        });
    });

    describe('copyVariant', () => {
        it('copies variant', async () => {
            await expect(copyVariant('Uogienės', 'e', 'Daržovės')).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([...variants, { ...variants[3], group: 'Daržovės' }]);
        });

        it('copies variant to new group', async () => {
            await expect(copyVariant('Uogienės', 'p', 'Šaldyti')).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([...variants, { ...variants[0], group: 'Šaldyti' }]);
        });

        it('copies variant with new name', async () => {
            await expect(copyVariant('Uogienės', 'p', 'Daržovės', 'z')).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants,
                { ...variants[0], group: 'Daržovės', variant: 'z' },
            ]);
        });

        it('does not copy variant with new name if already exists in target group', async () => {
            await expect(copyVariant('Uogienės', 'p', 'Daržovės', 'd')).resolves.toBeFalse();
            await expect($all('variants')).resolves.toStrictEqual(variants);
        });

        it('copies variant with updated details', async () => {
            await expect(
                copyVariant('Uogienės', 'p', 'Šaldyti', undefined, { order: 7, suffix: '1/2' })
            ).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants,
                { ...variants[0], group: 'Šaldyti', order: 7, suffix: '1/2' },
            ]);
        });

        it('copies variant with order only', async () => {
            await expect(copyVariant('Uogienės', 'p', 'Šaldyti', undefined, { order: 7 })).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants,
                { group: 'Šaldyti', variant: 'p', order: 7 },
            ]);
        });

        it('copies variant with suffix only', async () => {
            await expect(copyVariant('Uogienės', 'e', 'Daržovės', undefined, { suffix: '1/2' })).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants,
                { group: 'Daržovės', variant: 'e', order: 3, suffix: '1/2' },
            ]);
        });

        it('copies variant with order and suffix', async () => {
            await expect(
                copyVariant('Uogienės', 'p', 'Šaldyti', undefined, { order: 7, suffix: '1/2' })
            ).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants,
                { group: 'Šaldyti', variant: 'p', order: 7, suffix: '1/2' },
            ]);
        });

        it.each`
            title                                  | group         | newGroup      | variant
            ${'to the same group'}                 | ${'Daržovės'} | ${'Daržovės'} | ${'p'}
            ${'to empty group'}                    | ${'Daržovės'} | ${''}         | ${'p'}
            ${'from missing group'}                | ${'Šaldyti'}  | ${'Uogienės'} | ${'p'}
            ${'from empty group'}                  | ${''}         | ${'Daržovės'} | ${'p'}
            ${'if empty'}                          | ${'Daržovės'} | ${'Uogienės'} | ${''}
            ${'if missing'}                        | ${'Daržovės'} | ${'Uogienės'} | ${'z'}
            ${'if already exists in target group'} | ${'Daržovės'} | ${'Uogienės'} | ${'p'}
        `('does not copy variant $title', async ({ group, newGroup, variant }) => {
            await expect(copyVariant(group, variant, newGroup)).resolves.toBeFalse();
            await expect($all('variants')).resolves.toStrictEqual(variants);
        });
    });

    describe('copyVariants', () => {
        it('copies missing variant', async () => {
            await expect(copyVariants('Uogienės', 'Daržovės', ['p', 'e'])).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([...variants, { ...variants[3], group: 'Daržovės' }]);
        });

        it('copies missing variant to opposite group', async () => {
            await expect(copyVariants('Daržovės', 'Uogienės', ['p', '1'])).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([...variants, { ...variants[8], group: 'Uogienės' }]);
        });

        it('copies all variants to new group', async () => {
            await expect(copyVariants('Uogienės', 'Šaldytos', ['p', 'd'])).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([
                ...variants,
                { ...variants[1], group: 'Šaldytos' },
                { ...variants[0], group: 'Šaldytos' },
            ]);
        });

        it.each`
            title                                  | group         | newGroup      | variantList
            ${'to the same group'}                 | ${'Daržovės'} | ${'Daržovės'} | ${['p', 'd']}
            ${'to empty group'}                    | ${'Daržovės'} | ${''}         | ${['p', 'd']}
            ${'from missing group'}                | ${'Šaldyti'}  | ${'Uogienės'} | ${['p', 'd']}
            ${'from empty group'}                  | ${''}         | ${'Daržovės'} | ${['p', 'd']}
            ${'if empty list'}                     | ${'Daržovės'} | ${'Uogienės'} | ${[]}
            ${'if empty value'}                    | ${'Daržovės'} | ${'Uogienės'} | ${['']}
            ${'if missing'}                        | ${'Daržovės'} | ${'Uogienės'} | ${['w', 'z']}
            ${'if already exists in target group'} | ${'Daržovės'} | ${'Uogienės'} | ${['p', 'd']}
        `('does not copy variants $title', async ({ group, newGroup, variantList }) => {
            await expect(copyVariants(group, newGroup, variantList)).resolves.toBeFalse();
            await expect($all('variants')).resolves.toStrictEqual(variants);
        });
    });

    describe('deleteVariant', () => {
        it('deletes variant', async () => {
            await expect(deleteVariant('Daržovės', 'p')).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([...variants.slice(0, 6), ...variants.slice(7)]);
        });

        it('deletes variant of different group', async () => {
            await expect(deleteVariant('Uogienės', 'p')).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([...variants.slice(1)]);
        });

        it.each`
            title                  | group         | variant
            ${'variant not found'} | ${'Daržovės'} | ${'z'}
            ${'group not found'}   | ${'Šaldyti'}  | ${'p'}
            ${'empty variant'}     | ${'Daržovės'} | ${''}
            ${'empty group'}       | ${''}         | ${'p'}
        `('does not delete when $title', async ({ group, variant }) => {
            await expect(deleteVariant(group, variant)).resolves.toBeFalse();
            await expect($all('variants')).resolves.toStrictEqual(variants);
        });
    });

    describe('deleteVariantsGroup', () => {
        it('deletes group', async () => {
            await expect(deleteVariantsGroup('Daržovės')).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual(variants.slice(0, 5));
        });

        it('deletes different group', async () => {
            await expect(deleteVariantsGroup('Uogienės')).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual(variants.slice(5));
        });

        it.each`
            title                | group
            ${'group not found'} | ${'Šaldyti'}
            ${'empty group'}     | ${''}
        `('does not delete when $title', async ({ group }) => {
            await expect(deleteVariantsGroup(group)).resolves.toBeFalse();
            await expect($all('variants')).resolves.toStrictEqual(variants);
        });
    });

    describe('reorderVariants', () => {
        it('reorders variants', async () => {
            await expect(reorderVariants('Uogienės', { p: 1, d: 0 })).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([
                { ...variants[0], order: 1 },
                { ...variants[1], order: 0 },
                ...variants.slice(2),
            ]);
        });

        it('reorders if at least one variant matches', async () => {
            await expect(reorderVariants('Uogienės', { p: 1, z: 0 })).resolves.toBeTrue();
            await expect($all('variants')).resolves.toStrictEqual([{ ...variants[0], order: 1 }, ...variants.slice(1)]);
        });

        it.each`
            title                   | group         | update
            ${'order not changed'}  | ${'Uogienės'} | ${{ p: 0, d: 1 }}
            ${'group not found'}    | ${'Šaldyti'}  | ${{ p: 0, d: 1 }}
            ${'variants not found'} | ${'Uogienės'} | ${{ w: 1, z: 0 }}
            ${'empty group'}        | ${''}         | ${{ p: 0, d: 1 }}
            ${'empty update'}       | ${'Uogienės'} | ${{}}
            ${'undefined update'}   | ${'Uogienės'} | ${undefined}
        `('does not reorder when $title', async ({ group, update }) => {
            await expect(reorderVariants(group, update)).resolves.toBeFalse();
            await expect($all('variants')).resolves.toStrictEqual(variants);
        });
    });
});
