import type { Db } from 'mongodb';

import type { ExportArchiveData, Group, Product, UpdateVariant, Variant } from '~/common/data';
import { deleteGroup, renameGroup } from '~/server/data/groups';
import { getProductVariants, moveProduct, renameProductsGroup, renameProductsVariant } from '~/server/data/products';
import { hasEffect } from '~/server/data/utils';
import { copyVariants, deleteVariant, renameVariant, renameVariantsGroup } from '~/server/data/variants';
import { db, withTransaction } from '~/server/db';

export const moveProductOccurrences = (
    group: string,
    name: string,
    newGroup: string,
    newName?: string
): Promise<boolean> =>
    withTransaction(async (session) => {
        // A product's parent link is scoped to its own group, so moving it to another group
        // while it has children would orphan them across groups — block it instead.
        const hasChildren = await (
            await db()
        )
            .collection<Product>('products')
            .countDocuments({ group, parent: name }, { session });
        if (hasChildren) {
            return false;
        }
        if (!(await moveProduct(group, name, newGroup, newName, session))) {
            return false;
        }
        const variants = await getProductVariants(newGroup, newName ?? name, session);
        if (variants?.length) {
            await copyVariants(group, newGroup, variants, session);
        }
        return true;
    });

export const renameVariantOccurrences = (
    group: string,
    variant: string,
    newVariant: string,
    update?: UpdateVariant
): Promise<boolean> =>
    withTransaction(async (session) => {
        if (await renameVariant(group, variant, newVariant, update, session)) {
            await renameProductsVariant(group, variant, newVariant, session);
            return true;
        }
        return false;
    });

export const deleteVariantOccurrences = (group: string, variant: string): Promise<boolean> =>
    withTransaction(async (session) => await deleteVariant(group, variant, session));

export const renameGroupOccurrences = (
    group: string,
    newGroup: string,
    annual: boolean = true,
    review: boolean = false,
    image?: string
): Promise<boolean> =>
    withTransaction(async (session) => {
        if (await renameGroup(group, newGroup, annual, review, image, session)) {
            await renameVariantsGroup(group, newGroup, session);
            await renameProductsGroup(group, newGroup, session);
            return true;
        }
        return false;
    });

export const deleteGroupOccurrences = (group: string): Promise<boolean> =>
    withTransaction(async (session) => await deleteGroup(group, session));

export async function exportEverything(): Promise<ExportArchiveData> {
    const d = await db();
    return {
        products: await d
            .collection('products')
            .find({}, { projection: { _id: 0 } })
            .toArray(),
        variants: await d
            .collection('variants')
            .find({}, { projection: { _id: 0 } })
            .toArray(),
        groups: await d
            .collection('groups')
            .find({}, { projection: { _id: 0 } })
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
