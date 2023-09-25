import path from 'path';
import { type Configuration, HotModuleReplacementPlugin } from 'webpack';
import 'webpack-dev-server';
// import webpackHotMiddleware from 'webpack-hot-middleware';
import getExternals from './webpack/externals';
import getOptimization from './webpack/optimization';
import getPerformance from './webpack/performance';
import getCleanBeforeBuildPlugin from './webpack/plugins/clean-before-build';
import getCopyPublicPlugin from './webpack/plugins/copy-public';
import getCssExtractPlugin from './webpack/plugins/css-extract';
import getEnvironmentPlugin from './webpack/plugins/environment';
import getIndexHtmlPlugin from './webpack/plugins/index-html';
import getMomentLocalesPlugin from './webpack/plugins/moment-locales';
import getPackageJsonPlugin from './webpack/plugins/package-json';
import getResolve from './webpack/resolve';
import { getCssRule } from './webpack/rules/css';
import { getLessRule } from './webpack/rules/less';
import { getSvgRule } from './webpack/rules/svg';
import { getTsxRule } from './webpack/rules/tsx';

export default async function (): Promise<Configuration> {
    // reload=true  Enable auto reloading when changing JS files or content
    // timeout=1000 Time from disconnecting from server to reconnecting
    const webpackHotMiddleware = 'webpack-hot-middleware/client?reload=true&timeout=1000';
    const context = process.cwd();
    return {
        target: 'web',
        mode: 'development',
        devtool: 'inline-source-map',
        context,
        entry: {
            app: {
                import: [webpackHotMiddleware, './src/client/index.tsx'],
                dependOn: ['react', 'router'],
            },
            react: ['react', 'react-dom'],
            router: ['react-router', 'react-router-dom'],
        },
        output: {
            path: path.resolve(context, 'dist/public'),
            publicPath: '/',
            filename: '[name].js',
            // globalObject: 'this',
            clean: true,
        },
        cache: true,
        module: {
            rules: [getTsxRule(), getSvgRule(), getCssRule(true), getLessRule(true)],
            /*parser: {
                'javascript/auto': {
                    // browserify: true,
                    // commonjs: false,
                    // harmony: true,
                    // createRequire: true,
                    // harmony: false,
                    // import: true,
                    // importMeta: false,
                    // strictThisContextOnImports: false,
                },
            },*/
        },
        plugins: [
            getCleanBeforeBuildPlugin(),
            getCopyPublicPlugin(),
            getEnvironmentPlugin(true),
            getMomentLocalesPlugin(),
            getCssExtractPlugin(true),
            getIndexHtmlPlugin(),
            getPackageJsonPlugin(),
            // Add HMR plugin
            new HotModuleReplacementPlugin(),
        ],
        externals: getExternals(true),
        resolve: getResolve(),
        optimization: getOptimization(true),
        /*optimization: {
            minimize: false,
            // // minimize: true,
            // // namedModules: true,
            // // namedChunks: true,
            // removeAvailableModules: true,
            // flagIncludedChunks: true,
            // // occurrenceOrder: false,
            // usedExports: true,
            // concatenateModules: true,
            sideEffects: false, // <----- in prod defaults to true if left blank
        },*/
        performance: getPerformance(true),
        /*devServer: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            contentBase: path.join(context, 'dist/public'),
            // compress: false,
            // historyApiFallback: true,
            // open: true,
            liveReload: true,
            hot: true,
            // port: 8800,
            // host: 'localhost',
            // devMiddleware: { writeToDisk: true },
        },*/
    };
}
