import { type ApiExport } from '~/common/api';
import { type Details, type Group, type UpdateVariant, type Variant } from '~/common/types';
import {
    deleteDetailsGroup,
    deleteDetailsVariant,
    moveDetails,
    renameDetailsGroup,
    renameDetailsVariant,
} from '~/server/data/details';
import { deleteGroup, renameGroup } from '~/server/data/groups';
import { hasEffect } from '~/server/data/utils';
import {
    copyDetailsVariants,
    deleteVariant,
    deleteVariantsGroup,
    renameVariant,
    renameVariantsGroup,
} from '~/server/data/variants';
import { db, withTransaction } from '~/server/db';
import moment from 'moment';
import { type Db } from 'mongodb';

export const moveDetailsOccurrences = (
    group: string,
    name: string,
    newGroup: string,
    newName?: string
): Promise<boolean> =>
    withTransaction(async (session) => {
        if (await moveDetails(group, name, newGroup, newName, session)) {
            await copyDetailsVariants(group, newName ?? name, newGroup, session);
            return true;
        }
        return false;
    });

export const renameVariantOccurrences = (
    group: string,
    variant: string,
    newVariant: string,
    update?: UpdateVariant
): Promise<boolean> =>
    withTransaction(async (session) => {
        if (await renameVariant(group, variant, newVariant, update, session)) {
            await renameDetailsVariant(group, variant, newVariant, session);
            return true;
        }
        return false;
    });

export const deleteVariantOccurrences = (group: string, variant: string): Promise<boolean> =>
    withTransaction(async (session) => {
        if (await deleteVariant(group, variant, session)) {
            await deleteDetailsVariant(group, variant, session);
            return true;
        }
        return false;
    });

export const renameGroupOccurrences = (group: string, newGroup: string): Promise<boolean> =>
    withTransaction(async (session) => {
        if (await renameGroup(group, newGroup, session)) {
            await renameVariantsGroup(group, newGroup, session);
            await renameDetailsGroup(group, newGroup, session);
            return true;
        }
        return false;
    });

export const deleteGroupOccurrences = (group: string): Promise<boolean> =>
    withTransaction(async (session) => {
        if (await deleteGroup(group, session)) {
            await deleteVariantsGroup(group, session);
            await deleteDetailsGroup(group, session);
            return true;
        }
        return false;
    });

export async function exportEverything(): Promise<ApiExport> {
    const d = await db();
    return {
        details: await d
            .collection('details')
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

const moveEverything = async (src: Db, dst: Db): Promise<boolean> => {
    return (
        (await copyCollection(src, dst, 'details')) &&
        (await copyCollection(src, dst, 'variants')) &&
        (await copyCollection(src, dst, 'groups')) &&
        (await src.dropDatabase())
    );
};

export async function importEverything(
    details: ReadonlyArray<Details>,
    variants: ReadonlyArray<Variant>,
    groups: ReadonlyArray<Group>
): Promise<boolean> {
    const current = await db();
    const name = current.databaseName;
    const now = moment().format('YYYYMMDD_HHmmss');

    // Create a temporary database
    const temporary = await db(`${name}_temp_${now}`);

    // Insert combined data into temporary database
    const options = { forceServerObjectId: true };
    if (
        !(await temporary.collection('details').insertMany(details, options).then(hasEffect)) ||
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
