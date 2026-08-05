import { writeFile, unlink } from 'node:fs/promises';

import { MongoMemoryReplSet } from 'mongodb-memory-server';

import { mongoUriFile } from './mongoUri';

/**
 * Starts a single in-memory MongoDB replica set shared by every server test file,
 * instead of each test file spinning up (and tearing down) its own instance.
 * That per-file startup was the single biggest contributor to the test suite's
 * wall-clock time, since MongoMemoryReplSet.create() takes several seconds.
 */
export default async function setup(): Promise<() => Promise<void>> {
    const server = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
    await writeFile(mongoUriFile, server.getUri(), 'utf-8');

    return async () => {
        await unlink(mongoUriFile).catch(() => undefined);
        await server.stop({ force: true });
    };
}
