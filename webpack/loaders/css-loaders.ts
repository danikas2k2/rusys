import { type WebpackModuleLoader } from '../types';
import getCssLoader from './css';
import getPostcssLoader from './postcss';
import getStyleLoader from './style';

export default function getCssLoaders(isDevMode: boolean): WebpackModuleLoader[] {
    return [getStyleLoader(isDevMode), getCssLoader(isDevMode), getPostcssLoader()];
}
