import path from 'path';

import { type WebpackAliasMap } from './types';

export function getAlias(): WebpackAliasMap {
    const base = process.cwd();
    return {
        '@assets': path.resolve(base, 'src/client/assets'),
        '@tests': path.resolve(base, 'src/tests'),
        '@ui': path.resolve(base, 'src/ui'),
        '~': path.resolve(base, 'src'),
    };
}
