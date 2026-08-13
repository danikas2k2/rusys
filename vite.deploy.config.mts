import path from 'node:path';

import { defineConfig, type UserConfigExport } from 'vite';

import { deploy } from './vite/plugins/deploy.ts';

/**
 * Deploy-only Vite config.
 *
 * Usage (example):
 * - Check, build and deploy: `pnpm deploy`
 * - Build artifacts first: `pnpm build`
 * - Deploy on demand: `pnpm deploy:production`
 *
 * Notes:
 * - We intentionally set `build.write = false` to avoid writing any new build output.
 * - The `deploy()` plugin runs in `closeBundle()` and uploads existing `dist/` + docker files.
 */
export default defineConfig(() => {
    const root = import.meta.dirname;

    return {
        root,
        publicDir: path.resolve(root, 'public'),
        plugins: [deploy()],
        build: {
            // Do not touch the existing `dist/` output (we just want to run deploy hook).
            outDir: path.resolve(root, 'dist'),
            emptyOutDir: false,
            write: false,
            // Minimal input so Vite can run a build lifecycle and reach closeBundle().
            rollupOptions: {
                input: path.resolve(root, 'index.html'),
            },
        },
    } satisfies UserConfigExport;
});
