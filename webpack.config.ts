/* eslint-disable @typescript-eslint/ban-ts-comment */
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
// @ts-ignore
import CopyWebpackPlugin from 'copy-webpack-plugin';
// @ts-ignore
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
// @ts-ignore
import GeneratePackageJsonPlugin from 'generate-package-json-webpack-plugin';
// @ts-ignore
import HtmlWebpackPlugin from 'html-webpack-plugin';
// @ts-ignore
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
// @ts-ignore
import WebpackMomentLocales from 'moment-locales-webpack-plugin';
// @ts-ignore
import path from 'path';
// @ts-ignore
import TerserWebpackPlugin from 'terser-webpack-plugin';
import type { Configuration } from 'webpack';
import { EnvironmentPlugin } from 'webpack';
import 'webpack-dev-server';
// @ts-ignore
import PackageJson from './package.json';

async function importPlugin<T = unknown>(plugin: string): Promise<T> {
    return (await import(plugin)).default;
}

const config = async (env: { prod: boolean }, argv: { mode: string }): Promise<Configuration> => {
    const isDevMode = !env.prod && argv.mode !== 'production';

    const alias = {
        '@icons': path.resolve(__dirname, 'src/icons'),
        '@ui': path.resolve(__dirname, 'src/ui'),
        '~': path.resolve(__dirname, 'src'),
    };

    const styleLoader = isDevMode ? 'style-loader' : MiniCssExtractPlugin.loader;

    const cssLoader = {
        loader: 'css-loader',
        options: {
            modules: {
                auto: (path: string) => !path.includes('node_modules'),
                mode: 'local',
                localIdentName: isDevMode ? '[path][name]__[local]' : '[hash:base64]',
            },
        },
    };

    const postcssLoader = {
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

    const mdxLoader = {
        loader: '@mdx-js/loader',
        options: {
            development: isDevMode,
            providerImportSource: '@mdx-js/react',
            remarkPlugins: [await importPlugin('remark-gfm'), await importPlugin('remark-rehype')],
            rehypePlugins: [await importPlugin('rehype-prism-plus')],
        },
    };

    return {
        target: 'web',
        mode: isDevMode ? 'development' : 'production',
        devtool: isDevMode ? 'eval' : 'source-map',
        context: __dirname,
        entry: {
            app: {
                import: './src/client/index.tsx',
                dependOn: ['react', 'router'],
            },
            tutorial: {
                import: './src/tutorial/index.tsx',
                dependOn: ['react', 'router'],
            },
            react: ['react', 'react-dom'],
            router: ['react-router', 'react-router-dom'],
        },
        output: {
            path: path.resolve(__dirname, 'dist/public'),
            filename: '[name].js',
            globalObject: 'this',
        },
        cache: true,
        module: {
            rules: [
                {
                    test: /\.[jt]sx?$/,
                    exclude: /node_modules/,
                    use: ['ts-loader', 'css-module-wrapper'],
                },
                {
                    test: /\.mdx?$/,
                    exclude: /node_modules/,
                    use: [
                        mdxLoader,
                        {
                            loader: 'css-module-wrapper',
                            options: {
                                classNames: false,
                            },
                        },
                    ],
                },
                {
                    test: /\.svg$/,
                    use: [
                        {
                            loader: 'react-svg-loader',
                            options: {
                                svgo: {
                                    plugins: [{ removeViewBox: false }],
                                },
                            },
                        },
                    ],
                },
                {
                    test: /\.css$/,
                    use: [styleLoader, cssLoader, postcssLoader, 'less-import-once'],
                },
                {
                    test: /\.less$/,
                    use: [styleLoader, cssLoader, postcssLoader, 'less-loader', 'less-import-once'],
                },
            ],
        },
        plugins: [
            new CleanWebpackPlugin({
                cleanOnceBeforeBuildPatterns: ['**/*', '!server.js'],
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: 'public',
                        globOptions: { ignore: ['**/index.html', '**/tutorial.html'] },
                    },
                ],
            }),
            new EnvironmentPlugin({
                LOCALE: 'lt-LT',
                DEBUG: isDevMode,
            }),
            new WebpackMomentLocales(),
            new MiniCssExtractPlugin({
                filename: isDevMode ? '[name].[contenthash].css' : '[name].css',
                chunkFilename: isDevMode ? '[id].[contenthash].css' : '[id].css',
                linkType: 'text/css',
            }),
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: './public/index.html',
                publicPath: '/',
                inject: 'body',
                scriptLoading: 'blocking',
                chunksSortMode: 'manual',
                chunks: ['react', 'router', 'app'],
            }),
            new HtmlWebpackPlugin({
                filename: 'tutorial.html',
                template: './public/tutorial.html',
                publicPath: '/',
                inject: 'body',
                scriptLoading: 'blocking',
                chunksSortMode: 'manual',
                chunks: ['react', 'router', 'tutorial'],
            }),
            // @ts-ignore
            new GeneratePackageJsonPlugin({
                name: PackageJson.name,
                version: PackageJson.version,
                main: './server.js',
                engines: {
                    node: '>= 18',
                },
                scripts: {
                    start: 'node ./server.js',
                    stop: 'node ./server.js',
                },
                peerDependencies: {
                    'body-parser': '',
                    cors: '',
                    express: '',
                    'jwt-decode': '',
                    lodash: '',
                    moment: '',
                    'nedb-promises': '',
                    react: '',
                    'react-dom': '',
                    'react-redux': '',
                    redux: '',
                },
            }),
        ],
        externals: {
            // fs: 'fs',
            // moment: 'moment',
            // react: 'https://unpkg.com/react@18/cjs/react.production.min.js',
            // 'react-dom': 'ReactDOM',
            // 'react-dom/server': 'ReactDOMServer',
            // 'react-dom/client': 'https://unpkg.com/react-dom@18.2.0/cjs/react-dom.production.min.js',
            // 'react-router': 'ReactRouter',
            // 'react-router-dom': 'ReactRouterDOM',
            // 'video-react': 'https://unpkg.com/video-react/dist/video-react.full.min.js',
        },
        resolve: {
            extensions: ['.jsx', '.js', '.tsx', '.ts', '.css', '.pcss'],
            modules: ['node_modules'],
            alias,
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
        },
        optimization: {
            minimize: true,
            minimizer: [
                new TerserWebpackPlugin({
                    extractComments: true,
                    terserOptions: {
                        compress: !isDevMode,
                    },
                }),
                new CssMinimizerPlugin(),
            ],
            runtimeChunk: 'single',
            /*splitChunks: {
                chunks: 'all',
            },*/
        },
        devServer: {
            compress: true,
            historyApiFallback: true,
            open: true,
            liveReload: true,
            hot: true,
            port: 8000,
            devMiddleware: { writeToDisk: true },
        },
        performance: {
            maxAssetSize: 5 << 20, // TODO: decrease to 1MB
            maxEntrypointSize: 5 << 20, // TODO: decrease to 1MB
            hints: 'error',
            // assetFilter: (assetFilename: string) => !assetFilename.endsWith('.jpg'),
        },
    };
};

export default config;
