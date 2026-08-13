import path from 'node:path';

import type { MinifyOptions } from 'terser';
import { defineConfig, type BuildEnvironmentOptions, type UserConfigExport } from 'vite';

import { cspInlineScriptHashes } from './vite/plugins/csp-inline-scripts.ts';
import { generatePackageJson } from './vite/plugins/generate-package-json.ts';

export default defineConfig(() => {
    const root = import.meta.dirname;

    return {
        publicDir: false,
        plugins: [
            cspInlineScriptHashes({
                input: path.resolve(root, 'dist/public/index.html'),
                output: path.resolve(root, 'src/server/helmetOptions.ts'),
                placeholder: /\["'unsafe-inline'"]; \/\/ Replace with actual hashes.*?$/im,
            }),
            generatePackageJson(),
        ],
        build: {
            // Important: do NOT delete dist/public that was produced by the client build.
            emptyOutDir: false,
            lib: {
                entry: path.resolve(root, 'src/server/index.ts'),
                formats: ['es'],
                fileName: () => 'server.js',
            },
            outDir: path.resolve(root, 'dist'),
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
            rollupOptions: {
                external: [
                    'express',
                    'cors',
                    'body-parser',
                    'mongodb',
                    'helmet',
                    'express-fileupload',
                    // Node.js built-in modules
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
