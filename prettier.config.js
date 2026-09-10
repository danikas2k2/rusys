module.exports = {
  singleQuote: true,
  tabWidth: 4,
  printWidth: 120,
  trailingComma: 'es5',
  embeddedLanguageFormatting: 'auto',
  overrides: [
    {
      files: ['*.html', '*.xml', '*.json', '*.js', '*.yaml', '*.yml'],
      options: {
        tabWidth: 2,
      },
    },
    {
      files: ['package.json', 'tsconfig.json', 'tsconfig.*.json'],
      options: {
        tabWidth: 4,
      },
    },
    {
      files: ['*.html', '*.pcss', '*.css', '*.yaml', '*.yml'],
      options: {
        singleQuote: false,
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      options: {
        plugins: ['@ianvs/prettier-plugin-sort-imports'],
        importOrder: [
          '^node:',
          '',
          '^@testing-library/',
          '^@tests/',
          '^vitest$',
          '',
          '<THIRD_PARTY_MODULES>',
          '',
          '^@icons$',
          '',
          '^~/',
          '^(?!.*[.]p?css$)[./].*$',
          '[.]p?css$',
        ],
        importOrderCaseSensitive: false,
        importOrderParserPlugins: ['typescript', 'jsx'],
        importOrderTypeScriptVersion: '5.0.0',
      },
    },
  ],
};
