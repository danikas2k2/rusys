import path from 'path';
import { type RuleSetRule } from 'webpack';
import getCssLoaders from '../loaders/css-loaders';

export function getCssRule(isDevMode: boolean): RuleSetRule {
    return {
        test: /\.css$/,
        include: path.resolve(process.cwd(), 'src'),
        exclude: /node_modules/,
        use: [...getCssLoaders(isDevMode), 'less-import-once'],
    };
}
