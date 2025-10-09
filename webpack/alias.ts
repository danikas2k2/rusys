import path from 'path';

import { type WebpackAliasMap } from './types';

export function getAlias(): WebpackAliasMap {
    const base = process.cwd();
    return {
        'package.json': path.resolve(base, 'package.json'),
        '@assets': path.resolve(base, 'src/client/assets'),
        '@tests': path.resolve(base, 'src/tests'),
        '@ui': path.resolve(base, 'src/ui'),
        '~': path.resolve(base, 'src'),
    };
}
