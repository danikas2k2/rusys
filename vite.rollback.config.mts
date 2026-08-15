import path from 'node:path';

import { defineConfig, type UserConfigExport } from 'vite';

import { rollback } from './vite/plugins/deploy.ts';

// Runs only the Vite lifecycle needed by the rollback plugin; it does not rebuild or overwrite dist/.
export default defineConfig(() => {
    const root = import.meta.dirname;

    return {
        root,
        publicDir: path.resolve(root, 'public'),
        plugins: [rollback()],
        build: {
            outDir: path.resolve(root, 'dist'),
            emptyOutDir: false,
            write: false,
            rollupOptions: {
                input: path.resolve(root, 'index.html'),
            },
        },
    } satisfies UserConfigExport;
});
