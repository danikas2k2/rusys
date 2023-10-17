import { type RuleSetRule } from 'webpack';

export function getTsxRule(): RuleSetRule {
    return {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
            {
                loader: 'esbuild-loader',
                options: {
                    tsconfig: './tsconfig.json',
                },
            },
            'css-module-wrapper',
        ],
    };
}
