// noinspection JSUnusedGlobalSymbols
export default {
    plugins: ['@stylistic/stylelint-plugin'],
    extends: ['stylelint-config-standard', '@css-modules-kit/stylelint-plugin/recommended'],
    rules: {
        'selector-class-pattern': null,
        'import-notation': null,
    },
    customSyntax: 'postcss-less',
    overrides: [
        {
            files: ['**/*.pcss'],
            customSyntax: 'postcss-less',
            rules: {
                'at-rule-prelude-no-invalid': [true, { ignoreAtRules: ['import'] }],
                'declaration-property-value-no-unknown': [
                    true,
                    {
                        ignoreProperties: {
                            inset: ['/(constant|env)\\(safe-area-inset-(top|bottom|left|right)\\)/'],
                            margin: ['/(constant|env)\\(safe-area-inset-(top|bottom|left|right)\\)/'],
                            padding: ['/(constant|env)\\(safe-area-inset-(top|bottom|left|right)\\)/'],
                        },
                    },
                ],
                'function-no-unknown': [true, { ignoreFunctions: ['constant', 'env', 'light-dark'] }],
            },
        },
        {
            files: ['**/*.{htm,html}'],
            customSyntax: 'postcss-html',
        },
        {
            files: ['**/*.{jsx,tsx}'],
            customSyntax: 'postcss-jsx',
            rules: {
                'value-keyword-case': null,
                'no-invalid-position-declaration': null,
                'declaration-property-value-no-unknown': null,
            },
        },
    ],
};
