/* eslint-disable @typescript-eslint/ban-ts-comment */
import getAlias from './alias';
import { type WebpackResolve } from './types';

export default function getResolve(): WebpackResolve {
    return {
        extensions: ['.jsx', '.js', '.tsx', '.ts', '.css', '.less', '.pcss', '.svg'],
        modules: ['node_modules'],
        alias: getAlias(),
        fallback: {
            // async_hooks: require.resolve('async_hooks/'),
            // async_hooks: false,
            // buffer: require.resolve('buffer/'),
            // buffer: false,
            // crypto: require.resolve('crypto-browserify'),
            // crypto: false,
            // http: require.resolve('stream-http'),
            // http: false,
            // os: require.resolve('os-browserify/browser'),
            // os: false,
            // path: require.resolve('path-browserify'),
            // path: false,
            // querystring: require.resolve('querystring-es3'),
            // querystring: false,
            // stream: require.resolve('stream-browserify'),
            // stream: false,
            // url: require.resolve('url/'),
            // url: false,
            // util: require.resolve('util/'),
            // util: false,
            // zlib: require.resolve('browserify-zlib'),
            // zlib: false,
        },
    };
}
