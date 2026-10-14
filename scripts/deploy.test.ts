import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { prepareBuildSources } from './deploy';

const requiredFiles = [
    'docker/Dockerfile',
    'docker/compose.yaml',
    'docker/nginx.conf.template',
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
    for (const directory of ['src', 'public', 'docker']) {
        mkdirSync(path.join(root, directory));
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

    it('rejects a file where the optional PostCSS directory must be', () => {
        const root = buildSourceFixture();
        mkdirSync(path.join(root, 'scripts'));
        writeFileSync(path.join(root, 'scripts/postcss'), 'fixture');

        expect(() => prepareBuildSources(root)).toThrow(
            'Cannot prepare deployment directory "scripts/postcss". Ensure scripts/ is writable and scripts/postcss is a directory.'
        );
    });
});
