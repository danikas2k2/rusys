import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';

import { MongoMemoryReplSet } from 'mongodb-memory-server';

async function main() {
    // Never load .env.local here: the app process receives an explicit temporary DB URI.
    const mongo = await MongoMemoryReplSet.create({
        binary: { version: '8.2.6' },
        replSet: { count: 1, ip: '127.0.0.1', storageEngine: 'wiredTiger' },
    });
    const imagesDir = await mkdtemp(path.join(os.tmpdir(), 'rusys-e2e-images-'));
    const dbName = 'rusys_playwright';
    const runtimePath = path.resolve(import.meta.dirname, '.runtime.json');
    await writeFile(
        runtimePath,
        JSON.stringify({ uri: mongo.getUri(), port: 3022, dbName, imagesDir, pid: process.pid })
    );
    const require = createRequire(import.meta.url);

    const app = spawn(
        process.execPath,
        [require.resolve('next/dist/bin/next'), 'dev', '-p', '3022', '-H', '127.0.0.1'],
        {
            cwd: path.resolve(import.meta.dirname, '../../..'),
            env: {
                ...process.env,
                NODE_ENV: 'development',
                DB: mongo.getUri(),
                DB_NAME: dbName,
                IMAGES_DIR: imagesDir,
                NEXT_TELEMETRY_DISABLED: '1',
                PLAYWRIGHT_TEST: '1',
            },
            stdio: 'inherit',
        }
    );

    let stopping = false;
    async function stop() {
        if (stopping) {
            return;
        }
        stopping = true;
        app.kill('SIGTERM');
        await mongo.stop({ force: true });
        await rm(imagesDir, { recursive: true, force: true });
        const activeRuntime = await readFile(runtimePath, 'utf8').catch(() => '');
        if (activeRuntime && (JSON.parse(activeRuntime) as { pid: number }).pid === process.pid) {
            await rm(runtimePath, { force: true });
        }
    }

    process.on('SIGINT', () => void stop().finally(() => process.exit(0)));
    process.on('SIGTERM', () => void stop().finally(() => process.exit(0)));
    app.on('exit', (code) => void stop().finally(() => process.exit(code ?? 1)));
}

void main().catch((error: unknown) => {
    process.stderr.write(`${String(error)}\n`);
    process.exitCode = 1;
});
