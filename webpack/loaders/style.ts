import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import type { WebpackModuleLoader } from '../types';

export function getStyleLoader(isDevMode: boolean): WebpackModuleLoader {
    return isDevMode ? 'style-loader' : MiniCssExtractPlugin.loader;
}
