import path from 'node:path';

import { build, type Plugin } from 'vite';

import { generatePackageJson } from './generate-package-json';

export function buildServer(): Plugin {
    return {
        name: 'build-server',
        enforce: 'post',
        async buildEnd() {
            // Build server after client build completes
            await build({
                configFile: false, // Don't load vite.config.ts again
                plugins: [generatePackageJson()],
                publicDir: false,
                build: {
                    lib: {
                        entry: path.resolve(process.cwd(), 'src/server/index.ts'),
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
                        '~': path.resolve(process.cwd(), './src'),
                        '@tests': path.resolve(process.cwd(), './src/tests'),
                    },
                    extensions: ['.jsx', '.js', '.tsx', '.ts'],
                },
            });
        },
    };
}
