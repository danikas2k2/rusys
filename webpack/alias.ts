import path from 'path';
import { type WebpackAliasMap } from './types';

export function getAlias(): WebpackAliasMap {
    const base = process.cwd();
    return {
        '@assets': path.resolve(base, 'src/assets'),
        '@ui': path.resolve(base, 'src/ui'),
        '~': path.resolve(base, 'src'),
    };
}
