import { getGroupsFixture, getProductsFixture, getVariantsFixture } from '@tests/fixtures';

import { SchemaError } from '~/schema';
import { renameVariantAction } from '~/server/actions/variants';
import { requireSession } from '~/server/auth/session';
import * as mutations from '~/server/data/products/mutations';
import { $all } from '~/server/data/tests/utils';
import { db, withinTransaction } from '~/server/db';

vi.mock(import('~/server/db'));
vi.mock(import('~/server/auth/session'));
vi.mock(import('~/server/data/years'));

describe('variant rename transaction', () => {
    beforeEach(async () => {
        const database = await db();
        await database.collection('groups').insertMany(getGroupsFixture());
        await database.collection('variants').insertMany(getVariantsFixture());
        await database.collection('products').insertMany(getProductsFixture());
    });

    afterEach(async () => {
        vi.restoreAllMocks();
        const database = await db();
        await database.collection('groups').deleteMany({});
        await database.collection('variants').deleteMany({});
        await database.collection('products').deleteMany({});
        vi.clearAllMocks();
    });

    it('rolls back the renamed variant when product reference rewriting fails', async () => {
        const beforeVariants = await $all('variants');
        const beforeProducts = await $all('products');
        vi.spyOn(mutations, 'renameProductsVariant').mockRejectedValueOnce(new Error('rewrite failed'));

        await expect(renameVariantAction({ group: 'Daržovės', variant: 'p', targetVariant: 'new' })).rejects.toThrow(
            'rewrite failed'
        );

        await expect($all('variants')).resolves.toStrictEqual(beforeVariants);
        await expect($all('products')).resolves.toStrictEqual(beforeProducts);
        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
        expect(withinTransaction).toHaveBeenCalledTimes(1);
    });

    it('rejects an occupied target without rewriting product references', async () => {
        const beforeVariants = await $all('variants');
        const beforeProducts = await $all('products');
        const rewrite = vi.spyOn(mutations, 'renameProductsVariant');

        await expect(renameVariantAction({ group: 'Daržovės', variant: 'p', targetVariant: 'd' })).rejects.toThrow(
            SchemaError.VariantAlreadyExists
        );

        expect(rewrite).not.toHaveBeenCalled();
        await expect($all('variants')).resolves.toStrictEqual(beforeVariants);
        await expect($all('products')).resolves.toStrictEqual(beforeProducts);
    });
});
