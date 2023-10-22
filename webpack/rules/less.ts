import path from 'path';
import { type RuleSetRule } from 'webpack';
import getCssLoaders from '../loaders/css-loaders';

export function getLessRule(isDevMode: boolean): RuleSetRule {
    return {
        test: /\.less$/,
        include: path.resolve(process.cwd(), 'src'),
        exclude: /node_modules/,
        use: [...getCssLoaders(isDevMode), 'less-loader', 'less-import-once'],
    };
}
