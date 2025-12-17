import path from 'node:path';

import type { MinifyOptions } from 'terser';
import { defineConfig } from 'vite';

import { generatePackageJson } from './vite/plugins/generate-package-json';

export default defineConfig(() => {
    return {
        publicDir: false,
        plugins: [generatePackageJson()],
        build: {
            // Important: do NOT delete dist/public that was produced by the client build.
            emptyOutDir: false,
            lib: {
                entry: path.resolve(__dirname, 'src/server/index.ts'),
                formats: ['es'],
                fileName: () => 'server.js',
            },
            outDir: path.resolve(__dirname, 'dist'),
            sourcemap: false,
            minify: 'terser',
            terserOptions: {
                compress: true,
                mangle: true,
                format: {
                    comments: false,
                },
            } satisfies MinifyOptions,
            treeshake: true,
            target: 'node24',
            rollupOptions: {
                external: [
                    'express',
                    'cors',
                    'body-parser',
                    'moment',
                    'mongodb',
                    'helmet',
                    'express-fileupload',
                    // Node.js built-in modules
                    'node:fs',
                    'node:https',
                    'node:path',
                    'node:url',
                    'fs',
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
                '~': path.resolve(__dirname, './src'),
                '@tests': path.resolve(__dirname, './src/tests'),
            },
            extensions: ['.jsx', '.js', '.tsx', '.ts'],
        },
    };
});


