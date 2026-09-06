import path from 'node:path';

import type { UserConfigExport } from 'vite';

import { deployTarget, rollbackTarget, type DeployTargetConfig } from './plugins/deploy.ts';

function createTargetConfig(root: string, plugin: ReturnType<typeof deployTarget>): UserConfigExport {
    return {
        root,
        publicDir: path.resolve(root, 'public'),
        plugins: [plugin],
        build: {
            outDir: path.resolve(root, 'dist'),
            emptyOutDir: false,
            write: false,
            rollupOptions: { input: path.resolve(root, 'index.html') },
        },
    };
}

export function createDeployConfig(config: DeployTargetConfig): UserConfigExport {
    return createTargetConfig(config.root, deployTarget(config));
}

export function createRollbackConfig(config: DeployTargetConfig): UserConfigExport {
    return createTargetConfig(config.root, rollbackTarget(config));
}
