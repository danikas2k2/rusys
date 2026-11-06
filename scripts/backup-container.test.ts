import { execFileSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, test } from 'vitest';

describe('container backup', () => {
    const dirs: string[] = [];

    afterEach(() => dirs.splice(0).forEach((dir) => rmSync(dir, { recursive: true, force: true })));

    test('runs the weekly backup and reports failures without losing the last success', () => {
        const dir = mkdtempSync(path.join(tmpdir(), 'backup-container-'));
        dirs.push(dir);
        for (const name of ['bin', 'images']) {
            mkdirSync(path.join(dir, name));
        }
        writeFileSync(path.join(dir, 'mongo'), 'fixture');
        for (const [name, body] of Object.entries({
            date: '[ "$1" = +%s ] && echo 1234 || echo 7-02',
            flock: 'exit 0',
            mongodump: 'echo archive',
            restic: 'echo "$*" >> "$LOG"; [ "$FAIL" != 1 ]',
        })) {
            const file = path.join(dir, 'bin', name);
            writeFileSync(file, `#!/bin/sh\n${body}\n`);
            chmodSync(file, 0o755);
        }
        const env = {
            ...process.env,
            PATH: `${dir}/bin:${process.env.PATH}`,
            LOG: `${dir}/log`,
            RESTIC_REPOSITORY: 'fixture',
            RESTIC_PASSWORD_FILE: `${dir}/password`,
            MONGO_BACKUP_CONFIG: `${dir}/mongo`,
            BACKUP_WORK_DIR: `${dir}/work`,
            BACKUP_IMAGES_DIR: `${dir}/images`,
            BACKUP_METRICS_DIR: `${dir}/metrics`,
        };
        const run = (extra = {}) => execFileSync('sh', ['scripts/backup/run.sh'], { env: { ...env, ...extra } });
        run();

        expect(readFileSync(`${dir}/log`, 'utf8')).toContain('backup --force --tag rusys');
        expect(readFileSync(`${dir}/log`, 'utf8')).toContain('forget --tag rusys --keep-within 3m --prune');
        expect(() => run({ FAIL: '1' })).toThrow();
        expect(readFileSync(`${dir}/metrics/backup.prom`, 'utf8')).toContain('rusys_backup_last_run_success 0');
        expect(readFileSync(`${dir}/metrics/backup.prom`, 'utf8')).toContain(
            'rusys_backup_last_success_timestamp_seconds 1234'
        );
        expect(() => readFileSync(`${dir}/work/mongodb.archive`)).toThrow();
    });
});
