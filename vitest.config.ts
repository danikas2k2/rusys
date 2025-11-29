import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
        testTimeout: 10_000, // Default timeout for all tests
        // Externalize node:util to avoid bundling issues
        server: {
            deps: {
                external: ['node:util'],
            },
        },
        css: {
            modules: {
                classNameStrategy: 'non-scoped',
            },
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'lcov', 'html'],
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
            thresholds: {
                branches: 85,
                functions: 85,
                lines: 85,
                statements: 85,
            },
        },
    },
    resolve: {
        alias: {
            '~': path.resolve(__dirname, './src'),
            '@tests': path.resolve(__dirname, './src/tests'),
            '@ui': path.resolve(__dirname, './src/ui'),
            'package.json': path.resolve(__dirname, './package.json'),
        },
    },
});
