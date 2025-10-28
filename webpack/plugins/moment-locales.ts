import WebpackMomentLocales from 'moment-locales-webpack-plugin';

import type { WebpackPlugin } from '../types';

export function getMomentLocalesPlugin(): WebpackPlugin {
    return new WebpackMomentLocales();
}
