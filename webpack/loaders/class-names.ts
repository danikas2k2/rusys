import { type WebpackModuleLoader } from '../types';

export function getClassNamesLoader(_isDevMode: boolean): WebpackModuleLoader {
    return '@ecomfe/class-names-loader';
}
