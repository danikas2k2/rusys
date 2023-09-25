/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
// @ts-ignore
import TerserWebpackPlugin from 'terser-webpack-plugin';
import { type WebpackOptimization } from './types';

export default function getOptimization(isDevMode: boolean): WebpackOptimization {
    const terser = new TerserWebpackPlugin({
        extractComments: true,
        terserOptions: {
            compress: !isDevMode,
        },
    });
    const cssMinimizer = new CssMinimizerPlugin();
    return {
        minimize: !isDevMode,
        minimizer: isDevMode ? [terser] : [terser, cssMinimizer],
        runtimeChunk: 'single',
        /*splitChunks: {
            chunks: 'all',
        },*/
    };
}
