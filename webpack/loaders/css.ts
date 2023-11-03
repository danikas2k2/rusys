import { type WebpackModuleLoader } from '../types';

export function getCssLoader(isDevMode: boolean): WebpackModuleLoader {
    return {
        loader: 'css-loader',
        options: {
            modules: {
                auto: (path: string) => !path.includes('node_modules'),
                mode: 'local',
                localIdentName: isDevMode ? '[path][name]__[local]' : '[hash:base64]',
            },
        },
    };
}
