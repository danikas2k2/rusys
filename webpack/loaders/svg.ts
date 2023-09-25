import { type WebpackModuleLoader } from '../types';

export default function getSvgLoader(): WebpackModuleLoader {
    return {
        loader: 'react-svg-loader',
        options: {
            svgo: {
                plugins: [{ removeViewBox: false }],
            },
        },
    };
}
