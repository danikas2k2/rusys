import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { deploy, prepareBuildSources } from './deploy';

vi.mock(import('node:child_process'), () => ({ execFileSync: vi.fn() }));

const requiredFiles = [
    'docker/Dockerfile',
    'docker/compose.yaml',
    'docker/nginx.conf.template',
    'docker/monitoring/config.alloy',
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    'next.config.ts',
    'postcss.config.mjs',
    'tsconfig.json',
    '.dockerignore',
];

const roots: string[] = [];

function buildSourceFixture(): string {
    const root = mkdtempSync(path.join(tmpdir(), 'rusys-deploy-test-'));
    roots.push(root);
    for (const directory of ['src', 'public', 'docker/monitoring']) {
        mkdirSync(path.join(root, directory), { recursive: true });
    }
    for (const file of requiredFiles) {
        writeFileSync(path.join(root, file), 'fixture');
    }
    return root;
}

describe('prepareBuildSources', () => {
    afterEach(() => {
        for (const root of roots.splice(0)) {
            rmSync(root, { recursive: true, force: true });
        }
    });

    it('creates an empty PostCSS directory when the checkout omits it', () => {
        const root = buildSourceFixture();

        prepareBuildSources(root);

        expect(statSync(path.join(root, 'scripts/postcss')).isDirectory()).toBe(true);
    });

    it('preserves existing PostCSS build inputs', () => {
        const root = buildSourceFixture();
        mkdirSync(path.join(root, 'scripts/postcss'), { recursive: true });
        writeFileSync(path.join(root, 'scripts/postcss/custom.js'), 'postcss plugin');

        prepareBuildSources(root);

        expect(statSync(path.join(root, 'scripts/postcss/custom.js')).isFile()).toBe(true);
    });

    it('identifies a missing required PostCSS config before deployment', () => {
        const root = buildSourceFixture();
        rmSync(path.join(root, 'postcss.config.mjs'));

        expect(() => prepareBuildSources(root)).toThrow(
            'Required deployment file "postcss.config.mjs" is missing or has the wrong type. Restore it before deploying.'
        );
    });

    it('identifies a missing required source directory before deployment', () => {
        const root = buildSourceFixture();
        rmSync(path.join(root, 'src'), { recursive: true });

        expect(() => prepareBuildSources(root)).toThrow(
            'Required deployment directory "src" is missing or has the wrong type. Restore it before deploying.'
        );
    });

    it('identifies a missing monitoring config before deployment', () => {
        const root = buildSourceFixture();
        rmSync(path.join(root, 'docker/monitoring/config.alloy'));

        expect(() => prepareBuildSources(root)).toThrow(
            'Required deployment file "docker/monitoring/config.alloy" is missing or has the wrong type. Restore it before deploying.'
        );
    });

    it('rejects a file where the optional PostCSS directory must be', () => {
        const root = buildSourceFixture();
        mkdirSync(path.join(root, 'scripts'));
        writeFileSync(path.join(root, 'scripts/postcss'), 'fixture');

        expect(() => prepareBuildSources(root)).toThrow(
            'Cannot prepare deployment directory "scripts/postcss". Ensure scripts/ is writable and scripts/postcss is a directory.'
        );
    });
});

