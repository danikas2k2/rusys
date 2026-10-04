import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const app = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'dev', '-p', '3022', '-H', '127.0.0.1'], {
    cwd: path.resolve(import.meta.dirname, '../../..'),
    env: {
        ...process.env,
        NODE_ENV: 'development',
        NEXT_TELEMETRY_DISABLED: '1',
        PLAYWRIGHT_TEST: '1',
    },
    stdio: 'inherit',
});

let stopping = false;
function stop() {
    if (stopping) {
        return;
    }
    stopping = true;
    app.kill('SIGTERM');
}

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
app.on('exit', (code) => process.exit(code ?? 0));
