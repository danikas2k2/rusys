import { MongoClient, type ClientSession, type Db } from 'mongodb';

import { $clients, $dbs, createMissingIndexes, db, getClient, withTransaction } from '~/server/db';
import { FakeMongo } from '../../vitest/fakeDb';

describe('db', () => {
    const createIndexes = vi.fn().mockResolvedValue([]);
    const collection = vi.fn(() => ({ createIndexes }));
    const database = { databaseName: 'test', collection } as unknown as Db;
    const session = {
        startTransaction: vi.fn(),
        commitTransaction: vi.fn().mockResolvedValue(undefined),
        abortTransaction: vi.fn().mockResolvedValue(undefined),
        endSession: vi.fn().mockResolvedValue(undefined),
    } as unknown as ClientSession;
    const client = {
        db: vi.fn(() => database),
        startSession: vi.fn(() => session),
    } as unknown as MongoClient;

    beforeEach(() => {
        $clients.clear();
        $dbs.clear();
        vi.clearAllMocks();
        vi.stubEnv('DB', 'mongodb://test');
        vi.stubEnv('DB_NAME', 'test');
        vi.spyOn(MongoClient, 'connect').mockResolvedValue(client);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
    });

    it('reuses a client for the same connection URI', async () => {
        await expect(getClient()).resolves.toBe(client);
        await expect(getClient('mongodb://test')).resolves.toBe(client);
        expect(MongoClient.connect).toHaveBeenCalledExactlyOnceWith('mongodb://test', {});

        await getClient('mongodb://other');

        expect(MongoClient.connect).toHaveBeenCalledTimes(2);
    });

    it('does not cache a failed connection', async () => {
        vi.mocked(MongoClient.connect).mockRejectedValueOnce(new Error('Unavailable'));

        await expect(getClient()).rejects.toThrow('Unavailable');
        await expect(getClient()).resolves.toBe(client);
        expect(MongoClient.connect).toHaveBeenCalledTimes(2);
    });

    it('propagates invalid URI errors when the environment has no connection string', async () => {
        vi.stubEnv('DB', undefined);
        vi.mocked(MongoClient.connect).mockImplementationOnce(async (uri) => {
            if (!uri) {
                throw new Error('Invalid connection string');
            }
            return client;
        });

        await expect(getClient()).rejects.toThrow('Invalid connection string');
        expect(MongoClient.connect).toHaveBeenCalledExactlyOnceWith('', {});
    });

    it('propagates invalid URI errors for an explicitly empty URI', async () => {
        vi.mocked(MongoClient.connect).mockImplementationOnce(async (uri) => {
            if (!uri) {
                throw new Error('Invalid connection string');
            }
            return client;
        });

        await expect(getClient('')).rejects.toThrow('Invalid connection string');
        expect(MongoClient.connect).toHaveBeenCalledExactlyOnceWith('', {});
    });

    it('uses the URI from the environment', async () => {
        vi.stubEnv('DB', 'mongodb://from-env');

        await expect(getClient()).resolves.toBe(client);
        expect(MongoClient.connect).toHaveBeenCalledExactlyOnceWith('mongodb://from-env', {});
    });

    it('uses empty defaults when connection settings are absent', async () => {
        vi.stubEnv('DB', undefined);
        vi.stubEnv('DB_NAME', undefined);

        await getClient();
        await db();

        expect(MongoClient.connect).toHaveBeenCalledWith('', {});
        expect(client.db).toHaveBeenCalledWith('');
    });

    it('creates indexes once for a cached database', async () => {
        const first = await db();
        const second = await db('test');

        expect(first).toBe(database);
        expect(second).toBe(first);
        expect(client.db).toHaveBeenCalledExactlyOnceWith('test');
        expect(collection).toHaveBeenCalledTimes(5);
        expect(createIndexes).toHaveBeenCalledTimes(5);
    });

    it('uses an explicitly provided client and database name', async () => {
        await db('other', client);

        expect(client.db).toHaveBeenCalledExactlyOnceWith('other');
        expect(MongoClient.connect).not.toHaveBeenCalled();
    });

    it('creates all required indexes', async () => {
        await createMissingIndexes(database);

        expect(collection.mock.calls.map(([name]) => name)).toStrictEqual([
            'products',
            'variants',
            'groups',
            'user_profiles',
            'sessions',
        ]);
        expect(createIndexes).toHaveBeenCalledWith(
            expect.arrayContaining([expect.objectContaining({ name: 'group_name', unique: true })])
        );
        expect(createIndexes).toHaveBeenCalledWith(
            expect.arrayContaining([expect.objectContaining({ name: 'expires_at', expireAfterSeconds: 0 })])
        );
    });

    it('commits a successful transaction and closes the session', async () => {
        await expect(
            withTransaction(async (received) => {
                expect(received).toBe(session);

                return true;
            })
        ).resolves.toBe(true);

        expect(session.startTransaction).toHaveBeenCalledExactlyOnceWith({
            readPreference: 'primary',
            readConcern: { level: 'local' },
            writeConcern: { w: 'majority' },
        });
        expect(session.commitTransaction).toHaveBeenCalledExactlyOnceWith();
        expect(session.abortTransaction).not.toHaveBeenCalled();
        expect(session.endSession).toHaveBeenCalledExactlyOnceWith();
    });

    it('aborts a transaction when the callback returns false', async () => {
        await expect(withTransaction(async () => false, client)).resolves.toBe(false);

        expect(session.abortTransaction).toHaveBeenCalledExactlyOnceWith();
        expect(session.commitTransaction).not.toHaveBeenCalled();
        expect(session.endSession).toHaveBeenCalledExactlyOnceWith();
    });

    it('aborts and closes the session when the callback throws', async () => {
        await expect(
            withTransaction(async () => {
                throw new Error('Failed');
            })
        ).rejects.toThrow('Failed');

        expect(session.abortTransaction).toHaveBeenCalledExactlyOnceWith();
        expect(session.endSession).toHaveBeenCalledExactlyOnceWith();
    });

    it.each([
        ['commit', true, 1],
        ['abort', false, 0],
    ] as const)('persists writes only when a fake transaction %ss', async (_name, commit, expected) => {
        const fake = new FakeMongo();

        await expect(
            fake.transaction(async () => {
                await fake.db().collection('first').insertOne({ value: 1 });
                await fake.db().collection('second').insertOne({ value: 2 });
                return commit;
            })
        ).resolves.toBe(commit);

        await expect(fake.db().collection('first').countDocuments()).resolves.toBe(expected);
        await expect(fake.db().collection('second').countDocuments()).resolves.toBe(expected);
    });

    it('rolls back writes when a fake transaction throws', async () => {
        const fake = new FakeMongo();

        await expect(
            fake.transaction(async () => {
                await fake.db().collection('first').insertOne({ value: 1 });
                await fake.db().collection('second').insertOne({ value: 2 });
                throw new Error('Transaction failed');
            })
        ).rejects.toThrow('Transaction failed');

        await expect(fake.db().collection('first').countDocuments()).resolves.toBe(0);
        await expect(fake.db().collection('second').countDocuments()).resolves.toBe(0);
    });
});
