import { MongoClient, type ClientSession, type Db } from 'mongodb';

/**
 * Create missing indexes for the collections in the database.
 *
 * @param database The database to create indexes for.
 */
export async function createMissingIndexes(database: Db): Promise<void> {
    await Promise.all([
        database.collection('products').createIndexes([
            { key: { group: 1 }, name: 'group', background: true },
            { key: { name: 1 }, name: 'name', background: true },
            { key: { group: 1, name: 1 }, name: 'group_name', unique: true, background: true },
            {
                key: { group: 1, name: 1, 'years.year': 1 },
                name: 'group_name_year',
                unique: true,
                background: true,
            },
            {
                key: { group: 1, name: 1, 'years.year': 1, 'years.amounts.variant': 1 },
                name: 'group_name_year_variant',
                unique: true,
                background: true,
            },
            { key: { 'updates.time': -1 }, name: 'update_time', background: true },
            {
                key: { group: 1, name: 1, 'updates.time': -1, 'updates.years.year': 1 },
                name: 'group_name_time_year',
                unique: true,
                background: true,
            },
            {
                key: {
                    group: 1,
                    name: 1,
                    'updates.time': -1,
                    'updates.years.year': 1,
                    'updates.years.amounts.variant': 1,
                },
                name: 'group_name_time_year_variant',
                unique: true,
                background: true,
            },
        ]),
        database.collection('variants').createIndexes([
            { key: { group: 1 }, name: 'group', background: true },
            { key: { variant: 1 }, name: 'variant', background: true },
            { key: { order: 1 }, name: 'order', background: true },
            { key: { group: 1, variant: 1 }, name: 'group_variant', unique: true, background: true },
        ]),
        database.collection('groups').createIndexes([
            { key: { group: 1 }, name: 'group', unique: true, background: true },
            { key: { order: 1 }, name: 'order', background: true },
        ]),
        database.collection('user_profiles').createIndexes([
            { key: { email: 1 }, name: 'email', unique: true, background: true },
            { key: { updatedAt: -1 }, name: 'updatedAt', background: true },
        ]),
    ]);
}

export const $clients = new Map<string, MongoClient>();

/**
 * Get a MongoDB client instance.
 *
 * @param uri The connection URI for the MongoDB server.
 * @returns A promise that resolves to the MongoDB client instance.
 */
export async function getClient(uri = process.env.DB ?? ''): Promise<MongoClient> {
    if (!$clients.has(uri)) {
        const _client = await MongoClient.connect(uri, {});
        $clients.set(uri, _client);
        return _client;
    }
    return $clients.get(uri)!;
}

export const $dbs = new Map<string, Db>();

/**
 * Get a MongoDB database instance.
 *
 * @param name The name of the database to connect to. If not provided, the default database name from the environment variable DB_NAME will be used.
 * @param client An optional MongoDB client instance. If not provided, a new client will be created.
 * @returns A promise that resolves to the MongoDB database instance.
 */
export async function db(name = process.env.DB_NAME ?? '', client?: MongoClient): Promise<Db> {
    if (!$dbs.has(name)) {
        const _db = (client ?? (await getClient())).db(name);
        $dbs.set(name, _db);
        await createMissingIndexes(_db);
        return _db;
    }

    return $dbs.get(name)!;
}

/**
 * Execute a function within a MongoDB transaction.
 *
 * @param fn The function to execute within the transaction. It receives a MongoDB session as an argument.
 * @param client An optional MongoDB client instance. If not provided, a new client will be created.
 * @returns A promise that resolves to true if the transaction was successful, false otherwise.
 */
export async function withTransaction(
    fn: (session: ClientSession) => Promise<boolean>,
    client?: MongoClient
): Promise<boolean> {
    const session = (client ?? (await getClient())).startSession();
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
}
