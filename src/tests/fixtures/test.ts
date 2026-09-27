import { readdir, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { test as base, expect } from '@playwright/test';
import { MongoClient, type Db } from 'mongodb';

import { seedScenario, type Scenario } from './data';

interface Runtime {
    uri: string;
    dbName: string;
    imagesDir: string;
    pid: number;
}

async function getRuntime(): Promise<Runtime> {
    const file = path.resolve(process.cwd(), 'src/tests/playwright/.runtime.json');
    const runtime = JSON.parse(await readFile(file, 'utf8')) as Runtime;
    const uri = new URL(runtime.uri);
    if (
        uri.protocol !== 'mongodb:' ||
        uri.hostname !== '127.0.0.1' ||
        runtime.dbName !== 'rusys_playwright' ||
        !runtime.imagesDir.startsWith(path.join(os.tmpdir(), 'rusys-e2e-images-')) ||
        !Number.isInteger(runtime.pid)
    ) {
        throw new Error('Refusing to reset a non-test MongoDB or image directory');
    }
    return runtime;
}

export const test = base.extend<{ scenario: Scenario; db: Db; _seed: void }>({
    scenario: ['basic', { option: true }],
    db: async ({}, run) => {
        const runtime = await getRuntime();
        const client = await MongoClient.connect(runtime.uri);
        try {
            await run(client.db(runtime.dbName));
        } finally {
            await client.close();
        }
    },
    _seed: [
        async ({ db, scenario }, run) => {
            const { imagesDir } = await getRuntime();
            for (const name of await readdir(imagesDir)) {
                await rm(path.join(imagesDir, name), { recursive: true, force: true });
            }
            await seedScenario(db, scenario);
            await run();
        },
        { auto: true },
    ],
});

export { expect };
