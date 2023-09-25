/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { type WebpackPlugin } from '../types';

export default function getIndexHtmlPlugin(): WebpackPlugin {
    return new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './public/index.html',
        publicPath: '/',
        inject: 'body',
        scriptLoading: 'blocking',
        chunksSortMode: 'manual',
        chunks: ['react', 'router', 'app'],
    });
}
