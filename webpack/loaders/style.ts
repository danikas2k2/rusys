import { type WebpackModuleLoader } from '../types';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

export function getStyleLoader(isDevMode: boolean): WebpackModuleLoader {
    return isDevMode ? 'style-loader' : MiniCssExtractPlugin.loader;
}
