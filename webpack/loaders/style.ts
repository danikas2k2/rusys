/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { type WebpackModuleLoader } from '../types';

export default function getStyleLoader(isDevMode: boolean): WebpackModuleLoader {
    return isDevMode ? 'style-loader' : MiniCssExtractPlugin.loader;
}
