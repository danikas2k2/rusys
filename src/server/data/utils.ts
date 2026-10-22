import {
    MongoError,
    type BulkWriteResult,
    type DeleteResult,
    type InsertManyResult,
    type InsertOneResult,
    type UpdateResult,
} from 'mongodb';

import * as schema from '~/schema';
import { imageFieldUpdate, resolveImage } from '~/server/data/resolveImage';

export const hasEffect = (
    res: BulkWriteResult | UpdateResult | DeleteResult | InsertOneResult | InsertManyResult
): boolean =>
    !!(res as InsertOneResult).insertedId ||
    !!(res as InsertManyResult).insertedCount ||
    !!(res as UpdateResult).modifiedCount ||
    !!(res as UpdateResult).upsertedCount ||
    !!(res as DeleteResult).deletedCount;

export async function assertSuccess(result: boolean): Promise<void> {
    if (!result) {
        throw new Error(schema.SchemaError.RequestFailed);
    }
}

export function handleDuplicate<T>(e: unknown, fn: () => T): T {
    if (e instanceof MongoError && e.code === 11000) {
        return fn();
    }
    throw e;
}

export async function getImageFieldUpdate<T extends { image?: string; photo?: string }>(
    existing: T | null,
    image?: string
): Promise<{ $set: Record<string, string>; $unset: Record<string, 1> } | undefined> {
    const resolved = image !== undefined ? await resolveImage(image, existing?.image, existing?.photo) : undefined;
    return resolved ? imageFieldUpdate(resolved, 'image', 'photo') : undefined;
}
