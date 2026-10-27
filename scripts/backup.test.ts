import { execFileSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

const script = path.resolve('scripts/backup/run.sh');
const directories: string[] = [];

function fixture() {
    const dir = mkdtempSync(path.join(tmpdir(), 'rusys-backup-'));
    directories.push(dir);
    const bin = path.join(dir, 'bin');
    mkdirSync(bin);
    mkdirSync(path.join(dir, 'images'));
    writeFileSync(path.join(dir, 'mongo'), 'fixture');
    writeFileSync(
        path.join(dir, 'config'),
        `RESTIC_REPOSITORY=fixture\nRESTIC_PASSWORD_FILE=${dir}/password\nMONGO_BACKUP_CONFIG=${dir}/mongo\nBACKUP_WORK_DIR=${dir}/work\nBACKUP_IMAGES_DIR=${dir}/images\nBACKUP_METRICS_DIR=${dir}/metrics\n`
    );
    const commands: Record<string, string> = {
        flock: 'exit 0',
        date: '[ "$1" = +%s ] && echo 123456 || { if [ -f "$TEST_LOG.dumped" ] && [ -n "$TEST_DATE_AFTER_DUMP" ]; then echo "$TEST_DATE_AFTER_DUMP"; else echo "$TEST_DATE"; fi; }',
        docker: '[ "$FAIL_DUMP" = 1 ] && exit 1; touch "$TEST_LOG.dumped"; echo archive',
        restic: 'echo "$*" >> "$TEST_LOG"; [ "$FAIL_RESTIC" = 1 ] && exit 1; exit 0',
    };
    for (const [name, body] of Object.entries(commands)) {
        const executable = path.join(bin, name);
        writeFileSync(executable, `#!/bin/sh\n${body}\n`);
        chmodSync(executable, 0o755);
    }
    const run = (extra: Record<string, string> = {}) =>
        execFileSync('sh', [script, path.join(dir, 'config')], {
            env: {
                ...process.env,
                PATH: `${bin}:${process.env.PATH}`,
                TEST_LOG: path.join(dir, 'log'),
                TEST_DATE: '1-02',
                ...extra,
            },
        });
    return { dir, run };
}

describe('backup job', () => {
    afterEach(() => {
        for (const directory of directories.splice(0)) {
            rmSync(directory, { recursive: true, force: true });
        }
    });

    it('backs up the dump and images hourly, retains three months and records success', () => {
        const { dir, run } = fixture();
        run();

        expect(readFileSync(path.join(dir, 'log'), 'utf8')).toContain('backup --tag rusys --');
        expect(readFileSync(path.join(dir, 'log'), 'utf8')).toContain('forget --tag rusys --keep-within 3m --prune');
        expect(readFileSync(path.join(dir, 'metrics/backup.prom'), 'utf8')).toContain(
            'rusys_backup_last_run_success 1'
        );
        expect(readFileSync(path.join(dir, 'metrics/backup.prom'), 'utf8')).toContain(
            'rusys_backup_last_success_timestamp_seconds 123456'
        );
        expect(() => readFileSync(path.join(dir, 'work/mongodb.archive'))).toThrow('ENOENT');
    });

    it('forces a complete scan on Sunday at 02:00', () => {
        const { dir, run } = fixture();
        run({ TEST_DATE: '7-02' });

        expect(readFileSync(path.join(dir, 'log'), 'utf8')).toContain('backup --force --tag rusys');
    });

    it('keeps the scheduled weekly mode when the dump crosses the hour', () => {
        const { dir, run } = fixture();
        run({ TEST_DATE: '7-02', TEST_DATE_AFTER_DUMP: '7-03' });

        expect(readFileSync(path.join(dir, 'log'), 'utf8')).toContain('backup --force --tag rusys');
    });

    it('preserves the last successful timestamp on failure and removes the dump', () => {
        const { dir, run } = fixture();
        run();

        expect(() => run({ FAIL_RESTIC: '1' })).toThrow('Command failed');

        const metrics = readFileSync(path.join(dir, 'metrics/backup.prom'), 'utf8');

        expect(metrics).toContain('rusys_backup_last_run_success 0');
        expect(metrics).toContain('rusys_backup_last_success_timestamp_seconds 123456');
        expect(() => readFileSync(path.join(dir, 'work/mongodb.archive'))).toThrow('ENOENT');
    });

    it('does not run restic when the dump fails', () => {
        const { dir, run } = fixture();

        expect(() => run({ FAIL_DUMP: '1' })).toThrow('Command failed');
        expect(() => readFileSync(path.join(dir, 'log'))).toThrow('ENOENT');
        expect(readFileSync(path.join(dir, 'metrics/backup.prom'), 'utf8')).toContain(
            'rusys_backup_last_run_success 0'
        );
    });
});
