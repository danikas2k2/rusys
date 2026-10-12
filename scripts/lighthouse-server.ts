import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

import { MongoMemoryReplSet } from 'mongodb-memory-server';

async function main(): Promise<void> {
    const mongo = await MongoMemoryReplSet.create({
        binary: { version: '8.2.6' },
        replSet: { count: 1, ip: '127.0.0.1', storageEngine: 'wiredTiger' },
    });
    const dbName = 'rusys_lighthouse';
    const token = 'a'.repeat(64);
    const profile = {
        sub: 'lighthouse-audit',
        email: 'lighthouse@example.test',
        name: 'Lighthouse Audit',
        picture: '',
        allowed: true,
    };
    const { MongoClient } = await import('mongodb');
    const client = await MongoClient.connect(mongo.getUri());
    try {
        const { seedScenario } = await import('../src/tests/fixtures/data');
        await seedScenario(client.db(dbName), 'history', process.cwd());
        await client
            .db(dbName)
            .collection('sessions')
            .insertOne({
                tokenHash: createHash('sha256').update(token).digest('hex'),
                profile,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            });
    } finally {
        await client.close();
    }

    const require = createRequire(import.meta.url);
    const app = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'start', '-p', '4173'], {
        cwd: process.cwd(),
        env: {
            ...process.env,
            DB: mongo.getUri(),
            DB_NAME: dbName,
            GOOGLE_CLIENT_ID: 'lighthouse-audit',
            GOOGLE_ALLOWED_USERS: profile.email,
        },
        stdio: 'inherit',
    });

    let stopping = false;
    const stop = async () => {
        if (stopping) {
            return;
        }
        stopping = true;
        app.kill('SIGTERM');
        await mongo.stop({ force: true });
    };
    process.on('SIGINT', () => void stop().finally(() => process.exit(0)));
    process.on('SIGTERM', () => void stop().finally(() => process.exit(0)));
    app.on('exit', (code) => void stop().finally(() => process.exit(code ?? 1)));
}

void main().catch((error: unknown) => {
    process.stderr.write(`${String(error)}\n`);
    process.exitCode = 1;
});
