// noinspection JSUnusedGlobalSymbols
export default {
    extends: ['stylelint-config-standard', 'stylelint-config-prettier'],
    plugins: [
        // TODO custom stylelint-no-unused-selectors need to be added
    ],
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
                        ignoreValues: {
                            inset: /constant\(safe-area-inset-(top|bottom|left|right)\)/,
                            padding: /constant\(safe-area-inset-(top|bottom|left|right)\)/,
                        },
                    },
                ],
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
