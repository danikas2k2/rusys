module.exports = {
  singleQuote: true,
  tabWidth: 4,
  printWidth: 120,
  useTabs: false,
  semi: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  embeddedLanguageFormatting: 'auto',
  overrides: [
    {
      files: ['*.md'],
      options: {
        printWidth: 120,
        proseWrap: 'always',
      },
    },
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
      files: ['*.html', '*.css', '*.css', '*.yaml', '*.yml'],
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
          '^(?!.*[.]css$)[./].*$',
          '[.]css$',
        ],
        importOrderCaseSensitive: false,
        importOrderParserPlugins: ['typescript', 'jsx'],
        importOrderTypeScriptVersion: '5.0.0',
      },
    },
  ],
};
