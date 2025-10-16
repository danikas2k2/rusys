// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { EsbuildPlugin } from 'esbuild-loader';

import { type WebpackOptimization } from './types';

export function getOptimization(isDevMode: boolean): WebpackOptimization {
    const esbuild = new EsbuildPlugin({
        css: true,
        legalComments: 'none',
        minify: !isDevMode,
    });
    return {
        minimize: !isDevMode,
        minimizer: [esbuild],
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'async',
            minSize: 20000,
            minRemainingSize: 0,
            minChunks: 1,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            enforceSizeThreshold: 50000,
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    reuseExistingChunk: true,
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true,
                },
            },
        },
    };
}
