import path from 'path';
import { type RuleSetRule } from 'webpack';
import getSvgLoader from '../loaders/svg';

export function getSvgRule(): RuleSetRule {
    return {
        test: /\.svg$/,
        include: path.resolve(process.cwd(), 'src'),
        exclude: /node_modules/,
        use: [getSvgLoader()],
    };
}
