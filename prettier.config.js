module.exports = {
    singleQuote: true,
    tabWidth: 4,
    printWidth: 120,
    trailingComma: 'es5',
    overrides: [
        {
            files: ['*.html', '*.pcss', '*.css'],
            options: {
                singleQuote: false,
            },
        },
        {
            files: ['*.ts', '*.tsx'],
            options: {
                plugins: ['@ianvs/prettier-plugin-sort-imports'],
                importOrder: [
                    '^@testing-library/',
                    '^@tests/',
                    '',
                    '^react$',
                    '^react-',
                    '',
                    '<THIRD_PARTY_MODULES>',
                    '',
                    '^~/',
                    '^(?!.*[.]p?css$)[./].*$',
                    '[.]p?css$',
                ],
                importOrderSeparation: true,
                importOrderCaseInsensitive: true,
                importOrderParserPlugins: ['typescript', 'jsx'],
                importOrderMergeDuplicateImports: true,
                importOrderCombineTypeAndValueImports: true,
                importOrderSortSpecifiers: true,
                importOrderTypeScriptVersion: '5.0.0',
            },
        },
    ],
};
