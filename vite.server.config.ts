import path from 'node:path';

import { defineConfig } from 'vite';

import { generatePackageJson } from './vite/plugins/generate-package-json';

export default defineConfig({
    plugins: [generatePackageJson()],
    publicDir: false, // Don't copy public files in server build
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/server/index.ts'),
            formats: ['es'],
            fileName: () => 'server.js',
        },
        outDir: 'dist',
        emptyOutDir: false, // Don't clear dist since public files are there
        sourcemap: true,
        minify: 'esbuild',
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
            '@ui': path.resolve(__dirname, './src/ui'),
        },
        extensions: ['.jsx', '.js', '.tsx', '.ts'],
    },
});

