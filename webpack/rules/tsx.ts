import path from 'path';
import { type RuleSetRule } from 'webpack';

export function getTsxRule(): RuleSetRule {
    return {
        test: /\.[jt]sx?$/,
        include: path.resolve(process.cwd(), 'src'),
        exclude: /node_modules/,
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
