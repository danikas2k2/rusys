// noinspection JSUnusedGlobalSymbols
export default {
    extends: ['stylelint-config-standard'],
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
            files: ['*.pcss', '**/*.pcss'],
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
            files: ['*.htm', '**/*.htm', '*.html', '**/*.html'],
            customSyntax: 'postcss-html',
        },
        {
            files: ['*.jsx', '**/*.jsx', '*.tsx', '**/*.tsx'],
            customSyntax: 'postcss-jsx',
            rules: {
                'value-keyword-case': null,
            },
        },
    ],
};
