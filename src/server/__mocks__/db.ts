import { MongoClient } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { vi } from 'vitest';

import type * as DbModule from '~/server/db';

let $server: MongoMemoryReplSet | undefined;
let $client: MongoClient | undefined;

// eslint-disable-next-line vitest/require-top-level-describe
beforeAll(async () => {
    if (!$server) {
        $server = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
    }
    if (!$client) {
        $client = await MongoClient.connect($server.getUri(), {});
    }
});

// eslint-disable-next-line vitest/require-top-level-describe
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

const actual = await vi.importActual<typeof DbModule>('~/server/db');

// noinspection JSUnusedGlobalSymbols
export const getClient = vi.fn(() => Promise.resolve($client!));

// noinspection JSUnusedGlobalSymbols
export const db = vi.fn((name?: string, client?: MongoClient) => actual.db(name, client ?? $client!));

// noinspection JSUnusedGlobalSymbols
export const withTransaction = vi.fn((fn: Parameters<typeof actual.withTransaction>[0], client?: MongoClient) =>
    actual.withTransaction(fn, client ?? $client!)
);
