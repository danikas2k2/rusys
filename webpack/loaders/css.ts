import { type WebpackModuleLoader } from '../types';

export function getCssLoader(isDevMode: boolean): WebpackModuleLoader {
    return {
        loader: 'css-loader',
        options: {
            importLoaders: 1,
            modules: {
                auto: (path: string) => !path.includes('node_modules') && !path.endsWith('/theme.pcss'),
                mode: 'local',
                localIdentName: isDevMode ? '[path][name]__[local]' : '[hash:base64]',
                namedExport: true,
            },
        },
    };
}
