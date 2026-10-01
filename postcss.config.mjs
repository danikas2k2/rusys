export default {
    plugins: {
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
        'postcss-preset-env': {
            stage: 0,
            enableClientSidePolyfills: false,
            autoprefixer: true,
            features: {
                clamp: false,
                'light-dark-function': false,
                'logical-properties-and-values': false,
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
