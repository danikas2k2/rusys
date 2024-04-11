import { type WebpackModuleLoader } from '../types';

export function getClassNamesLoader(_isDevMode: boolean): WebpackModuleLoader {
    return { loader: '@ecomfe/class-names-loader', options: { namedImport: true } };
}
