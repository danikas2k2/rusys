import ts from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import functional from 'eslint-plugin-functional';
import imp from 'eslint-plugin-import';
import jest from 'eslint-plugin-jest';
import a11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
    { ignores: ['coverage/*', 'data/*', 'dist/*', 'docker/*', 'node_modules/*', 'public/*'] },
    {
        ...react.configs.flat['recommended'],
        settings: {
            react: {
                version: 'detect', // You can add this if you get a warning about the React version when you lint
            },
        },
    },
    reactHooks.configs.flat['recommended-latest'],
    a11y.flatConfigs.recommended,
    {
        files: ['**/*.test.{ts,tsx}', '**/__mocks__/*.{ts,tsx}'],
        ...jest.configs['flat/all'],
        rules: {
            ...jest.configs['flat/all'].rules,
            'jest/no-hooks': 'off',
            'jest/no-untyped-mock-factory': 'off',
            'jest/prefer-expect-assertions': 'off',
            'jest/prefer-importing-jest-globals': 'off',
            'jest/max-expects': ['error', { max: 9 }],
            'jest/prefer-ending-with-an-expect': ['error', { assertFunctionNames: ['waitFor'] }],
            'jest/require-hook': ['error', { allowedFunctionCalls: ['mockEnv', 'mockWindow'] }],
        },
    },
    {
        plugins: { prettier },
        ...prettierConfig,
    },
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser,
            parserOptions: {
                ecmaFeatures: { modules: true },
                ecmaVersion: 'latest',
                project: './tsconfig.json',
            },
            globals: {
                Atomics: 'readonly',
                SharedArrayBuffer: 'readonly',
            },
        },
        plugins: {
            functional,
            import: imp,
            '@typescript-eslint': ts,
            ts,
        },
        rules: {
            ...ts.configs['eslint-recommended'].rules,
            ...ts.configs['recommended'].rules,
            // 'ts/return-await': 2,
            '@typescript-eslint/explicit-function-return-type': [
                'warn',
                {
                    allowExpressions: true,
                    allowTypedFunctionExpressions: true,
                    allowHigherOrderFunctions: true,
                    allowDirectConstAssertionInArrowFunctions: true,
                    allowConciseArrowFunctionExpressionsStartingWithVoid: true,
                    allowFunctionsWithoutTypeParameters: true,
                },
            ],
            '@typescript-eslint/no-angle-bracket-type-assertion': 'off',
            '@typescript-eslint/no-unused-expressions': ['error', {}],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as' }],
            'comma-dangle': ['error', 'only-multiline'],
            'import/no-nodejs-modules': 'off',
            'import/no-unresolved': 'off',
            'import/prefer-default-export': 'off',
            'import/order': 'off',
            'simple-import-sort/imports': 'off',
            'simple-import-sort/exports': 'off',
            'no-console': 'warn',
            'no-unused-expressions': 'error',
            'no-unused-labels': 'error',
            'no-unused-vars': 'off',
            'no-useless-rename': 'error',
            'object-shorthand': 'error',
            'padded-blocks': ['error', 'never'],
            semi: ['error', 'always'],
            eqeqeq: [
                'error',
                'always',
                {
                    null: 'ignore',
                },
            ],
            'prettier/prettier': 'error',
            'react-hooks/exhaustive-deps': 'error',
            'react/prop-types': 0,
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    fixStyle: 'inline-type-imports',
                    disallowTypeAnnotations: true,
                },
            ],
            'no-duplicate-imports': 'off',
            'import/named': 'off',
            'import/default': 'off',
            'import/no-extraneous-dependencies': 'off',
            'prefer-const': 'error',
            'no-shadow': 'error',
            'no-redeclare': 'off',
            '@typescript-eslint/no-redeclare': 'error',
            'block-scoped-var': 'error',
        },
        settings: {
            'import/resolver': {
                typescript: {
                    project: './tsconfig.json',
                },
            },
        },
    },
    {
        files: ['**/*.test.{ts,tsx}', '**/__mocks__/*.{ts,tsx}'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            'react/display-name': 'off',
            'import/no-named-as-default': 'off',
            'no-console': 'off',
            'jest/valid-title': ['error', { disallowedWords: ['should'] }],
        },
    },
    {
        files: ['*.config.{js,ts}'],
        rules: {
            'no-undef': 'off',
            'import/no-commonjs': 'off',
            'prettier/prettier': 'off',
            '@typescript-eslint/no-var-requires': 'off',
        },
    },
    {
        files: ['*.pcss.d.ts'],
        rules: {
            'no-undef': 'off',
            'prettier/prettier': 'off',
        },
    },
];
