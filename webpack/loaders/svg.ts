import { type WebpackModuleLoader } from '../types';

export function getSvgLoader(): WebpackModuleLoader {
    return {
        loader: 'react-svg-loader',
        options: {
            svgo: {
                plugins: [{ removeViewBox: false }],
            },
        },
    };
}
