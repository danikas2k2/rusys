import path from 'node:path';

import type { MinifyOptions } from 'terser';
import { defineConfig, type BuildEnvironmentOptions, type UserConfigExport } from 'vite';

import { generatePackageJson } from '../../vite/plugins/generate-package-json.ts';

export default defineConfig(() => {
    const root = path.resolve(import.meta.dirname, '../..');

    return {
        publicDir: false,
        plugins: [generatePackageJson(path.resolve(root, 'dist/server'))],
        build: {
            emptyOutDir: true,
            lib: {
                entry: path.resolve(root, 'src/server/index.ts'),
                formats: ['es'],
                fileName: () => 'server.js',
            },
            outDir: path.resolve(root, 'dist/server'),
            sourcemap: false,
            minify: 'terser',
            terserOptions: {
                compress: true,
                mangle: true,
                format: {
                    comments: false,
                },
            } satisfies MinifyOptions,
            target: 'node24' as BuildEnvironmentOptions['target'],
            rolldownOptions: {
                external: [
                    'express',
                    'cors',
                    'body-parser',
                    'mongodb',
                    'helmet',
                    'express-fileupload',
                    // Node.js built-in modules
                    'sharp',
                    'node:crypto',
                    'node:fs',
                    'node:fs/promises',
                    'node:https',
                    'node:path',
                    'node:url',
                    'crypto',
                    'fs',
                    'fs/promises',
                    'https',
                    'path',
                    'url',
                ],
                output: {
                    format: 'es',
                    entryFileNames: 'server.js',
                },
            },
        },
        resolve: {
            alias: {
                '~': path.resolve(root, './src'),
                '@tests': path.resolve(root, './src/tests'),
            },
            extensions: ['.jsx', '.js', '.tsx', '.ts'],
        },
    } satisfies UserConfigExport;
});
