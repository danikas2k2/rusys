import path from 'path';
import { type Configuration } from 'webpack';
import { getExternals } from './webpack/externals';
import { getOptimization } from './webpack/optimization';
import { getPerformance } from './webpack/performance';
import { getCleanBeforeBuildPlugin } from './webpack/plugins/clean-before-build';
import { getCopyPublicPlugin } from './webpack/plugins/copy-public';
import { getCssExtractPlugin } from './webpack/plugins/css-extract';
import { getEnvironmentPlugin } from './webpack/plugins/environment';
import { getIndexHtmlPlugin } from './webpack/plugins/index-html';
import { getMomentLocalesPlugin } from './webpack/plugins/moment-locales';
import { getPackageJsonPlugin } from './webpack/plugins/package-json';
import { getResolve } from './webpack/resolve';
import { getCssRule } from './webpack/rules/css';
import { getLessRule } from './webpack/rules/less';
import { getSvgRule } from './webpack/rules/svg';
import { getTsxRule } from './webpack/rules/tsx';

export default async function (env?: { prod?: boolean }, argv?: { mode?: string }): Promise<Configuration> {
    const isDevMode = !env?.prod && argv?.mode !== 'production';
    const context = process.cwd();
    return {
        target: 'web',
        mode: isDevMode ? 'development' : 'production',
        devtool: isDevMode ? 'inline-source-map' : 'source-map',
        context,
        entry: {
            app: {
                import: './src/client/index.tsx',
                dependOn: ['react', 'router'],
            },
            react: ['react', 'react-dom'],
            router: ['react-router', 'react-router-dom'],
        },
        output: {
            path: path.resolve(context, 'dist/public'),
            publicPath: '/',
            filename: '[name].js',
            globalObject: 'this',
        },
        cache: true,
        module: {
            rules: [getTsxRule(), getSvgRule(), getCssRule(isDevMode), getLessRule(isDevMode)],
        },
        plugins: [
            getCleanBeforeBuildPlugin(),
            getCopyPublicPlugin(),
            getEnvironmentPlugin(isDevMode),
            getMomentLocalesPlugin(),
            getCssExtractPlugin(isDevMode),
            getIndexHtmlPlugin({ chunk: 'app' }),
            getPackageJsonPlugin(),
        ],
        externals: getExternals(isDevMode),
        resolve: getResolve(),
        optimization: getOptimization(isDevMode),
        performance: getPerformance(),
    };
}
