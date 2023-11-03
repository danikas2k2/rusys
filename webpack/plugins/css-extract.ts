import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { type WebpackPlugin } from '../types';

export function getCssExtractPlugin(isDevMode: boolean): WebpackPlugin {
    return new MiniCssExtractPlugin({
        filename: isDevMode ? '[name].[contenthash].css' : '[name].css',
        chunkFilename: isDevMode ? '[id].[contenthash].css' : '[id].css',
        linkType: 'text/css',
    });
}
