import {
    type BulkWriteResult,
    type DeleteResult,
    type InsertManyResult,
    type InsertOneResult,
    MongoError,
    type UpdateResult,
} from 'mongodb';

export const getGroupQuery = (group: string): Record<string, unknown> =>
    group ? { group } : { $or: [{ group }, { group: { $exists: false } }] };

export const getGroupAndNameQuery = (group: string, name: string): Record<string, unknown> => ({
    ...getGroupQuery(group),
    name,
});

export const hasEffect = (
    res: BulkWriteResult | UpdateResult | DeleteResult | InsertOneResult | InsertManyResult
): boolean =>
    !!(res as InsertOneResult).insertedId ||
    !!(res as InsertManyResult).insertedCount ||
    !!(res as UpdateResult).modifiedCount ||
    !!(res as UpdateResult).upsertedCount ||
    !!(res as DeleteResult).deletedCount;

export function hasDuplicates(e: unknown): boolean {
    if (e instanceof MongoError && e.code === 11000) {
        return false;
    }
    // rethrow error
    throw e;
}
