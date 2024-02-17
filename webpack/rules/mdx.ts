import { type RuleSetRule } from 'webpack';
import { getMdxLoader } from '../loaders/mdx';

export async function getMdxRule(isDevMode = false): Promise<RuleSetRule> {
    return {
        test: /\.mdx?$/,
        exclude: /node_modules/,
        use: [
            await getMdxLoader(isDevMode),
            // {
            //     loader: 'css-module-wrapper',
            //     options: {
            //         classNames: false,
            //     },
            // },
        ],
    };
}
