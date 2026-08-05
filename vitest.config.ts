import path from 'node:path';

import { defineConfig, type Plugin } from 'vitest/config';

const root = path.resolve(__dirname);
const src = path.resolve(root, 'src');
const mocks = path.resolve(root, 'vitest/__mocks__');

/**
 * resolve.alias array — path aliases matching tsconfig.json "paths".
 */
const alias = [
    { find: /^~\/(.*)$/, replacement: `${src}/$1` },
    { find: '@icons', replacement: `${src}/client/common/icons` },
    { find: /^@tests\/(.*)$/, replacement: `${src}/tests/$1` },
    { find: 'package.json', replacement: path.resolve(root, 'package.json') },
];

/**
 * Vite plugin that intercepts CSS/PCSS and SVG imports at resolve time,
 * redirecting them to mock modules. Using a plugin (rather than resolve.alias)
 * ensures the redirect applies to transitive imports inside src/ files.
 */
const mockAssetsPlugin: Plugin = {
    name: 'vitest-mock-assets',
    enforce: 'pre',
    resolveId(id) {
        if (/\.p?css$/.test(id)) {
            return `${mocks}/styleMock.ts`;
        }
        if (/\.svg(\?.*)?$/.test(id)) {
            return `${mocks}/svgMock.tsx`;
        }
        return undefined;
    },
};

const sharedSetup = [path.resolve(root, 'vitest/setup.shared.ts')];

export default defineConfig({
    resolve: { alias },
    plugins: [mockAssetsPlugin],
    test: {
        projects: [
            // ------------------------------------------------------------------
            // Client workspace: jsdom environment for src/client and src/ui
            // ------------------------------------------------------------------
            {
                resolve: { alias },
                plugins: [mockAssetsPlugin],
                test: {
                    name: 'client',
                    globals: true,
                    environment: 'jsdom',
                    pool: 'threads',
                    root,
                    include: ['src/{client,ui}/**/*.test.{ts,tsx}'],
                    setupFiles: [
                        '@testing-library/jest-dom/vitest',
                        ...sharedSetup,
                        path.resolve(root, 'vitest/setup.client.ts'),
                    ],
                },
            },
            // ------------------------------------------------------------------
            // Server workspace: node environment for src/server and src/common
            // ------------------------------------------------------------------
            {
                resolve: { alias },
                plugins: [mockAssetsPlugin],
                test: {
                    name: 'server',
                    globals: true,
                    environment: 'node',
                    pool: 'threads',
                    root,
                    include: ['src/{common,server}/**/*.test.{ts,tsx}'],
                    setupFiles: [...sharedSetup],
                    globalSetup: [path.resolve(root, 'vitest/globalSetup.mongo.ts')],
                },
            },
        ],
        // Coverage config (used when running vitest --coverage)
        coverage: {
            enabled: false,
            provider: 'v8',
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/**/*.d.ts',
                'src/**/*.test.{ts,tsx}',
                'src/tests/**',
                'src/types/**',
                'src/server/index.ts',
                'src/server/dev.ts',
                'src/server/api/debug.ts',
                'src/ui/tutorial/**',
                'src/ui/Element.ts',
            ],
            reporter: ['text', 'json', 'lcov', 'html'],
            thresholds: {
                branches: 85,
                functions: 85,
                lines: 85,
                statements: 85,
            },
        },
    },
});
