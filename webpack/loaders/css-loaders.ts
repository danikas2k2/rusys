import { type WebpackModuleLoader } from '../types';
import { getClassNamesLoader } from './class-names';
import { getCssLoader } from './css';
import { getPostcssLoader } from './postcss';
import { getStyleLoader } from './style';

export function getCssLoaders(isDevMode: boolean): WebpackModuleLoader[] {
    return [getClassNamesLoader(isDevMode), getStyleLoader(isDevMode), getCssLoader(isDevMode), getPostcssLoader()];
}
