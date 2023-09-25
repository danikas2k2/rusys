import path from 'path';
import { type WebpackAliasMap } from './types';

export default function getAlias(): WebpackAliasMap {
    const base = process.cwd();
    return {
        '@icons': path.resolve(base, 'src/icons'),
        '@ui': path.resolve(base, 'src/ui'),
        '~': path.resolve(base, 'src'),
    };
}
