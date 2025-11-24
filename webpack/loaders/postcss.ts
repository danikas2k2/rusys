import postcssDiscardComments from 'postcss-discard-comments';
import postcssImport from 'postcss-import';
import postcssSimpleVars from 'postcss-simple-vars';

import { getAlias } from '../alias';
import type { WebpackModuleLoader } from '../types';

export function getPostCssLoader(_isDevMode?: boolean): WebpackModuleLoader {
    const alias = getAlias() as Record<string, string>;
    const expr = `^(${Object.keys(alias).join('|')})/`;
    return {
        loader: 'postcss-loader',
        options: {
            postcssOptions: {
                syntax: 'postcss-less',
                plugins: [
                    'postcss-preset-mantine',
                    postcssSimpleVars({
                        variables: {
                            'mantine-breakpoint-xs': '36em',
                            'mantine-breakpoint-sm': '48em',
                            'mantine-breakpoint-md': '62em',
                            'mantine-breakpoint-lg': '75em',
                            'mantine-breakpoint-xl': '88em',
                        },
                    }),
                    postcssImport({
                        skipDuplicates: true,
                        resolve(id, basedir) {
                            if (id.startsWith('~') || id.startsWith('@')) {
                                const match = id.match(expr);
                                if (match) {
                                    return `${alias[match[1]]}/${id.slice(match[0].length)}`;
                                }
                                try {
                                    return require.resolve(id, { paths: [basedir] });
                                } catch (_e) {}
                            }
                            return id;
                        },
                    }),
                    'postcss-strip-inline-comments',
                    postcssDiscardComments({
                        removeAll: true,
                    }),
                    'postcss-nested',
                    'postcss-preset-env',
                    'postcss-logical-properties',
                    'autoprefixer',
                    // For old IE browsers
                    // 'postcss-opacity',
                    // 'postcss-disabled',
                    // 'postcss-filter-gradient',
                    // 'postcss-esplit',
                    // 'postcss-pie',
                    // 'fixie',
                ],
            },
        },
    };
}
