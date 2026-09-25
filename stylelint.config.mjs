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
                'declaration-block-no-duplicate-custom-properties': null,
                'declaration-property-value-no-unknown': true,
                'function-no-unknown': [true, { ignoreFunctions: ['constant', 'light-dark'] }],
                'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global', 'local'] }],
            },
        },
    ],
};
