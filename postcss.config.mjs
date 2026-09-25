import { fileURLToPath } from 'node:url';

const nestedPlugin = fileURLToPath(new URL('./scripts/postcss/nested.cjs', import.meta.url));

export default {
    plugins: {
        'postcss-import-ext-glob': {},
        'postcss-import': {},
        'postcss-preset-mantine': {
            features: {
                lightDarkFunction: false,
            },
        },
        'postcss-simple-vars': {},
        'postcss-discard-comments': {
            removeAll: true,
        },
        [nestedPlugin]: {},
        'postcss-preset-env': {
            stage: 0,
            enableClientSidePolyfills: false,
            autoprefixer: false,
            features: {
                clamp: false,
                'light-dark-function': false,
            },
        },
        '@csstools/postcss-relative-color-syntax': {
            preserve: false,
        },
        autoprefixer: {
            overrideBrowserslist: ['defaults', 'not IE 11', 'not op_mini all'],
        },
    },
};
