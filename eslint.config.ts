import ts from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import functional from 'eslint-plugin-functional';
import imp from 'eslint-plugin-import';
import jest from 'eslint-plugin-jest';
import a11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactCompiler from 'eslint-plugin-react-compiler';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
    {
        ignores: ['coverage/*', 'data/*', 'dist/*', 'docker/*', 'node_modules/*', 'public/*'],
        files: ['src/**/*.{ts,tsx}'],
    },
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
        settings: {
            'import/resolver': {
                typescript: {
                    project: './tsconfig.json',
                    alwaysTryTypes: true,
                },
            },
        },
        rules: {
            ...jest.configs['flat/all'].rules,
            'jest/no-hooks': 'off',
            'jest/no-untyped-mock-factory': 'off',
            'jest/prefer-expect-assertions': 'off',
            'jest/prefer-importing-jest-globals': 'off',
            'jest/max-expects': ['error', { max: 9 }],
            'jest/prefer-ending-with-an-expect': ['error', { assertFunctionNames: ['waitFor'] }],
            'jest/require-hook': ['error', { allowedFunctionCalls: ['mockEnv', 'mockWindow'] }],
            // Disable valid-mock-module-path as it doesn't support TypeScript path aliases
            // eslint-import-resolver-typescript already handles path resolution
            'jest/valid-mock-module-path': 'off',
        },
    },
    {
        plugins: { prettier },
        ...prettierConfig,
    },
    {
        files: ['src/**/*.{ts,tsx}'],
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
            'react-compiler': reactCompiler,
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
            'react-compiler/react-compiler': 'error',
            'react/prop-types': 0,

            // TODO use eslint-config-mantine
            // Mantine recommended rules
            'array-callback-return': 'error',
            'no-self-compare': 'error',
            'no-template-curly-in-string': 'error',
            'default-case-last': 'error',
            'dot-notation': 'error',
            'no-alert': 'error',
            'no-else-return': 'error',
            'no-eval': 'warn',
            'no-lonely-if': 'error',
            'no-multi-assign': 'error',
            'no-multi-str': 'error',
            'no-param-reassign': 'error',
            'no-return-assign': 'error',
            'no-script-url': 'error',
            'no-sequences': 'error',
            'no-throw-literal': 'error',
            'no-unneeded-ternary': 'error',
            'no-useless-call': 'error',
            'no-useless-constructor': 'error',
            'no-useless-return': 'error',
            'operator-assignment': ['error', 'always'],
            'prefer-exponentiation-operator': 'error',
            'prefer-object-has-own': 'error',
            'prefer-promise-reject-errors': 'error',
            'prefer-object-spread': 'error',
            'prefer-template': 'error',
            yoda: 'error',
            radix: 'error',
            '@typescript-eslint/consistent-generic-constructors': 'error',
            '@typescript-eslint/method-signature-style': ['error', 'property'],
            // 'react/button-has-type': 'error',
            'react/jsx-boolean-value': 'error',
            'react/jsx-curly-brace-presence': ['error', 'never'],
            'react/jsx-fragments': ['error', 'syntax'],
            'react/jsx-no-comment-textnodes': 'error',
            'react/jsx-no-duplicate-props': 'error',
            'react/jsx-no-target-blank': 'error',
            'react/no-children-prop': 'error',
            'react/no-deprecated': 'error',
            'react/no-find-dom-node': 'error',
            'react/no-string-refs': 'error',
            'react/self-closing-comp': 'error',
            'react/void-dom-elements-no-children': 'error',
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

            // my custom overrides
            'arrow-body-style': ['error', 'as-needed'],
            'prefer-arrow-callback': ['error', { allowNamedFunctions: false }],
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

            // my custom overrides
            'arrow-body-style': ['error', 'as-needed'],
            'prefer-arrow-callback': ['error', { allowNamedFunctions: false }],
        },
    },
    {
        files: ['*.config.{js,ts}'],
        languageOptions: {
            parser,
            parserOptions: {
                ecmaFeatures: { modules: true },
                ecmaVersion: 'latest',
            },
        },
        plugins: {
            '@typescript-eslint': ts,
            ts,
        },
        rules: {
            'no-undef': 'off',
            'import/no-commonjs': 'off',
            'prettier/prettier': 'off',
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
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
