import { type RuleSetRule } from 'webpack';
import { getExcludeList } from '../paths/exclude';
import { getIncludeList } from '../paths/include';

export function getTsxRule(): RuleSetRule {
    return {
        test: /\.[jt]sx?$/,
        include: getIncludeList(),
        exclude: getExcludeList(),
        use: [
            {
                loader: 'esbuild-loader',
                options: {
                    target: 'es2015',
                    // tsconfig: './tsconfig.json',
                },
            },
            'css-module-wrapper',
        ],
    };
}
