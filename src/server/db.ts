import type Nedb from 'nedb';
import nedb from 'nedb-promises';
import path from 'path';
import { type NamedAmounts, type NameWithGroup, type TimedAmounts } from '~/state/details/types';
import { type NamedRemoving } from '~/state/removing/types';
import { type Name } from '~/state/types';

const dbPath = process.env.DATA_PATH || path.resolve(process.cwd(), 'data');

type DetailsDocument = { _id: string } & NamedAmounts;
export const DETAILS = nedb.create({
    filename: path.resolve(dbPath, 'details.jsonl'),
    autoload: true,
}) as nedb<DetailsDocument>;
(async () => {
    await DETAILS.ensureIndex({ fieldName: 'name' });
    await DETAILS.ensureIndex({ fieldName: 'group' });
})();

type UpdatesDocument = { _id: string } & TimedAmounts;
export const UPDATES = nedb.create({
    filename: path.resolve(dbPath, 'updates.jsonl'),
    autoload: true,
}) as nedb<UpdatesDocument>;
(async () => {
    await UPDATES.ensureIndex({ fieldName: 'name' });
    await UPDATES.ensureIndex({ fieldName: 'group' });
    await UPDATES.ensureIndex({ fieldName: 'time' });
})();

type MissingDocument = { _id: string; missing: (Name | NameWithGroup)[] };
export const MISSING = nedb.create({
    filename: path.resolve(dbPath, 'missing.jsonl'),
    autoload: true,
}) as nedb<MissingDocument>;

type RemovingDocument = { _id: string } & NamedRemoving;
export const REMOVING = nedb.create({
    filename: path.resolve(dbPath, 'removing.jsonl'),
    autoload: true,
}) as nedb<RemovingDocument>;
(async () => {
    await REMOVING.ensureIndex({ fieldName: 'name' });
    await REMOVING.ensureIndex({ fieldName: 'group' });
})();

export async function compact(db: unknown): Promise<void> {
    // TODO add delayed data compaction (after 5 minutes, if no other updates)
    await (db as Nedb.Persistence).compactDatafile?.();
}
