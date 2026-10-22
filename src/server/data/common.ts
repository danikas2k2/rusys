import type { ClientSession, Db } from 'mongodb';

import type { ExportArchiveData, Group, Product, Variant } from '~/common/data';
import type * as schema from '~/schema';
import { deleteGroup, renameGroup } from '~/server/data/groups';
import { getProductVariants, moveProduct, renameProductsGroup, renameProductsVariant } from '~/server/data/products';
import { hasEffect } from '~/server/data/utils';
import { copyVariants, deleteVariant, renameVariant, renameVariantsGroup } from '~/server/data/variants';
import { db } from '~/server/db';

export async function moveProductOccurrences(request: schema.MoveProduct, session: ClientSession): Promise<boolean> {
    if (!(await moveProduct(request, session))) {
        return false;
    }
    const variants = await getProductVariants(request.targetGroup, request.targetName ?? request.name, session);
    if (variants?.length) {
        await copyVariants(request.group, request.targetGroup, variants, session);
    }
    return true;
}

export async function renameVariantOccurrences(
    request: schema.RenameVariant,
    session: ClientSession
): Promise<boolean> {
    if (!(await renameVariant(request, session))) {
        return false;
    }
    await renameProductsVariant(request.group, request.variant, request.targetVariant, session);
    return true;
}

export const deleteVariantOccurrences = (group: string, variant: string, session: ClientSession): Promise<boolean> =>
    deleteVariant(group, variant, session);

export const deleteGroupOccurrences = (group: string, session: ClientSession): Promise<boolean> =>
    deleteGroup(group, session);

export async function renameGroupOccurrences(request: schema.RenameGroup, session: ClientSession): Promise<boolean> {
    if (!(await renameGroup(request, session))) {
        return false;
    }
    await renameVariantsGroup(request.group, request.targetGroup, session);
    await renameProductsGroup(request.group, request.targetGroup, session);
    return true;
}

export async function exportEverything(session: ClientSession): Promise<ExportArchiveData> {
    const d = await db();
    return {
        products: await d
            .collection('products')
            .find({}, { projection: { _id: 0 }, session })
            .toArray(),
        variants: await d
            .collection('variants')
            .find({}, { projection: { _id: 0 }, session })
            .toArray(),
        groups: await d
            .collection('groups')
            .find({}, { projection: { _id: 0 }, session })
            .toArray(),
    };
}

const copyCollection = async (src: Db, dst: Db, collectionName: string): Promise<boolean> => {
    const srcCollection = src.collection(collectionName);
    await srcCollection.aggregate([{ $match: {} }, { $out: { db: dst.databaseName, coll: collectionName } }]).toArray();
    return (await srcCollection.countDocuments()) === (await dst.collection(collectionName).countDocuments());
};

const moveEverything = async (src: Db, dst: Db): Promise<boolean> =>
    (await copyCollection(src, dst, 'products')) &&
    (await copyCollection(src, dst, 'variants')) &&
    (await copyCollection(src, dst, 'groups')) &&
    (await src.dropDatabase());

export async function importEverything(
    products: readonly Product[],
    variants: readonly Variant[],
    groups: readonly Group[]
): Promise<boolean> {
    // $out, collection replacement and dropDatabase cannot run inside a MongoDB transaction.
    const current = await db();
    const name = current.databaseName;

    const now = new Date().toISOString().replaceAll(/\D/g, (x) => (x === 'T' ? '_' : ''));

    // Create a temporary database
    const temporary = await db(`${name}_temp_${now}`);

    // Insert combined data into temporary database
    const options = { forceServerObjectId: true };
    if (
        !(await temporary.collection('products').insertMany(products, options).then(hasEffect)) ||
        !(await temporary.collection('variants').insertMany(variants, options).then(hasEffect)) ||
        !(await temporary.collection('groups').insertMany(groups, options).then(hasEffect))
    ) {
        throw new Error('Failed to insert data into temporary database');
    }

    // Move data from the original database to a backup database
    if (!(await moveEverything(current, await db(`${name}_backup_${now}`)))) {
        throw new Error('Failed to move original data to backup database');
    }

    // Move data from the temporary database to the original database
    if (!(await moveEverything(temporary, current))) {
        throw new Error('Failed to move data from temporary database to original database');
    }

    return true;
}
