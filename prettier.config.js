module.exports = {
    singleQuote: true,
    tabWidth: 4,
    printWidth: 120,
    trailingComma: 'es5',
    overrides: [
        {
            files: ['*.html', '*.less'],
            options: {
                singleQuote: false,
            },
        },
        {
            files: ['*.ts', '*.tsx'],
            options: {
                plugins: ['@ianvs/prettier-plugin-sort-imports'],
                importOrder: [
                    '^react$',
                    '^react-',
                    '<THIRD_PARTY_MODULES>',
                    '^@testing-library/',
                    '^@tests/',
                    '^@assets/',
                    '^@ui/',
                    '^~/',
                    '^(?!.*\\.less$)(.*)$',
                    '\.less$',
                ],
                importOrderCaseInsensitive: true,
                importOrderParserPlugins: ['typescript', 'jsx'],
                importOrderMergeDuplicateImports: true,
                importOrderCombineTypeAndValueImports: true,
                importOrderSortSpecifiers: true,
            },
        },
    ],
};
