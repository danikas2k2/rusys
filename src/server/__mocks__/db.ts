import { type ClientSession, type Collection, MongoClient } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { type Details, type Group, type Variant } from '~/common/types';

let server: MongoMemoryReplSet | undefined;
let client: MongoClient | undefined;

const { createMissingIndexes } = jest.requireActual('~/server/db');

async function startServer(): Promise<void> {
    if (!server) {
        server = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
    }
    if (!client) {
        client = await MongoClient.connect(server.getUri(), {});
        // client.db().command({ setParameter: 1, maxTransactionLockRequestTimeoutMillis: 5000 });
        await createMissingIndexes(client.db());
    }
}

async function stopServer(): Promise<void> {
    if (client) {
        await client.close();
        client = undefined;
    }
    if (server) {
        await server.stop();
        server = undefined;
    }
}

beforeAll(async () => startServer());

afterAll(async () => stopServer());

export const getClient = jest.fn<Promise<MongoClient>, any, any>(() => Promise.resolve(client!));

export const getGroupsCollection = jest.fn<Promise<Collection<Group>>, any, any>(async () =>
    Promise.resolve(client!.db().collection('groups'))
);

export const getVariantsCollection = jest.fn<Promise<Collection<Variant>>, any, any>(async () =>
    Promise.resolve(client!.db().collection('variants'))
);

export const getDetailsCollection = jest.fn<Promise<Collection<Details>>, any, any>(async () =>
    Promise.resolve(client!.db().collection('details'))
);

export const withTransaction = jest.fn<Promise<any>, any, any>(
    async (fn: (session: ClientSession) => Promise<boolean>): Promise<boolean> => {
        const session = client!.startSession();
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
);
