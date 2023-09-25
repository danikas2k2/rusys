/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import WebpackMomentLocales from 'moment-locales-webpack-plugin';
import { type WebpackPlugin } from '../types';

export default function getMomentLocalesPlugin(): WebpackPlugin {
    return new WebpackMomentLocales();
}
