import { type ClientSession, type Collection, type Db, MongoClient } from 'mongodb';
import { type Details, type Group, type Variant } from '~/common/types';

export async function createMissingIndexes(db: Db): Promise<void> {
    const details = db.collection('details');
    await details.createIndex({ group: 1 }, { name: 'group', background: true });
    await details.createIndex({ name: 1 }, { name: 'name', background: true });
    await details.createIndex({ group: 1, name: 1 }, { name: 'group_name', unique: true, background: true });
    await details.createIndex(
        { group: 1, name: 1, 'years.year': 1 },
        { name: 'group_name_year', unique: true, background: true }
    );
    await details.createIndex(
        { group: 1, name: 1, 'years.year': 1, 'years.amounts.variant': 1 },
        { name: 'group_name_year_variant', unique: true, background: true }
    );
    await details.createIndex({ 'updates.time': -1 }, { name: 'update_time', background: true });
    await details.createIndex(
        { group: 1, name: 1, 'updates.time': -1, 'updates.years.year': 1 },
        { name: 'group_name_time_year', unique: true, background: true }
    );
    await details.createIndex(
        { group: 1, name: 1, 'updates.time': -1, 'updates.years.year': 1, 'updates.years.amounts.variant': 1 },
        { name: 'group_name_time_year_variant', unique: true, background: true }
    );

    const groups = db.collection('groups');
    await groups.createIndex({ group: 1 }, { name: 'group', unique: true, background: true });
    await groups.createIndex({ order: 1 }, { name: 'order', background: true });

    const variants = db.collection('variants');
    await variants.createIndex({ group: 1 }, { name: 'group', background: true });
    await variants.createIndex({ variant: 1 }, { name: 'variant', background: true });
    await variants.createIndex({ order: 1 }, { name: 'order', background: true });
    await variants.createIndex({ group: 1, variant: 1 }, { name: 'group_variant', unique: true, background: true });
}

let $client: MongoClient;

export async function getClient(uri = process.env.DB): Promise<MongoClient> {
    if (!$client) {
        $client = await MongoClient.connect(uri ?? '', {});
    }
    return $client;
}

let $db: Db;

export async function getDb(name = process.env.DB_NAME, client?: MongoClient): Promise<Db> {
    if (!$db) {
        $db = (client ?? (await getClient())).db(name);
        await createMissingIndexes($db);
    }
    return $db;
}

export const getGroupsCollection = async (): Promise<Collection<Group>> => (await getDb()).collection('groups');
export const getVariantsCollection = async (): Promise<Collection<Variant>> => (await getDb()).collection('variants');
export const getDetailsCollection = async (): Promise<Collection<Details>> => (await getDb()).collection('details');

export const withTransaction = async (fn: (session: ClientSession) => Promise<boolean>): Promise<boolean> => {
    const session = (await getClient()).startSession();
    try {
        session.startTransaction({
            readPreference: 'primary',
            readConcern: { level: 'local' },
            writeConcern: { w: 'majority' },
        });
        if (await fn(session)) {
            await session.commitTransaction();
            return true;
        }
        await session.abortTransaction();
        return false;
    } catch (e) {
        await session.abortTransaction();
        throw e;
    } finally {
        await session.endSession();
    }
};
