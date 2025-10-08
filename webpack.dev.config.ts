import path from 'path';

import { HotModuleReplacementPlugin, type Configuration } from 'webpack';

import 'webpack-dev-server';

import { getExternals } from './webpack/externals';
import { getOptimization } from './webpack/optimization';
import { getPerformance } from './webpack/performance';
import { getCopyPublicPlugin } from './webpack/plugins/copy-public';
import { getCssExtractPlugin } from './webpack/plugins/css-extract';
import { getEnvironmentPlugin } from './webpack/plugins/environment';
import { getIndexHtmlPlugin } from './webpack/plugins/index-html';
import { getMomentLocalesPlugin } from './webpack/plugins/moment-locales';
import { getResolve } from './webpack/resolve';
import { getCssRule } from './webpack/rules/css';
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
                import: [webpackHotMiddleware, './src/client/app/index.tsx'],
                dependOn: ['react', 'router'],
            },
            react: ['react', 'react-dom'],
            router: ['react-router', 'react-router-dom'],
        },
        output: {
            path: path.resolve(context, 'dist/public'),
            publicPath: '/',
            filename: '[name].js',
            clean: true,
        },
        cache: true,
        module: {
            rules: [getTsxRule(), getSvgRule(), getCssRule(true)],
        },
        plugins: [
            getCopyPublicPlugin(),
            getEnvironmentPlugin(true),
            getMomentLocalesPlugin(),
            getCssExtractPlugin(true),
            getIndexHtmlPlugin({ chunk: 'app' }),
            // Add HMR plugin
            new HotModuleReplacementPlugin(),
        ],
        externals: getExternals(true),
        resolve: getResolve(),
        optimization: getOptimization(true),
        performance: getPerformance(true),
    };
}
