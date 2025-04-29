import { MongoClient } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

let $server: MongoMemoryReplSet | undefined;
let $client: MongoClient | undefined;

// eslint-disable-next-line jest/require-top-level-describe
beforeAll(async () => {
    if (!$server) {
        $server = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
    }
    if (!$client) {
        $client = await MongoClient.connect($server.getUri(), {});
    }
});

// eslint-disable-next-line jest/require-top-level-describe
afterAll(async () => {
    if ($client) {
        await $client.close();
        $client = undefined;
    }
    if ($server) {
        await $server.stop();
        $server = undefined;
    }
});

// noinspection JSUnusedGlobalSymbols
export const getClient = jest.fn<Promise<MongoClient>, any, any>(() => Promise.resolve($client!));

const { db: actualDb, withTransaction: actualWithTransaction } = jest.requireActual('~/server/db');

// noinspection JSUnusedGlobalSymbols
export const db = jest.fn((name, client) => actualDb(name, client ?? $client!));

// noinspection JSUnusedGlobalSymbols
export const withTransaction = jest.fn((fn, client) => actualWithTransaction(fn, client ?? $client!));
