import { MongoClient } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { afterAll, beforeAll, vi } from 'vitest';

// Import actual implementation
import type * as DbModule from '~/server/db';

let $server: MongoMemoryReplSet | undefined;
let $client: MongoClient | undefined;

beforeAll(async () => {
    if (!$server) {
        $server = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
    }
    if (!$client) {
        $client = await MongoClient.connect($server.getUri(), {});
    }
});

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

let actualDb: typeof DbModule.db;
let actualWithTransaction: typeof DbModule.withTransaction;

(async () => {
    const actualModule = await vi.importActual<typeof DbModule>('~/server/db');
    actualDb = actualModule.db;
    actualWithTransaction = actualModule.withTransaction;
})();

// noinspection JSUnusedGlobalSymbols
export const getClient = vi.fn<() => Promise<MongoClient>>(() => Promise.resolve($client!));

// noinspection JSUnusedGlobalSymbols
export const db = vi.fn((name: string | undefined, client?: MongoClient) => actualDb(name, client ?? $client!));

// noinspection JSUnusedGlobalSymbols
export const withTransaction = vi.fn((fn: (session: unknown) => Promise<boolean>, client?: MongoClient) =>
    actualWithTransaction(fn, client ?? $client!)
);
