import type { Config } from 'jest';

const base: Config = {
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
    moduleNameMapper: {
        '\\.p?css$': '<rootDir>/jest/__mocks__/styleMock.js',
        '^package.json$': '<rootDir>/package.json',
        '^@tests/(.*)$': '<rootDir>/src/tests/$1',
        '^~/(.*)$': '<rootDir>/src/$1',
    },
    modulePathIgnorePatterns: ['<rootDir>/src/.*?\\.d\\.ts$', '<rootDir>/src/.*?/types\\.ts$'],
    // Allow transpiling ESM-only deps from node_modules (pnpm layout).
    transformIgnorePatterns: ['/node_modules/(?!((\\.pnpm/)?(react-error-boundary|transliteration)))'],
    setupFilesAfterEnv: [
        'jest-extended/all',
        'jest-chain',
        'jest-to-match-shape-of',
        'jest-expect-message',
        '<rootDir>/jest/setup.ts',
        '<rootDir>/jest/expect.ts',
    ],
    transform: {
        '\\.[jt]sx?$': [
            'babel-jest',
            {
                presets: [
                    ['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }],
                    ['@babel/preset-react', { runtime: 'automatic', importSource: 'react' }],
                    '@babel/preset-typescript',
                ],
            },
        ],
        '\\.svg': 'jest-transformer-svg',
    },
};

const config: Config = {
    verbose: true,
    projects: [
        {
            ...base,
            displayName: 'client',
            testEnvironment: 'jsdom',
            setupFilesAfterEnv: ['@testing-library/jest-dom', ...base.setupFilesAfterEnv!],
            testMatch: ['<rootDir>/src/(client|ui)/**/*.test.{ts,tsx}'],
        },
        {
            ...base,
            displayName: 'server',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/src/(common|server)/**/*.test.{ts,tsx}'],
        },
    ],
    collectCoverage: false,
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.test.{ts,tsx}',
        '!src/tests/**',
        '!src/types/**',
        '!src/server/index.ts',
        '!src/server/dev.ts',
        '!src/server/api/debug.ts',
        '!src/ui/tutorial/**',
        '!src/ui/Element.ts',
    ],
    coverageReporters: ['text', 'json', 'lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 85,
            functions: 85,
            lines: 85,
            statements: 85,
        },
    },
};

export default config;
