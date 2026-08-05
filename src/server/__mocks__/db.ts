import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';

import { MongoClient } from 'mongodb';
import { vi } from 'vitest';

import type * as DbModule from '~/server/db';
import { mongoUriFile } from '../../../vitest/mongoUri';

// Every test file gets its own database on the single shared replica set
// (started once in vitest/globalSetup.mongo.ts) so parallel files can't see
// each other's data despite reusing the same server. Kept short because some
// code derives further database names from this one (e.g. `${name}_temp_...`)
// and MongoDB caps database names at 64 characters.
const $dbName = `test_${randomUUID().slice(0, 8)}`;

let $client: MongoClient | undefined;

// eslint-disable-next-line vitest/require-top-level-describe
beforeAll(async () => {
    if (!$client) {
        const uri = await readFile(mongoUriFile, 'utf-8');
        $client = await MongoClient.connect(uri, {});
    }
});

// eslint-disable-next-line vitest/require-top-level-describe
afterAll(async () => {
    if ($client) {
        await $client.db($dbName).dropDatabase();
        await $client.close();
        $client = undefined;
    }
});

const actual = await vi.importActual<typeof DbModule>('~/server/db');

// noinspection JSUnusedGlobalSymbols
export const getClient = vi.fn(() => Promise.resolve($client!));

// noinspection JSUnusedGlobalSymbols
export const db = vi.fn((name?: string, client?: MongoClient) => actual.db(name ?? $dbName, client ?? $client!));

// noinspection JSUnusedGlobalSymbols
export const withTransaction = vi.fn((fn: Parameters<typeof actual.withTransaction>[0], client?: MongoClient) =>
    actual.withTransaction(fn, client ?? $client!)
);
