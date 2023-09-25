import { type WebpackModuleLoader } from '../types';

export default function getPostcssLoader(): WebpackModuleLoader {
    return {
        loader: 'postcss-loader',
        options: {
            postcssOptions: {
                plugins: [
                    'autoprefixer',
                    'postcss-logical-properties',
                    // For old IE browsers
                    // 'postcss-opacity',
                    // 'postcss-disabled',
                    // 'postcss-filter-gradient',
                    // 'postcss-esplit',
                    // 'postcss-pie',
                    // 'fixie',
                ],
            },
        },
    };
}
