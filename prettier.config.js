module.exports = {
    singleQuote: true,
    tabWidth: 4,
    printWidth: 120,
    trailingComma: 'es5',
    embeddedLanguageFormatting: 'auto',
    overrides: [
        {
            files: ['index.html', 'manifest.json'],
            options: {
                tabWidth: 2,
            },
        },
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
                    '^redux',
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
