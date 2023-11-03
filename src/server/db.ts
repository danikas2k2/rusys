import type Nedb from 'nedb';
import nedb from 'nedb-promises';
import path from 'path';

const dbPath = process.env.DATA_PATH || path.resolve(process.cwd(), 'data');

export const DETAILS = nedb.create({ filename: path.resolve(dbPath, 'details.jsonl'), autoload: true });
(async () => await DETAILS.ensureIndex({ fieldName: 'name', unique: true }))();

export const UPDATES = nedb.create({ filename: path.resolve(dbPath, 'updates.jsonl'), autoload: true });
(async () => {
    await UPDATES.ensureIndex({ fieldName: 'name' });
    await UPDATES.ensureIndex({ fieldName: 'time' });
})();

export const MISSING = nedb.create({ filename: path.resolve(dbPath, 'missing.jsonl'), autoload: true });

export const REMOVING = nedb.create({ filename: path.resolve(dbPath, 'removing.jsonl'), autoload: true });
(async () => await REMOVING.ensureIndex({ fieldName: 'name', unique: true }))();

export async function compact(db: unknown): Promise<void> {
    // TODO add delayed data compaction (after 5 minutes, if no other updates)
    await (db as Nedb.Persistence).compactDatafile?.();
}
