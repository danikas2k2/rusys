import { defineConfig } from 'oxfmt';

export default defineConfig({
    singleQuote: true,
    tabWidth: 4,
    printWidth: 120,
    trailingComma: 'es5',
    embeddedLanguageFormatting: 'auto',
    // Oxfmt does not parse this project's PostCSS nesting/comments; stylelint owns these files.
    ignorePatterns: ['node_modules/**', 'dist/**', 'coverage/**', '**/*.pcss'],
    overrides: [
        {
            files: ['*.html', '*.pcss', '*.css', '*.yaml', '*.yml'],
            options: { singleQuote: false },
        },
        {
            files: ['*.html', '*.xml', '*.json', '*.js', '*.yaml', '*.yml'],
            excludeFiles: ['package.json', 'tsconfig.json', 'tsconfig.*.json', '*.config.json'],
            options: { tabWidth: 2 },
        },
        {
            files: ['*.ts', '*.tsx'],
            options: {
                sortImports: {
                    customGroups: [
                        { groupName: 'node', elementNamePattern: ['node:*', 'node:*/*'] },
                        { groupName: 'tests', elementNamePattern: ['@testing-library/**', '@tests/**', 'vitest'] },
                        { groupName: 'internal-type', elementNamePattern: ['~/**'], selector: 'type' },
                        { groupName: 'internal', elementNamePattern: ['~/**'] },
                        { groupName: 'icons', elementNamePattern: ['@icons'] },
                        { groupName: 'styles', elementNamePattern: ['**/*.css', '**/*.pcss'] },
                        { groupName: 'relative', elementNamePattern: ['./**', '../**'] },
                    ],
                    groups: [
                        'node',
                        { newlinesBetween: true },
                        'tests',
                        { newlinesBetween: true },
                        'builtin',
                        { newlinesBetween: true },
                        ['type', 'external'],
                        { newlinesBetween: true },
                        'icons',
                        { newlinesBetween: true },
                        ['internal-type', 'internal'],
                        'relative',
                        { newlinesBetween: true },
                        'styles',
                        'unknown',
                    ],
                    ignoreCase: true,
                    newlinesBetween: false,
                },
            },
        },
    ],
});
