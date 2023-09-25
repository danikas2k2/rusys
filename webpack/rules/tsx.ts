import { type RuleSetRule } from 'webpack';

export function getTsxRule(): RuleSetRule {
    return {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: ['ts-loader', 'css-module-wrapper'],
    };
}
