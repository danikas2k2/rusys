import path from 'node:path';

import { defineConfig, type Plugin } from 'vitest/config';

const root = import.meta.dirname;
const src = path.resolve(root, 'src');
const mocks = path.resolve(root, 'vitest/__mocks__');

/**
 * resolve.alias array — path aliases matching tsconfig.json "paths".
 */
const alias = [
    { find: /^~\/(.*)$/, replacement: `${src}/$1` },
    { find: '@icons', replacement: `${src}/components/icons` },
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
            // Browser-facing code: jsdom environment for components, features and state.
            // ------------------------------------------------------------------
            {
                // Vitest 5 projects inherit the declaring config by default.
                // These projects already declare their own aliases and asset mock plugin.
                extends: false,
                resolve: { alias },
                plugins: [mockAssetsPlugin],
                test: {
                    name: 'client',
                    globals: true,
                    environment: 'jsdom',
                    pool: 'threads',
                    root,
                    include: ['src/{components,features,lib,store}/**/*.test.{ts,tsx}'],
                    setupFiles: [
                        '@testing-library/jest-dom/vitest',
                        ...sharedSetup,
                        path.resolve(root, 'vitest/setup.client.ts'),
                    ],
                },
            },
            // ------------------------------------------------------------------
            // Common workspace: node environment for platform-neutral shared code.
            {
                extends: false,
                resolve: { alias },
                plugins: [mockAssetsPlugin],
                test: {
                    name: 'common',
                    globals: true,
                    environment: 'node',
                    pool: 'threads',
                    root,
                    include: ['src/common/**/*.test.{ts,tsx}'],
                    setupFiles: [...sharedSetup],
                },
            },
            // Server workspace: node environment for src/server.
            // ------------------------------------------------------------------
            {
                extends: false,
                resolve: { alias },
                plugins: [mockAssetsPlugin],
                test: {
                    name: 'server',
                    globals: true,
                    environment: 'node',
                    pool: 'threads',
                    root,
                    include: ['src/server/**/*.test.{ts,tsx}'],
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
                'src/**/__mocks__/**',
                'src/tests/**',
                'src/**/types.ts',
                'src/components/icons.ts',
                'src/components/table/DraggableRow.ts',
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