describe('deploy previous slot cleanup', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.mocked(execFileSync).mockReset();
    });

    function mockRemote(
        workerPids = '17\n19\n',
        failWait = false,
        activeAfterSwitch: 'blue' | 'green' = 'green',
        monitoringRunning = true,
        failAlloyValidation = false
    ) {
        const scripts: string[] = [];
        vi.mocked(execFileSync).mockImplementation((file, _args, options) => {
            if (file !== 'ssh') {
                return '';
            }
            const script = String(options?.input);
            scripts.push(script);
            if (script.includes('monitoring validate /etc/alloy/config.alloy') && failAlloyValidation) {
                throw new Error('Invalid Alloy configuration');
            }
            if (script.includes('.State.Running')) {
                if (script.includes('rusys-monitoring') && !monitoringRunning) {
                    return '';
                }
                return 'true';
            }
            if (script.includes('.State.Health.Status')) {
                return 'healthy';
            }
            if (script.includes('printf blue') && script.includes('printf green')) {
                return 'blue';
            }
            if (script.includes('for process in /proc/[0-9]*')) {
                return workerPids;
            }
            if (script.includes('remaining=$(') && failWait) {
                throw new Error('Worker drain timed out');
            }
            if (script.includes('stop rusys-app-blue') && activeAfterSwitch === 'blue') {
                throw new Error('The active application slot changed before the previous container could be stopped.');
            }
            return '';
        });
        return scripts;
    }

    function deployment() {
        return deploy({ serverUser: 'deploy', serverHost: 'example.test', remotePath: '/srv/rusys' }).closeBundle();
    }

    it('waits for pre-reload workers to exit before stopping the old slot', async () => {
        const scripts = mockRemote();

        await deployment();

        const capture = scripts.findIndex((script) => script.includes('for process in /proc/[0-9]*'));
        const reload = scripts.findIndex((script) => script.includes('nginx -s reload'));
        const wait = scripts.findIndex((script) => script.includes('remaining=$('));
        const stop = scripts.findIndex((script) => script.includes('stop rusys-app-blue'));

        expect(capture).toBeGreaterThanOrEqual(0);
        expect(reload).toBeGreaterThan(capture);
        expect(wait).toBeGreaterThan(reload);
        expect(scripts[wait]).toContain('for pid in 17 19');
        expect(scripts[wait]).toContain('while test "$attempt" -lt 180; do');

        expect(stop).toBeGreaterThan(wait);
        expect(scripts[stop]).toContain("if ! grep -q 'rusys-app-green:3000'");
    });

    it('validates and recreates Alloy from the uploaded config before building the app', async () => {
        const scripts = mockRemote();

        await deployment();

        const upload = vi
            .mocked(execFileSync)
            .mock.calls.find(
                ([file, args]) => file === 'rsync' && Array.isArray(args) && args.includes('--include=/monitoring/***')
            );

        expect(upload).toBeDefined();

        const config = scripts.findIndex((script) =>
            script.includes('compose --env-file .env -f docker/compose.yaml config --quiet')
        );
        const validate = scripts.findIndex((script) =>
            script.includes('run --rm --no-deps monitoring validate /etc/alloy/config.alloy')
        );
        const database = scripts.findIndex((script) => script.includes('up -d --no-deps rusys-db'));
        const monitoring = scripts.findIndex((script) =>
            script.includes('up -d --no-deps --force-recreate monitoring')
        );
        const build = scripts.findIndex((script) => script.includes('build rusys-app-green'));

        expect(config).toBeGreaterThanOrEqual(0);
        expect(validate).toBeGreaterThan(config);
        expect(database).toBeGreaterThan(validate);
        expect(monitoring).toBeGreaterThan(database);
        expect(build).toBeGreaterThan(monitoring);
    });

    it('does not build the app when Alloy fails to start', async () => {
        const scripts = mockRemote('17\n19\n', false, 'green', false);
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('Deployment exited');
        });

        await expect(deployment()).rejects.toThrow('Deployment exited');

        expect(error).toHaveBeenCalledWith(
            '❌ Deployment failed!',
            expect.objectContaining({
                message: 'The monitoring container is not running. Check its Alloy configuration and logs.',
            })
        );
        expect(scripts.some((script) => script.includes('build rusys-app-green'))).toBe(false);
    });

    it('keeps the running services when Alloy validation fails', async () => {
        const scripts = mockRemote('17\n19\n', false, 'green', true, true);
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('Deployment exited');
        });

        await expect(deployment()).rejects.toThrow('Deployment exited');

        expect(error).toHaveBeenCalledWith(
            '❌ Deployment failed!',
            expect.objectContaining({ message: 'Invalid Alloy configuration' })
        );
        expect(scripts.some((script) => script.includes('up -d --no-deps --force-recreate monitoring'))).toBe(false);
        expect(scripts.some((script) => script.includes('build rusys-app-green'))).toBe(false);
    });

    it('leaves the old slot running if the worker drain times out', async () => {
        const scripts = mockRemote('17\n', true);
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('Deployment exited');
        });

        await expect(deployment()).rejects.toThrow('Deployment exited');

        expect(error).toHaveBeenCalledWith(
            '❌ Deployment failed!',
            expect.objectContaining({ message: 'Worker drain timed out' })
        );
        expect(scripts.some((script) => script.includes('stop rusys-app-blue'))).toBe(false);
    });

    it('does not switch or stop a slot when no nginx workers can be identified', async () => {
        const scripts = mockRemote('');
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('Deployment exited');
        });

        await expect(deployment()).rejects.toThrow('Deployment exited');

        expect(error).toHaveBeenCalledWith(
            '❌ Deployment failed!',
            expect.objectContaining({ message: 'Cannot identify the running Nginx workers.' })
        );
        expect(scripts.some((script) => script.includes('nginx -s reload'))).toBe(false);
        expect(scripts.some((script) => script.includes('stop rusys-app-blue'))).toBe(false);
    });

    it('rejects a malformed worker PID before putting it in a remote command', async () => {
        const scripts = mockRemote('17;false\n');
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('Deployment exited');
        });

        await expect(deployment()).rejects.toThrow('Deployment exited');

        expect(error).toHaveBeenCalledWith(
            '❌ Deployment failed!',
            expect.objectContaining({ message: 'Cannot identify the running Nginx workers.' })
        );
        expect(scripts.some((script) => script.includes('nginx -s reload'))).toBe(false);
    });

    it('does not stop a slot if it became active again while waiting', async () => {
        const scripts = mockRemote('17\n', false, 'blue');
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('Deployment exited');
        });

        await expect(deployment()).rejects.toThrow('Deployment exited');

        expect(error).toHaveBeenCalledWith(
            '❌ Deployment failed!',
            expect.objectContaining({
                message: 'The active application slot changed before the previous container could be stopped.',
            })
        );
        expect(scripts.some((script) => script.includes("if ! grep -q 'rusys-app-green:3000'"))).toBe(true);
    });
});
