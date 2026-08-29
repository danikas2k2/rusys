/** @vitest-environment node */
import { mockEnv } from '@tests/mockEnv';
import { inject } from 'vitest';

import { Db, MongoClient } from 'mongodb';

import { $clients, db, getClient, withTransaction } from '~/server/db';

vi.setConfig({ testTimeout: 30_000 });

describe('db', () => {
    mockEnv();

    const uri = inject('mongoUri');

    afterAll(async () => {
        for (const c of $clients.values()) {
            await c.close(true);
        }
    });

    describe('getClient', () => {
        it('fails to create MongoClient instance if uri not passed and env not set', async () => {
            await expect(getClient()).rejects.toThrow(
                'Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"'
            );
        });

        it('fails to create MongoClient instance if empty uri is passed', async () => {
            await expect(getClient('')).rejects.toThrow(
                'Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"'
            );
        });

        it('returns MongoClient instance for specified uri', async () => {
            await expect(getClient(uri)).resolves.toBeInstanceOf(MongoClient);
        });

        it('returns MongoClient instance for env set uri', async () => {
            process.env.DB = uri;

            await expect(getClient()).resolves.toBeInstanceOf(MongoClient);
        });

        it('returns same client instance for same uri', async () => {
            process.env.DB = uri;
            const client1 = await getClient();
            const client2 = await getClient(uri);

            expect(client1).toBe(client2);

            const diffUri = uri.replace('/?', '/test?');
            const client3 = await getClient(diffUri);

            expect(client3).not.toBe(client2);

            process.env.DB = diffUri;
            const client4 = await getClient();

            expect(client3).toBe(client4);
        });
    });

    describe('db', () => {
        beforeEach(() => {
            process.env.DB = uri;
        });

        it('returns a database instance without passed name', async () => {
            const database = await db();

            expect(database).toBeInstanceOf(Db);
            expect(database.databaseName).toBe('test');
        });

        it('returns a database instance for passed name', async () => {
            const database = await db('test2');

            expect(database).toBeInstanceOf(Db);
            expect(database.databaseName).toBe('test2');
        });

        it('returns a database instance for name from env', async () => {
            process.env.DB_NAME = 'test3';
            const database = await db();

            expect(database).toBeInstanceOf(Db);
            expect(database.databaseName).toBe('test3');
        });

        it('returns a database instance for passed name and client', async () => {
            const database = await db('test4', await getClient());

            expect(database).toBeInstanceOf(Db);
            expect(database.databaseName).toBe('test4');
        });
    });

    describe('withTransaction', () => {
        let database: Db;

        beforeEach(async () => {
            process.env.DB = uri;
            database = await db();
        });

        afterEach(async () => {
            await database.dropDatabase();
        });

        it('executes a function within a transaction successfully', async () => {
            await expect(
                withTransaction(async (session) => {
                    const col1 = database.collection('collection1');
                    await col1.insertOne({ test: 'data' }, { session });
                    const col2 = database.collection('collection2');
                    await col2.insertOne({ test: 'data' }, { session });
                    return true;
                })
            ).resolves.toBe(true);
            await expect(database.collection('collection1').countDocuments({})).resolves.toBe(1);
            await expect(database.collection('collection2').countDocuments({})).resolves.toBe(1);
        });

        it('aborts the transaction on failure', async () => {
            await expect(
                withTransaction(async (session) => {
                    const col1 = database.collection('collection1');
                    await col1.insertOne({ test: 'data' }, { session });
                    const col2 = database.collection('collection2');
                    await col2.insertOne({ test: 'data' }, { session });
                    throw new Error('Transaction failed');
                })
            ).rejects.toThrow('Transaction failed');
            await expect(database.collection('collection1').countDocuments({})).resolves.toBe(0);
            await expect(database.collection('collection2').countDocuments({})).resolves.toBe(0);
        });

        it('aborts the transaction on false return', async () => {
            await expect(
                withTransaction(async (session) => {
                    const col1 = database.collection('collection1');
                    await col1.insertOne({ test: 'data' }, { session });
                    const col2 = database.collection('collection2');
                    await col2.insertOne({ test: 'data' }, { session });
                    return false;
                })
            ).resolves.toBe(false);
            await expect(database.collection('collection1').countDocuments({})).resolves.toBe(0);
            await expect(database.collection('collection2').countDocuments({})).resolves.toBe(0);
        });
    });
});
