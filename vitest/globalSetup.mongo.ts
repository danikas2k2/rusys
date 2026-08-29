import { MongoMemoryReplSet } from 'mongodb-memory-server';

/**
 * Starts a single in-memory MongoDB replica set shared by every server test file,
 * instead of each test file spinning up (and tearing down) its own instance.
 * That per-file startup was the single biggest contributor to the test suite's
 * wall-clock time, since MongoMemoryReplSet.create() takes several seconds.
 */
export default async function setup({ provide }: { provide: (key: 'mongoUri', value: string) => void }) {
    const server = await MongoMemoryReplSet.create({
        binary: { version: '8.2.6' },
        replSet: { count: 1, ip: '127.0.0.1', storageEngine: 'wiredTiger' },
    });
    provide('mongoUri', server.getUri());

    return async () => {
        await server.stop({ force: true });
    };
}
