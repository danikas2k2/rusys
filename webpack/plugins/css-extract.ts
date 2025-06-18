import { type WebpackPlugin } from '../types';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

export function getCssExtractPlugin(isDevMode: boolean): WebpackPlugin {
    return new MiniCssExtractPlugin({
        filename: isDevMode ? '[name].[contenthash].css' : '[name].css',
        chunkFilename: isDevMode ? '[id].[contenthash].css' : '[id].css',
        linkType: 'text/css',
    });
}
