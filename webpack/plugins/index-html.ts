import HtmlWebpackPlugin from 'html-webpack-plugin';
import { type WebpackPlugin } from '../types';

interface IndexHtmlPluginOptions {
    name?: string;
    chunk?: string;
    chunks?: string[];
}

export function getIndexHtmlPlugin({
    name = 'index',
    chunk = name,
    chunks = ['react', 'router', chunk],
}: IndexHtmlPluginOptions = {}): WebpackPlugin {
    return new HtmlWebpackPlugin({
        filename: `${name}.html`,
        template: `./public/${name}.html`,
        publicPath: '/',
        inject: 'body',
        scriptLoading: 'blocking',
        chunksSortMode: 'manual',
        chunks,
    });
}
