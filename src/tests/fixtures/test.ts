import { readdir, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { test as base, expect } from '@playwright/test';
import { MongoClient, type Db } from 'mongodb';

import { seedScenario, type Scenario } from './data';

interface Runtime {
    uri: string;
    pid: number;
    port: number;
    dbName: string;
    imagesDir: string;
}

async function getRuntime(): Promise<Runtime> {
    const file = path.resolve(process.cwd(), 'src/tests/playwright/.runtime.json');
    const runtime = JSON.parse(await readFile(file, 'utf8')) as Runtime;
    const uri = new URL(runtime.uri);
    if (
        uri.protocol !== 'mongodb:' ||
        uri.hostname !== '127.0.0.1' ||
        runtime.port !== 3022 ||
        runtime.dbName !== 'rusys_playwright' ||
        !runtime.imagesDir.startsWith(path.join(os.tmpdir(), 'rusys-e2e-images-')) ||
        !Number.isInteger(runtime.pid)
    ) {
        throw new Error('Refusing to reset a non-test MongoDB or image directory');
    }
    return runtime;
}

export const test = base.extend<{ scenario: Scenario; _seed: void }, { runtime: Runtime; db: Db; imagesDir: string }>({
    scenario: ['basic', { option: true }],
    runtime: [
        async ({}, run) => {
            await run(await getRuntime());
        },
        { scope: 'worker' },
    ],
    baseURL: async ({ runtime }, run) => {
        await run(`http://127.0.0.1:${runtime.port}`);
    },
    db: [
        async ({ runtime }, run) => {
            const client = await MongoClient.connect(runtime.uri);
            try {
                await run(client.db(runtime.dbName));
            } finally {
                await client.close();
            }
        },
        { scope: 'worker' },
    ],
    imagesDir: [
        async ({ runtime }, run) => {
            await run(runtime.imagesDir);
        },
        { scope: 'worker' },
    ],
    _seed: [
        async ({ db, imagesDir, scenario }, run) => {
            for (const name of await readdir(imagesDir)) {
                await rm(path.join(imagesDir, name), { recursive: true, force: true });
            }
            await seedScenario(db, scenario, imagesDir);
            await run();
        },
        { auto: true },
    ],
});

export { expect };
