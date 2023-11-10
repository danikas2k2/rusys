import HtmlWebpackPlugin from 'html-webpack-plugin';
import { type WebpackPlugin } from '../types';

interface IndexHtmlPluginOptions {
    name?: string;
    templateName?: string;
    targetName?: string;
    chunk?: string;
    chunks?: string[];
}

export function getIndexHtmlPlugin({
    name = 'index',
    templateName = name,
    targetName = name,
    chunk = name,
    chunks = ['react', 'router', chunk],
}: IndexHtmlPluginOptions = {}): WebpackPlugin {
    return new HtmlWebpackPlugin({
        filename: `${targetName}.html`,
        template: `./public/${templateName}.html`,
        publicPath: '/',
        inject: 'body',
        scriptLoading: 'blocking',
        chunksSortMode: 'manual',
        chunks,
    });
}
