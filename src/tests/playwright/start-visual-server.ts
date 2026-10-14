import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';

async function main() {
    const imagesDir = await mkdtemp(path.join(os.tmpdir(), 'rusys-visual-images-'));
    const require = createRequire(import.meta.url);
    const app = spawn(
        process.execPath,
        [require.resolve('next/dist/bin/next'), 'dev', '-p', '3022', '-H', '127.0.0.1'],
        {
            cwd: path.resolve(import.meta.dirname, '../../..'),
            env: {
                ...process.env,
                NODE_ENV: 'development',
                // Invalid on purpose: an unstubbed database access must fail immediately.
                DB: 'visual-tests-must-not-access-mongodb',
                DB_NAME: 'rusys_playwright_visual',
                IMAGES_DIR: imagesDir,
                NEXT_TELEMETRY_DISABLED: '1',
                PLAYWRIGHT_TEST: '1',
                PLAYWRIGHT_VISUAL: '1',
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
        await rm(imagesDir, { recursive: true, force: true });
    }

    process.on('SIGINT', () => void stop().finally(() => process.exit(0)));
    process.on('SIGTERM', () => void stop().finally(() => process.exit(0)));
    app.on('exit', (code) => void stop().finally(() => process.exit(code ?? 1)));
}

void main().catch((error: unknown) => {
    process.stderr.write(`${String(error)}\n`);
    process.exitCode = 1;
});
