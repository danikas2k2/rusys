import { type WebpackModuleLoader } from '../types';

export function getSvgLoader(): WebpackModuleLoader {
    return {
        loader: '@svgr/webpack',
        options: {},
    };
}
